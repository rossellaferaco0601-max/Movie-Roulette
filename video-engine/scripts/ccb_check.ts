// Controllo «il volto non si copre mai» per i selfie (reel CCB): per ogni grafica guarda il riquadro del volto misurato sul master
// (scripts/cn_facebox.py → <master>_volto.json) nella finestra in cui la grafica è a schermo.
//   · parole sopra la testa (topword): il bordo basso della targa deve restare sopra la cima dei capelli
//   · grafiche della fascia (title, counter, cycle, beat, bigstrike, pill, pointer, topword zone strip): il mento deve restare sopra 0,645
// Uso: npx tsx scripts/ccb_check.ts [id ...]
import { readFileSync, existsSync } from "node:fs";
import { REELS } from "../src/cn/reels51";
import { layout, remapWords, resolveStart, tailFrames } from "../src/cn/timeline";
import { TOP_Y, topwordHeight } from "../src/cn/Elements8";
const want = process.argv.slice(2);
let bad = 0;
for (const r of REELS) {
  if (!/^C\d/.test(r.id) || /percorso/.test(r.id) || (want.length && !want.includes(r.id))) continue;
  const p = r.props as any;
  const f = `public/${p.master.replace(".mp4", "_volto.json")}`;
  if (!existsSync(f)) { console.log(`${r.id}: manca ${f}`); continue; }
  const box: number[][] = JSON.parse(readFileSync(f, "utf8"));
  const { items } = layout(p.segments, p.blendFrames, tailFrames(p.tailSeconds));
  const words = remapWords(p.words, items, p.wordFix ?? {}, p.wordOffset ?? 0);
  const out: string[] = [];
  for (const el of p.elements as any[]) {
    const a = resolveStart(el, words) / 30, b = a + el.dur;
    const win = box.filter((m) => m[0] >= a - 0.1 && m[0] <= b + 0.1);
    if (!win.length || el.kind === "side" || el.kind === "wall") continue;
    const hair = Math.min(...win.map((m) => m[2] - 0.25 * (m[4] - m[2]))), chin = Math.max(...win.map((m) => m[4]));
    if (el.kind === "topword" && el.zone !== "strip") {
      const bottom = (el.y ?? TOP_Y) + topwordHeight(el.lines, el.max) / 1920;
      const ok = bottom < hair - 0.008;
      if (!ok) bad++;
      out.push(`  ${a.toFixed(1).padStart(5)}-${b.toFixed(1).padStart(5)} sopra la testa «${el.lines.join(" / ")}»: targa fino a ${bottom.toFixed(3)}, capelli da ${hair.toFixed(3)} ${ok ? "ok" : "✗ TOCCA I CAPELLI"}`);
    } else {
      const ok = chin < 0.645;
      if (!ok) { bad++; out.push(`  ${a.toFixed(1).padStart(5)}-${b.toFixed(1).padStart(5)} fascia ${el.kind}: mento fino a ${chin.toFixed(3)} ✗ TOCCA IL MENTO`); }
    }
  }
  console.log(`${r.id}:`); console.log(out.join("\n") || "  (nessuna parola sopra la testa)");
}
console.log(bad ? `✗ ${bad} grafiche da spostare` : "✓ volto sempre libero");
