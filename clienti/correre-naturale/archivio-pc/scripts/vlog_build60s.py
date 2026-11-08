"""Vlog «Workshop Correre Naturale» — condensato sulla struttura della reference «a day in my life», versione con il BRANO di Ross
(7/11/2026: «Usa questo audio, il video deve durare 1 minuto al massimo, usa le riprese migliori, togli ogni altro tipo di audio o suono»).

Brano: input/musica/jalen_ngonda.wav (Jalen Ngonda, «If You Don't Want My Love», 123 bpm nominali ma il tempo oscilla: band dal vivo).
Per questo gli stacchi non stanno su una griglia fissa ma sui colpi MISURATI (librosa, work/evento/beats_jalen.json), uno stacco ogni due colpi
(≈0,98 s, come i colpi della reference ≈1,1 s), sulle posizioni forti della battuta (colpi pari).
Finestra (7/11 sera, Ross: «doveva partire dall'inizio, non dal ritornello»): dall'inizio del brano (0,0 s, primo colpo a 0,21 s) al colpo 106
(51,73 s), dove parte la CTA; 106 colpi = 53 slot: 7 per la raffica del titolo (14 colpi, 7,1 s: Ross 7/11 notte «fino a 0:06-0:07»), 46 scene.
Totale 51,7 s + CTA 8 s = 59,7 s: la CTA finisce sul primo «if you don't want my love» (56-60 s) con dissolvenza di 5 s. Prima versione (v5a, conservata come VLOG_workshop_60s_v3_ritornello.mp4): dal colpo 116
(levata del primo ritornello) al 220.
Audio: SOLO il brano. Il render ReelStudio esce muto (clip mute, niente musica, niente sfx) e il brano viene montato dopo con ffmpeg (vlog_mix60s.py),
così il volume è costante e il taglio del brano è esatto.

Uso: python scripts/vlog_build60s.py  → ReelStudio/progetti/cn-vlog_workshop60s/video.mp4 + project.json
     node scripts/rs_render.js video cn-vlog_workshop60s work/evento/VLOG60s_muto.mp4
     python scripts/vlog_mix60s.py     → output/evento/VLOG_workshop_60s.mp4
"""
import json, os, sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vlog_master as M  # noqa: E402
import vlog_build3 as B  # noqa: E402

ROOT = M.ROOT
RS = "C:/Users/roxfe/Documents/ReelStudio"
PID = "cn-vlog_workshop60s"
PD = os.path.join(RS, "progetti", PID)
WD = os.path.join(ROOT, "work", "evento")
LIME, GREEN, AZ, CREAM, INK = B.LIME, B.GREEN, B.AZ, B.CREAM, B.INK
LOGO = "/progetti/cn-vlog_workshop/foto/logo_circ_bianco_ombra.png"
CTA_LEN = 8                # 7/11 notte, Ross: «la CTA deve essere più leggibile e un po' più lunga» (era 7)
FPS = 30
LABEL_Y = 0.54             # targhette: centro a 1037 px, sopra la colonna delle icone di Instagram (da ~1150 px in giù a destra) e la fascia della didascalia
SONG = os.path.join(ROOT, "input", "musica", "jalen_ngonda.wav")
BEATS = json.load(open(os.path.join(WD, "beats_jalen.json")))["beats"]
B0, B1 = 0, 106            # colpo d'inizio e colpo della CTA. 7/11 sera, Ross: «doveva partire dall'inizio, non dal ritornello» → dal primo colpo
                           # (il brano parte da 0,0 s del file); CTA al colpo 106 (51,7 s) + 8 s = 59,7 s, finisce sul primo «if you don't want my love»
BURST_BEATS = 8            # 7/11 notte, Ross: prima «fino a 0:06-0:07», poi «dura troppo, massimo a 5 secondi, segui il ritmo della musica» → 8 colpi =
                           # due battute intere (4,2 s): 16 inquadrature da mezzo colpo (≈7 fotogrammi, come i clip da 0,17 s della reference) e la
                           # parola «workshop» che cambia stile a ogni inquadratura
LEAD = 0.015               # i colpi di librosa stanno ~15 ms dopo il picco dell'attacco: taglio un pelo prima del colpo
T0 = 0.0 if B0 == 0 else BEATS[B0] - LEAD   # istante del brano che corrisponde a 0 del montato


def cut_frames():
    """Fotogrammi (dall'inizio del montato) in cui cade ogni stacco: colpi pari da B0 a B1, tempi relativi a T0; il primo è sempre 0."""
    F = [round((BEATS[i] - LEAD - T0) * FPS) for i in range(B0, B1 + 1, 2)]
    F[0] = 0
    return F


def burst_frames():
    """Fotogrammi dei cambi d'inquadratura della raffica: ogni mezzo colpo da B0 a B0+BURST_BEATS (l'ultimo coincide con F[BURST_BEATS//2])."""
    t = []
    for i in range(B0, B0 + BURST_BEATS):
        t += [BEATS[i], (BEATS[i] + BEATS[i + 1]) / 2]
    t.append(BEATS[B0 + BURST_BEATS])
    G = [round((x - LEAD - T0) * FPS) for x in t]
    G[0] = 0
    return G


def scenes():
    """Scene in ordine: (clip, inizio sorgente, opzioni). `slots` = quanti stacchi dura (default 1 ≈ 0,98 s). Etichette come le scrive Ross."""
    sh = lambda clip, s, **kw: dict(clip=clip, s=float(s), **kw)
    # 50 slot (7/11, Ross: «usa le riprese migliori»): le 34 scene della versione precedente + 16 inquadrature scelte sui fogli di fotogrammi
    # (work/evento/clipsheets): dettagli, volti, corsa verso camera; niente inquadrature della sola location, niente «sera prima».
    # 7/11 notte: raffica di 4,2 s e CTA di 8 s → 49 slot per le scene (tolte: sala vuota, Daniele tra i partecipanti, 0629@10.5, 0648@40, 0599@2.7);
    # nessuna targhetta sotto i 2 stacchi (≈1,95 s): Ross, «alcuni cambi di box sono troppo veloci, come nel caso di Daniela»
    S = []
    S += [sh("IMG_0598", 15.0, speed=2.0, label="9:30\nCheck in", span=3), sh("IMG_0598", 26.5), sh("IMG_0600", 0.8)]                      # Daniele entra, al banco, piedi sulla tavoletta
    S += [sh("IMG_0606", 1.0, label="10:00\nLezione Teorica", span=3), sh("IMG_0604", 9.0), sh("IMG_0606", 23.0)]                                 # Daniele sul palco, rullo, esercizio a terra
    S += [sh("IMG_0609", 10.0, speed=1.6, label="Riscaldamento", span=3), sh("IMG_0611", 8.0), sh("IMG_0611", 22.0)]
    S += [sh("IMG_0627", 1.5, label="12:30 Prove di corsa", span=3), sh("wa_gruppo_cammino", 6.8), sh("IMG_0627", 10.0)]                       # Daniele mostra, corre verso camera, il gruppo filma
    S += [sh("IMG_0612", 3.0, grade="flare"), sh("IMG_0614", 5.7, grade="flare"), sh("IMG_0613", 21.3, grade="flare")]   # + un corridore
    S += [sh("IMG_0620", 99.0, grade="flare", zoom=1.12, zx=0.62, zy=0.5, label="La lezione", span=3), sh("IMG_0620", 228.0, grade="flare"), sh("IMG_0620", 45.0, grade="flare")]
    S += [sh("wa_drill_prato", 4.0, label="Esercizi", span=3), sh("IMG_0624", 14.6), sh("IMG_0613", 30.0, grade="flare")]
    S += [sh("IMG_0622", 0.5, grade="flare", label="Si corre", span=4), sh("IMG_0621", 12.5, grade="flare"), sh("IMG_0625", 8.0, grade="flare"), sh("IMG_0623", 6.0, grade="flare")]   # basso angolo da dietro, verso camera, il gruppo largo, il gruppo
    S += [sh("IMG_0625", 17.5, grade="flare", label="La squadra", span=3), sh("IMG_0628", 15.0), sh("IMG_0629", 13.8)]                    # volti nel sole
    S += [sh("IMG_0631", 7.0, label="Pausa", span=2), sh("IMG_0631", 11.0)]
    S += [sh("IMG_0644", 0.0, fy=0.30, label="16:00 Postura\npiedi\ne squat", span=3), sh("IMG_0645", 13.0), sh("IMG_0645", 30.0)]        # Daniele allo schermo, mani sui piedi, squat
    S += [sh("IMG_0646", 20.0, label="17:30 La pedana", span=2), sh("IMG_0646", 5.0, slots=2)]                                                  # Daniele in squat resta 2 stacchi. Titoli delle targhette dettati da Ross (7/11 notte)
    S += [sh("IMG_0647", 3.0, speed=1.3, label="18:00 Running analysis", span=3), sh("IMG_0647", 7.5), sh("IMG_0648", 20.0)]
    S += [sh("IMG_0649", 28.0), sh("IMG_0650", 95.5), sh("IMG_0649", 10.0)]                             # + Daniele che corre sul tapis
    S.append(sh("IMG_0650", 120.4, label="18:30 Testimonianze", slots=2))                                                           # 7/11 notte, Ross: «cambi di box troppo veloci, come Daniela» → 2 stacchi
    S.append(sh("IMG_0650", 136.4, fy=0.30, label="Chiusura", slots=2))                                                                    # Daniele in primo piano, un respiro (2 stacchi) prima del finale
    S += [sh("IMG_0628", 40.0, label="Ci vediamo\nal prossimo?", span=3), sh("IMG_0629", 2.0), sh("IMG_0623", 8.0, grade="flare")]          # volti che corrono nel sole
    return S


# raffica del titolo: 16 inquadrature (una ogni mezzo colpo, ≈7 fotogrammi), un'anteprima della giornata in ordine; momenti diversi da quelli delle scene
BURST = [("IMG_0599", 3.0), ("IMG_0600", 1.8), ("IMG_0604", 5.0), ("IMG_0611", 9.5), ("wa_gruppo_cammino", 7.4), ("IMG_0612", 3.0), ("IMG_0613", 30.5),
         ("wa_drill_prato", 4.5), ("IMG_0622", 1.2), ("IMG_0621", 13.2), ("IMG_0629", 14.6), ("IMG_0645", 30.5), ("IMG_0646", 20.0), ("IMG_0648", 40.0),
         ("IMG_0650", 96.5), ("IMG_0628", 45.0)]
FLARE = {"IMG_0612", "IMG_0613", "IMG_0614", "IMG_0620", "IMG_0621", "IMG_0622", "IMG_0623", "IMG_0625"}


def build_segments():
    F = cut_frames()
    G = burst_frames()
    assert G[-1] == F[BURST_BEATS // 2] and len(G) - 1 == len(BURST), (G[-1], F[BURST_BEATS // 2], len(G), len(BURST))
    S = []
    for k, (clip, s) in enumerate(BURST):
        n = G[k + 1] - G[k]
        S.append(B.broll(clip, s, s + n / FPS, burst=True, n_want=n, grade="flare" if clip in FLARE else "std"))
    sc = scenes()
    k = BURST_BEATS // 2
    for s in sc:
        slots = s.pop("slots", 1)
        if k + slots > len(F) - 1:
            raise SystemExit(f"troppe scene: finiscono gli slot a {s['clip']}")
        n = F[k + slots] - F[k]                      # fotogrammi in USCITA
        n_src = round(n * s.get("speed", 1.0))       # fotogrammi del sorgente (la velocità la applica ReelStudio sul master)
        s["speed"] = n_src / n                       # velocità esatta: n_src / speed = n fotogrammi in uscita
        seg = B.broll(s.pop("clip"), s.pop("s"), 0.0, **s)
        seg["e"] = round(seg["s"] + n_src / FPS, 4)
        seg["n_want"] = n_src
        seg["n_out"] = n
        S.append(seg)
        k += slots
    if k != len(F) - 1:
        raise SystemExit(f"scene insufficienti: usati {k} slot su {len(F) - 1}")
    S.append(dict(clip="IMG_0628", s=48.0, e=48.0 + CTA_LEN + 1, kind="lib", grade="std"))   # clip della CTA (un secondo di margine)
    return S


def main():
    os.makedirs(PD, exist_ok=True)
    segs = build_segments()
    tl = M.build_master([{k: v for k, v in s.items() if k != "toks"} for s in segs], os.path.join(PD, "video.mp4"))
    for s, t in zip(segs, tl):
        s.update(ms=t["ms"], me=t["me"], n=t["n"])
        if s.get("n_want") is not None and s["n"] != s["n_want"]:
            print(f"ATTENZIONE: {s['clip']} {s['s']:.2f} ha {s['n']} fotogrammi invece di {s['n_want']}")
    main_segs = [s for s in segs if s["kind"] != "lib"]
    lib = {s["clip"]: s["ms"] for s in segs if s["kind"] == "lib"}

    cuts, o = [], 0.0
    for s in main_segs:
        c = {"s": s["ms"], "e": s["me"], "vol": 0.0, "mute": True}     # solo il brano: tutto il resto muto
        sp_ = s.get("speed", 1.0)
        if sp_ != 1.0:
            c["speed"] = sp_
        if s.get("fy") is not None:
            c.update(frame="volto", fx=0.5, fy=s["fy"])
        s["o"], s["olen"] = o, s["n"] / sp_ / FPS
        o += s["olen"]
        cuts.append(c)
    total = o

    effects, eid = [], [0]

    def obj(start, duration, **props):
        eid[0] += 1
        effects.append(dict(id=f"o{eid[0]}", type="obj", start=round(max(0, start), 3), duration=round(min(duration, total - start), 3), sfx=None, anim="cut", props=props))

    def text(start, duration, txt, y, size, color="#FFFFFF", weight=600, inA="fade", outA="fade", **extra):
        obj(start, duration, kind="text", text=txt, x=0.5, y=y, w=1000, size=size, weight=weight, color=color, align="center",
            shadow="morbida", strokeW=2, strokeColor="rgba(11,15,10,.55)", inA=inA, outA=outA, inSpeed=0.5, outSpeed=0.5, **extra)

    # 1) titolo impilato su 5 righe con velo verde e l'ultima parola che cambia stile a raffica (come la reference)
    burst = [s for s in main_segs if s.get("burst")]
    tlen = sum(s["olen"] for s in burst)
    obj(0, tlen, kind="shape", shape="rettangolo", fill="rgba(73,118,46,0.62)", x=0.5, y=0.5, w=1080, h=1920, inA="none", outA="none")
    text(0, tlen, "Una", 0.285, 118, "#FFFFFF", 600, inA="none", outA="none")
    text(0, tlen, "giornata", 0.36, 150, LIME, 800, inA="none", outA="none")
    text(0, tlen, "di", 0.44, 118, "#FFFFFF", 600, inA="none", outA="none")
    text(0, tlen, "con Correre Naturale®", 0.635, 88, "#FFFFFF", 700, inA="none", outA="none")
    variants = [dict(font="Blinker", weight=800, color=LIME, upper=True), dict(font="DMSerif", italic=True, color="#FFFFFF"),
                dict(font="Pacifico", color=AZ), dict(font="Anton", color="#FFFFFF", upper=True, letter=6),
                dict(font="Playfair", italic=True, weight=700, color=CREAM), dict(font="Caveat", weight=700, color=LIME),
                dict(font="Bebas", color="#FFFFFF", upper=True, letter=10), dict(font="Lobster", color=AZ),
                dict(font="Fraunces", italic=True, weight=900, color="#FFFFFF"), dict(font="Marker", color=LIME),
                dict(font="Abril", color=CREAM), dict(font="Instrument", italic=True, color="#FFFFFF"),
                dict(font="Righteous", color=AZ, upper=True, size=118), dict(font="Oswald", weight=700, color="#FFFFFF", upper=True, letter=4),
                dict(font="Bangers", color=CREAM, upper=True, letter=6)]
    # un cambio di stile per ogni inquadratura della raffica (28, sui mezzi colpi); i 15 stili girano, mai due uguali di seguito
    for k, s in enumerate(burst):
        v = variants[k % len(variants)]
        size = v.get("size") or (150 if v.get("upper") else 168)   # Righteous maiuscolo a 150 px usciva dal bordo; Syne (troppo largo) sostituito da Bangers (7/11 notte)
        text(s["o"], s["olen"], "workshop", 0.53, size, v["color"], v.get("weight", 400), inA="none", outA="none",
             font=v["font"], italic=v.get("italic", False), upper=v.get("upper", False), letter=v.get("letter", 0))
    # 2) targhette: box verde del brand con testo bianco, 0,2 s di vuoto prima della successiva (nessun suono). 7/11 notte, Ross: «più leggibili,
    #    rispetta gli spazi di visione di Instagram» → 84 px (le lunghe su due righe), box più larga, centro a y 0,54: sta sopra la colonna delle
    #    icone (destra, da ~1150 px) e la fascia della didascalia (da ~1500 px); larghezza max 900 px, dentro i margini laterali
    for i, s in enumerate(main_segs):
        if not s.get("label"):
            continue
        dur = sum(x["olen"] for x in main_segs[i:i + s.get("span", 1)])
        lab = s["label"]
        size = 84
        w = min(960, int(max(len(l) for l in lab.split("\n")) * size * 0.50) + 90)   # 7/11 notte: titoli di Ross («12:30 Prove di corsa» su una riga), margini 60 px
        obj(s["o"] + 0.05, dur - 0.25, kind="text", text=lab, x=0.5, y=s.get("ly", LABEL_Y), w=w, size=size, weight=700, lineH=1.12,
            color="#FFFFFF", align="center", bg=GREEN, bgPad=22, bgRadius=26, shadow="morbida", inA="fade", outA="fade", inSpeed=0.5, outSpeed=0.5)
    # 3) logo circolare bianco scontornato
    obj(0, total, kind="image", src=LOGO, x=0.875, y=0.085, w=230, shadow="no", inA="fade", outA="fade", opacity=1)

    style = {
        "palette": "brand", "titleFont": "brand", "videoStyle": "vlog", "layout": "full", "filter": "none",
        "captions": {"style": "hormozi", "position": "low", "y": 0.80, "size": 0.85, "wordsPerLine": 3, "lines": 1, "alwaysOn": False,
                     "activeColor": LIME, "color": "#FFFFFF", "stroke": 4, "anim": "pop", "font": "brand"},
        "emphWords": [], "breathing": False, "cutZoom": False, "pushIn": False, "cutBlend": 0,
        "logo": False, "logoKind": "pictogramOnDark", "progressBar": False, "gradient": False, "vignette": False,
        "focusX": 0.5, "focusY": 0.35, "faceZone": {"on": True, "y0": 0.2, "y1": 0.45},
    }
    brand = json.load(open(os.path.join(RS, "clients", "correre-naturale", "brand.json"), encoding="utf-8"))
    proj = {
        "id": PID, "title": "Vlog condensato · Workshop Correre Naturale (24/10/2026, Vicenza) · brano Jalen Ngonda", "client": "correre-naturale", "origin": "inedito",
        "created": datetime.now().isoformat(timespec="seconds"),
        "source": {"file": "video.mp4", "original": "input/evento (telefono di Paola)", "duration": round(segs[-1]["me"], 3), "width": 1080, "height": 1920},
        "words": [], "removed": [], "cuts": cuts, "brand": brand,
        "settings": {"target": 0, "dynamism": 3, "silenceGap": 0.45},
        "hook": {"text": "", "style": "none"},
        # CTA (7/11 notte, Ross: «più leggibile e un po' più lunga»): 8 s, testi al 135 %, frasi più corte su una riga, fondo più scuro;
        # icone e «Segui» alzati (iconsTop/followTop) così tutto finisce sopra i ~1500 px coperti dalla didascalia di Instagram
        "cta": {"style": "coaching", "after": True, "duration": CTA_LEN, "keyword": "WORKSHOP", "variant": "video", "textScale": 1.35, "titleTop": 330, "subTop": 640, "noteTop": 1010,
                "iconsTop": 1120, "followTop": 1400,
                "overlay": "linear-gradient(180deg, rgba(14,23,10,.70) 0%, rgba(14,23,10,.86) 45%, rgba(14,23,10,.94) 100%)",
                "text": "Vuoi esserci al *prossimo* workshop?", "sub": "Una giornata dal vivo con Daniele",
                "note": "Commenta WORKSHOP per date e info", "dm": "Ecco date e info del prossimo workshop dal vivo di Correre Naturale®",
                "video": {"src": f"/progetti/{PID}/video.mp4", "from": lib["IMG_0628"]}, "sfx": None},
        "style": style, "effects": effects,
        "audio": {"music": "", "musicVolume": 0, "sfxVolume": 0, "voiceVolume": 0, "ducking": False, "sfxOn": False, "sfxOnCuts": False, "voiceovers": []},
        "caption": "", "exports": [],
    }
    os.makedirs(os.path.join(PD, "versioni"), exist_ok=True)
    f = os.path.join(PD, "project.json")
    if os.path.exists(f):
        os.replace(f, os.path.join(PD, "versioni", datetime.now().strftime("%Y%m%d-%H%M%S") + "-prima-di-claude.json"))
    json.dump(proj, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    F = cut_frames()
    json.dump({"pid": PID, "total": total, "cta": CTA_LEN, "song": SONG, "song_start": round(T0, 4), "beat0": B0, "beat1": B1,
               "cut_frames": F, "segments": [{k: v for k, v in s.items() if k != "toks"} for s in segs]},
              open(os.path.join(WD, "meta60s.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"master {segs[-1]['me']:.2f} s - uscita {total:.2f} s + CTA {CTA_LEN} s = {total + CTA_LEN:.2f} s - {len(effects)} effetti - stacchi {len(F) - 1}")
    for s in main_segs:
        print(f"  {s['o']:6.2f}-{s['o'] + s['olen']:6.2f} n={s['n']:2d} {s['clip']:18s} {s['s']:7.2f}-{s['e']:7.2f} x{s.get('speed', 1.0):<4} {s.get('label') or ''}")


if __name__ == "__main__":
    main()
