# Correre Naturale® — contesto cliente

Ricostruito il 7/11/2026 dalle sessioni Claude Code precedenti («Video montaggio corsa naturale», «Utilizzo materiale video evento live»).
Prima di montare qualsiasi cosa per questo cliente: leggere `REGOLE-MONTAGGIO.md` in questa cartella.

## Persone
- **Daniele Vecchioni** — fondatore di Correre Naturale®, il volto che parla in tutti i video. Volto sempre libero. Voce clonata (Chatterbox) usabile solo con suo consenso.
- **Ross** — l'utente (chi monta con Claude), dà feedback e revisioni, fornisce reference, decide su musica. Regola d'oro: «tutto il resto non devi toccarlo, modifica solo le cose che ti ho detto».
- **Paola** — marketing; revisione marketing del 6/11; il girato del workshop viene dal suo telefono.
- **Oscar** — lato cliente, feedback finale sul vlog lungo (7/11, via Ross).
- **Daniela** — partecipante al workshop, parla nel vlog (consenso e liberatoria ricevuti).
- **Francesco** — contatto esterno che ha chiesto a Ross con quale app di montaggio collega Claude (vedi `../video-engine/docs/setup-capcut.md`).

## Brand
| Elemento | Valore |
|---|---|
| Instagram | @correrenaturale |
| Verde | `#49762E` |
| Azzurro | `#B8D7EA` |
| Crema | `#F4F1E5` |
| Inchiostro | `#0B0F0A` |
| Lime | `#95FF00` — SOLO parola detta nei sottotitoli / parola chiave del titolo |
| Font | Blinker (400/600/700/800; ExtraBold per i titoli). Deroga solo per i cambi di stile della parola «workshop» nel reel condensato: DM Serif, Pacifico, Anton, Playfair, Caveat, Bebas, Lobster, Fraunces, Marker, Abril, Instrument, Righteous, Oswald, Bangers (da `FONT_FILES` in `src/remotion/lib.ts`) |
| Velo sotto titolo | `rgba(73,118,46,0.62)` (verde brand, mai scuro) |
| brand.json | `C:\Users\roxfe\Documents\ReelStudio\clients\correre-naturale\brand.json` (costanti LIME, GREEN, AZ, CREAM, INK; contenuto non recuperato dalle trascrizioni) |
| Logo | `ReelStudio/clients/correre-naturale/logo-circolare-bianco.png` (693×695, bianco su trasparente, ombra cotta nel PNG: blur 10, offset 8 px, 55 %, padding 48 px); circolare, scontornato; mai ruotato/deformato/azzurro; mai su disco o cartiglio; mai icona Instagram |
| Prodotto | «percorsi di coaching **personalizzato** di Correre Naturale®» (singolare) |
| Formato | 9:16, 1080×1920, 30 fps, MP4 H.264 |

## Stile sintetico (dettagli nelle regole)
- Sottotitoli sempre presenti, maiuscoli bianchi, parola attiva lime ingrandita max 7 % (`wordGap 0.26, activeBase 1.03, activeScale 0.04`), y 0,80, mai sul volto, mai sovrapposti a widget.
- Hook nei primissimi secondi: scritta animata sopra Daniele (`boxed`) o typewriter a righe nel vlog. Niente hook SVG disegnati (tachimetri, sagome, badge).
- Un elemento visivo ogni 3-4 s, mai due grafiche grandi insieme, animazioni firma diverse per ogni reel. Niente emoji: SVG o forme brand.
- Transizioni: dissolvenza 5 fotogrammi tra pezzi dello stesso piano, **taglio netto** tra inquadrature diverse, niente flash/glitch/zoom-through.
- Reel YTCN: **nessun logo/handle** in alto a destra (dal 6/11); logo solo in copertina e CTA. Vlog: logo tondo in alto a destra con `shadow="no"`.
- CTA: ≥7 s nei reel, 10 s nel vlog, animata (dito, commento pubblicato con coriandoli, DM, «+ Segui»), una sola parola da commentare.
- Musica: niente nei reel; nel vlog lungo v4 letto musicale basso (0,11) con ducking, brano «If You Don't Want My Love» di Jalen Ngonda. Mai estrarre la canzone di una reference Instagram (diritti): proporla dalla libreria Instagram alla pubblicazione.
- SFX: reel classici max 1 ogni 7 s; reel stile reference suoni sì (vol 0,45); vlog v4 solo su elementi firma + CTA `sfxLite`.
- Audio tagli: dissolvenza 0,12 s in / 0,28 s out su ogni pezzo parlato; fine pezzo misurata su RMS, non sui tempi Whisper; coda 0,9 s prima della CTA.
- Girato iPhone HDR (HLG/Dolby Vision): sempre tone mapping Hable → BT.709 prima di tutto.
- Didascalia: tema → approfondimento non detto → conclusione → CTA con parola → pochi hashtag; niente engagement bait.
- Consegna: MP4 + copertina (volto libero) + didascalia + checklist; controllare 6-8 fotogrammi prima.

## Dove sta il lavoro (PC Windows di Ross)
- Progetto: `C:/Users/roxfe/Documents/reel_progetti/correre_naturale/` (`REGOLE-MONTAGGIO.md`, `PROPOSTE-VLOG-evento.md`, `scripts/`, `work/`, `input/evento/`, `output/ytcn38/`, `output/evento/` con `CHECKLIST.md`, `assets/brand`).
- Renderer: **ReelStudio** (Remotion) in `C:/Users/roxfe/Documents/ReelStudio/` — `progetti/cn-*/project.json`, `clients/correre-naturale/brand.json`, `src/remotion/Reel.tsx`, `effects_cn*.tsx`, `captions.tsx`, render con `scripts/rs_render.js video|still <pid> <out>` (server porta 4399, node in `tools/node/node.exe`).
- Strumenti sul PC: Whisper large-v3 (`transcribe_ranges.py`), RobustVideoMatting (`rvm_cutout.py`), Chatterbox TTS (`voce_test.py`), FFmpeg, PIL per i contact sheet.
- Memoria Claude sul PC: `C:\Users\roxfe\.claude\projects\C--Users-roxfe-Documents-reel-progetti-correre-naturale\memory\`.
- Vincoli macchina: un render alla volta (max 2), thread bassi; pulire le cartelle temporanee Remotion in `%LOCALAPPDATA%\Temp\remotion-v4.*` (erano arrivate a 688 GB).

## Progetti e stato (al 7/11/2026 mattina)
| Progetto | Stato |
|---|---|
| 9 reel YTCN 38 (Y1 auto-efficiente … Y8 cinque-strategie, Y9v2 costanza) da video YouTube «correre con meno fatica» | Consegnati il 6/11 sera dopo la seconda revisione di Ross; didascalie lasciate con «personalizzati» su scelta di Ross. Nulla aperto. |
| Reel ADV 60 s del workshop (`VLOG_workshop_60s.mp4`, v7) | Chiuso e consegnato il 7/11 dopo tre correzioni di Ross (brano dall'inizio, raffica titolo 4,2 s, CTA 8 s, targhette ≥2 s, zone sicure Instagram, 15 titoli dettati da Ross). |
| Vlog lungo workshop 24/10 Vicenza (`VLOG_workshop_v4.mp4`, 2:31) | v4 in render il 7/11 con le correzioni di Oscar (voce di Daniele dall'inizio, musica bassa, meno suoni, logo senza ombra quadrata). **Aperto**: controlli audio/fotogrammi v4, invio anteprima, approvazione di Oscar/Ross. «busto» in IMG_0649 da confermare all'ascolto. |

Parole CTA già usate: CORRO, PIANO, GUIDA, SCUOLA, EFFICIENTE, CARBURANTE, RESISTENZA, SEGRETO, LENTO, NASO, ASCOLTO, STRATEGIE, COSTANZA, WORKSHOP.

## Reference usate
- Reel «a day in my life» di snaps_by_adwi (17 s) + progetto CapCut di Ross con la timeline dei testi (schema del reel condensato).
- Reel di zeeuiux («ABDUL»: titolo dietro la persona).
- «WhatsApp Video 2026-11-03 at 01.34.11 (1).mp4» (dinamismo richiesto il 3/11).

## Materiale evento 24/10/2026 (Vicenza)
- 36 clip iPhone verticali HDR + 13 foto in `input/evento/` (IMG_0598…0650); clip con audio spaziale Apple (0600, 0621, 0625, 0626) solo B-roll muto.
- Selfie WhatsApp della vigilia `wa_daniele_vigilia.mp4` (voce fuori campo dell'hook: 29,48 s + 4,68 s).
- Programma: 9:30 Check in · 10:00 Lezione teorica · Riscaldamento · 12:30 Analisi tecnica della corsa · Esercizi · Si corre · La squadra · Pausa · 16:00 Postura, piedi e squat · 17:30 La pedana · 18:00 Running analysis · 18:30 Testimonianze · Chiusura.
- Testimonianze Vimeo del sito (Monica, Andrea, Beatrice) NON vanno nel vlog (sono del percorso online).

## Errori da non ripetere (sintesi)
Vedi la sezione completa in `REGOLE-MONTAGGIO.md`. I più costosi: coprire il volto, toccare cose non richieste, HDR senza tone mapping, concat AAC in copia (parole mozzate), hook SVG inventati, dissolvenza tra inquadrature diverse, logo/handle nei reel, «scorie» → «scorte», «personalizzati» → «personalizzato», più di 2 render in parallelo.
