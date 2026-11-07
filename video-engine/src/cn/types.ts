import type { Caption } from "@remotion/captions";

export type Seg = { from: number; to: number };

/** Ogni elemento vive nella zona grafiche (y 0,47-0,74), uno alla volta. `word` aggancia l'inizio alla parola detta più vicina ad `at`. */
export type ElementBase = { at: number; dur: number; word?: string };

export type Element = ElementBase &
  (
    | { kind: "kinetic"; words: string[]; accentIndex?: number }
    | { kind: "widget"; title: string; lines: string[] }
    | { kind: "stat"; value: string; label: string }
    | { kind: "pill"; text: string }
    | { kind: "stage"; title: string; keyword: string; steps: string[] }
    | { kind: "checklist"; items: string[]; strike?: boolean }
    | { kind: "text3d"; word3d: string; sub?: string }
    | { kind: "wave"; title: string; mode: "chaos" | "calm" | "chaos-to-calm" | "calm-to-chaos" }
    | { kind: "sphere3d"; phases: { label: string; sec: number; scale: number }[] }
    | { kind: "gauge3d"; title: string; from: number; to: number; labels: string[] }
    | { kind: "ecg"; title: string; bpmFrom: number; bpmTo: number }
    | { kind: "steps"; inhale: number; exhale: number }
    | { kind: "bars"; title: string; labels: string[]; values: number[] }
  );

export type Hook = { lines: string[]; keyword: string; dur: number };

export type CTA = { word: string; title: string; sub?: string };

export type CNReelProps = {
  /** master 1080x1920 già montato (scripts/cn_master.py) */
  master: string;
  /** sorgente originale (per export/metadata) */
  src: string;
  segments: Seg[];
  words: Caption[];
  hook: Hook;
  elements: Element[];
  cta: CTA;
  wordFix: Record<string, string>;
  blendFrames: number;
  ctaSeconds: number;
  /** compensazione del ritardo di Whisper, in secondi (negativo = anticipa) */
  wordOffset: number;
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
/** zone (frazioni dell'altezza): volto libero sopra 0,45; grafiche; sottotitoli */
export const ZONE = { faceBottom: 0.45, gfxTop: 0.47, gfxBottom: 0.74, capTop: 0.76, capBottom: 0.86 };
export const GFX_TOP = Math.round(H * ZONE.gfxTop);
export const GFX_H = Math.round(H * (ZONE.gfxBottom - ZONE.gfxTop));
