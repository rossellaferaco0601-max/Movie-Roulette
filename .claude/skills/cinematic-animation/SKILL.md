---
name: cinematic-animation
description: Movimenti di camera cinematografici, 3D (Three.js / @remotion/three / Blender), parallasse, profondità, color grading, look filmico. Usa per intro cinematiche, scene 3D, camera move, parallax, light leaks, letterbox.
---

# Cinematic Animation

## Camera 2D (parallax, push-in, dolly)
- Push-in lento: `scale` 1→1.08 su tutta la scena, easing lineare o `Easing.inOut(Easing.sin)`.
- Parallax: layer con velocità diverse (`translateX(frame * speed)`), sfondo 0.3x, mid 0.6x, foreground 1x; aggiungi `filter: blur(2px)` ai layer lontani per profondità di campo.
- Handheld: `noise2D` su x/y/rotation con ampiezza 3px / 0.3°, frequenza bassa (`frame / 40`).
- Letterbox 2.39:1 su reel verticale: barre nere sopra/sotto (height ≈ (1920 - 1080/2.39)/2) solo se stilisticamente voluto.

## 3D con Three.js in Remotion
- `<ThreeCanvas width height>` da `@remotion/three`; dentro usa `@react-three/fiber` e `@react-three/drei`.
- Muovi camera/oggetti in base a `useCurrentFrame()` (non `useFrame` con delta).
- Luci: key + fill + rim; `environment` da drei per riflessi.
- Testo 3D: `<Text3D>` di drei o estrudi SVG con `SVGLoader` + `ExtrudeGeometry`.

## Blender headless (render di elementi 3D da comporre)
- Esempio: `blender -b -P video-engine/scripts/blender_render.py -- "TESTO" out/title.png` (Cycles CPU, denoiser disattivato, sfondo trasparente).
- Per sequenze: imposta `sc.frame_start/frame_end`, `sc.render.filepath = "out/seq/frame_"` e `bpy.ops.render.render(animation=True)`, poi `<Img src={staticFile(`seq/frame_${String(frame).padStart(4,"0")}.png`)} />` in Remotion oppure `ffmpeg -framerate 30 -i out/seq/frame_%04d.png`.

## Look filmico
- Color grading: CSS `filter: contrast(1.1) saturate(1.15) sepia(0.1)` oppure LUT via canvas/WebGL; teal-orange = ombre verso ciano, alte luci verso arancio.
- Grana: overlay di noise con `mix-blend-mode: overlay`, opacità 0.08–0.15.
- Vignetta: `radial-gradient(transparent 55%, rgba(0,0,0,0.6))`.
- Light leaks: gradienti caldi con `mix-blend-mode: screen` animati in opacità (vedi skill remotion-markup/light-leaks.md).
- Frame rate: 24 fps per look cinema, 30 per social; motion blur con `@remotion/motion-blur` sui movimenti veloci.
