"""Montaggio animato (ReelStudio/Remotion) dei 6 reel: hook, CTA ed effetti.

Tagli e testo vengono da reels_longevita.py (già verificati). Qui solo la parte visiva.
E(tipo, ancora, ...): ancora = (parola, secondo sorgente). `until` = ancora di fine.
`sfx` solo sui 1-2 momenti chiave (regola: max 1 ogni 7 s, mai sull'hook).
"""


def E(type, at, dur=None, until=None, pad=0.3, sfx=None, pos=None, tf=None, anim=None, **props):
    return dict(type=type, at=at, dur=dur, until=until, pad=pad, sfx=sfx, pos=pos, tf=tf, anim=anim, props=props)


MEADOW = "/progetti/20261101-161323-reel-gli-esseri-umani/originale.mp4"   # 1080×1920, 50 Mb/s
CEROTTI = "/progetti/20261030-141111-reel-i-cerotti-nasali-1/originale.mp4"


# riprese di Daniele: per «cover» (a, b, M(…)) e per i video dentro gli effetti (vM, vC)
def M(at, **k):
    return {"src": MEADOW, "at": at, **k}


def CER(at, **k):
    return {"src": CEROTTI, "at": at, **k}


def S(t, **k):   # stesso video sorgente (4K)
    return {"at": t, **k}


FACE = {"face": True}   # volto vero (la tabella scene lo segna come scheda)
NONE = {"none": True}   # coperto da una scena grafica a tutto schermo


def vM(at, **k):
    return {"src": MEADOW, "from": at, **k}


def vC(at, **k):
    return {"src": CEROTTI, "from": at, **k}


# stile approvato da Ross su R1 (3/11), uguale per tutti i reel: vetro, keyword verdi, niente salti tra i tagli
STYLE = {"filter": "caldo", "vignette": True, "breathing": False, "cutZoom": False, "pushIn": False, "cutBlend": 5,
         "captions": {"style": "glass", "position": "bottom", "size": 1.0, "wordsPerLine": 4, "highlight": "#49762E",
                      "anim": "pop", "tf": {"s": 1.35, "ox": 0.5, "oy": 0.824, "x": 0, "y": 0.0734}, "font": "brand",
                      "activeColor": "#B8D7EA", "color": "#FFFFFF", "y": 0.75, "letterSpacing": 0,
                      "emphColor": "#49762E", "wordFx": "box"}}
AUDIO = {"sfxOn": False, "musicVolume": 0.1, "ducking": True}


def CTA(keyword, text, sub, variant="green", video=None):
    c = dict(style="coaching", duration=6, keyword=keyword, text=text, sub=sub, variant=variant,
             note=f"Commenta {keyword} e ti mando tutte le info 👇")
    if video:
        c["video"] = video
    return c


# clip di corsa/camminata generiche del sorgente usate per sostituire le schede 16:9 (sec, durata)
POOL = [(27.7, 4.3), (32.1, 4.2), (156.3, 3.9), (10.3, 3.8), (204.2, 2.7), (207.1, 4.0), (243.2, 3.0),
        (317.0, 4.6), (378.7, 4.7), (454.9, 6.4), (538.0, 4.9), (589.4, 4.3), (602.3, 7.9), (661.6, 5.3),
        (671.8, 5.9), (701.1, 2.4), (703.6, 2.5), (141.3, 7.2), (117.7, 3.7), (45.9, 2.3), (48.3, 3.0),
        (130.3, 2.0), (132.5, 2.9), (295.0, 2.1), (297.2, 2.6)]

RS = {
    "R1": dict(
        # 3/11 sera, correzioni di Ross: kicker, sottotitoli vetro più grandi, keyword verdi, box che si illuminano,
        # Daniele che corre al posto dei B-roll di corsa, niente suoni, post-it finale, CTA coaching di 6 s.
        hook=dict(kicker="Ci hai mai pensato?", text="30 anni in più… ma alla *fine*"),
        cta=dict(style="coaching", duration=6, keyword="PIANO",
                 text="Vuoi aggiungere anni *in salute* alla tua vita?",
                 sub="Nei percorsi di coaching personalizzati di Correre Naturale® partiamo da dove sei adesso, senza rischiare infortuni.",
                 note="Commenta PIANO e ti mando tutte le info 👇"),
        kw_color="#49762E",
        # scelte fatte da Ross nella dashboard (mantenute) + sottotitoli leggermente più grandi
        audio={"music": "lofi-corsa-mattutina"},
        # riprese di Daniele che corre (sec. sorgente da coprire → clip); MEADOW = video verticale «Gli esseri umani»
        cover=[(58.5, 62.6, {"src": MEADOW, "at": 25.5}),
               (62.6, 69.4, {"src": MEADOW, "at": 89.2}),
               (117.7, 119.6, {"at": 48.4, "z0": 1.12}),
               (119.6, 121.6, {"at": 48.6}),
               (128.4, 130.3, {"at": 295.0, "px": 0.32, "px1": 1.0, "pxAt": 1.15}),
               (661.3, 666.6, {"src": MEADOW, "at": 97.4})],
        fx=[
            E("lowerThird", ("ma", 3.0), 1.15, name="Daniele Vecchioni", role="Ideatore del metodo Correre Naturale®",
              tf={"ox": 0.334, "oy": 0.587, "s": 1.294, "x": 0.038, "y": 0.12}),
            E("emoji", ("seduto", 6.44), 1.6, emoji="🛋️", x=0.8, y=0.62),
            E("keyword", ("dipendi", 8.22), 1.2, text="DIPENDI"),
            E("duoGlow", ("primo", 61.72), until=("healthspan", 67.96), pad=0.15,
              items=[{"title": "LIFESPAN", "sub": "quanti anni vivi", "at": {"@": ("lifespan", 63.86)}},
                     {"title": "HEALTHSPAN", "sub": "quanti anni vivi bene", "at": {"@": ("healthspan", 67.96)}}]),
            E("splitChart", ("Questi", 76.7), until=("più.", 80.9), pad=0.2, title="Dovrebbero andare *insieme*",
              bars=[{"label": "Anni di vita", "value": 1}, {"label": "Anni in salute", "value": 0.72}], fx=0.53, t=76.78),
            E("glassStats", ("aspettativa", 82.04), until=("60.", 87.86), pad=0.5,
              items=[{"big": "83", "label": "anni di vita media", "at": {"@": ("83", 83.58)}, "x": 0.05, "y": 0.5, "w": 0.43},
                     {"big": "~60", "label": "anni in salute", "at": {"@": ("60.", 87.86)}, "x": 0.52, "y": 0.5, "w": 0.43, "accent": True, "bar": 72}]),
            E("bw", ("Significa", 88.5), until=("declino.", 91.76), pad=0.3),
            E("docTitle", ("ultimi", 90.22), until=("declino.", 91.76), pad=0.3, l1="20 anni", l2="in declino"),
            E("glassList", ("dolori", 100.38), until=("rallenta.", 104.04), pad=0.6, title="Gli ultimi 20 anni", mode="x", y=0.45,
              items=[{"text": "Dolori cronici", "at": {"@": ("dolori", 100.38)}}, {"text": "Fiato corto", "at": {"@": ("fiato", 101.12)}},
                     {"text": "Perdita di autonomia", "at": {"@": ("perdita", 101.86)}}, {"text": "Mente che rallenta", "at": {"@": ("mente", 102.9)}}]),
            E("emoji", ("corsa", 119.22), 1.2, emoji="🏃", x=0.8, y=0.62, tf={"ox": 0.8, "oy": 0.62, "s": 1.9}),
            E("spotTitle", ("genetica.", 120.7), 1.3, text="Genetica?"),
            E("mythTruth", ("quello", 121.6), until=("mandato.", 125.1), pad=0.4,
              left="È la genetica", right="Sono i segnali che mandi al corpo", tf={"ox": 0.5, "oy": 0.52, "x": 0, "y": 0.1326}),
            E("zoom", ("segnale", 126.32), 1.6, amount=1.25),
            E("keyword", ("movimento", 128.8), 1.3, text="MOVIMENTO AEROBICO"),
            E("postit", ("non", 661.32), until=("correre.", 666.02), pad=0.5, y=0.4,
              lines=[{"text": "Non si smette di correre perché si invecchia.", "at": 0, "style": "small"},
                     {"text": "Si invecchia perché *si smette di correre*.", "at": {"@": ("Si", 664.1)}}]),
        ],
    ),
    # ---------------------------------------------------------------- R2 · firma: widget ad anello, prompt AI, orbita
    "R2": dict(
        hook=dict(kicker="Lo sapevi?", text="Quello che nessun *farmaco* fa"),
        cta=CTA("MOTORE", "Vuoi tenere acceso il tuo *motore aerobico*?",
                "Nei percorsi di coaching personalizzati di Correre Naturale® costruiamo con te il piano giusto, partendo da 10 minuti al giorno.",
                variant="cream"),
        audio={"music": "motivazionale"},
        pool=False,
        cover=[(179.12, 186.4, M(89.0)), (186.4, 191.2, M(25.4)), (191.2, 193.8, S(48.3)), (193.8, 197.65, FACE),
               (197.65, 201.42, M(97.4)), (204.2, 206.0, S(295.0, px=0.32, px1=1.0, pxAt=1.15)), (206.0, 208.9, M(12.4)),
               (208.9, 211.2, M(5.0)), (211.2, 213.2, M(101.6)), (213.2, 222.9, NONE), (222.9, 227.2, M(59.3)),
               (227.2, 232.85, M(8.2)), (232.85, 238.95, NONE), (238.95, 241.55, M(93.5))],
        fx=[
            E("ringWidget", ("abbassa", 182.14), until=("15%.", 189.82), pad=1.2, y=0.5,
              items=[{"num": 13, "fill": 0.13, "label": "rischio di morte per qualsiasi causa", "at": {"@": ("13%", 185.46)}},
                     {"num": 15, "fill": 0.15, "label": "rischio di eventi cardiovascolari", "at": {"@": ("15%.", 189.82)}}]),
            E("promptBar", ("non", 192.26), until=("Nessuno.", 197.58), pad=0.9, y=0.52,
              text="Un farmaco con effetto dose-risposta sulla longevità", typeEnd=4.3, placeholder="Cerca…",
              result="*Nessuno*", resultAt={"@": ("Nessuno.", 197.58)}),
            E("zoom", ("effetto", 194.54), 2.6, amount=1.12),
            E("promptBar", ("quanto", 198.62), until=("effetto?", 200.92), pad=0.7, y=0.52,
              text="Quanto devo correre per avere questo effetto?", typeAt=0.05, typeEnd=2.3),
            E("odometer", ("155.000", 207.48), until=("adulti.", 210.32), pad=0.8, y=0.5,
              value="155.000", label="adulti", kicker="Studio americano · 15 anni"),
            E("pills", ("confrontato", 211.24), until=("no.", 213.12), pad=0.3, items=["Chi correva", "Chi no"]),
            E("stage", ("E", 213.38), until=("totali,", 222.2), pad=0.68, tone="green",
              win=dict(img="/progetti/cn-assets/m0.8.png", x=0.08, y=0.09, w=0.84, h=0.36, zoom=0.1, py=0.38)),
            E("statStack", ("bastavano", 214.32), until=("totali,", 222.2), pad=0.6, y=0.52,
              big="< *51*", label="minuti a settimana",
              chips=[{"text": "Sotto i 10 km/h", "at": {"@": ("sotto", 218.36)}},
                     {"text": "Meno di 10 km totali", "at": {"@": ("meno", 220.88)}}]),
            E("barDrop", ("riduzione", 223.76), until=("cardiovascolari.", 231.72), pad=0.7, y=0.5,
              title="Riduzione della mortalità",
              items=[{"label": "per tutte le cause", "value": 30, "at": {"@": ("30%", 225.1)}},
                     {"label": "per cause cardiovascolari", "value": 45, "at": {"@": ("45%", 229.52)}}]),
            E("orbit", ("10", 232.94), until=("biologica.", 238.92), pad=0.5, cy=0.36, v=vM(91.0, zoom=0.08, py=0.7),
              center="10 minuti *al giorno*",
              items=[{"text": "−30% mortalità", "at": 0.3}, {"text": "−45% cardiovascolare", "at": 0.6},
                     {"text": "< 51 min a settimana", "at": 0.9}, {"text": "sotto i 10 km/h", "at": 1.2}],
              strike={"text": "una maratona", "at": {"@": ("maratona.", 235.0)}}),
            E("gauge", ("È", 239.54), until=("l'ago.", 241.24), pad=0.6, y=0.4, left="spenta", right="accesa",
              label="La macchina *biologica*", moveAt=0.5),
        ],
    ),
    # ---------------------------------------------------------------- R3 · firma: lente, gravity drop, aggiornamento, notifica
    "R3": dict(
        hook=dict(kicker="Ti sei mai chiesto…", text="Cosa succede nelle tue *cellule* quando corri"),
        cta=CTA("RINNOVO", "Vuoi allenare il tuo corpo a *rinnovarsi*?",
                "Nei percorsi di coaching personalizzati di Correre Naturale® impari a correre in modo aerobico, mandando al corpo i segnali giusti.",
                variant="video", video={"src": MEADOW, "from": 91.5}),
        audio={"music": "elettronica-notte"},
        pool=False,
        cover=[(242.97, 246.44, M(26.0)), (252.6, 252.85, M(29.47)), (289.5, 291.9, S(48.5)), (295.0, 296.85, S(295.0, px=0.32, px1=1.0, pxAt=1.15)), (296.85, 299.9, M(97.4)), (303.8, 307.4, NONE),
               (317.0, 321.7, M(98.6)), (381.49, 383.5, M(29.2))],
        fx=[
            E("lens", ("risposta", 252.86), until=("mitocondri.", 254.02), pad=1.0, x=0.5, y=0.62, r=240,
              inner={"t": 255.6, "z": 1.4}, label="Mitocondri"),
            E("notif", ("centrali", 255.72), until=("cellule.", 257.64), pad=0.3, y=0.53, app="Le tue cellule", emoji="⚡",
              lines=[{"text": "*Centrali energetiche* attive", "at": 0, "strong": True}]),
            E("keyword", ("statici.", 290.82), 1.1, text="NON SONO STATICI"),
            E("gravityDrop", ("Segnali", 293.88), until=("controllata.", 297.58), pad=0.7, y=0.74, title="Segnali giusti",
              items=[{"text": "Movimento aerobico", "emoji": "🏃", "at": {"@": ("Movimento", 294.8)}, "good": True},
                     {"text": "Respirazione nasale", "emoji": "👃", "at": {"@": ("respirazione", 295.92)}, "good": True},
                     {"text": "Intensità controllata", "emoji": "🎚️", "at": {"@": ("intensità", 297.14)}, "good": True}]),
            E("zoom", ("E", 299.92), 1.6, amount=1.14),
            E("stage", ("mitofagia.", 303.76), 3.92, tone="dark", win=dict(img="/progetti/cn-assets/m0.8.png", x=0.08, y=0.2, w=0.84, h=0.3, py=0.5, zoom=0.1)),
            E("keyword", ("mitofagia.", 303.76), 1.2, text="MITOFAGIA"),
            E("gravityDrop", ("riconosce", 305.92), until=("nuovi.", 310.8), pad=0.5, y=0.74, stack=2,
              items=[{"text": "Mitocondri vecchi", "emoji": "🪫", "at": {"@": ("vecchi", 307.5)}, "slot": 1, "out": {"@": ("sostituisce", 309.48)}},
                     {"text": "Malfunzionanti", "emoji": "⚠️", "at": {"@": ("malfunzionanti.", 308.16)}, "slot": 0, "out": {"@": ("sostituisce", 309.48)}},
                     {"text": "Mitocondri nuovi", "emoji": "🔋", "at": {"@": ("con", 310.32)}, "slot": 0, "good": True}]),
            E("softwareUpdate", ("aggiornamento", 311.72), until=("cellulare.", 314.56), pad=0.6, y=0.52,
              title="Aggiornamento hardware", sub="Installazione in corso…", doneTitle="Rinnovamento cellulare",
              doneSub="Completato", left="Mitocondri", doneAt={"@": ("rinnovamento", 313.5)}),
            E("strike", ("bruciando", 318.94), 1.1, text="Solo calorie"),
            E("notif", ("dicendo", 320.4), until=("nuove.", 326.38), pad=0.5, y=0.5, app="Il tuo corpo", emoji="🧬",
              title="Messaggio da te",
              lines=[{"text": "Le centrali energetiche vecchie vanno sostituite.", "at": {"@": ("centrali", 321.94)}},
                     {"text": "Costruiscine di nuove.", "at": {"@": ("Costruiscine", 325.34)}, "strong": True}]),
            E("zoom", ("differenza", 383.72), 1.6, amount=1.12),
            E("softwareUpdate", ("corpo", 386.48), until=("aggiorna.", 387.54), pad=0.9, y=0.52, title="Il tuo corpo",
              sub="Aggiornamento…", doneTitle="Si aggiorna", doneSub="Completato", left="", doneAt=1.0),
        ],
    ),
    # ---------------------------------------------------------------- R4 · firma: documentario, bento con video, RM, rewind
    "R4": dict(
        hook=dict(kicker="Lo dice la scienza:", text="Camminare può far *crescere* il cervello"),
        cta=CTA("CAMMINA", "Vuoi ripartire *dal movimento*?",
                "Nei percorsi di coaching personalizzati di Correre Naturale® partiamo anche solo dalla camminata, con un piano su misura per te."),
        audio={"music": "riflessiva"},
        pool=False,
        cover=[(485.7, 486.5, S(484.0, z0=1.25, px=0.3)), (486.5, 487.3, S(484.5, z0=1.4, px=0.62)), (487.3, 495.9, NONE), (495.9, 499.9, S(474.4, z0=1.15)),
               (499.9, 505.7, S(473.95, z0=1.45, px=0.42, py=0.55)), (505.7, 506.9, S(474.0, z0=1.6, px=0.42, py=0.6)),
               (506.9, 516.2, NONE), (516.2, 521.61, NONE)],
        fx=[
            E("zoom", ("correttamente", 480.4), 1.8, amount=1.12),
            E("keyword", ("movimento.", 482.84), 1.0, text="MOVIMENTO"),
            E("bw", ("esperimento", 484.18), until=("sedentari.", 486.52), pad=0.75),
            E("documentary", ("esperimento", 484.18), until=("sedentari.", 486.52), pad=0.75, y=0.5, corner="ESPERIMENTO",
              lines=[{"text": "Esperimento", "style": "small", "at": 0}, {"text": "120 anziani sedentari", "at": {"@": ("120", 485.56)}}]),
            E("bentoVideo", ("Metà", 487.3), until=("leggero.", 495.0), pad=0.85, title="Per *un anno*", y=0.11, rowH=480,
              items=[{"span": 2, "v": vM(97.4, py=0.5), "size": 66, "text": "Metà ha *camminato*", "sub": "3 volte a settimana", "at": 0.05},
                     {"tone": "green", "big": "10 → 40", "text": "minuti", "at": {"@": ("10", 490.8)}},
                     {"tone": "blue", "emoji": "🧘", "text": "L'altra metà: solo *stretching* leggero", "size": 48, "at": {"@": ("L'altra", 492.86)}}]),
            E("brainScan", ("Prima", 495.92), until=("l'età.", 506.56), pad=0.3, head="RM · IPPOCAMPO",
              tags=[{"text": "PRIMA", "at": 0.1, "x": 0.08, "y": 0.5, "out": {"@": ("la", 499.94)}}, {"text": "DOPO", "at": {"@": ("dopo", 496.7)}, "x": 0.62, "y": 0.5, "tone": "green", "out": {"@": ("la", 499.94)}},
                    {"text": "Ippocampo = *memoria*", "at": {"@": ("memoria", 502.24)}, "x": 0.1, "y": 0.5, "size": 56},
                    {"text": "−2% all'anno", "at": {"@": ("2%", 504.76)}, "x": 0.1, "y": 0.56, "size": 56, "tone": "red"}]),
            E("stage", ("Il", 506.94), until=("diminuito.", 515.56), pad=0.62, tone="green",
              win=dict(img="/progetti/cn-assets/m37.png", x=0.08, y=0.08, w=0.84, h=0.27, zoom=0.1, py=0.47)),
            E("groupResult", ("risultato", 507.6), until=("diminuito.", 515.56), pad=0.6, y=0.37, title="Il risultato",
              cols=[{"label": "Chi ha camminato", "big": "+2%", "at": {"@": ("cresciuto", 511.42)}},
                    {"label": "Gruppo di controllo", "big": "↓", "dir": "down", "at": {"@": ("diminuito.", 515.56)}}]),
            E("rewind", ("Chi", 516.24), until=("cervello.", 521.04), pad=0.55, y=0.5, v={"src": "/progetti/cn-assets/rew_path.mp4", "from": 0}),
        ],
    ),
    # ---------------------------------------------------------------- R5 · firma: timbro, app che si cancellano, limitatore, swipe, segnale
    "R5": dict(
        hook=dict(kicker="Te l'hanno mai detto?", text="La *bugia* più diffusa nel running"),
        cta=CTA("TECNICA", "Vuoi correre *senza farti male*?",
                "Nei percorsi di coaching personalizzati di Correre Naturale® lavoriamo su tecnica, corpo e intensità giuste per te.",
                variant="video", video={"src": MEADOW, "from": 26.5}),
        audio={"music": "tensione-mistero"},
        pool=False,
        cover=[(538.0, 543.0, NONE), (565.9, 569.7, M(27.0)), (602.3, 609.55, M(89.2))],
        fx=[
            E("stage", ("basta", 537.98), until=("running.", 542.72), pad=0.25, tone="cream",
              win=dict(img="/progetti/cn-assets/m62.png", x=0.08, y=0.08, w=0.84, h=0.38, zoom=0.1, py=0.5)),
            E("stamp", ("basta", 537.98), until=("running.", 542.72), pad=0.2, y=0.53, text="«Basta uscire a *correre*»",
              stamp="FALSO", stampAt={"@": ("bugia", 540.74)}),
            E("zoom", ("corpo", 545.42), 1.6, amount=1.12),
            E("frameBreak", ("quando", 551.18), 1.1, noflash=True, img="/progetti/cn-assets/knee.png"),
            E("jiggleApps", ("troppo", 560.64), until=("mitocondri.", 565.68), pad=0.5, y=0.5, delAt={"@": ("non", 564.34)},
              items=[{"text": "Troppo forte", "emoji": "🔥", "at": {"@": ("troppo", 560.64)}},
                     {"text": "Bocca aperta", "emoji": "😮", "at": {"@": ("bocca", 561.6)}},
                     {"text": "Col fiatone", "emoji": "🥵", "at": {"@": ("fiatone,", 562.4)}},
                     {"text": "Senza saper correre", "emoji": "🦶", "at": {"@": ("senza", 562.94)}}]),
            E("keyword", ("pronto.", 569.1), 1.0, text="NON È PRONTO"),
            E("limiter", ("Se", 573.36), until=("forte.", 578.08), pad=0.4, y=0.52, title="Il *limitatore* naturale",
              limitLabel="solo naso", low="piano", overText="troppo forte", overAt={"@": ("molto", 576.2)}),
            E("keyword", ("Rallenta", 579.08), 1.1, text="RALLENTA"),
            E("swipe", ("Non", 580.44), until=("biologica.", 582.38), pad=0.5, y=0.5, a="È debolezza",
              b="È intelligenza biologica", swipeAt={"@": ("è", 581.58)}, bAt={"@": ("intelligenza", 581.8)}),
            E("strike", ("tratta", 597.86), 2.0, text="Correre di più, più veloce"),
            E("signal", ("segnali", 601.72), until=("gestire.", 607.66), pad=0.6, y=0.5, title="Segnali giusti",
              items=[{"text": "Tecnica corretta", "at": {"@": ("tecnica", 602.92)}},
                     {"text": "Corpo preparato", "at": {"@": ("corpo", 604.38)}},
                     {"text": "Intensità gestibile", "at": {"@": ("un'intensità", 605.64)}}]),
            E("script", ("resto", 608.6), 1.3, text="il resto è una conseguenza", rotate=-5, color="#F4F1E5"),
        ],
    ),
    # ---------------------------------------------------------------- R6 · firma: app Note, timer, pulsante di accensione
    "R6": dict(
        hook=dict(kicker="Inizia così:", text="3 cose da fare da *domani*"),
        cta=CTA("DOMANI", "Vuoi un piano per *iniziare da domani*?",
                "Nei percorsi di coaching personalizzati di Correre Naturale® costruiamo con te una routine semplice, da fare tutti i giorni.",
                variant="cream"),
        audio={"music": "pop-solare"},
        pool=False,
        cover=[(610.65, 614.8, NONE), (614.8, 616.2, M(93.0)), (616.2, 617.6, CER(0.3)), (617.6, 619.7, M(12.0)),
               (619.7, 626.0, M(25.34)), (626.0, 628.5, S(48.5)), (628.5, 628.95, M(94.0)),
               (629.57, 632.0, NONE), (632.0, 633.9, S(295.0, px=0.32, px1=1.0, pxAt=1.15)), (633.9, 636.6, M(90.5)), (636.6, 640.65, M(100.6)),
               (640.65, 643.6, NONE), (643.6, 647.0, M(85.2)), (647.0, 649.6, M(5.0)), (649.6, 650.9, M(83.0)),
               (671.8, 677.68, NONE)],
        fx=[
            E("notesTodo", ("Cosa", 610.56), until=("cammina", 614.32), pad=0.1, full=True, y=0.07, vh=820, date="Domani",
              v=vM(97.4, py=0.62), title="Da fare *domani*",
              items=[{"text": "Cammina 10 minuti", "at": {"@": ("Prima", 612.5)}, "hl": {"@": ("Prima", 612.5)}}]),
            E("timerRing", ("almeno", 614.8), until=("naso.", 617.08), pad=0.4, y=0.5, seconds=600, label="cammina"),
            E("badge", ("pranzo", 618.04), 1.7, text="🍽️ Dopo pranzo"),
            E("keyword", ("potentissimo.", 621.8), 1.2, text="POTENTISSIMO"),
            E("powerOn", ("accendendo", 622.8), until=("lavoro.", 627.42), pad=0.3, y=0.5, label="Motore aerobico",
              pressAt={"@": ("accendendo", 622.8)}),
            E("notesTodo", ("Seconda", 629.56), until=("prova", 631.28), pad=0.7, full=True, y=0.07, vh=720, date="Domani",
              v=vM(25.6, py=0.6), title="Da fare *domani*",
              items=[{"text": "Cammina 10 minuti", "done": 0},
                     {"text": "Qualche minuto di corsa facile", "at": {"@": ("Seconda", 629.56)}, "hl": {"@": ("Seconda", 629.56)}}]),
            E("tipCard", ("Facile", 633.78), until=("camminare.", 637.78), pad=0.4, label="👃 Il test",
              text="Il naso basta → corri. Non basta → cammina."),
            E("strike", ("ascoltare", 639.62), 1.0, text="Ascoltare l'ego"),
            E("notesTodo", ("E", 640.68), until=("squat.", 643.42), pad=0.2, full=True, y=0.07, vh=620, date="Domani",
              v=vM(82.2, py=0.66), title="Da fare *domani*",
              items=[{"text": "Cammina 10 minuti", "done": 0}, {"text": "Qualche minuto di corsa facile", "done": 0},
                     {"text": "Squat completo", "at": {"@": ("terza", 641.0)}, "hl": {"@": ("terza", 641.0)}}]),
            E("timerRing", ("Talloni", 645.52), until=("secondi.", 647.5), pad=0.7, y=0.5, seconds=30, label="talloni a terra"),
            E("unlock", ("hai", 649.8), until=("quotidiana.", 652.72), pad=0.4, title="Hai trovato",
              text="Il tuo primo esercizio di manutenzione", emoji="🏅"),
            E("zoom", ("molto", 670.72), 1.4, amount=1.12),
            E("notesTodo", ("lungo", 671.6), until=("giorni.", 677.38), pad=0.3, full=True, y=0.07, vh=620, date="Domani",
              v=vM(89.6, py=0.7), title="Da fare *domani*", badge="TUTTI I GIORNI", badgeAt={"@": ("Tutti", 676.78)},
              items=[{"text": "Cammina 10 minuti", "done": 0.3}, {"text": "Qualche minuto di corsa facile", "done": 0.7},
                     {"text": "Squat completo", "done": 1.1}]),
        ],
    ),

}
