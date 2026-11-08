"""Correzioni di Ross del 5/11/2026 ai reel Y1-Y8 (vedi output/ytcn38/CHECKLIST.md): applicate sopra reels_ytcn38.REELS.
Niente musica, CTA 7 s animata, widget sopra i sottotitoli, niente emoji, tagli con aria, un'animazione diversa per reel
(titoli dietro la persona con scontorno RVM, scala 1-10, infinito, pittogrammi sport, clip con effetti Vibha).
"""
from reels_ytcn38 import REELS, CORRECTIONS, STYLE, MUSIC  # noqa: F401
from ytcn38_build import FX

SRC4K = "/progetti/cn-ytcn38-src/video4k.mp4"
LIME_HK = "#95FF00"   # lime: parola detta/evidenziata
CALDO = "sepia(.18) saturate(1.15) contrast(1.05)"   # stesso filtro del video (Reel.tsx FILTERS.caldo)


def idx(r, type_, nth=0):
    return [i for i, f in enumerate(r["fx"]) if f["type"] == type_][nth]


def drop(r, type_, nth=0):
    return r["fx"].pop(idx(r, type_, nth))


def setp(r, type_, nth=0, **props):
    r["fx"][idx(r, type_, nth)]["props"].update(props)


def behind(word, t, lines, dur=1.3, size=150, at=None):
    f = FX("behindTitle", (word, t), dur, lines=lines, y=0.07, size=size, band=True, kicker="")
    f["props"]["at"] = at or [0.08 + i * 0.3 for i in range(len(lines))]   # «at» è anche il nome dell'ancora di FX
    return f


def vclip(word, t, dur, pid, name, skip):
    return FX("fxClip", (word, t), dur, src=f"/progetti/{pid}/vibha/{name}.mp4", skip=round(skip, 3), filter=CALDO)


# ---- Y1: sottotitoli sotto i widget, «nel modo giusto» dietro Daniele
r = REELS["Y1"]
setp(r, "glassList", y=0.37)
setp(r, "gauge", y=0.41)
for it in r["fx"][idx(r, "glassStats")]["props"]["items"]:
    it["y"] = 0.43
drop(r, "keyword")
r["fx"].append(behind("modo", 64.76, ["NEL MODO GIUSTO"], dur=1.35, size=140, at=[0.08]))
r["adjust"] = {**r.get("adjust", {}), 2: (0.0, 0.38)}   # «giusto» finisce a 65.47, la «e» parte a 65.70: aria fino a 65.62

# ---- Y2: via «GRASSI» sopra lo specchietto, gauge più in alto
r = REELS["Y2"]
drop(r, "keyword", 0)          # GRASSI
setp(r, "gauge", y=0.41)

# ---- Y3: bonus più grande e centrato, niente emoji, clip CTA coerente
r = REELS["Y3"]
setp(r, "notif", emoji="", scale=1.08, align="center", y=0.56)   # 6/11: la notifica scende da 300 px più in alto: partenza sotto il mento
for it in r["fx"][idx(r, "gravityDrop")]["props"]["items"]:
    it["emoji"] = ""
setp(r, "glassList", y=0.37)
# 6/11: le schede che cadono dall'alto attraversano il volto (regola: mai, in nessun fotogramma) → parole cinetiche che si
# accumulano sotto il mento, stesso contenuto e stessi tempi
gd = r["fx"][idx(r, "gravityDrop")]
gd["type"] = "kinetic"
gd["pos"] = None
gd["props"] = {"mode": "stack", "y": 0.50, "size": 92, "color": LIME_HK,
               "items": [{"text": "Più *chilometri*", "at": 0}, {"text": "Più *a lungo*", "at": 1.81}, {"text": "Più *forte*", "at": 3.17}]}
r["cta"]["video"] = {"src": SRC4K, "from": 160.0}

# ---- Y4: FATICA in spotlight (Vibha), post-it grande con «fatica» evidenziata, «a parità di sforzo» dietro Daniele
r = REELS["Y4"]
pi = idx(r, "postit")
lines = r["fx"][pi]["props"]["lines"]
lines[0] = {"text": "La *fatica* non è solo una questione di gambe.", "at": 0}
if len(lines) > 1:
    lines[1]["style"] = "small"
r["fx"][pi]["props"]["y"] = 0.46
r["fx"].insert(pi, vclip("fatica", 196.0, 3.2, "cn-y4_vero-segreto", "spot_fatica", 0.10))
# 5/11 sera, Ross: volto SEMPRE libero → tutte le grafiche sotto il mento (volto misurato fino a y 0,46 con qa_volto.py)
setp(r, "signal", y=0.50)
setp(r, "glassList", y=0.48)
r["fx"][pi + 1]["props"]["y"] = 0.53          # post-it (dopo l'insert della clip Vibha è a pi+1)
r["fx"][idx(r, "pills")]["pos"] = "lower"
r["fx"][idx(r, "checklist")]["pos"] = "lower"
for it in r["fx"][idx(r, "glassList")]["props"]["items"]:
    if it["text"].startswith("Grassi come carburante"):
        it["text"] = "Grassi come carburante"   # una riga sola: la lista a y 0,48 non deve toccare i sottotitoli
drop(r, "keyword")
r["fx"].append(behind("parità", 233.28, ["A PARITÀ DI SFORZO"], dur=1.5, size=104, at=[0.05]))   # una riga sola: su due righe la seconda finiva dietro la testa

# ---- Y5: hook nuovo, «lentamente» dietro Daniele, widget più in alto
r = REELS["Y5"]
r["hook"]["text"] = "Per correre meglio, più a lungo, più forte, devi correre *lentamente*"
drop(r, "keyword")
r["fx"].insert(0, behind("più", 239.48, ["LENTAMENTE"], dur=1.3, size=165, at=[0.3]))
setp(r, "glassList", y=0.37)
setp(r, "limiter", y=0.44)
# 6/11: a 37-47 s Daniele è vicino (mento fino a 0,52): scheda su una riga sola (210 px) a 0,55, chip fino a ~1490 px, sotto il mento e sopra i sottotitoli
setp(r, "statStack", y=0.55, big="*Bassa*", label="intensità, per la maggior parte del tempo",
     chips=[{"text": "Motore aerobico", "at": 4.43}])   # la seconda chip («Resistenza vera e duratura») finiva sotto la riga dei sottotitoli: la dice il sottotitolo
r["fx"][idx(r, "script")]["pos"] = "lower"   # «fieno in cascina» a metà busto, non sul mento

# ---- Y6: hook nuovo, clip CTA coerente (6/11: via la clip «uninstall» Vibha, aveva un glitch sul volto → hook con strumenti barrati)
r = REELS["Y6"]
r["hook"]["text"] = "Non servono *strumenti* per allenarti bene"
drop(r, "jiggleApps")
setp(r, "tipCard", label="Naso bianco")
setp(r, "signal", y=0.41)
setp(r, "limiter", y=0.44)
r["cta"]["video"] = {"src": SRC4K, "from": 300.0}

# ---- Y7: scala 1-10 animata, barrato più grande, infinito che si disegna, notifica senza emoji
r = REELS["Y7"]
drop(r, "glassStats")
# la scala parte dopo l'hook (2,6 s), quando dice «10»
r["fx"].insert(0, FX("scaleTen", ("10,", 339.76), until=("4", 343.42), pad=0.7, title="Sforzo percepito", lo=3, hi=4, label="3–4",
                     zoneAt={"@": ("3", 342.88)}, y=0.47))
setp(r, "strike", size=96)
drop(r, "keyword")
r["fx"].append(FX("infinity", ("infinito", 350.58), 2.6, text="all'*infinito*", y=0.52))
setp(r, "notif", emoji="", y=0.57)   # 6/11: idem, la notifica scende da 300 px più in alto

# ---- Y8: le 5 strategie a ventaglio sopra la testa (Vibha), bici e nuoto come pittogrammi animati
r = REELS["Y8"]
# 6/11: via la clip «lineup5» (schedine nere piccole e illeggibili vicino al volto) → hook con i 5 numeri ad arco sopra la testa
drop(r, "pills")
r["fx"].append(FX("sportIcons", ("bici,", 377.72), 4.0, y=0.5,
                  items=[{"kind": "bike", "text": "Bici", "at": 0}, {"kind": "swim", "text": "Nuoto", "at": {"@": ("nuoto", 378.3)}}]))
setp(r, "glassList", y=0.37)

# ---- tutti: niente musica, CTA 7 s senza emoji, hook senza suono
for k, r in REELS.items():
    MUSIC[k] = None
    r["cta"]["duration"] = 7
    r["cta"]["note"] = r["cta"]["note"].replace(" 👇", "").replace("👇", "")

# ---- fine dell'ultimo pezzo misurata sull'inviluppo audio del sorgente (ultima parola intera + ~0,1 s di aria, prima della parola dopo)
for k, t in {"Y1": 79.28, "Y2": 143.34, "Y3": 185.92, "Y4": 234.50, "Y6": 332.92, "Y7": 361.36, "Y8": 420.13, "Y5": 282.78}.items():
    REELS[k]["tail_end"] = t


# ---- 6/11 notte: hook visivi dei primi secondi (marketing: «partire subito forte»; idee di Ross dalle immagini generate,
# tradotte in SVG nei colori del brand, volto sempre libero). Effetti hkBack (dietro la persona) / hkFront (davanti),
# definiti in ReelStudio/src/remotion/effects_hook.tsx; posizioni dal volto misurato con scripts/hook_face.py.
def HK(kind, back=False, dur=2.8, **props):
    return {"type": "hkBack" if back else "hkFront", "dur": dur, "props": {"kind": kind, **props}}


REELS["Y1"]["hooks"] = [   # tachimetro sopra la testa, corridore stanco / pittogramma che corre, anello attorno al titolo
    HK("arc", back=True, cx=0.52, cy=0.30, r=430, at=0.05, needleTo=150),
    HK("sides", lx=0.02, ly=0.33, rx=0.80, ry=0.33, size=1.0, at=0.3),
    HK("ring", cx=0.5, cy=0.555, rx=505, ry=200, a0=200, sweep=330, at=0.55),
    HK("rays", x=0.5, y=0.63, spread=330, at=0.9),
]
REELS["Y2"]["hooks"] = [   # corpo stilizzato con le centrali energetiche a destra, arco lime a sinistra, raggi sotto il titolo
    HK("ring", back=True, cx=0.5, cy=0.52, rx=600, ry=450, a0=150, sweep=80, color=LIME_HK, at=0.1),
    HK("body", x=0.83, y=0.17, size=1.25, at=0.1),
    HK("rays", x=0.5, y=0.66, spread=330, at=0.9),
]
REELS["Y3"]["hooks"] = [   # ciclo grassi → carboidrati → energia attorno alla testa
    HK("cycle", back=True, cx=0.45, cy=0.26, r=380, angles=[190, 300, 30], gap=38, at=0.25),
    HK("badges", r=112, at=0.1, items=[{"x": 0.104, "y": 0.2255, "icon": "drops", "label": "GRASSI"},
                                        {"x": 0.626, "y": 0.0885, "icon": "fibers", "label": "CARBOIDRATI"},
                                        {"x": 0.755, "y": 0.359, "icon": "bolt", "label": "ENERGIA"}]),
    HK("rays", x=0.5, y=0.70, spread=330, at=1.0),
]
REELS["Y4"]["hooks"] = [   # lucchetto che si apre a destra, chiave a sinistra, anello attorno al titolo
    HK("lock", x=0.83, y=0.30, size=1.0, at=0.15),
    HK("icon", icon="key", x=0.15, y=0.31, size=1.3, at=0.35),
    HK("ring", cx=0.5, cy=0.555, rx=505, ry=200, a0=160, sweep=330, at=0.7),
]
REELS["Y5"]["hooks"] = [   # battito calmo dietro le spalle, cuore a sinistra, raggi sotto il titolo lungo
    HK("ecg", back=True, y=0.47, amp=70, at=0.05),
    HK("icon", icon="heart", x=0.13, y=0.29, size=1.5, at=0.3),
    HK("rays", x=0.5, y=0.75, spread=330, at=1.0),
]
REELS["Y6"]["hooks"] = [HK("strike", y=0.73, gap=320, at=0.15, items=["watch", "strap", "phone"])]   # strumenti barrati sotto il titolo
REELS["Y7"]["hooks"] = [HK("scale", x=0.5, y=0.72, w=720, at=0.15, **{"from": 0.95, "to": 0.3})]       # barra 1→10 con cursore
REELS["Y8"]["hooks"] = [HK("dots", back=True, n=5, cx=0.50, cy=0.29, r=440, a0=195, a1=345, at=0.05),   # 1-5 ad arco sopra la testa
                        HK("rays", x=0.5, y=0.66, spread=330, at=1.2)]

# ---- 6/11, Ross: volto SEMPRE libero, sottotitoli mai sopra i widget → ogni widget con una «y» sotto il mento misurato
# (max 0,46) e comunque sopra i sottotitoli (0,80). Le grafiche dietro la persona e gli hook restano dove sono.
for k, r in REELS.items():
    for f in r["fx"]:
        y = f["props"].get("y")
        if f["type"] in ("behindTitle", "fxClip", "zoom", "hkBack", "hkFront", "gravityDrop") or y is None:
            continue
        if 0.2 < y < 0.49:
            f["props"]["y"] = 0.49
    for f in r["fx"]:
        for it in f["props"].get("items", []) or []:
            if isinstance(it, dict) and isinstance(it.get("y"), (int, float)) and 0.2 < it["y"] < 0.49:
                it["y"] = 0.49

# ---- 6/11: con i sottotitoli sempre presenti (Paola/Ross), la «parola a comparsa al posto del sottotitolo» è un doppione
# che finisce addosso alla riga dei sottotitoli: via da tutti i reel (la parola detta è già evidenziata in lime nel sottotitolo)
for k, r in REELS.items():
    r["fx"] = [f for f in r["fx"] if f["type"] != "keyword"]

REELS["Y8"]["cut_trim"] = {0: 1}   # 6/11: fotogramma nero deterministico a 42,40 s = ultimo fotogramma del pezzo 2 (src 403,716)

# ---- 6/11 mattina, Ross: via le animazioni dell'hook (brutte), resta il titolo in box; via l'handle, solo il logo scontornato
for k, r in REELS.items():
    r["hooks"] = []

# ---- 6/11 pomeriggio, Ross (seconda revisione dopo la consegna): SOLO i punti elencati, il resto non si tocca.
# Comune: sottotitoli più compatti (wordGap 0,2 in reels_ytcn38.STYLE), niente logo in alto a destra (ytcn38_build / y9v2_build),
# «personalizzato» nella CTA (SUB e dm). CTA già 7,0 s in tutti i reel (verificato con ffprobe).
# Y1 0:15 e Y2 0:07: taglio netto tra le due inquadrature (la dissolvenza tra due posizioni diverse sembrava un errore di montaggio)
REELS["Y1"]["hard_cuts"] = [1]
REELS["Y2"]["hard_cuts"] = [1]
# Y2 0:17: specchietto un po' più lontano dai sottotitoli (scala 0,82 dall'alto) e lancetta che si muove subito nella zona
# delle basse intensità (45° da «camminata»), poi da «mano a mano che l'intensità si alza» sale verso «sprint»
setp(REELS["Y2"], "gauge", scale=0.82, low=45)
# Y3: lista in vetro più lontana dai sottotitoli (scala 0,86); bonus su due righe
r = REELS["Y3"]
setp(r, "glassList", scale=0.86)
r["fx"][idx(r, "notif")]["props"]["lines"] = [{"text": "Migliore *salute metabolica*,", "at": 0, "strong": True},
                                              {"text": "anche fuori dalla corsa", "at": 0, "strong": True}]
# Y4: post-it più piccolo (0,8) e a 0,52: i sottotitoli coprivano l'ultima riga; «scorte» (non scorie) nei sottotitoli e nella lista;
# «a parità di sforzo» 124 px (misura di Blinker: 1000 px) a y 0,02, tutto sopra la testa (testa da y 0,109)
r = REELS["Y4"]
setp(r, "postit", scale=0.8, y=0.52)
r["fx"][idx(r, "behindTitle")]["props"].update(size=124, y=0.02, noFit=True)
# Y6: icone (SVG: orologio, cardiofrequenzimetro, tabella) che si cancellano, come nella prima versione; partono appena finisce
# l'hook (1,8 s) così non si sovrappongono al titolo in box; «l'ascolto del tuo corpo» in evidenza in alto (dietro Daniele,
# testa da y 0,098: due righe da 88 px)
r = REELS["Y6"]
r["fx"].insert(0, FX("jiggleApps", ("orologi", 290.3), until=("complicate", 293.3), pad=1.4, y=0.5, delay=1.25, colW=300, gap=24,
                     delAt={"@": ("complicate", 293.3)},
                     items=[{"text": "Orologi", "icon": "watch", "at": 0},
                            {"text": "Cardiofrequenzimetri", "icon": "heart", "at": {"@": ("cardiofrequenzimetri", 291.5)}},
                            {"text": "Tabelle complicate", "icon": "table", "at": {"@": ("tabelle", 292.6)}}]))
r["fx"].append(behind("ascolto", 299.08, ["L'ASCOLTO", "DEL TUO CORPO"], dur=1.9, size=88, at=[0.05, 0.65]))
r["fx"][-1]["props"]["y"] = 0.004
# Y7: l'infinito ora si chiude (effects_cn3.tsx: lunghezza vera della curva).
# Y8: bici e nuoto sotto la scheda del capitolo (y 0,615, non più sopra); un pittogramma per ognuna delle 5 strategie, stesso stile
r = REELS["Y8"]
setp(r, "sportIcons", y=0.615, w=360)
r["fx"] += [
    FX("sportIcons", ("chilometri", 370.56), until=("economico", 374.34), pad=0.5, y=0.615, w=360,
       items=[{"kind": "road", "text": "Chilometri", "at": 0}, {"kind": "steps", "text": "Con criterio", "at": {"@": ("criterio", 372.26)}}]),
    FX("sportIcons", ("forza", 386.34), until=("movimenti", 389.68), pad=0.5, y=0.615, w=360,
       items=[{"kind": "strength", "text": "Forza", "at": 0}, {"kind": "mobility", "text": "Mobilità", "at": {"@": ("mobilità", 387.34)}}]),
    FX("sportIcons", ("alimentazione", 394.90), until=("giusto", 398.04), pad=0.5, y=0.615, w=360,
       items=[{"kind": "food", "text": "Alimentazione", "at": 0}, {"kind": "sleep", "text": "Recupero", "at": {"@": ("recupero", 396.12)}}]),
    FX("sportIcons", ("camminata", 407.90), 2.5, y=0.615, w=360, items=[{"kind": "walk", "text": "Camminata", "at": 0}]),
]
