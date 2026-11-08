# Versione 4 (3-4/11, notte) — tutti e 6 i reel

I video in `output/` sono ora la versione 4. Le precedenti sono in `output/v3/`, `v2/`, `v1/`.

| Reel | Durata (video + CTA) | Animazioni firma | Parola da commentare |
|---|---|---|---|
| R1 Gli ultimi 20 anni | 61,3 + 6 s | box che si illuminano, schermo diviso, documentario, post-it | PIANO |
| R2 Nessun farmaco | 59,9 + 6 s | glass widget ad anello, prompt bar, numero che rotola, orbit, lancetta | MOTORE |
| R3 Le cellule | 50,9 + 6 s | lente, gravity drop, aggiornamento software, notifica | RINNOVO |
| R4 Il cervello | 47,4 + 6 s | documentary, bento con video, risonanza, rewind | CAMMINA |
| R5 La bugia | 49,3 + 6 s | timbro, frame break, jiggle delete, limitatore, swipe, segnale | TECNICA |
| R6 3 cose da domani | 51,0 + 6 s | app Note, timer, pulsante di accensione | DOMANI |

- ✓ Daniele nitido: tutti i reel partono dal sorgente 4K (`video4k.mp4`), le altre riprese dagli originali a 50 Mb/s.
- ✓ Transizioni: niente flash, glitch o salti di zoom. Dissolvenza di 5 fotogrammi ai tagli e agli stacchi del sorgente, dissolvenza nel colore del brand prima della CTA.
- ✓ Controllo automatico fotogramma per fotogramma (`scripts/qa_flash.py`), e tutti i punti segnalati guardati a occhio.
- ✓ Tagli agganciati agli stacchi reali dei video (`scripts/framediff.py`), con avviso se una clip attraversa uno stacco.
- ✓ Sottotitoli in vetro, keyword verdi non ripetute nei sottotitoli, niente effetti sonori, musica bassa con ducking, diversa per ogni reel.
- ✓ CTA di 6 s dopo la fine del parlato, con mi piace / condividi / salva e parola per il coaching.
- ✓ Corretti: R4 «la struttura del cervello che gestisce» (mancava il «che»), R6 maiuscola iniziale.
- ✓ Copertine rifatte dal 4K con i nuovi kicker; didascalie aggiornate con le nuove parole.
- ⚠ Materiale di Daniele limitato: alcune riprese (corsa al tramonto, prato, sentiero) tornano in più reel con inquadrature diverse.
- ⚠ Restano alcune immagini non di Daniele dove illustrano la frase: stock in R1 (anziani, dolori), R4 (due anziani), R5 (ginocchio, ragazzo col fiatone), oltre alle animazioni 3D di mitocondri, cervello e naso.

---

# Versione 2 (3/11, pomeriggio) — montaggio animato in ReelStudio/Remotion

I video in `output/` sono ora la versione 2. La versione 1 (motore ffmpeg) è in `output/v1/`.
I tagli e il testo sono gli stessi della v1, già verificati. La seconda ritrascrizione completa non trova parole doppie o mozzate ai tagli.

## Cosa cambia
- ✓ Montaggio fatto con la libreria Remotion di ReelStudio, nei colori del brand con logo e pittogramma ufficiali. Ogni 2-3 s entra un elemento animato:
  - contatori che contano;
  - numeri giganti;
  - checklist che si spuntano;
  - mito/verità e giusto/sbagliato;
  - capitoli 01-02-03;
  - barre che si caricano, grafico, box domande, messaggio che si scrive;
  - testo barrato, scritte a mano, emoji, badge;
  - punch-in, shake, flash e zoom-through.
- ✓ Copertina hook animata «Parliamo di…» del brand. CTA finale di 4 s con logo e parola chiave.
- ✓ Le schede 16:9 del video originale sono sostituite da B-roll di corsa a tutto schermo con stacchi netti, e i dati sono rifatti come animazioni. Rispetto alla v1 c'è molto più movimento in R2, R4 e R6.
- ✓ **Regola nuova:** un dato scritto in un'animazione non compare anche nei sottotitoli.
  - È automatica in `ReelStudio/src/remotion/Reel.tsx` (`dedupData`).
  - Con parola a comparsa, titolo misto, box domande e testo che si scrive i sottotitoli si nascondono.
- ✓ Le schede vengono messe da sole sotto la zona del volto, i sottotitoli più in basso: nessuna grafica copre il volto. Fotogrammi controllati: `work/qa/v2/*.jpg`.
- ✓ SFX al massimo 2 per reel, distanti almeno 7 s, mai sull'hook. Musica assente: la aggiungi tu.
- ✓ Le scritte a schermo usano solo parole e numeri detti da Daniele. In R5 ho corretto una scritta che non era sua.

## Progetti modificabili
I 6 reel sono anche progetti ReelStudio (`ReelStudio/progetti/cn-r1_…` … `cn-r6_…`) e si possono ritoccare dalla dashboard.
- **Nuova regola nella dashboard:** perché esportazioni e anteprima la applichino, riavvia ReelStudio (chiudi la finestra nera e riaprilo).
- **Anteprima:** si aggiorna solo ricompilando la UI (`npm run build-ui`), che oggi non parte perché manca il pacchetto `qrcode-generator`.

---

# Checklist versione 1 (ancora valida per tagli, audio e testo) — 6 Reel "Ho letto 5 studi sulla longevità"

Verifiche automatiche: `scripts/qa_audio.py` (ritrascrizione del reel montato e confronto con il testo previsto ai tagli), `scripts/qa_frames.py` (8 fotogrammi per reel e controllo che nessuna grafica copra il volto). Fotogrammi controllati a occhio: `work/qa/*_sheet.jpg`.

| Reel | Durata (video + CTA) | Volto visibile | CTA |
|---|---|---|---|
| R1 Gli ultimi 20 anni | 61,0 + 4 s | 21 s | CORRO |
| R2 Nessun farmaco fa questo | 59,9 + 4 s | 0,3 s (sorgente fatto di schede e B-roll) | PIANO |
| R3 Cosa fa la corsa alle tue cellule | 50,9 + 4 s | 22 s | GUIDA |
| R4 Camminare fa crescere il cervello | 47,4 + 4 s | 3,6 s (sorgente fatto di schede) | GUIDA |
| R5 La bugia più diffusa nel running | 49,3 + 4 s | 21 s | SCUOLA |
| R6 3 cose da fare da domani | 51,0 + 4 s | 3,1 s (sorgente fatto di schede) | PIANO |

## Contenuto
- ✓ Ogni reel tratta un'idea sola, ha un inizio forte e si chiude con un pensiero completo.
- ✓ Nessuna frase tagliata a metà: i tagli sono solo tra una frase e l'altra o nelle pause lunghe.
- ✓ Numeri e dati solo se detti da Daniele.
  - Le schede originali con 58 anni e ~23 anni (Daniele dice «60» e «20») sono coperte da B-roll e rifatte con i suoi numeri.

## Hook
- ✓ Copertina animata «Parliamo di…» nei primi 2,9 s: 5-7 parole, una sola parola evidenziata in verde.
- ✓ Hook verbale, scritto e visivo insieme. Nessun SFX nei primi 3 s.

## Volto e inquadratura
- ✓ 1080×1920, 30 fps, H.264 + AAC 48 kHz, faststart.
- ✓ Volto (crop centrato sul viso rilevato e punch-in alternati), Intero (schede originali su fondo crema) e B-roll a tutto schermo.
- ✓ Controllo automatico: nessuno sticker, emoji o scheda sul volto in nessun reel. Le parole GRANDI durano al massimo 1,5 s.

## Sottotitoli
- ✓ Sempre presenti, a 1-3 parole, che compaiono parola per parola. Parole chiave in pillola verde.
- ✓ Correzioni a mano rispetto a Whisper:
  - lifespan/healthspan;
  - «10 minuti al giorno» (Whisper lo aveva raddoppiato);
  - «la struttura del cervello»;
  - «non stai rinnovando»;
  - «il limitatore naturale»;
  - «uno dei momenti migliori»;
  - «E la differenza».
- ✓ Mentre compare una parola GRANDE, i sottotitoli sono nascosti.

## Audio e tagli
- ✓ Ogni taglio è agganciato al silenzio reale (RMS) e poi verificato con una nuova trascrizione.
  - Corretti a mano 3 tagli: una "e" accennata in R1, l'attacco di «E la differenza» in R1 e un "si" in R6.
- ✓ Silenzi lunghi rimossi, con circa 0,25 s di pausa tra le frasi.
- ✓ SFX: al massimo 2 per reel, distanti almeno 7 s, volume 0,55, mai sull'hook.
- ✓ Musica: assente, come richiesto (la aggiungi su Instagram). Gli ultimi 4 s di CTA sono senza voce, pronti per la musica.

## Dinamismo
- ✓ Un elemento ogni 3-4 s: punch-in, parola GRANDE, scheda (numero, checklist ✓/✗, consiglio, barra), emoji, B-roll.
- ✓ Mai due grafiche grandi nello stesso momento: sopra le schede originali compaiono solo sottotitoli ed emoji piccole.

## CTA e brand
- ✓ Schermata finale di 4 s dopo il video, con una sola parola chiave in DM.
- ✓ Verde #49762E e crema #F4F1E5, font Blinker. Nessun watermark.
  - Esclusi il popup "Subscribe" di YouTube e la barra di ricerca in stile Google presenti nel sorgente.
- ✓ La reference non è mai usata nel reel.

## Da sapere
- ⚠ Logo: non avevo il file ufficiale, quindi nella CTA c'è la scritta «CORRERE NATURALE®» in Blinker. Mandami il PNG del logo e lo inserisco.
- ⚠ R2, R4 e R6: nei tratti scelti il video originale mostra quasi solo schede, quindi il volto si vede poco.
- ⚠ «Il limitatore naturale» (R5, 0:22 circa): Whisper sente «l'imitatore». Ho scritto «limitatore» perché è l'unica lettura sensata. Ascoltalo un attimo.
- ⚠ Sottotitoli di R5 e R6 da verificare a orecchio:
  - «limitatore» in R5;
  - «momenti migliori» in R6. A orecchio Whisper oscilla tra «più importanti e i migliori» e «migliori»; ho tenuto la seconda versione.
