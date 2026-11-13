---
name: audio-sync
description: Sincronizzazione audio-video, beat detection, voiceover (ElevenLabs), musica, ducking, normalizzazione loudness, visualizzazione audio in Remotion. Usa per allineare tagli alla musica, aggiungere voce, mixare tracce, correggere offset audio.
---

# Audio Sync

## Timing audio in Remotion
- `<Audio src startFrom endAt volume loop />`; più tracce = più `<Audio>`.
- Beat/onset: `const data = await getAudioData(src)` in `calculateMetadata` o con `useAudioData`; `visualizeAudio({audioData, frame, fps, numberOfSamples: 32})` dà le ampiezze per frame; un beat = picco locale delle basse (`samples[0..3]`) sopra soglia.
- Lista beat statica: calcola una volta i `beatFrames` e usa `beatFrames.findIndex` per scattare animazioni (scale pulse 1→1.08 sul beat, decadimento in 6 frame).
- Ducking: `volume={(f) => isVoiceSpeaking(f) ? 0.25 : 1}` con rampe di 8–10 frame via `interpolate`.
- Offset: se l'audio è in anticipo di N ms, usa `<Audio startFrom={Math.round(N/1000*fps)}>` o `<Sequence from={-frames}>`.

## Voiceover con ElevenLabs
- SDK già installato (`elevenlabs` in `video-engine`). Serve `ELEVENLABS_API_KEY` (salvarla come secret di ambiente, non nel repo).
- ```ts
  import { ElevenLabsClient } from "elevenlabs";
  const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  const audio = await client.textToSpeech.convert("VOICE_ID", { text, model_id: "eleven_multilingual_v2", output_format: "mp3_44100_128" });
  ```
  Salva in `public/voice.mp3`, poi trascrivi con `scripts/transcribe.py` per i sottotitoli word-level.
- Durata voce → durata composizione: `getAudioDurationInSeconds` da `@remotion/media-utils` in `calculateMetadata`.

## FFmpeg
- Estrai: `scripts/ffmpeg-presets.sh extract-audio in.mp4 out.wav`
- Loudness social: `scripts/ffmpeg-presets.sh normalize-audio in.mp4 out.mp4` (-14 LUFS, TP -1.5)
- Mix voce + musica con ducking: `-filter_complex "[1]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[m];[0][m]amix=inputs=2"` (con voce come input 0 e sidechain adeguato)
- Offset: `-itsoffset 0.150 -i audio.wav` sposta l'audio di 150 ms.
- Onset grezzi: `ffmpeg -i a.wav -af "silencedetect=n=-30dB:d=0.3" -f null -` (pause) oppure `aubio onset a.wav` se installato.

## Web Audio API (per player/preview in browser)
- `AudioContext` + `AnalyserNode.getByteFrequencyData` per visualizer live nel Player; nel render usa sempre `visualizeAudio` (deterministico).
