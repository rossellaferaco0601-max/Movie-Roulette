# 9 reel da «YTCN 38» — correre con meno fatica (4/11/2026, versione 1)

Sorgente: `C:\Users\roxfe\Downloads\YTCN 38.mp4` (7:46, 4K 29,97 fps, unica inquadratura fissa in esterna, nessuna scheda né B-roll).
File in questa cartella: `<id>.mp4` (1080×1920, 30 fps), `<id>_copertina.jpg`, `<id>_didascalia.txt`.
Progetti modificabili in ReelStudio: `progetti/cn-y1_…` … `cn-y9_…` (↻ Ricarica progetto nella dashboard).

| Reel | Sorgente (s) | Durata video + CTA | Animazioni | Parola da commentare |
|---|---|---|---|---|
| Y1 L'auto efficiente | 0–15 · 36–65 · 71–79 | 51,6 + 6 s | lista in vetro, lower third, gauge carburante, widget 4×, parola a comparsa, interruttori | EFFICIENTE |
| Y2 Flessibilità metabolica | 94–101 · 108–143 | 42,4 + 6 s | box Grassi/Zuccheri che si illuminano, gauge intensità, parole a comparsa, interruttori | CARBURANTE |
| Y3 A cosa serve | 143–186 | 40,3 + 6 s | lista in vetro a 4 voci, notifica, gravity drop, parola a comparsa | RESISTENZA |
| Y4 Il vero segreto | 186–202 · 205–234 | 45,7 + 6 s | segnale a 3 voci, post-it, interruttori, lista in vetro, checklist, parola a comparsa | SEGRETO |
| Y5 Corri più lento | 234–283 | 47,6 + 6 s | parola a comparsa, timbro NO, lista in vetro, limitatore, stat stack, scritta a mano | LENTO |
| Y6 Naso bianco | 289–333 | 43,3 + 6 s | app che si cancellano, parole a comparsa, segnale, limitatore, titolo documentario, scheda consiglio | NASO |
| Y7 Sforzo percepito | 337–361 | 24,3 + 6 s | widget 3–4, barrato, parola a comparsa, notifica | ASCOLTO |
| Y8 5 strategie | 361–420 | 58,5 + 6 s | capitoli 01–05, parola a comparsa, interruttori, barrato, timbro FALSO, lista in vetro | STRATEGIE |
| Y9 La costanza | 420–452 | 31,8 + 6 s | gravity drop, parola a comparsa, barrato, interruttori, checklist | COSTANZA |

## Stile (dai reel già pubblicati su @correrenaturale)
- Daniele a tutto schermo dal 4K, crop 9:16 centrato sul volto rilevato in ogni pezzo; mai sfocato.
- Sottotitoli maiuscoli bianchi (Montserrat 900, contorno sottile) con la parola detta in verde lime #95FF00, 1 riga da max 3 parole, a 4/5 dell'altezza; le parole chiave del reel restano in lime.
- Handle @correrenaturale con icona Instagram in alto a destra per tutta la durata (come nei reel pubblicati).
- Hook: scritta animata «a scatole» sopra Daniele nei primi 2,6 s, Daniele visibile dal primo fotogramma (per tornare alla copertina piena «Parliamo di…» basta `hook.style: "talk"`).
- Transizioni: dissolvenza di 5 fotogrammi tra i pezzi e anche sui jump cut già presenti nel video YouTube (rilevati con la differenza tra fotogrammi, `work/ytcn38/framediff_src.npy`); nessun salto di zoom; punch-in leggeri (1,07) sulle parole forti.
- Un elemento animato ogni 4-6 s, sempre sotto il mento (zona volto protetta 6-42 %), mai due grafiche grandi insieme. Niente B-roll: nel sorgente non ce ne sono e la richiesta era un montaggio pulito.
- Niente effetti sonori; musica diversa per ogni reel a volume 0,08 con ducking.
- CTA coaching di 6 s dopo la fine del parlato (mi piace / condividi / salva + parola da commentare), verde / crema / video alternati.

## Controlli fatti
- ✓ Tagli agganciati ai silenzi reali (RMS) e verificati ritrascrivendo ogni reel montato (`scripts/ytcn38_qa.py audio`): nessuna parola doppia o mozzata ai tagli.
- ✓ Fotogrammi di controllo per ogni effetto di ogni reel (`work/ytcn38/<id>/stills_sheet.jpg`) e 12 fotogrammi del video finale (`work/ytcn38/<id>/sheet.jpg`): volto libero, sottotitoli leggibili.
- ✓ Nessun lampo (`scripts/qa_flash.py`): gli unici stacchi netti sono l'entrata/uscita dell'hook e delle parole a comparsa.
- ✓ Testo a schermo solo con parole e numeri detti da Daniele.
- ✓ Render finale dei 9 reel (4/11, 21:20-22:52) ricontrollato: fotogrammi, lampi e audio ai tagli tutti ok. Le uniche segnalazioni del controllo lampi sono mani che si muovono veloci, parole a comparsa e le dissolvenze sui jump cut.

## Correzioni a Whisper (verificate a orecchio con seconda trascrizione)
- «istancabile» → **instancabile**; «scorte metaboliche» → **scorie metaboliche**; «hai meglio l'aria» → **riesci a trasformare meglio l'aria** (Whisper aveva saltato le parole); «fino a se stesso» → **fine a se stesso**.
- ⚠ «E per iniziare ad ascoltarci» (Y6, 301 s): due trascrizioni sentono «ascoltarci», che ha senso (ascoltare noi stessi); lasciato così. Se Daniele dice «ascoltarti», cambia la parola in `scripts/reels_ytcn38.py → CORRECTIONS`.

## Da sapere
- Il volto di Daniele è molto in alto nel 16:9 originale: nel 9:16 i capelli arrivano vicino al bordo, come nei reel pubblicati girati in studio. Per questo le parole a comparsa stanno al petto e i punch-in sono leggeri.
- Y7 dura 24 s (il blocco sullo sforzo percepito è breve ma completo); Y8 arriva a 58 s perché contiene tutte e 5 le strategie.
- Modifica a ReelStudio: `src/remotion/captions.tsx` ha un nuovo campo `captions.wordGap` (spazio tra le parole), necessario perché con la parola attiva ingrandita le parole si toccavano. Backup in `captions.tsx.bak-20261104`.

## Y9 v2 «La costanza» in stile reference (5/11/2026) — `Y9v2_costanza.mp4`
Reference: reel zeeuiux «Claude did this in 10 minutes» (Reference Dashboard, Screen_Recording_20261030_234604). 31,8 s + CTA 8 s.
- Hook a scatole (2,4 s, whoosh) → parole cinetiche («della corsa a bassa intensità / del programma perfetto / di qualsiasi tecnica») → **LA COSTANZA** gigante in lime che passa dietro Daniele (scontorno RVM) → «Oggi o domani» barrato → pillole nere con interruttore lime (ogni giorno / settimana / mese / anno) → palco crema «SI COSTRUISCE NEL TEMPO» con grafico che cresce e Daniele in finestrella → parole che si accumulano (più veloce / leggero / elastico / efficiente) → «con MENO SFORZO».
- **CTA coaching animata e interattiva** (8 s, Daniele che corre sotto): dito che tocca la casella, COSTANZA che si scrive (tastiera), «Pubblica → ✓ Pubblicato» con coriandoli (invio + brillantini), notifica DM di @correrenaturale che arriva (notifica), mi piace con cuoricini (pop), condividi con aeroplanino (swish), salva (click), «+ Segui → ✓ Segui già» (successo).
- **Suoni** (5/11, Ross): whoosh / impatto / swish / click / pop sugli effetti, volume 0,45; un suono per ogni pillola e per ogni parola che si accumula. Nessuna clip di presentazione e nessuna voce clonata (tolte su richiesta).
- Colori: lime #95FF00, verde #49762E, crema #F4F1E5, font Blinker + DM Serif corsivo.
- Controlli: audio ai tagli (87/87 parole), fotogrammi, lampi (solo pop delle scritte e dissolvenze).
- Strumenti nuovi: scontorno RVM (`scripts/rvm_cutout.py`, PNG in `progetti/cn-ytcn38-src/scontorni`), effetti `src/remotion/effects_cn3.tsx`, CTA coaching nuova + allineamento scontorno in `Reel.tsx`, scontorni passati al render in `scripts/rs_render.js`. Backup: `Reel.tsx.bak-20261105`, `effects.tsx.bak-20261105`. La clonazione vocale (Chatterbox in `ReelStudio/tools/venv_tts`) resta installata ma non è usata.

## Revisione del 5/11/2026 pomeriggio (correzioni di Ross) — tutti i reel
Comune a tutti: **niente musica**; **CTA 7 s animata e interattiva** (dito che tocca, commento che si pubblica con coriandoli, notifica DM, cuori SVG, aeroplanino, «+ Segui → ✓ Segui già», suoni discreti a 0,25); sottotitoli mai sopra i widget (widget alzati a y 0,37-0,44) e parole lunghe che si rimpiccioliscono; **aria di 0,16 s dopo l'ultima parola** di ogni pezzo (parole troncate); **niente emoji** (icone SVG); handle spento sotto i titoli giganti; nei reel con clip sotto la CTA (Y3, Y6) il clip è Daniele dello stesso video.
| Reel | Correzioni specifiche | Animazione firma nuova |
|---|---|---|
| Y1 | «nel modo giusto» ora gigante dietro Daniele; glass list, gauge e widget sotto i sottotitoli | titolo dietro la persona (scontorno RVM) |
| Y2 | via «GRASSI» sopra lo specchietto; gauge più in alto; taglio «diverse fonti di energia» con aria | — (gauge + box che si illuminano restano) |
| Y3 | bonus più grande e centrato, icona SVG; tessere senza emoji; taglio finale con aria | clip CTA con Daniele |
| Y4 | post-it grande con **fatica** evidenziata; «a parità di sforzo» gigante dietro Daniele | spotlight FATICA (effetto Vibha): la scena si scurisce e la parola brilla dietro la testa |
| Y5 | hook «Per correre meglio, più a lungo, più forte, devi correre lentamente»; «LENTAMENTE» dietro Daniele; widget alzati | titolo dietro la persona |
| Y6 | hook «Non servono strumenti per allenarti bene»; parola lunga nei sottotitoli ridotta; ultima parola con aria; clip CTA coerente | disinstallazione glitch «Orologi e cardiofrequenzimetri» (Vibha) |
| Y7 | scala 1-10 animata con 3-4 che si accende; «in difficoltà» più grande; ultima parola con aria | infinito che si disegna con un punto che lo percorre |
| Y8 | capitoli 01-05 con numero che rimbalza e barra lime; bici e nuoto come pittogrammi animati | le 5 strategie a ventaglio sopra la testa (Vibha lineup) |
| Y9 v2 | via suoni e musica tranne i pop a 0:26 e la CTA; «ed è la costanza» con fascia scura e contorno; «Oggi o domani» = carta che vola via e lascia «Ogni giorno» | — |
Strumenti: `scripts/reels_511.py` (correzioni sopra reels_ytcn38), `scripts/vibha_clip.py` (effetti Vibha sullo stesso taglio → `fxClip`), nuovi effetti `scaleTen`, `infinity`, `sportIcons`, `fxClip` in `effects_cn3.tsx`; capitolo animato in `effects.tsx`.

### Rifiniture del 5/11 pomeriggio (dopo la verifica)
- **Fine di ogni reel misurata sull'inviluppo audio** (`tail_end` in `reels_511.py`, `y9v2_build.py`): Whisper chiude le parole 0,05-0,15 s prima del vero, quindi l'ultima parola finiva a filo in quasi tutti i reel. Ora l'ultima parola è intera con ~0,1 s di aria prima della dissolvenza nella CTA.
- Y1: aria dopo «nel modo giusto» (taglio a 65,62 invece di 65,51: «giusto» finisce a 65,47, la «e» parte a 65,70).
- Y7: la scala 1-10 parte quando dice «10» (2,9 s), dopo l'hook, non più sopra.
- Y8: fotogramma nero singolo sul taglio a 42,40 s (render sovraccarico, 3 code in parallelo): rirenderizzato con 2 code al massimo. Nuovo controllo `scripts/qa_black.py` (fotogrammi scuri fuori CTA) su tutti i finali.

## Revisione del 6/11/2026 notte (marketing: Paola + Ross) — tutti i 9 reel rirenderizzati
Comune a tutti:
- **Sottotitoli**: parole più compatte (spazio 0,35 em, parola detta ingrandita del 4-10 % invece del 8-18 %); **sempre presenti**, anche
  sotto le parole grandi e le schede (c'è chi legge solo quelli); mai frasi mozze. Via le «parole a comparsa al posto del sottotitolo».
- **Volto sempre libero**: zona volto 0,06-0,47, ogni widget con y < 0,49 portato a 0,49 o più in basso; verificato fotogramma per
  fotogramma (`scripts/qa_volto.py`) e a occhio sulle schede di 12 fotogrammi. Niente che attraversi il viso nemmeno in entrata
  (notifiche partono sotto il mento, via le schede che cadevano dall'alto in Y3).
- **Sottotitoli mai sopra i widget**: tutti i widget finiscono sopra la riga a 0,80 (Y3 parole cinetiche, Y5 scheda «Bassa» su una riga).
- **Logo**: via l'icona Instagram; **logo circolare del brand** in bianco con disco scuro traslucido, in alto a destra sopra l'handle;
  spento durante l'hook e i titoli giganti.
- **Stacchi di camera**: punch-in alternato del 10 % sui pezzi (jump cut classico) + dissolvenza 5 fotogrammi; tagli ricontrollati.
- **Hook visivo nei primi 2,8 s** (idee di Ross dalle immagini generate, rifatte in SVG nei colori del brand, scontorno RVM per
  le grafiche dietro la testa): effetti `hkBack` / `hkFront` in `ReelStudio/src/remotion/effects_hook.tsx`.
| Reel | Hook visivo (0-2,8 s) | Altre correzioni |
|---|---|---|
| Y1 | tachimetro crema→azzurro→verde dietro la testa con lancetta; corridore stanco a sinistra, pittogramma CN che corre a destra; anello azzurro con freccia attorno al titolo, raggi lime | «nel modo giusto» scontornato anche dopo lo stacco a 44,2 s |
| Y2 | corpo stilizzato a destra con le «centrali energetiche» che si accendono e frecce circolari; arco lime a sinistra; raggi | via «CARBOIDRATI» a comparsa |
| Y3 | ciclo GRASSI → CARBOIDRATI → ENERGIA: badge con icone attorno alla testa, archi-freccia lime dietro | «Più chilometri / a lungo / forte» = parole cinetiche sotto il mento (le schede cadevano attraverso il volto e sui sottotitoli); notifica bonus a 0,56 |
| Y4 | lucchetto che si apre con bagliore lime a destra, chiave a sinistra, anello attorno al titolo | — |
| Y5 | battito calmo lime dietro le spalle, cuore a sinistra, raggi sotto il titolo lungo | scheda «Bassa intensità» su una riga a 0,55 con una sola chip (Daniele vicino, mento a 0,52); «fieno in cascina» a metà busto |
| Y6 | orologio, fascia cardio e telefono barrati uno dopo l'altro sotto il titolo | via la clip «uninstall» (aveva un glitch sul volto) |
| Y7 | barra 1→10 con cursore che scivola verso il 3 | notifica a 0,57 |
| Y8 | 1-2-3-4-5 ad arco sopra la testa (via le schedine nere «lineup», illeggibili) | fotogramma nero a 42,40 s: era l'ultimo fotogramma del pezzo 2, pezzo accorciato di 1 fotogramma (`cut_trim`) |
| Y9 v2 | calendario «Ogni settimana» che si spunta giorno per giorno sotto il mento; titolo a 1250 | — |
Controlli su ogni finale: `qa_black` (nessun fotogramma scuro fuori CTA), `qa_flash` (solo dissolvenze e ingressi delle grafiche),
`qa_volto`, 12 fotogrammi, ritrascrizione Whisper (tutte le parole, nessuna differenza ai tagli).
Macchina (Ross): un reel alla volta, render a 3 code (`RS_CONC`), RVM a 4 thread (`RVM_THREADS`), Whisper a 6 thread (`QA_THREADS`).

### 6/11/2026 mattina — consegna (Ross: «solo le correzioni tecniche»)
- **Via tutti gli hook animati** della notte (tachimetro, corpo, ciclo, lucchetto, battito, strumenti barrati, barra, numeri, calendario):
  Ross li ha giudicati brutti. Resta il titolo in box dei primi 2,6 s come nelle versioni consegnate al marketing.
- **Via la scritta «@correrenaturale»**: in alto a destra solo il logo circolare del brand, scontornato (bianco su trasparente, ombra
  morbida cotta nel PNG `ReelStudio/clients/correre-naturale/logo-circolare-bianco.png`, 170 px, centro a x 0,86 / y 0,07).
- Restano: sottotitoli compatti e sempre presenti, volto libero, widget mai sui sottotitoli, punch-in sugli stacchi, Y8 senza
  fotogramma nero, Y3 parole cinetiche, Y5 scheda «Bassa» su una riga, Y6 senza clip glitch.
- Render dei 9 finali 08:35-09:47, uno alla volta (un doppione della serie era rimasto vivo per mezz'ora: chiuso). Controlli:
  fotogrammi neri (nessuno), file integri, 2 fotogrammi per reel a occhio.

### 6/11/2026 pomeriggio — seconda revisione di Ross (solo i punti richiesti)
Comune a tutti: **sottotitoli più compatti** (spazio 0,26 em, parola detta ingrandita max 7 %); **niente logo** in alto a destra;
CTA «percorsi di coaching **personalizzato**»; CTA verificata ≥ 7 s in tutti i reel (ffprobe: 7,0 s). Le didascalie non sono state toccate
(contengono ancora «coaching personalizzati»: da cambiare se si vuole lo stesso testo).
| Reel | Correzioni |
|---|---|
| Y1 | 0:15 taglio netto tra le due inquadrature (niente dissolvenza) |
| Y2 | 0:07 taglio netto; specchietto ridotto (0,82) e più lontano dai sottotitoli; lancetta che si muove subito nelle basse intensità e sale solo da «mano a mano che l'intensità si alza» |
| Y3 | lista in vetro ridotta (0,86), più lontana dai sottotitoli; bonus «Migliore salute metabolica, / anche fuori dalla corsa» su due righe |
| Y4 | post-it ridotto (0,8) e a 0,52: i sottotitoli non lo coprono più; **«scorte» metaboliche** (sottotitoli e lista); «A PARITÀ DI SFORZO» 124 px, tutto sopra la testa |
| Y6 | icone SVG orologio / cardiofrequenzimetro / tabelle che si cancellano (da 1,85 s, dopo l'hook); «L'ASCOLTO / DEL TUO CORPO» in evidenza in alto, dietro Daniele (scontorno RVM 298,9-300,9) |
| Y7 | infinito completo (lunghezza vera della curva) |
| Y8 | bici e nuoto sotto la scheda del capitolo 02 (non più sovrapposti); pittogrammi per tutte le 5 strategie: chilometri + con criterio, forza + mobilità, alimentazione + recupero, camminata |
| Y9 v2 | «ed è / LA COSTANZA» tutto sopra la testa (128 px): leggibile |
Strumenti: `scripts/pomeriggio.sh` (render + fotogrammi neri + lampi), prop `scale` su gauge / glassList / postit, `low` sul gauge, `noFit` sul titolo
dietro la persona, `cut.hard`, nuovi pittogrammi in `effects_cn3.tsx`, icone app in `effects_cn2.tsx`. Backup `.bak-20261106-pom`.
