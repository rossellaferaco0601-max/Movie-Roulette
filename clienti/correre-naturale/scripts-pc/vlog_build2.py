"""Vlog «Workshop Correre Naturale» — versione 2 «vlog dinamico» (brief di Ross del 5/11, dopo la v1).

Uso: python scripts/vlog_build2.py  → ReelStudio/progetti/cn-vlog_workshop/video.mp4 + project.json
     node scripts/rs_render.js video cn-vlog_workshop output/evento/VLOG_workshop_v2.mp4

Differenze dalla v1: logo CN (non icona IG), niente musica, hook a macchina da scrivere col suono dei tasti su 4 stacchi rapidi,
capitoli grandi con orario + attività, polaroid delle foto (solo con persone), etichette che spiegano, sticker, speed ramp,
stacchi a J (voce di Daniele sopra i B-roll), correzione colore per pezzo (vlog_master: grade std/flare + punch-in sui bagliori),
sottotitoli sempre visibili (style.captions.alwaysOn) e con parole più vicine, effetti della skill «effects» resi a parte (fxClip).
"""
import json, os, re, sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vlog_master as M  # noqa: E402
import vlog_build as V1  # noqa: E402
from vlog_build import words_of, find  # noqa: E402  (parole large-v3 + correzioni a mano)
V1.REPLACE.setdefault("IMG_0606", []).append((24.0, 24.1, []))   # la «e» dopo «muoversi» non entra nei sottotitoli

ROOT = M.ROOT
RS = "C:/Users/roxfe/Documents/ReelStudio"
PID = "cn-vlog_workshop"
PD = os.path.join(RS, "progetti", PID)
WD = os.path.join(ROOT, "work", "evento")
FPS = 30
LIME, GREEN, AZ, CREAM, INK = "#95FF00", "#49762E", "#B8D7EA", "#F4F1E5", "#0B0F0A"
LOGO = "/clients/correre-naturale/logo-bianco.png"
FOTO = f"/progetti/{PID}/foto"
FX = f"/progetti/{PID}/fx"


# ------------------------------------------------------------------ scaletta
def speech(clip, w0, t0, w1, t1, pad_in=0.28, pad_out=0.30, **kw):
    toks = words_of(clip)
    a, b = find(toks, w0, t0), find(toks, w1, t1)
    kw.setdefault("grade", "std")
    return dict(clip=clip, s=round(max(0, a["s"] - pad_in), 3), e=round(b["e"] + pad_out, 3), kind="speech", toks=toks, **kw)


def broll(clip, s, e, speed=1.0, grade="std", **kw):
    return dict(clip=clip, s=float(s), e=float(e), kind="broll", speed=speed, grade=grade, **kw)


def build_segments():
    S = []
    # 0) hook: 4 stacchi rapidi sotto la scritta a macchina da scrivere
    S += [broll("IMG_0614", 5.0, 5.7, grade="flare"), broll("IMG_0599", 2.0, 2.7), broll("IMG_0624", 14.6, 15.3), broll("IMG_0647", 3.5, 4.2)]
    # 1) la sera prima: selfie (con scarabocchio + punch-in della skill, fxClip)
    sel = speech("wa_daniele_vigilia", "ragazzi", 0.54, "naturale", 6.78, pad_in=0.3, pad_out=0.05, fy=0.42)
    sel["kind"] = "selfie"
    S.append(sel)
    # 2) mattina
    S += [broll("IMG_0598", 15.0, 19.0, speed=2.0, chapter=("09:25", "CHECK-IN")), broll("IMG_0599", 2.7, 5.0), broll("IMG_0600", 10.0, 12.4),
          broll("IMG_0601", 3.0, 6.2, chapter=("10:08", "LEZIONE IN SALA"))]
    S.append(speech("IMG_0606", "se", 16.4, "muoversi", 23.5, pad_in=0.3, pad_out=0.07, fy=0.30, label="Daniele spiega: il corpo deve riscoprire come muoversi"))
    S.append(broll("IMG_0609", 10.0, 14.0, speed=1.6, label="esercizi in piedi, tutti insieme"))
    # 3) prato: prove di corsa, poi la lezione (voce guida con B-roll sopra)
    S += [broll("IMG_0612", 3.0, 6.0, grade="flare", chapter=("12:27", "TECNICA SUL PRATO")), broll("IMG_0614", 5.7, 8.0, grade="flare", label="prove di corsa, una alla volta")]
    S.append(speech("IMG_0620", "io", 95.8, "pensarlo", 102.74, pad_in=0.02, pad_out=-0.01, fy=0.33, grade="flare", zoom=1.12, zx=0.62, zy=0.5, chapter=("12:42", "LA LEZIONE")))
    S.append(speech("IMG_0620", "ritmo", 207.36, "umano", 213.76, pad_in=0.6, pad_out=0.0, fy=0.30, grade="flare"))
    S.append(broll("IMG_0624", 14.0, 16.4))
    S.append(speech("IMG_0620", "perché", 239.26, "corsa", 242.66, pad_in=0.3, pad_out=0.35, fy=0.33, grade="flare"))
    # 4) pomeriggio
    S += [broll("IMG_0645", 30.0, 33.0, chapter=("16:04", "PIEDI E POSTURA"), label="lavoro sui piedi, a terra"),
          broll("IMG_0646", 20.0, 23.0, chapter=("17:42", "ANALISI DELL'APPOGGIO"), label="la pressione del piede sulla pedana"),
          broll("IMG_0647", 3.0, 6.6, speed=1.3, chapter=("18:12", "RUNNING ANALYSIS"), label="corsa sul tapis roulant, ripresa e analizzata"),
          broll("IMG_0648", 20.0, 22.6)]
    # 5) Daniela (consenso ricevuto) e 6) chiusura di Daniele al gruppo (con «MEGLIO» dietro di lui, fxClip)
    S.append(speech("IMG_0650", "ero", 0.0, "miracolato", 9.46, pad_in=0.0, pad_out=0.06, fy=0.30, chapter=("18:23", "LA STORIA DI DANIELA")))
    S.append(speech("IMG_0650", "e", 118.62, "minuti", 125.32, pad_in=0.0, pad_out=-0.04, fy=0.30))
    S.append(speech("IMG_0650", "ragazzi", 133.62, "questo", 142.70, pad_in=0.07, pad_out=0.2, fy=0.30))
    # libreria (fuori dai cuts): B-roll per gli stacchi a J e clip della CTA
    S += [dict(clip="IMG_0623", s=6.0, e=9.5, kind="lib", grade="flare"), dict(clip="IMG_0621", s=4.0, e=7.0, kind="lib", grade="flare"),
          dict(clip="IMG_0628", s=45.0, e=53.0, kind="lib", grade="std")]
    return S


def main():
    os.makedirs(PD, exist_ok=True)
    segs = build_segments()
    tl = M.build_master([{k: v for k, v in s.items() if k != "toks"} for s in segs], os.path.join(PD, "video.mp4"))
    for s, t in zip(segs, tl):
        s.update(ms=t["ms"], me=t["me"], n=t["n"])
    main_segs = [s for s in segs if s["kind"] != "lib"]
    lib = {s["clip"]: s["ms"] for s in segs if s["kind"] == "lib"}

    # ---- cuts con velocità: tempo di uscita o = somma delle durate (e-s)/speed
    cuts, o = [], 0.0
    for i, s in enumerate(main_segs):
        c = {"s": s["ms"], "e": s["me"]}
        if i:
            c["blend"] = True
        sp_ = s.get("speed", 1.0)
        if sp_ != 1.0:
            c["speed"] = sp_
        if s["kind"] == "broll":
            c["vol"] = 0.22 if s["clip"] in ("IMG_0612", "IMG_0614", "IMG_0624", "IMG_0623") and sp_ == 1.0 else 0.0
            if c["vol"] == 0.0:
                c["mute"] = True
        if s.get("fy") is not None:
            c.update(frame="volto", fx=0.5, fy=s["fy"])
        s["o"] = o
        s["olen"] = (s["me"] - s["ms"]) / sp_
        o += s["olen"]
        cuts.append(c)
    total = o

    def out_t(seg, clip_t):   # secondi della clip → tempo di uscita
        return seg["o"] + (clip_t - seg["s"]) / seg.get("speed", 1.0)

    # ---- parole nel tempo di uscita
    words = []
    for s in main_segs:
        if s["kind"] not in ("speech", "selfie"):
            continue
        for t in s["toks"]:
            if s["s"] - 0.05 <= t["s"] < s["e"]:
                # tempi del MASTER (ReelStudio li mappa in uscita attraverso i cuts, anche con speed)
                words.append({"text": t["w"], "start": round(t["s"] - s["s"] + s["ms"], 3), "end": round(min(t["e"], s["e"]) - s["s"] + s["ms"], 3)})
    words.sort(key=lambda w: w["start"])

    def ws(seg, word, near):
        return out_t(seg, find(seg["toks"], word, near)["s"])

    def we(seg, word, near):
        return out_t(seg, find(seg["toks"], word, near)["e"])

    by = {}
    for s in main_segs:
        by.setdefault(s["clip"], []).append(s)
    sel = by["wa_daniele_vigilia"][0]
    sala = by["IMG_0606"][0]
    lez1, lez2, lez3 = by["IMG_0620"]
    dan1, dan2, dv = by["IMG_0650"]

    effects, eid = [], [0]

    def add(type_, start, duration, sfx=None, anim="cut", position=None, **props):
        eid[0] += 1
        e = {"id": f"e{eid[0]}", "type": type_, "start": round(max(0, start), 3), "duration": round(min(duration, total - start), 3), "props": props, "sfx": sfx, "anim": anim}
        if position:
            e["position"] = position
        effects.append(e)
        return e

    def obj(start, duration, sfx=None, **props):
        eid[0] += 1
        effects.append(dict(id=f"o{eid[0]}", type="obj", start=round(max(0, start), 3), duration=round(min(duration, total - start), 3), sfx=sfx, anim="cut", props=props))

    # etichetta brand (crema, testo verde) che spiega cosa si vede
    def label(start, duration, text, y=0.70, sfx=None):
        obj(start, duration, sfx=sfx, kind="text", text=text, x=0.5, y=y, w=880, size=36, weight=800, color=GREEN, align="center",
            bg="rgba(244,241,229,.95)", bgPad=14, bgRadius=22, inA="slideUp", outA="fade", lineH=1.1)

    # sticker (pillola ruotata, azzurro/verde)
    def sticker(start, duration, text, x, y, rot=-5, bg=AZ, color=INK, size=34, sfx="pop"):
        obj(start, duration, sfx=sfx, kind="text", text=text, x=x, y=y, w=640, size=size, weight=800, color=color, upper=True, letter=1,
            align="center", bg=bg, bgPad=12, bgRadius=18, rot=rot, inA="pop", outA="fade", shadow="morbida")

    # polaroid (PNG 720×900 fatta da vlog_polaroid.py)
    def polaroid(start, duration, name, x=0.5, y=0.52, rot=-6, w=560):
        obj(start, duration, sfx="scatto", kind="image", src=f"{FOTO}/p_{name}.png", x=x, y=y, w=w, rot=rot, shadow="forte", inA="pop", outA="fade")

    # capitolo grande: orario + attività (firma del vlog)
    for s in main_segs:
        if s.get("chapter"):
            num, title = s["chapter"]
            pos = "lower" if s["clip"] in ("IMG_0650",) else "top"
            add("chapter", s["o"] + 0.05, min(2.6, s["olen"] + 0.4), sfx="whoosh", anim="slideLeft", position=pos, number=num, title=title, color=AZ, size=58)
        if s.get("label"):
            d = s["olen"] - 0.3
            label(s["o"] + (1.2 if s.get("chapter") else 0.25), d - (1.2 if s.get("chapter") else 0.25), s["label"], y=0.70 if s["kind"] == "broll" else 0.66)

    # ---- hook: cornice REC sugli stacchi rapidi (la scritta a macchina da scrivere è hook.style typewriter)
    hook_len = sel["o"]
    add("rec", 0, hook_len, sfx=None)
    # ---- selfie: effetto skill (scarabocchio + punch-in) + sticker
    add("fxClip", sel["o"], sel["olen"], sfx=None, src=f"{FX}/selfie.mp4")
    sticker(sel["o"] + 0.4, sel["olen"] - 0.6, "la sera prima · dall'ufficio", 0.5, 0.63, rot=-4)
    # ---- check-in: polaroid della squadra e dei gradini
    chk = by["IMG_0599"][1]
    polaroid(chk["o"] + 0.2, chk["olen"] + 1.6, "IMG_0880", x=0.62, y=0.50, rot=6)
    gr = by["IMG_0600"][0]
    polaroid(gr["o"] + 0.9, gr["olen"] - 0.7, "b49c29cb", x=0.40, y=0.56, rot=-7)
    # ---- sala: programma della giornata (app Note) sulla sala vista da dietro
    sl = by["IMG_0601"][0]
    add("notesTodo", sl["o"] + 1.1, sl["olen"] - 1.0, sfx="pop", title="Programma *di oggi*", date="sabato 24 ottobre", y=0.47,
        items=[{"text": "Lezione in sala", "at": 0.2, "done": 0.9}, {"text": "Tecnica sul prato", "at": 0.5}, {"text": "Running analysis", "at": 0.8}])
    # ---- lezione: stacco a J (il gruppo corre mentre Daniele inizia a parlare), poi timbro FALSO
    add("broll", lez1["o"], 1.7, sfx=None, t=lib["IMG_0623"], zoom=0.06, fin=0, fout=5)
    t_fal = ws(lez1, "stupido", 102.18)
    s0 = ws(lez1, "ognuno", 99.98) - 0.1
    add("stamp", s0, (t_fal + 1.5) - s0, sfx="impatto", text="«Ognuno corre *come vuole*»", stamp="FALSO", stampAt=round(t_fal - s0, 2), y=0.50)
    polaroid(lez1["o"] + lez1["olen"] - 0.3, 0.3 + 1.6, "IMG_0619", x=0.5, y=0.50, rot=-5)   # ponte sul taglio verso «il ritmo»
    t_ott = ws(lez2, "ottimizza", 210.42)
    add("statStack", t_ott, lez2["o"] + lez2["olen"] - t_ott + 0.3, sfx="pop", big="170-180", label="al minuto", y=0.52, chips=[{"text": "il ritmo giusto", "at": 0.5}])
    # «ricordiamoci…»: stacco a J col gruppo che corre, poi parole cinetiche sotto Daniele (sottotitoli sempre visibili)
    add("broll", lez3["o"], 1.3, sfx=None, t=lib["IMG_0621"], zoom=0.06, fin=0, fout=5)
    s0 = ws(lez3, "migliorando", 240.80) - 0.05
    add("kinetic", s0, lez3["o"] + lez3["olen"] - s0 + 0.3, sfx=None, mode="replace", y=0.50, size=92,
        items=[{"text": "migliorando *l'essere umano*", "at": 0}, {"text": "grazie alla *corsa*", "at": round(ws(lez3, "grazie", 242.26) - s0, 2)}])
    # ---- pomeriggio: freccia sulla pedana, sticker sul tapis roulant
    ped = by["IMG_0646"][0]
    add("arrow", ped["o"] + 1.3, 1.6, sfx="swish", anim="fade", label="le impronte", x=0.47, y=0.33, rotate=-20)
    tr = by["IMG_0647"][0]
    sticker(tr["o"] + 1.4, tr["olen"] - 1.3, "running analysis", 0.30, 0.60, rot=-8, bg=GREEN, color="#FFFFFF")
    # ---- Daniela: nome e ruolo; palco crema con le sue parole (numeri detti da lei)
    add("lowerThird", dan1["o"] + 2.9, 3.2, sfx="swish", name="Daniela", role="Partecipante al workshop")   # dopo il capitolo
    s0 = ws(dan2, "la", 120.38) - 0.15
    add("stageCard", s0, dan2["o"] + dan2["olen"] - s0, sfx="pop", kicker="Nella mezza maratona", y=0.08, size=88, chart=False,
        lines=["LA DANIELA DI *60 ANNI*", "BATTE QUELLA DI *50*", "DI *20 MINUTI*"],
        at=[round(ws(dan2, "60", 121.46) - s0, 2), round(ws(dan2, "batte", 122.34) - s0, 2), round(ws(dan2, "20", 124.84) - s0, 2)],
        win={"t": round(dan2["ms"] + (s0 - dan2["o"]), 3), "x": 0.08, "y": 0.43, "w": 0.84, "h": 0.34, "px": 0.5, "py": 0.3}, winLabel="Daniela · 60 anni")
    # ---- chiusura: «MEGLIO» dietro Daniele (skill, fxClip) + parole che si accumulano + polaroid del gruppo
    add("fxClip", dv["o"], dv["olen"], sfx=None, src=f"{FX}/chiusura.mp4")
    s0 = ws(dv, "dieci", 134.30) - 0.1
    add("kinetic", s0, dv["o"] + dv["olen"] - s0, sfx="pop", mode="stack", y=0.52, size=80,
        items=[{"text": "tra *10 anni*", "at": 0}, {"text": "tra *20 anni*", "at": round(ws(dv, "venti", 136.50) - s0, 2)},
               {"text": "*meglio* di adesso", "at": round(ws(dv, "meglio", 137.40) - s0, 2)},
               {"text": "sfruttate la *corsa*", "at": round(ws(dv, "sfruttate", 141.14) - s0, 2)}])
    polaroid(ws(dv, "questo", 142.70) - 0.2, total - ws(dv, "questo", 142.70) + 0.2, "IMG_0617", x=0.70, y=0.30, rot=7, w=440)
    # i B-roll a J e i clip con effetto esterno stanno sotto a tutto il resto (capitoli, etichette)
    effects.sort(key=lambda e: 0 if e["type"] in ("broll", "fxClip") else 1)
    # ---- logo Correre Naturale in alto a destra per tutto il reel (al posto dell'icona Instagram)
    # (spento mentre «MEGLIO» gigante occupa la parte alta: 3,75-6,3 s dentro la chiusura)
    for a, b in ((0, dv["o"] + 3.7), (dv["o"] + 6.35, total)):
        obj(a, b - a, kind="image", src=LOGO, x=0.835, y=0.095, w=250, shadow="morbida", inA="fade", outA="fade", opacity=0.96)

    style = {
        "palette": "brand", "titleFont": "brand", "videoStyle": "vlog", "layout": "full", "filter": "none",
        "captions": {"style": "hormozi", "position": "low", "y": 0.80, "size": 0.85, "wordsPerLine": 3, "lines": 1, "alwaysOn": True,
                     "activeColor": LIME, "color": "#FFFFFF", "stroke": 4, "anim": "pop", "emphColor": LIME, "wordFx": "colore", "highlight": LIME, "wordGap": 0.22},
        "emphWords": ["workshop", "tecnica", "stupido", "170-180", "ritmo", "migliorando", "corsa", "divano", "miracolato", "muoversi", "recuperare",
                      "60", "50", "20", "minuti", "dieci", "venti", "meglio", "sfruttate"],
        "breathing": False, "cutZoom": False, "pushIn": False, "cutBlend": 5,
        "logo": False, "logoKind": "pictogramOnDark", "progressBar": False, "gradient": False, "vignette": False,
        "focusX": 0.5, "focusY": 0.35, "faceZone": {"on": True, "y0": 0.2, "y1": 0.45},
    }
    brand = json.load(open(os.path.join(RS, "clients", "correre-naturale", "brand.json"), encoding="utf-8"))
    proj = {
        "id": PID, "title": "Vlog v2 · Workshop Correre Naturale (24/10/2026)", "client": "correre-naturale", "origin": "inedito",
        "created": datetime.now().isoformat(timespec="seconds"),
        "source": {"file": "video.mp4", "original": "input/evento (telefono di Paola)", "duration": round(segs[-1]["me"], 3), "width": 1080, "height": 1920},
        "words": words, "removed": [], "cuts": cuts, "brand": brand,
        "settings": {"target": 0, "dynamism": 3, "silenceGap": 0.45},
        "hook": {"text": "Ti portiamo in una giornata di *workshop* con Correre Naturale", "style": "typewriter", "font": "brand", "top": 560, "size": 0.9,
                 "duration": round(hook_len, 2), "sfx": "tastiera"},
        "cta": {"style": "coaching", "after": True, "duration": 7, "keyword": "WORKSHOP", "variant": "video",
                "text": "Vuoi esserci al *prossimo* workshop?", "sub": "Una giornata dal vivo con Daniele: tecnica, running analysis e il metodo Correre Naturale®",
                "note": "Commenta WORKSHOP e ti mando date e info 👇", "dm": "Ecco date e info del prossimo workshop dal vivo di Correre Naturale®",
                "video": {"src": f"/progetti/{PID}/video.mp4", "from": lib["IMG_0628"]}, "sfx": None},
        "style": style, "effects": effects,
        "audio": {"music": None, "musicVolume": 0, "sfxVolume": 0.4, "voiceVolume": 1, "ducking": True, "sfxOn": True, "sfxOnCuts": False},
        "caption": "", "exports": [],
    }
    os.makedirs(os.path.join(PD, "versioni"), exist_ok=True)
    f = os.path.join(PD, "project.json")
    if os.path.exists(f):
        os.replace(f, os.path.join(PD, "versioni", datetime.now().strftime("%Y%m%d-%H%M%S") + "-prima-di-claude.json"))
    json.dump(proj, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"pid": PID, "total": total, "cta": 7, "segments": [{k: v for k, v in s.items() if k != "toks"} for s in segs]},
              open(os.path.join(WD, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{PID} v2: {total:.1f}s + CTA 7s  pezzi={len(cuts)} effetti={len(effects)} parole={len(words)}")
    for s in main_segs:
        txt = " ".join(t["w"] for t in s.get("toks", []) if s["s"] - 0.05 <= t["s"] < s["e"])
        print(f"   out {s['o']:6.2f}+{s['olen']:4.2f} {s['clip']:>18} {s['s']:7.2f}-{s['e']:7.2f} x{s.get('speed', 1):<3} {s['kind']:6} {txt[:60]}")
    for e in effects:
        if e["type"] != "obj":
            print(f"   fx {e['start']:6.2f} +{e['duration']:4.2f} {e['type']}")


if __name__ == "__main__":
    main()
