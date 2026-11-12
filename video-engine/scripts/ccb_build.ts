// Master delle varianti CCB ritagliati dai master già fatti (nessun passaggio dal girato): npx tsx scripts/ccb_build.ts [id ...]
// Scrive work/<id>.json e lancia scripts/cn_master_v.py. Le ricette stanno in CCB_BUILD (src/cn/reels51.ts).
import { execFileSync } from "child_process";
import { writeFileSync } from "fs";
import { CCB_BUILD } from "../src/cn/reels51";
const want = process.argv.slice(2);
for (const [id, b] of Object.entries(CCB_BUILD)) {
  if (want.length && !want.includes(id)) continue;
  const cfg = { id, srcs: b.srcs.map((s) => `public/${s}`), out: `public/ccb/masters/${id}.mp4`, faceX: 0.5, faceY: 0.3, zooms: [1, 1], blendFrames: 1, vf: "eq=contrast=1.0", voice: "",
    segments: b.ranges.map(([from, to]) => ({ from, to })) };
  writeFileSync(`work/${id}.json`, JSON.stringify(cfg, null, 1));
  console.log(execFileSync("python3", ["scripts/cn_master_v.py", `work/${id}.json`]).toString().trim());
}
