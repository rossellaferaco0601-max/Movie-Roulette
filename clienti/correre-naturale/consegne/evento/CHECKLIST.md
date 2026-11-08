# Vlog «Workshop Correre Naturale» — 24/10/2026, Vicenza · versione 4 (7/11/2026, feedback di Oscar)

## Cosa è cambiato nella v4 (Oscar via Ross, 7/11): `VLOG_workshop_v4.mp4`
- **Voce di Daniele dai primissimi secondi**: sotto l'hook (7 stacchi rapidi + titolo a macchina da scrivere) parte a 0,25 s la voce fuori campo
  del selfie «È da un po' che siamo fermi, quindi domani sarà una giornata scoppiettante» (4,7 s, sottotitolata), poi il selfie continua con
  «Ragazzi, non vedo l'ora…» come prima. Tastiera dell'hook spenta (non deve coprire la voce).
- **Musica**: lo stesso brano del condensato (Jalen Ngonda, *If You Don't Want My Love*) come letto per tutto il vlog, **basso**: 0,11 sotto il
  parlato (ducking), ×1,8 sui B-roll, ×2,2 nella CTA. Il brano dura 146,9 s e il vlog 160,8: letto di 161 s (`work/evento/musica/jalen_bed_vlog.wav`,
  copia in `ReelStudio/assets/music/jalen_bed_vlog.mp3`) = brano da 0 a 128,8 s (fine del secondo ritornello, colpo 264) poi di nuovo dalla levata
  del secondo ritornello (105,4 s, colpo 216) fino alla coda, giunta di 40 ms sui colpi misurati, dissolvenza di 4 s sul finale della CTA.
- **Meno effetti sonori**: da 33 + 10 nella CTA a 13 + 4: restano gli whoosh dei capitoli (8), lo scatto delle polaroid (3), l'impatto del timbro
  FALSO e il pop del 170-180; nella CTA solo whoosh, invio, notifica e «Segui» (`cta.sfxLite`). Volume sfx 0,32 (era 0,4).
- **Logo tondo senza ombra quadrata**: era il box-shadow dell'immagine (`shadow="morbida"` → `"no"`).
- Non toccato: «una parola di troppo alla fine di qualche frase» (Oscar: «può andare bene anche così»); ADV 60 s già fatto a parte.
- Controlli v4: durata 150,8 s (2:31) invariata; loudness −18,1 LUFS, picco −0,8 dBTP; livello medio ~−20 dB dove Daniele parla (voce fuori campo
  a 0,5-2,5 s allo stesso livello del selfie), ~−27 dB sui B-roll con la sola musica; sottotitoli della voce fuori campo presenti sotto l'hook
  (`hook.captions`); 16 fotogrammi (`work/evento/frames_v4/`): logo tondo pulito, volti liberi, CTA con «Segui» separato.
- Nota: `VID_20261105_160704_511_….mp4` in questa cartella (150,9 s, HEVC) è una copia ricodificata della v3 arrivata da telefono, non una versione nuova.

# Versione 3b (5/11/2026, notte)

Sorgenti: materiale dell'evento dal telefono di Paola (`input/evento/`, 36 clip iPhone verticali + 13 foto). I 3 video Vimeo della pagina
`correrenaturale.com/sp/workshop-vicenza/` (testimonianze, scaricati in `input/evento/sito/`) sono stati montati e poi tolti su richiesta di Ross.
File in questa cartella: `VLOG_workshop_v3.mp4` (1080×1920, 30 fps, 140,8 s + CTA 10 s = 2:31), `VLOG_workshop_copertina.jpg`, `VLOG_workshop_didascalia.txt`.
Le v1 e v2 restano per confronto. Progetto modificabile in ReelStudio: `progetti/cn-vlog_workshop` (↻ Ricarica progetto).

## Cosa è cambiato dalla v2 (correzioni di Ross, 5/11 sera)
- **Qualità del girato (la cosa più importante)**: le clip iPhone sono **HDR** (HLG / Dolby Vision, 10 bit, BT.2020). La v1 e la v2 le convertivano
  in SDR senza tone mapping: per questo erano piatte, scure e slavate. Ora ogni pezzo passa da un tone mapping Hable a BT.709 e poi da una
  correzione leggera (rumore, nitidezza, contrasto); sui controluce del prato una curva un po' più forte. Le foto non avevano il problema.
- **Logo circolare** su disco crema in alto a destra (si legge su qualsiasi sfondo), spento solo nei 2,5 s di «MEGLIO» gigante.
- **Hook** più lungo (5,7 s su 7 stacchi rapidi) a macchina da scrivere su 6 righe: «Ti portiamo in / una giornata di / WORKSHOP / con / CORRERE /
  NATURALE», con WORKSHOP, CORRERE e NATURALE grandi in verde; suono dei tasti.
- **Sticker «LA SERA PRIMA · DALL'UFFICIO»** molto più grande sul selfie.
- **Programma della giornata** subito dopo il selfie, prima del check-in, sulla villa: pillola verde «Programma di oggi», pillola azzurra
  «SABATO 24 OTTOBRE · VICENZA», cinque righe con gli orari.
- **Orari tondi** nei capitoli: 9:30 CHECK IN · 10:00 LEZIONE IN SALA · 12:30 TECNICA SUL PRATO · 12:45 LA LEZIONE · 16:00 PIEDI E POSTURA ·
  17:30 ANALISI DELL'APPOGGIO · 18:00 RUNNING ANALYSIS · 18:30 LA STORIA DI DANIELA.
- **Polaroid** con didascalie in maiuscolo: «LA SQUADRA» su entrambe le foto del check-in (via «pausa sui gradini»), «TECNICA DI CORSA», «IL GRUPPO»; più grandi.
- **Piedi e postura** più lungo, con il parlato di Daniele: «chi sente che il peso è tutto sui talloni… venga su» (0644), il lavoro sul piede
  («questo è il sistema nervoso… vai tranquillo, fidati, ce l'hai», 0645), la pedana (0646), il tapis roulant con «ancora perfetta: vedete che non è cambiato niente, stesso ritmo, stessa postura,
  stesso relax, stesse braccia, stesso busto, stesso appoggio» (0649). Targhette verdi brevi: «CHI CARICA I TALLONI?», «IL PIEDE SI RILASSA»,
  «STESSA TECNICA, PIÙ VELOCE».
- **Tagli più larghi**: ogni frase parte 0,4 s prima (Whisper segna gli attacchi in ritardo) e finisce 0,35 s dopo; il margine si riduce da solo solo se c'è un'altra parola attaccata,
  così non si includono parole mozzate della frase accanto.
- **Sottotitoli**: font Blinker anche nei sottotitoli, parola detta in lime ingrandita pochissimo, più spazio tra le parole → niente sovrapposizioni
  (nella v2 «MATTINAPER», «BATTE LADANIELA» ecc.).
- **Testimonianze dal sito** (blocco «Dicono di Correre Naturale», 30 s, prima di Daniela): Monica «ero proprio convinta di non essere portata per la
  corsa… c'è stato questo clic nella mia testa»; Beatrice «avevo dei dolori alle ginocchia che mi avevano anche portato a smettere di correre per un po'»;
  Andrea «uno dei migliori benefici è stato sicuramente il fatto di non infortunarmi più»; Monica «se ci sono riuscita io, con 17 kg in sovrappeso,
  penso che veramente ci può riuscire chiunque». I video originali hanno i sottotitoli impressi in basso: le clip stanno dentro il **palco crema**
  (come Daniela) con la finestra sulla parte alta, nome sopra la finestra, sottotitoli nostri sotto. Il palco entra ed esce sui pezzi vicini.
- **CTA** 10 s con testi più grandi (×1,25), ombra sul testo e velatura più scura sotto; «Commenta WORKSHOP: ti mando date e info».
- **Data e luogo** nel programma, nella copertina («24 OTTOBRE · VICENZA · DAL VIVO») e nella didascalia.

## Correzioni della v3b (Ross, 5/11 sera, dopo la v3)
- **Causa vera delle parole tagliate (in tutte le versioni)**: il master era un `concat -c copy` di pezzi AAC; ogni pezzo porta ~25 ms di priming che
  il concat non toglie, così audio e video slittavano di 25 ms a pezzo (fino a +545 ms nella chiusura) rispetto ai tempi calcolati, e ogni taglio
  cadeva prima della vera fine della frase. Misurato per cross-correlazione pezzo/master; ora il master ha timestamp esatti e scarto 0 ms
  (`vlog_master.py`: `duration` esplicita nel concat + audio PCM ricostruito).
- **Parole tagliate a fine frase, in più** («Correre Naturale», «muoversi», «armamentario di essere umano», «appoggio», «miracolato», «20 minuti», chiusura):
  tutte le frasi scelte finiscono con una parola a cui Daniele/Daniela attaccano subito la parola dopo, e Whisper chiude le parole in anticipo.
  Ora ogni pezzo parlato ha una **dissolvenza audio** (0,12 s in entrata, 0,28 s in uscita; 0,55 s nella chiusura) e il margine entra di proposito
  0,3 s nella parola successiva, che sfuma invece di essere troncata: la parola scelta resta sempre intera (`vlog_master.py` fi/fo, `speech()` in `vlog_build3.py`).
- «Programma di oggi» → **«Programma della giornata»**; capitolo 12:30 → **«ANALISI TECNICA DELLA CORSA»** (anche nel programma).
- Freccia «le impronte» 0,9 s ed etichetta della pedana 1,5 s (prima duravano troppo).
- **Blocco delle testimonianze tolto**: dalla running analysis si passa direttamente alla storia di Daniela (18:30).
- **Chiusura**: effetto «MEGLIO» rifatto sul girato con tone mapping (prima era stato reso sul pezzo scuro della v2: «non si vede bene»), polaroid del gruppo
  tolta (copriva le persone dietro Daniele), coda di 0,9 s con l'audio che sfuma prima della CTA (prima tagliava di netto su «questo»).

## Scaletta
| Tempo | Clip | Cosa si vede / sente | Grafica |
|---|---|---|---|
| 0–5,7 | 0614 · 0599 · 0624 · 0647 · 0612 · 0609 · 0598 | 7 stacchi rapidi | hook a macchina da scrivere su 6 righe + tasti, cornice REC |
| 5,7–12,8 | selfie della vigilia | «Ragazzi, non vedo l'ora… per il workshop di Correre Naturale» | scarabocchio + punch-in (skill), sticker grande, sottotitoli |
| 12,8–18,3 | 0615 | la villa, il gruppo seduto fuori | programma di oggi con data e luogo |
| 18,3–25,4 | 0598 (2×) · 0599 · 0600 | check-in, QR e maglie | capitolo 9:30, due polaroid «LA SQUADRA» |
| 25,4–38,8 | 0601 · 0606 · 0609 (1,6×) | sala, Daniele parla, esercizi in piedi | capitolo 10:00, etichette, sottotitoli |
| 38,8–44,1 | 0612 · 0614 | corse sotto la pergola, gruppo | capitolo 12:30, etichetta |
| 44,1–51,8 | 0620 (95,8–103,5) | «tanti dicono: non c'è una tecnica di corsa… è un po' stupido pensarlo» | stacco a J, capitolo 12:45, timbro FALSO, polaroid |
| 51,8–58,6 | 0620 (207,3–214,2) | «il ritmo di 170-180… ottimizza il nostro armamentario di essere umano» | widget 170-180 al minuto |
| 58,6–65,4 | 0624 · 0620 (239–243,4) | corridori; «stiamo migliorando l'essere umano grazie alla corsa» | stacco a J, parole cinetiche + sottotitoli |
| 65,4–77,8 | 0644 | «chi sente che il peso è tutto sui talloni… venga su» | capitolo 16:00, targhetta |
| 77,8–93,5 | 0645 | lavoro sul piede; «questo è il sistema nervoso… fidati, ce l'hai» | etichetta, targhetta |
| 93,5–99,7 | 0646 · 0647 (1,3×) | pedana con la mappa delle pressioni, tapis roulant | capitoli 17:30 · 18:00, freccia «le impronte», etichette, sticker |
| 101,2–111,5 | 0649 · 0648 | «ancora perfetta: stesso ritmo, stessa postura… stesso appoggio» | targhetta, sottotitoli |
| 111,5–130,1 | 0650 (0–10,8 · 118,5–126,5) | Daniela: «ero una che stava sul divano… mi ha miracolato»; «la Daniela di 60 anni batte quella di 50 di 20 minuti» | capitolo 18:30, nome, palco crema con finestrella |
| 130,1–140,8 | 0650 (133,5–144,2) | Daniele al gruppo: «tra dieci anni voglio che stiate meglio di adesso… sfruttate la corsa per far questo» + coda sfumata | «MEGLIO» dietro di lui (skill), parole che si accumulano |
| 140,8–150,8 | CTA (clip 0628 sotto) | «Vuoi esserci al prossimo workshop?» · commento WORKSHOP, DM, mi piace/condividi/salva, Segui | CTA coaching 10 s con suoni |

## Scelte e limiti (da sapere)
- Le testimonianze del sito (percorso online, non del workshop) restano trascritte in `work/evento/testimonianza_*_words.json` e le frasi scelte nelle
  versioni precedenti di `vlog_build3.py` (`progetti/cn-vlog_workshop/versioni/`), se servissero in un altro reel.
- Numeri a schermo solo detti: 170-180 (Daniele), 60 / 50 / 20 minuti (Daniela), 10 / 20 anni (Daniele).
- Sottotitoli corretti a mano: «stiate», «po'», «Correre Naturale», «170-180», «busto» (Whisper: «butto»).
- Clip con audio spaziale Apple (0600, 0621, 0625, 0626): ffmpeg non lo decodifica, solo B-roll muto. Il parlato di 0646 (pedana) non è usato: la
  trascrizione è confusa («visita motoria»), meglio non rischiare un sottotitolo sbagliato.
- Durata 2:31 con la CTA. Il selfie WhatsApp (576 px) resta il pezzo più morbido.
- La parola della CTA è WORKSHOP (parola libera, non del brand): si cambia in `scripts/vlog_build3.py` → `cta.keyword`.
- Spazio disco: durante il lavoro il disco C: era pieno per 490 cartelle temporanee di Remotion (688 GB) lasciate dai render di ReelStudio; cancellate
  con l'ok di Ross. Se si riempie di nuovo: `%LOCALAPPDATA%\Temp\remotion-v4.*-assets*`.

## Controlli fatti (render finale v3b)
- ✓ Master: durata del file = somma dei fotogrammi (162,633 s), cross-correlazione audio pezzo/master = 0 ms su tutti gli 11 pezzi parlati
  (prima della correzione: da +230 a +545 ms).
- ✓ Durata 150,8 s (2:31), 1080×1920, 30 fps; loudness −17 LUFS, picco −1,4 dBTP; niente musica, suoni a 0,4.
- ✓ Fine di ogni frase: inviluppo RMS (20 ms) sul render, la voce decade dolcemente a zero prima di ogni taglio (dissolvenza 0,28 s; 0,55 s nella chiusura);
  i pezzi che partono sulla prima parola («Ero», «chi sente») non hanno dissolvenza in entrata.
- ✓ Ritrascrizione del montato (large-v3): corrispondenza 94 %, nessuna parola doppia né mozzata ai tagli; differenze tutte spiegate: «stiate» (Daniele dice
  «state», corretto a mano), «dieci/10», «venti/20», «po'», «170-180», «perché» sul prato (Whisper sente «poi»), «venga su» e «tu» detti piano in sala, «ce l'hai»,
  un «se», un «il» e un «bene» che Whisper aggiunge. «busto» (0649, «stesso busto») resta la parola più incerta: da confermare all'ascolto.
- ✓ Fotogrammi: 15 del render finale (`work/evento/frames/sheet.jpg`) + prove prima del render: volti sempre liberi, capitoli/etichette/targhette sotto il
  mento o sopra la testa, sottotitoli senza sovrapposizioni, logo circolare leggibile, «MEGLIO» sul girato corretto, chiusura senza polaroid.
- ✓ Lampi (`qa_flash.py`): nessun flash; segnalati solo i tagli rapidi dell'hook e i cambi di scena.
- ✓ Testo a schermo solo con parole e numeri detti; niente emoji; font Blinker ovunque; colori verde / azzurro / crema / bianco, lime solo per la parola detta.

## Come modificare
- Scaletta, capitoli, etichette, targhette, polaroid, testimonianze, effetti: `scripts/vlog_build3.py`
  (poi `node scripts/rs_render.js video cn-vlog_workshop output/evento/VLOG_workshop_v3.mp4`), oppure dalla dashboard ReelStudio sul progetto `cn-vlog_workshop`.
- Tone mapping e correzione colore per pezzo: `scripts/vlog_master.py` (`TONEMAP`, `GRADE_STD`, `GRADE_FLARE`, `zoom/zx/zy`).
- Polaroid: `scripts/vlog_polaroid.py`; logo su disco: `progetti/cn-vlog_workshop/foto/logo_disco.png`; effetti della skill: `work/evento/fx/plan_*.json`.
- Trascrizioni dei video del sito: `work/evento/testimonianza_*_words.json` (large-v3), per scegliere altre frasi.

---

# Versione condensata — `VLOG_workshop_60s.mp4` (7/11/2026, v7 con il brano scelto da Ross)
Reference di Ross: il reel «a day in my life» (`input/reference_condensato.mp4`) e il suo progetto CapCut con la timeline dei testi
(`input/reference_condensato2.mp4`). Ross: «la struttura deve essere questa, devi replicare applicando le cose del brand; la prima parte deve
essere così, poi magari allunghi». 7/11: «Usa questo audio [Jalen Ngonda, *If You Don't Want My Love*], il video deve durare 1 minuto al massimo,
usa le riprese migliori, togli ogni altro tipo di audio o suono». 7/11 notte: «è quasi perfetto»: raffica del titolo «fino a 0:06-0:07 della
canzone», CTA più leggibile e un po' più lunga, musica che sfuma meglio, targhette più leggibili, spazi di visione di Instagram. Poi (v7):
«devi seguire il ritmo della musica, l'intro con il titolo dura troppo, massimo a 5 secondi», «alcuni cambi di box sono troppo veloci, come Daniela»,
«il tasto Segui si sovrappone agli altri»; titoli delle targhette dettati da Ross (15, due scene restano senza).
Progetto `progetti/cn-vlog_workshop60s` (`scripts/vlog_build60s.py`, mix `scripts/vlog_mix60s.py`, controlli `scripts/vlog_qa60s.py`).
Versioni precedenti: v1 (scene da 2-3 s, 5 frasi parlate → «perso il ritmo», `VLOG_workshop_60s_v1.mp4`), v2 (parole grandi in pillola, titolo
fisso → «la struttura deve essere questa»), v3 (struttura giusta; correzioni: logo scontornato, velo verde, «con Correre Naturale» più grande,
più cambi di stile, via «la sera prima» e la location, più spezzoni, targhette in box), v4 (musica libera «pop solare» + 2 frasi parlate,
`VLOG_workshop_60s_v2_popsolare.mp4`), v5a (brano dal ritornello, `VLOG_workshop_60s_v3_ritornello.mp4`), v5b (brano dall'inizio, raffica 2 s, CTA 7 s), v6 (raffica 7 s → «dura troppo»).

## Struttura della reference (misurata) → nostro montaggio
| Reference (timeline CapCut) | Noi |
|---|---|
| titolo impilato su 5 righe «a / day / in / my / life», le prime 4 fisse, «life» che cambia font a raffica; sotto, 9 clip video da ~0,17 s | «Una / giornata (lime) / di / workshop / con Correre Naturale®» su velo verde brand (62 %): 4 righe fisse, «workshop» cambia stile 16 volte in 4,2 s (uno per inquadratura, 15 stili a rotazione: Blinker, DM Serif corsivo, Pacifico, Anton, Playfair corsivo, Caveat, Bebas, Lobster, Fraunces corsivo, Marker, Abril, Instrument corsivo, Righteous, Oswald, Bangers; lime/bianco/azzurro/crema); sotto 16 inquadrature da 7-8 fotogrammi (un'anteprima della giornata in ordine), stacco secco di tutto il titolo insieme |
| un'etichetta piccola centrata per scena, ~1 s, ~0,2 s di vuoto prima della successiva | targhetta in **box verde brand con testo bianco** Blinker Bold 84 px (le lunghe su due righe), box larga max 900 px, centro a y 0,54, 0,2 s di vuoto tra l'una e l'altra |
| video che cambia ogni ~1,1 s sui colpi della musica, stacchi secchi, alcune etichette su 2 clip | **uno stacco ogni due colpi del brano** (≈0,98 s), sui colpi misurati uno per uno (il tempo della band oscilla tra 121 e 125 bpm: una griglia fissa sbaglierebbe fino a 250 ms), `cutBlend 0`, etichette su 2-4 inquadrature (mai sotto i 2 stacchi, ≈2 s); nella raffica uno stacco ogni mezzo colpo |
| nessun parlato, solo la canzone | nessun parlato, nessun ambiente, nessun effetto sonoro: **solo il brano** (Ross, 7/11) |
| «Bye» su nero | «Ci vediamo al prossimo» sui volti che corrono, poi CTA 8 s sul primo ritornello |

## Spazi di visione di Instagram (Ross, 7/11 notte)
- Tutto ciò che va letto sta sopra i ~1500 px coperti dalla didascalia e a sinistra della colonna delle icone (x > 950, da ~1150 px in giù):
  targhette con il centro a 1037 px e larghe al massimo 900 px; nella CTA le icone mi piace/condividi/salva stanno a 1120-1355 px e il bottone
  «Segui» a 1400-1490 px (40 px di aria, prima si toccavano) (`iconsTop`/`followTop` in `Reel.tsx`), la notifica DM in alto resta sotto l'area del profilo. Logo in alto a destra a 163 px.

## Brano e sincronizzazione
- Brano: Jalen Ngonda, *If You Don't Want My Love* (file di Ross, `input/musica/jalen_ngonda.mp3`, decodificato in WAV per il taglio esatto).
  Struttura (trascrizione Whisper + colpi librosa): strofa 0-56 s, **ritornello 56-78 s** («But if you don't want my love… let me know»), seconda strofa
  81-106 s, **secondo ritornello 106-129 s**, coda 129-141 s.
- Finestra usata: **dall'inizio del brano** (0,0 s; primo colpo a 0,21 s) al colpo 106 (51,73 s): 106 colpi = 53 slot. Raffica del titolo = le prime due
  battute (8 colpi, 4,2 s; Ross: «massimo 5 secondi, segui il ritmo»), 16 inquadrature sui mezzi colpi; poi uno stacco ogni due colpi; la CTA parte a 51,7 s e finisce a 59,7 s sul
  primo ritornello («But if you don't want my love», 56-60 s), brano in **dissolvenza di 5 s con curva a S** (`afade curve=hsin`). Totale **59,7 s**
  (limite di Ross: 1 minuto).
- Livello: tratto portato a −14 LUFS (il file originale è a −10,7), picco sotto −1 dBTP. Nessun altro suono: clip tutte mute, niente pop sulle targhette,
  niente sfx nella CTA.
- È una canzone commerciale: per la pubblicazione su Instagram conviene usarla dalla libreria audio dell'app (dall'inizio del brano) o verificare la
  licenza; il file consegnato ha la traccia dentro per il controllo del montaggio.

## Struttura (51,7 s + CTA 8 s = 59,7 s; uno stacco ogni ≈0,98 s, sui colpi misurati)
| Tempo | Targhetta | Clip |
|---|---|---|
| 0–4,2 | titolo in raffica (16 inquadrature, 16 stili) | 0599 · 0600 · 0604 · 0611 · wa_gruppo · 0612 · 0613 · wa_drill · 0622 · 0621 · 0629 · 0645 · 0646 · 0648 · 0650 · 0628 |
| 4,2–7,1 | 9:30 / Check in | 0598 (2×, Daniele entra) · 0598 (al banco) · 0600 (piedi sulla tavoletta) |
| 7,1–10,0 | 10:00 / Lezione Teorica | 0606 (Daniele sul palco) · 0604 (rullo) · 0606 (esercizio a terra) |
| 10,0–12,9 | Riscaldamento | 0609 (1,6×) · 0611 · 0611 |
| 12,9–15,8 | 12:30 Prove di corsa | 0627 (Daniele mostra) · wa_gruppo_cammino (Daniele corre verso camera) · 0627 (il gruppo filma) |
| 15,8–18,7 | (senza targhetta, sul prato) | 0612 · 0614 · 0613 (un corridore) |
| 18,7–21,6 | La lezione | 0620 (3 momenti) |
| 21,6–24,6 | Esercizi | wa_drill (Daniele mostra) · 0624 · 0613 |
| 24,6–28,4 | Si corre | 0622 (basso angolo) · 0621 (verso camera) · 0625 (gruppo largo) · 0623 |
| 28,4–31,3 | La squadra | 0625 · 0628 · 0629 (volti nel sole) |
| 31,3–33,2 | Pausa | 0631 · 0631 |
| 33,2–36,2 | 16:00 Postura / piedi / e squat | 0644 (Daniele allo schermo) · 0645 (mani sui piedi) · 0645 (squat) |
| 36,2–39,2 | 17:30 La pedana | 0646 (schermo) · 0646 (Daniele in squat, 2 stacchi) |
| 39,2–42,1 | 18:00 Running analysis | 0647 (1,3×) · 0647 · 0648 |
| 42,1–45,0 | (senza targhetta, analisi) | 0649 · 0650 (Daniele corre sul tapis) · 0649 |
| 45,0–46,9 | 18:30 Testimonianze (muta, 2 stacchi) | 0650 |
| 46,9–48,8 | Chiusura (Daniele in primo piano, 2 stacchi) | 0650 |
| 48,8–51,7 | Ci vediamo / al prossimo? | 0628 · 0629 (volti nel sole) · 0623 |
| 51,7–59,7 | CTA coaching, WORKSHOP (8 s, testi al 135 %, sul primo ritornello, sfuma in 5 s) | 0628 |

## Stile
- Logo circolare **bianco scontornato** in alto a destra per tutto il reel (ombra morbida cotta nel PNG `logo_circ_bianco_ombra.png`), mai sul volto.
- Niente inquadrature della sola location (villa), niente «la sera prima»; i cambi di stile del titolo usano i font caricati in ReelStudio
  (`FONT_FILES` in `src/remotion/lib.ts`), è la sola deroga al «solo Blinker», chiesta da Ross per replicare la reference.
- CTA: «Vuoi esserci al *prossimo* workshop?» / «Una giornata dal vivo con Daniele» / «Commenta WORKSHOP per date e info», fondo più scuro (70-94 %),
  frasi corte su una riga.
- Girato con tone mapping HDR→SDR; master a fotogrammi esatti (ogni pezzo ha esattamente i fotogrammi tra due colpi; le velocità 2× e 1,3× sono
  rapporti esatti fotogrammi sorgente/uscita).

## Controlli (render finale v7, 7/11 notte)
- ✓ Durata 59,73 s con la CTA (51,73 + 8), nel minuto; 1552 fotogrammi di montato = i 106 colpi del brano dall'inizio del file.
- ✓ Raffica del titolo 0-4,2 s = le prime due battute (8 colpi), finisce sul primo colpo della terza; 16 inquadrature sui mezzi colpi, «workshop»
  cambia stile a ogni inquadratura (Righteous a 118 px, Bangers al posto di Syne: a 150 px uscivano dal bordo).
- ✓ Targhette: 15 titoli dettati da Ross, nessuna sotto i 2 stacchi (Testimonianze e La pedana allungate), 84 px, fino a tre righe; due scene
  (prato, analisi) restano senza targhetta perché Ross ha accorpato i titoli. Scene detection: 53 stacchi attesi, 57 rilevati (quelli mancanti sono
  dentro la stessa clip o tra inquadrature simili).
- ✓ Loudness −14,5 LUFS integrata, picco −3,0 dBTP; dissolvenza di 5 s con curva a S (−16 → −31 → −49 dB negli ultimi tre secondi). Nessun altro suono.
- ✓ 33 fotogrammi (`work/evento/frames60s/sheet.jpg`) + 8 a piena risoluzione: volti liberi, targhette leggibili sopra la colonna delle icone;
  CTA con icone a 1120 px e «Segui» a 1400 px, 40 px di aria, tutto sopra i 1500 px della didascalia.

