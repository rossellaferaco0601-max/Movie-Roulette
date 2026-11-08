# Reel Correre Naturale® — istruzioni per Claude

Progetto di montaggio reel 9:16 per Instagram (@correrenaturale) a partire dai video YouTube di Daniele Vecchioni.
Si lavora in italiano. Ross (ReelStudio) è chi dà il brief; gusto «moderno e pulito».

## Prima di ogni montaggio
1. Leggere per intero `REGOLE-MONTAGGIO.md`: è la fonte di verità (brief, correzioni ricevute, note tecniche).
   Questo file ne riassume solo l'essenziale, in caso di dubbio vince `REGOLE-MONTAGGIO.md`.
2. Ogni correzione nuova ricevuta da Ross o Daniele va aggiunta in fondo a `REGOLE-MONTAGGIO.md` con la data
   (sezione «Correzioni ricevute»), non qui.
3. Per un montaggio nuovo o diverso dal solito: prima il piano in chat (tecniche del reference → traduzione in stile
   CN, struttura, strumenti), intanto installare e provare gli strumenti mancanti, poi aspettare il via.

## Layout
- `input/` sorgenti (`longevita.webm` 4K, `reference*.mp4` = reel di stile da imitare, MAI da inserire nel reel).
- `work/` trascrizioni Whisper (`longevita_words.json`), proxy, clip audio di verifica, materiale per reel (`R1_…`).
- `output/` consegne: `<id>.mp4` + `<id>_copertina.jpg` + `<id>_didascalia.txt`, `CHECKLIST.md`; sottocartelle `v1 v2 v3 ytcn38`.
- `assets/fonts/` Blinker. Emoji da `C:/Windows/Fonts/seguiemj.ttf`.
- `scripts/` pipeline (vedi sotto). `PROPOSTE-REEL-longevita.md` = scalette e correzioni Whisper del video longevità.

## Due pipeline
**A. Motore locale (video «longevità»)** — Python + PIL + ffmpeg, nessun Node.
`scripts/reels_longevita.py` (definizione reel) → `scripts/build.py R1 R2…` → `scripts/qa_audio.py` (tagli, ritrascrizione)
→ `scripts/qa_frames.py` (6-8 fotogrammi, volto libero) → `scripts/make_covers.py`. Motore in `scripts/reel_engine.py`.

**B. ReelStudio (video YTCN 38, Y9 v2)** — dashboard Remotion in `C:/Users/roxfe/Documents/ReelStudio` (ha un suo CLAUDE.md).
`scripts/reels_ytcn38.py` → `scripts/ytcn38_build.py` (project.json) → `scripts/rs_render.js` → `scripts/ytcn38_qa.py`,
`ytcn38_covers.py`, `ytcn38_didascalie.py`. Effetti stile reference in `ReelStudio/src/remotion/effects_cn3.tsx`.
- Node NON è nel PATH: usare `C:/Users/roxfe/Documents/ReelStudio/node/node.exe`.
- Scontorno di Daniele: `scripts/rvm_cutout.py` (RVM ONNX in `ReelStudio/tools/rvm`), solo sui tratti che servono.
- Voce clonata (Chatterbox, venv `ReelStudio/tools/venv_tts`): solo con consenso di Daniele; per Y9 v2 è stata esclusa.

## Strumenti
- Python 3.12 di sistema con `faster_whisper`; ffmpeg 9 nel PATH. Non installare pacchetti pesanti nel Python di sistema:
  usare venv separate (Whisper non va rotto).
- Skill globali in `~/.claude/skills` (installati 5/11/2026): `effects` (51 effetti face-tracking, venv propria,
  si usa con `/effects <nome>`), `remotion-*` ufficiali, `remotion-motion-graphics`, `remotion-overlays`,
  `animation-principles`, `logo-animation`, `reels-editor`, `talking-head-editing-skill`, `hyperframes*`, ecc.
  Gli effetti `effects` aggiungono solo grafica (niente audio/sottotitoli) e vanno comunque sottoposti alle regole sotto.

## Regole non negoziabili (riassunto)
- 1080×1920, 30 fps, MP4. Daniele sempre a fuoco, dal sorgente 4K. Un'idea per reel, mai frasi tagliate a metà.
- Numeri e dati solo se detti da Daniele. Se una scheda del sorgente riporta un numero diverso dal parlato, rifarla.
- Niente sul volto: trovare prima la zona del volto, grafiche sopra la testa o sotto il mento (parole a comparsa sul volto max 1,5 s).
- Sottotitoli sempre, sincronizzati e corretti a mano; parola detta evidenziata; nascosti quando una scheda mostra lo stesso dato.
- Tagli agganciati ai silenzi reali (Whisper è in ritardo 0,1-0,4 s) e verificati ritrascrivendo il montato.
- Transizioni fluide: dissolvenza 5 fotogrammi, niente flash/glitch/zoom-through. Pochi B-roll, mai stock di altre persone.
- Niente watermark o imitazioni di altre piattaforme (barra «Search», popup «Subscribe»); il reference non entra nel reel.
- Un elemento visivo ogni 3-4 s, mai due grafiche grandi insieme; ogni reel della serie ha animazioni firma diverse.
- SFX: nei reel «classici» max 1 ogni 7 s; nei reel stile reference (Y9 v2) sì sugli effetti e nella CTA, volume ~0,45.
- CTA finale 4 s dopo il video, una sola parola da scrivere in DM (CORRO, PIANO, GUIDA, SCUOLA).
- Brand: vedi la sezione «Brand kit» qui sotto. Lime #95FF00 solo per la parola detta nei sottotitoli (convenzione dei reel, non del manuale).
- Consegna: MP4 + copertina con volto libero + didascalia (tema → approfondimento → conclusione → CTA → pochi hashtag) + checklist;
  prima di consegnare estrarre e guardare 6-8 fotogrammi.

## Brand kit (dal «Manuale d'uso del marchio», Sara Scionti)
Il manuale e le pagine chiave in PNG stanno in `assets/brand/` (`Brand Manual - Correre Naturale.pdf`, `02-varianti-logo.png`,
`11-colori.png`, `13-area-di-rispetto.png`, `17-tipografia-blinker.png`, `20-usi-impropri.png`…). Guardarle in caso di dubbio.

**Colori istituzionali**
| Ruolo | Nome | HEX | RGB | Pantone |
|---|---|---|---|---|
| principale | verde | #49762E | 72 118 46 | 364 C |
| principale | nero | #000000 | 0 0 0 | — |
| principale | bianco | #FFFFFF | 255 255 255 | — |
| accento | azzurro | #B8D7EA | 184 215 234 | 290 C |
| accento | crema | #F4F1E5 | 244 241 229 | — |
- Abbinamenti previsti: su bianco → verde e nero; su verde → azzurro, crema e bianco; su nero → verde e bianco;
  su azzurro o crema → verde e nero. Azzurro e crema sono accenti (fondi, pulsanti, pill), non colori da testo lungo.
- Testi (pagina «applicazione cromatica»): titoli grandi in verde su bianco/crema, in bianco su verde/nero; corpo in nero
  su chiari e in bianco su scuri; pulsanti azzurri con testo bianco su bianco/verde, verdi con testo bianco su crema/nero.
- Nel manuale la scheda del bianco riporta per errore RGB 221;180;185: usare #FFFFFF.
- Nei reel, in più: lime #95FF00 per la parola detta nei sottotitoli, crema per i sottotitoli e i palchi, verde per le keyword.

**Tipografia**
- Font unico: **Blinker** (file in `assets/fonts/`). Logo: «CORRERE NATURALE» in Blinker SemiBold, «RUNNING CULTURE» in Regular.
- Titoli e parole evidenziate: Blinker Bold/SemiBold; corpo e sottotitoli: Regular o SemiBold. Blinker è pensato per testi
  medio-grandi, non per blocchi lunghi.
- La «&» del Blinker va sostituita, dove possibile, con la «&» del font Lato.

**Logo**
- Tre varianti: **orizzontale** (lockup principale: pittogramma a sinistra, «CORRERE NATURALE» su due righe + «RUNNING CULTURE»),
  **verticale** (pittogramma sopra, testo centrato sotto), **circolare** (testo in cerchio attorno al pittogramma).
  Nei reel usare l'orizzontale o il solo pittogramma; la circolare va bene come sigillo/sticker.
- Pittogramma: la figura del corridore con le dita del piede in testa. Da solo può essere verde, nero o bianco.
- Versioni ammesse: verde+nero su bianco/crema; tutto bianco oppure pittogramma azzurro + testo bianco su verde;
  pittogramma verde + testo bianco su nero; monocromatica b/n. Su azzurro: pittogramma bianco o verde, testo nero.
- Area di rispetto: attorno al logo lasciare sempre un margine pari all'altezza di una lettera maiuscola di «CORRERE», su ogni lato.
- **Usi impropri** (pagina 20): mai tutto azzurro, mai senza pittogramma, mai pittogramma sproporzionato rispetto al testo,
  mai testo senza pittogramma, mai ruotato/inclinato, mai con ombre o effetti. Non deformare, non cambiare i colori, non
  mettere il logo su foto senza contrasto. Niente loghi o watermark di altre piattaforme accanto al nostro.
- Nei reel: handle «@correrenaturale» in alto a destra; logo o pittogramma nella copertina e nella CTA, mai sul volto.
