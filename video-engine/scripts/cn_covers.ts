// Copertine nel formato unico per tutti i reel che hanno `cover` (Ross 12/11: Daniele che sorride, stessa grafica, file con lo
// stesso nome del reel). Il fotogramma è `cover.frame`, altrimenti il migliore trovato da scripts/cn_smile.py (<master>_sorriso.json).
// Uso: npx tsx scripts/cn_covers.ts [--prova] [id ...]     --prova = solo un foglio di confronto dei 3 fotogrammi migliori, senza salvare
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { REELS } from "../src/cn/reels51";
const args = process.argv.slice(2), prova = args.includes("--prova"), want = args.filter((a) => !a.startsWith("--"));
const OUT = "out/ytcn51/consegna"; mkdirSync("out/copertine_prova", { recursive: true });
for (const r of REELS) {
  if (!r.cover || (want.length && !want.includes(r.id))) continue;
  const master = (r.cover.master ?? r.props.master).replace("_fx.mp4", ".mp4").replace("C6-metronomo-manuale", "C6-metronomo");
  const sj = `public/${master.replace(".mp4", "_sorriso.json")}`;
  const picks: number[] = existsSync(sj) ? JSON.parse(readFileSync(sj, "utf8")).map((x: any) => x.frame) : [];
  const still = (frame: number, out: string, scale = 1) =>
    execFileSync("npx", ["remotion", "still", `${r.id}-copertina`, out, "--image-format=jpeg", "--jpeg-quality=92", `--scale=${scale}`, "--log=error", `--props=${JSON.stringify({ frame })}`], { stdio: ["ignore", "ignore", "ignore"] });
  if (prova) {
    const fs = (r.cover.frame !== undefined ? [r.cover.frame] : []).concat(picks).slice(0, 3);
    fs.forEach((f, i) => still(f, `out/copertine_prova/${r.id}_${i + 1}_f${f}.jpg`, 0.25));
    console.log(r.id, "prove:", fs.join(", "));
    continue;
  }
  const frame = r.cover.frame ?? picks[0];
  if (frame === undefined) { console.log(`${r.id}: nessun fotogramma (manca ${sj})`); continue; }
  // stesso nome del reel: ultima versione consegnata (ID_vN.mp4) → ID_vN.jpg, accanto al video; resta anche ID_copertina.jpg
  const vers = readdirSync(OUT).filter((f) => new RegExp(`^${r.id}_v\\d+\\.mp4$`).test(f)).sort((a, b) => +a.match(/_v(\d+)/)![1] - +b.match(/_v(\d+)/)![1]);
  const name = vers.length ? vers[vers.length - 1].replace(".mp4", ".jpg") : `${r.id}.jpg`;
  still(frame, `${OUT}/${name}`);
  copyFileSync(`${OUT}/${name}`, `${OUT}/${r.id}_copertina.jpg`);
  console.log(`${r.id}: fotogramma ${frame} → ${name}`);
}
