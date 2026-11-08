"""Vlog «Workshop Correre Naturale» — versione condensata (Ross, 6/11/2026) sulla STRUTTURA ESATTA della reference «a day in my life»
(input/reference_condensato.mp4 = il reel, input/reference_condensato2.mp4 = il suo progetto CapCut con la timeline dei testi):
  1) titolo impilato su 5 righe (a / day / in / my / life): le prime 4 fisse, l'ultima parola cambia font 9 volte in 1,5 s,
     e sotto il video cambia alla stessa raffica (9 inquadrature da 5 fotogrammi);
  2) poi un'etichetta piccola e centrata per scena (≈1 s, con 0,2 s di vuoto tra una e l'altra), video che cambia ogni 34 fotogrammi (1,13 s),
     stacchi secchi, nessun parlato nella prima parte; «Bye» in chiusura → da noi CTA.
Tradotto nel brand: solo Blinker (pesi 400/600/700/800 caricati in ReelStudio), lime/bianco/azzurro/crema, logo circolare bianco scontornato.
Niente musica (scelta di Ross); i soli tratti parlati, più avanti, sono frasi intere e brevi («talloni», chiusura). Le etichette hanno l'orario
nel testo come le scrive Ross («9:30 Check in», «18:30 La storia di Daniela»).
Storia: v1 scene da 2-3 s e 5 frasi → «perso il ritmo»; v2 parole grandi con pillola e titolo fisso su 3 inquadrature → «la struttura deve essere questa».

Uso: python scripts/vlog_build60.py  → ReelStudio/progetti/cn-vlog_workshop60/video.mp4 + project.json
     node scripts/rs_render.js video cn-vlog_workshop60 output/evento/VLOG_workshop_60s.mp4
"""
import json, os, sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vlog_master as M  # noqa: E402
import vlog_build3 as B  # noqa: E402  (speech con margini e dissolvenze, broll, correzioni Whisper)

ROOT = M.ROOT
RS = "C:/Users/roxfe/Documents/ReelStudio"
PID = "cn-vlog_workshop60"
PD = os.path.join(RS, "progetti", PID)
WD = os.path.join(ROOT, "work", "evento")
LIME, GREEN, AZ, CREAM, INK = B.LIME, B.GREEN, B.AZ, B.CREAM, B.INK
LOGO = "/progetti/cn-vlog_workshop/foto/logo_circ_bianco_ombra.png"   # logo circolare bianco scontornato (Ross, 6/11: «scontorna sempre il logo»)
CTA_LEN = 7
FPS = 30
BEAT = 16 / FPS      # 0,533 s: battuta della musica «pop-solare-32f» (pop-solare 112 bpm tagliata sul primo colpo e portata a 112,5 bpm)
SHOT = 2 * BEAT      # 1,067 s (32 fotogrammi): uno stacco ogni due battute, come i colpi della reference (~1,1 s)
BURST = 6 / FPS      # 0,2 s: le 8 inquadrature sotto il titolo = 1,6 s = 3 battute (nella timeline CapCut: 9 clip da ~0,17 s)
LABEL_Y = 0.585      # poco sotto il centro: nella reference vista su Instagram sta a ~0,58; al centro esatto (0,50) finiva sui volti dei gruppi
speech = B.speech
OUTDOOR = ("wa_villa_vigilia", "IMG_0615", "IMG_0598", "IMG_0599", "IMG_0612", "IMG_0613", "IMG_0614", "IMG_0621", "IMG_0622", "IMG_0623",
           "IMG_0624", "IMG_0625", "IMG_0626", "IMG_0627", "IMG_0628", "IMG_0629", "wa_drill_prato", "wa_gruppo_cammino")


def shot(clip, s, speed=1.0, dur=SHOT, **kw):
    """B-roll lungo esattamente una cadenza (a velocità `speed` il tratto sorgente è più lungo)."""
    return B.broll(clip, s, s + dur * speed, speed=speed, **kw)


def build_segments():
    S = []
    # 1) raffica sotto il titolo: 9 inquadrature da 5 fotogrammi, un assaggio di tutta la giornata (niente volti al centro: lì c'è il titolo)
    # (6/11 sera, Ross: niente inquadrature della sola location → via la villa; più spezzoni)
    for clip, s in [("IMG_0599", 3.0), ("IMG_0604", 5.0), ("IMG_0612", 3.0), ("wa_drill_prato", 4.5), ("IMG_0645", 30.5),
                    ("IMG_0646", 20.0), ("IMG_0648", 40.0), ("IMG_0628", 45.0)]:
        S.append(shot(clip, s, dur=BURST, burst=True, grade="flare" if clip in ("IMG_0612", "IMG_0613") else "std"))
    # 2) una scena per etichetta (label = testo come lo scrive Ross; span = su quante inquadrature resta). Via «La sera prima» (Ross, 6/11 sera).
    S += [shot("IMG_0598", 15.0, speed=2.0, label="9:30 Check in", span=3), shot("IMG_0599", 2.7), shot("IMG_0600", 11.0)]
    S += [shot("IMG_0601", 3.0, label="10:00 In sala", span=3), shot("IMG_0605", 5.0), shot("IMG_0602", 7.0)]
    S += [shot("IMG_0609", 10.0, speed=1.6, label="Riscaldamento", span=2), shot("IMG_0611", 8.0)]
    S += [shot("wa_gruppo_cammino", 0.2, label="Prove di corsa", span=2), shot("IMG_0627", 10.0)]   # a 5 s il gruppo era lontano: sembrava la location
    S += [shot("IMG_0612", 3.0, grade="flare", label="12:30 Sul prato", span=2), shot("IMG_0614", 5.7, grade="flare")]
    S += [shot("IMG_0620", 99.0, grade="flare", zoom=1.12, zx=0.62, zy=0.5, label="La lezione", span=2), shot("IMG_0621", 6.0, grade="flare")]
    S += [shot("wa_drill_prato", 4.0, label="Esercizi", span=2), shot("IMG_0624", 14.6)]
    S += [shot("IMG_0623", 6.0, grade="flare", label="Si corre", span=3), shot("IMG_0622", 3.0, grade="flare"), shot("IMG_0625", 8.0, grade="flare")]
    S.append(shot("IMG_0629", 10.5, label="La squadra"))
    S.append(shot("IMG_0631", 7.0, label="La pausa"))
    # dal pomeriggio in poi anche il parlato, solo frasi intere e brevi (Ross: «i pezzi in cui si parla devono avere comunque un senso»)
    S.append(speech("IMG_0644", "chi", 0.0, "talloni", 2.84, pad_in=0.0, fi=0.0, pad_out=0.3, fy=0.30, label="16:00 Postura piedi e squat", span=2))
    S.append(shot("IMG_0645", 30.0))
    S += [shot("IMG_0646", 20.0, label="17:30 La pedana", span=2), shot("IMG_0646", 5.0)]
    S += [shot("IMG_0647", 3.0, speed=1.3, label="18:00 Tapis roulant", span=2), shot("IMG_0648", 20.0)]
    S += [shot("IMG_0649", 28.0, label="Running analysis", span=3), shot("IMG_0648", 40.0), shot("IMG_0649", 10.0)]
    S.append(shot("IMG_0650", 120.4, label="18:30 La storia di Daniela"))
    S.append(speech("IMG_0650", "tra", 136.38, "adesso", 138.26, pad_in=0.2, pad_out=0.35, fy=0.30, label="Chiusura"))   # «tra venti anni voglio che stiate meglio di adesso»
    S += [shot("IMG_0628", 40.0, label="Ci vediamo al prossimo", span=2), shot("IMG_0623", 8.0, grade="flare")]   # 0626 era la facciata della villa (location)
    # aggancio alla musica: dopo un tratto parlato (durata libera) il B-roll seguente si allunga/accorcia così che lo stacco dopo cada di nuovo sulla battuta
    cum = 0.0
    for i, s in enumerate(S):
        sp_ = s.get("speed", 1.0)
        olen = (s["e"] - s["s"]) / sp_
        if s["kind"] == "broll" and not s.get("burst") and abs(cum / BEAT - round(cum / BEAT)) > 0.02:   # la raffica del titolo (8 × 0,2 s = 3 battute) resta com'è
            target = (int(cum / BEAT) + 1) * BEAT - cum          # resto di battuta
            while target < 0.8:
                target += BEAT
            s["e"] = round(s["s"] + target * sp_, 3)
            s["snap"] = round(target, 3)
            olen = target
        cum += olen
    S.append(dict(clip="IMG_0628", s=48.0, e=56.0, kind="lib", grade="std"))                              # clip della CTA
    return S


def main():
    os.makedirs(PD, exist_ok=True)
    segs = build_segments()
    tl = M.build_master([{k: v for k, v in s.items() if k != "toks"} for s in segs], os.path.join(PD, "video.mp4"))
    for s, t in zip(segs, tl):
        s.update(ms=t["ms"], me=t["me"], n=t["n"])
    main_segs = [s for s in segs if s["kind"] != "lib"]
    lib = {s["clip"]: s["ms"] for s in segs if s["kind"] == "lib"}

    # ---- cuts: stacchi secchi (stile reference), velocità, ambiente basso sui B-roll all'aperto (niente musica)
    cuts, o = [], 0.0
    for s in main_segs:
        c = {"s": s["ms"], "e": s["me"]}
        sp_ = s.get("speed", 1.0)
        if sp_ != 1.0:
            c["speed"] = sp_
        if s["kind"] == "broll":
            # in sala Daniele parla e senza sottotitoli non deve sentirsi (niente musica a coprire): muto
            if s["clip"] in OUTDOOR and not s.get("burst"):
                c["vol"] = 0.3
            else:
                c["vol"], c["mute"] = 0.0, True
        if s.get("fy") is not None:
            c.update(frame="volto", fx=0.5, fy=s["fy"])
        s["o"], s["olen"] = o, (s["me"] - s["ms"]) / sp_
        o += s["olen"]
        cuts.append(c)
    total = o

    words = []
    for s in main_segs:
        if s["kind"] not in ("speech", "selfie"):
            continue
        for t in s["toks"]:
            if s.get("w_s", s["s"]) - 0.01 <= t["s"] <= s.get("w_e", s["e"]) + 0.01:
                words.append({"text": t["w"], "start": round(t["s"] - s["s"] + s["ms"], 3), "end": round(min(t["e"], s["e"]) - s["s"] + s["ms"], 3)})
    words.sort(key=lambda w: w["start"])

    effects, eid = [], [0]

    def obj(start, duration, sfx=None, **props):
        eid[0] += 1
        effects.append(dict(id=f"o{eid[0]}", type="obj", start=round(max(0, start), 3), duration=round(min(duration, total - start), 3), sfx=sfx, anim="cut", props=props))

    def text(start, duration, txt, y, size, color="#FFFFFF", weight=600, inA="fade", outA="fade", **extra):
        obj(start, duration, kind="text", text=txt, x=0.5, y=y, w=1000, size=size, weight=weight, color=color, align="center",
            shadow="morbida", strokeW=2, strokeColor="rgba(11,15,10,.55)", inA=inA, outA=outA, inSpeed=0.5, outSpeed=0.5, **extra)

    # ---- 1) titolo impilato su 5 righe come «a / day / in / my / life»: 4 righe fisse + l'ultima parola che cambia stile a raffica
    burst = [s for s in main_segs if s.get("burst")]
    tlen = sum(s["olen"] for s in burst)
    # velo del verde del brand sotto il titolo (Ross, 6/11 sera: «un fondo velato del verde del brand per far sì che il titolo si veda meglio»)
    obj(0, tlen, kind="shape", shape="rettangolo", fill="rgba(73,118,46,0.62)", x=0.5, y=0.5, w=1080, h=1920, inA="none", outA="none")
    text(0, tlen, "Una", 0.285, 118, "#FFFFFF", 600, inA="none", sfx="pop", outA="none")
    text(0, tlen, "giornata", 0.36, 150, LIME, 800, inA="none", outA="none")
    text(0, tlen, "di", 0.44, 118, "#FFFFFF", 600, inA="none", outA="none")
    text(0, tlen, "con Correre Naturale®", 0.635, 88, "#FFFFFF", 700, inA="none", outA="none")   # «si deve vedere decisamente meglio»
    # la parola che cambia stile come «life» nella reference (serif, corsivi, script, condensati…): 15 cambi in 1,5 s, ogni 3 fotogrammi
    STEP = tlen / 16   # 16 cambi sulla durata reale della raffica (un pezzo può avere un fotogramma in meno per gli arrotondamenti di ffmpeg)
    variants = [dict(font="Blinker", weight=800, color=LIME, upper=True), dict(font="DMSerif", italic=True, color="#FFFFFF"),
                dict(font="Pacifico", color=AZ), dict(font="Anton", color="#FFFFFF", upper=True, letter=6),
                dict(font="Playfair", italic=True, weight=700, color=CREAM), dict(font="Caveat", weight=700, color=LIME),
                dict(font="Bebas", color="#FFFFFF", upper=True, letter=10), dict(font="Lobster", color=AZ),
                dict(font="Fraunces", italic=True, weight=900, color="#FFFFFF"), dict(font="Marker", color=LIME),
                dict(font="Abril", color=CREAM), dict(font="Instrument", italic=True, color="#FFFFFF"),
                dict(font="Righteous", color=AZ, upper=True), dict(font="Oswald", weight=700, color="#FFFFFF", upper=True, letter=4),
                dict(font="Syne", weight=800, color=CREAM, upper=True), dict(font="Blinker", weight=800, color=LIME, upper=True)]
    for k, v in enumerate(variants):
        size = 150 if v.get("upper") else 168
        text(k * STEP, STEP, "workshop", 0.53, size, v["color"], v.get("weight", 400), inA="none", outA="none",
             font=v["font"], italic=v.get("italic", False), upper=v.get("upper", False), letter=v.get("letter", 0))
    # ---- 2) targhetta per scena: box verde del brand con testo bianco (Ross, 6/11 sera: «più visibile, effetto box con sfondo a contrasto»),
    #        al centro-basso, con 0,2 s di vuoto prima della targhetta dopo (come nella timeline CapCut)
    for i, s in enumerate(main_segs):
        if not s.get("label"):
            continue
        dur = sum(x["olen"] for x in main_segs[i:i + s.get("span", 1)])
        lab = s["label"]
        size = 70 if len(lab) <= 20 else 60
        obj(s["o"] + 0.05, dur - 0.25, kind="text", text=lab, x=0.5, y=s.get("ly", LABEL_Y), w=int(len(lab) * size * 0.50) + 70, size=size, weight=700,   # box che abbraccia il testo
            color="#FFFFFF", align="center", bg=GREEN, bgPad=16, bgRadius=20, shadow="morbida", inA="fade", outA="fade", inSpeed=0.5, outSpeed=0.5, sfx="pop")
    # ---- logo circolare bianco scontornato in alto a destra per tutto il reel: ombra cotta nel PNG (il box-shadow di obj disegna un rettangolo)
    obj(0, total, kind="image", src=LOGO, x=0.875, y=0.085, w=230, shadow="no", inA="fade", outA="fade", opacity=1)

    style = {
        "palette": "brand", "titleFont": "brand", "videoStyle": "vlog", "layout": "full", "filter": "none",
        "captions": {"style": "hormozi", "position": "low", "y": 0.80, "size": 0.85, "wordsPerLine": 3, "lines": 1, "alwaysOn": True,
                     "activeColor": LIME, "color": "#FFFFFF", "stroke": 4, "anim": "pop", "emphColor": LIME, "wordFx": "colore", "highlight": LIME,
                     "wordGap": 0.3, "font": "brand", "activeBase": 1.0, "activeScale": 0.06},
        "emphWords": ["talloni", "venti", "meglio"],
        "breathing": False, "cutZoom": False, "pushIn": False, "cutBlend": 0,
        "logo": False, "logoKind": "pictogramOnDark", "progressBar": False, "gradient": False, "vignette": False,
        "focusX": 0.5, "focusY": 0.35, "faceZone": {"on": True, "y0": 0.2, "y1": 0.45},
    }
    brand = json.load(open(os.path.join(RS, "clients", "correre-naturale", "brand.json"), encoding="utf-8"))
    proj = {
        "id": PID, "title": "Vlog condensato · Workshop Correre Naturale (24/10/2026, Vicenza)", "client": "correre-naturale", "origin": "inedito",
        "created": datetime.now().isoformat(timespec="seconds"),
        "source": {"file": "video.mp4", "original": "input/evento (telefono di Paola)", "duration": round(segs[-1]["me"], 3), "width": 1080, "height": 1920},
        "words": words, "removed": [], "cuts": cuts, "brand": brand,
        "settings": {"target": 0, "dynamism": 3, "silenceGap": 0.45},
        "hook": {"text": "", "style": "none"},
        "cta": {"style": "coaching", "after": True, "duration": CTA_LEN, "keyword": "WORKSHOP", "variant": "video", "textScale": 1.15, "titleTop": 380, "subTop": 610, "noteTop": 1005,
                "overlay": "linear-gradient(180deg, rgba(14,23,10,.60) 0%, rgba(14,23,10,.80) 45%, rgba(14,23,10,.92) 100%)",
                "text": "Vuoi esserci al *prossimo* workshop?", "sub": "Una giornata dal vivo con Daniele e il metodo Correre Naturale®",
                "note": "Commenta WORKSHOP: ti mando date e info", "dm": "Ecco date e info del prossimo workshop dal vivo di Correre Naturale®",
                "video": {"src": f"/progetti/{PID}/video.mp4", "from": lib["IMG_0628"]}, "sfx": None},
        "style": style, "effects": effects,
        "audio": {"music": "pop-solare-32f", "musicVolume": 0.42, "sfxVolume": 0.3, "voiceVolume": 1, "ducking": True, "sfxOn": True, "sfxOnCuts": False,
                  # ducking più profondo sotto le frasi parlate: il renderer abbassa la musica a mv×0,5 nelle finestre `voiceovers` (qui con un file muto;
                  # con il solo ducking a mv la ritrascrizione del montato perdeva metà delle parole)
                  "voiceovers": [{"src": f"/progetti/{PID}/silenzio.mp3", "at": round(s["o"], 3), "dur": round(s["olen"], 3), "volume": 0}
                                 for s in main_segs if s["kind"] in ("speech", "selfie")]},   # 7/11: musica a battuta (Ross: «suoni e musica come nella reference»)
        "caption": "", "exports": [],
    }
    os.makedirs(os.path.join(PD, "versioni"), exist_ok=True)
    f = os.path.join(PD, "project.json")
    if os.path.exists(f):
        os.replace(f, os.path.join(PD, "versioni", datetime.now().strftime("%Y%m%d-%H%M%S") + "-prima-di-claude.json"))
    json.dump(proj, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"pid": PID, "total": total, "cta": CTA_LEN, "segments": [{k: v for k, v in s.items() if k != "toks"} for s in segs]},
              open(os.path.join(WD, "meta60.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"master {segs[-1]['me']:.2f} s · uscita {total:.2f} s + CTA {CTA_LEN} s · {len(words)} parole · {len(effects)} effetti")
    for s in main_segs:
        print(f"  {s['o']:6.2f}-{s['o'] + s['olen']:6.2f}  {s['clip']:20s} {s['s']:7.2f}-{s['e']:7.2f} {s['kind']:6s} {s.get('label') or ''}")


if __name__ == "__main__":
    main()
