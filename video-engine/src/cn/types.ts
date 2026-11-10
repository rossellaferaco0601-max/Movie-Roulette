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
    | { kind: "stairs"; title: string; steps?: number }
    | { kind: "split"; lines: string[]; accent: string }
    | { kind: "graph"; title: string; label: string; from: number; to: number; unit?: string }
    | { kind: "toggles"; title: string; items: string[]; onAt?: number[] }
    | { kind: "title"; lines: string[]; accent?: string }
    | { kind: "mouth"; lines: string[] }
    | { kind: "runner"; fast: string; slow: string; bpmFrom: number; bpmTo: number }
    | { kind: "lungs"; title: string; sub?: string }
    | { kind: "horizon"; title: string; kmTo: number }
    | { kind: "chat"; sender: string; messages: string[] }
    | { kind: "bigstrike"; text: string }
    | { kind: "stack"; title: string; items: string[]; onAt: number[] }
    | { kind: "guide"; mode: "ritmica" | "nasale" | "hold"; title?: string; titleSec?: number; inhale?: number; exhale?: number; hold?: number; breaths?: number }
    | { kind: "metronome"; title: string; inhale: number; exhale: number; bpm?: number }
    | { kind: "question"; text: string; label?: string }
    | { kind: "nametag"; name: string; sub?: string }
    | { kind: "road3d"; title: string; fromLabel: string; toLabel: string; fromSpeed: number; toSpeed: number; unit?: string }
  );

export type Hook = { lines: string[]; keyword: string; dur: number };

/** Effetto della skill `effects` (fx.py) applicato al master prima di Remotion. `wide`: durante l'effetto il master
 *  arretra (campo largo con sfondo sfocato) per lasciare spazio sopra la testa. Le altre chiavi passano a fx.py. */
export type Fx = { fx: string; at: number; dur: number; word?: string; wide?: boolean; [k: string]: unknown };

export type CTA = { word: string; title: string; sub?: string };

export type CNReelProps = {
  /** master 1080x1920 già montato (scripts/cn_master.py) */
  master: string;
  /** sorgente originale (per export/metadata) */
  src: string;
  segments: Seg[];
  words: Caption[];
  /** hook in scatola sotto il mento; null se l'hook è affidato a un effetto */
  hook: Hook | null;
  elements: Element[];
  fx?: Fx[];
  cta: CTA;
  wordFix: Record<string, string>;
  blendFrames: number;
  ctaSeconds: number;
  /** compensazione del ritardo di Whisper, in secondi (negativo = anticipa) */
  wordOffset: number;
  /** push-in lento della camera durante l'hook (es. 1.12), poi rientro morbido */
  hookZoom?: number;
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
/** coda del master: 0,5 s di fermo immagine muto, su cui entra la CTA */
export const TAIL_FRAMES = 15;
export const W = 1080;
export const H = 1920;
/** zone (frazioni dell'altezza): volto libero sopra 0,45; grafiche; sottotitoli */
/** Zone (frazioni dell'altezza), dentro l'area sicura dei Reel: sopra 0,80 niente di importante (comandi Instagram), a destra x < 0,90. */
export const ZONE = { faceBottom: 0.42, gfxTop: 0.44, gfxBottom: 0.67, capTop: 0.69, capBottom: 0.78 };
/** pannelli delle grafiche: margini simmetrici, lontani dalla colonna dei comandi a destra */
export const PANEL_X = 100;
export const PANEL_W = 880;
export const GFX_TOP = Math.round(H * ZONE.gfxTop);
export const GFX_H = Math.round(H * (ZONE.gfxBottom - ZONE.gfxTop));
