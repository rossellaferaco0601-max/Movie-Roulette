---
name: motion-graphics
description: Motion graphics in Remotion/React (forme, icone, lower-third, infografiche, loghi animati, Lottie, SVG). Usa per grafiche animate, lower-third, bumper, logo reveal, grafici animati.
---

# Motion Graphics

Stack: Remotion + `@remotion/shapes`, `@remotion/paths`, `@remotion/lottie`, `@remotion/noise`, SVG, CSS.

## Principi (12 principi Disney applicati)
- Easing: mai lineare per movimenti di oggetti; `Easing.out(Easing.cubic)` per entrate, `Easing.in` per uscite, `spring` per elementi "vivi".
- Anticipazione: piccolo movimento contrario (3–5 frame) prima del movimento principale.
- Overshoot: `spring` con `damping` basso (8–10) per rimbalzo; `overshootClamping: true` se non voluto.
- Sfalsamento (stagger) di 2–6 frame tra elementi di un gruppo.
- Tutto deve essere una funzione pura del frame.

## Strumenti
- Forme: `<Circle>`, `<Rect>`, `<Triangle>`, `<Star>` da `@remotion/shapes`.
- Tracciati SVG animati: `evolvePath(progress, d)` da `@remotion/paths` per "disegnare" linee/loghi (`strokeDasharray`/`strokeDashoffset`).
- Lottie: `<Lottie animationData={json} playbackRate={1} />` da `@remotion/lottie`; i file `.json` Lottie in `public/` si caricano con `staticFile` + `fetch` in `delayRender`.
- Noise organico: `noise2D(seed, x, y)` da `@remotion/noise` per movimenti "a mano".
- Motion blur: `<Trail>` / `<CameraMotionBlur>` da `@remotion/motion-blur` per movimenti rapidi.
- Transizioni tra scene: `TransitionSeries` da `@remotion/transitions` (`fade`, `slide`, `wipe`, `flip`, `clockWipe`).

## Lower-third (pattern)
Barra che entra da sinistra con `scaleX` (transformOrigin left), nome che appare 6 frame dopo con mask reveal, uscita simmetrica. Posizione: in basso a sinistra, sopra la zona sicura.

## Grafici animati
Interpola i valori: `value * interpolate(frame, [start, start+30], [0, 1], {easing: Easing.out(Easing.cubic), extrapolateRight: "clamp"})`. Barre crescono con stagger; linee con `evolvePath`.
