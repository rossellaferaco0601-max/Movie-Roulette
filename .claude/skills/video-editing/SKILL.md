---
name: video-editing
description: Montaggio video e reel end-to-end con FFmpeg + Remotion: taglio, ritmo, formati social, export. Usa quando l'utente chiede di montare, tagliare, convertire, esportare un video o un reel, o di assemblare clip.
---

# Video Editing

## Pipeline standard per un reel
1. **Ingest**: metti sorgenti in `video-engine/public/` (mai in `src/`). Ispeziona con `ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of default=nw=1 file.mp4`.
2. **Normalizza**: `video-engine/scripts/ffmpeg-presets.sh to-reel in.mp4 public/clip.mp4` (1080x1920, 30fps, H.264).
3. **Trascrivi** (se c'è voce): `python3 video-engine/scripts/transcribe.py public/clip.mp4 --lang it --out src/captions/clip.json`.
4. **Componi** in Remotion: `<OffthreadVideo>` per le clip, `<Sequence from>` per il timing, `TransitionSeries` per i tagli con transizione, componenti per titoli/sottotitoli.
5. **Preview**: `npx remotion studio` (porta 3000) oppure `npx remotion still <Comp> out/f.png --frame=N` per controllare singoli frame.
6. **Render**: `npx remotion render <Comp> out/final.mp4 --codec=h264 --crf=18`. Per Instagram: H.264, yuv420p, AAC 192k, `-movflags +faststart` (Remotion lo fa di default).
7. **Audio finale**: `ffmpeg-presets.sh normalize-audio` (-14 LUFS).

## Ritmo
- Reel: hook nei primi 1–2 s (testo grande + movimento), taglio ogni 1.5–3 s, durata 7–30 s.
- Taglia sul beat: ricava i beat con `getAudioData` + `visualizeAudio` (`@remotion/media-utils`) o a mano in `ffmpeg -af astats`.
- J-cut / L-cut: fai partire l'audio della clip successiva 10–15 frame prima/dopo il taglio video con `<Audio startFrom>` separato dal `<OffthreadVideo muted>`.

## Trim e timing in Remotion
- `<OffthreadVideo src startFrom={inFrame} endAt={outFrame} />` (frame della sorgente).
- `playbackRate` per speed ramp; `volume={(f) => interpolate(...)}` per fade audio.
- Durata composizione dinamica: `calculateMetadata` con `getVideoMetadata` da `@remotion/media-utils`.

## FFmpeg veloce (senza re-encode quando possibile)
- Taglio: `ffmpeg -ss 00:00:03 -to 00:00:12 -i in.mp4 -c copy out.mp4`
- Concat stessi codec: `scripts/ffmpeg-presets.sh concat a.mp4 b.mp4 out.mp4`
- Thumbnail: `scripts/ffmpeg-presets.sh thumb in.mp4 cover.jpg 2.5`
- GIF: `ffmpeg -i in.mp4 -vf "fps=15,scale=540:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" out.gif`

## Qualità
- Controlla sempre un frame a 1x prima del render completo; render completo solo alla fine.
- Chromium in cloud: `remotion.config.ts` usa `/opt/pw-browsers/chromium` (o `REMOTION_BROWSER`).
