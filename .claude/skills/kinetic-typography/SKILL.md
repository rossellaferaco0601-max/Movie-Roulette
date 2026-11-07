---
name: kinetic-typography
description: Testo animato (kinetic typography) per reel e titoli in Remotion. Usa quando l'utente chiede parole che entrano/escono, titoli animati, testo a tempo di musica o voce, hook iniziali per reel.
---

# Kinetic Typography

Base: `video-engine/src/compositions/KineticTitle.tsx` e `video-engine/src/lib/easing.ts`.

## Regole
- Anima sempre in funzione di `useCurrentFrame()`; mai `setTimeout`/CSS transitions (non sono deterministiche in render). GSAP va usato solo con `gsap.timeline({ paused: true }).seek(frame / fps)` dentro un `useEffect` sincronizzato al frame.
- Entrata: `spring()` con `damping 10–14`, `stiffness 150–250`. Uscita: fade/scale negli ultimi 10–15 frame.
- Stagger tra parole: 4–8 frame. Stagger tra lettere: 1–3 frame.
- Per testo a ritmo di voce usa i `startMs` delle caption di Whisper (`scripts/transcribe.py`) e converti in frame con `Math.round(ms / 1000 * fps)`.
- Reel verticale (1080x1920): font 110–160px per titoli, peso 800–900, `letterSpacing` negativo, max 3 parole per riga, zona sicura 120px dai bordi e 380px dal basso (UI di Instagram/TikTok).
- Font: `@remotion/google-fonts` (es. `loadFont()` di Inter, Bebas Neue, Montserrat) oppure font locali con `staticFile()`.
- Una parola "accento" per frase (colore brand) attira l'occhio: non più di una ogni 3.

## Pattern
- **Pop-in**: scale 0→1 + rotate -12→0 + translateY 60→0 (vedi `popIn`).
- **Typewriter**: `text.slice(0, Math.floor(interpolate(frame, [0, n], [0, text.length])))`.
- **Mask reveal**: contenitore con `overflow: hidden`, testo con `translateY(100%)→0`.
- **Highlight box**: rettangolo colorato dietro la parola che si allarga da `scaleX(0)`.
- **Jitter/shake** per enfasi: `noise2D` da `@remotion/noise` con ampiezza 2–4px.

## Render
`cd video-engine && npx remotion render KineticTitle out/titolo.mp4 --props='{"words":["..."]}'`
