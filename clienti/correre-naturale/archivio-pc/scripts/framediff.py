"""Stacchi reali di un video: differenza tra fotogrammi consecutivi, salvata in work/framediff_<nome>.npy.

Uso: python scripts/framediff.py nome video.mp4
"""
import os, subprocess, sys

import numpy as np

W, H = 64, 36
name, video = sys.argv[1], sys.argv[2]
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps=30,scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                     stdout=subprocess.PIPE)
prev, out = None, []
while True:
    b = p.stdout.read(W * H)
    if len(b) < W * H:
        break
    a = np.frombuffer(b, np.uint8).astype(np.float32)
    out.append(0.0 if prev is None else float(np.abs(a - prev).mean()))
    prev = a
d = np.array(out, np.float32)
np.save(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "work", f"framediff_{name}.npy"), d)
print(name, len(d), "stacchi:", [round(i / 30, 2) for i in np.where(d > 18)[0]])
