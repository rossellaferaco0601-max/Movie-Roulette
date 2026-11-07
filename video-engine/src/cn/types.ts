import type { Caption } from "@remotion/captions";

export type Seg = { from: number; to: number };

export type Element =
  | { kind: "kinetic"; at: number; dur: number; words: string[]; accentIndex?: number }
  | { kind: "widget"; at: number; dur: number; title: string; lines: string[] }
  | { kind: "stat"; at: number; dur: number; value: string; label: string }
  | { kind: "pill"; at: number; dur: number; text: string }
  | { kind: "stage"; at: number; dur: number; title: string; keyword: string; steps: string[] }
  | { kind: "checklist"; at: number; dur: number; items: string[]; strike?: boolean };

export type Hook = { lines: string[]; keyword: string; dur: number };

export type CTA = { word: string; title: string; sub?: string };

export type CNReelProps = {
  src: string;
  /** pezzi del sorgente in secondi */
  segments: Seg[];
  words: Caption[];
  hook: Hook;
  elements: Element[];
  cta: CTA;
  /** parole da evidenziare nei sottotitoli (minuscolo, senza punteggiatura) */
  emph: string[];
  /** correzioni ortografiche alla trascrizione */
  wordFix: Record<string, string>;
  /** frame della transizione (dissolvenza) */
  blendFrames: number;
  ctaSeconds: number;
};

export const BRAND = {
  green: "#49762E",
  az: "#B8D7EA",
  cream: "#F4F1E5",
  ink: "#0B0F0A",
  lime: "#95FF00",
  white: "#FFFFFF",
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** sorgente 3840x2160 mostrata a 1920 di altezza */
export const SRC_W = 3840;
export const SRC_H = 2160;
export const VID_SCALE = H / SRC_H;
