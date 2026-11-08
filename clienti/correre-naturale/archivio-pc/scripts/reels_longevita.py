"""Definizione dei 6 reel dal video 'Ho letto 5 studi sulla longevità'.

Tempi = secondi del video sorgente. Ancore = (parola, tempo sorgente approssimativo).
overrides = (da, a, inizio video sostitutivo): audio originale, immagine B-roll da altro punto.
"""
from reel_engine import GREEN, GREEN_D, INK

R1 = dict(
    id="R1_ultimi-20-anni", keyword="PIANO", cover_src=1.05, cta_sub="Inizia a mandare al corpo i segnali giusti",
    cover=dict(kicker="CI HAI MAI PENSATO?", lines=["30 anni in più…", "ma alla {FINE}"]),
    parts=[(0, 10.1), (58.6, 68.95), (76.6, 92.25), (100.3, 105), (114.2, 130.2), (661.3, 666.55)],
    # la scheda originale 58.7-69.4 e la barra 84.6-92.5 riportano 58 e ~23 anni: Daniele dice 60 e 20
    overrides=[(58.5, 62.6, 69.4), (62.6, 69.1, 45.9), (84.55, 87.9, 51.5), (87.9, 90.3, 282.1),
               (90.3, 92.4, 409.13), (128.4, 130.3, 130.3)],
    zoom_src=[(126.3, 128.4, 1.22)],
    adjust={1: (0.0, 0.33), 3: (0.0, -0.21), 4: (0.10, 0.0)},   # 1: «healthspan» finisce a 69,14 s (Ross: tagliato a metà)   # "rallenta": coda con un "e" accennato; "La differenza" parte all'attacco
    highlights=[("30", 1.7), ("fine", 5.18), ("dipendi", 8.22), ("lifespan", 63.86), ("healthspan", 67.96),
                ("83", 83.58), ("60", 87.86), ("declino", 91.76), ("autonomia", 102.38), ("genetica", 120.7),
                ("segnali", 124.06), ("correre", 666.02)],
    fx=[
        dict(type="emoji", at=("seduto", 6.44), dur=1.8, char="🛋️"),
        dict(type="card", at=("lifespan", 63.86), until=("healthspan", 67.96), pad=0.0,
             lines=[("LIFESPAN", "Black", 84, GREEN_D), ("quanti anni vivi", "Bold", 48, INK)]),
        dict(type="card", at=("healthspan", 67.96), dur=1.6,
             lines=[("HEALTHSPAN", "Black", 84, GREEN), ("quanti anni vivi bene", "Bold", 48, INK)]),
        dict(type="versus", at=("83", 83.58), right_at=("60", 87.86), until=("passiamo", 89.6), pad=0.1,
             left=("83", "anni di vita", GREEN_D), right=("~60", "anni in salute", GREEN)),
        dict(type="big", at=("20", 90.62), dur=1.4, text="20 ANNI"),
        dict(type="sfx", at=("20", 90.62), kind="impact"),
        dict(type="pills", at=("dolori", 100.38), until=("rallenta", 104.04),
             items=["dolori cronici", "fiato corto", "perdita di autonomia", "mente che rallenta"],
             items_at=[("dolori", 100.38), ("fiato", 101.12), ("perdita", 101.86), ("mente", 102.9)]),
        dict(type="emoji", at=("corsa", 119.22), dur=1.5, char="🏃"),
        dict(type="checklist", at=("genetica", 120.7), until=("mandato", 125.1), title="COSA FA LA DIFFERENZA?",
             items=["la genetica", "i segnali che mandi"], marks=["no", "ok"],
             items_at=[("genetica", 120.7), ("segnali", 124.06)]),
        dict(type="big", at=("movimento", 128.8), dur=1.3, text="MOVIMENTO\nAEROBICO", size=170),
        dict(type="sfx", at=("movimento", 128.8), kind="pop"),
    ],
)

R2 = dict(
    id="R2_nessun-farmaco", keyword="MOTORE", cover_src=195.9, cta_sub="Inizia da 10 minuti al giorno",
    cover=dict(kicker="LO SAPEVI?", lines=["quello che nessun", "{FARMACO} fa"]),
    parts=[(179, 201.5), (203.8, 241.6)],
    overrides=[(191.25, 198.3, 141.3), (198.3, 201.6, 198.52)],
    highlights=[("13", 185.46), ("15%", 189.82), ("farmaco", 193.0), ("15", 205.86),
                ("51", 215.34), ("30", 225.1), ("45", 229.52), ("10", 232.94), ("maratona", 235.0),
                ("biologica", 238.92)],
    fx=[
        dict(type="emoji", at=("farmaco", 193.0), until=("longevità", 196.96), pad=0.2, char="💊"),
        dict(type="big", at=("nessuno", 197.58), dur=1.0, text="NESSUNO"),
        dict(type="sfx", at=("nessuno", 197.58), kind="impact"),
        dict(type="card", at=("155", 207.48), until=("adulti", 210.32), pad=0.6,
             lines=[("155.000", "Black", 120, GREEN_D), ("adulti seguiti per 15 anni", "Bold", 46, INK)]),
        dict(type="emoji", at=("correva", 212.08), dur=1.3, char="🏃"),
        dict(type="emoji", at=("51", 215.34), dur=2.2, char="⏱️"),
        dict(type="sfx", at=("51", 215.34), kind="pop"),
        dict(type="emoji", at=("cardiovascolari", 231.72), dur=1.6, char="❤️"),
        dict(type="emoji", at=("maratona", 235.0), dur=1.4, char="🚫"),
    ],
)

R3 = dict(
    id="R3_cellule", keyword="RINNOVO", cover_src=384.8, cta_sub="Corri per rinnovarti, non solo per le calorie",
    cover=dict(kicker="TI SEI MAI CHIESTO…", lines=["cosa succede nelle tue", "{CELLULE} quando corri"]),
    parts=[(242.8, 246.4), (252.5, 258.1), (289.3, 315.3), (316.8, 326.7), (381.3, 388.1)],
    # 303.8-307.4 nel sorgente è una barra di ricerca stile Google: sostituita con il mitocondrio 3D
    overrides=[(242.7, 246.5, 326.8), (303.75, 307.4, 258.1)],
    zoom_src=[(383.5, 388.2, 1.2)],
    highlights=[("mitocondri", 254.02), ("energetiche", 256.32), ("statici", 290.82), ("giusti", 294.3),
                ("efficienti", 300.3), ("vecchi", 307.5), ("nuovi", 310.8), ("hardware", 312.78),
                ("calorie", 319.6), ("nuove", 326.38), ("rinnovarti", 382.48)],
    fx=[
        dict(type="emoji", at=("centrali", 255.72), dur=2.2, char="⚡"),
        dict(type="checklist", at=("movimento", 294.8), until=("mitocondri", 299.18), title="SEGNALI GIUSTI",
             items=["movimento aerobico", "respirazione nasale", "intensità controllata"],
             items_at=[("movimento", 294.8), ("respirazione", 295.92), ("intensità", 297.14)]),
        dict(type="big", at=("mitofagia", 303.76), dur=1.2, text="MITOFAGIA"),
        dict(type="sfx", at=("mitofagia", 303.76), kind="impact"),
        dict(type="checklist", at=("vecchi", 307.5), until=("nuovi", 310.8), pad=0.5,
             items=["mitocondri vecchi", "mitocondri nuovi"], marks=["no", "ok"],
             items_at=[("vecchi", 307.5), ("nuovi", 310.8)]),
        dict(type="bar", at=("aggiornamento", 311.72), until=("cellulare", 314.56), label="AGGIORNAMENTO IN CORSO",
             **{"from": 0.1, "to": 1.0}),
        dict(type="emoji", at=("calorie", 319.6), dur=1.5, char="🔥"),
        dict(type="emoji", at=("vecchie", 323.2), dur=1.6, char="🪫"),
        dict(type="emoji", at=("costruiscine", 325.34), dur=1.6, char="🔋"),
        dict(type="big", at=("aggiorna", 387.54), dur=1.0, text="SI AGGIORNA", size=180),
        dict(type="sfx", at=("aggiorna", 387.54), kind="pop"),
    ],
)

R4 = dict(
    id="R4_cervello", keyword="CAMMINA", cover_src=480.9, cta_sub="Inizia a muoverti, anche solo camminando",
    cover=dict(kicker="LO DICE LA SCIENZA:", lines=["camminare può far", "{CRESCERE} il cervello"]),
    parts=[(473.7, 521.7)],
    zoom_src=[(479.9, 483.2, 1.18)],
    highlights=[("movimento", 476.32), ("120", 485.56), ("camminato", 487.84), ("40", 492.22),
                ("stretching", 494.6), ("ippocampo", 499.2), ("memoria", 502.24), ("2%", 504.76),
                ("cresciuto", 511.42), ("diminuito", 515.56), ("orologio", 520.14)],
    fx=[
        dict(type="emoji", at=("cervello", 474.34), dur=2.0, char="🧠"),
        dict(type="emoji", at=("camminato", 487.84), dur=2.2, char="🚶"),
        dict(type="emoji", at=("stretching", 494.6), dur=1.6, char="🧘"),
        dict(type="emoji", at=("memoria", 502.24), dur=1.8, char="🧠"),
        dict(type="big", at=("2%", 512.26), dur=1.2, text="+2%", size=240),
        dict(type="sfx", at=("2%", 512.26), kind="impact"),
        dict(type="emoji", at=("diminuito", 515.56), dur=1.4, char="📉"),
        dict(type="emoji", at=("indietro", 519.32), dur=2.0, char="⏪"),
    ],
)

R5 = dict(
    id="R5_bugia-running", keyword="TECNICA", cover_src=546.9, cta_sub="Impara a correre con il metodo Correre Naturale®",
    cover=dict(kicker="TE L'HANNO MAI DETTO?", lines=["la {BUGIA} più diffusa", "nel running"]),
    parts=[(537.5, 552.8), (560, 582.95), (597.4, 609.7)],
    zoom_src=[(600.28, 602.3, 1.22)],
    highlights=[("bugia", 540.74), ("male", 544.14), ("pronto", 546.06), ("limitatore", 571.45),
                ("naso", 575.7), ("forte", 578.08), ("giusti", 602.06), ("conseguenza", 608.96)],
    fx=[
        dict(type="emoji", at=("pronto", 546.06), dur=1.8, char="🤕", pos="R"),
        dict(type="big", at=("quando", 551.18), dur=1.0, text="QUANDO"),
        dict(type="sfx", at=("quando", 551.18), kind="impact"),
        dict(type="checklist", at=("troppo", 560.64), until=("mitocondri", 565.68), title="SEGNALI SBAGLIATI",
             items=["troppo forte", "bocca aperta", "col fiatone"], marks=["no", "no", "no"],
             items_at=[("troppo", 560.64), ("bocca", 561.6), ("fiatone", 562.4)]),
        dict(type="emoji", at=("naso", 570.82), dur=2.4, char="👃", pos="R"),
        dict(type="card", at=("rallenta", 579.08), until=("cammina", 579.76), pad=0.55, title="IL CONSIGLIO",
             lines=[("RALLENTA O CAMMINA", "Black", 70, GREEN_D)]),
        dict(type="sfx", at=("rallenta", 579.08), kind="pop"),
        dict(type="checklist", at=("debolezza", 580.96), until=("biologica", 582.38), pad=0.5,
             items=["debolezza", "intelligenza biologica"], marks=["no", "ok"],
             items_at=[("debolezza", 580.96), ("intelligenza", 581.8)]),
        dict(type="checklist", at=("tecnica", 602.92), until=("gestire", 607.66), title="SEGNALI GIUSTI",
             items=["tecnica corretta", "corpo preparato", "intensità gestibile"],
             items_at=[("tecnica", 602.92), ("corpo", 604.38), ("un'intensità", 605.82)]),
    ],
)

R6 = dict(
    id="R6_tre-cose-domani", keyword="DOMANI", cover_src=659.6, cta_sub="Parti oggi: 10 minuti, solo dal naso",
    cover=dict(kicker="INIZIA COSÌ:", lines=["3 cose da fare", "da {DOMANI}"]),
    parts=[(610.5, 629.0), (629.5, 653.4), (668.7, 677.8)],
    overrides=[(610.4, 612.3, 606.0)],
    adjust={2: (0.14, 0.0)},   # evita un "si" accennato prima di "Il corpo"
    highlights=[("10", 615.5), ("naso", 617.08), ("pranzo", 618.04), ("potentissimo", 621.8),
                ("mitocondri", 625.72), ("facile", 633.24), ("naso", 635.74), ("camminare", 637.78),
                ("l'ego", 640.28), ("squat", 643.42), ("talloni", 645.52), ("30", 647.16), ("dolore", 649.22),
                ("giusti", 676.28)],
    fx=[
        dict(type="tracker", at=("prima", 612.5), until=("quotidiana", 652.72),
             items_at=[("prima", 612.5), ("seconda", 629.56), ("terza", 641.0)]),
        dict(type="emoji", at=("naso", 617.08), dur=0.9, char="👃"),
        dict(type="emoji", at=("pranzo", 618.04), dur=1.5, char="🍽️"),
        dict(type="emoji", at=("accendendo", 622.8), dur=1.8, char="⚡"),
        dict(type="emoji", at=("corsa", 633.02), dur=1.6, char="🏃"),
        dict(type="emoji", at=("squat", 643.42), dur=1.6, char="🦵"),
        dict(type="emoji", at=("30", 647.16), dur=1.8, char="⏱️"),
        dict(type="big", at=("tutti", 676.78), dur=1.0, text="TUTTI\nI GIORNI", size=170),
        dict(type="sfx", at=("tutti", 676.78), kind="impact"),
    ],
)

REELS = {r["id"].split("_")[0]: r for r in (R1, R2, R3, R4, R5, R6)}
