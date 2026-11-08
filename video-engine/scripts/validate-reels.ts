// Controlla per ogni reel: hook ed elementi non si sovrappongono nel tempo, stanno dentro il video, ancore risolte.
import { REELS } from "../src/cn/reels51";
import { layout, remapWords, resolveStart, secToFrames } from "../src/cn/timeline";
let errors = 0;
for (const r of REELS) {
  const p = r.props;
  const { items, total } = layout(p.segments, p.blendFrames);
  const words = remapWords(p.words, items, p.wordFix, p.wordOffset);
  const iv: { name: string; a: number; b: number }[] = p.hook ? [{ name: "hook", a: 0, b: secToFrames(p.hook.dur) + 8 }] : [];
  p.elements.forEach((el, i) => {
    const a = resolveStart(el, words);
    const anchored = el.word ? (Math.abs(a - secToFrames(el.at)) <= 60 && a !== secToFrames(el.at) ? "ancora" : "ancora NON trovata") : "";
    iv.push({ name: `${i + 1}.${el.kind}${anchored ? " (" + anchored + ")" : ""}`, a, b: a + secToFrames(el.dur) });
  });
  console.log(`\n${r.id}: video ${(total / 30).toFixed(2)} s, ${words.length} parole`);
  for (let i = 0; i < iv.length; i++) {
    const x = iv[i];
    const problems: string[] = [];
    if (x.b > total - 2) problems.push(`finisce dopo il video (${(x.b / 30).toFixed(2)} > ${(total / 30).toFixed(2)})`);
    if (x.name.includes("NON")) problems.push("parola ancora non trovata");
    for (let j = 0; j < i; j++) {
      const y = iv[j];
      if (x.a < y.b + 3 && y.a < x.b + 3) problems.push(`si sovrappone a ${y.name} (${(y.a / 30).toFixed(2)}-${(y.b / 30).toFixed(2)})`);
    }
    console.log(`  ${(x.a / 30).toFixed(2).padStart(6)}-${(x.b / 30).toFixed(2).padStart(6)}  ${x.name}${problems.length ? "  ✗ " + problems.join("; ") : ""}`);
    errors += problems.length;
  }
}
console.log(errors ? `\n✗ ${errors} problemi` : "\n✓ nessuna sovrapposizione");
process.exit(errors ? 1 : 0);
