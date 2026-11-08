"""Controllo visivo: 8 fotogrammi per reel + verifica automatica volto libero.

Uso: python scripts/qa_frames.py R1 [R2 ...] → work/qa/<id>_sheet.jpg
"""
import json, os, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_engine import FACE_BOX, FPS, ROOT  # noqa: E402
from reels_longevita import REELS  # noqa: E402


def overlaps(a, b):
    return not (a[2] <= b[0] or b[2] <= a[0] or a[3] <= b[1] or b[3] <= a[1])


for key in sys.argv[1:] or list(REELS):
    r = REELS[key]
    meta = json.load(open(os.path.join(ROOT, "work", r["id"], "meta.json"), encoding="utf-8"))
    # intervalli di uscita in cui si vede il volto di Daniele
    face, f = [], 0
    for p in meta["pieces"]:
        if p["kind"] == "face":
            face.append((f / FPS, (f + p["n"]) / FPS))
        f += p["n"]
    problems = []
    for kind, t0, t1, box in meta["log"]:
        for a, b in face:
            ov = min(t1, b) - max(t0, a)
            if ov > 0 and overlaps(box, FACE_BOX):
                if kind != "big" or ov > 1.5:
                    problems.append(f"{kind} {t0:.1f}-{t1:.1f}s copre il volto per {ov:.1f}s")
    print(f"== {key}: volto visibile {sum(b - a for a, b in face):.1f}s, problemi volto: {problems or 'nessuno'}")
    # 8 fotogrammi: copertina, 6 momenti grafici distribuiti, CTA
    vt = meta["vframes"] / FPS
    marks = sorted({round(t0 + min(0.6, (t1 - t0) / 2), 2) for kind, t0, t1, _ in meta["log"] if kind != "cover"})
    step = max(1, len(marks) // 6)
    times = [1.2] + marks[::step][:6] + [vt + 2.5]
    while len(times) < 8:
        times.insert(-1, vt * len(times) / 9)
    qa = os.path.join(ROOT, "work", "qa", r["id"])
    os.makedirs(qa, exist_ok=True)
    mp4 = os.path.join(ROOT, "output", r["id"] + ".mp4")
    for i, t in enumerate(sorted(times)):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", mp4, "-frames:v", "1",
                        "-vf", "scale=360:640", os.path.join(qa, f"f{i:02d}.jpg")], check=True)
    sheet = os.path.join(ROOT, "work", "qa", f"{r['id']}_sheet.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(qa, "f%02d.jpg"), "-vf", "tile=8x1", sheet],
                   check=True)
    print("   ", sheet, " tempi:", ", ".join(f"{t:.1f}" for t in sorted(times)))
