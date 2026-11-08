# ReelStudio — istruzioni per Claude

ReelStudio è la dashboard di montaggio di Ross (La Problem Solver) per i reel e i caroselli dei suoi clienti. Gira in locale sul PC di Ross (`Documenti\ReelStudio`, server Node su http://localhost:4321) e monta i video con Remotion.

Quando Ross ti chiede di migliorare un reel, **modifica il file `progetti\<id>\project.json`** e poi dille di premere «↻ Ricarica progetto» nella dashboard. Non toccare `video.mp4`, `originale.*` né i file in `node_modules`.

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
  "cuts": [{ "s": 3.2, "e": 7.9 }],                            // pezzi tenuti, in secondi dell'originale, in ordine
  "hook": { "text": "Stai correndo *sbagliato*?", "style": "top|card|fullscreen|none", "duration": 2.4, "sfx": "whoosh" },
  "cta":  { "text": "Commenta CORRO e ti mando la guida", "keyword": "CORRO", "style": "card|notification|endcard|none", "duration": 3, "sfx": "ding" },
  "style": {
    "videoStyle": "talking|editoriale|mito|tutorial|vlog|intervista|cinematico|energico|brand",
    "palette": "brand|brandLight|cielo|energia|naturaSoft|contrasto|bosco|terra|prugna",
    "titleFont": "brand|editoriale|impatto|tecnico|amano|moderno",
    "layout": "full|blur|frame|split", "filter": "none|caldo|freddo|vivido|cinema|morbido|bn",
    "captions": { "style": "boldpop|brandpill|karaoke|box|serif|minimal|outline|wordbyword|none", "position": "high|mid|low|bottom", "size": 1, "wordsPerLine": 3, "highlight": "#49762E" },
    "emphWords": ["tallone"], "breathing": true, "cutZoom": true, "pushIn": false,
    "logo": true, "logoKind": "pictogramOnDark|onDark|circular", "progressBar": true, "gradient": true, "vignette": false,
    "focusX": 0.5, "focusY": 0.4, "frameTitle": ""
  },
  "effects": [ /* vedi sotto — tempi in secondi della TIMELINE FINALE (dopo i tagli) */ ],
  "audio": { "music": "lofi-corsa-mattutina", "musicVolume": 0.1, "sfxVolume": 0.6, "voiceVolume": 1, "ducking": true, "sfxOn": true, "sfxOnCuts": false },
  "settings": { "target": 30, "dynamism": 2, "silenceGap": 0.45 },
  "hooks": ["varianti di hook mostrate come chip"], "moments": [{ "start": 12.1, "end": 41.0, "title": "..." }]
}
```

Nel testo di hook, CTA, bigNumber ecc. `*parola*` = parola evidenziata (colore accento / corsivo con font editoriale).

## Effetti (`effects[]`)

Ogni effetto: `{ "id": "univoco", "type": "...", "start": 4.2, "duration": 2.2, "props": {...}, "anim": "...", "position": "top|upper|center|lower", "sfx": "nome" | null }`.
Se `sfx` manca si usa il suono predefinito del tipo; `null` = muto. Animazioni: `pop, slideUp, slideDown, slideLeft, scale, rotate, fade, wiggle, cut, stamp`.

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
| shake | tremolio camera | intensity |
| bw | bianco e nero per la durata | — |
| sfx | solo suono | (usa il campo sfx) |

Suoni disponibili: whoosh, whoosh-veloce, swish, pop, blip, click, tick, ding, tastiera, riser (parte 1,2 s prima), impatto, disco-graffiato, battito, passi-corsa, bip-start, applauso, scatto, successo, errore.

## Come ragionare su un buon reel (Correre Naturale)

- Hook nei primi 2 s: promessa, errore o domanda. Max 7-8 parole, una parola evidenziata.
- `cuts`: togli silenzi, ripetizioni, false partenze. Il reel ideale dura 20–45 s. I `words` servono per trovare frasi e tempi: la timeline finale si calcola sommando le durate dei `cuts`.
- Un effetto ogni 3–4 s, sincronizzato con la parola che lo giustifica (calcola `start` mappando il tempo della parola dall'originale alla timeline finale). Non coprire la faccia per più di 2-3 s.
- Chiudi sempre con CTA a parola chiave (CORRO, PIANO, GUIDA, SCUOLA) — porta i lead in DM.
- Rispetta il brand manual: verde #49762E, azzurro #B8D7EA, crema #F4F1E5, nero, bianco; font Blinker; logo mai ruotato, deformato o azzurro.
- Daniele Vecchioni è l'ideatore del metodo Correre Naturale®.
