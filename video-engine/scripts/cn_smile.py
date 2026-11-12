#!/usr/bin/env python3
"""Fotogrammi da copertina: cerca nel master i momenti in cui chi parla SORRIDE, ha gli occhi aperti, guarda in camera e non ha la
bocca spalancata (Ross 12/11: «facce di Daniele non troppo strane, in cui sorride»). Usa i blendshape del volto di MediaPipe.
Uso (venv della skill effects): ../.claude/skills/effects/.venv/bin/python scripts/cn_smile.py public/x/master.mp4 [inizio_s] [fine_s]
Stampa i 6 fotogrammi migliori (ben distanziati) con il punteggio; scrive <master>_sorriso.json."""
import sys, os, json, cv2, numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision
path = sys.argv[1]; t0 = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5; t1 = float(sys.argv[3]) if len(sys.argv) > 3 else 1e9
model = os.path.join(os.path.dirname(__file__), "..", "work", "models", "face_landmarker.task")
fl = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=mpp.BaseOptions(model_asset_path=model), output_face_blendshapes=True, output_facial_transformation_matrixes=True, num_faces=1))
cap = cv2.VideoCapture(path); n = int(cap.get(7)); res = []; i = 0; prev = None
while True:
    ok, fr = cap.read()
    if not ok: break
    t = i / 30
    g = cv2.resize(cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY), (96, 170)).astype(np.int16)
    move = 0.0 if prev is None else float(np.mean(np.abs(g - prev))); prev = g
    if i % 4 == 0 and t0 <= t <= min(t1, n / 30 - 1.2):
        small = cv2.resize(fr, (540, 960))
        r = fl.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(small, cv2.COLOR_BGR2RGB)))
        if r.face_blendshapes:
            b = {c.category_name: c.score for c in r.face_blendshapes[0]}
            m = np.array(r.facial_transformation_matrixes[0])
            yaw = abs(float(np.degrees(np.arctan2(m[0, 2], m[2, 2])))); pitch = abs(float(np.degrees(np.arcsin(-m[1, 2]))))
            smile = (b["mouthSmileLeft"] + b["mouthSmileRight"]) / 2; blink = max(b["eyeBlinkLeft"], b["eyeBlinkRight"]); jaw = b["jawOpen"]
            odd = max(b.get("mouthPucker", 0), b.get("mouthFunnel", 0), b.get("browDownLeft", 0), b.get("mouthFrownLeft", 0), b.get("eyeSquintLeft", 0) * 0.5)
            score = smile - 1.3 * max(0, blink - 0.25) - 0.9 * max(0, jaw - 0.22) - 0.02 * max(0, yaw - 8) - 0.02 * max(0, pitch - 10) - 0.6 * odd - 0.02 * move
            res.append((round(score, 3), i, round(smile, 2), round(blink, 2), round(jaw, 2), round(yaw, 1)))
    i += 1
res.sort(reverse=True); best = []
for s in res:
    if all(abs(s[1] - b[1]) > 45 for b in best): best.append(s)
    if len(best) == 6: break
json.dump([{"frame": b[1], "score": b[0], "smile": b[2], "blink": b[3], "jaw": b[4], "yaw": b[5]} for b in best], open(os.path.splitext(path)[0] + "_sorriso.json", "w"))
print(os.path.basename(path), " ".join(f"f{b[1]}(p{b[0]} sorr{b[2]} occhi{b[3]} bocca{b[4]})" for b in best))
