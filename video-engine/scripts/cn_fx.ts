// Applica gli effetti della skill `effects` (fx.py) al master di un reel: masters/<id>.mp4 -> masters/<id>_fx.mp4
// Uso: npx tsx scripts/cn_fx.ts R1-fiatone [--still]   (--still: solo fotogrammi di controllo in out/ytcn51/check/fx/)
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { REELS } from "../src/cn/reels51";
import { layout, remapWords, resolveStart } from "../src/cn/timeline";
import { FPS } from "../src/cn/types";

const SKILL = "/home/user/Movie-Roulette/.claude/skills/effects";
const PY = `${SKILL}/.venv/bin/python`;
const id = process.argv[2];
const still = process.argv.includes("--still");
const r = REELS.find((x) => x.id === id);
if (!r) throw new Error(`reel sconosciuto: ${id}`);
const p = r.props;
const { items } = layout(p.segments, p.blendFrames);
const words = remapWords(p.words, items, p.wordFix, p.wordOffset);
const effects = (p.fx ?? []).map((f) => {
  const { fx, at, dur, word, wide, ...opts } = f;
  const s = resolveStart({ at, dur, word } as any, words) / FPS;
  return { fx, start: +s.toFixed(3), end: +(s + dur).toFixed(3), ...opts };
});
mkdirSync("work/ytcn51", { recursive: true });
const plan = `work/ytcn51/${id}_fx.json`;
writeFileSync(plan, JSON.stringify({ effects }, null, 1));
console.log(JSON.stringify(effects));
const master = `public/ytcn51/masters/${id}.mp4`;
if (!existsSync(master)) throw new Error(`manca il master ${master}`);
if (!effects.length) { console.log("nessun effetto"); process.exit(0); }
if (still) {
  mkdirSync("out/ytcn51/check/fx", { recursive: true });
  const times = effects.map((e) => ((e.start + e.end) / 2).toFixed(2)).join(",");
  execFileSync(PY, [`${SKILL}/scripts/fx.py`, "--plan", plan, master, `out/ytcn51/check/fx/${id}.png`, "--still", times], { stdio: "inherit" });
} else {
  execFileSync(PY, [`${SKILL}/scripts/fx.py`, "--plan", plan, master, `public/ytcn51/masters/${id}_fx.mp4`], { stdio: "inherit" });
}
