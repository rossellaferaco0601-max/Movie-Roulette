import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { BRAND, H, W } from "./types";

export type RWord = { text: string; start: number; end: number };

/** Pagine stile hormozi: max 3 parole, nuova pagina a pausa > 0.45 s o a fine frase. */
export const paginate = (words: RWord[], maxWords = 3) => {
  const pages: { words: RWord[]; start: number; end: number }[] = [];
  let cur: RWord[] = [];
  const flush = () => {
    if (cur.length) pages.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (prev && (w.start - prev.end > 14 || /[.?!]$/.test(prev.text))) flush();
    cur.push(w);
    if (cur.length >= maxWords || /[.?!]$/.test(w.text)) flush();
  });
  flush();
  // ogni pagina resta a schermo fino alla successiva (sottotitoli sempre presenti)
  for (let i = 0; i < pages.length; i++) {
    const next = pages[i + 1];
    pages[i].end = next ? Math.min(next.start, pages[i].end + 24) : pages[i].end + 12;
  }
  return pages;
};

const clean = (t: string) => t.toLowerCase().replace(/[.,?!;:«»"']/g, "");

export const Captions: React.FC<{ words: RWord[]; emph: string[]; y?: number; size?: number; endFrame: number }> = ({
  words,
  emph,
  y = 0.8,
  size = 64,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= endFrame) return null;
  const pages = paginate(words);
  const page = pages.find((p) => frame >= p.start && frame < p.end) ?? pages.find((p) => frame < p.start && p.start - frame < 6);
  if (!page) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: W,
        top: H * y - size,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: `${0.26}em`,
        fontFamily: "Blinker, sans-serif",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        textTransform: "uppercase",
        color: BRAND.white,
        WebkitTextStroke: "1.5px rgba(0,0,0,0.9)",
        textShadow: "0 3px 14px rgba(0,0,0,0.75), 0 0 2px #000",
        padding: "0 60px",
        flexWrap: "wrap",
      }}
    >
      {page.words.map((w, i) => {
        const active = frame >= w.start && frame < w.end;
        const isEmph = emph.includes(clean(w.text));
        const s = active ? spring({ frame: frame - w.start, fps, config: { damping: 14, stiffness: 240 } }) : 0;
        const scale = 1.03 + 0.04 * s;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: active || isEmph ? BRAND.lime : BRAND.white,
              transform: `scale(${active ? scale : 1})`,
              transformOrigin: "center",
              whiteSpace: "nowrap",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
