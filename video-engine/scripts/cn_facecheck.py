#!/usr/bin/env python3
"""Controllo «le grafiche non coprono mai il volto»: misura fin dove arriva il mento nel master (YuNet, un fotogramma ogni STEP)
e lo confronta con il bordo alto della zona grafiche. Uso (venv della skill effects):
  ../.claude/skills/effects/.venv/bin/python scripts/cn_facecheck.py public/x/master.mp4 [bordo_grafiche=0.44]
Esce con codice 1 se il mento supera il bordo."""
import sys, os, cv2
STEP = 5
path = sys.argv[1]; top = float(sys.argv[2]) if len(sys.argv) > 2 else 0.44
model = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "effects", "models", "yunet.onnx")
cap = cv2.VideoCapture(path); W, H = int(cap.get(3)), int(cap.get(4))
det = cv2.FaceDetectorYN.create(model, "", (W // 2, H // 2), 0.6)
worst, worst_t, n, i, bad = 0.0, 0.0, 0, 0, 0
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % STEP == 0:
        _, faces = det.detect(cv2.resize(fr, (W // 2, H // 2)))
        if faces is not None and len(faces):
            f = max(faces, key=lambda r: r[2] * r[3])  # il volto più grande
            chin = (f[1] + f[3]) * 2 / H; n += 1
            if chin > top: bad += 1
            if chin > worst: worst, worst_t = chin, i / 30
    i += 1
print(f"{os.path.basename(path)}: mento al massimo a {worst:.3f} dell'altezza (a {worst_t:.1f} s), grafiche da {top:.3f}; fotogrammi oltre il bordo: {bad}/{n}")
sys.exit(1 if bad else 0)
