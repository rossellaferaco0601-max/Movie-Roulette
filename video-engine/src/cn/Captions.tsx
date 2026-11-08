import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { BRAND, H, W, ZONE } from "./types";
import type { RWord } from "./timeline";

/** Pagine stile hormozi: max 3 parole, nuova pagina a pausa > 0.45 s o a fine frase. Ogni pagina resta fino alla successiva. */
export const paginate = (words: RWord[], maxWords = 3, maxChars = 22) => {
  const pages: { words: RWord[]; start: number; end: number }[] = [];
  let cur: RWord[] = [];
  const flush = () => {
    if (cur.length) pages.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const chars = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    if (prev && (w.start - prev.end > 14 || /[.?!]$/.test(prev.text) || (cur.length > 0 && chars > maxChars))) flush();
    cur.push(w);
    if (cur.length >= maxWords || /[.?!]$/.test(w.text)) flush();
  });
  flush();
  for (let i = 0; i < pages.length; i++) {
    const next = pages[i + 1];
    pages[i].end = next ? Math.min(next.start, pages[i].end + 24) : pages[i].end + 12;
  }
  return pages;
};

/** Sottotitoli sempre presenti: bianchi, in lime SOLO la parola che viene detta in quel momento. */
export const Captions: React.FC<{ words: RWord[]; size?: number; endFrame: number }> = ({ words, size = 64, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= endFrame) return null;
  const pages = paginate(words);
  const page = pages.find((p) => frame >= p.start && frame < p.end) ?? pages.find((p) => frame < p.start && p.start - frame < 6);
  if (!page) return null;
  const top = H * ZONE.capTop;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: W,
        top,
        height: H * (ZONE.capBottom - ZONE.capTop),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.34em",
        fontFamily: "Blinker, sans-serif",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        textTransform: "uppercase",
        color: BRAND.white,
        textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        padding: "0 60px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0.34em", background: "rgba(11,15,10,0.78)", borderRadius: 20, padding: "12px 28px", boxShadow: "0 6px 24px rgba(0,0,0,0.35)" }}>
      {page.words.map((w, i) => {
        const active = frame >= w.start && frame < w.end;
        const s = active ? spring({ frame: frame - w.start, fps, config: { damping: 14, stiffness: 240 } }) : 0;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: active ? BRAND.lime : BRAND.white,
              transform: `scale(${active ? 1.03 + 0.04 * s : 1})`,
              transformOrigin: "center",
              whiteSpace: "nowrap",
              padding: "0 3px",
            }}
          >
            {w.text}
          </span>
        );
      })}
      </div>
    </div>
  );
};
