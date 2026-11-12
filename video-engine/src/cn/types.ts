import type { Caption } from "@remotion/captions";

export type Seg = { from: number; to: number };

/** Ogni elemento vive nella zona grafiche (y 0,47-0,74), uno alla volta. `word` aggancia l'inizio alla parola detta più vicina ad `at`. */
/** `cues`: parole dette (in ordine) a cui agganciare le parti interne della grafica (righe di un elenco, cambio di stato): diventano `onAt`
 *  (secondi dall'inizio dell'elemento), calcolati sui tempi reali delle parole. */
export type ElementBase = { at: number; dur: number; word?: string; cues?: string[]; onAt?: number[] };

export type Element = ElementBase &
  (
    | { kind: "kinetic"; words: string[]; accentIndex?: number }
    | { kind: "widget"; title: string; lines: string[] }
    | { kind: "stat"; value: string; label: string }
    | { kind: "pill"; text: string }
    | { kind: "stage"; title: string; keyword: string; steps: string[] }
    | { kind: "checklist"; items: string[]; strike?: boolean; cross?: boolean; big?: boolean }
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
    | { kind: "toggles"; title: string; items: string[] }
    | { kind: "title"; lines: string[]; accent?: string }
    | { kind: "mouth"; lines: string[] }
    | { kind: "runner"; fast: string; slow: string; bpmFrom: number; bpmTo: number }
    | { kind: "lungs"; title: string; sub?: string }
    | { kind: "horizon"; title: string; kmTo: number }
    | { kind: "chat"; sender: string; messages: string[] }
    | { kind: "bigstrike"; text: string; big?: boolean }
    | { kind: "stack"; title: string; items: string[] }
    | { kind: "guide"; mode: "ritmica" | "nasale" | "hold"; title?: string; titleSec?: number; inhale?: number; exhale?: number; hold?: number; breaths?: number }
    | { kind: "metronome"; title: string; inhale: number; exhale: number; bpm?: number }
    | { kind: "pair"; title: string; sub: string; items: [{ def: string; name: string }, { def: string; name: string }]; fadeIn?: number; fadeOut?: number }
    | { kind: "lifebar"; place: string; title: string; total: number; healthy: number; decline: string; declineSub: string; focus: string; focusNot: string; focusIs: string; fadeIn?: number; fadeOut?: number }
    | { kind: "slides"; header?: string; source?: string; fadeIn?: number; fadeOut?: number; steps: { g: number; kind: "stat" | "text" | "chip"; value?: string; label?: string; lines?: string[]; accent?: number; color?: "lime" | "coral" }[] }
    | { kind: "flow"; title: string; sub: string; inputs: [string, string]; output: string; outSub?: string }
    | { kind: "renew"; term: string; sub: string; oldLabel: string; newLabel: string; fadeIn?: number; fadeOut?: number }
    | { kind: "versus"; header: string; title: string; a: { label: string; value: string }; b: { label: string; value: string }; final: string[]; finalAccent?: number; source?: string; fadeIn?: number; fadeOut?: number }
    | { kind: "grid4"; items: string[]; foot: string }
    | { kind: "plan"; n: number; kicker: string; pre?: string; title: string[]; points: string[]; foot?: string; art: "walk" | "run" | "timer"; fadeIn?: number; fadeOut?: number }
    | { kind: "lights"; title: string; items: string[] }
    | { kind: "pointer"; text: string; accent?: string; arrow?: boolean; y?: number }
    | { kind: "cycle"; items: string[] }
    | { kind: "topword"; lines: string[]; accent?: string; anim?: "pop" | "drop"; zone?: "top" | "strip"; y?: number; max?: number }
    | { kind: "counter"; to: number; from?: number; prefix?: string; suffix?: string; decimals?: number; label: string }
    | { kind: "wall"; rows: string[]; title?: string }
    | { kind: "side"; title?: string; items?: string[]; map?: "it-na" | "na-it"; pairs?: boolean }
    | { kind: "beat"; bpm: number; label: string; tone?: "lime" | "coral" }
    | { kind: "fulltext"; lines: string[]; accentIndex?: number; fadeIn?: number; fadeOut?: number }
    | { kind: "clip"; src: string; from?: number; tag: string; text: string; posY?: number }
    | { kind: "step"; n: string; label: string; sub: string; strike: string }
    | { kind: "airflow"; lines: [string, string] }
    | { kind: "filter" }
    | { kind: "beats"; words: [string, string] }
    | { kind: "ring"; words: [string, string] }
    | { kind: "duo"; title: string; words: [string, string] }
    | { kind: "slam"; lead: string[]; text: string }
    | { kind: "orbit"; titles: string[]; headX: number; headTop: number; back?: number }
    | { kind: "compare"; sides: [{ q: string; a: string }, { q: string; a: string }] }
    | { kind: "drill"; n: number; title: string; fadeIn?: number; fadeOut?: number; steps: { label: string; sub: string; shape: "hold" | "grow" | "shrink" | "ring" | "feet" | "pulse" | "count"; color?: "lime" | "az" | "cream"; n?: number; big?: string }[] }
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
  /** volto grande (interviste strette): grafiche più in basso (px) e più piccole, sottotitoli più in basso (px), per non coprire mai il volto */
  /** coda prima della CTA (s, default 0,5): fermo sull'ultimo fotogramma con leggerissimo avvicinamento; più lunga = la CTA entra più tardi e più morbida */
  tailSeconds?: number;
  /** secondi di coda in cui il sorgente continua dal vivo (default: tutta la coda). Se subito dopo il taglio il sorgente cambia inquadratura, va messo a 0: la coda tiene l'ultimo fotogramma mentre il pannello della CTA sale */
  tailLive?: number;
  /** secondi iniziali senza sottotitoli (Oscar 12/11: «la parte iniziale dove c'è l'hook visivo togliamo i sottotitoli»): ripartono dalla prima pagina intera dopo questo tempo */
  capFrom?: number;
  /** selfie: in basso un solo testo alla volta. Mentre è a schermo una grafica della fascia bassa i sottotitoli si spengono (Ross 12/11: «titoli sovrapposti») */
  capHideOnGfx?: boolean;
  gfxShift?: number;
  gfxScale?: number;
  capShift?: number;
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
