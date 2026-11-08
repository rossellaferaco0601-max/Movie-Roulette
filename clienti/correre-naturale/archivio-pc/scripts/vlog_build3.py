"""Vlog «Workshop Correre Naturale» — versione 3 (correzioni di Ross del 5/11 sera, dopo la v2).

Uso: python scripts/vlog_build3.py  → ReelStudio/progetti/cn-vlog_workshop/video.mp4 + project.json
     node scripts/rs_render.js video cn-vlog_workshop output/evento/VLOG_workshop_v3.mp4

Differenze dalla v2:
- qualità: le clip iPhone sono HDR (HLG) → tone mapping a BT.709 in vlog_master (prima uscivano piatte e scure);
- hook più lungo (7 stacchi) a macchina da scrivere su 6 righe, WORKSHOP e CORRERE NATURALE grandi (hook.lines, patch Reel.tsx);
- logo circolare su disco crema in alto a destra; programma della giornata (con data e luogo) subito dopo il selfie, prima del check-in;
- orari tondi (9:30, 10:00, 12:30, 16:00, 17:30, 18:00, 18:30); polaroid «LA SQUADRA» in maiuscolo (niente «pausa sui gradini»);
- tagli più larghi: pad 0,25 s prima / 0,35 s dopo, ridotti in automatico se c'è una parola vicina (niente parole mozzate);
- più «Piedi e postura» (0644, 0645, 0646, 0649 con il parlato di Daniele) e targhette brevi; sticker «la sera prima» grande;
- sottotitoli: parola attiva meno ingrandita (activeScale) e più spazio (wordGap) → niente sovrapposizioni;
- testimonianze dal sito (Monica, Andrea, Beatrice) prima della storia di Daniela; CTA 10 s con testi più grandi e sfondo più scuro.

v4 (7/11, feedback di Oscar via Ross: «esegui tutte queste modifiche e metti la stessa musica del video corto»):
- voce di Daniele dai primissimi secondi: sotto l'hook (7 stacchi + titolo a macchina da scrivere) parte in voce fuori campo la frase del selfie
  «È da un po' che siamo fermi, quindi domani sarà una giornata scoppiettante» (fx/vo_vigilia.mp3, con sottotitoli), poi il selfie come prima;
- musica: Jalen Ngonda, «If You Don't Want My Love» (lo stesso brano del condensato), letto di 161 s costruito da vlog_music_bed (0→128,8 s poi dalla
  levata del secondo ritornello 105,4 s, giunta sui colpi misurati, dissolvenza di 4 s sul finale), volume basso (0,11; sotto il parlato con ducking);
- meno effetti sonori: restano solo gli whoosh dei capitoli, lo scatto delle polaroid, l'impatto del timbro FALSO e il pop del 170-180; via i pop
  delle targhette/etichette/sticker/programma, la tastiera dell'hook, i suoni di freccia, terzo inferiore, palco e parole cinetiche; CTA con 4 suoni
  invece di 10 (cta.sfxLite); volume sfx 0,32;
- logo circolare senza l'ombra quadrata (era il box-shadow dell'immagine: shadow «no»).
"""
import json, os, sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vlog_master as M  # noqa: E402
import vlog_build as V1  # noqa: E402
from vlog_build import words_of, find  # noqa: E402  (parole large-v3 + correzioni a mano)
V1.REPLACE.setdefault("IMG_0606", []).append((24.0, 24.1, []))   # la «e» dopo «muoversi» non entra nei sottotitoli
V1.WORDFIX.setdefault("IMG_0646", []).extend([("abilità", "abilità")])
V1.WORDFIX.setdefault("IMG_0649", []).extend([("butto", "busto")])

ROOT = M.ROOT
RS = "C:/Users/roxfe/Documents/ReelStudio"
PID = "cn-vlog_workshop"
PD = os.path.join(RS, "progetti", PID)
WD = os.path.join(ROOT, "work", "evento")
FPS = 30
LIME, GREEN, AZ, CREAM, INK = "#95FF00", "#49762E", "#B8D7EA", "#F4F1E5", "#0B0F0A"
FOTO = f"/progetti/{PID}/foto"
FX = f"/progetti/{PID}/fx"
LOGO_DISCO = f"{FOTO}/logo_disco.png"
CTA_LEN = 10
# v4: voce fuori campo sotto l'hook, estratta da wa_daniele_vigilia 29,48-34,16 s (fx/vo_vigilia.mp3, -16 LUFS, dissolvenze 0,12/0,28)
VO_AT, VO_CUT, VO_LEN, VO_SRC0, VO_SRC1 = 0.25, 29.48, 4.68, 29.5, 33.9
WIN_LAG = 0.0    # era 0,37: il «ritardo della finestra» era in realtà la deriva dei timestamp del master (priming AAC nel concat), corretta in vlog_master


# ------------------------------------------------------------------ scaletta
def speech(clip, w0, t0, w1, t1, pad_in=0.4, pad_out=0.35, clamp_out=True, **kw):   # Whisper segna gli inizi in ritardo di 0,1-0,3 s: attacco largo
    """Tratto parlato da parola a parola. I margini (pad) si riducono da soli se prima/dopo c'è un'altra parola vicina,
    così il taglio non mozza né la frase scelta né quella accanto (Ross, 5/11: «molte parole sono tagliate»)."""
    toks = words_of(clip)
    a, b = find(toks, w0, t0), find(toks, w1, t1)
    prev = [t for t in toks if t["s"] < a["s"] - 0.01]      # anche parole che Whisper fa sovrapporre alla prima scelta
    nxt = [t for t in toks if t["s"] > b["s"] + 0.01]
    # 5/11 sera: i pezzi hanno dissolvenza audio (fi 0,12 s / fo 0,28 s, vlog_master). Quindi il margine può entrare un po'
    # nella parola accanto: in uscita fino a 0,30 s oltre l'attacco della parola dopo (che sfuma), in entrata 0,12 s nella coda
    # della parola prima. Così la parola scelta resta sempre intera (Whisper chiude le parole 0,05-0,15 s in anticipo).
    if prev:
        pad_in = max(0.05, min(pad_in, a["s"] - prev[-1]["e"] + 0.12))
    if nxt and clamp_out:
        pad_out = max(0.30, min(pad_out, nxt[0]["s"] - b["e"] + 0.30))
    kw.setdefault("grade", "std")
    # w_s/w_e: solo le parole da `w0` a `w1` entrano nei sottotitoli (non quelle accanto che cadono nel margine)
    return dict(clip=clip, s=round(max(0, a["s"] - pad_in), 3), e=round(b["e"] + pad_out, 3), kind="speech", toks=toks, w_s=a["s"], w_e=b["s"], **kw)


def broll(clip, s, e, speed=1.0, grade="std", **kw):
    return dict(clip=clip, s=float(s), e=float(e), kind="broll", speed=speed, grade=grade, **kw)


# testimonianze dal sito (riempite in TESTI dopo la trascrizione): (clip, parola iniziale, t, parola finale, t, nome)
# NB: sono le testimonianze del percorso online (Running School) pubblicate nella pagina del workshop, non del workshop in sé:
# a schermo «dicono di Correre Naturale», mai «del workshop». Nomi dai titoli Vimeo del sito.
TESTI = []   # 5/11 sera, Ross: via il blocco delle testimonianze, si passa direttamente alla storia di Daniela (frasi scelte nelle versioni precedenti del file)


def build_segments():
    S = []
    # 0) hook: 7 stacchi rapidi (0,85 s) sotto la scritta a macchina da scrivere
    S += [broll("IMG_0614", 5.0, 5.85, grade="flare"), broll("IMG_0599", 2.0, 2.85), broll("IMG_0624", 14.6, 15.45), broll("IMG_0647", 3.5, 4.35),
          broll("IMG_0612", 3.0, 3.85, grade="flare"), broll("IMG_0609", 10.0, 10.85), broll("IMG_0598", 15.0, 15.85)]
    # 1) la sera prima: selfie (scarabocchio + punch-in della skill, fxClip)
    sel = speech("wa_daniele_vigilia", "ragazzi", 0.54, "naturale", 6.78, pad_in=0.3, pad_out=0.2, fy=0.42)
    sel["kind"] = "selfie"
    S.append(sel)
    # 2) programma della giornata (pillole brand) sulla villa, poi check-in 9:30
    S.append(broll("IMG_0615", 11.0, 16.5, programma=True))   # la villa (luogo) sotto il programma
    S += [broll("IMG_0598", 15.0, 19.0, speed=2.0, chapter=("9:30", "CHECK IN")), broll("IMG_0599", 2.7, 5.2), broll("IMG_0600", 10.0, 12.6),
          broll("IMG_0601", 3.0, 6.2, chapter=("10:00", "LEZIONE IN SALA"), label="Daniele apre la giornata")]
    S.append(speech("IMG_0606", "se", 16.4, "muoversi", 23.5, fy=0.30, label="il corpo deve riscoprire come muoversi"))
    S.append(broll("IMG_0609", 10.0, 14.0, speed=1.6, label="esercizi in piedi, tutti insieme"))
    # 3) prato: prove di corsa, poi la lezione (voce guida con B-roll sopra)
    S += [broll("IMG_0612", 3.0, 6.0, grade="flare", chapter=("12:30", "ANALISI TECNICA DELLA CORSA")), broll("IMG_0614", 5.7, 8.0, grade="flare", label="prove di corsa, una alla volta")]
    S.append(speech("IMG_0620", "io", 95.8, "pensarlo", 102.74, fy=0.33, grade="flare", zoom=1.12, zx=0.62, zy=0.5, chapter=("12:45", "LA LEZIONE")))
    S.append(speech("IMG_0620", "ritmo", 207.36, "umano", 213.76, pad_in=0.6, fy=0.30, grade="flare"))
    S.append(broll("IMG_0624", 14.0, 16.4))
    S.append(speech("IMG_0620", "perché", 239.26, "corsa", 242.66, pad_out=0.4, fy=0.33, grade="flare"))
    # 4) pomeriggio: piedi e postura (più girato + parlato di Daniele), pedana, running analysis
    S.append(speech("IMG_0644", "chi", 0.0, "su", 12.12, pad_in=0.0, fi=0.0, fy=0.30, chapter=("16:00", "PIEDI E POSTURA"), tag="chi carica i talloni?"))   # parla da 0,0: niente fade in
    S.append(broll("IMG_0645", 30.0, 33.0, label="lavoro sui piedi, a terra"))
    S.append(speech("IMG_0645", "questo", 37.04, "l", 48.96, fy=0.30, tag="il piede si rilassa"))
    S.append(broll("IMG_0646", 20.0, 23.4, chapter=("17:30", "ANALISI DELL'APPOGGIO"), label="la pressione del piede sulla pedana"))
    S += [broll("IMG_0647", 3.0, 6.6, speed=1.3, chapter=("18:00", "RUNNING ANALYSIS"), label="corsa sul tapis roulant, ripresa e analizzata")]
    S.append(speech("IMG_0649", "ancora", 27.0, "appoggio", 33.94, fy=0.30, tag="stessa tecnica, più veloce"))   # «ancora perfetta. Vedete che…»
    S.append(broll("IMG_0648", 20.0, 22.6))
    # 5) testimonianze dal sito (chi l'ha già fatto), poi 6) Daniela e 7) chiusura di Daniele al gruppo
    for clip, w0, t0, w1, t1, nome in TESTI:
        # i video del sito hanno i sottotitoli impressi in basso: punch-in 1,35 ancorato in alto li lascia fuori dall'inquadratura
        # senza frame «volto» né punch-in: la clip va nel palco crema (stageCard) con la finestra sulla parte alta,
        # così i sottotitoli impressi nei video originali restano fuori e il viso resta libero
        S.append(speech(clip, w0, t0, w1, t1, testi=nome))
    S.append(speech("IMG_0650", "ero", 0.0, "miracolato", 9.46, pad_in=0.0, fi=0.0, fy=0.30, chapter=("18:30", "LA STORIA DI DANIELA")))   # «Ero» a 0,0: niente fade in
    S.append(speech("IMG_0650", "e", 118.62, "minuti", 125.32, pad_in=0.1, fy=0.30))
    S.append(speech("IMG_0650", "ragazzi", 133.62, "questo", 142.70, pad_out=0.9, fo=0.55, clamp_out=False, fy=0.30))   # coda lunga e sfumata prima della CTA (Ross: «tagliato bruscamente»)
    # libreria (fuori dai cuts): B-roll per gli stacchi a J e clip della CTA
    S += [dict(clip="IMG_0623", s=6.0, e=9.5, kind="lib", grade="flare"), dict(clip="IMG_0621", s=4.0, e=7.0, kind="lib", grade="flare"),
          dict(clip="IMG_0628", s=45.0, e=56.0, kind="lib", grade="std")]
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
            c["vol"] = 0.22 if s["clip"] in ("IMG_0612", "IMG_0614", "IMG_0624", "IMG_0623", "IMG_0615") and sp_ == 1.0 else 0.0
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

    # ---- parole (tempi del MASTER: ReelStudio li mappa in uscita attraverso i cuts, anche con speed)
    words = []
    for s in main_segs:
        if s["kind"] not in ("speech", "selfie"):
            continue
        for t in s["toks"]:
            if s.get("w_s", s["s"] - 0.05) - 0.01 <= t["s"] <= s.get("w_e", s["e"]) + 0.01:
                words.append({"text": t["w"], "start": round(t["s"] - s["s"] + s["ms"], 3), "end": round(min(t["e"], s["e"]) - s["s"] + s["ms"], 3)})
    # v4: parole della voce fuori campo sotto l'hook (i 7 stacchi sono i primi pezzi del master a velocità 1: tempo master = tempo d'uscita)
    for t in words_of("wa_daniele_vigilia"):
        if VO_SRC0 <= t["s"] <= VO_SRC1:
            words.append({"text": t["w"], "start": round(VO_AT + t["s"] - VO_CUT, 3), "end": round(VO_AT + min(t["e"], VO_CUT + VO_LEN) - VO_CUT, 3)})
    words.sort(key=lambda w: w["start"])

    def ws(seg, word, near):
        return out_t(seg, find(seg["toks"], word, near)["s"])

    by = {}
    for s in main_segs:
        by.setdefault(s["clip"], []).append(s)
    sel = by["wa_daniele_vigilia"][0]
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
    def label(start, duration, text, y=0.70, sfx=None, size=40):
        obj(start, duration, sfx=sfx, kind="text", text=text, x=0.5, y=y, w=940, size=size, weight=800, color=GREEN, align="center",
            bg="rgba(244,241,229,.96)", bgPad=16, bgRadius=24, inA="slideUp", outA="fade", lineH=1.1)

    # targhetta breve (verde, testo bianco) con un commento sul gesto
    def tag(start, duration, text, x=0.5, y=0.62, rot=-3, sfx=None):   # v4: niente pop (Oscar: troppi suoni)
        obj(start, duration, sfx=sfx, kind="text", text=text, x=x, y=y, w=760, size=44, weight=800, color="#FFFFFF", upper=True, letter=1,
            align="center", bg=GREEN, bgPad=14, bgRadius=18, rot=rot, inA="pop", outA="fade", shadow="morbida")

    # sticker (pillola ruotata, azzurro/verde)
    def sticker(start, duration, text, x, y, rot=-5, bg=AZ, color=INK, size=34, w=640, sfx=None):
        obj(start, duration, sfx=sfx, kind="text", text=text, x=x, y=y, w=w, size=size, weight=800, color=color, upper=True, letter=1,
            align="center", bg=bg, bgPad=12, bgRadius=18, rot=rot, inA="pop", outA="fade", shadow="morbida")

    # polaroid (PNG 720×900 fatta da vlog_polaroid.py), più grande della v2
    def polaroid(start, duration, name, x=0.5, y=0.52, rot=-6, w=680):
        obj(start, duration, sfx="scatto", kind="image", src=f"{FOTO}/p_{name}.png", x=x, y=y, w=w, rot=rot, shadow="forte", inA="pop", outA="fade")

    # ---- testimonianze: un solo palco crema per tutto il blocco; la finestra (parte alta della clip, senza i sottotitoli impressi)
    # suona il master in continuità perché i 4 pezzi sono consecutivi nel master. Parte/finisce 0,25 s oltre il blocco così la
    # dissolvenza del palco cade sui pezzi vicini e non scopre mai la clip originale a tutto schermo.
    tes = [s for s in main_segs if s.get("testi")]
    if tes:
        t0, t1 = tes[0]["o"] - 0.25, tes[-1]["o"] + tes[-1]["olen"] + 0.25
        add("stageCard", t0, t1 - t0, sfx="pop", kicker="Dicono di Correre Naturale", kickerFont="brand", y=0.05, size=84, chart=False, lines=[], at=[],
            win={"t": round(tes[0]["ms"] - 0.25 + WIN_LAG, 3), "x": 0.06, "y": 0.205, "w": 0.88, "h": 0.535, "px": 0.5, "py": 0.0})
    # capitolo grande: orario + attività (firma del vlog); etichette; targhette
    last_name = [None]
    for s in main_segs:
        if s.get("chapter"):
            num, title = s["chapter"]
            pos = "lower" if s["clip"] in ("IMG_0650",) else "top"
            d0 = 0.4 if s["clip"] == "IMG_0650" else 0.05   # dopo Monica (primo piano): il capitolo parte a dissolvenza finita, non sul suo viso
            add("chapter", s["o"] + d0, min(2.8, s["olen"] + 0.4 - d0), sfx="whoosh", anim="slideLeft", position=pos, number=num, title=title, color=AZ,
                size=62 if len(title) <= 20 else 46)   # titoli lunghi («ANALISI TECNICA DELLA CORSA») più piccoli
        if s.get("label"):
            d0 = 1.3 if s.get("chapter") else 0.25
            ld = s["olen"] - d0 - 0.2 if s["clip"] != "IMG_0646" else 1.5   # sulla pedana etichetta e freccia brevi (Ross)
            label(s["o"] + d0, ld, s["label"], y=0.70 if s["kind"] == "broll" else 0.66)
        if s.get("tag"):
            d0 = 1.4 if s.get("chapter") else 0.5
            tag(s["o"] + d0, min(3.2, s["olen"] - d0 - 0.2), s["tag"], x=0.5, y=0.63, rot=-3 if s["clip"] != "IMG_0649" else 3)
        if s.get("testi") and s["testi"] != last_name[0]:   # nome sopra la finestra del palco (uno per persona)
            obj(s["o"] + 0.1, s["olen"] - 0.1 if s["testi"] != (main_segs[main_segs.index(s) + 1].get("testi")) else s["olen"] + main_segs[main_segs.index(s) + 1]["olen"] - 0.1,
                sfx="pop", kind="text", text=s["testi"].upper(), x=0.24, y=0.135, w=460, size=64, weight=800, color=INK, align="left", inA="pop", outA="fade")
        last_name[0] = s.get("testi")

    # ---- hook: cornice REC sugli stacchi rapidi (la scritta a macchina da scrivere è hook.lines, stile typewriter)
    hook_len = sel["o"]
    add("rec", 0, hook_len, sfx=None)
    # ---- selfie: effetto skill (scarabocchio + punch-in) + sticker grande
    add("fxClip", sel["o"], sel["olen"], sfx=None, src=f"{FX}/selfie.mp4")
    sticker(sel["o"] + 0.4, sel["olen"] - 0.6, "la sera prima · dall'ufficio", 0.5, 0.64, rot=-4, size=50, w=960)
    # ---- programma della giornata: pillole brand che compaiono una dopo l'altra (data e luogo nella seconda pillola)
    pr = by["IMG_0615"][0]
    p0, pl = pr["o"] + 0.2, pr["olen"] - 0.3
    obj(p0, pl, sfx=None, kind="text", text="Programma della giornata", x=0.5, y=0.30, w=980, size=60, weight=800, color="#FFFFFF", align="center",
        bg=GREEN, bgPad=18, bgRadius=26, inA="pop", outA="fade", shadow="morbida")
    obj(p0 + 0.25, pl - 0.25, sfx=None, kind="text", text="sabato 24 ottobre · Vicenza", x=0.5, y=0.365, w=760, size=36, weight=700, color=INK, align="center",
        upper=True, letter=1, bg=AZ, bgPad=12, bgRadius=18, inA="pop", outA="fade", shadow="morbida")
    for i, (h, t) in enumerate([("9:30", "Check in"), ("10:00", "Lezione in sala"), ("12:30", "Analisi tecnica della corsa"), ("16:00", "Piedi e postura"), ("18:00", "Running analysis")]):
        obj(p0 + 0.6 + i * 0.5, pl - 0.6 - i * 0.5, sfx=None, kind="text", text=f"{h}   {t}", x=0.5, y=0.445 + i * 0.065, w=820, size=46, weight=800, color=GREEN,
            align="center", bg="rgba(244,241,229,.96)", bgPad=14, bgRadius=22, inA="slideUp", outA="fade")
    # ---- check-in: polaroid LA SQUADRA (due foto)
    chk = by["IMG_0599"][1]
    polaroid(chk["o"] + 0.2, chk["olen"] + 1.6, "IMG_0880", x=0.60, y=0.50, rot=6)
    gr = by["IMG_0600"][0]
    polaroid(gr["o"] + 1.0, gr["olen"] - 0.8, "b49c29cb", x=0.42, y=0.56, rot=-7)
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
    add("arrow", ped["o"] + 1.4, 0.9, sfx=None, anim="fade", label="le impronte", x=0.47, y=0.33, rotate=-20)
    tr = by["IMG_0647"][0]
    sticker(tr["o"] + 1.4, tr["olen"] - 1.3, "running analysis", 0.30, 0.60, rot=-8, bg=GREEN, color="#FFFFFF")
    # ---- testimonianze: sticker in alto «dicono del workshop» per tutto il blocco
    # ---- Daniela: nome e ruolo; palco crema con le sue parole (numeri detti da lei)
    add("lowerThird", dan1["o"] + 2.9, 3.2, sfx=None, name="Daniela", role="Partecipante al workshop")   # dopo il capitolo
    s0 = ws(dan2, "la", 120.38) - 0.15
    add("stageCard", s0, dan2["o"] + dan2["olen"] - s0, sfx=None, kicker="Nella mezza maratona", kickerFont="brand", y=0.08, size=88, chart=False,
        lines=["LA DANIELA DI *60 ANNI*", "BATTE QUELLA DI *50*", "DI *20 MINUTI*"],
        at=[round(ws(dan2, "60", 121.46) - s0, 2), round(ws(dan2, "batte", 122.34) - s0, 2), round(ws(dan2, "20", 124.84) - s0, 2)],
        win={"t": round(dan2["ms"] + (s0 - dan2["o"]), 3), "x": 0.08, "y": 0.43, "w": 0.84, "h": 0.34, "px": 0.5, "py": 0.3}, winLabel="Daniela · 60 anni")
    # ---- chiusura: «MEGLIO» dietro Daniele (skill, fxClip) + parole che si accumulano + polaroid del gruppo
    add("fxClip", dv["o"], dv["olen"], sfx=None, src=f"{FX}/chiusura.mp4")
    s0 = ws(dv, "dieci", 134.30) - 0.1
    add("kinetic", s0, dv["o"] + dv["olen"] - s0, sfx=None, mode="stack", y=0.52, size=80,
        items=[{"text": "tra *10 anni*", "at": 0}, {"text": "tra *20 anni*", "at": round(ws(dv, "venti", 136.50) - s0, 2)},
               {"text": "*meglio* di adesso", "at": round(ws(dv, "meglio", 137.40) - s0, 2)},
               {"text": "sfruttate la *corsa*", "at": round(ws(dv, "sfruttate", 141.14) - s0, 2)}])
    # (polaroid del gruppo tolta dalla chiusura, 5/11 sera: copriva le persone dietro Daniele e affollava il finale)
    # i B-roll a J e i clip con effetto esterno stanno sotto a tutto il resto (capitoli, etichette)
    effects.sort(key=lambda e: 0 if e["type"] in ("broll", "fxClip") else 1)
    # ---- logo circolare su disco crema in alto a destra per tutto il reel (spento mentre «MEGLIO» gigante occupa la parte alta)
    for a, b in ((hook_len - 0.2, dv["o"] + 3.7), (dv["o"] + 6.35, total)):
        obj(a, b - a, kind="image", src=LOGO_DISCO, x=0.875, y=0.085, w=200, shadow="no", inA="fade", outA="fade", opacity=1)   # v4 (Oscar): via l'ombra quadrata

    style = {
        "palette": "brand", "titleFont": "brand", "videoStyle": "vlog", "layout": "full", "filter": "none",
        "captions": {"style": "hormozi", "position": "low", "y": 0.80, "size": 0.85, "wordsPerLine": 3, "lines": 1, "alwaysOn": True,
                     "activeColor": LIME, "color": "#FFFFFF", "stroke": 4, "anim": "pop", "emphColor": LIME, "wordFx": "colore", "highlight": LIME,
                     "wordGap": 0.3, "font": "brand", "activeBase": 1.0, "activeScale": 0.06},   # Blinker, parola attiva poco ingrandita: niente sovrapposizioni
        "emphWords": ["workshop", "tecnica", "stupido", "170-180", "ritmo", "migliorando", "corsa", "divano", "miracolato", "muoversi", "recuperare",
                      "60", "50", "20", "minuti", "dieci", "venti", "meglio", "sfruttate", "talloni", "nervoso", "fidati", "gravità", "postura", "appoggio"],
        "breathing": False, "cutZoom": False, "pushIn": False, "cutBlend": 5,
        "logo": False, "logoKind": "pictogramOnDark", "progressBar": False, "gradient": False, "vignette": False,
        "focusX": 0.5, "focusY": 0.35, "faceZone": {"on": True, "y0": 0.2, "y1": 0.45},
    }
    brand = json.load(open(os.path.join(RS, "clients", "correre-naturale", "brand.json"), encoding="utf-8"))
    proj = {
        "id": PID, "title": "Vlog v4 · Workshop Correre Naturale (24/10/2026, Vicenza) · brano Jalen Ngonda", "client": "correre-naturale", "origin": "inedito",
        "created": datetime.now().isoformat(timespec="seconds"),
        "source": {"file": "video.mp4", "original": "input/evento (telefono di Paola) + testimonianze dal sito", "duration": round(segs[-1]["me"], 3), "width": 1080, "height": 1920},
        "words": words, "removed": [], "cuts": cuts, "brand": brand,
        "settings": {"target": 0, "dynamism": 3, "silenceGap": 0.45},
        "hook": {"text": "Ti portiamo in una giornata di workshop con Correre Naturale", "style": "typewriter", "font": "brand", "top": 470, "size": 0.9,
                 "align": "center", "pad": 60, "typeFrac": 0.72, "duration": round(hook_len, 2), "sfx": None, "captions": True,   # v4: sottotitoli della voce fuori campo anche sotto l'hook
                 "lines": [{"text": "Ti portiamo in", "size": 1.0}, {"text": "una giornata di", "size": 1.0}, {"text": "WORKSHOP", "size": 2.05, "color": GREEN, "weight": 800},
                           {"text": "con", "size": 1.0}, {"text": "CORRERE", "size": 2.05, "color": GREEN, "weight": 800}, {"text": "NATURALE", "size": 2.05, "color": GREEN, "weight": 800}]},
        "cta": {"style": "coaching", "after": True, "duration": CTA_LEN, "keyword": "WORKSHOP", "variant": "video", "textScale": 1.25, "titleTop": 360, "subTop": 600, "noteTop": 1005,
                "overlay": "linear-gradient(180deg, rgba(14,23,10,.60) 0%, rgba(14,23,10,.80) 45%, rgba(14,23,10,.92) 100%)",
                "text": "Vuoi esserci al *prossimo* workshop?", "sub": "Una giornata dal vivo con Daniele e il metodo Correre Naturale®",
                "note": "Commenta WORKSHOP: ti mando date e info", "dm": "Ecco date e info del prossimo workshop dal vivo di Correre Naturale®",
                "video": {"src": f"/progetti/{PID}/video.mp4", "from": lib["IMG_0628"]}, "sfx": None, "sfxLite": True},
        "style": style, "effects": effects,
        # v4: brano del condensato come letto (assets/music/jalen_bed_vlog.mp3), basso e con ducking; voce fuori campo di Daniele sotto l'hook
        "audio": {"music": "jalen_bed_vlog", "musicVolume": 0.11, "sfxVolume": 0.32, "voiceVolume": 1, "ducking": True, "sfxOn": True, "sfxOnCuts": False,
                  "voiceovers": [{"at": VO_AT, "src": f"{FX}/vo_vigilia.mp3", "dur": VO_LEN, "volume": 1}]},
        "caption": "", "exports": [],
    }
    os.makedirs(os.path.join(PD, "versioni"), exist_ok=True)
    f = os.path.join(PD, "project.json")
    if os.path.exists(f):
        os.replace(f, os.path.join(PD, "versioni", datetime.now().strftime("%Y%m%d-%H%M%S") + "-prima-di-claude.json"))
    json.dump(proj, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"pid": PID, "total": total, "cta": CTA_LEN, "segments": [{k: v for k, v in s.items() if k != "toks"} for s in segs]},
              open(os.path.join(WD, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"master {segs[-1]['me']:.2f} s · uscita {total:.2f} s + CTA {CTA_LEN} s · {len(words)} parole · {len(effects)} effetti")
    for s in main_segs:
        print(f"  {s['o']:6.2f}-{s['o'] + s['olen']:6.2f}  {s['clip']:22s} {s['s']:7.2f}-{s['e']:7.2f} {s['kind']:6s} {s.get('chapter') or s.get('label') or s.get('tag') or s.get('testi') or ''}")


if __name__ == "__main__":
    main()
