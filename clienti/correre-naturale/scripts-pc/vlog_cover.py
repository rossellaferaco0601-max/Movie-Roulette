"""Copertina del vlog: fotogramma dell'evento con il volto libero + pannello crema sotto (stile ytcn38_covers)."""
import os, re, subprocess, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_engine import CREAM, GREEN, ROOT, W, _cover_word, pill, rrect  # noqa: E402
import vlog_master as M  # noqa: E402
clip, t = (sys.argv[1], float(sys.argv[2])) if len(sys.argv) > 2 else ("IMG_0620", 98.0)
raw = os.path.join(ROOT, "work", "evento", "cover_raw.png")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", os.path.join(ROOT, "input", "evento", clip + ".mov"), "-frames:v", "1",
                "-vf", "scale=1080:1920:flags=lanczos," + M.TONEMAP + "," + M.GRADE_FLARE, raw], check=True)   # 5/11 v3: le clip sono HDR → tone mapping
im = Image.open(raw).convert("RGBA")
kicker, lines = "24 OTTOBRE · VICENZA · DAL VIVO", ["Il workshop", "{CORRERE NATURALE}"]
panel, pad = rrect((1000, 190 + 128 * len(lines)), 44, CREAM + (248,))
cy = 1330
im.alpha_composite(panel, (W // 2 - panel.width // 2, cy - panel.height // 2))
kp = pill(kicker, size=48, fill=GREEN, col=CREAM, weight="Black")
im.alpha_composite(kp, (W // 2 - kp.width // 2, cy - panel.height // 2 - kp.height // 2 + 30))
y = cy - (128 * len(lines)) // 2 + 70
for li, line in enumerate(lines):
    parts = [_cover_word(m.group(1) or m.group(2), bool(m.group(1))) for m in re.finditer(r"\{([^}]+)\}|(\S+)", line)]
    total = sum(p.width for p in parts) + 18 * (len(parts) - 1)
    x = W // 2 - total // 2
    for p in parts:
        im.alpha_composite(p, (x, y + li * 128 - p.height // 2))
        x += p.width + 18
out = os.path.join(ROOT, "output", "evento", "VLOG_workshop_copertina.jpg")
im.convert("RGB").save(out, quality=92)
print(out)
