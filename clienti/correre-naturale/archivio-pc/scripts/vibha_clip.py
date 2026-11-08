"""Clip con un effetto Vibha (51 effetti face-tracking) sullo stesso taglio 9:16 del reel.

Uso: python scripts/vibha_clip.py <pid> <nome> <inizio_src> <durata> <effetto> [opzioni fx.py…]
Ritaglia il 4K a 1080×1920 con lo stesso centro volto del taglio del progetto (cuts.fx), applica l'effetto con
fx.py e salva progetti/<pid>/vibha/<nome>.mp4 (senza audio). Nel reel va messo come effetto `fxClip`
{src: /progetti/<pid>/vibha/<nome>.mp4} alla stessa durata, allo stesso istante.
"""
import json, os, subprocess, sys

RS = "C:/Users/roxfe/Documents/ReelStudio"
SRC = f"{RS}/progetti/cn-ytcn38-src/video4k.mp4"
VENV = "C:/Users/roxfe/.claude/skills/effects/.venv/Scripts/python.exe"
FXPY = "C:/Users/roxfe/.claude/skills/effects/scripts/fx.py"
SRCW = 1920 * 1920 / 1080   # larghezza del 4K scalato a 1920 di altezza

pid, name, t0, dur, fx = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
opts = sys.argv[6:]
proj = json.load(open(f"{RS}/progetti/{pid}/project.json", encoding="utf-8"))
cut = next((c for c in proj["cuts"] if c["s"] - 0.01 <= t0 <= c["e"] + 0.01), proj["cuts"][0])
x = round(cut.get("fx", 0.5) * (SRCW - 1080))
out = f"{RS}/progetti/{pid}/vibha"
os.makedirs(out, exist_ok=True)
base = f"{out}/{name}_base.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}", "-i", SRC, "-vf", f"scale=-2:1920,crop=1080:1920:{x}:0,fps=30",
                "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", "-an", base], check=True)
subprocess.run([VENV, FXPY, fx, base, f"{out}/{name}.mp4", "--start", "0", "--end", f"{dur:.2f}", *opts], check=True)
os.remove(base)
print(f"{pid}/vibha/{name}.mp4  src {t0:.2f}+{dur:.2f}s  crop x={x}  effetto={fx}")
