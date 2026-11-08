"""Volto libero (regola di Ross, 5/11/2026): zona del volto nel tempo e grafiche che la toccano.
Uso: python scripts/qa_volto.py <pid> <mp4> [passo_s]
Rileva il volto (Haar) ogni passo_s sul montato e, per ogni effetto del project.json con una y, stampa la zona del
volto nella sua finestra e se la grafica (che parte da y) la copre. Le scritte dietro la persona sono escluse."""
import json, subprocess, sys

import cv2, numpy as np

RS = "C:/Users/roxfe/Documents/ReelStudio"
pid, mp4 = sys.argv[1], sys.argv[2]
step = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
p = json.load(open(f"{RS}/progetti/{pid}/project.json", encoding="utf-8"))
total = sum((c["e"] - c["s"]) / (c.get("speed") or 1) for c in p["cuts"])
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
faces = []   # (t, y0, y1, x0, x1) in frazioni del fotogramma
t = 0.0
while t < total:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", mp4, "-frames:v", "1", "-vf", "scale=270:480", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                         capture_output=True).stdout
    if len(raw) == 270 * 480:
        im = np.frombuffer(raw, np.uint8).reshape(480, 270)
        det = casc.detectMultiScale(im, 1.1, 4, minSize=(40, 40))
        if len(det):
            x, y, w, h = max(det, key=lambda d: d[2] * d[3])
            faces.append((t, y / 480, (y + h) / 480, x / 270, (x + w) / 270))
    t += step
print(f"{pid}: {len(faces)} volti su {int(total / step)} campioni; volto y1 max = {max(f[2] for f in faces):.2f}  y0 min = {min(f[1] for f in faces):.2f}")
BEHIND = {"behindTitle", "fxClip", "obj", "zoom", "sfx"}
for e in p["effects"]:
    y = e.get("props", {}).get("y")
    if y is None and e.get("position") == "center":
        y = 0.40   # effetti «center» (pills, checklist): top a 760 px
    if e["type"] in BEHIND or y is None:
        continue
    win = [f for f in faces if e["start"] - 0.1 <= f[0] <= e["start"] + e["duration"]]
    if not win:
        continue
    y1 = max(f[2] for f in win)
    flag = "COPRE" if y < y1 + 0.02 else ("stretto" if y < y1 + 0.05 else "ok")
    print(f"  {e['type']:<12} {e['start']:6.2f}-{e['start'] + e['duration']:6.2f}  y={y:.2f}  volto fino a {y1:.2f}  -> {flag}")
