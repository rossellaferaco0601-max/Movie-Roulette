"""Copertine dei reel YTCN 38: fotogramma 4K con il volto libero + titolo sotto il volto.

Uso: python scripts/ytcn38_covers.py Y1 [Y2 ...] → output/ytcn38/<id>_copertina.jpg
"""
import os, re, subprocess, sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import reel_engine as E  # noqa: E402
from reel_engine import CREAM, GREEN, ROOT, W, _cover_word, pill, rrect  # noqa: E402
from reels_ytcn38 import REELS  # noqa: E402
from ytcn38_build import WDIR  # noqa: E402  (punta proxy e audio al nuovo video)

V4K = "C:/Users/roxfe/Documents/ReelStudio/progetti/cn-ytcn38-src/video4k.mp4"
OUT = os.path.join(ROOT, "output", "ytcn38")
os.makedirs(OUT, exist_ok=True)

for key in sys.argv[1:] or list(REELS):
    r = REELS[key]
    work = os.path.join(WDIR, r["id"])
    os.makedirs(work, exist_ok=True)
    t = r["cover_src"]
    x = min(3840 - 1215, max(0, int(E.face_cx(t) * 3840 - 607)))
    raw = os.path.join(work, "cover_raw.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", V4K, "-frames:v", "1", "-vf",
                    f"crop=1215:2160:{x}:0,scale=1080:1920:flags=lanczos", raw], check=True)
    im = Image.open(raw).convert("RGBA")
    lines = r["cover"]["lines"]
    panel, pad = rrect((1000, 190 + 128 * len(lines)), 44, CREAM + (248,))
    cy = 1330
    im.alpha_composite(panel, (W // 2 - panel.width // 2, cy - panel.height // 2))
    kp = pill(r["cover"]["kicker"], size=48, fill=GREEN, col=CREAM, weight="Black")
    im.alpha_composite(kp, (W // 2 - kp.width // 2, cy - panel.height // 2 - kp.height // 2 + 30))
    y = cy - (128 * len(lines)) // 2 + 70
    for li, line in enumerate(lines):
        parts = [_cover_word(m.group(1) or m.group(2), bool(m.group(1)))
                 for m in re.finditer(r"\{([^}]+)\}|(\S+)", line)]
        total = sum(p.width for p in parts) + 18 * (len(parts) - 1)
        x = W // 2 - total // 2
        for p in parts:
            im.alpha_composite(p, (x, y + li * 128 - p.height // 2))
            x += p.width + 18
    out = os.path.join(OUT, f"{r['id']}_copertina.jpg")
    im.convert("RGB").save(out, quality=92)
    print(key, out, f"(fotogramma a {t:.1f}s)")
