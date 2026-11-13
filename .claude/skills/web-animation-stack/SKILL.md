---
name: web-animation-stack
description: Riferimento rapido per GSAP, CSS Animations, SVG, WebGL/Three.js, Lottie, Web Audio API usati come motore grafico in Remotion/React. Usa quando serve scegliere o usare una di queste tecnologie in un video.
---

# Web Animation Stack dentro Remotion

Regola d'oro: in Remotion ogni frame è renderizzato separatamente → ogni animazione deve essere **deterministica rispetto al frame**. Le API basate sul tempo reale vanno "guidate" dal frame.

| Tecnologia | Come usarla in render | Quando |
|---|---|---|
| **CSS Animations** | Non usare `@keyframes`/`transition` (non deterministiche). Converti in `interpolate(frame, ...)` su `transform`/`opacity`. Nel Player/sito vanno bene. | Prototipi nel browser |
| **GSAP** | `const tl = gsap.timeline({paused:true}); ... ; useEffect(() => { tl.seek(frame / fps) }, [frame])` oppure usa solo gli easing `gsap.parseEase("power3.out")(t)`. | Timeline complesse, easing avanzati, MorphSVG |
| **SVG** | Inline `<svg>`; anima attributi con `interpolate`; tracciati con `@remotion/paths` (`evolvePath`, `getPointAtLength`, `interpolatePath`). | Loghi, icone, linee, maschere |
| **WebGL / Three.js** | `@remotion/three` `<ThreeCanvas>` + `@react-three/fiber`; aggiorna stato dal frame, non da `useFrame` delta. Shader GLSL con `uniforms.uTime.value = frame / fps`. Chromium in cloud usa `swangle` (software GL): ok ma lento, tieni le scene leggere. | 3D, shader, particelle |
| **Lottie** | `@remotion/lottie` `<Lottie animationData>`; export da After Effects (Bodymovin) o LottieFiles. | Icone/illustrazioni animate pronte |
| **Web Audio API** | Solo per preview live (`AnalyserNode`). In render usa `@remotion/media-utils` (`getAudioData`, `visualizeAudio`). | Visualizer, reattività alla musica |
| **React** | Componenti puri; props → `defaultProps` e `--props` da CLI; `calculateMetadata` per durata dinamica. | Tutto |

## Performance
- `OffthreadVideo` invece di `Video` per i render.
- `Config.setConcurrency(4)` (4 core in cloud); JPEG come formato frame intermedio.
- Evita `blur` pesanti su layer full-screen a ogni frame: pre-renderizza come immagine.
