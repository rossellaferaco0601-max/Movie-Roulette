#!/usr/bin/env python3
"""Master 1080x1920 da un sorgente GIÀ MONTATO (video YouTube con stacchi, riprese di repertorio e inquadrature diverse):
ogni pezzo viene spezzato sugli stacchi reali del sorgente e ogni inquadratura ha il suo ritaglio verticale, calcolato
sul volto (volto in alto, mento sopra la zona grafiche); le riprese senza volto si ritagliano al centro.
Audio tagliato netto ai punti di taglio (micro-incrocio), coda come in cn_master.py.
Uso: python3 scripts/cn_master_shots.py config.json
config: {id, src, out, shots: "work/x_shots.json", blendFrames, tail, tailLive, segments: [{from, to}],
         crops: {"<inizio inquadratura>": [x, y, w, h]}}   (crops = ritagli a mano, in pixel del sorgente)
Stampa anche la mappa dei pezzi (tempo nel master di ogni inquadratura): serve per coprire le schede grafiche del sorgente."""
import json, os, subprocess, sys

FPS, OW, OH, AX = 30, 1080, 1920, 0.04
c = json.load(open(sys.argv[1]))
SW, SH = c.get("srcSize", [3840, 2160])
shots = json.load(open(c["shots"]))
blend, TAIL = c.get("blendFrames", 2), c.get("tail", 0.5)
tmp = os.path.join(os.path.dirname(c["out"]), f"tmp_{c['id']}"); os.makedirs(tmp, exist_ok=True)

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2500:]); raise SystemExit("ffmpeg fallito")

def crop_of(shot):
    """Ritaglio 9:16 dell'inquadratura: volto con la fronte a ~0,10 e alto ~0,25 dell'altezza (mento a ~0,35: margine per i movimenti della testa)."""
    key = f"{shot['from']:.2f}"
    if key in c.get("crops", {}): return c["crops"][key]
    f = shot.get("face")
    if not f: return [(SW - SH * 9 / 16) / 2, 0, SH * 9 / 16, SH]
    ch = min(SH, max(1250, f[3] * SH / 0.25)); cw = ch * 9 / 16
    x = min(max(0, (f[0] + f[2] / 2) * SW - cw / 2), SW - cw); y = min(max(0, f[1] * SH - 0.10 * ch), SH - ch)
    return [x, y, cw, ch]

segs, parts, cursor, pieces_map = c["segments"], [], 0, []
for i, s in enumerate(segs):
    n = round((s["to"] - s["from"]) * FPS); last = i == len(segs) - 1
    start = 0 if i == 0 else cursor - blend; cursor = start + n
    cuts = [s["from"]] + [sh["from"] for sh in shots if s["from"] + 0.05 < sh["from"] < s["to"] - 0.05] + [s["to"]]
    live = min(round(c.get("tailLive", TAIL) * FPS), round(TAIL * FPS)) if last else 0
    inputs, fc, labels = [], "", []
    for k, (a, b) in enumerate(zip(cuts[:-1], cuts[1:])):
        sh = next(x for x in shots if x["from"] - 0.001 <= (a + b) / 2 < x["to"])
        f0, f1 = round((a - s["from"]) * FPS), round((b - s["from"]) * FPS)
        nf = f1 - f0 + (live if k == len(cuts) - 2 else 0)
        x, y, w, h = [int(v) // 2 * 2 for v in crop_of(sh)]
        inputs += ["-ss", f"{a:.3f}", "-t", f"{nf / FPS + 0.4:.3f}", "-i", c["src"]]
        fc += f"[{k}:v]crop={w}:{h}:{x}:{y},scale={OW}:{OH}:flags=lanczos,fps={FPS}:round=down,trim=end_frame={nf},setpts=PTS-STARTPTS,setsar=1[v{k}];"
        labels.append(f"[v{k}]")
        pieces_map.append({"seg": i, "src": [round(a, 3), round(b, 3)], "master": [round((start + f0) / FPS, 3), round((start + f1) / FPS, 3)], "face": bool(sh.get("face")), "shot": sh["from"]})
    nv = n + (round(TAIL * FPS) if last else 0)
    fc += "".join(labels) + f"concat=n={len(labels)}:v=1:a=0[vc];[vc]" + (f"tpad=stop_mode=clone:stop_duration={TAIL}," if last else "") + f"trim=end_frame={nv},setpts=PTS-STARTPTS[vo]"
    hb = blend / 2 / FPS
    a0 = 0 if i == 0 else hb - AX / 2
    a1 = n / FPS if last else n / FPS - hb + AX / 2
    af = f"aresample=48000,atrim={a0:.4f}:{a1:.4f},asetpts=PTS-STARTPTS" + (f",afade=t=out:st={a1 - a0 - 0.09:.4f}:d=0.09,apad=whole_dur={a1 - a0 + TAIL:.4f}" if last else "")
    na = len(labels)
    p = f"{tmp}/p{i}.mp4"
    run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-ss", f"{s['from']:.3f}", "-t", f"{n / FPS + 0.3:.3f}", "-i", c["src"],
         "-filter_complex", fc, "-map", "[vo]", "-map", f"{na}:a", "-af", af, "-frames:v", str(nv),
         "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", p])
    parts.append((p, nv))

inputs = []; fv = fa = ""; pv, pa = "[0:v]", "[0:a]"; off = 0.0; total = parts[0][1]; d = blend / FPS
for p, _ in parts: inputs += ["-i", p]
for i in range(1, len(parts)):
    off += parts[i - 1][1] / FPS - d
    fv += f"{pv}[{i}:v]xfade=transition=fade:duration={d:.4f}:offset={off:.4f}[v{i}];" if blend else f"{pv}[{i}:v]concat=n=2:v=1:a=0[v{i}];"
    fa += f"{pa}[{i}:a]acrossfade=d={AX}:c1=tri:c2=tri[a{i}];"
    pv, pa = f"[v{i}]", f"[a{i}]"; total += parts[i][1] - blend
run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", fv + fa + f"{pv}null[vt];{pa}anull[at]", "-map", "[vt]", "-map", "[at]",
     "-r", str(FPS), "-frames:v", str(total), "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", c["out"]])
got = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", c["out"]], capture_output=True, text=True).stdout.strip()
json.dump(pieces_map, open(os.path.splitext(c["out"])[0] + "_pezzi.json", "w"), indent=1)
print(f"{c['id']}: pezzi={len(parts)} inquadrature={len(pieces_map)} frame attesi={total} letti={got}")
for m in pieces_map: print(f"  master {m['master'][0]:6.2f}-{m['master'][1]:6.2f}  sorgente {m['src'][0]:7.2f}-{m['src'][1]:7.2f}  {'volto' if m['face'] else 'senza volto'}")
