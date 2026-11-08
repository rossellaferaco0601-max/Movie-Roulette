---
name: feedback-volto-libero
description: "Il volto di Daniele deve essere SEMPRE libero: nessuna animazione, box, titolo o grafica sopra il viso, in nessun fotogramma"
metadata:
  node_type: memory
  type: feedback
  originSessionId: c04e0755-af1c-4c7a-9f67-cb4dae43b560
  modified: 2026-11-05T14:43:47.499Z
---

Regola di Ross (5/11/2026, dopo la revisione dei reel YTCN 38): il volto di Daniele deve essere sempre libero.
Niente animazioni, box, card, titoli, parole a comparsa o altro sopra il viso, in nessun momento del reel.

**Why:** è la richiesta più ripetuta nelle correzioni (post-it, card e parole che finivano sul mento o sugli occhi);
il volto è il punto di contatto con chi guarda e va sempre visibile.

**How to apply:** prima di piazzare qualsiasi grafica, misurare la zona del volto (y0-y1) sui fotogrammi del taglio
(`scripts/ytcn38_qa.py frames` stampa volto(t,y0,y1)) e mettere la grafica sopra la testa o sotto il mento con margine;
le scritte «dietro la persona» vanno bene solo se lo scontorno le occlude davvero. Prima di consegnare, controllare
i fotogrammi estratti anche nei momenti in cui Daniele si muove (gesti, si sporge). Vedi anche [[feedback-regole-reel-5-11]].

Aggiunta 6/11/2026: vale anche per i sottotitoli, che non devono mai sovrapporsi a box o widget (si sposta il widget,
mai il sottotitolo sul volto). Logo: prima circolare del brand al posto dell'icona Instagram, poi (6/11 pomeriggio)
**nessun logo** in alto a destra nei reel (vedi [[feedback-solo-punti-richiesti]], [[feedback-vlog-dinamico]]).
