# Regole di montaggio di Ross — da rispettare SEMPRE

Questo file è la memoria delle correzioni di Ross. **Claude lo legge prima di ogni modifica a un reel, carosello o storia**, e **ci aggiunge una riga ogni volta che Ross corregge qualcosa** (così lo stesso errore non si ripete). Una regola per riga, con la data.

## Volto e inquadratura
- 2026-10-30 · Sticker, emoji, schede e scritte **non devono mai coprire il volto di chi parla**. Usa `style.faceZone` (nella dashboard: Libreria → Logo & extra → «🎯 Trova il volto»). Le grafiche vanno sopra o sotto la zona del volto.
- Le parole a comparsa (`keyword`) e i titoloni possono stare sopra il volto solo per pochi istanti (max 1,5 s).

## Hook (primi secondi)
- 2026-10-30 · L'hook iniziale è una **copertina animata in stile "Let's talk about…"** (`hook.style: "talk"`, etichetta tipo «Parliamo di» / «Let's talk about»), non una semplice scritta.
- Max 7–8 parole, una sola parola evidenziata con `*parola*`.

## Sottotitoli e parole chiave
- 2026-10-30 · Alcune parole chiave **non vanno nei sottotitoli ma compaiono grandi a comparsa** (effetto `keyword`): quando c'è una `keyword` i sottotitoli si nascondono da soli.
- Le parole evidenziate devono essere quelle che portano il senso (numeri, errori, la parte del corpo, il risultato).

## Audio e tagli
- 2026-10-30 · **Controlla l'audio a ogni punto di taglio**: niente parole doppie o mozzate (es. «ma ma»). I tempi di Whisper sono spesso in ritardo di 0,1–0,3 s: se serve, sposta l'inizio/fine del pezzo di 0,1 s alla volta.
- I tagli non devono mai spezzare una frase a metà (usa `removed` + `cutsFromWords`, non `cuts` a mano).
- `sfxVolume` mai a 0 se il reel ha effetti: valore tipico 0,5–0,6.

## CTA finale
- 2026-10-30 · La CTA è una **schermata finale di 4 secondi DOPO la fine del video**, con la musica sotto (`cta.after: true`, `cta.style: "endcard"`, `cta.duration: 4`).
- Sempre con parola chiave (CORRO, PIANO, GUIDA, SCUOLA) per portare i lead in DM.

## Dinamismo
- 2026-10-30 · Ross vuole reel **dinamici**: un elemento visivo o sonoro ogni 3–4 secondi, sincronizzato con la parola giusta (es. quando Daniele parla di corsa → passi-corsa, emoji 🏃, zoom).
- Alterna: zoom/punch-in, parola a comparsa, scheda, emoji, suono. Mai due grafiche grandi nello stesso momento.

## Caroselli e storie
- Prima slide = hook che ferma lo scroll, seconda slide = secondo gancio. Max ~25 parole per slide, un'idea per slide, ultima slide = CTA con parola chiave.
- Storie: seguire lo Story Selling System (7 leve). Ogni storia deve far venire voglia di vedere la successiva; una sola azione finale (DM).

## Brand Correre Naturale
- Verde #49762E, azzurro #B8D7EA, crema #F4F1E5. Font Blinker. Logo mai ruotato, deformato o azzurro.

<!-- Claude: aggiungi qui sotto le nuove correzioni di Ross, con data. -->
- 2026-11-03 · Se un dato (numero, voce di lista, parola) compare in una scheda/animazione, **non va ripetuto nei sottotitoli** in quel momento. Ora è automatico in `Reel.tsx` (`dedupData`): numeri e parole di 4+ lettere scritti in un effetto attivo spariscono dai sottotitoli; con keyword, titolo misto, box domande e testo che si scrive i sottotitoli si nascondono.
- 2026-11-03 · I reel devono essere **molto più coinvolgenti**: animazioni ed effetti fitti (un elemento ogni 2-3 s), schede animate (contatori, checklist, mito/verità, grafici, capitoli), B-roll al posto delle schede 16:9 del video originale, punch-in e transizioni. Tagli e struttura invece andavano bene.
- 2026-11-03 · Le **parole grandi a comparsa** (keyword in alto) non devono comparire anche nei sottotitoli, né prima né dopo: vanno tolte dal sottotitolo. Colore delle keyword: **verde #49762E** del brand.
- 2026-11-03 · Sottotitoli leggermente più grandi; Ross gradisce lo stile **vetro smerigliato** (glass) con colori regolati perché si leggano e parola evidenziata ben visibile.
- 2026-11-03 · Schede con concetti nominati (es. lifespan / healthspan): **grandi, al centro**, e la voce si **illumina quando Daniele la nomina**.
- 2026-11-03 · Il taglio non deve mai mangiare la fine di una parola (es. «healthspan» sentito a metà): in dubbio tenere più coda.
- 2026-11-03 · B-roll: preferire **riprese di Daniele che corre** (anche con inquadrature/angolazioni diverse) invece di stock con altre persone.
- 2026-11-03 · **Niente effetti sonori**: solo voce (e musica, se presente).
- 2026-11-03 · Frasi finali forti a schermo: metterle su un **post-it/supporto** che le renda leggibili.
- 2026-11-03 · CTA: parte **dopo** che Daniele ha finito di parlare, dura **almeno 5 s**, testo articolato e coerente col tema del video, con animazioni **mi piace / condividi / salva**; rimanda a una **parola da commentare** per avere info sui **percorsi di coaching personalizzati** di Correre Naturale.
- 2026-11-03 · Hook: Ross può chiedere un kicker diverso da «Parliamo di» (es. «Ci hai mai pensato?»).
- 2026-11-03 · Daniele sempre **a fuoco e in alta definizione**: usare il sorgente 4K (`video4k.mp4`, ricavato da `originale.webm`), non la copia 1080p. Niente sfocature su di lui.
- 2026-11-03 · **Pochi B-roll**: mai stock di altre persone come riempitivo. Dove il sorgente ha schede: riprese di Daniele da altri suoi video, suoi fermi immagine nitidi, o scene grafiche con Daniele in finestra. Riprese con la bocca che parla solo se il labiale non si legge.
- 2026-11-03 · **Transizioni fluide**: niente flash, zoom-through, glitch o salti di zoom tra i tagli. Dissolvenza di 5 fotogrammi tra i pezzi (`style.cutBlend`), B-roll in dissolvenza, `cutZoom` spento.
- 2026-11-03 · Reel pubblicati in sequenza: **ogni reel ha animazioni firma diverse** (glass widget, documentary, orbit, bento, prompt bar, jiggle delete, swipe, gravity drop…). Ogni reel ha la sua parola da commentare per il coaching.
