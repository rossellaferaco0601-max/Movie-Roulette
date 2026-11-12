#!/usr/bin/env python3
"""Inquadrature e volto, fotogramma per fotogramma, di un sorgente GIÀ montato (video YouTube con stacchi e cambi di zoom).
Serve a scripts/cn_master.py per dare a ogni inquadratura lo stesso ritaglio sul volto e ammorbidire gli stacchi del sorgente.
Uso (venv della skill effects):  ../.claude/skills/effects/.venv/bin/python scripts/cn_shots.py public/x/src.mp4 work/x_shots.json
Scrive {fps, size, faces: [[x, y, w, h] | null per fotogramma, in pixel del sorgente], cuts: [indice del primo fotogramma di ogni nuova inquadratura]}."""
import json, os, subprocess, sys
import cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
FPS, AW, AH = 30, 960, 540
pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip().split(",")
SW, SH = int(pr[0]), int(pr[1]); k = SW / AW
model = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "effects", "models", "yunet.onnx")
det = cv2.FaceDetectorYN.create(model, "", (AW, AH), 0.6)
p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-i", src, "-vf", f"fps={FPS},scale={AW}:{AH}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE, bufsize=AW * AH * 3 * 8)
faces, diffs, prev = [], [], None
while True:
    b = p.stdout.read(AW * AH * 3)
    if len(b) < AW * AH * 3: break
    fr = np.frombuffer(b, np.uint8).reshape(AH, AW, 3)
    g = cv2.resize(cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY), (160, 90)).astype(np.int16)
    diffs.append(0.0 if prev is None else float(np.mean(np.abs(g - prev)))); prev = g
    _, fs = det.detect(fr)
    f = None
    if fs is not None and len(fs):
        fs = [r for r in fs if r[3] / AH > 0.10]          # solo volti grandi (mani e logo della maglietta ingannano il rilevatore)
        if fs:
            r = max(fs, key=lambda r: r[2] * r[3]); f = [round(float(v) * k, 1) for v in r[:4]]
    faces.append(f)
n = len(faces); cuts = []
for i in range(2, n - 1):
    near = sorted(diffs[max(1, i - 8):i] + diffs[i + 1:i + 9]); med = near[len(near) // 2] if near else 0
    jump = False
    if faces[i] and faces[i - 1]:
        a, b2 = faces[i - 1], faces[i]
        jump = abs(b2[3] / a[3] - 1) > 0.05 or abs((b2[0] + b2[2] / 2) - (a[0] + a[2] / 2)) > 0.012 * SW or abs(b2[1] - a[1]) > 0.02 * SH
    if (diffs[i] > 4.0 and diffs[i] > 3.0 * max(med, 0.6)) or (jump and diffs[i] > 2.5 * max(med, 0.6)):
        if not cuts or i - cuts[-1] > 3: cuts.append(i)
json.dump({"fps": FPS, "size": [SW, SH], "faces": faces, "cuts": cuts, "diffs": [round(d, 2) for d in diffs]}, open(out, "w"))
print(f"{os.path.basename(src)}: {n} fotogrammi, {sum(1 for f in faces if f)} con volto, {len(cuts)} stacchi")
print(" ".join(f"{c / FPS:.2f}" for c in cuts))
