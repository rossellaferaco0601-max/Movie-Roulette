#!/usr/bin/env python3
"""Style-locked motion graphics: fal.ai makes the layered art, Remotion animates it in code.

  styles                              list saved styles
  learn <name> <image|video> ...      new style from reference images or a video (frames + palette)
  new <slug> --style <name>           scaffold <projects>/<slug>/04_data/style_motion.json
  assets <slug> [--scene N]           fal.ai: per scene one plate + isolated cut-outs, background removed
  render <slug> [--still] [--layout L] [--format F] [--out name]
                                      stage to remotion_studio/public, render MP4 (or entry/exit stills)
  cost <slug>                         fal.ai spend for the campaign at live unit prices
  install                             copy the Remotion templates into remotion_studio/src
  doctor                              check key, node, Remotion, templates and every style file
  pack [--out dir]                    zip the skill (scripts, styles, templates) to share or reuse elsewhere

Formats: 9x16 (1080x1920), 4x5 (1080x1350), 1x1 (1080x1080), 16x9 (1920x1080).
Layouts: orbit (centered collage), fullbleed (plate as the frame), stack (hero + props in a row), split (hero beside text).

Paths (environment overrides): STYLE_MOTION_ROOT (project root, default: current directory),
STYLE_MOTION_PROJECTS (campaign folders, default <root>/production_hub), STYLE_MOTION_REMOTION
(Remotion project, default <root>/remotion_studio). FAL_KEY comes from the environment or <root>/.env
and is never printed. Every fal request is cached in <projects>/assets/gen_cache/ (sha256 of model +
input), so re-runs only pay for changed prompts.
"""
import argparse
import base64
import hashlib
import json
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import os
ROOT = Path(os.environ.get("STYLE_MOTION_ROOT", Path.cwd())).resolve()
SKILL = Path(__file__).resolve().parents[1]
STYLES = SKILL / "styles"
CAMPAIGNS = (ROOT / os.environ.get("STYLE_MOTION_PROJECTS", "production_hub")).resolve()
CACHE = CAMPAIGNS / "assets/gen_cache"
REMOTION = (ROOT / os.environ.get("STYLE_MOTION_REMOTION", "remotion_studio")).resolve()
TEMPLATES = SKILL / "templates/remotion"
FORMATS = {"9x16": (1080, 1920), "4x5": (1080, 1350), "1x1": (1080, 1080), "16x9": (1920, 1080)}
ASPECT = {"9x16": "9:16", "4x5": "4:5", "1x1": "1:1", "16x9": "16:9"}
LAYOUTS = ("orbit", "fullbleed", "stack", "split")
EDIT_MODEL = "fal-ai/nano-banana/edit"
CUTOUT_MODEL = "fal-ai/birefnet"


def fal_key():
    if os.environ.get("FAL_KEY"):
        return os.environ["FAL_KEY"]
    env = ROOT / ".env"
    for line in (env.read_text().splitlines() if env.exists() else []):
        if line.startswith("FAL_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    sys.exit("FAL_KEY not set: export it or add FAL_KEY=... to .env in the project root")


def http(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None,
                                 method="POST" if body is not None else "GET",
                                 headers={"Authorization": f"Key {fal_key()}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


COST_LOG = None  # set per campaign; every paid call appends one row


def fal_run(model, payload):
    t0 = time.time()
    q = http(f"https://queue.fal.run/{model}", payload)
    while True:
        s = http(q["status_url"] + "?logs=0")
        if s["status"] == "COMPLETED":
            if COST_LOG:
                secs = (s.get("metrics") or {}).get("inference_time") or (time.time() - t0)
                with COST_LOG.open("a") as f:
                    f.write(json.dumps({"ts": time.strftime("%Y-%m-%dT%H:%M:%S"), "model": model,
                                        "images": 1, "seconds": round(secs, 2)}) + "\n")
            return http(q["response_url"])
        if s["status"] not in ("IN_QUEUE", "IN_PROGRESS"):
            raise RuntimeError(f"{model}: {s}")
        time.sleep(3)


def data_uri(path):
    mime = "image/png" if str(path).lower().endswith(".png") else "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(Path(path).read_bytes()).decode()


def cached(model, payload, out: Path):
    """Run once per (model, input); copy the cached file to out."""
    key = hashlib.sha256(json.dumps({"api": "fal", "model": model, "input": payload}, sort_keys=True).encode()).hexdigest()[:24]
    hit = CACHE / f"{key}.png"
    if not hit.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        data = fal_run(model, payload)
        url = (data.get("images") or [data.get("image")])[0]["url"]
        urllib.request.urlretrieve(url, hit)
        (CACHE / f"{key}.json").write_text(json.dumps({"model": model, "input": {
            k: ("<data uri>" if "data:" in json.dumps(v) else v) for k, v in payload.items()}}, indent=1))
        print(f"  fal {model} -> {out.name}")
    else:
        print(f"  cache {out.name}")
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(hit, out)
    return out


def load_style(name):
    p = STYLES / name / "style.json"
    if not p.exists():
        sys.exit(f"no style '{name}'; run: styles")
    return json.loads(p.read_text()), STYLES / name


def plan_path(slug):
    return CAMPAIGNS / slug / "04_data/style_motion.json"


# ---------- commands ----------

def cmd_styles(_):
    for d in sorted(STYLES.iterdir()):
        if (d / "style.json").exists():
            s = json.loads((d / "style.json").read_text())
            if d.name.startswith("_"):
                continue
            print(f"{d.name:28} layout={s.get('layout', 'orbit'):9} {s.get('label', '')}  ({len(list((d / 'refs').glob('*')))} refs)")


def cmd_learn(a):
    import cv2
    import numpy as np
    d = STYLES / a.name
    (d / "refs").mkdir(parents=True, exist_ok=True)
    frames = []
    for src in a.sources:
        src = Path(src)
        if src.suffix.lower() in (".mp4", ".mov", ".webm", ".m4v"):
            dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                                 "-of", "csv=p=0", str(src)]).decode())
            for i in range(a.frames):
                t = dur * (i + 0.5) / a.frames
                out = d / "refs" / f"{src.stem}_{int(t)}.jpg"
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(src), "-frames:v", "1",
                                "-q:v", "2", str(out)], check=True)
                frames.append(out)
        else:
            out = d / "refs" / src.name
            shutil.copy(src, out)
            frames.append(out)
    px = np.concatenate([cv2.resize(cv2.imread(str(f)), (96, 170)).reshape(-1, 3) for f in frames]).astype(np.float32)
    _, labels, centers = cv2.kmeans(px, 7, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1), 3,
                                    cv2.KMEANS_PP_CENTERS)
    order = np.argsort(-np.bincount(labels.ravel()))
    hexes = ["#%02X%02X%02X" % tuple(int(c) for c in centers[i][::-1]) for i in order]
    base = json.loads((STYLES / "_template/style.json").read_text())
    base.update({"name": a.name, "label": f"{a.name} (draft: rewrite prompts after viewing refs)",
                 "source": ", ".join(Path(s).name for s in a.sources),
                 "measuredPalette": hexes})
    if not (d / "style.json").exists() or a.force:
        (d / "style.json").write_text(json.dumps(base, indent=2))
    print(f"style draft: {d / 'style.json'}\nmeasured palette (by area): {' '.join(hexes)}")
    print("next: view refs/, then rewrite palette, imagePrompt, elementPrompt, type and motion.rules in style.json")


def cmd_new(a):
    style, _ = load_style(a.style)
    p = plan_path(a.slug)
    if p.exists() and not a.force:
        sys.exit(f"exists: {p} (use --force)")
    p.parent.mkdir(parents=True, exist_ok=True)
    plan = {
        "slug": a.slug, "style": a.style, "format": a.format,
        "vo": str(CAMPAIGNS / a.slug / "03_audio/master_vo.mp3"),
        "scenes": [{
            "id": i + 1, "seconds": 4.0, "layout": style.get("layout", "orbit"),
            "kicker": "", "headline": "TWO TO FOUR WORDS", "accent": ["WORDS"],
            "caption": "the spoken phrase for this beat",
            "scene": "one visual metaphor: what the full scene shows",
            "hero": "the main subject, specific and drawable",
            "props": ["supporting object one", "supporting object two"],
            "backdrop": "flat backing shape or texture fragment (or delete)",
            "circles": list(style.get("defaultCircles", ["accent", "accent2"]))
        } for i in range(a.scenes)]
    }
    p.write_text(json.dumps(plan, indent=2))
    print(f"plan: {p}\nfill one entry per VO beat; set seconds from the VO (or start/end in seconds).")


def cmd_assets(a):
    global COST_LOG
    COST_LOG = CAMPAIGNS / a.slug / "04_data/cost_log.jsonl"
    plan = json.loads(plan_path(a.slug).read_text())
    style, sdir = load_style(plan["style"])
    fmt = plan.get("format", "9x16")
    refs = [data_uri(f) for f in sorted((sdir / "refs").glob("*"))[:4]]
    out = CAMPAIGNS / a.slug / "02_assets/style_motion"
    for sc in plan["scenes"]:
        if a.scene and sc["id"] != a.scene:
            continue
        n = sc["id"]
        print(f"scene {n}")
        # 1. full plate: the finished collage, used as layout reference + fallback background
        cached(EDIT_MODEL, {"prompt": f"{style['imagePrompt']}. Scene: {sc['scene']}. Hero: {sc['hero']}. "
                                      f"Avoid: {style['negative']}. Match the style of the reference images exactly, "
                                      f"new content only.",
                            "image_urls": refs, "num_images": 1, "output_format": "png", "aspect_ratio": ASPECT[fmt]},
               out / f"s{n:02d}_plate.png")
        # 2. cut-outs: hero, props, backdrop, each isolated then background-removed
        parts = [("hero", sc["hero"])] + [(f"prop{i + 1}", p) for i, p in enumerate(sc.get("props", []))]
        if sc.get("backdrop"):
            parts.append(("backdrop", sc["backdrop"]))
        for tag, subject in parts:
            raw = cached(EDIT_MODEL, {"prompt": style["elementPrompt"].format(subject=subject)
                                      + ". Same medium, line work and palette as the reference images.",
                                      "image_urls": refs[:2], "num_images": 1, "output_format": "png",
                                      "aspect_ratio": "1:1"},
                         out / "raw" / f"s{n:02d}_{tag}.png")
            cached(CUTOUT_MODEL, {"image_url": data_uri(raw), "model": "General Use (Heavy)",
                                  "output_format": "png"}, out / f"s{n:02d}_{tag}.png")
    print(f"assets: {out}")


def cmd_render(a):
    plan = json.loads(plan_path(a.slug).read_text())
    style, _ = load_style(plan["style"])
    src = CAMPAIGNS / a.slug / "02_assets/style_motion"
    stage = REMOTION / "public/style-motion" / a.slug
    shutil.rmtree(stage, ignore_errors=True)
    stage.mkdir(parents=True)
    fmt = a.format or plan.get("format", "9x16")
    style = {**style, "canvas": {**style.get("canvas", {}), "width": FORMATS[fmt][0], "height": FORMATS[fmt][1],
                                 "fps": style.get("canvas", {}).get("fps", 30)}}
    if a.layout:
        style["layout"] = a.layout
    fps = style["canvas"]["fps"]
    ensure_installed()
    scenes, t = [], 0.0
    for sc in plan["scenes"]:
        n = sc["id"]
        start = sc.get("start", t)
        end = sc.get("end", start + sc["seconds"])
        t = end
        layers = {}
        for f in sorted(src.glob(f"s{n:02d}_*.png")):
            shutil.copy(f, stage / f.name)
            layers[f.stem.split("_", 1)[1]] = f"style-motion/{a.slug}/{f.name}"
        if "hero" not in layers:
            sys.exit(f"scene {n}: no assets; run assets {a.slug}")
        if a.layout:
            sc = {**sc, "layout": a.layout}
        scenes.append({**sc, "from": round(start * fps), "frames": round((end - start) * fps), "layers": layers})
    audio = None
    if plan.get("vo") and (ROOT / plan["vo"]).exists():
        shutil.copy(ROOT / plan["vo"], stage / "vo.mp3")
        audio = f"style-motion/{a.slug}/vo.mp3"
    props = {"style": style, "scenes": scenes, "audio": audio}
    pf = stage / "props.json"
    pf.write_text(json.dumps(props))
    vid = CAMPAIGNS / a.slug / "04_video"
    vid.mkdir(parents=True, exist_ok=True)
    entry, comp = "src/StyleMotionEntry.ts", "StyleMotion"
    if a.still:
        for sc in scenes:
            for k, f in (("in", sc["from"] + 20), ("out", sc["from"] + sc["frames"] - 2)):
                o = vid / "qa" / f"s{sc['id']:02d}_{k}.png"
                subprocess.run(["npx", "remotion", "still", entry, comp, str(o), f"--props={pf}",
                                f"--frame={f}"], cwd=REMOTION, check=True)
        print(f"stills: {vid / 'qa'}")
        return
    o = vid / (a.out or "style_motion.mp4")
    subprocess.run(["npx", "remotion", "render", entry, comp, str(o), f"--props={pf}",
                    "--concurrency=1"], cwd=REMOTION, check=True)
    print(f"video: {o}")


def cmd_cost(a):
    """Sum fal spend from the campaign cost log at live unit prices."""
    rows = [json.loads(l) for l in (CAMPAIGNS / a.slug / "04_data/cost_log.jsonl").read_text().splitlines() if l.strip()]
    total, by = 0.0, {}
    for m in sorted({r["model"] for r in rows}):
        pr = http(f"https://api.fal.ai/v1/models/pricing?endpoint_id={m}")["prices"][0]
        mine = [r for r in rows if r["model"] == m]
        qty = sum(r["seconds"] for r in mine) if "second" in pr["unit"] else len(mine)
        usd = qty * pr["unit_price"]
        total += usd
        print(f"{m:28} {len(mine):3} calls  {qty:8.2f} {pr['unit']:16} x ${pr['unit_price']}  = ${usd:.4f}")
    print(f"{'TOTAL fal.ai':28} {len(rows):3} calls{'':38}= ${total:.4f}")


def ensure_installed(force=False):
    """Keep remotion_studio/src in sync with the skill's templates (the skill is the source of truth)."""
    for f in TEMPLATES.glob("*.ts*"):
        dst = REMOTION / "src" / f.name
        if force or not dst.exists() or dst.read_bytes() != f.read_bytes():
            shutil.copy(f, dst)
            print(f"  installed {dst.relative_to(ROOT)}")


def cmd_install(_):
    if not (REMOTION / "package.json").exists():
        sys.exit(f"no Remotion project at {REMOTION}")
    ensure_installed(force=True)


REQUIRED = ["palette", "imagePrompt", "elementPrompt", "negative", "type"]


def cmd_doctor(_):
    ok = True
    def check(cond, msg):
        nonlocal ok
        print(("ok   " if cond else "FAIL ") + msg)
        ok = ok and cond
    env = (ROOT / ".env").read_text() if (ROOT / ".env").exists() else ""
    check(bool(os.environ.get("FAL_KEY")) or "FAL_KEY=" in env, "FAL_KEY in environment or .env (value not shown)")
    check(shutil.which("npx") is not None, "npx on PATH")
    check(shutil.which("ffmpeg") is not None, "ffmpeg on PATH")
    check((REMOTION / "node_modules/remotion").exists(), f"Remotion installed at {REMOTION}")
    for f in TEMPLATES.glob("*.ts*"):
        dst = REMOTION / "src" / f.name
        check(dst.exists() and dst.read_bytes() == f.read_bytes(), f"template in sync: {f.name}")
    for d in sorted(STYLES.iterdir()):
        if not (d / "style.json").exists() or d.name.startswith("_"):
            continue
        st = json.loads((d / "style.json").read_text())
        miss = [k for k in REQUIRED if k not in st]
        refs = list((d / "refs").glob("*")) if (d / "refs").exists() else []
        check(not miss and "{subject}" in st.get("elementPrompt", "") and refs and st.get("layout", "orbit") in LAYOUTS,
              f"style {d.name}: fields {'ok' if not miss else miss}, {len(refs)} refs, layout {st.get('layout', 'orbit')}")
    sys.exit(0 if ok else 1)


def cmd_pack(a):
    out = Path(a.out or CAMPAIGNS / "assets/skill_packs")
    out.mkdir(parents=True, exist_ok=True)
    ensure_installed()
    z = shutil.make_archive(str(out / f"style-motion-{time.strftime('%Y%m%d')}"), "zip", SKILL.parent, SKILL.name)
    print(f"pack: {z}\nunzip into <project>/.claude/skills/, then run: style_motion.py install && style_motion.py doctor")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("styles").set_defaults(fn=cmd_styles)
    p = sub.add_parser("learn"); p.add_argument("name"); p.add_argument("sources", nargs="+")
    p.add_argument("--frames", type=int, default=6); p.add_argument("--force", action="store_true")
    p.set_defaults(fn=cmd_learn)
    p = sub.add_parser("new"); p.add_argument("slug"); p.add_argument("--style", required=True)
    p.add_argument("--scenes", type=int, default=8); p.add_argument("--force", action="store_true")
    p.add_argument("--format", choices=FORMATS, default="9x16")
    p.set_defaults(fn=cmd_new)
    p = sub.add_parser("assets"); p.add_argument("slug"); p.add_argument("--scene", type=int)
    p.set_defaults(fn=cmd_assets)
    p = sub.add_parser("render"); p.add_argument("slug"); p.add_argument("--still", action="store_true")
    p.add_argument("--layout", choices=LAYOUTS); p.add_argument("--format", choices=FORMATS); p.add_argument("--out")
    p.set_defaults(fn=cmd_render)
    p = sub.add_parser("cost"); p.add_argument("slug"); p.set_defaults(fn=cmd_cost)
    sub.add_parser("install").set_defaults(fn=cmd_install)
    sub.add_parser("doctor").set_defaults(fn=cmd_doctor)
    p = sub.add_parser("pack"); p.add_argument("--out"); p.set_defaults(fn=cmd_pack)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
