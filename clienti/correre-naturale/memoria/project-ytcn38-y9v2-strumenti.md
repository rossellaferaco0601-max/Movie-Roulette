---
name: project-ytcn38-y9v2-strumenti
description: "Strumenti installati il 5/11/2026 per Y9 v2 (scontorno RVM, voce clonata Chatterbox) e cosa manca ancora (clip vera di Daniele)"
metadata:
  node_type: memory
  type: project
  originSessionId: c04e0755-af1c-4c7a-9f67-cb4dae43b560
  modified: 2026-11-04T23:45:34.670Z
---

Il 5/11/2026 per il reel Y9 v2 «La costanza» in stile reference (reel zeeuiux «raw clip vs the edit») sono stati
installati e provati:
- Scontorno video RobustVideoMatting ONNX in ReelStudio/tools/rvm (resnet50, 0,23 s/fotogramma su CPU, nessuna GPU);
  script scripts/rvm_cutout.py → PNG in progetti/cn-ytcn38-src/scontorni/<secondi×30>.png, il formato che l'effetto
  «scritta dietro la persona» di ReelStudio già leggeva (prima lo scontorno era MediaPipe nel browser, a 720 px).
- Clonazione vocale Chatterbox multilingue (MIT) in ReelStudio/tools/venv_tts (Python separato: torch 2.6 CPU, numpy<2,
  setuptools<81 obbligatorio perché resemble-perth importa pkg_resources). Voce di riferimento: work/voce/ref_daniele.wav
  (12 s puliti da YTCN 38, 420-432 s). ~70 s per 7 s di audio; genera code spurie («Grazie») da tagliare al primo silenzio.
- Nuovi effetti Remotion in src/remotion/effects_cn3.tsx (behindTitle, rolePill, kinetic, togglePills, stageCard);
  Reel.tsx supporta `behind: true` nel registro, `audio.voiceovers` e il bottone «✓ Pubblicato» con coriandoli nella CTA coaching.

Ancora aperto: la frase «Sono Daniele Vecchioni, fondatore di Correre Naturale» NON esiste in nessun video (YTCN 38 e
i 4 reel pubblicati ritrascritti): nel progetto cn-y9v2_costanza c'è un segnaposto (Daniele muto a 146-149,8 s del sorgente
+ voce clonata). Quando Daniele registra la clip va aggiunta in coda al sorgente e l'intervallo intro va sostituito
(scripts/y9v2_build.py, INTRO_SRC). La voce clonata va usata solo con il consenso di Daniele.
Vedi [[user-ross-reelstudio]].
