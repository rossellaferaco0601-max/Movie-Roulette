import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Blinker";
import { useMemo } from "react";
import type { Caption } from "@remotion/captions";
import type { Seg } from "./types";
import { BRAND, FPS, TAIL_FRAMES } from "./types";
import { layout, remapWords, type RWord } from "./timeline";

loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });
const FONT = "Blinker, sans-serif";

/** Versione lunga orizzontale (1920x1080) di una testimonianza: master già montato, domande come titoli di capitolo,
 *  cartellino con il nome, sottotitoli sobri, scheda finale. */
export type CNLongProps = {
  master: string;
  segments: Seg[];
  blendFrames: number;
  words: Caption[];
  wordFix: Record<string, string>;
  wordOffset: number;
  chapters: { at: number; q: string }[];
  name: string;
  sub: string;
  end: { title: string; sub: string };
  endSeconds: number;
};

const STOP = new Set(["e", "di", "a", "da", "in", "con", "su", "per", "tra", "fra", "il", "lo", "la", "i", "gli", "le", "un", "una", "uno", "che", "ma", "o", "del", "della", "dei", "delle", "al", "alla", "ai", "nel", "nella", "non", "mi", "ti", "si", "ci", "è", "ho", "ha"]);
const paginate = (words: RWord[]) => {
  const pages: { start: number; end: number; text: string }[] = [];
  let cur: RWord[] = [];
  const flush = () => { if (cur.length) pages.push({ start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map((w) => w.text).join(" ") }); cur = []; };
  words.forEach((w, i) => {
    const next = words[i + 1];
    cur.push(w);
    const len = cur.map((x) => x.text).join(" ").length;
    const gap = next ? next.start - w.end : 99;
    const punct = /[.?!]$/.test(w.text);
    const stop = STOP.has(w.text.toLowerCase().replace(/[.,?!;:]/g, ""));
    if (punct || gap > 18 || (len >= 34 && !stop) || len >= 46 || (/,$/.test(w.text) && len >= 22)) flush();
  });
  flush();
  return pages;
};

const Subtitles: React.FC<{ words: RWord[]; endFrame: number }> = ({ words, endFrame }) => {
  const frame = useCurrentFrame();
  const pages = useMemo(() => paginate(words), [words]);
  const idx = pages.findIndex((p, i) => frame >= p.start - 2 && frame < Math.min(p.end + 12, pages[i + 1]?.start ?? 1e9));
  if (idx < 0 || frame > endFrame) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: FONT }}>
      <span style={{ display: "inline-block", background: "rgba(11,15,10,0.78)", color: BRAND.white, fontWeight: 700, fontSize: 46, lineHeight: 1.2, padding: "10px 26px", borderRadius: 14, maxWidth: 1500 }}>{pages[idx].text}</span>
    </div>
  );
};

const Chapter: React.FC<{ q: string; n: number; start: number }> = ({ q, n, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - start, dur = Math.round(4.2 * fps);
  if (local < 0 || local >= dur) return null;
  const s = spring({ frame: local, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
  const out = interpolate(local, [dur - 10, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const chars = Math.round(Math.min(1, local / 12) * q.length);
  return (
    <div style={{ position: "absolute", right: 90, top: 120, width: 640, fontFamily: FONT, opacity: out, transform: `translateX(${(1 - s) * 80}px)` }}>
      <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 28, letterSpacing: 2, padding: "6px 18px", borderRadius: "12px 12px 0 0" }}>DOMANDA {n}</div>
      <div style={{ background: BRAND.cream, color: BRAND.ink, borderRadius: "0 20px 20px 20px", padding: "24px 30px", fontWeight: 800, fontSize: 48, lineHeight: 1.12, boxShadow: "0 14px 34px rgba(0,0,0,0.4)" }}>
        {q.slice(0, chars)}
      </div>
    </div>
  );
};

const NameCard: React.FC<{ name: string; sub: string; start: number }> = ({ name, sub, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - start, dur = Math.round(5 * fps);
  if (local < 0 || local >= dur) return null;
  const s = spring({ frame: local, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
  const k = interpolate(local, [8, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(local, [dur - 10, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 110, bottom: 190, display: "flex", fontFamily: FONT, opacity: out * s, transform: `translateX(${(1 - s) * -100}px)` }}>
      <div style={{ width: 12, background: BRAND.lime, borderRadius: 6 }} />
      <div style={{ marginLeft: 16 }}>
        <div style={{ background: "rgba(11,15,10,0.9)", color: BRAND.white, fontWeight: 900, fontSize: 62, padding: "6px 26px", borderRadius: 12, width: "fit-content" }}>{name}</div>
        <div style={{ marginTop: 8, background: BRAND.cream, color: BRAND.green, fontWeight: 800, fontSize: 34, padding: "6px 20px", borderRadius: 10, width: "fit-content", opacity: k }}>{sub}</div>
      </div>
    </div>
  );
};

const EndCard: React.FC<{ title: string; sub: string; frames: number }> = ({ title, sub, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, TAIL_FRAMES], [0, 1], { extrapolateRight: "clamp" });
  const s = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 150 } });
  const out = interpolate(frame, [frames + TAIL_FRAMES - 12, frames + TAIL_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BRAND.green, opacity: fade * out, fontFamily: FONT, color: BRAND.white, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontWeight: 900, fontSize: 96, lineHeight: 1.05, maxWidth: 1500, transform: `translateY(${(1 - s) * 40}px)`, opacity: s }}>{title}</div>
      <div style={{ marginTop: 34, fontWeight: 700, fontSize: 50, color: BRAND.cream, opacity: s }}>{sub}</div>
      <div style={{ marginTop: 60, background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 44, padding: "12px 34px", borderRadius: 14, opacity: s }}>Correre Naturale®</div>
    </AbsoluteFill>
  );
};

export const CNLong: React.FC<CNLongProps> = (p) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { items, total } = useMemo(() => layout(p.segments, p.blendFrames), [p.segments, p.blendFrames]);
  const words = useMemo(() => remapWords(p.words, items, p.wordFix, p.wordOffset), [p.words, items, p.wordFix, p.wordOffset]);
  const endF = Math.round(p.endSeconds * fps);
  const volume = interpolate(frame, [total - TAIL_FRAMES, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BRAND.ink, fontFamily: FONT }}>
      <Sequence from={0} durationInFrames={total} layout="none">
        <OffthreadVideo src={staticFile(p.master)} volume={volume} style={{ width: "100%", height: "100%" }} />
        <NameCard name={p.name} sub={p.sub} start={Math.round(5 * fps)} />
        {p.chapters.map((c, i) => <Chapter key={i} q={c.q} n={i + 1} start={Math.max(0, Math.round(c.at * fps) - (i ? 4 : 0))} />)}
        <Subtitles words={words} endFrame={total - 4} />
      </Sequence>
      <Sequence from={total - TAIL_FRAMES} durationInFrames={endF + TAIL_FRAMES} layout="none">
        <EndCard title={p.end.title} sub={p.end.sub} frames={endF} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const longDuration = (p: CNLongProps) => layout(p.segments, p.blendFrames).total + Math.round(p.endSeconds * FPS);
