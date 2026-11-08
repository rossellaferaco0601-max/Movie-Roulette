// Esporta le definizioni dei reel in JSON per gli script Python (master FFmpeg): segmenti, dissolvenze e finestre di campo largo.
import { writeFileSync, mkdirSync } from "node:fs";
import { REELS } from "../src/cn/reels51";
import { layout, remapWords, resolveStart } from "../src/cn/timeline";
import { FPS } from "../src/cn/types";
mkdirSync("work/ytcn51", { recursive: true });
const out = REELS.map((r) => {
  const p = r.props;
  const { items } = layout(p.segments, p.blendFrames);
  const words = remapWords(p.words, items, p.wordFix, p.wordOffset);
  const wide = (p.fx ?? [])
    .filter((f) => f.wide)
    .map((f) => {
      const s = resolveStart({ at: f.at, dur: f.dur, word: f.word } as any, words);
      return [s / FPS - 0.1, (s + Math.round(f.dur * FPS)) / FPS + 0.45];
    });
  return { id: r.id, src: p.src, segments: p.segments, blendFrames: p.blendFrames, wide };
});
writeFileSync("work/ytcn51/reels.json", JSON.stringify(out, null, 1));
console.log("reels:", out.map((r) => `${r.id}${r.wide.length ? ` (largo: ${r.wide.map((w) => w.map((x) => x.toFixed(1)).join("-")).join(", ")})` : ""}`).join(" "));
