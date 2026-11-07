# REGOLE DI MONTAGGIO — Reel Correre Naturale®

Da leggere prima di ogni montaggio. Ogni correzione ricevuta va aggiunta in fondo con la data.

> Copia ricostruita dalle sessioni Claude Code del 3–7 novembre 2026 (originale sul PC di Ross:
> `C:\Users\roxfe\Documents\reel_progetti\correre_naturale\REGOLE-MONTAGGIO.md`). Se le due copie divergono, fa fede quella sul PC.

## Regole base (brief del 2026-11-03)

### Contenuto
- Ogni reel si capisce da solo: un'idea sola, inizio forte, chiusura con un pensiero completo.
- Mai tagliare una frase a metà.
- Numeri e dati solo se li dice Daniele. Non inventare nulla.

### Hook (primi 3 s)
- Copertina animata stile "Parliamo di…", non una semplice scritta.
- Max 7-8 parole, UNA sola parola evidenziata.
- Hook verbale + scritto + visivo insieme (molti guardano senza audio).

### Volto e inquadratura
- 9:16, 1080×1920, 30 fps.
- Per ogni pezzo: Volto (crop), Intero (grafiche originali da non tagliare) o Diviso.
- Sticker, emoji, schede, scritte MAI sul volto: trovare prima la zona del volto, grafiche sopra/sotto.
- Parole a comparsa/titoloni sul volto solo per max 1,5 s.

### Sottotitoli e parole chiave
- Sottotitoli sempre presenti, sincronizzati, corretti a mano (termini tecnici della corsa).
- Evidenziate le parole di senso: numeri, errori, parti del corpo, risultati.
- Alcune parole chiave compaiono GRANDI a comparsa: in quel momento sottotitoli nascosti. *(superata il 5/11: i sottotitoli restano sempre)*

### Audio e tagli
- Controllare ogni punto di taglio: niente parole doppie o mozzate. Whisper è in ritardo di 0,1-0,3 s → aggiustare di 0,1 s alla volta.
- Togliere silenzi e respiri lunghi, mantenendo ritmo nelle pause.
- SFX: max 1 ogni 7 s, solo 1-2 momenti chiave per reel, niente whoosh sull'hook, volume 0,5-0,6.
- Musica (se presente) in ducking sotto la voce.

### Dinamismo
- Un elemento visivo ogni 3-4 s, sincronizzato con la parola giusta.
- Alternare punch-in, parola a comparsa, scheda, emoji, B-roll.
- Mai due grafiche grandi nello stesso momento.

### CTA finale
- Schermata finale di 4 s DOPO la fine del video. *(dal 6/11: almeno 7 s nei reel, 10 s nel vlog)*
- Una sola parola chiave da scrivere in DM (CORRO, PIANO, GUIDA, SCUOLA).

### Brand
- Verde #49762E, azzurro #B8D7EA, crema #F4F1E5. Font Blinker.
- Logo mai ruotato, deformato o azzurro.
- Niente watermark di altre app/piattaforme. La reference non va mai inserita nel reel.

### Consegna
- MP4 1080×1920, copertina con volto libero, didascalia (tema → approfondimento non detto nel video → conclusione → CTA con parola chiave → pochi hashtag; niente engagement bait), checklist ✓.
- Prima di consegnare: estrarre e controllare 6-8 fotogrammi (volto libero, sottotitoli leggibili, colori brand).

## Note tecniche (scoperte durante il montaggio, non sono correzioni)
- 2026-11-03 — Le schede grafiche del video YouTube a volte riportano numeri diversi dal parlato (es. 58 vs «60», ~23 vs «20 anni»): in quei punti sostituire l'immagine con B-roll e rifare la scheda col numero detto.
- 2026-11-03 — Nel sorgente ci sono animazioni che imitano altre piattaforme (barra di ricerca "Search" stile Google, popup "Subscribe" di YouTube): mai usarle, coprire con B-roll.
- 2026-11-03 — Whisper sbaglia gli attacchi anche di 0,4 s: ogni taglio va agganciato al silenzio reale (RMS) e poi verificato ritrascrivendo il reel montato (scripts/qa_audio.py).
- 2026-11-03 — Pipeline: scripts/build.py (montaggio), scripts/qa_audio.py (tagli), scripts/qa_frames.py (fotogrammi + volto), scripts/make_covers.py (copertine).

- 2026-11-04 — Video «YTCN 38» (correre con meno fatica): un'unica inquadratura fissa in esterna, 4K 29,97 fps, senza schede né B-roll. Pipeline dedicata: scripts/reels_ytcn38.py (definizione dei 9 reel), scripts/ytcn38_build.py (progetti ReelStudio), scripts/ytcn38_qa.py (ritrascrizione + fotogrammi), scripts/ytcn38_covers.py, scripts/ytcn38_didascalie.py. Sorgente in ReelStudio/progetti/cn-ytcn38-src (hardlink al file in Download).
- 2026-11-04 — Stile preso dai reel già pubblicati su @correrenaturale (cartella «Reel CN già pubblicati»): Daniele a tutto schermo, sottotitoli maiuscoli bianchi con la parola detta in verde lime #95FF00, handle @correrenaturale in alto a destra, nessun riquadro; hook come scritta animata sopra Daniele (hook.style «boxed», visibile dal primo fotogramma) invece della copertina piena «Parliamo di…»; basta mettere hook.style «talk» per tornare alla copertina.
- 2026-11-04 — Volto molto in alto nel sorgente (capelli vicini al bordo): zona volto y 0,06-0,42, sottotitoli a y 0,80, parole a comparsa spostate al petto (tf.y 0,30).
- 2026-11-04 — Il video YouTube originale contiene già dei jump cut (33 in 7:46): dentro un pezzo apparirebbero come salti di posa. Il builder li rileva (framediff > 18 sul proxy) e divide il pezzo lì con `blend`, così la dissolvenza di 5 fotogrammi copre anche quelli.

## Correzioni ricevute
<!-- formato: - AAAA-MM-GG — regola -->
- 2026-11-03 — Se un dato (numero, parola) compare in una scheda/animazione, NON va ripetuto nei sottotitoli in quello stesso momento: togliere quelle parole dai sottotitoli (o nasconderli) finché la scheda è a schermo. *(superata il 5/11)*
- 2026-11-03 — Reel troppo statici/noiosi: servono animazioni, effetti e montaggio molto più coinvolgenti (vedi reference "WhatsApp Video 2026-11-03 at 01.34.11 (1).mp4"). Tagli e struttura invece vanno bene.
- 2026-11-03 · Daniele sempre **a fuoco e in alta definizione**: usare il sorgente 4K (`video4k.mp4`, ricavato da `originale.webm`), non la copia 1080p. Niente sfocature su di lui.
- 2026-11-03 · **Pochi B-roll**: mai stock di altre persone come riempitivo. Dove il sorgente ha schede: riprese di Daniele da altri suoi video, suoi fermi immagine nitidi, o scene grafiche con Daniele in finestra. Riprese con la bocca che parla solo se il labiale non si legge.
- 2026-11-03 · **Transizioni fluide**: niente flash, zoom-through, glitch o salti di zoom tra i tagli. Dissolvenza di 5 fotogrammi tra i pezzi (`style.cutBlend`), B-roll in dissolvenza, `cutZoom` spento.
- 2026-11-03 · Reel pubblicati in sequenza: **ogni reel ha animazioni firma diverse** (glass widget, documentary, orbit, bento, prompt bar, jiggle delete, swipe, gravity drop…). Ogni reel ha la sua parola da commentare per il coaching.

- 2026-11-05 — Vlog del workshop (v1 vista da Ross): **niente icona Instagram** in alto, al suo posto il **logo Correre Naturale**; **niente musica**;
  montaggio **stile vlog dinamico** con sticker (forme e pillole brand, niente emoji), **foto della cartella come polaroid**, **orario e attività in evidenza**
  (non pillole piccole), **etichette che spiegano** cosa si vede, sottotitoli anche nelle parti di video; **spazio tra le parole dei sottotitoli non troppo largo**;
  **migliorare la qualità del girato** e correggere i bagliori di luce; hook iniziale «Ti portiamo in una giornata di workshop con Correre Naturale»;
  usare gli effetti caricati (skill `effects`, effetti ReelStudio) e grafiche motion per movimentare. Font e colori sempre del brand.

- 2026-11-05 — **Sottotitoli sempre presenti e precisi**, anche quando una parola o una frase viene animata a schermo (kinetic, palco, titolo
  dietro la persona): c'è chi legge solo i sottotitoli. Vale per tutti i reel futuri. Sostituisce la regola del 3/11 «nascondere i sottotitoli quando
  una scheda mostra lo stesso dato» (i numeri in scheda restano, ma il sottotitolo non si toglie).
- 2026-11-05 — Vlog: foto in polaroid solo se ci sono persone; hook iniziale con **effetto macchina da scrivere** e il suono dei tasti.

## Note tecniche 5/11/2026 — stile «reference» (Y9 v2) e nuovi strumenti
- **Scontorno di Daniele sul PC**: `scripts/rvm_cutout.py <video> <cartella> a-b …` (RobustVideoMatting ONNX in `ReelStudio/tools/rvm`, ¼ s a fotogramma senza GPU, bordi e capelli puliti). Scrive i PNG in `progetti/cn-ytcn38-src/scontorni/<secondi×30>.png`, lo stesso formato dell'effetto «scritta dietro la persona» della dashboard (che usava MediaPipe a 720 px). Scontornare solo i tratti in cui serve (2-4 s l'uno).
- **Titolo dietro la persona** (`behindTitle`): riga piccola in corsivo serif («Sono», «ed è», «con») + parola gigante in lime che passa dietro Daniele. Va in alto (y 0,07) così il volto copre solo la base delle lettere, come «ABDUL» nel reel di zeeuiux; a metà altezza la testa nasconde tutto. L'handle @correrenaturale si spegne mentre il titolo occupa la parte alta. Chi registra la clip di presentazione deve lasciare aria sopra la testa (testa a ⅓ dall'alto).
- Altri effetti stile reference in `src/remotion/effects_cn3.tsx`: `rolePill` (FONDATORE · di Correre Naturale®), `kinetic` (parole grandi una alla volta o che si accumulano, max 2 righe), `togglePills` (pillole nere con levetta lime), `stageCard` (palco crema con titolo evidenziato in lime, grafico che cresce e Daniele in finestrella). Niente effetti sonori anche se il reference li usa.
- **Voce di Daniele clonata** (Chatterbox multilingue, MIT, gira sul PC): `ReelStudio/tools/venv_tts/Scripts/python.exe scripts/voce_test.py <riferimento.wav> <out.wav> "<testo>"`. Riferimento pulito: `work/voce/ref_daniele.wav`. Genera spesso una coda spuria («Grazie»): tagliare al primo silenzio (`silencedetect`). Usarla solo con il consenso di Daniele; nel reel va dichiarata come voce fuori campo della CTA.
- `audio.voiceovers` nel project.json: `[{src, at, dur, volume}]`; la musica scende a metà sotto la voce. La CTA coaching ha ora il bottone «Pubblica» che diventa «✓ Pubblicato» con coriandoli.
- `scripts/rs_render.js` ora passa gli scontorni al render (prima li ignorava: la scritta dietro la persona usciva davanti).
- 2026-11-05 — Y9 v2: **niente clip di presentazione** («Sono Daniele Vecchioni…») e **niente voce clonata** sulla CTA. **Suoni sì** sugli effetti (whoosh, click, pop, impatto, swish; volume 0,45) e nella CTA (tastiera, invio, coriandoli, notifica, successo): la regola «niente effetti sonori» del 3/11 non vale per i reel in stile reference. CTA coaching più animata e interattiva: dito che tocca, commento che si pubblica con coriandoli, notifica DM che arriva, cuoricini, aeroplanino, bottone «+ Segui → ✓ Segui già».
- 2026-11-05 — Bug corretto in `Reel.tsx` (CTA coaching, variante «video»): il clip di Daniele che corre non era dentro una `Sequence`, quindi partiva da `from` + i secondi già trascorsi nel reel (oltre la fine del file → nero; nei reel v1 Y3, Y6 e Y9 la CTA mostrava un punto a caso del clip o il nero: vanno ri-renderizzati). Ora parte esattamente da `cta.video.from`. Nuovo prop facoltativo `cta.overlay` (CSS) per regolare la velatura sopra il clip.

## Note tecniche 5/11/2026 — vlog del workshop dal vivo (materiale da telefono, più clip)
- Materiale dell'evento del 24/10 in `input/evento/` (36 clip iPhone verticali + foto, dal telefono di Paola); inventario in `PROPOSTE-VLOG-evento.md`.
  Le clip con audio spaziale Apple (`apac`: 0600, 0621, 0625, 0626) non si decodificano con ffmpeg: solo B-roll muto.
- **Pipeline C (più sorgenti)**: `scripts/vlog_master.py` normalizza i pezzi scelti (1080×1920, 30 fps, parlato a −16 LUFS, ambiente a −24) e li concatena
  in un master unico; `scripts/vlog_build.py` scrive il progetto ReelStudio `cn-vlog_workshop` (un cut per pezzo con dissolvenza di 5 fotogrammi,
  parole rimappate sul master, effetti ancorati alle parole, CTA coaching con clip dal master); render con `scripts/rs_render.js`; controlli con
  `scripts/vlog_qa.py audio|frames`; copertina con `scripts/vlog_cover.py`.
- Whisper large-v3 su una clip di 6 minuti con `condition_on_previous_text=True` si è bloccato: trascrivere solo i tratti che servono con
  `scripts/transcribe_ranges.py` (VAD, senza condizionamento). Attenzione ai processi di trascrizione in background che sovrascrivono i `_words.json`.
- Ross (5/11): consenso di Daniela e liberatorie ricevuti; musica a scelta mia (`acustica-calma`); solo materiale della cartella; nome «Workshop Correre Naturale».
  La chiusura di Daniele a camera non esiste: usata la sua frase al gruppo in IMG_0650 (133-143 s).

- **5/11/2026 (tecnica, dalla verifica dei finali)** — Whisper chiude le parole 0,05-0,15 s prima del vero: la fine dell'ultimo pezzo di ogni reel va misurata sull'inviluppo audio del sorgente (RMS a 20 ms) e fissata a mano (`tail_end`), non calcolata dalle parole. Mai più di 2 render Remotion in parallelo: con 3 il proxy del 4K va in timeout e può uscire un fotogramma nero singolo su un taglio (controllo `scripts/qa_black.py`).

- **5/11/2026 (Ross)** — Il volto di Daniele deve essere SEMPRE libero: nessuna animazione, box, card, titolo o parola sopra il viso, in nessun fotogramma. Misurare la zona del volto prima di piazzare qualsiasi grafica (sopra la testa o sotto il mento, con margine) e ricontrollare i fotogrammi dove Daniele si muove.
- 2026-11-05 — `Reel.tsx`: con `style.captions.alwaysOn: true` i sottotitoli non vengono più nascosti sotto kinetic/stageCard/behindTitle e non vengono
  tolte le parole già mostrate nelle grafiche (regola «sottotitoli sempre presenti»). Backup in `Reel.tsx.bak-20261105-vlog`. L'hook `typewriter` usa il font
  del brand se `hook.font` è impostato. Vlog v2: `scripts/vlog_build2.py` (capitoli, polaroid da `vlog_polaroid.py`, effetti skill via `fxClip`).

- **2026-11-05 sera (Ross, correzioni sul vlog v2 → v3)** — «Non si vede niente»: le clip iPhone sono **HDR (HLG / Dolby Vision, 10 bit, BT.2020)**:
  senza tone mapping escono piatte e scure. Da ora ogni sorgente HDR passa dal `TONEMAP` di `scripts/vlog_master.py` (Hable → BT.709) prima di qualsiasi
  correzione; controllare `ffprobe … color_transfer` su ogni materiale nuovo, anche per copertine e fotogrammi. Altre regole ricevute:
  logo **circolare** in alto a destra su un disco a contrasto (crema) se serve; hook più lungo e più grande, su righe separate con le parole chiave
  (WORKSHOP, CORRERE NATURALE) grandi; sticker «la sera prima» grande; **sottotitoli senza sovrapposizioni** (parola attiva poco ingrandita,
  `wordGap` 0,3, font Blinker anche nei sottotitoli); **tagli larghi** (0,25 s prima / 0,35 s dopo la parola, ridotti solo se c'è una parola vicina) e
  nessuna parola mozzata; orari con **cifre tonde** (9:30, 10:00, 12:30, 16:00…); didascalie delle polaroid in **maiuscolo** («LA SQUADRA»);
  programma della giornata **prima** del check-in; più girato su piedi e postura con targhette brevi; **data e luogo** sì (24 ottobre · Vicenza);
  CTA più lunga (10 s) con testi più grandi e leggibili; usare anche il materiale della pagina del sito (video Vimeo delle testimonianze), tagliando
  frasi di senso compiuto, anche se il video si allunga. Patch in ReelStudio: `hook.lines` per il typewriter a righe, `cta.textScale/titleTop/subTop/noteTop`,
  `captions.activeBase/activeScale`, `stageCard.kickerFont: "brand"`. Script: `scripts/vlog_build3.py`.
- **2026-11-05 notte (Ross, correzioni sul vlog v3)** — Le «parole tagliate» erano tutte a fine frase, dove chi parla attacca subito la parola dopo:
  Whisper chiude le parole 0,05-0,15 s in anticipo e un taglio secco sull'ambiente fa sentire la parola troncata anche quando è intera. Regola:
  **ogni pezzo parlato ha una dissolvenza audio** (0,12 s in entrata, 0,28 s in uscita) e il margine finale entra di proposito ~0,3 s nella parola
  successiva, che sfuma; quando una frase deve chiudere il reel, coda più lunga (0,9 s) con fade di 0,5 s prima della CTA. Verifica: ritrascrizione +
  inviluppo RMS sui tagli. Altre: gli effetti della skill `effects` vanno resi sul pezzo **già corretto** (tone mapping), altrimenti l'effetto porta
  dentro il girato scuro; freccia/etichette brevi (≤1,5 s) quando indicano una cosa sola; capitolo 12:30 = «ANALISI TECNICA DELLA CORSA»;
  «Programma della giornata»; via le testimonianze del sito dal vlog (erano del percorso online).
- **2026-11-05 notte — CAUSA VERA delle parole tagliate nel vlog (v1, v2, v3)**: il master era fatto con `ffmpeg -f concat -c copy` di pezzi H.264+AAC;
  ogni pezzo porta ~25 ms di priming AAC che il concat in copia non toglie, quindi audio E video del master slittavano in avanti di ~25 ms a pezzo
  (mezzo secondo dopo 30 pezzi) rispetto ai tempi calcolati (n fotogrammi / 30): ogni taglio in ReelStudio cadeva mezzo secondo prima della vera fine
  del pezzo e mozzava l'ultima parola. Misurato con la cross-correlazione tra audio del pezzo e audio del master (`ritardo +230 … +545 ms`).
  Ora `vlog_master.build_master` scrive `duration n/FPS` per ogni file nella lista del concat (timestamp video esatti) e ricostruisce l'audio come
  un unico flusso PCM a lunghezza esatta per pezzo, codificato una volta sola: scarto 0 ms. **Regola: dopo ogni master, verificare che la durata del
  file sia uguale alla somma n/FPS e che la cross-correlazione audio dia 0 ms** (lo fa il controllo in `vlog_build3.py`/QA). Le dissolvenze audio
  sui pezzi parlati restano comunque (tagli morbidi).

### 6/11/2026 — revisione marketing (Paola) e Ross
- Sottotitoli: spazio tra le parole più compatto (come il reference); le parole mostrate grandi nelle grafiche devono
  comunque comparire nei sottotitoli (c'è chi legge solo quelli); mai frasi mozze; i sottotitoli non devono mai
  sovrapporsi a box o widget (spostare il widget, non il sottotitolo sul volto).
- Volto di Daniele sempre libero: nessun box, scheda o animazione sopra, in nessun fotogramma (ribadito).
- Logo: via l'icona Instagram sopra l'handle; usare il logo circolare del brand (`assets/brand`, variante circolare).
- Stacchi di camera: non devono sembrare errori di montaggio (punch-in alternato sugli stacchi, tagli ricontrollati).
- Hook visivo: partire subito forte e diretto nei primissimi secondi.
- **2026-11-06 (Ross, condensato)** — Reference «a day in my life» (17 s) + il suo progetto CapCut (timeline dei testi). Due versioni bocciate:
  v1 «si è perso completamente il ritmo della reference», v2 «la struttura deve essere questa, devi replicare applicando le cose del brand,
  la prima parte deve essere così, poi magari allunghi». Quindi, quando Ross dà una reference, **misurarla** (ffmpeg: scene detection, inviluppo
  audio, contact sheet a 4 fps; se c'è la timeline del progetto, leggere lì le durate dei testi) e **replicare lo schema esatto**, non solo lo stile:
  titolo impilato su 5 righe con l'ultima parola che cambia font 9 volte in 1,5 s e 9 inquadrature da 5 fotogrammi sotto; poi etichette piccole
  e centrate (crema, ~1 s, 0,2 s di vuoto tra l'una e l'altra), stacco secco ogni 34 fotogrammi, nessun parlato nella prima parte.
  I tratti parlati, dopo, devono avere senso (frasi intere) ma brevi; se la frase intera è lunga (Daniela, 5 s) scena muta con etichetta.
  Il logo va **sempre scontornato** (logo circolare bianco con ombra morbida, non su disco). La sessione del pomeriggio è «postura piedi e squat».
  Niente musica (scelta di Ross): i B-roll in cui si sente parlare vanno **muti**. Etichette al centro esatto finivano sui volti: y 0,585.
  L'effetto `obj` ha ombre `morbida / dura / bagliore`, animazioni `inA/outA` anche `none`; ReelStudio carica Blinker nei pesi 400/600/700/800.
  v3 → v4 (Ross, 6/11 sera): il logo PNG scontornato con `shadow` di `obj` sembra su un cartiglio (box-shadow rettangolare) → ombra cotta nel PNG
  e `shadow "no"`; sotto il titolo velo del **verde del brand** (non scuro), «con Correre Naturale» grande; i cambi di stile dell'ultima parola
  devono essere **molti** e negli stili della reference (serif, corsivi, script, condensati: i font di `FONT_FILES`), non solo pesi di Blinker;
  niente inquadrature della sola location; le targhette orario+descrizione in **box verde con testo bianco** che abbraccia il testo (w calcolata
  dal numero di lettere: `obj` con `bg` riempie tutta la `w`).
  7/11 (Ross: «puoi metterci suoni e musica che sono nella reference?»): la musica di una reference Instagram è quasi sempre una canzone con diritti
  (qui «Shankar-Ehsaan-Loy, Benny Dayal»): mai estrarla dalla registrazione; dirlo a Ross e proporre la stessa traccia dalla libreria audio di Instagram
  alla pubblicazione. Nel file: musica libera di ReelStudio con il bpm giusto, tagliata sul primo colpo e ritmata (`atempo`) così che una battuta
  cada esattamente su un numero intero di fotogrammi, stacchi su multipli di battuta e B-roll dopo il parlato «agganciato» alla battuta seguente.
  Script: `scripts/vlog_build60.py`, progetto `cn-vlog_workshop60`.

### 6/11/2026 pomeriggio — seconda revisione di Ross (dopo la consegna)
- **Toccare solo i punti elencati**: ogni altra cosa resta com'è (niente «miglioramenti» non richiesti).
- Sottotitoli ancora troppo distanti: spazio tra le parole 0,26 em con parola detta ingrandita al massimo del 7 %
  (`wordGap 0.26, activeBase 1.03, activeScale 0.04`). A 0,2 em la parola ingrandita toccava la vicina: controllare sempre
  un fotogramma con una parola lunga evidenziata (es. «SALUTE METABOLICA»).
- Stacchi tra due inquadrature diverse (Y1 0:15, Y2 0:07): **taglio netto**, non dissolvenza (la dissolvenza tra due
  posizioni diverse del volto sembra un errore di montaggio). Nel builder `hard_cuts`, nel project `cut.hard`.
- **Niente logo** in alto a destra in nessun reel (video più pulito). Nei reel resta solo il logo in copertina e nella CTA.
- Le glass box devono stare «un po' più distanti» dai sottotitoli: ridurle (prop `scale`, origine in alto) piuttosto che alzarle sul mento.
- CTA: sempre almeno 7 s; testo «percorsi di coaching **personalizzato**» (non «personalizzati»).
- Y2: la lancetta dello specchietto si muove prima nella zona delle basse intensità, poi sale.
- Y4: la parola è **«scorte» metaboliche** (Ross), non «scorie»: tolta la correzione a Whisper.
- Frasi da evidenziare «in alto» (Y4 «a parità di sforzo», Y6 «l'ascolto del tuo corpo», Y9 v2 «ed è la costanza»): misurare la testa
  sugli scontorni (`alpha` dei PNG) e tenere il testo **tutto sopra la testa**, anche a costo di farlo più piccolo; un titolo dietro
  la testa a metà non si legge.
- Y6: icone (SVG) di orologio, cardiofrequenzimetro e tabelle che si cancellano, come nella prima versione; Y8: un pittogramma
  per ognuna delle 5 strategie, nello stesso stile di bici e nuoto, sotto la scheda del capitolo (mai sovrapposti).
- Y7: l'infinito deve chiudersi (era un errore di lunghezza del tratto).

### 7/11/2026 — reel condensato con brano (Jalen Ngonda) e vlog lungo v4
- **2026-11-07 (Ross, condensato con brano)** — «Usa questo audio [Jalen Ngonda, *If You Don't Want My Love*], il video deve durare 1 minuto al
  massimo, usa le riprese migliori, togli ogni altro tipo di audio o suono». Quindi: quando Ross dà un brano, nel reel c'è **solo quello** (clip mute,
  niente pop, niente sfx, niente parlato), durata totale con la CTA sotto il minuto, più inquadrature scelte sui fogli di fotogrammi di tutte le clip
  (`scripts/clip_sheets.py` → `work/evento/clipsheets`).
  Tecnica: il tempo di una band dal vivo oscilla (qui 121-125 bpm, scarti fino a 250 ms da una griglia fissa) → misurare i colpi con librosa
  (venv `ReelStudio/tools/venv_tts`: `scripts/beat_analysis.py`, `beat_check.py` per verificare la fase, `song_sections.py` per la struttura) e agganciare
  ogni stacco al colpo misurato (`cut_frames` in `vlog_build60s.py`), non a una cadenza in fotogrammi; i colpi di librosa stanno ~15 ms dopo l'attacco.
  Per trovare il ritornello: trascrivere il testo con Whisper e cercare le righe che si ripetono. La prima versione partiva dalla levata del
  ritornello: Ross, «doveva partire dall'inizio, non dal ritornello» → **il brano parte dall'inizio del file**, se non detto altrimenti; scegliere il
  colpo della CTA in modo che il reel finisca su una frase forte (qui il primo ritornello, 56-60 s) e stia nel minuto. Il brano si decodifica in WAV e si
  monta dopo con ffmpeg sul render muto (`vlog_mix60s.py`): livello −14 LUFS, dissolvenza 2 s; così il volume è costante (il renderer alza la musica
  ×1,8 sui B-roll e ×2,2 sulla CTA).
  Master: con `-shortest` + `loudnorm` i pezzi uscivano di 1-2 fotogrammi più corti (gli stacchi slittavano dalla battuta) → via `-shortest`, `apad`,
  `setpts=PTS-STARTPTS` prima di `fps`, `tpad` di sicurezza; le velocità vanno date come rapporto esatto fotogrammi sorgente/uscita.
- **2026-11-07 notte (Ross, condensato con brano, seconda correzione)**: «è quasi perfetto»; la raffica del titolo con il cambio di font di
  «workshop» deve durare di più, «fino a 0:06-0:07 della canzone» (era 2 s) → 14 colpi (7,1 s), 28 inquadrature da mezzo colpo e un cambio di
  stile per inquadratura; **CTA più leggibile e un po' più lunga** → 8 s, testi al 135 %, frasi corte su una riga, fondo più scuro; **la musica
  deve sfumare meglio sul finale** → dissolvenza 5 s con curva a S (`afade curve=hsin`), non 2 s lineari; **le targhette devono essere più
  leggibili** → 84 px, le lunghe su due righe, box più larga; **«rispetta sempre gli spazi di visione di Instagram»** → tutto ciò che va letto
  sta sopra i ~1500 px (didascalia) e a sinistra della colonna delle icone (x > 950 da ~1150 px in giù): targhette con il centro a y 0,54, nella
  CTA icone e «Segui» alzati (`iconsTop`/`followTop` in `Reel.tsx`). Per restare nel minuto con raffica e CTA più lunghe si tolgono inquadrature
  deboli, non si accorcia il ritmo (uno stacco ogni due colpi resta).
- **2026-11-07 notte (Ross, condensato con brano, terza correzione)**: «devi seguire il ritmo della musica»: l'intro con il titolo a 7 s «dura troppo,
  massimo a 5 secondi deve arrivare» → raffica = due battute intere (8 colpi, 4,2 s), finisce sul primo colpo della terza battuta; «alcuni cambi
  di box con le scritte sono troppo veloci, come nel caso di Daniela» → **nessuna targhetta sotto i 2 stacchi (≈2 s)**; «il tasto Segui alla
  fine si sovrappone agli altri» → nella CTA lasciare almeno 40 px tra le etichette delle icone e il bottone (icone a 1120, Segui a 1400).
  Ross vuole l'elenco dei titoli delle targhette per correggerli lui: proporli sempre in chat prima del render.
  Titoli dettati da Ross: 9:30 Check in · 10:00 Lezione Teorica · Riscaldamento · 12:30 Prove di corsa · La lezione · Esercizi · Si corre ·
  La squadra · Pausa · 16:00 Postura / piedi / e squat · 17:30 La pedana · 18:00 Running analysis · 18:30 Testimonianze · Chiusura · Ci vediamo / al prossimo?
- **2026-11-07 (Oscar via Ross, vlog lungo v4)**: feedback di Oscar sul vlog v3b: «voce di Daniele fin dall'inizio, già dai primissimi secondi»;
  «musica ancora troppo alta, la abbasserei per dare risalto alla voce»; «troppi suoni, ne ridurrei il numero»; «togliere l'ombra quadrata in
  alto a destra sul logo, lasciare solo il logo tondo». Ross: «esegui tutte queste modifiche e metti la stessa musica del video corto» (Jalen
  Ngonda). Applicato: voce fuori campo di Daniele sotto l'hook (frase del selfie, sottotitolata); brano del condensato come letto a volume basso
  (0,11, ducking sotto il parlato), allungato oltre la sua durata con una giunta sui colpi misurati (`scripts/vlog_music_bed`: non si lascia
  ripartire il brano da capo nella CTA); effetti sonori solo sugli elementi firma (capitoli, polaroid, timbro, dato 170-180) e CTA con 4 suoni
  (`cta.sfxLite`); le ombre delle immagini in ReelStudio sono box-shadow **quadrate**: sui PNG scontornati/tondi usare sempre `shadow="no"`
  (o l'ombra cotta nel PNG). Oscar ha notato anche «una parola di troppo alla fine di qualche frase», ma «può andare bene così»: non toccato.

## Regole in memoria (non nel file originale, dalle note di sessione)
- **Hook SVG bocciati** (6/11): niente tachimetri, sagome o badge disegnati; mostrare un fotogramma e aspettare l'ok («disastro degli hook animati»).
- **Niente emoji** come icone o animazioni: SVG o forme del brand.
- **Metodo di lavoro**: per un montaggio nuovo prima il piano in chat, poi il via. Un reel alla volta, niente render in parallelo che caricano la macchina.
