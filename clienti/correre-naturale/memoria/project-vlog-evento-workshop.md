---
name: project-vlog-evento-workshop
description: "Vlog del workshop dal vivo CN (24/10/2026): materiale in input/evento, pipeline master+ReelStudio, decisioni di Ross (consensi, musica, nome)"
metadata:
  node_type: memory
  type: project
  originSessionId: 56351d93-3d47-47db-8a24-1bfce604a407
  modified: 2026-11-05T11:06:16.071Z
---

Workshop Correre Naturale dal vivo del 24 ottobre 2026 (schermo in sala dice «Workshop Vicenza»; Ross: il nome è solo
«Workshop Correre Naturale»). Materiale dal telefono di Paola: `input/evento/` (36 clip iPhone verticali 1080×1920 + 13 foto),
inventario e scaletta in `PROPOSTE-VLOG-evento.md`. Le clip 0600, 0621, 0625, 0626 hanno audio spaziale `apac` che ffmpeg
non decodifica: solo B-roll muto.

Decisioni di Ross (5/11/2026): consenso di Daniela e liberatorie dei partecipanti OK; musica scelta da me
(`acustica-calma`); usare SOLO il materiale della cartella, niente clip di altri video; la chiusura di Daniele non c'è
registrata a camera → ricavata da IMG_0650 (133-143 s, Daniele parla al gruppo: «tra dieci anni voglio che stiate meglio»).

Pipeline vlog (pipeline C): `scripts/vlog_master.py` (pezzi normalizzati + concat in un master unico) →
`scripts/vlog_build.py` (project.json `cn-vlog_workshop` in ReelStudio, un cut per pezzo con blend, parole rimappate) →
`node rs_render.js` → `scripts/vlog_qa.py`, `scripts/vlog_cover.py`. Whisper large-v3 su clip lunghe con
`condition_on_previous_text=True` si blocca: usare `scripts/transcribe_ranges.py` (VAD, solo i tratti che servono).

**Why:** ReelStudio accetta un solo sorgente; il master risolve il multi-clip senza toccare Reel.tsx.
**How to apply:** per altri vlog o montaggi multi-clip ripartire da vlog_build.py; vedi [[project-ytcn38-y9v2-strumenti]].
