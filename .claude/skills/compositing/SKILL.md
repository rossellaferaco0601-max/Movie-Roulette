---
name: compositing
description: Compositing di layer video, immagini, maschere, blend mode, chroma key, overlay, picture-in-picture, split screen in Remotion e FFmpeg. Usa per sovrapporre elementi, rimuovere sfondi, split screen, effetti overlay.
---

# Compositing

## In Remotion (preferito, tutto in React)
- Stack di layer: `AbsoluteFill` annidati; l'ordine nel JSX = ordine z (ultimo sopra).
- Maschere: `clipPath: "inset(...)"`, `circle()`, `path()`; `maskImage: linear-gradient(...)` per sfumature; SVG `<mask>`/`<clipPath>` per forme complesse.
- Blend: `mixBlendMode: "screen" | "multiply" | "overlay" | "difference"`.
- Picture-in-picture: `<OffthreadVideo style={{position:"absolute", width:420, right:40, top:200, borderRadius:24, boxShadow}} />`.
- Split screen verticale (2 clip): due `AbsoluteFill` con `height: "50%"` e `top: 0 / 50%`, `objectFit: cover`.
- Chroma key/alpha: video con alpha → esporta ProRes 4444 o WebM VP9 con alpha e usa `<OffthreadVideo transparent>`; oppure rimuovi lo sfondo con FFmpeg `colorkey`.
- Sfocatura di sfondo per clip orizzontali in reel: layer sotto con la stessa clip `scale(2.2)` + `filter: blur(40px)`, layer sopra con la clip `objectFit: contain`.
- Ombre e glow: `boxShadow`, `filter: drop-shadow(0 0 30px color)`.
- Immagini: `<Img>` (mai `<img>`), gif con `<Gif>` da `@remotion/gif`.

## In FFmpeg (veloce, senza React)
- Overlay: `ffmpeg -i base.mp4 -i logo.png -filter_complex "[1]scale=200:-1[l];[0][l]overlay=W-w-40:40" out.mp4`
- Chroma key: `-filter_complex "[1]colorkey=0x00FF00:0.3:0.2[fg];[0][fg]overlay"`
- Split screen: `-filter_complex "[0]scale=1080:960[a];[1]scale=1080:960[b];[a][b]vstack"`
- Sfondo sfocato verticale: `-vf "split[a][b];[a]scale=1080:1920,boxblur=30[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"`

## Regole
- Componi sempre a risoluzione finale (1080x1920 per reel), sorgenti ≥ 1080p.
- Conserva alpha solo dove serve (PNG/WebM); altrimenti JPEG per frame intermedi (più veloce).
- Controlla i bordi delle maschere a 1x e 2x zoom prima del render.
