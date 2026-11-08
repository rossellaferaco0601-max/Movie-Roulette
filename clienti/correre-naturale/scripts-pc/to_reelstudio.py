"""Crea i progetti ReelStudio dei 6 reel (tagli verificati + montaggio animato).

Uso: python scripts/to_reelstudio.py R1 [R2 ...]  → ReelStudio/progetti/cn-<id>/project.json
"""
import json, os, sys

import numpy as np
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import reel_engine as E  # noqa: E402
from reels_longevita import REELS  # noqa: E402
from reels_rs import POOL, RS, STYLE, AUDIO  # noqa: E402

RSDIR = "C:/Users/roxfe/Documents/ReelStudio"
ROOTP = "20261102-105705-ho-letto-5-studi-sulla-longevita-la-cors"
TPL = json.load(open(os.path.join(E.ROOT, "work", "rs_template.json"), encoding="utf-8"))
FPS = 30
LOWER = {"bento", "checklist", "mythTruth", "counter", "tipCard", "rightWrong", "progress", "chart", "pills", "badge",
         "strike", "typing", "question", "unlock", "bigNumber", "stopwatch", "chapter", "script", "dataCard"}
SRCW = 1920 * 1920 / 1080   # larghezza del sorgente scalato all'altezza del reel (cover)


def obj_x(cx):
    """object-position orizzontale (0-1) che mette il volto al centro del 9:16."""
    return min(1.0, max(0.0, (cx * SRCW - 540) / (SRCW - 1080)))


# stacchi reali (work/framediff_*.npy, da scripts/framediff.py): la tabella scene può sbagliare di qualche fotogramma
_fd = {}
def real_cuts(name):
    if name not in _fd:
        d = np.load(os.path.join(E.ROOT, "work", f"framediff_{name}.npy"))
        _fd[name] = d
    return _fd[name]


def snap_cut(t):
    """Il taglio scena subito PRIMA dello stacco vero: così la dissolvenza non ripesca l'inquadratura precedente."""
    d = real_cuts("src")
    a, b = max(1, int((t - 0.3) * FPS)), int((t + 0.3) * FPS)
    i = a + int(np.argmax(d[a:b]))
    return (i - 1.5) / FPS if d[i] > 15 else t


def check_clip(key, e):
    """Avvisa se una clip attraversa uno stacco della sua sorgente."""
    p = e["props"]
    if "src" in p:
        name, t0 = ("meadow" if "esseri" in p["src"] else "cerotti"), p.get("from", 0)
    else:
        name, t0 = "src", p.get("t", 0)
    d = real_cuts(name)
    i0, i1 = int((t0 + 0.05) * FPS), int((t0 + e["duration"]) * FPS)
    hit = [round(i / FPS, 2) for i in range(i0, min(i1, len(d))) if d[i] > 18]
    if hit:
        print(f"  ! {key} clip {name} {t0}+{e['duration']} (uscita {e['start']}) attraversa {hit[:4]}")


def anchor(ivs, a):
    word, t = a
    best, bd = None, 9e9
    for iv in ivs:
        for w in iv["words"]:
            if E._match(w["w"], word) and abs(w["s"] - t) < bd:
                best, bd = w, abs(w["s"] - t)
    if best is None or bd > 2.5:
        raise ValueError(f"ancora non trovata {a}")
    return best


def smooth_brolls(effects, nones, total):
    """Ross 3/11: niente flash. Le dissolvenze avvengono sempre sopra immagini vere, mai sopra le schede del sorgente."""
    BL = 5 / FPS
    FULL = {"stage", "orbit", "bentoVideo", "notesTodo", "rewind"}
    offs = lambda e: "from" if "src" in e["props"] else "t"
    # 1) pezzi contigui della stessa ripresa = un solo B-roll
    bl = []
    for e in sorted((x for x in effects if x["type"] == "broll"), key=lambda x: x["start"]):
        p = bl[-1] if bl else None
        if p and p["props"].get("src") == e["props"].get("src") and abs(p["start"] + p["duration"] - e["start"]) < 0.05 \
                and abs(p["props"][offs(p)] + p["duration"] - e["props"][offs(e)]) < 0.06:
            p["duration"] = round(p["duration"] + e["duration"], 3)
        else:
            bl.append(e)
    others = [x for x in effects if x["type"] != "broll"]
    # 2) scene a tutto schermo raggruppate: [a, b] = intervallo coperto da scene contigue
    merged = []
    for a, b in sorted(nones):
        if merged and a - merged[-1][1] < 0.05:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    spans = []
    for a, b in merged:
        sc = [x for x in others if x["type"] in FULL and x["start"] < b and x["start"] + x["duration"] > a]
        spans.append((a, b, min([x["start"] for x in sc] or [a]), max([x["start"] + x["duration"] for x in sc] or [b])))
    near = lambda x, y: abs(x - y) < 0.05
    orig = [(e["start"], e["start"] + e["duration"]) for e in bl]
    for i, e in enumerate(bl):
        s0, e0 = orig[i]
        prev_adj = i > 0 and near(orig[i - 1][1], s0)
        next_adj = i + 1 < len(bl) and near(e0, orig[i + 1][0])
        sc_l = next((sp for sp in spans if near(sp[1], s0)), None)
        sc_r = next((sp for sp in spans if near(sp[0], e0)), None)
        p = e["props"]
        # entrata
        if s0 <= 0.02:
            p["fin"] = 0
        elif sc_l:   # esce da sotto una scena grafica: la ripresa è già lì, la scena sfuma sopra
            ns = max(sc_l[0], min(s0, sc_l[3] - 0.3))
            e["start"], e["duration"] = round(ns, 3), round(e["duration"] + (s0 - ns), 3)
            p["fin"] = 0
        elif prev_adj:
            p["fin"] = 5   # sfuma sopra il B-roll precedente, che resta pieno
        else:
            e["start"], e["duration"] = round(e["start"] - BL, 3), round(e["duration"] + BL, 3)
            p["fin"] = 5
        # uscita
        if e0 >= total - 0.02:
            p["fout"] = 0
        elif sc_r:
            e["duration"] = round(e["duration"] + max(0, min(sc_r[2] + 0.3, sc_r[1]) - e0), 3)
            p["fout"] = 0
        elif next_adj:
            e["duration"] = round(e["duration"] + BL, 3)
            p["fout"] = 0
        else:
            e["duration"] = round(e["duration"] + BL, 3)
            p["fout"] = 5
    # 3) fondo fisso sotto le scene grafiche: le schede del sorgente non si vedono mai
    plates = [dict(id=f"p{i}", type="stage", start=round(a - 0.02, 3), duration=round(b - a + 0.04, 3),
                   props={"tone": "dark", "plate": True}, sfx=None) for i, (a, b) in enumerate(merged)]
    return plates + bl + others


def build(key):
    reel, rs = REELS[key], RS[key]
    toks = E.load_words()
    ivs = E.build_intervals(reel, toks)
    out = lambda t: E.src_to_out(ivs, t)
    overrides = reel.get("overrides", [])
    used = [(iv["s"], iv["e"]) for iv in ivs] + [(v, v + (b - a)) for a, b, v in overrides]
    pool = [c for c in POOL if not any(c[0] < e and s < c[0] + c[1] for s, e in used)]
    cuts, brolls, nones = [], [], []
    for iv in ivs:
        scene = {snap_cut(c) for c in E.SCENE_CUTS if iv["s"] < c < iv["e"]}
        pts = sorted({iv["s"], iv["e"]} | {c for c in scene if iv["s"] < c < iv["e"]}
                     | {c for a, b, _ in overrides for c in (a, b) if iv["s"] < c < iv["e"]}
                     | {c for a, b, _ in rs.get("cover", []) for c in (a, b) if iv["s"] < c < iv["e"]})
        fr = sorted({round((p - iv["s"]) * FPS) for p in pts} | {0, iv["n"]})
        for f0, f1 in zip(fr, fr[1:]):
            if f1 - f0 <= 0:
                continue
            s, e = iv["s"] + f0 / FPS, iv["s"] + f1 / FPS
            mid = (s + e) / 2
            ov = next(((a, b, v) for a, b, v in overrides if a <= mid < b), None)
            cv = next(((a, b, k) for a, b, k in rs.get("cover", []) if a <= mid < b), None)
            kind = E.scene_type(mid)
            c = {"s": round(s, 4), "e": round(e, 4)}
            if any(abs(s - sc) < 0.04 for sc in scene):   # stacco del sorgente: anche lui in dissolvenza
                c["blend"] = True
            if kind == "face":
                c.update(frame="volto", fx=round(obj_x(E.face_cx(s)), 3), fy=0.3)
            elif kind == "card":
                c.update(frame="intero")
            else:
                c.update(frame="volto", fx=0.5, fy=0.3)
            # pezzetti < 4 fotogrammi: stessa inquadratura del pezzo precedente
            if cuts and f1 - f0 < 4 and not ov:
                c.update({k: cuts[-1][k] for k in ("frame", "fx", "fy") if k in cuts[-1]})
            cuts.append(c)
            # immagine sostitutiva: override esplicito oppure scheda 16:9 → clip di corsa dal pool
            o0, dur = out(s), (e - s)
            if cv and cv[2].get("face"):   # volto vero di Daniele (la tabella scene lo segna come scheda)
                c.update(frame="volto", fx=round(obj_x(E.face_cx(s)), 3), fy=0.3)
            elif cv and cv[2].get("none"):   # coperto da una scena grafica a tutto schermo (stage, orbit, note…)
                c.update(frame="volto", fx=0.5, fy=0.3)
                nones.append((out(s), out(s) + (e - s)))
            elif cv:   # ripresa scelta a mano (es. Daniele che corre, anche da un altro video)
                k = dict(cv[2])
                k["from" if "src" in k else "t"] = round(k.pop("at") + (s - cv[0]), 3)
                brolls.append((o0, dur, k))
                c["frame"] = "volto"; c["fx"] = 0.5; c["fy"] = 0.3
            elif ov:
                brolls.append((o0, dur, ov[2] + (s - ov[0])))
                c["frame"] = "volto"; c["fx"] = 0.5; c["fy"] = 0.3
            elif kind == "card" and f1 - f0 >= 4 and rs.get("pool", True):
                left, t0 = dur, o0
                while left > 0.05:
                    if not pool:
                        raise RuntimeError(f"{key}: clip B-roll finite")
                    cs, cl = pool.pop(0)
                    d = min(left, cl, 3.6)
                    brolls.append((t0, d, cs))
                    t0 += d
                    left -= d
                c["frame"] = "volto"; c["fx"] = 0.5; c["fy"] = 0.3
    total = sum(round((c["e"] - c["s"]) * FPS) for c in cuts) / FPS

    effects = []
    for i, (t0, d, vs) in enumerate(brolls):
        pr = {"zoom": 0.05, "label": ""}
        pr.update(vs if isinstance(vs, dict) else {"t": round(vs, 3)})
        effects.append(dict(id=f"b{i}", type="broll", start=round(t0, 3), duration=round(d, 3), props=pr, sfx=None, anim="cut"))
    for i, fx in enumerate(rs["fx"]):
        w = anchor(ivs, fx["at"])
        st = out(w["s"]) - 0.05
        if fx["until"]:
            we = anchor(ivs, fx["until"])
            dur = out(we["e"]) - st + fx["pad"]
        else:
            dur = fx["dur"]
        # {"@": (parola, sec)} dentro props = secondi dall'inizio dell'effetto (es. quando un box si illumina)
        def rel(v):
            if isinstance(v, dict) and "@" in v:
                return round(out(anchor(ivs, v["@"])["s"]) - st, 2)
            if isinstance(v, dict):
                return {k: rel(x) for k, x in v.items()}
            if isinstance(v, list):
                return [rel(x) for x in v]
            return v
        props = rel(fx["props"])
        if fx["type"] == "keyword":
            props = {"color": rs.get("kw_color", "#49762E"), "stroke": 10, **props}
        e = dict(id=f"e{i}", type=fx["type"], start=round(max(0, st), 3), duration=round(min(dur, total - st), 3),
                 props=props, sfx=fx["sfx"])
        if fx["type"] == "keyword":
            e["duration"] = min(e["duration"], 1.5)
        # schede e numeri sotto il volto (y≈1040), mai sopra la faccia; le parole a comparsa restano in alto (≤1,5 s)
        if fx["pos"] is None and fx["type"] in LOWER:
            e["position"] = "center"   # placeTop la sposta subito sotto la zona del volto
        for k in ("pos", "tf", "anim"):
            if fx[k] is not None:
                e["position" if k == "pos" else k] = fx[k]
        effects.append(e)
    effects = smooth_brolls(effects, nones, total)
    # B-roll sotto un effetto bianco e nero: anche lui in bianco e nero
    for b in effects:
        if b["type"] == "broll" and any(x["type"] == "bw" and x["start"] - 0.6 <= b["start"] < x["start"] + x["duration"] for x in effects):
            b["props"]["gray"] = True
    for b in effects:
        if b["type"] == "broll":
            check_clip(key, b)
    sfx_t = sorted(e["start"] for e in effects if e.get("sfx"))
    assert all(b - a >= 7 for a, b in zip(sfx_t, sfx_t[1:])) and all(t > 3 for t in sfx_t), (key, sfx_t)

    words = [{"text": t["w"], "start": round(t["s"], 3), "end": round(t["e"], 3)} for t in toks]
    keep = {(round(w["s"], 3)) for iv in ivs for w in iv["words"]}
    removed = [i for i, w in enumerate(words) if w["start"] not in keep]
    hl = [w.strip(".,").lower() for w, _ in reel.get("highlights", [])]
    pid = f"cn-{reel['id'].lower()}"
    proj = {
        "id": pid, "title": f"{key} · " + reel["id"].split("_", 1)[1].replace("-", " "), "client": "correre-naturale",
        "origin": "youtube", "created": datetime.now().isoformat(timespec="seconds"), "parent": ROOTP,
        "source": {"file": f"../{ROOTP}/video4k.mp4", "original": "originale.webm", "duration": 720.37, "width": 3840, "height": 2160},
        "words": words, "removed": removed, "cuts": cuts, "brand": TPL["brand"], "settings": TPL["settings"],
        "hook": {"style": "talk", "duration": 2.8, "sfx": None, **rs["hook"]},
        "cta": {"keyword": reel["keyword"], "style": "endcard", "after": True, "duration": 4, "sfx": None, **rs["cta"]},
        "style": {"palette": "brand", "titleFont": "brand", "videoStyle": "talking", "layout": "full", "filter": "none",
                  "captions": {"style": "stack", "position": "bottom", "size": 1.1, "wordsPerLine": 3, "highlight": "#B8D7EA", "anim": "pop"},
                  "emphWords": hl, "breathing": True, "cutZoom": True, "pushIn": False, "logo": True, "logoKind": "pictogramOnDark",
                  "progressBar": True, "gradient": True, "vignette": False, "focusX": 0.5, "focusY": 0.3,
                  "faceZone": {"on": True, "y0": 0.14, "y1": 0.47}},
        "effects": effects,
        "audio": {"music": "", "musicVolume": 0, "sfxVolume": 0.55, "voiceVolume": 1, "ducking": True, "sfxOn": True, "sfxOnCuts": False},
        "caption": open(os.path.join(E.ROOT, "output", f"{reel['id']}_didascalia.txt"), encoding="utf-8").read(),
        "exports": [],
    }
    for k, v in {**STYLE, **rs.get("style", {})}.items():
        proj["style"][k] = {**proj["style"][k], **v} if isinstance(v, dict) and isinstance(proj["style"].get(k), dict) else v
    proj["audio"].update({**AUDIO, **rs.get("audio", {})})
    d = os.path.join(RSDIR, "progetti", pid)
    os.makedirs(os.path.join(d, "versioni"), exist_ok=True)
    f = os.path.join(d, "project.json")
    if os.path.exists(f):
        os.replace(f, os.path.join(d, "versioni", datetime.now().strftime("%Y%m%d-%H%M%S") + "-prima-di-claude.json"))
    json.dump(proj, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{key}: {pid}  {total:.1f}s  cuts={len(cuts)} broll={len(brolls)} effetti={len(rs['fx'])} sfx@{sfx_t}")
    return pid, total


if __name__ == "__main__":
    for k in sys.argv[1:] or list(REELS):
        build(k)
