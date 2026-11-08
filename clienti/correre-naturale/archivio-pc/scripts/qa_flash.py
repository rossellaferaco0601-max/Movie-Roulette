"""Cerca flash e stacchi bruschi: differenza media tra fotogrammi consecutivi (su immagini piccole).

Uso: python scripts/qa_flash.py a.mp4 [b.mp4 ...]
Stampa gli stacchi netti (d > 22) e i «lampi» (due stacchi a meno di 8 fotogrammi l'uno dall'altro).
"""
import subprocess, sys

import numpy as np

W, H = 54, 96
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    d = np.abs(a[1:] - a[:-1]).mean(axis=(1, 2))
    hard = [i + 1 for i in np.where(d > 22)[0]]
    flash = [(x, y) for x, y in zip(hard, hard[1:]) if y - x < 8]
    print(f.split("/")[-1], f"{len(a) / 30:.1f}s")
    print("  stacchi:", [f"{n / 30:.2f}({d[n - 1]:.0f})" for n in hard])
    print("  lampi:", [f"{x / 30:.2f}-{y / 30:.2f}" for x, y in flash])
