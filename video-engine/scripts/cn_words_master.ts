// Parole di un reel nel tempo del suo master (con le correzioni del reel): servono per tagliare spezzoni dal master (stories).
// Uso: npx tsx scripts/cn_words_master.ts ID [ID ...]   → work/storie_t/<ID>_parole.json  [{text,startMs,endMs}]
import { writeFileSync } from "node:fs";
import { REELS } from "../src/cn/reels51";
import { layout, remapWords } from "../src/cn/timeline";
for (const id of process.argv.slice(2)) {
  const r = REELS.find((x) => x.id === id);
  if (!r) { console.log(id, "non trovato"); continue; }
  const p = r.props as any;
  const { items, total } = layout(p.segments, p.blendFrames);
  const ws = remapWords(p.words, items, p.wordFix ?? {}, 0).map((w) => ({ text: " " + w.text, startMs: Math.round((w.start / 30) * 1000), endMs: Math.round((w.end / 30) * 1000) }));
  writeFileSync(`work/storie_t/${id}_parole.json`, JSON.stringify(ws));
  console.log(id, p.master, `${ws.length} parole`, `parlato fino a ${(ws[ws.length - 1].endMs / 1000).toFixed(1)} s`, `master ${(total / 30).toFixed(1)} s`);
}
