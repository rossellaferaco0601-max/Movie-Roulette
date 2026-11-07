import { interpolate, spring } from "remotion";

/** Pop-in con molla, tipico delle kinetic typography. */
export const popIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } });

/** Fade lineare con clamp. */
export const fade = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Fade-out negli ultimi `tail` frame della durata. */
export const fadeOut = (frame: number, duration: number, tail = 15) =>
  interpolate(frame, [duration - tail, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
