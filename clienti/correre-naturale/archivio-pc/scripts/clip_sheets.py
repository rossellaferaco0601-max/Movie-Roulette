"""Contact sheet di tutte le clip dell'evento (tone mapping HDR), 12 fotogrammi per clip, 4 clip per immagine.
Uso: python scripts/clip_sheets.py work/evento/clipsheets
"""
import os, subprocess, sys, glob
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vlog_master as M

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
clips = sorted(glob.glob(os.path.join(M.ROOT, "input", "evento", "*.mov")) + glob.glob(os.path.join(M.ROOT, "input", "evento", "*.mp4")))
N, TW, TH = 12, 150, 267
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 16)
groups = [clips[i:i + 4] for i in range(0, len(clips), 4)]
for gi, g in enumerate(groups):
    sheet = Image.new("RGB", (N * TW, len(g) * (TH + 22)), "black")
    d = ImageDraw.Draw(sheet)
    for ri, path in enumerate(g):
        name = os.path.splitext(os.path.basename(path))[0]
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode().strip())
        tm = M.TONEMAP if M.is_hdr(path) else "format=yuv420p"
        for k in range(N):
            t = dur * (k + 0.5) / N
            tmp = os.path.join(out, "_t.jpg")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", path, "-frames:v", "1",
                            "-vf", f"{tm},scale={TW}:{TH}:force_original_aspect_ratio=increase,crop={TW}:{TH}", tmp], check=True)
            im = Image.open(tmp)
            sheet.paste(im, (k * TW, ri * (TH + 22) + 22))
            d.text((k * TW + 4, ri * (TH + 22) + 3), f"{t:.1f}s", fill="white", font=font)
        d.text((4, ri * (TH + 22) + 3), f"{name} ({dur:.0f}s)   ", fill="yellow", font=font)
    sheet.save(os.path.join(out, f"sheet{gi:02d}.jpg"), quality=80)
    print("sheet", gi, [os.path.basename(p) for p in g])
if os.path.exists(os.path.join(out, "_t.jpg")):
    os.remove(os.path.join(out, "_t.jpg"))
