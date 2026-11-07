#!/usr/bin/env python3
"""Costruisce il master 1080x1920 di ogni reel: ritaglio 9:16 sul volto, punch-in alternato,
dissolvenze xfade/acrossfade di N fotogrammi tra i pezzi, audio ricodificato una volta sola.
Uso: python3 scripts/cn_master.py work/ytcn51/reels.json public/ytcn51/masters [R1-fiatone ...]
"""
import json, os, subprocess, sys, math

FPS = 30
SRC_W, SRC_H = 3840, 2160
OUT_W, OUT_H = 1080, 1920

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-2000:]); raise SystemExit(f"ffmpeg fallito: {' '.join(cmd[:6])}…")

def crop_filter(zoom: float):
    # altezza visibile = SRC_H/zoom, larghezza = altezza*9/16; origine zoom al 35 % dell'altezza
    h = SRC_H / zoom
    w = h * 9 / 16
    x = (SRC_W - w) / 2
    y = (SRC_H * 0.35) - h * 0.35
    y = max(0, min(SRC_H - h, y))
    return f"crop={int(w)}:{int(h)}:{int(x)}:{int(y)},scale={OUT_W}:{OUT_H}:flags=lanczos,fps={FPS},setsar=1"

# schede grafiche del sorgente (viola/verdi, non brand): coperte con un fermo immagine di Daniele + lento zoom
CARDS = [(148.8, 162.3, 148.3), (180.2, 189.8, 179.6), (205.0, 219.3, 204.65)]  # (inizio, fine, fotogramma da congelare)

def freeze_inputs(src, seg, zoom, n, tmp, i):
    """Per ogni scheda che cade nel pezzo: png del fotogramma prima della scheda + filtro overlay con zoompan."""
    extra_in, chains, k = [], [], 0
    for (a, b, t_img) in CARDS:
        lo, hi = max(a, seg["from"]), min(b, seg["to"])
        if hi - lo < 0.3: continue
        t_img = max(seg["from"], t_img)
        png = os.path.join(tmp, f"frz{i}_{k}.png")
        run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t_img:.3f}", "-i", src, "-frames:v", "1", "-vf", crop_filter(zoom).replace(f",fps={FPS}", ""), png])
        t0, t1 = lo - seg["from"], hi - seg["from"]
        nf = int(round((t1 - t0) * FPS)) + 2
        extra_in += ["-loop", "1", "-framerate", str(FPS), "-t", f"{(nf + 2) / FPS:.4f}", "-i", png]
        chains.append((t0, t1, nf))
        k += 1
    return extra_in, chains

def build(reel, src_dir, out_dir):
    rid, segs, blend = reel["id"], reel["segments"], reel["blendFrames"]
    src = os.path.join(src_dir, reel["src"])
    tmp = os.path.join(out_dir, "tmp", rid); os.makedirs(tmp, exist_ok=True)
    parts = []
    for i, s in enumerate(segs):
        n = round((s["to"] - s["from"]) * FPS)
        zoom = 1.0 if i % 2 == 0 else 1.08
        p = os.path.join(tmp, f"p{i}.mp4")
        extra_in, chains = freeze_inputs(src, s, zoom, n, tmp, i)
        fc = f"[0:v]{crop_filter(zoom)}[v0];"
        prev = "[v0]"
        for j, (t0, t1, nf) in enumerate(chains):
            # fermo immagine con zoom lento 1.00 -> 1.06, sovrapposto solo durante la scheda
            fc += (f"[{j + 1}:v]scale=2160:3840,zoompan=z='1+0.06*on/{nf}':d=1:x='iw/2-(iw/zoom/2)':y='ih*0.35-(ih/zoom*0.35)':s={OUT_W}x{OUT_H}:fps={FPS},"
                   f"setpts=PTS-STARTPTS+{t0:.4f}/TB[f{j}];{prev}[f{j}]overlay=enable='between(t,{t0:.4f},{t1:.4f})':eof_action=pass[v{j + 1}];")
            prev = f"[v{j + 1}]"
        fc = fc.rstrip(";")
        run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{s['from']:.3f}", "-i", src, *extra_in, "-t", f"{n / FPS:.4f}",
             "-filter_complex", fc, "-map", prev, "-map", "0:a", "-frames:v", str(n), "-af", f"aresample=48000,atrim=0:{n / FPS:.4f},apad=whole_dur={n / FPS:.4f}",
             "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", p])
        parts.append((p, n))
    out = os.path.join(out_dir, f"{rid}.mp4")
    if len(parts) == 1:
        run(["ffmpeg", "-loglevel", "error", "-y", "-i", parts[0][0], "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out])
        total = parts[0][1]
    else:
        d = blend / FPS
        inputs = []
        for p, _ in parts: inputs += ["-i", p]
        fv, fa = "", ""
        prev_v, prev_a = "[0:v]", "[0:a]"
        offset = 0.0
        total = parts[0][1]
        for i in range(1, len(parts)):
            offset += parts[i - 1][1] / FPS - d
            vo = f"[v{i}]"; ao = f"[a{i}]"
            fv += f"{prev_v}[{i}:v]xfade=transition=fade:duration={d:.4f}:offset={offset:.4f}{vo};"
            fa += f"{prev_a}[{i}:a]acrossfade=d={d:.4f}:c1=tri:c2=tri{ao};"
            prev_v, prev_a = vo, ao
            total += parts[i][1] - blend
        fc = (fv + fa).rstrip(";")
        run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", fc, "-map", prev_v, "-map", prev_a,
             "-r", str(FPS), "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out])
    # verifica durata
    pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", out], capture_output=True, text=True)
    got = int(pr.stdout.strip() or 0)
    print(f"{rid}: pezzi={len(parts)} frame attesi={total} letti={got} {'OK' if abs(got-total)<=1 else 'DIFF!'}")
    return {"id": rid, "frames": total, "read": got}

if __name__ == "__main__":
    reels = json.load(open(sys.argv[1]))
    out_dir = sys.argv[2]; os.makedirs(out_dir, exist_ok=True)
    only = set(sys.argv[3:])
    meta = [build(r, "public", out_dir) for r in reels if not only or r["id"] in only]
    json.dump(meta, open(os.path.join(out_dir, "masters.json"), "w"), indent=1)
