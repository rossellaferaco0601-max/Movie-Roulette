import type { Caption } from "@remotion/captions";
import type { Seg } from "./types";
import { FPS } from "./types";

export const secToFrames = (s: number) => Math.round(s * FPS);

/** Posizione di ogni pezzo nel reel (in frame), tenendo conto della sovrapposizione delle dissolvenze. */
export const layout = (segments: Seg[], blend: number) => {
  const out: { start: number; len: number; seg: Seg }[] = [];
  let cursor = 0;
  segments.forEach((seg, i) => {
    const len = secToFrames(seg.to - seg.from);
    const start = i === 0 ? 0 : cursor - blend;
    out.push({ start, len, seg });
    cursor = start + len;
  });
  return { items: out, total: cursor };
};

/** Converte un tempo del sorgente (s) in frame del reel; null se tagliato. */
export const srcToReelFrame = (t: number, items: ReturnType<typeof layout>["items"]) => {
  for (const it of items) {
    if (t >= it.seg.from && t <= it.seg.to) return it.start + secToFrames(t - it.seg.from);
  }
  return null;
};

/** Parole del sorgente rimappate sui frame del reel. */
export const remapWords = (
  words: Caption[],
  items: ReturnType<typeof layout>["items"],
  wordFix: Record<string, string>,
) => {
  const res: { text: string; start: number; end: number }[] = [];
  for (const w of words) {
    const s = w.startMs / 1000;
    const e = w.endMs / 1000;
    const mid = (s + e) / 2;
    const it = items.find((x) => mid >= x.seg.from && mid <= x.seg.to);
    if (!it) continue;
    const start = it.start + secToFrames(Math.max(s, it.seg.from) - it.seg.from);
    const end = it.start + secToFrames(Math.min(e, it.seg.to) - it.seg.from);
    let text = w.text.trim();
    const key = text.toLowerCase().replace(/[.,?!;:]/g, "");
    if (wordFix[key]) text = wordFix[key] + text.slice(key.length);
    res.push({ text, start, end: Math.max(end, start + 2) });
  }
  return res;
};
