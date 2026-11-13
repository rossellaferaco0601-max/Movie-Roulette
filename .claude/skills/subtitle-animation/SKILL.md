---
name: subtitle-animation
description: Sottotitoli animati word-by-word (stile TikTok/CapCut), caption da Whisper, SRT, karaoke highlight, hard-burn con FFmpeg. Usa per aggiungere sottotitoli, caption animate, trascrizioni a un video o reel.
---

# Subtitle Animation

## Pipeline
1. Trascrivi: `python3 video-engine/scripts/transcribe.py public/clip.mp4 --lang it --model small --out src/captions/clip.json` → JSON nel formato `@remotion/captions` (`text,startMs,endMs,timestampMs,confidence`) + `.srt`.
   - Modelli: `tiny` (test), `small` (buono per it), `medium`/`large-v3` (massima qualità, più lenti). Serve rete verso huggingface.co al primo download.
   - Alternativa nativa: `@remotion/install-whisper-cpp` (`installWhisperCpp` + `transcribe`) e `toCaptions()`.
2. Correggi il testo nel JSON (nomi, maiuscole): conserva i tempi.
3. Componi con `SubtitledReel` (`video-engine/src/compositions/SubtitledReel.tsx`): `createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: 800–1200})` raggruppa le parole in pagine; la parola attiva è quella con `fromMs <= t < toMs`.

## Stili
- **Karaoke**: parola attiva colorata (giallo/brand) + scale 1.1 con spring, resto bianco.
- **One word**: una parola enorme per volta (`combineTokensWithinMilliseconds: 0`), font 120–160, pop-in.
- **Box**: sfondo `rgba(0,0,0,.55)` o colore brand pieno dietro la pagina, `borderRadius 20`.
- **Mask reveal**: ogni parola sale da `translateY(100%)` dentro un contenitore `overflow:hidden`.
- Sempre: font bold 900, `textShadow`/stroke per leggibilità, posizione tra 55% e 75% dell'altezza (sotto il volto, sopra la UI social), max 3–5 parole per pagina, zona sicura 120px laterale.
- Emoji/evidenziazioni: mappa parole chiave → colore/emoji in un dizionario di props.

## Hard-burn senza Remotion
`video-engine/scripts/ffmpeg-presets.sh burn-srt in.mp4 subs.srt out.mp4` (stile via `force_style`). Per sottotitoli morbidi: `ffmpeg -i in.mp4 -i subs.srt -c copy -c:s mov_text out.mp4`.

## Verifica
Renderizza uno still su una parola centrale (`--frame`) e controlla overlap, leggibilità e zona sicura prima del render completo.
