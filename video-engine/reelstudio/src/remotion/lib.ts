// Funzioni condivise tra anteprima (dashboard) e render finale
import { continueRender, delayRender } from 'remotion';

export type Word = { text: string; start: number; end: number };
export type Cut = { s: number; e: number; speed?: number; vol?: number; mute?: boolean };
export type Effect = {
  id: string;
  type: string;
  start: number; // secondi nella timeline finale
  tf?: any;
  duration: number;
  props?: Record<string, any>;
  anim?: string;
  sfx?: string | null;
  position?: string;
};

export type ReelProps = {
  assetBase: string;
  videoUrl: string;
  fps: number;
  width: number;
  height: number;
  srcWidth: number;
  srcHeight: number;
  cuts: Cut[];
  words: Word[];
  brand: any;
  style: any;
  hook: any;
  cta: any;
  effects: Effect[];
  audio: any;
  mode?: 'full' | 'clean' | 'overlay';
  cutoutBase?: string;
  cutoutFrames?: number[];
};

export const PALETTES: Record<string, { name: string; primary: string; accent: string; bg: string; text: string; highlight: string; dark: string }> = {
  brand: { name: 'Brand Correre N.', primary: '#49762E', accent: '#B8D7EA', bg: '#F4F1E5', text: '#FFFFFF', highlight: '#49762E', dark: '#0B0F0A' },
  brandLight: { name: 'Brand chiaro', primary: '#49762E', accent: '#B8D7EA', bg: '#FFFFFF', text: '#FFFFFF', highlight: '#B8D7EA', dark: '#000000' },
  cielo: { name: 'Cielo', primary: '#2E5E7E', accent: '#B8D7EA', bg: '#F4F1E5', text: '#FFFFFF', highlight: '#B8D7EA', dark: '#0A1620' },
  energia: { name: 'Energia', primary: '#E2572B', accent: '#FFD35C', bg: '#FFF6EE', text: '#FFFFFF', highlight: '#E2572B', dark: '#111111' },
  naturaSoft: { name: 'Natura soft', primary: '#5D7266', accent: '#E8DED0', bg: '#F4F1E5', text: '#FFFFFF', highlight: '#8FB8A0', dark: '#1F2A24' },
  contrasto: { name: 'Contrasto', primary: '#111111', accent: '#FFD35C', bg: '#FFFFFF', text: '#FFFFFF', highlight: '#FFD35C', dark: '#000000' },
  bosco: { name: 'Bosco notte', primary: '#1F3A24', accent: '#C9E265', bg: '#EEF2E6', text: '#FFFFFF', highlight: '#C9E265', dark: '#0B140D' },
  terra: { name: 'Terra', primary: '#8A5A3B', accent: '#F2C38B', bg: '#F6EFE6', text: '#FFFFFF', highlight: '#F2C38B', dark: '#20140C' },
  prugna: { name: 'Prugna & rosa', primary: '#3A1430', accent: '#E0337A', bg: '#FBEFF4', text: '#FFFFFF', highlight: '#E0337A', dark: '#1A0816' },
};

export const pal = (style: any) => {
  const base = PALETTES[style?.palette || 'brand'] || PALETTES.brand;
  return { ...base, ...(style?.customColors || {}) };
};

export const FONT_FILES: Record<string, { family: string; file: string; weight: string; style?: string }[]> = {
  Blinker: [
    { family: 'Blinker', file: 'blinker-latin-400-normal.woff2', weight: '400' },
    { family: 'Blinker', file: 'blinker-latin-600-normal.woff2', weight: '600' },
    { family: 'Blinker', file: 'blinker-latin-700-normal.woff2', weight: '700' },
    { family: 'Blinker', file: 'blinker-latin-800-normal.woff2', weight: '800' },
  ],
  Serif: [
    { family: 'DMSerif', file: 'dm-serif-display-latin-400-normal.woff2', weight: '400' },
    { family: 'DMSerif', file: 'dm-serif-display-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  Anton: [{ family: 'Anton', file: 'anton-latin-400-normal.woff2', weight: '400' }],
  Caveat: [{ family: 'Caveat', file: 'caveat-latin-700-normal.woff2', weight: '700' }],
  Mono: [{ family: 'JBMono', file: 'jetbrains-mono-latin-700-normal.woff2', weight: '700' }],
  Montserrat: [
    { family: 'Montserrat', file: 'montserrat-latin-700-normal.woff2', weight: '700' },
    { family: 'Montserrat', file: 'montserrat-latin-900-normal.woff2', weight: '900' },
  ],
  Poppins: [{ family: 'Poppins', file: 'poppins-latin-800-normal.woff2', weight: '800' }],
  Bebas: [{ family: 'Bebas', file: 'bebas-neue-latin-400-normal.woff2', weight: '400' }],
  Oswald: [{ family: 'Oswald', file: 'oswald-latin-700-normal.woff2', weight: '700' }],
  ArchivoBlack: [{ family: 'ArchivoBlack', file: 'archivo-black-latin-400-normal.woff2', weight: '400' }],
  Playfair: [
    { family: 'Playfair', file: 'playfair-display-latin-800-normal.woff2', weight: '800' },
    { family: 'Playfair', file: 'playfair-display-latin-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  Instrument: [
    { family: 'Instrument', file: 'instrument-serif-latin-400-normal.woff2', weight: '400' },
    { family: 'Instrument', file: 'instrument-serif-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  SpaceGrotesk: [{ family: 'SpaceGrotesk', file: 'space-grotesk-latin-700-normal.woff2', weight: '700' }],
  Syne: [{ family: 'Syne', file: 'syne-latin-800-normal.woff2', weight: '800' }],
  Marker: [{ family: 'Marker', file: 'permanent-marker-latin-400-normal.woff2', weight: '400' }],
  Pacifico: [{ family: 'Pacifico', file: 'pacifico-latin-400-normal.woff2', weight: '400' }],
  Abril: [{ family: 'Abril', file: 'abril-fatface-latin-400-normal.woff2', weight: '400' }],
  Bangers: [{ family: 'Bangers', file: 'bangers-latin-400-normal.woff2', weight: '400' }],
  Righteous: [{ family: 'Righteous', file: 'righteous-latin-400-normal.woff2', weight: '400' }],
  Fraunces: [
    { family: 'Fraunces', file: 'fraunces-latin-900-normal.woff2', weight: '900' },
    { family: 'Fraunces', file: 'fraunces-latin-900-italic.woff2', weight: '900', style: 'italic' },
  ],
  DMSans: [{ family: 'DMSans', file: 'dm-sans-latin-800-normal.woff2', weight: '800' }],
  Lobster: [{ family: 'Lobster', file: 'lobster-latin-400-normal.woff2', weight: '400' }],
  LeagueGothic: [{ family: 'LeagueGothic', file: 'league-gothic-latin-400-normal.woff2', weight: '400' }],
  Inter: [
    { family: 'Inter', file: 'inter-latin-400-normal.woff2', weight: '400' },
    { family: 'Inter', file: 'inter-latin-600-normal.woff2', weight: '600' },
    { family: 'Inter', file: 'inter-latin-800-normal.woff2', weight: '800' },
  ],
};

// Stili di scrittura dei titoli
export const TITLE_FONTS: Record<string, { name: string; css: string; weight: number; italicEmph: boolean; upper: boolean }> = {
  brand: { name: 'Blinker (brand)', css: 'Blinker, Inter, sans-serif', weight: 800, italicEmph: false, upper: false },
  editoriale: { name: 'Editoriale serif', css: 'DMSerif, Georgia, serif', weight: 400, italicEmph: true, upper: false },
  impatto: { name: 'Impatto', css: 'Anton, Impact, sans-serif', weight: 400, italicEmph: false, upper: true },
  tecnico: { name: 'Tecnico', css: 'JBMono, monospace', weight: 700, italicEmph: false, upper: false },
  amano: { name: 'Scritto a mano', css: 'Caveat, cursive', weight: 700, italicEmph: false, upper: false },
  moderno: { name: 'Moderno', css: 'Inter, sans-serif', weight: 800, italicEmph: false, upper: false },
  montserrat: { name: 'Montserrat Black', css: 'Montserrat, sans-serif', weight: 900, italicEmph: false, upper: true },
  poppins: { name: 'Poppins', css: 'Poppins, sans-serif', weight: 800, italicEmph: false, upper: false },
  bebas: { name: 'Bebas Neue', css: 'Bebas, Impact, sans-serif', weight: 400, italicEmph: false, upper: true },
  oswald: { name: 'Oswald', css: 'Oswald, sans-serif', weight: 700, italicEmph: false, upper: true },
  archivo: { name: 'Archivo Black', css: 'ArchivoBlack, sans-serif', weight: 400, italicEmph: false, upper: false },
  league: { name: 'League Gothic', css: 'LeagueGothic, sans-serif', weight: 400, italicEmph: false, upper: true },
  playfair: { name: 'Playfair (lusso)', css: 'Playfair, Georgia, serif', weight: 800, italicEmph: true, upper: false },
  instrument: { name: 'Instrument Serif', css: 'Instrument, Georgia, serif', weight: 400, italicEmph: true, upper: false },
  fraunces: { name: 'Fraunces (rivista)', css: 'Fraunces, Georgia, serif', weight: 900, italicEmph: true, upper: false },
  abril: { name: 'Abril (titolo moda)', css: 'Abril, Georgia, serif', weight: 400, italicEmph: false, upper: false },
  spacegrotesk: { name: 'Space Grotesk (tech)', css: 'SpaceGrotesk, sans-serif', weight: 700, italicEmph: false, upper: false },
  syne: { name: 'Syne (creativo)', css: 'Syne, sans-serif', weight: 800, italicEmph: false, upper: false },
  dmsans: { name: 'DM Sans', css: 'DMSans, sans-serif', weight: 800, italicEmph: false, upper: false },
  righteous: { name: 'Righteous (retrò)', css: 'Righteous, sans-serif', weight: 400, italicEmph: false, upper: false },
  bangers: { name: 'Bangers (fumetto)', css: 'Bangers, sans-serif', weight: 400, italicEmph: false, upper: true },
  marker: { name: 'Pennarello', css: 'Marker, cursive', weight: 400, italicEmph: false, upper: false },
  pacifico: { name: 'Pacifico (corsivo)', css: 'Pacifico, cursive', weight: 400, italicEmph: false, upper: false },
  lobster: { name: 'Lobster', css: 'Lobster, cursive', weight: 400, italicEmph: false, upper: false },
};

let fontsLoaded = false;
export const useFonts = (assetBase: string) => {
  if (typeof document === 'undefined' || fontsLoaded) return;
  fontsLoaded = true;
  const handle = delayRender('fonts');
  const all = Object.values(FONT_FILES).flat();
  Promise.all(
    all.map((f) => {
      const ff = new FontFace(f.family, `url(${assetBase}/assets/fonts/${f.file})`, { weight: f.weight, style: f.style || 'normal' });
      return ff.load().then((l) => (document as any).fonts.add(l)).catch(() => null);
    })
  ).then(() => continueRender(handle));
};

// velocità per pezzo: c.speed (1 = normale). Durata in uscita = (e - s) / speed
export const cutLen = (c: Cut) => Math.max(0, c.e - c.s) / ((c as any).speed || 1);
export const totalDuration = (cuts: Cut[]) => cuts.reduce((a, c) => a + cutLen(c), 0);

export const cutStarts = (cuts: Cut[]) => {
  const out: number[] = [];
  let acc = 0;
  for (const c of cuts) {
    out.push(acc);
    acc += cutLen(c);
  }
  return out;
};

// sorgente -> timeline finale (null se tagliato)
export const srcToOut = (t: number, cuts: Cut[], starts = cutStarts(cuts)) => {
  for (let i = 0; i < cuts.length; i++) {
    const c = cuts[i];
    if (t >= c.s - 0.0001 && t <= c.e + 0.0001) return starts[i] + (t - c.s) / ((c as any).speed || 1);
  }
  return null;
};

export const outToSrc = (t: number, cuts: Cut[]) => {
  let acc = 0;
  for (const c of cuts) {
    const d = cutLen(c);
    if (t <= acc + d) return c.s + (t - acc) * ((c as any).speed || 1);
    acc += d;
  }
  const last = cuts[cuts.length - 1];
  return last ? last.e : 0;
};

export type OutWord = Word & { i: number; emph?: boolean };

const EMPH = /^(\d|errore|errori|sbagli|segreto|mai|sempre|subito|devi|stop|attenzione|fatica|dolore|infortun|veloce|naturale|tallone|appoggio|cadenza|passo|postura|gratis|guida)/i;

export const outWords = (words: Word[], cuts: Cut[], manualEmph: string[] = []): OutWord[] => {
  const starts = cutStarts(cuts);
  const res: OutWord[] = [];
  const me = manualEmph.map((m) => m.toLowerCase());
  words.forEach((w, i) => {
    const mid = (w.start + w.end) / 2;
    const o = srcToOut(mid, cuts, starts);
    if (o === null) return;
    const d = w.end - w.start;
    const clean = w.text.replace(/[.,!?;:«»"“”]/g, '').toLowerCase();
    res.push({ ...w, i, start: Math.max(0, o - d / 2), end: o + d / 2, emph: EMPH.test(clean) || me.includes(clean) });
  });
  return res;
};

// raggruppa le parole in "righe" di sottotitolo
export const groupWords = (ws: OutWord[], maxWords: number, maxChars = 18) => {
  const groups: OutWord[][] = [];
  let cur: OutWord[] = [];
  const flush = () => {
    if (cur.length) groups.push(cur);
    cur = [];
  };
  ws.forEach((w, k) => {
    const prev = ws[k - 1];
    if (prev && w.start - prev.end > 0.6) flush();
    const len = cur.map((c) => c.text).join(' ').length + w.text.length;
    if (cur.length >= maxWords || (cur.length && len > maxChars)) flush();
    cur.push(w);
    if (/[.!?]$/.test(w.text)) flush();
  });
  flush();
  return groups;
};

// testo con *enfasi*
export const parseEmph = (s: string) => {
  const parts: { t: string; e: boolean }[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(s || ''))) {
    if (m.index > last) parts.push({ t: s.slice(last, m.index), e: false });
    parts.push({ t: m[1], e: true });
    last = m.index + m[0].length;
  }
  if (last < (s || '').length) parts.push({ t: s.slice(last), e: false });
  return parts;
};

export const sfxUrl = (assetBase: string, name: string) => `${assetBase}/assets/sfx/${name}.mp3`;
export const musicUrl = (assetBase: string, name: string) =>
  name.startsWith('user:') ? `${assetBase}/assets/music-utente/${encodeURIComponent(name.slice(5))}` : `${assetBase}/assets/music/${name}.mp3`;
export const logoUrl = (assetBase: string, brand: any, key: string) => `${assetBase}/clients/${brand?.id}/${brand?.logos?.[key] || ''}`;
