// Controlla per ogni reel: hook ed elementi non si sovrappongono nel tempo, stanno dentro il video, ancore risolte.
import { REELS } from "../src/cn/reels51";
import { layout, remapWords, resolveStart, secToFrames, sameWord, tailFrames } from "../src/cn/timeline";
let errors = 0;
for (const r of REELS) {
  const p = r.props;
  const { items, total } = layout(p.segments, p.blendFrames, tailFrames(p.tailSeconds));
  const words = remapWords(p.words, items, p.wordFix, p.wordOffset);
  const clean = (t: string) => t.toLowerCase().replace(/[.,?!;:«»"']/g, "");
  const found = (word: string, at: number) => words.some((w) => sameWord(w.text, word) && Math.abs(w.start - secToFrames(at)) <= 60);
  const iv: { name: string; a: number; b: number }[] = p.hook ? [{ name: "hook", a: 0, b: secToFrames(p.hook.dur) + 8 }] : [];
  p.elements.forEach((el, i) => {
    const a = resolveStart(el, words);
    const anchored = el.word ? (found(el.word, el.at) ? "ancora" : "ancora NON trovata") : "";
    let lastCue = a; { let fr = a - 4; for (const c of el.cues ?? []) { const w = words.find((x) => x.start >= fr && sameWord(x.text, c)); if (w) { lastCue = w.start; fr = w.start + 1; } } }
    const readS = (a + secToFrames(el.dur) - lastCue) / 30; const fast = !/drill|orbit|guide|fulltext/.test(el.kind) && readS < 1.0 ? ` LETTURA ${readS.toFixed(2)} s NON basta` : "";
    let from = a - 4; const missing = (el.cues ?? []).filter((c) => { const w = words.find((x) => x.start >= from && x.start <= a + secToFrames(el.dur) && sameWord(x.text, c)); if (w) from = w.start + 1; return !w; });
    iv.push({ name: `${i + 1}.${el.kind}${anchored ? " (" + anchored + ")" : ""}${missing.length ? " aggancio NON trovato: " + missing.join(",") : ""}${fast}`, a, b: a + secToFrames(el.dur) });
  });
  const CAMERA_FX = new Set(["lean-in", "slow-push", "dot-reveal", "moody"]); // effetti di camera: non occupano la zona grafiche
  (p.fx ?? []).forEach((f, i) => {
    if (CAMERA_FX.has(f.fx)) return;
    const a = resolveStart({ at: f.at, dur: f.dur, word: f.word } as any, words);
    const anchored = f.word ? (found(f.word, f.at) ? "ancora" : "ancora NON trovata") : "";
    iv.push({ name: `fx.${f.fx}${anchored ? " (" + anchored + ")" : ""}`, a, b: a + secToFrames(f.dur) });
  });
  iv.sort((x, y) => x.a - y.a);
  console.log(`\n${r.id}: video ${(total / 30).toFixed(2)} s, ${words.length} parole`);
  for (let i = 0; i < iv.length; i++) {
    const x = iv[i];
    const problems: string[] = [];
    if (x.b > total - 2 && !x.name.includes("split")) problems.push(`finisce dopo il video (${(x.b / 30).toFixed(2)} > ${(total / 30).toFixed(2)})`);
    if (x.name.includes("NON trovat")) problems.push("parola non trovata");
    if (x.name.includes("NON basta")) problems.push("l'ultima scritta resta a schermo meno di 1 s");
    for (let j = 0; j < i; j++) {
      const y = iv[j];
      const full = (n: string) => /\.(orbit|drill|guide|pair|lifebar|fulltext)/.test(n);
      if (!(full(x.name) && full(y.name)) && x.a < y.b + 3 && y.a < x.b + 3) problems.push(`si sovrappone a ${y.name} (${(y.a / 30).toFixed(2)}-${(y.b / 30).toFixed(2)})`);
    }
    console.log(`  ${(x.a / 30).toFixed(2).padStart(6)}-${(x.b / 30).toFixed(2).padStart(6)}  ${x.name}${problems.length ? "  ✗ " + problems.join("; ") : ""}`);
    errors += problems.length;
  }
}
console.log(errors ? `\n✗ ${errors} problemi` : "\n✓ nessuna sovrapposizione");
process.exit(errors ? 1 : 0);
