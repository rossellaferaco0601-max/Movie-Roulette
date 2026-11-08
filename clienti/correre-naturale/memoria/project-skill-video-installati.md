---
name: project-skill-video-installati
description: "Il 5/11/2026 installati 56 skill video/motion in ~/.claude/skills (effects di Vibha con venv propria, Remotion ufficiali, HyperFrames, reel editor); Node solo dentro ReelStudio"
metadata:
  type: project
---

Il 5/11/2026 Ross ha chiesto di installare https://github.com/Vibha-Ramprakash/claude-video-effects e «tutti i
motion graphics reperibili». Risultato: 56 cartelle skill in `~/.claude/skills/`, tra cui `effects` (51 effetti
face-tracking, venv propria in `~/.claude/skills/effects/.venv` con mediapipe/opencv, provata OK),
i 13 `remotion-*` ufficiali, `remotion-motion-graphics`, `remotion-overlays` (fernandokaraka, rinominata),
i 9 skill iart-ai (animation-principles, logo-animation…), i reel editor `claude-video-reel-editor`,
`reels-editor`, `video-edit`, `talking-head-editing-skill` + stack ClaudinNarsis, gli skill HyperFrames
e `style-motion` (richiede chiave fal.ai).
Node NON è nel PATH: esiste solo `C:/Users/roxfe/Documents/ReelStudio/node/node.exe`. Gli skill Remotion/HyperFrames
vanno usati da lì o dopo aver aggiunto quel node al PATH. Il progetto correre_naturale non ha CLAUDE.md
(le regole stanno in REGOLE-MONTAGGIO.md); ReelStudio ne ha uno suo.

**Why:** evitare di reinstallare o di cercare di nuovo i pacchetti; sapere dove sta node.
**How to apply:** per effetti sul volto usare `/effects`; per grafiche Remotion appoggiarsi a ReelStudio. Vedi [[project-ytcn38-y9v2-strumenti]].
