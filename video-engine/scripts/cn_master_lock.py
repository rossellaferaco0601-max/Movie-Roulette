#!/usr/bin/env python3
"""Master «agganciato al volto» per riprese a mano (Oscar 14/11, Daniela: «ha i cambi di camera con una transizione in movimento»).
Con la camera a mano, la dissolvenza fra due pezzi mostra due inquadrature diverse sovrapposte (la persona si vede doppia).
Qui l'inquadratura segue il volto: stessa posizione e stessa grandezza in ogni fotogramma, quindi prima e dopo ogni taglio la
persona è nello stesso punto, e lo stacco è netto (a metà della vecchia dissolvenza: durata, audio, sottotitoli e grafiche non cambiano).
Uso (venv della skill effects, serve OpenCV): ../.claude/skills/effects/.venv/bin/python scripts/cn_master_lock.py work/x.json vecchio_master.mp4
config: quello di cn_master_v.py ({src, out, segments, blendFrames, broll, zooms}); l'audio si copia dal vecchio master.
Opzioni nel config: lockY (posizione verticale del volto nel quadro, default 0.27), lockZoom (ingrandimento medio, default media di zooms)."""
import json, os, subprocess, sys
import cv2, numpy as np

FPS, W, H, TAIL = 30, 1080, 1920, 0.5
c = json.load(open(sys.argv[1])); old = sys.argv[2]
segs, blend = c["segments"], c["blendFrames"]
LOCK_Y, ZOOM = c.get("lockY", 0.27), c.get("lockZoom", float(np.mean(c.get("zooms", [1.4]))))
Z_MIN, Z_MAX = c.get("lockZoomMin", 1.15), c.get("lockZoomMax", 1.8)
model = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".claude", "skills", "effects", "models", "yunet.onnx")
cap = cv2.VideoCapture(c["src"]); SW, SH = int(cap.get(3)), int(cap.get(4))
det = cv2.FaceDetectorYN.create(model, "", (SW // 2, SH // 2), 0.6)


def smooth(v, sigma):
    r = int(sigma * 3); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    return np.convolve(np.pad(v, r, mode="edge"), k, mode="valid")


# 1) volto in ogni fotogramma di ogni pezzo (il più grande vicino a quello del fotogramma prima), poi curve lisce
tracks, last = [], None
for s in segs:
    f0, n = round(s["from"] * FPS), round((s["to"] - s["from"]) * FPS)
    cap.set(cv2.CAP_PROP_POS_FRAMES, f0); raw = []
    for i in range(n):
        ok, fr = cap.read()
        if not ok: raw.append(None); continue
        _, fs = det.detect(cv2.resize(fr, (SW // 2, SH // 2)))
        best = None
        if fs is not None and len(fs):
            cand = [(float(r[0]) * 2, float(r[1]) * 2, float(r[2]) * 2, float(r[3]) * 2) for r in fs if r[3] * 2 / SH > 0.035]
            if cand:
                score = lambda b: b[2] * b[3] - (0 if last is None else 6.0 * ((b[0] + b[2] / 2 - last[0]) ** 2 + (b[1] + b[3] / 2 - last[1]) ** 2))
                b = max(cand, key=score); best = (b[0] + b[2] / 2, b[1] + b[3] / 2, b[3]); last = best
        raw.append(best)
    idx = [i for i, r in enumerate(raw) if r is not None]
    if not idx: raise SystemExit(f"nessun volto nel pezzo {s}")
    arr = np.array([[np.interp(i, idx, [raw[j][k] for j in idx]) for k in range(3)] for i in range(n)])
    tracks.append((f0, n, smooth(arr[:, 0], 7), smooth(arr[:, 1], 7), smooth(arr[:, 2], 22), len(idx) / n))
    print(f"pezzo {s['from']:.2f}-{s['to']:.2f}: volto trovato nel {100 * len(idx) / n:.0f}% dei fotogrammi, altezza media {np.mean(arr[:, 2]) / SH:.3f}")
# grandezza del volto nel quadro: quella che dà in media l'ingrandimento ZOOM
FH = ZOOM * float(np.median(np.concatenate([t[4] for t in tracks]))) / SH

# 2) piano dei fotogrammi: stacco netto a metà della vecchia dissolvenza, stessa durata del vecchio master
starts, cur = [], 0
for i, t in enumerate(tracks):
    st = 0 if i == 0 else cur - blend; starts.append(st); cur = st + t[1]
total = cur + round(TAIL * FPS)
bounds = [0] + [starts[i] + blend // 2 for i in range(1, len(tracks))] + [cur]
brolls = [(round(b["at"] * FPS), round((b["at"] + b["dur"]) * FPS), b) for b in c.get("broll", [])]

# 3) fotogrammi → ffmpeg (stessa pulizia di cn_master_v.py), audio dal vecchio master
tmpv = c["out"].replace(".mp4", "_lock_tmp.mp4")
LOOK = c.get("vf", "hqdn3d=2:1.5:4:3,cas=0.55,eq=contrast=1.06:saturation=1.08:gamma=1.02")
enc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-vf", LOOK + ",setsar=1", "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", tmpv], stdin=subprocess.PIPE)
bcaps = {}; out_frame = None; n_out = 0; zs = []
for i, (f0, n, cx, cy, fh, _) in enumerate(tracks):
    a, b = bounds[i], bounds[i + 1]
    cap.set(cv2.CAP_PROP_POS_FRAMES, f0 + (a - starts[i]))
    for o in range(a, b):
        ok, fr = cap.read(); k = o - starts[i]
        if not ok: fr = last_fr
        last_fr = fr
        z = float(np.clip(FH * SH / fh[k], Z_MIN, Z_MAX)); zs.append(z)
        w, h = SW / z, SH / z
        x = float(np.clip(cx[k] - w / 2, 0, SW - w)); y = float(np.clip(cy[k] - LOCK_Y * h, 0, SH - h))
        M = np.array([[W / w, 0, -x * W / w], [0, H / h, -y * H / h]], np.float32)
        out_frame = cv2.warpAffine(fr, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
        for ba, bb, bd in brolls:      # ripresa di copertura: stacco netto anche qui
            if ba <= o < bb:
                if id(bd) not in bcaps:
                    bc = cv2.VideoCapture(bd["file"]); bc.set(cv2.CAP_PROP_POS_MSEC, bd["from"] * 1000); bcaps[id(bd)] = bc
                okb, bf = bcaps[id(bd)].read()
                if okb:
                    sc = max(W / bf.shape[1], H / bf.shape[0]); bf = cv2.resize(bf, None, fx=sc, fy=sc, interpolation=cv2.INTER_LANCZOS4)
                    oy, ox = (bf.shape[0] - H) // 2, (bf.shape[1] - W) // 2; out_frame = bf[oy:oy + H, ox:ox + W]
        enc.stdin.write(np.ascontiguousarray(out_frame).tobytes()); n_out += 1
for _ in range(total - n_out): enc.stdin.write(np.ascontiguousarray(out_frame).tobytes())     # coda: ultimo fotogramma fermo
enc.stdin.close(); enc.wait()
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmpv, "-i", old, "-map", "0:v", "-map", "1:a", "-c", "copy", "-movflags", "+faststart", c["out"]], check=True)
os.remove(tmpv)
print(f"{c['id']}: {total} fotogrammi ({total / FPS:.2f} s), stacchi netti ai fotogrammi {bounds[1:-1]}, ingrandimento {min(zs):.2f}–{max(zs):.2f} (medio {np.mean(zs):.2f}), volto alto {FH:.3f} del quadro")
