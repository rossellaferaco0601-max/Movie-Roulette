import type { Caption } from "@remotion/captions";
import type { Seg, Element } from "./types";
import { FPS, TAIL_FRAMES } from "./types";

export const secToFrames = (s: number) => Math.round(s * FPS);

/** Posizione di ogni pezzo nel master (in frame): identica a scripts/cn_master.py (xfade di `blend` frame). */
export const layout = (segments: Seg[], blend: number) => {
  const out: { start: number; len: number; seg: Seg }[] = [];
  let cursor = 0;
  segments.forEach((seg, i) => {
    const len = secToFrames(seg.to - seg.from);
    const start = i === 0 ? 0 : cursor - blend;
    out.push({ start, len, seg });
    cursor = start + len;
  });
  return { items: out, total: cursor + TAIL_FRAMES };
};

export type RWord = { text: string; start: number; end: number };

/** Parole del sorgente rimappate sui frame del master, con correzioni e compensazione del ritardo. */
export const remapWords = (words: Caption[], items: ReturnType<typeof layout>["items"], wordFix: Record<string, string>, offsetSec: number): RWord[] => {
  const res: RWord[] = [];
  const off = secToFrames(offsetSec);
  for (const w of words) {
    const s = w.startMs / 1000, e = w.endMs / 1000, mid = (s + e) / 2;
    const it = items.find((x) => mid >= x.seg.from && mid <= x.seg.to);
    if (!it) continue;
    const start = Math.max(0, it.start + secToFrames(Math.max(s, it.seg.from) - it.seg.from) + off);
    const end = it.start + secToFrames(Math.min(e, it.seg.to) - it.seg.from) + off;
    let text = w.text.trim();
    const key = text.toLowerCase().replace(/[.,?!;:]/g, "");
    if (wordFix[key]) text = wordFix[key] + text.slice(key.length);
    res.push({ text, start, end: Math.max(end, start + 2) });
  }
  return res;
};

const clean = (t: string) => t.toLowerCase().replace(/[.,?!;:«»"']/g, "");

/** Frame di inizio di un elemento: se ha `word`, si aggancia alla parola detta più vicina ad `at` (±2 s). */
export const resolveStart = (el: Element, words: RWord[]) => {
  const approx = secToFrames(el.at);
  if (!el.word) return approx;
  const target = clean(el.word);
  let best: RWord | null = null;
  for (const w of words) {
    if (clean(w.text) !== target) continue;
    if (Math.abs(w.start - approx) <= 60 && (!best || Math.abs(w.start - approx) < Math.abs(best.start - approx))) best = w;
  }
  return best ? best.start : approx;
};
