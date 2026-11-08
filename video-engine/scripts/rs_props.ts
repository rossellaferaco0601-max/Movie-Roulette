// Converte un project.json di ReelStudio nelle props per la composizione cloud "RSReel".
// Uso: npx tsx scripts/rs_props.ts <project.json> <video in public/, es. ytcn51/ytcn51_src.mp4> <out.json> [srcW srcH]
import { readFileSync, writeFileSync } from "node:fs";
const [proj, videoFile, out, sw, sh] = process.argv.slice(2);
const p = JSON.parse(readFileSync(proj, "utf8"));
const brand = p.brand && p.brand.id ? p.brand : JSON.parse(readFileSync("public/rs/clients/correre-naturale/brand.json", "utf8"));
const props = {
  videoFile, fps: 30, width: 1080, height: 1920,
  srcWidth: Number(sw) || p.source?.width || 1080, srcHeight: Number(sh) || p.source?.height || 1920,
  cuts: p.cuts, words: p.words, brand, style: p.style || {}, hook: p.hook || {}, cta: p.cta || {}, effects: p.effects || [], audio: p.audio || {},
  cutoutDir: p.cutoutDir || null, cutoutFrames: p.cutoutFrames || [],
};
writeFileSync(out, JSON.stringify(props));
console.log("props →", out, "cuts", props.cuts?.length, "words", props.words?.length, "effects", props.effects.length);
