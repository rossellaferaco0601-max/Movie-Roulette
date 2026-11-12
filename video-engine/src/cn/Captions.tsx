import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { BRAND, H, W, ZONE } from "./types";
import type { RWord } from "./timeline";

const STOP = new Set("a ad al alla alle allo ai agli e ed o il lo la i gli le un una uno di del della dei delle dello da dal dalla in nel nella con su sul sulla per tra fra che se non ho ha hai mi ti si ci vi è ma più c' l' all' quest'".split(" "));

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
    if (/[.?!]$/.test(w.text)) flush();
    else if (cur.length >= maxWords) {
      // la pagina non finisce su una parolina: la porto all'inizio della pagina dopo
      const last = cur[cur.length - 1];
      if (cur.length > 1 && STOP.has(last.text.toLowerCase().replace(/[^a-zàèéìòù']/g, ""))) { cur.pop(); flush(); cur.push(last); }
      else flush();
    }
  });
  flush();
  // seconda passata: nessuna pagina finisce su una parolina (la sposto in testa alla pagina seguente)
  for (let i = 0; i < pages.length - 1; i++) {
    const pg = pages[i], last = pg.words[pg.words.length - 1];
    if (pg.words.length === 1 && !/[.?!,]$/.test(last.text) && STOP.has(last.text.toLowerCase().replace(/[^a-zàèéìòù']/g, "")) && pages[i + 1].words.length < 4) {
      pages[i + 1].words.unshift(last); pages[i + 1].start = last.start; pages.splice(i, 1); i--; continue;
    }
    if (pg.words.length > 1 && !/[.?!,]$/.test(last.text) && STOP.has(last.text.toLowerCase().replace(/[^a-zàèéìòù']/g, ""))) {
      pg.words.pop(); pg.end = pg.words[pg.words.length - 1].end;
      pages[i + 1].words.unshift(last); pages[i + 1].start = last.start;
    }
  }
  for (let i = 0; i < pages.length; i++) {
    const next = pages[i + 1];
    pages[i].end = next ? Math.min(next.start, pages[i].end + 24) : pages[i].end + 12;
  }
  return pages;
};

/** Sottotitoli sempre presenti: bianchi, in lime SOLO la parola che viene detta in quel momento. */
export const Captions: React.FC<{ words: RWord[]; size?: number; endFrame: number; startFrame?: number }> = ({ words, size = 64, endFrame, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= endFrame) return null;
  if (frame < startFrame) return null;
  // niente sottotitoli sull'hook visivo: si riparte dalla prima pagina che comincia dopo (mai da metà pagina)
  const pages = paginate(words).filter((p) => p.start >= startFrame);
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
