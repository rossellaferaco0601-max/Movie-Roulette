#!/usr/bin/env python3
"""Master 1080x1920 da un sorgente GIÀ verticale (telefono): punch-in alternato centrato sul volto, xfade tra i pezzi,
B-roll video (solo immagine) sopra un intervallo, coda muta di 0,5 s. Uso: python3 scripts/cn_master_v.py config.json
config: {id, src, out, faceY, faceX, zooms:[..], blendFrames, segments:[{from,to}], broll:[{file, from, at, dur}]}  (at = secondi del master)
"""
import json, os, subprocess, sys
FPS, W, H, TAIL = 30, 1080, 1920, 0.5
AX = 0.04  # micro-incrocio dell'audio ai tagli
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2500:]); raise SystemExit("ffmpeg fallito")
c = json.load(open(sys.argv[1]))
if "size" in c: W, H = c["size"]  # es. [1920, 1080] per la versione lunga orizzontale
tmp = os.path.join(os.path.dirname(c["out"]), f"tmp_{c['id']}"); os.makedirs(tmp, exist_ok=True)
parts = []
for i, s in enumerate(c["segments"]):
    z = c["zooms"][i % len(c["zooms"])]
    w, h = W / z, H / z
    x = min(max(0, c["faceX"] * W - w / 2), W - w); y = min(max(0, c["faceY"] * H - h * 0.27), H - h)
    n = round((s["to"] - s["from"]) * FPS); last = i == len(c["segments"]) - 1
    nv = n + (round(TAIL * FPS) if last else 0)
    # pulizia del girato da telefono: rumore via, ingrandimento lanczos, nitidezza adattiva, contrasto e colore leggeri
    LOOK = c.get("vf", "cas=0.55,eq=contrast=1.06:saturation=1.08:gamma=1.02"); DN = "" if "vf" in c else "hqdn3d=2:1.5:4:3,"
    vf = f"{DN}crop={int(w)}:{int(h)}:{int(x)}:{int(y)},scale={W}:{H}:flags=lanczos+accurate_rnd,{LOOK},fps={FPS},setsar=1" + (f",tpad=stop_mode=clone:stop_duration={TAIL}" if last else "")
    # audio delle testimonianze: toccare il meno possibile
    VOICE = "highpass=f=90,afftdn=nr=10:nf=-45:tn=1,"  # solo pulizia leggera del brusio: niente gate, compressore o equalizzazione (Ross 9/11: «assordante»)
    # taglio audio netto a metà dell'incrocio video (micro-incrocio di AX s): l'incrocio lungo si mangiava attacchi e code delle parole
    VOICE = c.get("voice", VOICE)
    hb = c["blendFrames"] / 2 / FPS
    a0 = 0 if i == 0 else hb - AX / 2
    a1 = n / FPS if last else n / FPS - hb + AX / 2
    af = f"aresample=48000,{VOICE}atrim={a0:.4f}:{a1:.4f},asetpts=PTS-STARTPTS" + (f",afade=t=out:st={a1-a0-0.08:.4f}:d=0.08,apad=whole_dur={a1-a0+TAIL:.4f}" if last else "")
    p = f"{tmp}/p{i}.mp4"
    # ripresa: un pezzo già completo non si rifà
    pr = subprocess.run(["ffprobe","-v","error","-select_streams","v","-show_entries","stream=nb_frames","-of","csv=p=0",p], capture_output=True, text=True) if os.path.exists(p) else None
    if pr and pr.stdout.strip() == str(nv): parts.append((p, nv)); continue
    run(["ffmpeg","-loglevel","error","-y","-ss",f"{s['from']:.3f}","-i",c["src"],"-t",f"{nv/FPS+0.2:.4f}","-vf",vf,"-af",af,"-frames:v",str(nv),
         "-c:v","libx264","-preset","fast","-crf","14","-pix_fmt","yuv420p","-c:a","pcm_s16le",p])
    parts.append((p, nv))
d = c["blendFrames"] / FPS
inputs = []; fv = fa = ""; pv, pa = "[0:v]", "[0:a]"; off = 0.0; total = parts[0][1]
for p, _ in parts: inputs += ["-i", p]
for i in range(1, len(parts)):
    off += parts[i-1][1] / FPS - d
    fv += f"{pv}[{i}:v]xfade=transition=fade:duration={d:.4f}:offset={off:.4f}[v{i}];"; fa += f"{pa}[{i}:a]acrossfade=d={AX}:c1=tri:c2=tri[a{i}];"
    pv, pa = f"[v{i}]", f"[a{i}]"; total += parts[i][1] - c["blendFrames"]
k = len(parts)
for j, b in enumerate(c.get("broll", [])):
    inputs += ["-ss", f"{b['from']:.3f}", "-t", f"{b['dur']:.3f}", "-i", b["file"]]
    fv += (f"[{k+j}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},format=rgba,fade=t=in:st=0:d=0.2:alpha=1,fade=t=out:st={b['dur']-0.2:.3f}:d=0.2:alpha=1,"
           f"setpts=PTS-STARTPTS+{b['at']:.3f}/TB[b{j}];{pv}[b{j}]overlay=enable='between(t,{b['at']:.3f},{b['at']+b['dur']:.3f})':eof_action=pass[vb{j}];")
    pv = f"[vb{j}]"
fc = fv + fa + f"{pv}null[vo];{pa}anull[ao]"
run(["ffmpeg","-loglevel","error","-y",*inputs,"-filter_complex",fc,"-map","[vo]","-map","[ao]","-r",str(FPS),"-frames:v",str(total),
     "-c:v","libx264","-preset","fast","-crf","14","-pix_fmt","yuv420p","-c:a","aac","-b:a","256k","-movflags","+faststart",c["out"]])
print(c["id"], "frame attesi", total)
