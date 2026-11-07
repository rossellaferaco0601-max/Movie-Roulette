// Esporta le definizioni dei reel in JSON per gli script Python (master FFmpeg).
import { writeFileSync, mkdirSync } from "node:fs";
import { REELS } from "../src/cn/reels51";
mkdirSync("work/ytcn51", { recursive: true });
const out = REELS.map((r) => ({ id: r.id, src: r.props.src, segments: r.props.segments, blendFrames: r.props.blendFrames }));
writeFileSync("work/ytcn51/reels.json", JSON.stringify(out, null, 1));
console.log("reels:", out.map((r) => r.id).join(" "));
