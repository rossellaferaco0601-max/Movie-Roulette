"""Copertina da un fotogramma con il volto libero + titolo del reel.

Il titolo sta sotto il volto e dentro l'area 3:4 della griglia Instagram (y 240-1680).
Uso: python scripts/make_covers.py R1 [R2 ...] → output/<id>_copertina.jpg
"""
import json, os, re, subprocess, sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_engine import (CREAM, FPS, GREEN, GREEN_D, ROOT, W, _cover_word, draw_text, font, rrect)  # noqa: E402
from reels_longevita import REELS  # noqa: E402

for key in sys.argv[1:] or list(REELS):
    r = REELS[key]
    work = os.path.join(ROOT, "work", r["id"])
    meta = json.load(open(os.path.join(work, "meta.json"), encoding="utf-8"))
    # fotogramma scelto a mano dal sorgente 4K (Ross 3/11: Daniele sempre a fuoco e in alta definizione)
    from reel_engine import face_cx
    V4K = "C:/Users/roxfe/Documents/ReelStudio/progetti/20261102-105705-ho-letto-5-studi-sulla-longevita-la-cors/video4k.mp4"
    t = r["cover_src"]
    x = min(3840 - 1215, max(0, int(face_cx(t) * 3840 - 607)))
    raw = os.path.join(work, "cover_raw.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", V4K, "-frames:v", "1", "-vf",
                    f"crop=1215:2160:{x}:0,scale=1080:1920:flags=lanczos", raw], check=True)
    im = Image.open(raw).convert("RGBA")
    lines = r["cover"]["lines"]
    panel, pad = rrect((1000, 190 + 128 * len(lines)), 44, CREAM + (248,))
    cy = 1330
    im.alpha_composite(panel, (W // 2 - panel.width // 2, cy - panel.height // 2))
    from reel_engine import pill
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
    out = os.path.join(ROOT, "output", f"{r['id']}_copertina.jpg")
    im.convert("RGB").save(out, quality=92)
    print(key, out, f"(fotogramma a {t:.1f}s)")
