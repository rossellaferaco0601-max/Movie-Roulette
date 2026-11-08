"""Crea i progetti ReelStudio dei reel ricavati da «YTCN 38» (talking head in esterna, 4K).

Uso: python scripts/ytcn38_build.py Y1 [Y2 ...]  → ReelStudio/progetti/cn-y<id>/project.json

Pipeline: parole Whisper (work/ytcn38/words.json) → intervalli agganciati ai silenzi (RMS su src48.raw)
→ cuts «volto» centrati sul viso (haar su proxy_360.mp4) → effetti ancorati alle parole → project.json.
"""
import json, os, re, sys

import numpy as np
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import reel_engine as E  # noqa: E402

ROOT = E.ROOT
WDIR = os.path.join(ROOT, "work", "ytcn38")
RSDIR = "C:/Users/roxfe/Documents/ReelStudio"
SRCID = "cn-ytcn38-src"
FPS = 30
SW, SH, DUR = 3840, 2160, 465.732
SRCW = 1920 * 1920 / 1080   # larghezza del sorgente scalato all'altezza del reel

# il motore legge audio e proxy dai percorsi del modulo: li puntiamo al nuovo video
E.RAW48 = os.path.join(WDIR, "src48.raw")
E.PROXY = os.path.join(WDIR, "proxy_360.mp4")

LIME = "#95FF00"       # verde lime dei sottotitoli dei reel già pubblicati su @correrenaturale
IG_ICON = f"/progetti/{SRCID}/elementi/20261104-195147-instagram.svg"   # non più usata (6/11, marketing: via il logo Instagram)
LOGO_CIRC = "/clients/correre-naturale/logo-circolare-bianco.png"      # logo circolare del brand in bianco, in alto a destra
MEADOW = "/progetti/20261101-161323-reel-gli-esseri-umani/originale.mp4"   # Daniele che corre (1080×1920)
CAP_HIDE = {"keyword", "mixTitle", "question", "typing", "duoGlow", "docTitle", "postit", "promptBar", "notif", "stamp", "swipe"}
LOWER = {"bento", "checklist", "mythTruth", "counter", "tipCard", "rightWrong", "progress", "chart", "pills", "badge",
         "strike", "typing", "question", "unlock", "bigNumber", "stopwatch", "chapter", "script", "dataCard"}


# ---------------------------------------------------------------- parole
def load_words(corrections):
    data = json.load(open(os.path.join(WDIR, "words.json"), encoding="utf-8"))
    toks = []
    for seg in data:
        for w in seg["words"]:
            txt = w["w"].strip()
            if not txt:
                continue
            if toks and (txt[0] in "'%-" or re.match(r"^\.\d", txt) or txt in ("%", "%.", "%,")):
                toks[-1]["w"] += txt
                toks[-1]["e"] = w["e"]
                continue
            toks.append({"w": txt, "s": w["s"], "e": w["e"]})
    for t0, t1, new in corrections.get("replace", []):
        toks = [t for t in toks if not (t0 <= t["s"] < t1)] + [{"w": a, "s": s, "e": e} for a, s, e in new]
        toks.sort(key=lambda t: t["s"])
    for old, new in corrections.get("words", []):
        for t in toks:
            if t["w"] == old or t["w"].rstrip(".,;:!?") == old:
                t["w"] = t["w"].replace(old, new)
    return toks


def pad_tails(ivs, toks, pad=0.16, tail_end=None):
    """Aria dopo l'ultima parola di ogni pezzo (5/11, Ross: parole troncate ai tagli), senza entrare nella parola dopo."""
    o = 0
    for iv in ivs:
        last = iv["words"][-1]["e"] if iv.get("words") else iv["e"]
        nxt = min([t["s"] for t in toks if t["s"] > last + 0.02] or [last + 9])
        e = min(max(iv["e"], last + pad), nxt - 0.06)
        if tail_end and iv is ivs[-1]:
            e = tail_end   # fine dell'ultimo pezzo misurata sull'inviluppo audio (5/11: Whisper chiude le parole troppo presto)
        iv["n"] = max(1, round((e - iv["s"]) * FPS))
        iv["e"] = iv["s"] + iv["n"] / FPS
        iv["o"] = o
        o += iv["n"]
    return ivs


def obj_x(cx):
    """object-position orizzontale (0-1) che mette il volto al centro del 9:16."""
    return min(1.0, max(0.0, (cx * SRCW - 540) / (SRCW - 1080)))


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


def FX(type, at, dur=None, until=None, pad=0.3, sfx=None, pos=None, tf=None, anim=None, delay=0.0, **props):
    return dict(type=type, at=at, dur=dur, until=until, pad=pad, sfx=sfx, pos=pos, tf=tf, anim=anim, delay=delay, props=props)


def build(key, reels, corrections, style, music):
    reel = reels[key]
    toks = load_words(corrections)
    ivs = pad_tails(E.build_intervals(reel, toks), toks, tail_end=reel.get("tail_end"))
    # 6/11: reel["cut_trim"] = {indice_pezzo: fotogrammi} toglie fotogrammi in coda a un pezzo (Y8: l'ultimo fotogramma del
    # pezzo 2 usciva nero nel render video, non nel fermo immagine)
    for k, nf in (reel.get("cut_trim") or {}).items():
        ivs[k]["n"] = max(1, ivs[k]["n"] - nf)
        ivs[k]["e"] = ivs[k]["s"] + ivs[k]["n"] / FPS
    o = 0
    for iv in ivs:
        iv["o"] = o
        o += iv["n"]
    out = lambda t: E.src_to_out(ivs, t)
    total = sum(iv["n"] for iv in ivs) / FPS

    # ---- pezzi video: crop sul volto, dissolvenza di 5 fotogrammi ai tagli e agli stacchi (jump cut) del video originale
    fd = np.load(os.path.join(WDIR, "framediff_src.npy"))
    cuts = []
    for i, iv in enumerate(ivs):
        pts = [iv["s"]]
        for j in np.where(fd > 18)[0]:
            t = (j - 1.5) / FPS   # subito prima dello stacco vero: la dissolvenza non ripesca l'inquadratura precedente
            if iv["s"] + 0.15 < t < iv["e"] - 0.15:
                pts.append(t)
        pts.append(iv["e"])
        for k, (a, b) in enumerate(zip(pts, pts[1:])):
            cx = E.face_cx(a + min(0.4, (b - a) / 2))
            c = {"s": round(a, 4), "e": round(b, 4), "frame": "volto", "fx": round(obj_x(cx), 3), "fy": 0.3}
            if i or k:
                c["blend"] = True
            if k == 0 and i in (reel.get("hard_cuts") or ()):
                c["hard"] = True   # 6/11, Ross: taglio netto (Y1 0:15, Y2 0:07: la dissolvenza tra due inquadrature sembrava un errore)
            cuts.append(c)

    # ---- effetti ancorati alle parole
    effects = []
    for i, fx in enumerate(reel["fx"]):
        w = anchor(ivs, fx["at"])
        st = out(w["s"]) - 0.05 + (fx.get("delay") or 0)   # delay: parte dopo la parola (6/11, Y6: dopo l'hook)
        if fx["until"]:
            we = anchor(ivs, fx["until"])
            dur = out(we["e"]) - st + fx["pad"]
        else:
            dur = fx["dur"]

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
            props = {"color": reel.get("kw_color", LIME), "stroke": 10, **props}
        e = dict(id=f"e{i}", type=fx["type"], start=round(max(0, st), 3), duration=round(min(dur, total - st), 3),
                 props=props, sfx=fx["sfx"])
        if fx["type"] == "keyword":
            e["duration"] = min(e["duration"], 1.5)
            e["tf"] = {"y": 0.40}   # dalla zona alta (capelli) al petto: mai sul volto
        if fx["pos"] is None and fx["type"] in LOWER:
            e["position"] = "center"
        for k in ("pos", "tf", "anim"):
            if fx[k] is not None:
                e["position" if k == "pos" else k] = fx[k]
        effects.append(e)

    # ---- hook visivi dei primi secondi (6/11, idee di Ross): effetti hkBack/hkFront con start assoluto 0
    for k, h in enumerate(reel.get("hooks", [])):
        effects.append(dict(id=f"hook{k}", type=h["type"], start=h.get("start", 0.0), duration=h.get("dur", 2.8), sfx=None, anim="cut",
                            position="top", props=h["props"]))

    # ---- 6/11 pomeriggio, Ross: niente logo in alto a destra (video più pulito). Prima: handle, poi logo circolare (LOGO_CIRC).
    sfx_t = sorted(e["start"] for e in effects if e.get("sfx"))
    assert all(b - a >= 7 for a, b in zip(sfx_t, sfx_t[1:])) and all(t > 3 for t in sfx_t), (key, sfx_t)

    words = [{"text": t["w"], "start": round(t["s"], 3), "end": round(t["e"], 3)} for t in toks]
    keep = {round(w["s"], 3) for iv in ivs for w in iv["words"]}
    removed = [i for i, w in enumerate(words) if w["start"] not in keep]
    hl = [w.strip(".,").lower() for w, _ in reel.get("highlights", [])]
    pid = f"cn-{reel['id'].lower()}"
    cap_path = os.path.join(ROOT, "output", "ytcn38", f"{reel['id']}_didascalia.txt")
    proj = {
        "id": pid, "title": f"{key} · " + reel["id"].split("_", 1)[1].replace("-", " "), "client": "correre-naturale",
        "origin": "youtube", "created": datetime.now().isoformat(timespec="seconds"), "parent": SRCID,
        "source": {"file": f"../{SRCID}/video4k.mp4", "original": "YTCN 38.mp4", "duration": DUR, "width": SW, "height": SH},
        "words": words, "removed": removed, "cuts": cuts,
        "brand": json.load(open(os.path.join(ROOT, "work", "rs_template.json"), encoding="utf-8"))["brand"],
        "settings": {"target": 0, "dynamism": 2, "silenceGap": 0.45},
        "hook": {"style": "boxed", "sfx": None, **{"duration": 2.6, **reel["hook"]}},
        "cta": {"keyword": reel["keyword"], "after": True, "sfx": None, **reel["cta"], "dm": "Ecco tutte le info sui percorsi di coaching personalizzato"},
        "style": json.loads(json.dumps(style)),
        "effects": effects,
        "audio": {"music": music, "musicVolume": 0.08, "sfxVolume": 0.25, "voiceVolume": 1, "ducking": True, "sfxOn": True, "sfxOnCuts": False},   # 5/11: niente musica (music=None), suoni solo nella CTA e bassi
        "caption": open(cap_path, encoding="utf-8").read() if os.path.exists(cap_path) else "",
        "exports": [],
    }
    proj["style"]["emphWords"] = hl
    for k, v in reel.get("style", {}).items():
        proj["style"][k] = {**proj["style"][k], **v} if isinstance(v, dict) and isinstance(proj["style"].get(k), dict) else v
    d = os.path.join(RSDIR, "progetti", pid)
    os.makedirs(os.path.join(d, "versioni"), exist_ok=True)
    f = os.path.join(d, "project.json")
    if os.path.exists(f):
        os.replace(f, os.path.join(d, "versioni", datetime.now().strftime("%Y%m%d-%H%M%S") + "-prima-di-claude.json"))
    json.dump(proj, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    md = os.path.join(WDIR, reel["id"])
    os.makedirs(md, exist_ok=True)
    json.dump({"pid": pid, "total": total, "cta": proj["cta"].get("duration", 4),
               "ivs": [{"s": iv["s"], "e": iv["e"], "o": iv["o"], "n": iv["n"], "text": " ".join(w["w"] for w in iv["words"])} for iv in ivs]},
              open(os.path.join(md, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # riepilogo tagli per il controllo
    print(f"{key}: {pid}  {total:.1f}s + CTA {proj['cta'].get('duration', 4)}s  pezzi={len(cuts)} effetti={len(reel['fx'])}")
    for iv in ivs:
        txt = " ".join(w["w"] for w in iv["words"])
        print(f"   [{iv['s']:7.2f}-{iv['e']:7.2f}] {txt[:70]}{'…' if len(txt) > 70 else ''}")
    return pid, total, ivs


if __name__ == "__main__":
    from reels_511 import REELS, CORRECTIONS, STYLE, MUSIC   # reels_ytcn38 + correzioni del 5/11
    for k in sys.argv[1:] or list(REELS):
        build(k, REELS, CORRECTIONS, STYLE, MUSIC[k])
