"""Vlog «Workshop Correre Naturale» (24/10/2026) — montaggio dal materiale dell'evento (input/evento, telefono di Paola).

Uso: python scripts/vlog_build.py  → master in ReelStudio/progetti/cn-vlog_workshop/video.mp4 + project.json
     poi: node scripts/rs_render.js video cn-vlog_workshop output/evento/VLOG_workshop.mp4

Struttura: hook (selfie della vigilia) → mattina (check-in, sala) → prato: lezione di Daniele (3 frasi) con B-roll →
pomeriggio (piedi, pedana, tapis roulant) → Daniela (testimonianza) → chiusura di Daniele al gruppo → CTA coaching 7 s.
Il master è un unico 1080×1920 fatto dei pezzi in ordine (scripts/vlog_master.py); ogni pezzo = un cut con dissolvenza.
"""
import json, os, re, sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vlog_master as M  # noqa: E402

ROOT = M.ROOT
RS = "C:/Users/roxfe/Documents/ReelStudio"
PID = "cn-vlog_workshop"
PD = os.path.join(RS, "progetti", PID)
WD = os.path.join(ROOT, "work", "evento")
FPS = 30
LIME = "#95FF00"
IG_ICON = "/progetti/cn-ytcn38-src/elementi/20261104-195147-instagram.svg"

# ------------------------------------------------------------------ parole (large-v3) con correzioni a mano
# [clip] -> lista di (t0, t1, [(parola, s, e), ...]) che sostituisce i token con inizio in [t0, t1)
REPLACE = {"IMG_0620": [(206.4, 207.3, [("Il", 207.05, 207.34)])]}   # «Il» con tempo falsato dall'inizio del tratto
WORDFIX = {"IMG_0650": [("state", "stiate"), ("correre", "Correre"), ("naturale", "Naturale")],
           "IMG_0620": [("po", "po'"), ("Perché", "Perché,")]}
EXTRA = {"IMG_0620": ("IMG_0620b", 202.0, 216.5)}   # seconda passata più pulita su un tratto: sostituisce i token del tratto


def words_of(clip):
    data = json.load(open(os.path.join(WD, f"{clip}_words.json"), encoding="utf-8"))
    if clip in EXTRA:
        name, a, b = EXTRA[clip]
        data = [sg for sg in data if not (a <= sg["start"] < b)] + json.load(open(os.path.join(WD, f"{name}_words.json"), encoding="utf-8"))
        data.sort(key=lambda sg: sg["start"])
    toks = []
    for seg in data:
        for w in seg["words"]:
            txt = w["w"].strip()
            if not txt:
                continue
            if toks and (txt[0] in "'%-" or re.match(r"^\.\d", txt)):
                toks[-1]["w"] += txt
                toks[-1]["e"] = w["e"]
                continue
            toks.append({"w": txt, "s": w["s"], "e": w["e"]})
    for t0, t1, new in REPLACE.get(clip, []):
        toks = [t for t in toks if not (t0 <= t["s"] < t1)] + [{"w": a, "s": s, "e": e} for a, s, e in new]
        toks.sort(key=lambda t: t["s"])
    for old, new in WORDFIX.get(clip, []):
        for t in toks:
            if t["w"].rstrip(".,;:!?") == old:
                t["w"] = t["w"].replace(old, new)
    return toks


def find(toks, word, near):
    """Token che inizia con `word` più vicino a `near` (entro 1,5 s)."""
    cands = [t for t in toks if abs(t["s"] - near) < 1.5 and re.sub(r"[^\w']", "", t["w"].lower()).startswith(word.lower())]
    if not cands:
        raise SystemExit(f"parola «{word}» non trovata vicino a {near}")
    return min(cands, key=lambda t: abs(t["s"] - near))


# ------------------------------------------------------------------ scaletta
# speech: (clip, prima parola, t≈, ultima parola, t≈) → i bordi si agganciano alle parole con aria prima/dopo
def speech(clip, w0, t0, w1, t1, pad_in=0.28, pad_out=0.30, **kw):
    toks = words_of(clip)
    a, b = find(toks, w0, t0), find(toks, w1, t1)
    return dict(clip=clip, s=round(max(0, a["s"] - pad_in), 3), e=round(b["e"] + pad_out, 3), kind="speech", toks=toks, **kw)


def broll(clip, s, e, **kw):
    return dict(clip=clip, s=float(s), e=float(e), kind="broll", **kw)


def build_segments():
    S = []
    # 0) hook: selfie della vigilia (WhatsApp) «Ragazzi, non vedo l'ora … per il workshop di Correre Naturale»
    S.append(speech("wa_daniele_vigilia", "ragazzi", 0.54, "naturale", 6.78, pad_in=0.3, pad_out=0.05, fy=0.42))
    S[-1]["kind"] = "selfie"
    # 1) mattina
    S += [broll("IMG_0598", 15, 18.5, label="09:25 · CHECK-IN"), broll("IMG_0599", 2, 4.5), broll("IMG_0600", 10, 12.5),
          broll("IMG_0601", 3, 6, label="10:08 · IN SALA"), broll("IMG_0606", 2, 5), broll("IMG_0609", 10, 13)]
    # 2) esterno
    S += [broll("IMG_0612", 3, 6, label="12:27 · SUL PRATO"), broll("IMG_0614", 5, 8)]
    # 3) lezione sul prato (IMG_0620)
    S.append(speech("IMG_0620", "io", 95.8, "pensarlo", 102.74, pad_in=0.02, pad_out=0.02, fy=0.33, label="12:42 · LA LEZIONE"))
    S.append(broll("IMG_0623", 6, 9))
    S.append(speech("IMG_0620", "ritmo", 207.36, "umano", 213.76, pad_in=0.6, pad_out=0.0, fy=0.30))
    S.append(broll("IMG_0624", 14, 17))
    S.append(speech("IMG_0620", "perché", 239.26, "corsa", 242.66, pad_in=0.3, pad_out=0.35, fy=0.33))
    # 4) pomeriggio
    S += [broll("IMG_0645", 30, 33, label="16:04 · PIEDI E POSTURA"), broll("IMG_0646", 20, 23, label="17:42 · L'APPOGGIO"),
          broll("IMG_0647", 3, 6, label="18:12 · RUNNING ANALYSIS"), broll("IMG_0648", 20, 23)]
    # 5) Daniela (consenso ricevuto 5/11) e 6) chiusura di Daniele al gruppo
    S.append(speech("IMG_0650", "ero", 0.0, "miracolato", 9.46, pad_in=0.0, pad_out=0.06, fy=0.30, label="18:23 · DANIELA"))
    S.append(speech("IMG_0650", "nella", 119.06, "minuti", 125.32, pad_in=0.0, pad_out=0.04, fy=0.30))
    S.append(speech("IMG_0650", "ragazzi", 133.62, "questo", 142.70, pad_in=0.07, pad_out=0.2, fy=0.30))
    # libreria (fuori dai cuts): clip per la CTA
    S.append(dict(clip="IMG_0628", s=45.0, e=53.0, kind="lib"))
    return S


def main():
    os.makedirs(PD, exist_ok=True)
    segs = build_segments()
    tl = M.build_master([{k: v for k, v in s.items() if k != "toks"} for s in segs], os.path.join(PD, "video.mp4"))
    for s, t in zip(segs, tl):
        s.update(ms=t["ms"], me=t["me"], n=t["n"])
    main_segs = [s for s in segs if s["kind"] != "lib"]
    total = main_segs[-1]["me"]
    lib = {s["clip"]: s["ms"] for s in segs if s["kind"] == "lib"}

    # ---- cuts (uno per pezzo, dissolvenza 5 fotogrammi) + zona volto per pezzo
    cuts = []
    for i, s in enumerate(main_segs):
        c = {"s": s["ms"], "e": s["me"]}
        if i:
            c["blend"] = True
        if s["kind"] == "broll":
            # ambiente solo all'aperto (passi, vento); in sala e al check-in si sentirebbero frasi spezzate di Daniele
            c["vol"] = 0.25 if s["clip"] in ("IMG_0612", "IMG_0614", "IMG_0623", "IMG_0624") else 0.0
            if c["vol"] == 0.0:
                c["mute"] = True
        if s.get("fy") is not None:
            c.update(frame="volto", fx=0.5, fy=s["fy"])
        cuts.append(c)

    # ---- parole nel tempo del master
    words = []
    for s in main_segs:
        if s["kind"] not in ("speech", "selfie"):
            continue
        for t in s["toks"]:
            if s["s"] - 0.05 <= t["s"] < s["e"]:
                words.append({"text": t["w"], "start": round(t["s"] - s["s"] + s["ms"], 3), "end": round(min(t["e"], s["e"]) - s["s"] + s["ms"], 3)})
    words.sort(key=lambda w: w["start"])

    def ws(seg, word, near):   # near = secondi della clip; ritorna il tempo nel master
        t = find(seg["toks"], word, near)
        return t["s"] - seg["s"] + seg["ms"]

    def we(seg, word, near):
        t = find(seg["toks"], word, near)
        return t["e"] - seg["s"] + seg["ms"]

    sp = [s for s in main_segs if s["kind"] in ("speech", "selfie")]
    sel, lez1, lez2, lez3, dan1, dan2, dv1 = sp
    dv2 = dv1

    effects, eid = [], [0]

    def add(type_, start, duration, sfx=None, anim="cut", **props):
        eid[0] += 1
        e = {"id": f"e{eid[0]}", "type": type_, "start": round(max(0, start), 3), "duration": round(min(duration, total - start), 3), "props": props, "sfx": sfx, "anim": anim}
        effects.append(e)
        return e

    # pillola orario in alto a sinistra (firma del vlog), stessa riga dell'handle
    def pill(seg, text, dur=None):
        d = dur or (seg["me"] - seg["ms"]) + 2.6
        effects.append(dict(id=f"pill{eid[0] + 1}", type="obj", start=round(seg["ms"] + 0.1, 3), duration=round(min(d, total - seg["ms"] - 0.1), 3), sfx=None, anim="cut",
                            props={"kind": "text", "text": text, "x": 0.24, "y": 0.108, "w": 440, "size": 27, "weight": 800, "color": "#49762E", "upper": True,
                                   "letter": 2, "align": "center", "bg": "rgba(244,241,229,.94)", "bgPad": 10, "bgRadius": 30, "inA": "slideDown", "outA": "fade", "opacity": 0.97}))
        eid[0] += 1

    for s in main_segs:
        if s.get("label"):
            pill(s, s["label"])

    # 1) sala: checklist in vetro «la giornata» sopra la sala vista da dietro (IMG_0601)
    sala = next(s for s in main_segs if s["clip"] == "IMG_0601")
    add("glassList", sala["ms"] + 0.2, (sala["me"] - sala["ms"]) - 0.2, sfx="pop", title="Workshop dal vivo", y=0.50,
        items=[{"text": "Lezione in sala", "at": 0.2}, {"text": "Tecnica sul prato", "at": 0.9}, {"text": "Running analysis", "at": 1.6}])
    # 2) Daniele davanti allo schermo: nome e ruolo
    scr = next(s for s in main_segs if s["clip"] == "IMG_0606")
    add("lowerThird", scr["ms"] + 0.2, scr["me"] - scr["ms"] - 0.2, sfx="swish", name="Daniele Vecchioni", role="Ideatore del metodo Correre Naturale®")
    # 3) lezione 1: «ognuno corre come vuole» → timbro FALSO quando dice «controintuitivo»
    t_fal = ws(lez1, "stupido", 102.18)
    s0 = ws(lez1, "ognuno", 99.98) - 0.1
    add("stamp", s0, (t_fal + 1.6) - s0, sfx="impatto", text="«Ognuno corre *come vuole*»", stamp="FALSO", stampAt=round(t_fal - s0, 2), y=0.50)
    # 4) lezione 2: 170-180 → numero in vetro dopo che l'ha detto (così i sottotitoli non lo ripetono)
    t_ott = ws(lez2, "ottimizza", 210.42)
    add("statStack", t_ott, lez2["me"] - t_ott + 0.4, sfx="pop", big="170-180", label="al minuto", y=0.52, chips=[{"text": "il ritmo giusto", "at": 0.5}])
    # 5) lezione 3: parole cinetiche (nascondono i sottotitoli, dicono lo stesso)
    s0 = ws(lez3, "migliorando", 240.80) - 0.05
    add("kinetic", s0, lez3["me"] - s0 + 0.3, sfx=None, mode="replace", y=0.52, size=96,
        items=[{"text": "migliorando *l'essere umano*", "at": 0}, {"text": "grazie alla *corsa*", "at": round(ws(lez3, "grazie", 242.26) - s0, 2)}])
    # 6) pomeriggio: titolo RUNNING ANALYSIS sul tapis roulant
    tr = next(s for s in main_segs if s["clip"] == "IMG_0647")
    add("kinetic", tr["ms"] + 0.3, 3.0, sfx="pop", mode="replace", y=0.78, size=92, items=[{"text": "running *analysis*", "at": 0}])
    # 7) Daniela: nome e ruolo; «20 minuti» → numero in vetro quando lo dice
    add("lowerThird", dan1["ms"] + 0.3, 3.2, sfx="swish", name="Daniela", role="Partecipante al workshop")
    # palco crema con Daniela in finestrella (nasconde i sottotitoli: le righe dicono le sue parole, numeri detti da lei)
    s0 = ws(dan2, "la", 120.38) - 0.15
    add("stageCard", s0, dan2["me"] - s0, sfx="pop", kicker="Nella mezza maratona", y=0.08, size=88, chart=False,
        lines=["LA DANIELA DI *60 ANNI*", "BATTE QUELLA DI *50*", "DI *20 MINUTI*"],
        at=[round(ws(dan2, "60", 121.46) - s0, 2), round(ws(dan2, "batte", 122.34) - s0, 2), round(ws(dan2, "20", 124.84) - s0, 2)],
        win={"t": round(s0, 3), "x": 0.08, "y": 0.5, "w": 0.84, "h": 0.42, "px": 0.5, "py": 0.3}, winLabel="Daniela · 60 anni")
    # 8) chiusura di Daniele: parole che si accumulano
    s0 = ws(dv1, "dieci", 134.30) - 0.1
    add("kinetic", s0, dv1["me"] - s0, sfx="pop", mode="stack", y=0.52, size=84,
        items=[{"text": "tra *10 anni*", "at": 0}, {"text": "tra *20 anni*", "at": round(ws(dv1, "venti", 136.50) - s0, 2)},
               {"text": "*meglio* di adesso", "at": round(ws(dv1, "meglio", 137.40) - s0, 2)},
               {"text": "sfruttate la *corsa*", "at": round(ws(dv1, "sfruttate", 141.14) - s0, 2)}])
    # handle @correrenaturale in alto a destra per tutto il reel
    effects += [
        dict(id="iga", type="obj", start=0, duration=round(total, 3), sfx=None, anim="cut",
             props={"kind": "image", "src": IG_ICON, "tint": "#FFFFFF", "w": 54, "h": 54, "x": 0.875, "y": 0.108, "shadow": "morbida", "inA": "fade", "outA": "fade", "opacity": 0.95}),
        dict(id="igb", type="obj", start=0, duration=round(total, 3), sfx=None, anim="cut",
             props={"kind": "text", "text": "@correrenaturale", "x": 0.875, "y": 0.142, "w": 360, "size": 24, "weight": 700, "color": "#FFFFFF", "upper": True,
                    "letter": 1, "align": "center", "shadow": "morbida", "inA": "fade", "outA": "fade", "opacity": 0.95}),
    ]

    style = {
        "palette": "brand", "titleFont": "brand", "videoStyle": "vlog", "layout": "full", "filter": "caldo",
        "captions": {"style": "hormozi", "position": "low", "y": 0.80, "size": 0.85, "wordsPerLine": 3, "lines": 1,
                     "activeColor": LIME, "color": "#FFFFFF", "stroke": 4, "anim": "pop", "emphColor": LIME, "wordFx": "colore", "highlight": LIME, "wordGap": 0.5},
        "emphWords": ["workshop", "tecnica", "controintuitivo", "170", "180", "ritmo", "migliorando", "corsa", "divano", "miracolato",
                      "60", "50", "20", "minuti", "dieci", "venti", "meglio", "sfruttate", "benessere"],
        "breathing": False, "cutZoom": False, "pushIn": False, "cutBlend": 5,
        "logo": False, "logoKind": "pictogramOnDark", "progressBar": False, "gradient": False, "vignette": False,
        "focusX": 0.5, "focusY": 0.35, "faceZone": {"on": True, "y0": 0.2, "y1": 0.45},
    }
    brand = json.load(open(os.path.join(RS, "clients", "correre-naturale", "brand.json"), encoding="utf-8"))
    keep = {w["start"] for w in words}
    proj = {
        "id": PID, "title": "Vlog · Workshop Correre Naturale (24/10/2026)", "client": "correre-naturale", "origin": "inedito",
        "created": datetime.now().isoformat(timespec="seconds"),
        "source": {"file": "video.mp4", "original": "input/evento (telefono di Paola)", "duration": round(segs[-1]["me"], 3), "width": 1080, "height": 1920},
        "words": words, "removed": [], "cuts": cuts, "brand": brand,
        "settings": {"target": 0, "dynamism": 2, "silenceGap": 0.45},
        "hook": {"text": "Una giornata al *WORKSHOP* dal vivo", "style": "boxed", "top": 1040, "size": 0.9, "duration": 3.0, "sfx": None},
        "cta": {"style": "coaching", "after": True, "duration": 7, "keyword": "WORKSHOP", "variant": "video",
                "text": "Vuoi esserci al *prossimo* workshop?", "sub": "Una giornata dal vivo con Daniele: tecnica, running analysis e il metodo Correre Naturale®",
                "note": "Commenta WORKSHOP e ti mando date e info 👇", "dm": "Ecco date e info del prossimo workshop dal vivo di Correre Naturale®",
                "video": {"src": f"/progetti/{PID}/video.mp4", "from": lib["IMG_0628"]}, "sfx": None},
        "style": style, "effects": effects,
        "audio": {"music": "acustica-calma", "musicVolume": 0.11, "sfxVolume": 0.35, "voiceVolume": 1, "ducking": True, "sfxOn": True, "sfxOnCuts": False},
        "caption": "", "exports": [],
    }
    os.makedirs(os.path.join(PD, "versioni"), exist_ok=True)
    f = os.path.join(PD, "project.json")
    if os.path.exists(f):
        os.replace(f, os.path.join(PD, "versioni", datetime.now().strftime("%Y%m%d-%H%M%S") + "-prima-di-claude.json"))
    json.dump(proj, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"pid": PID, "total": total, "cta": 7, "segments": [{k: v for k, v in s.items() if k != "toks"} for s in segs]},
              open(os.path.join(WD, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{PID}: {total:.1f}s + CTA 7s  pezzi={len(cuts)} effetti={len(effects)} parole={len(words)}")
    for s in main_segs:
        txt = " ".join(t["w"] for t in s.get("toks", []) if s["s"] - 0.05 <= t["s"] < s["e"])
        print(f"   {s['ms']:6.2f}-{s['me']:6.2f} {s['clip']:>18} {s['s']:7.2f}-{s['e']:7.2f} {s['kind']:6} {txt[:70]}")
    for e in effects:
        if e["type"] != "obj":
            print(f"   fx {e['start']:6.2f} +{e['duration']:4.2f} {e['type']}")


if __name__ == "__main__":
    main()
