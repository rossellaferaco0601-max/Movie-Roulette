---
name: cliente-correre-naturale
description: Regole, brand e contesto del cliente Correre Naturale (Daniele Vecchioni, @correrenaturale). Usa SEMPRE prima di montare, correggere o consegnare reel/vlog per Correre Naturale, Daniele, Ross, Paola o Oscar.
---

# Cliente Correre Naturale®

1. Leggi per intero `clienti/correre-naturale/REGOLE-MONTAGGIO.md` (fonte di verità) e `clienti/correre-naturale/CONTESTO.md`.
   Memoria delle correzioni spiegate: `clienti/correre-naturale/memoria/` (leggi `feedback-*.md` prima di una revisione).
   Brand kit in `clienti/correre-naturale/brand/` (brand.json, loghi, manuale), guida ai reel in `guide/guida-reel.md`.
   Due motori disponibili: `CNReel` (video-engine/src/cn, master FFmpeg + 3D) e `RSReel` (motore ReelStudio del PC, catalogo effetti e schema project.json in `video-engine/reelstudio/CLAUDE.md`; props con `scripts/rs_props.ts`). Esempi reali di project.json in `video-engine/reelstudio/progetti/`.
2. Per un montaggio nuovo: prima il piano in chat, poi il via. In revisione: tocca SOLO i punti elencati.
3. Ogni correzione ricevuta va aggiunta in fondo a `REGOLE-MONTAGGIO.md` con la data, e il file va committato.
4. Prima di consegnare: 6-8 fotogrammi di controllo (volto libero, sottotitoli leggibili e non sovrapposti, colori brand, logo giusto), ritrascrizione dei tagli, durata CTA.

Vincoli non negoziabili: volto di Daniele sempre libero · sottotitoli sempre presenti · lime solo sulla parola detta · niente emoji · niente hook SVG inventati · taglio netto tra inquadrature diverse · «coaching personalizzato» · mai estrarre musica da una reference.

## Dopo ogni consegna
Classifica i reel appena pronti secondo il piano settimanale di Ross (Lun Scientifico · Mar Educativo · Mer Problem/Solution ·
Gio Pratico · Ven Conversione), con tema in breve e CTA finale: aggiorna `clienti/correre-naturale/consegne/CLASSIFICA-SETTIMANALE.md`
e riporta la tabella in chat. Consegna anche la **trascrizione integrale del video YouTube originale** (salvata in
`clienti/correre-naturale/consegne/trascrizioni/`, con i minuti) e riportala in chat.

## Formato delle schede (Ross, 10/11/2026): sempre questo, quando chiede «le schede»
Un titolo `##` per serie, poi per ogni reel la riga in grassetto **«ID nome · Giorno Categoria · CTA PAROLA»** e sotto un solo paragrafo
con il tema (per Problem/Solution e testimonianze: «Il problema: … La risposta: … Chiusura: …»). Mai schede a elenco puntato.
Esempio e dettagli: `clienti/correre-naturale/memoria/feedback-formato-schede.md`; modello vivo: `consegne/CLASSIFICA-SETTIMANALE.md`.

## Regola fissa: il volto non si copre MAI (Ross, 10/11/2026)
Nessuna grafica, titolo, domanda o sottotitolo può stare sul volto, nemmeno per un fotogramma e nemmeno quando la persona abbassa la testa.
Prima di ogni render: `../.claude/skills/effects/.venv/bin/python scripts/cn_facecheck.py <master> 0.44` (da `video-engine/`). Se fallisce, si allarga
si abbassano e si rimpiccioliscono le grafiche (`gfxShift`/`gfxScale`, sempre sopra 0,80 per la zona sicura di Instagram); la fascia verde in
basso è bocciata (10/11). Non si consegna finché il controllo non passa.
