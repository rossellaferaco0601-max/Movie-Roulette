"""Definizione dei reel dal video «YTCN 38» (correre con meno fatica: efficienza, flessibilità metabolica,
corsa lenta, naso bianco, sforzo percepito, strategie, costanza).

Tempi = secondi del video sorgente. Ancore = (parola, tempo sorgente approssimativo).
FX(tipo, ancora, dur | until=ancora di fine, ...props). `sfx` sempre None (Ross 3/11: niente effetti sonori).
"""
from ytcn38_build import FX, LIME, MEADOW

# correzioni a Whisper (verificate con seconda passata sugli spezzoni)
CORRECTIONS = {
    "replace": [
        (14.0, 14.1, [("instancabile?", 14.06, 14.64)]),
        (207.7, 208.2, [("riesci", 206.46, 206.84), ("a", 206.84, 206.90), ("trasformare", 206.90, 207.60),
                        ("meglio", 207.60, 207.84), ("l'aria", 207.84, 208.48)]),   # Whisper: «hai meglio» (buco 206,5-207,8)
        (245.5, 245.6, [("fine", 245.52, 246.10)]),     # Whisper: «fino» (fine a se stesso)
    ],
    "words": [],
}

# stile comune: look dei reel già pubblicati su @correrenaturale (sottotitoli maiuscoli bianchi, parola detta in lime,
# handle in alto, niente riquadri), transizioni in dissolvenza, niente salti di zoom
STYLE = {
    "palette": "brand", "titleFont": "brand", "videoStyle": "talking", "layout": "full", "filter": "caldo",
    "captions": {"style": "hormozi", "position": "low", "y": 0.80, "size": 0.85, "wordsPerLine": 3, "lines": 1,
                 "activeColor": LIME, "color": "#FFFFFF", "stroke": 4, "anim": "pop", "emphColor": LIME,
                 "wordFx": "colore", "highlight": LIME, "wordGap": 0.26, "alwaysOn": True, "activeBase": 1.03, "activeScale": 0.04},
    "emphWords": [], "breathing": False, "cutZoom": True, "pushIn": False, "cutBlend": 5,
    "logo": False, "logoKind": "pictogramOnDark", "progressBar": False, "gradient": False, "vignette": False,
    "focusX": 0.5, "focusY": 0.3, "faceZone": {"on": True, "y0": 0.06, "y1": 0.47},
}

MUSIC = {"Y1": "lofi-corsa-mattutina", "Y2": "riflessiva", "Y3": "motivazionale", "Y4": "ambient-natura",
         "Y5": "acustica-calma", "Y6": "chill-domenica", "Y7": "elettronica-notte", "Y8": "pop-solare", "Y9": "epica-traguardo"}

SUB = "Nei percorsi di coaching personalizzato di Correre Naturale® "   # 6/11, Ross: «personalizzato»


def CTA(keyword, text, sub, variant="green", video_from=None):
    c = dict(style="coaching", duration=6, keyword=keyword, text=text, sub=SUB + sub, variant=variant,
             note=f"Commenta {keyword} e ti mando tutte le info 👇")
    if video_from is not None:
        c["variant"] = "video"
        c["video"] = {"src": MEADOW, "from": video_from}
    return c


REELS = {
    # ------------------------------------------------------------ Y1 · l'auto che consuma (metafora)
    "Y1": dict(
        id="Y1_auto-efficiente", keyword="EFFICIENTE", cover_src=37.0,
        cover=dict(kicker="CI HAI MAI PENSATO?", lines=["Il tuo corpo è un'auto", "che {CONSUMA} troppo"]),
        hook=dict(text="Correre con *meno* fatica", top=940),
        cta=CTA("EFFICIENTE", "Vuoi correre con *meno fatica*?",
                "rendiamo il tuo corpo efficiente come la natura l'ha progettato, con un piano su misura."),
        parts=[(0.0, 14.64), (36.06, 60.94), (60.98, 65.34), (71.08, 79.06)],
        highlights=[("fatica", 2.34), ("velocemente", 3.5), ("battito", 9.5), ("instancabile", 14.06), ("consuma", 37.8),
                    ("rifornimento", 45.9), ("efficiente", 49.9), ("quattro", 53.08), ("resa", 57.5), ("motore", 60.5),
                    ("giusto", 64.9), ("carburante", 77.5)],
        fx=[
            FX("glassList", ("velocemente", 3.5), until=("instancabile", 14.06), pad=0.5, mode="check", y=0.45, title="Ti piacerebbe…",
               items=[{"text": "Meno fatica", "at": 0}, {"text": "Più veloce a parità di sforzo", "at": {"@": ("velocemente", 3.5)}},
                      {"text": "Battito più basso", "at": {"@": ("battito", 9.5)}}, {"text": "Leggero, fluido, instancabile", "at": {"@": ("leggero", 12.66)}}]),
            FX("lowerThird", ("Immagina", 36.06), 1.7, name="Daniele Vecchioni", role="Ideatore del metodo Correre Naturale®"),
            FX("gauge", ("consuma", 37.8), until=("rifornimento", 45.9), pad=0.5, y=0.5, left="pieno", right="vuoto",
               label="Un'auto che *consuma* troppo", moveAt={"@": ("acceleri", 39.6)}),
            FX("zoom", ("super", 49.5), 1.6, amount=1.07),
            FX("glassStats", ("parità", 50.92), until=("motore", 60.5), pad=0.5,
               items=[{"big": "4×", "label": "la distanza, stesso carburante", "at": {"@": ("quattro", 53.08)}, "x": 0.05, "y": 0.5, "w": 0.43, "accent": True},
                      {"big": "=", "label": "stesso sforzo, più resa", "at": {"@": ("Stesso", 55.16)}, "x": 0.52, "y": 0.5, "w": 0.43}]),
            FX("keyword", ("giusto", 64.9), 1.2, text="NEL MODO GIUSTO"),
            FX("pills", ("consumare", 72.5), until=("migliore", 78.5), pad=0.5,
               items=["Meno energia alla stessa velocità", "Il carburante migliore"]),
        ],
    ),
    # ------------------------------------------------------------ Y2 · flessibilità metabolica (educativo)
    "Y2": dict(
        id="Y2_flessibilita-metabolica", keyword="CARBURANTE", cover_src=110.0,
        cover=dict(kicker="LO SAPEVI?", lines=["Il corpo cambia {MARCIA}", "tra grassi e zuccheri"]),
        hook=dict(text="Cos'è la *flessibilità* metabolica", top=940),
        cta=CTA("CARBURANTE", "Vuoi insegnare al corpo a usare il *carburante* giusto?",
                "alleniamo la tua flessibilità metabolica con un piano costruito su di te.", variant="cream"),
        parts=[(94.14, 101.14), (107.56, 117.32), (117.88, 143.14)],
        highlights=[("metabolica", 95.5), ("efficiente", 99.0), ("energia", 100.5), ("marcia", 111.0), ("grassi", 111.8),
                    ("zuccheri", 112.8), ("crisi", 116.0), ("camminata", 119.5), ("grassi", 123.0), ("abbondante", 126.0),
                    ("stabile", 127.3), ("sprint", 131.5), ("carboidrati", 138.3), ("rapidamente", 140.5), ("limitati", 142.5)],
        fx=[
            FX("zoom", ("efficiente", 99.0), 1.6, amount=1.07),
            FX("duoGlow", ("marcia", 111.0), until=("energetiche", 116.8), pad=0.4, tf={"y": 0.14},
               items=[{"title": "GRASSI", "sub": "lenti e abbondanti", "at": {"@": ("grassi", 111.8)}},
                      {"title": "ZUCCHERI", "sub": "veloci e limitati", "at": {"@": ("zuccheri", 112.8)}}]),
            FX("gauge", ("intensità", 118.3), until=("massimali", 133.5), pad=0.5, y=0.5, left="camminata", right="sprint",
               label="In base all'*intensità*", moveAt={"@": ("Mano", 127.96)}),
            FX("keyword", ("grassi", 123.0), 1.2, text="GRASSI"),
            FX("keyword", ("carboidrati", 138.3), 1.2, text="CARBOIDRATI"),
            FX("pills", ("rapidamente", 140.5), until=("limitati", 142.5), pad=0.5, items=["Energia più rapida", "Ma limitata"]),
        ],
    ),
    # ------------------------------------------------------------ Y3 · a cosa serve (benefici)
    "Y3": dict(
        id="Y3_a-cosa-serve", keyword="RESISTENZA", cover_src=150.0,
        cover=dict(kicker="PER CHI CORRE", lines=["Correre a lungo", "senza {CROLLI}"]),
        hook=dict(text="Flessibilità metabolica: a cosa ti *serve*", top=940),
        cta=CTA("RESISTENZA", "Vuoi correre *più a lungo* senza crolli?",
                "costruiamo la tua resistenza con un piano progressivo e su misura.", video_from=91.5),
        parts=[(143.24, 146.46), (148.80, 174.50), (174.64, 185.76)],
        highlights=[("importante", 145.0), ("lungo", 151.0), ("scorte", 153.0), ("crolli", 155.5), ("fame", 157.0),
                    ("recupero", 161.5), ("dipendente", 166.0), ("salute", 170.5), ("chilometri", 176.3), ("lungo", 178.5),
                    ("forte", 180.0), ("crisi", 184.5)],
        fx=[
            FX("glassList", ("permette", 150.0), until=("esterni", 167.9), pad=0.5, mode="check", y=0.45, title="A cosa ti serve",
               items=[{"text": "Correre a lungo", "at": 0},
                      {"text": "Niente crolli e crisi di fame", "at": {"@": ("crolli", 155.5)}},
                      {"text": "Recuperi meglio", "at": {"@": ("recupero", 161.5)}},
                      {"text": "Meno dipendente dagli zuccheri", "at": {"@": ("dipendente", 166.0)}}]),
            FX("notif", ("salute", 170.5), until=("corsa", 174.2), pad=0.5, y=0.5, app="Bonus", emoji="❤️",
               lines=[{"text": "Migliore *salute metabolica*, anche fuori dalla corsa", "at": 0, "strong": True}]),
            FX("zoom", ("Più", 174.64), 1.5, amount=1.07),
            FX("gravityDrop", ("chilometri", 176.3), until=("spingere", 180.8), pad=0.7, y=0.76, title="Più efficiente =",
               items=[{"text": "Più chilometri", "emoji": "🛣️", "at": 0, "good": True},
                      {"text": "Più a lungo", "emoji": "⏱️", "at": {"@": ("lungo", 178.5)}, "good": True},
                      {"text": "Più forte", "emoji": "⚡", "at": {"@": ("forte", 180.0)}, "good": True}]),
            FX("keyword", ("crisi", 184.5), 1.3, text="SENZA CRISI"),
        ],
    ),
    # ------------------------------------------------------------ Y4 · il vero segreto (meno fatica)
    "Y4": dict(
        id="Y4_vero-segreto", keyword="SEGRETO", cover_src=187.0,
        cover=dict(kicker="IL VERO SEGRETO", lines=["Meno fatica", "a parità di {SFORZO}"]),
        hook=dict(text="Il vero *segreto* per correre meglio", top=940),
        cta=CTA("SEGRETO", "Vuoi correre meglio *a parità di sforzo*?",
                "lavoriamo su efficienza, respirazione e tecnica con un piano su misura per te."),
        parts=[(185.84, 202.04), (204.84, 234.30)],
        highlights=[("segreto", 186.5), ("economici", 188.5), ("energia", 190.0), ("efficienza", 194.5), ("fatica", 196.0),
                    ("carburante", 200.0), ("efficiente", 205.84), ("ossigeno", 215.5), ("grassi", 218.5), ("scorte", 221.92),
                    ("fatica", 226.5), ("stress", 227.5), ("infortuni", 230.0), ("migliori", 231.5), ("parità", 233.3)],
        fx=[
            FX("signal", ("economici", 188.5), until=("efficienza", 194.5), pad=0.5, y=0.5, title="Il vero segreto",
               items=[{"text": "Diventare economici", "at": 0}, {"text": "Risparmiare energia", "at": {"@": ("risparmiare", 189.5)}},
                      {"text": "Zona di massima efficienza", "at": {"@": ("zona", 192.5)}}]),
            FX("postit", ("fatica", 196.0), until=("dentro", 201.8), pad=0.5, y=0.5,
               lines=[{"text": "La fatica non è solo una questione di gambe.", "at": 0, "style": "small"},
                      {"text": "È come gestisci il *carburante* che hai dentro.", "at": {"@": ("carburante", 200.0)}}]),
            FX("zoom", ("efficiente", 205.84), 1.4, amount=1.07),
            FX("pills", ("l'aria", 207.84), until=("muoverti", 211.82), pad=0.5, items=["Aria che respiri", "Cibo che mangi", "Energia utile"]),
            FX("glassList", ("ossigeno", 215.5), until=("fretta", 224.68), pad=0.5, mode="check", y=0.45, title="Più efficiente",
               items=[{"text": "Più ossigeno ai muscoli", "at": 0}, {"text": "Grassi come carburante principale", "at": {"@": ("grassi", 218.5)}},
                      {"text": "Meno scorte metaboliche", "at": {"@": ("scorte", 221.92)}}, {"text": "Smaltite più in fretta", "at": {"@": ("smaltisci", 223.54)}}]),
            FX("checklist", ("fatica", 226.5), until=("migliori", 231.5), pad=0.6, title="Il risultato", mode="check",
               items=["Meno fatica", "Meno stress sul corpo", "Meno rischio di infortuni", "Prestazioni migliori"]),
            FX("keyword", ("parità", 233.3), 1.3, text="A PARITÀ DI SFORZO"),
        ],
    ),
    # ------------------------------------------------------------ Y5 · corri più lentamente (contrarian)
    "Y5": dict(
        id="Y5_corri-lento", keyword="LENTO", cover_src=238.5,
        cover=dict(kicker="SEMBRA ASSURDO, MA…", lines=["Per correre forte", "devi correre {LENTO}"]),
        hook=dict(text="Per correre forte devi correre *lentamente*", top=940),
        cta=CTA("LENTO", "Vuoi imparare a correre *lento* nel modo giusto?",
                "ti insegniamo la corsa a bassa intensità di qualità, quella che costruisce il motore aerobico.", variant="cream"),
        parts=[(234.38, 240.42), (240.66, 258.20), (258.36, 268.82), (269.06, 282.50)],
        highlights=[("lentamente", 239.6), ("attenzione", 241.0), ("piano", 243.3), ("lento", 247.6), ("attiva", 249.5),
                    ("consapevole", 250.3), ("qualità", 251.5), ("natura", 256.5), ("forte", 260.5), ("rigenerazione", 264.0),
                    ("stress", 268.0), ("basse", 274.0), ("aerobico", 276.5), ("resistenza", 278.5), ("fieno", 281.6)],
        fx=[
            FX("keyword", ("lentamente", 239.6), 1.3, text="PIÙ LENTAMENTE"),
            FX("stamp", ("attenzione", 241.0), until=("stesso", 246.44), pad=0.3, y=0.53, text="«Correre piano tanto per fare»",
               stamp="NO", stampAt={"@": ("fine", 245.52)}),
            FX("glassList", ("lento", 247.6), until=("qualità", 251.5), pad=0.6, mode="check", y=0.45, title="Un lento…",
               items=[{"text": "A bassa intensità attiva", "at": {"@": ("bassa", 248.6)}}, {"text": "Consapevole", "at": {"@": ("consapevole", 250.3)}},
                      {"text": "Di qualità", "at": {"@": ("qualità", 251.5)}}]),
            FX("zoom", ("natura", 256.5), 1.5, amount=1.07),
            FX("limiter", ("maggior", 258.6), until=("stress", 268.3), pad=0.5, y=0.52, title="Quasi tutti corrono *troppo forte*",
               limitLabel="zona aerobica", low="lento", overText="troppo forte", overAt={"@": ("troppo", 260.3)}),
            FX("statStack", ("maggior", 271.5), until=("duratura", 280.8), pad=0.6, y=0.52,
               big="Intensità *bassa*", label="la maggior parte del tempo",
               chips=[{"text": "Motore aerobico", "at": {"@": ("aerobico", 276.5)}}, {"text": "Resistenza vera e duratura", "at": {"@": ("resistenza", 278.5)}}]),
            FX("script", ("fieno", 281.6), 1.6, text="fieno in cascina", rotate=-5, color="#F4F1E5"),
        ],
    ),
    # ------------------------------------------------------------ Y6 · niente orologi: naso bianco
    "Y6": dict(
        id="Y6_naso-bianco", keyword="NASO", cover_src=305.0,
        cover=dict(kicker="LA DASHBOARD INTERNA", lines=["Niente orologi:", "respira dal {NASO}"]),
        hook=dict(text="Non servono *orologi* per allenarti bene", top=940, duration=1.8),   # corto: sotto ci sono le app che si cancellano
        cta=CTA("NASO", "Vuoi allenarti *ascoltando* il tuo corpo?",
                "impari a usare respirazione nasale e sforzo percepito per correre nella zona giusta.", video_from=26.5),
        parts=[(289.46, 332.58)],
        highlights=[("orologi", 290.3), ("cardiofrequenzimetri", 291.5), ("tabelle", 292.6), ("ascolto", 299.08), ("nasale", 305.0),
                    ("naso", 310.4), ("fluido", 311.5), ("aerobico", 314.5), ("bocca", 316.8), ("troppo", 320.9), ("bianco", 326.9),
                    ("rumore", 331.0)],
        fx=[
            FX("jiggleApps", ("orologi", 290.3), until=("complicate", 293.3), pad=1.4, y=0.5, delAt={"@": ("complicate", 293.3)},
               items=[{"text": "Orologi", "emoji": "⌚", "at": 0}, {"text": "Cardiofrequenzimetri", "emoji": "❤️", "at": {"@": ("cardiofrequenzimetri", 291.5)}},
                      {"text": "Tabelle complicate", "emoji": "📊", "at": {"@": ("tabelle", 292.6)}}]),
            FX("keyword", ("ascolto", 299.08), 1.3, text="L'ASCOLTO DEL CORPO"),
            FX("zoom", ("respirazione", 304.92), 1.6, amount=1.07),
            FX("keyword", ("naso", 310.4), 1.2, text="SOLO DAL NASO"),
            FX("signal", ("fluido", 311.5), until=("giusto", 315.3), pad=0.6, y=0.5, title="Range aerobico",
               items=[{"text": "Solo dal naso", "at": 0}, {"text": "Fluido", "at": {"@": ("fluido", 311.5)}}, {"text": "Senza sforzo", "at": {"@": ("sforzo", 313.0)}}]),
            FX("limiter", ("Appena", 315.7), until=("troppo", 323.3), pad=0.5, y=0.52, title="Bocca aperta = *troppo*",
               limitLabel="solo naso", low="ok", overText="troppo forte", overAt={"@": ("bocca", 316.8)}),
            FX("docTitle", ("bianco", 326.9), until=("bianco", 327.3), pad=0.9, l1="Naso", l2="bianco", tf={"y": 0.36}),
            FX("tipCard", ("rumore", 331.0), until=("possibile", 332.3), pad=0.8, label="👃 Naso bianco",
               text="Respiri dal naso facendo meno rumore possibile"),
        ],
    ),
    # ------------------------------------------------------------ Y7 · sforzo percepito 3-4
    "Y7": dict(
        id="Y7_sforzo-percepito", keyword="ASCOLTO", cover_src=342.0,
        cover=dict(kicker="DA 1 A 10", lines=["La corsa lenta", "sta tra {3 E 4}"]),
        hook=dict(text="Lo *sforzo* percepito: da 1 a 10", top=940),
        cta=CTA("ASCOLTO", "Vuoi che sia il corpo a *guidarti*?",
                "alleniamo l'ascolto del corpo, senza dipendere da numeri e dispositivi."),
        parts=[(336.72, 361.20)],
        highlights=[("percepito", 337.84), ("scala", 338.92), ("bassa", 341.12), ("3", 342.88), ("4", 343.42), ("difficoltà", 346.3),
                    ("infinito", 350.5), ("ascolto", 352.5), ("efficiente", 355.8), ("guidarti", 358.0), ("dispositivi", 360.3)],
        fx=[
            FX("glassStats", ("scala", 338.92), until=("4", 343.42), pad=1.0,
               items=[{"big": "3–4", "label": "su una scala da 1 a 10", "at": {"@": ("3", 342.88)}, "x": 0.15, "y": 0.5, "w": 0.7, "accent": True, "bar": 35}]),
            FX("strike", ("difficoltà", 346.3), 1.6, text="In difficoltà"),
            FX("keyword", ("infinito", 350.5), 1.3, text="ALL'INFINITO"),
            FX("zoom", ("ascolto", 352.5), 1.5, amount=1.07),
            FX("notif", ("guidarti", 358.0), until=("esterni", 360.8), pad=0.5, y=0.5, app="Il tuo corpo", emoji="🧭",
               lines=[{"text": "Ti guida lui, senza numeri o dispositivi", "at": 0, "strong": True}]),
        ],
    ),
    # ------------------------------------------------------------ Y8 · 5 strategie
    "Y8": dict(
        id="Y8_cinque-strategie", keyword="STRATEGIE", cover_src=366.0,
        cover=dict(kicker="OLTRE LA CORSA LENTA", lines=["5 strategie per correre", "con meno {FATICA}"]),
        hook=dict(text="5 *strategie* per correre con meno fatica", top=940),
        cta=CTA("STRATEGIE", "Vuoi un piano che metta insieme *tutte* le strategie?",
                "volume, forza, mobilità, recupero e camminata diventano un percorso costruito su di te.", variant="cream"),
        parts=[(361.22, 403.66), (403.78, 419.96)],
        highlights=[("strategie", 364.0), ("efficienza", 366.5), ("volume", 369.6), ("chilometri", 370.8), ("criterio", 372.5),
                    ("economico", 374.5), ("bici", 377.5), ("nuoto", 378.3), ("aerobico", 380.5), ("forza", 386.0),
                    ("mobilità", 387.5), ("alimentazione", 395.0), ("recupero", 396.2), ("carburante", 398.5), ("camminata", 408.5),
                    ("sconfitta", 410.8), ("potentissimo", 414.5), ("resistenza", 415.8), ("carico", 417.8), ("solida", 419.5)],
        fx=[
            FX("chapter", ("Innanzitutto", 367.28), 2.4, number="01", title="Aumenta il volume"),
            FX("keyword", ("criterio", 372.5), 1.2, text="CON CRITERIO"),
            FX("chapter", ("complementari", 376.5), 2.4, number="02", title="Attività complementari"),
            FX("pills", ("stimolano", 380.0), until=("muscoli", 385.1), pad=0.5, items=["Sistema aerobico", "Zero sovraccarico"]),
            FX("chapter", ("forza", 386.0), 2.4, number="03", title="Forza e mobilità"),
            FX("zoom", ("forte", 388.5), 1.5, amount=1.07),
            FX("chapter", ("alimentazione", 395.0), 2.4, number="04", title="Alimentazione e recupero"),
            FX("strike", ("rallenti", 402.5), 1.5, text="Progressi che rallentano"),
            FX("chapter", ("camminata", 408.5), 2.4, number="05", title="La camminata"),
            FX("stamp", ("sconfitta", 410.8), until=("sconfitta", 411.0), pad=1.6, y=0.53, text="«Camminare è una sconfitta»",
               stamp="FALSO", stampAt=0.9),
            FX("glassList", ("resistenza", 415.8), until=("solida", 419.5), pad=0.5, mode="check", y=0.45, title="Camminare",
               items=[{"text": "Più resistenza", "at": 0}, {"text": "Meno carico", "at": {"@": ("carico", 417.8)}}, {"text": "Base solida", "at": {"@": ("base", 419.0)}}]),
        ],
    ),
    # ------------------------------------------------------------ Y9 · la costanza
    "Y9": dict(
        id="Y9_costanza", keyword="COSTANZA", cover_src=428.0,
        cover=dict(kicker="VALE PIÙ DI TUTTO", lines=["Non conta oggi.", "Conta {OGNI GIORNO}"]),
        hook=dict(text="La cosa che vale *più di tutte*", top=940),
        cta=CTA("COSTANZA", "Vuoi una routine che regga *nel tempo*?",
                "costruiamo con te un percorso semplice e costante, settimana dopo settimana.", video_from=97.4),
        parts=[(420.08, 451.94)],
        highlights=[("tutte", 422.0), ("intensità", 424.5), ("perfetto", 426.0), ("tecnica", 427.5), ("costanza", 428.8),
                    ("domani", 431.5), ("giorno", 433.5), ("settimana", 434.5), ("mese", 435.5), ("anno", 436.5), ("tempo", 440.0),
                    ("veloce", 445.5), ("leggero", 446.5), ("elastico", 447.5), ("efficiente", 449.0), ("sforzo", 451.3)],
        fx=[
            FX("gravityDrop", ("intensità", 424.5), until=("tecnica", 427.5), pad=0.4, y=0.76, title="Più di…",
               items=[{"text": "Corsa a bassa intensità", "emoji": "🐢", "at": 0}, {"text": "Programma perfetto", "emoji": "📋", "at": {"@": ("programma", 425.5)}},
                      {"text": "Qualsiasi tecnica", "emoji": "🦶", "at": {"@": ("tecnica", 427.5)}}]),
            FX("keyword", ("costanza", 428.8), 1.4, text="LA COSTANZA"),
            FX("strike", ("domani", 431.5), 1.6, text="Oggi o domani"),
            FX("pills", ("giorno", 433.5), until=("anno", 436.5), pad=0.6, items=["Ogni giorno", "Ogni settimana", "Ogni mese", "Ogni anno"]),
            FX("zoom", ("vera", 438.5), 1.5, amount=1.07),
            FX("checklist", ("trasformarsi", 444.8), until=("efficiente", 449.0), pad=0.6, title="Il tuo corpo si trasforma", mode="check",
               items=["Più veloce", "Più leggero", "Più elastico", "Più efficiente"]),
            FX("keyword", ("sforzo", 451.3), 1.3, text="CON MENO SFORZO"),
        ],
    ),
}
