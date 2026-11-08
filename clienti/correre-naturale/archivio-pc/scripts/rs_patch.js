// Rifà solo alcuni tratti di un reel già renderizzato e li sostituisce nel video (audio invariato).
// Uso: node rs_patch.js <id> <in.mp4> <out.mp4> <f0> <f1> [<f0> <f1> ...]
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const RS = 'C:/Users/roxfe/Documents/ReelStudio';
const rq = require('module').createRequire(RS + '/package.json');
const { bundle } = rq('@remotion/bundler');
const { renderMedia, selectComposition } = rq('@remotion/renderer');
const BASE = process.env.RS_BASE || 'http://localhost:4399';

(async () => {
  const [id, input, output, ...nums] = process.argv.slice(2);
  const ranges = [];
  for (let i = 0; i < nums.length; i += 2) ranges.push([Number(nums[i]), Number(nums[i + 1])]);
  const p = JSON.parse(fs.readFileSync(path.join(RS, 'progetti', id, 'project.json'), 'utf8'));
  const inputProps = {
    cutoutBase: '', cutoutFrames: [], assetBase: BASE, videoUrl: `${BASE}/progetti/${p.id}/${p.source.file}`,
    fps: 30, width: 1080, height: 1920, srcWidth: p.source.width, srcHeight: p.source.height,
    cuts: p.cuts, words: p.words, brand: p.brand, style: p.style, hook: p.hook, cta: p.cta, effects: p.effects, audio: p.audio,
  };
  const serveUrl = await bundle({ entryPoint: path.join(RS, 'src', 'remotion', 'Root.tsx'), outDir: path.join(os.tmpdir(), 'cn-reel-bundle-' + process.pid) });
  const comp = await selectComposition({ serveUrl, id: 'Reel', inputProps });
  const segs = [];
  for (const [a, b] of ranges) {
    const f = path.join(os.tmpdir(), `cn-patch-${process.pid}-${a}.mp4`);
    await renderMedia({ composition: comp, serveUrl, codec: 'h264', outputLocation: f, inputProps, crf: 16, muted: true, frameRange: [a, b], concurrency: 5, timeoutInMilliseconds: 120000 });
    segs.push(f);
  }
  // [originale prima][tratto nuovo][originale dopo]…
  const args = ['-v', 'error', '-y', '-i', input];
  segs.forEach((f) => args.push('-i', f));
  const parts = [];
  let g = '';
  let cur = 0;
  ranges.forEach(([a, b], i) => {
    g += `[0:v]trim=start_frame=${cur}:end_frame=${a},setpts=PTS-STARTPTS[o${i}];[${i + 1}:v]setpts=PTS-STARTPTS[n${i}];`;
    parts.push(`[o${i}]`, `[n${i}]`);
    cur = b + 1;
  });
  g += `[0:v]trim=start_frame=${cur},setpts=PTS-STARTPTS[oz];`;
  parts.push('[oz]');
  g += `${parts.join('')}concat=n=${parts.length}:v=1:a=0[v]`;
  args.push('-filter_complex', g, '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'copy', '-movflags', '+faststart', output);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  console.log('patch ok', output);
})().catch((e) => { console.error(e); process.exit(1); });
