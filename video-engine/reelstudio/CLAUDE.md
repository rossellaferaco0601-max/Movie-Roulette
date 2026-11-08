# ReelStudio — istruzioni per Claude

ReelStudio è la dashboard di montaggio di Ross (La Problem Solver) per i reel e i caroselli dei suoi clienti. Gira in locale sul PC di Ross (`Documenti\ReelStudio`, server Node su http://localhost:4321) e monta i video con Remotion.

Quando Ross ti chiede di migliorare un reel, **modifica il file `progetti\<id>\project.json`** e poi dille di premere «↻ Ricarica progetto» nella dashboard. Non toccare `video.mp4`, `originale.*` né i file in `node_modules`.

## ⚠️ Prima di tutto: REGOLE-MONTAGGIO.md
1. **Leggi sempre `REGOLE-MONTAGGIO.md`** prima di modificare un reel, un carosello o una storia, e rispettalo.
2. **Ogni volta che Ross corregge qualcosa** («non coprire la faccia», «la CTA deve durare di più», «troppi effetti»…), **aggiungi una riga** a `REGOLE-MONTAGGIO.md` con la data, nella sezione giusta. È così che le correzioni non si ripetono.
3. Prima di una modifica grossa salva una versione: copia `project.json` in `progetti\<id>\versioni\<data>-prima-di-claude.json` (la dashboard le mostra in «🕘 Versioni»).
4. Il materiale di riferimento analizzato è riassunto in `materiali\ANALISI-REFERENCE.md`.

## Struttura

- `progetti/<id>/project.json` — tutto il montaggio (vedi schema sotto)
- `progetti/<id>/video.mp4` — copia di lavoro del video (H.264, 30 fps)
- `progetti/<id>/export/` e `ESPORTAZIONI/` — i reel esportati
- `clients/<cliente>/brand.json` — colori, logo, parole chiave CTA, speaker
- `clients/<cliente>/preset-predefinito.json` — stile di partenza per i nuovi video del cliente
- `assets/sfx/*.mp3` — effetti sonori (nome file senza estensione = nome del suono)
- `assets/music/*.mp3` e `MUSICA/` (musiche di Ross, si usano come `"user:nomefile.mp3"`)
- `src/remotion/` — composizione (Reel.tsx), effetti (effects.tsx), sottotitoli, slide carosello
- `ui/src/app.tsx` — dashboard (si ricompila con `npm run build-ui`)

## Schema di project.json (campi principali)

```jsonc
{
  "id": "...", "title": "...", "client": "correre-naturale",
  "source": { "file": "video.mp4", "duration": 62.1, "width": 1080, "height": 1920 },
  "words": [{ "text": "Ciao", "start": 0.42, "end": 0.61 }],   // trascrizione, tempi del VIDEO ORIGINALE
  "cuts": [{ "s": 3.2, "e": 7.9, "speed": 1.5, "vol": 1, "mute": false }], // pezzi tenuti (secondi dell'originale), in ordine; speed/vol/mute facoltativi
  "hook": { "text": "Stai correndo *sbagliato*?", "style": "talk|top|card|fullscreen|none", "kicker": "Parliamo di", "sub": "", "duration": 2.8, "sfx": "impatto", "tf": {} },
  "cta":  { "text": "Commenta CORRO e ti mando la guida", "keyword": "CORRO", "style": "card|notification|endcard|none", "after": true, "duration": 4, "sfx": "ding", "tf": {} },
  "caption": "didascalia del post",
  "style": {
    "videoStyle": "talking|editoriale|mito|tutorial|vlog|intervista|cinematico|energico|brand",
    "palette": "brand|brandLight|cielo|energia|naturaSoft|contrasto|bosco|terra|prugna",
    "titleFont": "brand|editoriale|impatto|tecnico|amano|moderno",
    "layout": "full|blur|frame|split", "filter": "none|caldo|freddo|vivido|cinema|morbido|bn",
    "captions": { "style": "boldpop|brandpill|karaoke|box|serif|minimal|outline|wordbyword|none", "position": "high|mid|low|bottom", "size": 1, "wordsPerLine": 3, "highlight": "#49762E" },
    "emphWords": ["tallone"], "breathing": true, "cutZoom": true, "pushIn": false,
    "logo": true, "logoKind": "pictogramOnDark|onDark|circular", "progressBar": true, "gradient": true, "vignette": false,
    "focusX": 0.5, "focusY": 0.4, "frameTitle": "",
    "faceZone": { "on": true, "y0": 0.17, "y1": 0.42 }   // zona del volto (frazioni dell'altezza): le grafiche la evitano
  },
  "effects": [ /* vedi sotto — tempi in secondi della TIMELINE FINALE (dopo i tagli) */ ],
  "audio": { "music": "lofi-corsa-mattutina", "musicVolume": 0.1, "sfxVolume": 0.6, "voiceVolume": 1, "ducking": true, "sfxOn": true, "sfxOnCuts": false },
  "settings": { "target": 30, "dynamism": 2, "silenceGap": 0.45 },
  "hooks": ["varianti di hook mostrate come chip"], "moments": [{ "start": 12.1, "end": 41.0, "title": "..." }]
}
```

Nel testo di hook, CTA, bigNumber ecc. `*parola*` = parola evidenziata (colore accento / corsivo con font editoriale).

## Effetti (`effects[]`)

Ogni effetto: `{ "id": "univoco", "type": "...", "start": 4.2, "duration": 2.2, "props": {...}, "anim": "...", "position": "top|upper|center|lower", "sfx": "nome" | null, "tf": { "x": 0, "y": 0, "s": 1, "r": 0, "o": 1 } }`.
Se `sfx` manca si usa il suono predefinito del tipo; `null` = muto. Animazioni: `pop, slideUp, slideDown, slideLeft, scale, rotate, fade, wiggle, cut, stamp, blurIn, drop, zoomOut, flip, glitch`.
`tf` = spostamento fatto a mano sul video: x/y in frazioni dello schermo (0.1 = 10%), s = scala, r = rotazione in gradi, o = opacità. `props.font` (brand|editoriale|impatto|tecnico|amano|moderno) cambia il font del singolo effetto. Lo stesso `tf` esiste per `hook.tf`, `cta.tf` e `style.captions.tf`.

| type | cosa fa | props |
|---|---|---|
| bigText | titolone a tutto schermo (copre il video) | text, background |
| bigNumber | numero/frase gigante | text, sub |
| counter | numero che conta | from, to, suffix, label |
| dataCard | scheda dati con barre | badge, label, value 0-1 |
| checklist | lista che si spunta | title, items[], mode check/x |
| mythTruth | mito vs verità | left, right |
| tipCard | scheda consiglio | label, text |
| notification | notifica del brand dall'alto | title, body |
| typing | messaggio che si scrive | label, text |
| comment | commento in arrivo | user, text |
| badge | etichetta colorata | text, color |
| emoji | emoji che salta | emoji, x, y (0-1) |
| arrow | freccia animata | label, x, y, rotate |
| strike | testo barrato | text |
| progress | barra che si riempie | label, title, value |
| stopwatch | cronometro | from, speed |
| polaroid | 3 fermo-immagine a ventaglio | captions[], times[] (sec. originale) |
| lowerThird | nome e ruolo | name, role |
| rec | cornice REC | — |
| chapter | capitolo numerato | number, title |
| logoSting | logo in evidenza | — |
| flash | flash bianco | color |
| zoom | punch-in sulla camera | amount (1.1–1.6) |
| slowzoom | zoom lento | amount |
| mixTitle | titolo misto bold + serif corsivo (visual hook) | l1, l2, l3, accent, size |
| script | parola scritta a mano che si disegna | text, color, rotate |
| textWall | muro di titoli a tutto schermo | text, background |
| question | box domande Instagram | title, text |
| searchBar | barra di ricerca che si scrive | text |
| pills | interruttori iOS che si accendono | items[], color |
| appWindow | finestra app con righe | title, lines[] |
| rightWrong | giusto / sbagliato | wrong[], right[] |
| unlock | traguardo sbloccato | title, text, emoji |
| chart | grafico a barre che cresce | values[], label, to, suffix |
| phone | telefono con chat (">" = risposta del brand) | messages[], name |
| voice | messaggio vocale | label, color |
| doodle | cerchio/sottolineatura/freccia a mano | shape (cerchio, sottolinea, freccia), x, y, w, h, color |
| banner | banner fisso in alto | text, color |
| spotlight | riflettore | x, y, r |
| broll | stacco su un altro momento dello stesso video | t (sec. originale), zoom, label |
| pip | finestrella video | t, x, y, size, rotate |
| contactSheet | griglia 3×3 di fotogrammi | — |
| glitch, zoomThrough, pullBack, blurIn | transizioni/camera | pullBack: amount |
| shake | tremolio camera | intensity |
| bw | bianco e nero per la durata | — |
| sfx | solo suono | (usa il campo sfx) |

Suoni disponibili: whoosh, whoosh-veloce, swish, pop, blip, click, tick, ding, tastiera, riser (parte 1,2 s prima), impatto, disco-graffiato, battito, passi-corsa, bip-start, applauso, scatto, successo, errore, glitch, notifica, boing, zip, cassa, rullo, suspense, stop-disco, brillantini, invio.

## Come ragionare su un buon reel (Correre Naturale)

- Hook nei primi 2 s: promessa, errore o domanda. Max 7-8 parole, una parola evidenziata.
- `cuts`: togli silenzi, ripetizioni, false partenze. Il reel ideale dura 20–45 s. I `words` servono per trovare frasi e tempi: la timeline finale si calcola sommando le durate dei `cuts`.
- Un effetto ogni 3–4 s, sincronizzato con la parola che lo giustifica (calcola `start` mappando il tempo della parola dall'originale alla timeline finale). Non coprire la faccia per più di 2-3 s.
- Chiudi sempre con CTA a parola chiave (CORRO, PIANO, GUIDA, SCUOLA) — porta i lead in DM.
- Rispetta il brand manual: verde #49762E, azzurro #B8D7EA, crema #F4F1E5, nero, bianco; font Blinker; logo mai ruotato, deformato o azzurro.
- Daniele Vecchioni è l'ideatore del metodo Correre Naturale®.

## Analisi del video (file `progetti/<id>/analisi.json`)

Quando Ross chiede di analizzare un video lungo: leggi `words` di project.json, dividi in frasi con la stessa regola della dashboard (fine frase = parola che termina con . ! ? …, oppure pausa > 1,2 s; vedi `shared/taglio.js` → `sentences`). Gli id delle frasi partono da 0. Scrivi `analisi.json` così:

```json
{"sintesi":"…","temi":["…"],
 "reel":[{"titolo":"…","hook":"max 8 parole con *una* parola evidenziata","frasi":[3,4,5,8],"perche":"…","tipo":"educativo|mito|consiglio|storytelling|vendita","voto":8,
          "cta":{"testo":"Commenta CORRO e ti mando la guida","parola":"CORRO"},"didascalia":"…",
          "effetti":[{"frase":4,"parola":"tallone","tipo":"emoji","props":{"emoji":"🦶"}}]}],
 "caroselli":[{"titolo":"…","didascalia":"…","slide":[{"template":"cover","title":"…","kicker":"…"}]}]}
```

Ogni reel deve stare in piedi da solo (un'idea, inizio forte, chiusura completa), 20–60 s, frasi in ordine, mai spezzate. La dashboard mostra le proposte nel tab «Analisi Claude» e con «Crea questo reel» crea un nuovo progetto che riusa lo stesso video. Template slide: cover, punto, lista, citazione, dato, mitoverita, foto, cta, domanda, passi, testo, primadopo, copertina.

## Tagli
`removed` = indici delle parole escluse. I `cuts` si ricavano dalle parole tenute con `cutsFromWords` (shared/taglio.js): non scrivere `cuts` a mano se puoi scrivere `removed`, così testo e video restano coerenti.

## Caroselli e storie
I caroselli si salvano in `caroselli/<titolo>.json` (`{ title, client, style, format: "4:5|1:1|9:16", caption, slides: [...] }`). Ogni slide può avere `elements: [{ id, type: text|bubble|emoji|shape|arrow|image|phone, x, y, w, rot, o, text, size, color, bg, font: serif|mano|impatto, src }]` (x, y, w in frazioni della slide).
Storie (formato 9:16) usano i modelli `s_intro, s_testo, s_domanda, s_sondaggio, s_proof, s_lista, s_cta` con campi `label, title, items, keyword, theme (scuro|verde|crema|azzurro), image, photo`. Seguono lo Story Selling System: 7 leve (Credibilità, Chiarezza, Obiezioni, Prospettiva, Connessione, Fiducia, Missione).

## Nuovi campi (31/10 pomeriggio)
- `origin`: "youtube" (video lungo da analizzare) | "inedito" (grezzo, si monta subito).
- `hook.style` in più: `mix` (bold+corsivo), `kinetic` (parole a raffica), `boxed` (parole in scatole), `typewriter`, `question` (box domande), `news` (ultim'ora). Altri campi hook: `size`, `font`, `emphColor`, `kicker`, `sub`.
- `cta.style` in più: `comment`, `dm`, `button`, `sticker`, `minimal`, `arrow`, `split`. Altri campi: `sub` (riga sotto), `bg` (colore sfondo), `emoji`. La parola chiave è libera (`cta.keyword`); quelle del brand sono in `clients/<cliente>/brand.json → ctaKeywords`.
- `style.layout` in più: `zoom`, `splitTop`, `square`, `cinema`, `bordo`, `polaroid`. `style.filter` in più: `vintage, tealorange, opaco, dorato, drammatico, pastello, notte, natura`. `style.adjust`: `{ brightness, contrast, saturate, warmth (-1..1), hue, sharp, vignette, grain }`.
- `style.captions.style` in più: `hormozi, marker, neon, tiktok, bounce, typewriter, gradient, shadow3d, handwritten, stack, glass, cinema`. Modifiche: `font, color, highlight/activeColor, stroke, bg, shadow, anim (pop|slide|fade|none), letterSpacing, uppercase, noPunct, emphColor, wordFx`.
- `style.captions.wordFx` (effetto sulle parole chiave): `colore, box, sottolinea, glow, grande, shake, corsivo, barrata, onda, cerchio, emoji`.
- Font titoli (`titleFont`, `props.font`, `hook.font`): brand, editoriale, impatto, tecnico, amano, moderno, montserrat, poppins, bebas, oswald, archivo, league, playfair, instrument, fraunces, abril, spacegrotesk, syne, dmsans, righteous, bangers, marker, pacifico, lobster.
- Stili video (`videoStyle`): talking, editoriale, mito, tutorial, vlog, intervista, cinematico, energico, brand, hormozi, magazine, podcast, minimal, neon, documentario, pop, diario, tiktok.
- Effetti nuovi: `aiImage` (props.src, mode pieno|finestra), `aiClip` (props.src), `cutout` (scritta dietro la persona: props.text, y, size, color — richiede i fotogrammi scontornati in `progetti/<id>/scontorni/`, che si creano dalla dashboard), `broll` con `props.src` (video in `progetti/<id>/broll/`).
- Caroselli: `style.design` = brand | editoriale | minimal | bold | quaderno | premium | pastello | giornale | tech | pop | foto | scrapbook | gradiente | tweet. Le proposte stanno in `analisi.json → caroselli`.
- Libreria prompt per i visual hook AI: `prompt-visual-hook.json` (generati con fal.ai, salvati in `progetti/<id>/ai/`).
- Musiche incluse: lofi-corsa-mattutina, energica-allenamento, ambient-natura, motivazionale, riflessiva, pop-solare, hiphop-grinta, tensione-mistero, epica-traguardo, chill-domenica, corsa-veloce, elettronica-notte, acustica-calma.

## Caroselli dal tema (1/11)
Quando Ross incolla un tema o una trascrizione, i caroselli sono 5, uno per giorno: Lunedì SCIENTIFICO (autorevolezza), Martedì EDUCATIVO (comprensione), Mercoledì PROBLEM/SOLUTION (far emergere il problema), Giovedì PRATICO (dare valore e dimostrare competenza), Venerdì CONVERSIONE (vendere). Copy con storytelling, 7-10 slide, slide 1 hook + slide 2 secondo gancio, ultima CTA con parola chiave. Le reference di design stanno in `clients/<cliente>/reference-design/`; il design generato è `style.design: "custom"` con `style.custom {bg,bgAlt,fg,em,font,body,decor}`. Animazione: `animate {mode: morbido|parole|scrivi|pop|scorri|zoom, durationSec, music}` → ogni slide esporta anche un .mp4.

## Strumenti della dashboard (per sapere cosa può fare Ross da sola)
Editor sul video (trascina/ruota/ingrandisci), Annulla/Ripeti, Versioni, timeline con Dividi/Copia/Incolla/Duplica/Calamita, velocità e volume per pezzo, 🎯 trova volto e reframe, didascalie automatiche, pacchetto CapCut (video pulito + grafiche trasparenti ProRes 4444 + SRT), invio al telefono con QR, esportazione in serie dall'analisi, archivio visual hook, storie Story Selling System, elementi liberi stile Canva nei caroselli.

## Guida ai caroselli (1/11 sera)
Ogni carosello va scritto seguendo `clients/<cliente>/guida-caroselli.md` (la guida di Ross): obiettivo unico, idea (Problema/Errore/Mito/Curiosità scientifica/Trasformazione), 7 fasi, una slide = un concetto, numero di slide secondo il contenuto, una sola CTA coerente, checklist finale. Campi in più nei caroselli dal tema: obiettivoGuida, approccio, tipoHook, cta, checklist[], avvisi[].

## Caroselli pronti (2/11)
`POST /api/caroselli/completa {carosello, client, project}`: Claude sceglie le immagini (libreria descritta in `clients/<c>/immagini-descrizioni.json`, generato in automatico con la vista; fotogrammi `/api/frame?p=<id>&t=`), mette la copertina (`template: copertina`) e 1-3 slide `foto`, e restituisce le slide pronte. Nella dashboard: passo 3 «Crea i caroselli pronti» (uno o tutti e 5, con esportazione).

## Flusso caroselli (2/11 notte)
1 testo → 5 caroselli (max 10 slide, copy completo visibile, selezione) → 2 design → 3 «Crea i caroselli» → elenco (salvato in localStorage `rs-creati:<progetto>`) con Modifica / Esporta (sempre 4:5, 1080×1350) / Apri con Canva (scarica il .pptx e apre canva.com).
Ogni parte di un modello è selezionabile: `slide.parts[nome] = { x, y (frazioni), s (scala), r (gradi), o, color, font, align, bg, weight, hide }`; nomi: titolo, testo, etichetta, numero, immagine, decoro, logo, piede, voce1…voceN.

## Design dalle reference, versione 2 (2/11)
`style.custom` in più: `foto` (pieno|nessuna), `fotoSu` (tutte|alterne|copertina), `overlay`, `box` (carta|card|pill|nessuno), `boxColor`, `enfasi` (colore|box|evidenziatore|sottolinea|nastro), `decori[]` (nastro, scarabocchi, sticker, strappo, grana, griglia, onda, cerchi, numeri), `stickerTesto`, `stickerFinale`. Con `foto: pieno` le slide hanno `image` a tutto schermo con velatura. I testi lunghi si rimpiccioliscono da soli. Copy dei caroselli: 35-60 parole nelle slide di sviluppo.

## Prompt master dei caroselli (2/11)
«Sviluppa il tema» usa `clients/<c>/prompt-caroselli.md` (prompt master di Ross) + `brand-caroselli.md` (Parte 8, modificabile dalla dashboard) + `guida-caroselli.md`. Due fasi: 1) analisi, 5 angoli, ricerca bibliografica con ricerca web (tool web_search), matrice → 2) i 5 caroselli scritti in parallelo (10 slide con funzione, kicker, evidenzia, visual, fonte; caption con references; controllo qualità). Gira come job (`/api/caroselli/da-tema` → `{job}`). Campo slide `fonte` mostrato in piccolo sopra il piè di pagina.

## Aggiornamento 2/11 sera (su richiesta di Ross, mantenendo le schede originali)
- Guida ai Reel: `clients/<c>/guida-reel.md`, inclusa nel prompt dell'analisi (tipologia, tipo di hook, struttura Hook→Contesto→Sviluppo→Payoff→CTA, parole da evidenziare, effetti con `suono` solo se importante).
- Suoni: massimo 1 ogni 7 s (`limitSounds` in creazione reel e «Rimetti/Riallinea effetti»); le grafiche aggiunte a mano entrano con `sfx: null`. Sul singolo effetto: `sfxOffset` (spostamento del suono in s) e `sfxVol`.
- Hook: `hook.pos` = inizio | apertura (cartello prima del video, `hook.introDur`) | punto (`hook.start`) | fine.
- CTA: `cta.after` true = in coda come schermata (sfondo: ultimo fotogramma sfocato), false = in sovraimpressione. Stili nuovi: salva, manifesto, pillola, profilo.
- Oggetti sul video: `tf.sx`/`tf.sy` = larghezza/altezza separate.
- Inquadratura per pezzo: `cuts[].frame` = volto | intero | diviso (+ `fx`,`fy`); `POST /api/project/<id>/inquadratura` (job, Claude vision) restituisce i cuts divisi.
- Sottotitoli: `captions.lines` (1-3 righe), `captions.y` (altezza precisa 0-1); stili nuovi banda, adesivo, sottolineata, duetono, maxi, contornobrand.
- Storie settimana: job (`/api/storie/genera` → `{job}`), piano + un giorno per volta.

## Elementi stile Canva (3/11)
- Effetto `obj` (Elemento libero): `props.kind` = text | shape | image. Testo: text, font, size, w, color, emphColor, bold, weight, italic, underline, upper, align, letter, lineH, strokeW, strokeColor, bg, bgPad, bgRadius. Forma: shape (rettangolo, arrotondato, cerchio, triangolo, rombo, pentagono, esagono, stella, cuore, fumetto, freccia, frecciasu, spunta, croce, piu, pillola, scoppio, onda, linea, cornice), w, h, fill, fill2 (sfumatura), gradDir, noFill, strokeW, strokeColor. Immagine/icona: src, w, h, tint (colore per SVG), radius, borderW, borderColor. Comuni: x, y (centro 0-1), rot, opacity, shadow (no|morbida|dura|bagliore), inA, outA, loopA, inSpeed.
- Su qualsiasi grafica: `e.txt` = stile testo forzato (font, color, weight, italic, upper, letter, lineH, align, strokeW, strokeColor, shadow); `e.hidden`, `e.lock`, `e.group` (agganciati: si muovono insieme); l'ordine in `effects[]` = livelli (l'ultimo sta davanti).
- Bacheca: `GET /api/elementi?q=&fonte=tutte|icone|illustrazioni` (Iconify + Pixabay vector/illustration se c'è la chiave), `POST /api/elementi/scarica {project,url,name}` → `progetti/<root>/elementi/`.
