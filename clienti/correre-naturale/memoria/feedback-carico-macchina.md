---
name: feedback-carico-macchina
description: Non sovraccaricare il PC di Ross - un reel alla volta, niente render/scontorni in parallelo, thread e concorrenza bassi
metadata:
  type: feedback
---

Ross (6/11/2026, notte): il computer non deve surriscaldarsi né andare in sovraccarico. C'è tempo: un reel alla volta.

**Why:** i render Remotion in parallelo avevano già fatto fallire Y3/Y4 (timeout proxy) e scaldano la macchina;
Ross lascia girare il lavoro di notte e vuole il PC integro.

**How to apply:** una sola pipeline per volta (scontorno RVM → build → render → QA), mai due processi pesanti insieme;
`rs_render.js` usa `RS_CONC` (default 3), `rvm_cutout.py` usa `RVM_THREADS` (default 4). Vedi [[project-ytcn38-y9v2-strumenti]].
