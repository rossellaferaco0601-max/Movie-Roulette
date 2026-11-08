// Render dei progetti ReelStudio con il codice Remotion aggiornato (senza riavviare il server di Ross).
// Il server su localhost:4321 serve video, font, loghi e suoni.
// Uso:
//   node rs_render.js still <id> <out_dir> <t1> <t2> ...   → PNG ai secondi indicati
//   node rs_render.js video <id> <out.mp4>
const path = require('path');
const fs = require('fs');
const os = require('os');
const RS = 'C:/Users/roxfe/Documents/ReelStudio';
const rq = require('module').createRequire(RS + '/package.json');
const { bundle } = rq('@remotion/bundler');
const { renderMedia, renderStill, selectComposition } = rq('@remotion/renderer');
const BASE = process.env.RS_BASE || 'http://localhost:4399';

// scontorni (PNG per fotogramma) nella cartella del progetto sorgente, come fa server.js
const cutouts = (p) => {
  const root = p.source.file.startsWith('../') ? p.source.file.split('/')[1] : p.id;
  const dir = path.join(RS, 'progetti', root, 'scontorni');
  const frames = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.png')).map((f) => Number(f.replace('.png', ''))).sort((a, b) => a - b) : [];
  return { cutoutBase: `${BASE}/progetti/${root}/scontorni`, cutoutFrames: frames };
};
const props = (p) => ({
  ...cutouts(p), assetBase: BASE,
  videoUrl: `${BASE}/progetti/${p.id}/${p.source.file}`,
  fps: 30, width: 1080, height: 1920, srcWidth: p.source.width, srcHeight: p.source.height,
  cuts: p.cuts, words: p.words, brand: p.brand, style: p.style, hook: p.hook, cta: p.cta, effects: p.effects, audio: p.audio,
});

(async () => {
  const [mode, id, out, ...rest] = process.argv.slice(2);
  const p = JSON.parse(fs.readFileSync(path.join(RS, 'progetti', id, 'project.json'), 'utf8'));
  const serveUrl = await bundle({ entryPoint: path.join(RS, 'src', 'remotion', 'Root.tsx'), outDir: path.join(os.tmpdir(), 'cn-reel-bundle-' + process.pid) });
  const inputProps = props(p);
  const comp = await selectComposition({ serveUrl, id: 'Reel', inputProps });
  if (mode === 'still') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of rest) {
      const frame = Math.min(comp.durationInFrames - 1, Math.round(Number(t) * 30));
      await renderStill({ composition: comp, serveUrl, inputProps, frame, output: path.join(out, `t${Number(t).toFixed(1).padStart(5, '0')}.png`), timeoutInMilliseconds: 120000 });
    }
    console.log('stills ok', rest.length);
  } else {
    let last = -1;
    await renderMedia({
      composition: comp, serveUrl, codec: 'h264', outputLocation: out, inputProps, crf: 18, audioBitrate: '192k',
      concurrency: Number(process.env.RS_CONC || 3), timeoutInMilliseconds: 300000,
      ...(process.env.RS_FRAMES ? { frameRange: process.env.RS_FRAMES.split('-').map(Number) } : {}),   // RS_FRAMES=a-b per una prova corta
      onProgress: ({ progress }) => { const k = Math.floor(progress * 10); if (k !== last) { last = k; console.log(`${id} ${k * 10}%`); } },
    });
    console.log('video ok', out);
  }
})().catch((e) => { console.error(e); process.exit(1); });
