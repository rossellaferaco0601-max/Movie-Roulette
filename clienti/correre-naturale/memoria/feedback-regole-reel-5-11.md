---
name: feedback-regole-reel-5-11
description: "Regole di Ross del 5/11/2026 per i reel CN: niente musica, CTA 7 s animata/interattiva, sottotitoli leggibili senza sovrapposizioni, suoni discreti, animazioni diverse tra reel"
metadata:
  node_type: memory
  type: feedback
  originSessionId: c04e0755-af1c-4c7a-9f67-cb4dae43b560
  modified: 2026-11-05T10:13:10.499Z
---

Correzioni di Ross (5/11/2026) valide per tutti i reel Correre Naturale:
- **Niente musica di sottofondo.** I suoni, se ci sono, discreti e a volume basso (0,25-0,3); nei reel v1 nessun suono tranne la CTA.
- **CTA sempre 7 secondi**, animata, interattiva e ben leggibile (quella di Y9 v2 con dito, commento, notifica DM, cuori, aeroplanino, Segui le piace molto). Il clip sotto la CTA deve essere coerente col video (niente B-roll a caso).
- **Sottotitoli sempre leggibili**, mai sovrapposti ai widget (glass box, gauge); parole lunghe («cardiofrequenzimetro») non devono uscire dal fotogramma.
- **Nessuna sovrapposizione tra elementi**; i tagli non devono troncare le parole (lasciare aria dopo l'ultima parola).
- **Reel in sequenza = animazioni diverse** tra loro: usare gli effetti nuovi (51 effetti Vibha in ~/.claude/skills/effects, effects_cn3) per diversificare.
- Niente emoji (vedi [[feedback-niente-emoji-animazioni]]). Prima di lavori lunghi vuole un orario di consegna.

**Why:** feedback diretto dopo la consegna dei 9 reel YTCN 38 e di Y9 v2.
**How to apply:** nei builder: audio.music None, cta.duration 7, tail pad sui tagli, widget sopra i sottotitoli; stills di controllo per ogni reel. Vedi [[user-ross-reelstudio]].
