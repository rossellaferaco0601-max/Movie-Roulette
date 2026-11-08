"""Y9 «La costanza» versione 2, stile reference (reel zeeuiux «raw clip vs the edit»):
hook a scatole → corpo con parole cinetiche,
titolo dietro la persona, barrato, pillole-interruttore, palco crema con finestrella → CTA coaching animata con suoni.

Uso: python scripts/y9v2_build.py  → ReelStudio/progetti/cn-y9v2_costanza/project.json + work/ytcn38/Y9v2_costanza/meta.json
La clip di presentazione è un SEGNAPOSTO (Daniele muto a 146-149 s + voce clonata) finché Daniele non la registra.
"""
import json, os, shutil, subprocess, sys
from datetime import datetime

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import reel_engine as E  # noqa: E402
import ytcn38_build as B  # noqa: E402  (punta audio/proxy del motore al video YTCN 38)
from reels_ytcn38 import REELS, CORRECTIONS, STYLE, MUSIC  # noqa: E402

FPS = 30
PID = "cn-y9v2_costanza"
RID = "Y9v2_costanza"
PD = os.path.join(B.RSDIR, "progetti", PID)
WD = os.path.join(B.WDIR, RID)
VOICE = os.path.join(B.ROOT, "work", "voce")
INTRO_SRC = 146.0          # segnaposto: Daniele in pausa (146.46-148.80), muto
LIME, RED = B.LIME, "#C2503F"


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)


def main():
    os.makedirs(PD, exist_ok=True)
    os.makedirs(WD, exist_ok=True)

    reel = dict(REELS["Y9"])
    reel["parts"] = [[420.08, 451.94]]   # (5/11, Ross: via la clip di presentazione, un pezzo unico)
    toks = B.load_words(CORRECTIONS)
    ivs = E.build_intervals(reel, toks)
    ivs[-1]["n"] = round((452.10 - ivs[-1]["s"]) * FPS)   # «sforzo.» finisce a 451.97 sull'inviluppo: aria fino a 452.10
    ivs[-1]["e"] = ivs[-1]["s"] + ivs[-1]["n"] / FPS
    total = sum(iv["n"] for iv in ivs) / FPS
    out = lambda t: E.src_to_out(ivs, t)

    # ---- pezzi video (come ytcn38_build: volto centrato, dissolvenza ai tagli e ai jump cut del sorgente)
    fd = np.load(os.path.join(B.WDIR, "framediff_src.npy"))
    cuts = []
    for i, iv in enumerate(ivs):
        pts = [iv["s"]]
        for j in np.where(fd > 18)[0]:
            t = (j - 1.5) / FPS
            if iv["s"] + 0.15 < t < iv["e"] - 0.15:
                pts.append(t)
        pts.append(iv["e"])
        for k, (a, b) in enumerate(zip(pts, pts[1:])):
            cx = E.face_cx(a + min(0.4, (b - a) / 2))
            c = {"s": round(a, 4), "e": round(b, 4), "frame": "volto", "fx": round(B.obj_x(cx), 3), "fy": 0.3}
            if i or k:
                c["blend"] = True
            if iv.get("mute"):
                c["mute"] = True
            cuts.append(c)
    fx_at = lambda t: next(c["fx"] for c in cuts if c["s"] - 0.01 <= t <= c["e"] + 0.01)

    # ---- effetti (tempi di uscita)
    W = lambda word, t: B.anchor(ivs, (word, t))
    ws = lambda word, t: out(W(word, t)["s"])
    we = lambda word, t: out(W(word, t)["e"])
    effects = []
    eid = [0]

    def add(type_, start, duration, sfx=None, **props):
        eid[0] += 1
        e = {"id": f"e{eid[0]}", "type": type_, "start": round(max(0, start), 3), "duration": round(min(duration, total - start), 3), "props": props, "sfx": sfx}
        effects.append(e)
        return e

    def snd(start, name):   # solo suono (5/11, Ross: suoni sugli effetti)
        add("sfx", start, 1.0, sfx=name)

    # 2) «più della corsa a bassa intensità, più del programma perfetto, più di qualsiasi tecnica»: parole cinetiche
    s = ws("più", 423.06) - 0.05
    add("kinetic", s, we("tecnica", 427.5) + 0.25 - s, mode="replace", y=0.45, size=100,
        items=[{"text": "della corsa a *bassa intensità*", "at": round(ws("corsa", 423.6) - s, 2)},
               {"text": "del programma *perfetto*", "at": round(ws("programma", 425.3) - s, 2)},
               {"text": "di qualsiasi *tecnica*", "at": round(ws("qualsiasi", 427.0) - s, 2)}])
    # 3) «ed è la costanza»: LA COSTANZA gigante dietro Daniele
    s = ws("costanza", 428.8) - 0.35
    # 6/11 pomeriggio, Ross: «ed è la costanza» non si leggeva (la testa, da y 0,106, copriva «COSTA»): tutto sopra la testa, 128 px
    add("behindTitle", s, we("costanza", 428.8) + 0.9 - s, kicker="ed è", kickerAt=0, kickerX=0.08, kickerY=0.0, kickerSize=64, lines=["LA COSTANZA"], at=[0.35], y=0.032, size=128)
    # 4) «Non importa cosa fai oggi o domani»: barrato
    s = ws("oggi", 431.0) - 0.05
    # 5/11, Ross: non il barrato → carta «Oggi o domani» che vola via e lascia «Ogni giorno»
    add("swipe", s, we("domani", 431.5) + 1.1 - s, a="Oggi o domani", b="Ogni giorno", y=0.47, swipeAt=round(we("domani", 431.5) - s + 0.1, 2))
    # 5) «ogni giorno, ogni settimana, ogni mese e ogni anno»: pillole con interruttore
    s = ws("giorno", 433.5) - 0.35
    add("togglePills", s, we("anno", 436.5) + 0.7 - s, y=0.50, size=42,
        items=[{"text": "Ogni giorno", "at": round(ws("giorno", 433.5) - s, 2)}, {"text": "Ogni settimana", "at": round(ws("settimana", 434.5) - s, 2)},
               {"text": "Ogni mese", "at": round(ws("mese", 435.5) - s, 2)}, {"text": "Ogni anno", "at": round(ws("anno", 436.5) - s, 2)}])
    # 6) «la corsa, quella vera, si costruisce nel tempo»: palco crema con grafico e Daniele in finestrella
    s = ws("quella", 438.1) - 0.1
    src_t = E.src_to_out  # noqa (solo per leggibilità)
    add("stageCard", s, we("tempo", 440.5) + 0.55 - s, kicker="La corsa, quella vera,", lines=["SI COSTRUISCE", "*NEL TEMPO*"],
        at=[round(ws("costruisce", 439.4) - s - 0.1, 2), round(ws("nel", 440.2) - s - 0.05, 2)], chartAt=round(ws("costruisce", 439.4) - s, 2),
        chartLabel="nel tempo ↗", win={"t": W("quella", 438.1)["s"] - 0.1, "x": 0.08, "y": 0.62, "w": 0.5, "h": 0.32, "px": fx_at(438.1), "py": 0.3},
        winLabel="Daniele Vecchioni")
    # 7) «più tempo passi a correre nel modo giusto»: punch-in leggero
    add("zoom", ws("passi", 441.6) - 0.05, 1.4, amount=1.07)
    # 8) «più veloce, più leggero, più elastico e più efficiente»: parole cinetiche che si accumulano
    s = ws("più", 445.5) - 0.05
    add("kinetic", s, we("efficiente", 449.0) + 0.45 - s, sfx="pop", mode="stack", y=0.45, size=92,
        items=[{"text": "più *veloce*", "at": 0}, {"text": "più *leggero*", "at": round(ws("più", 446.48) - s, 2)},
               {"text": "più *elastico*", "at": round(ws("più", 447.6) - s, 2)}, {"text": "più *efficiente*", "at": round(ws("più", 448.82) - s, 2)}])
    # 9) «e tutto questo con meno sforzo»: parola cinetica davanti (in questa inquadratura la testa è troppo alta per il titolo dietro)
    s = ws("con", 450.66) - 0.05
    add("kinetic", s, total - s, mode="replace", y=0.45, size=118, items=[{"text": "con *meno sforzo*", "at": 0}])
    # 5/11, Ross: restano solo i pop delle parole che si accumulano (0:26) e i suoni della CTA, a volume basso
    for t in (446.48, 447.6, 448.82):
        snd(ws("più", t), "pop")
    # 6/11 notte: hook visivo (calendario della costanza che si spunta, sotto il mento; il titolo in box scende a 1250)
    # 6/11 pomeriggio, Ross: niente logo in alto a destra (video più pulito)

    words = [{"text": t["w"], "start": round(t["s"], 3), "end": round(t["e"], 3)} for t in toks]
    keep = {round(w["s"], 3) for iv in ivs for w in iv["words"]}
    removed = [i for i, w in enumerate(words) if w["start"] not in keep]
    cta_dur = 7.0
    cap_path = os.path.join(B.ROOT, "output", "ytcn38", "Y9_costanza_didascalia.txt")
    proj = {
        "id": PID, "title": "Y9 v2 · La costanza (stile reference)", "client": "correre-naturale", "origin": "youtube",
        "created": datetime.now().isoformat(timespec="seconds"), "parent": B.SRCID,
        "source": {"file": f"../{B.SRCID}/video4k.mp4", "original": "YTCN 38.mp4", "duration": B.DUR, "width": B.SW, "height": B.SH},
        "words": words, "removed": removed, "cuts": cuts,
        "brand": json.load(open(os.path.join(B.ROOT, "work", "rs_template.json"), encoding="utf-8"))["brand"],
        "settings": {"target": 0, "dynamism": 2, "silenceGap": 0.45},
        "hook": {"style": "boxed", "sfx": None, "duration": 2.4, **reel["hook"]},
        "cta": {"keyword": reel["keyword"], "after": True, **reel["cta"], "sfx": None, "duration": cta_dur,
                "dm": "Ecco tutte le info sui percorsi di coaching personalizzato"},
        "style": json.loads(json.dumps(STYLE)),
        "effects": effects,
        "audio": {"music": None, "musicVolume": 0.08, "sfxVolume": 0.25, "voiceVolume": 1, "ducking": True, "sfxOn": True, "sfxOnCuts": False},
        "caption": open(cap_path, encoding="utf-8").read() if os.path.exists(cap_path) else "",
        "exports": [],
    }
    proj["style"]["emphWords"] = [w.strip(".,").lower() for w, _ in reel.get("highlights", [])]
    for k, v in reel.get("style", {}).items():
        proj["style"][k] = {**proj["style"][k], **v} if isinstance(v, dict) and isinstance(proj["style"].get(k), dict) else v
    os.makedirs(os.path.join(PD, "versioni"), exist_ok=True)
    f = os.path.join(PD, "project.json")
    if os.path.exists(f):
        os.replace(f, os.path.join(PD, "versioni", datetime.now().strftime("%Y%m%d-%H%M%S") + "-prima-di-claude.json"))
    json.dump(proj, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"pid": PID, "total": total, "cta": cta_dur,
               "ivs": [{"s": iv["s"], "e": iv["e"], "o": iv["o"], "n": iv["n"], "text": " ".join(w["w"] for w in iv["words"])} for iv in ivs]},
              open(os.path.join(WD, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{PID}: {total:.1f}s + CTA {cta_dur}s  pezzi={len(cuts)} effetti={len(effects)}")
    for iv in ivs:
        print(f"   [{iv['s']:7.2f}-{iv['e']:7.2f}] out {iv['o'] / FPS:6.2f}  {' '.join(w['w'] for w in iv['words'])[:80]}")
    for e in effects:
        if e["type"] != "obj":
            print(f"   {e['start']:6.2f} +{e['duration']:4.2f}  {e['type']}")


if __name__ == "__main__":
    main()
