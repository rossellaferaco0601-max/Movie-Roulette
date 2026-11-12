// Foglio di controllo PRIMA del render: un fotogramma a metà di ogni grafica del reel (più l'inizio e la fine), con un solo bundle.
// Regola (Ross 12/11): guardare le grafiche a grandezza reale prima di lanciare un render o una serie.
// Uso: npx tsx scripts/cn_stills.ts ID [ID@12.5,30 ...]   (ID@secondi = solo quei momenti)      → out/chk/stills_<ID>_<n>.jpg (6 fotogrammi per foglio, 360 px l'uno)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { REELS } from "../src/cn/reels51";

const ids = process.argv.slice(2);
const PER = 6, WIDE = 360;
(async () => {
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public"), symlinkPublicDir: true } as any);
  const browser = await openBrowser("chrome", { browserExecutable: process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium", chromiumOptions: { gl: "swangle" } });
  mkdirSync("out/chk/st", { recursive: true });
  for (const arg of ids) {
    const [id, only] = arg.split("@");
    const r = REELS.find((x) => x.id === id);
    if (!r) { console.log(id, "non trovato"); continue; }
    const comp = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
    const fps = comp.fps, last = comp.durationInFrames - 1;
    const els = (r.props.elements as any[]).slice().sort((a, b) => a.at - b.at);
    // metà di ogni grafica; per le grafiche lunghe (elenchi, cicli, muro) anche verso la fine, dove sono piene
    const times: { t: number; lab: string }[] = [];
    for (const e of els) {
      times.push({ t: e.at + Math.min(e.dur * 0.5, 1.4), lab: e.kind });
      if (e.dur > 3.2) times.push({ t: e.at + e.dur - 0.6, lab: e.kind + " fine" });
    }
    times.push({ t: Math.max(0, last / fps - 0.4), lab: "ultimo" });
    if (only) times.splice(0, times.length, ...only.split(",").map((x) => ({ t: +x, lab: "" })));
    const files: string[] = [];
    for (let i = 0; i < times.length; i++) {
      const frame = Math.min(last, Math.max(0, Math.round(times[i].t * fps)));
      const out = `out/chk/st/${id}_${String(i).padStart(2, "0")}.jpg`;
      await renderStill({ composition: comp, serveUrl, output: out, frame, imageFormat: "jpeg", jpegQuality: 85, scale: WIDE / comp.width, puppeteerInstance: browser, logLevel: "error" });
      const lab = `${times[i].t.toFixed(1)}s ${times[i].lab}`;
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", out, "-vf", `drawtext=text='${lab}':fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.7:x=4:y=h-24`, out.replace(".jpg", "l.jpg")]);
      files.push(out.replace(".jpg", "l.jpg"));
    }
    let n = 0;
    for (let i = 0; i < files.length; i += PER) {
      const part = files.slice(i, i + PER);
      const sheet = `out/chk/stills_${id}_${n++}.jpg`;
      if (part.length === 1) execFileSync("cp", [part[0], sheet]);
      else execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...part.flatMap((f) => ["-i", f]), "-filter_complex", `hstack=inputs=${part.length}`, sheet]);
    }
    console.log(`${id}: ${times.length} fotogrammi, ${n} fogli`);
  }
  await browser.close({ silent: true });
  rmSync("out/chk/st", { recursive: true, force: true });
  if (serveUrl.includes("remotion-webpack-bundle")) rmSync(serveUrl, { recursive: true, force: true });   // il bundle temporaneo creato da questo script
  process.exit(0);
})();
