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
serie = []
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % STEP == 0:
        _, faces = det.detect(cv2.resize(fr, (W // 2, H // 2)))
        if faces is not None and len(faces):
            faces = [r for r in faces if r[1] * 2 / H < 0.38 and r[3] * 2 / H > 0.12]  # solo volti veri: in alto e grandi (mani e logo della maglietta ingannano il rilevatore)
            if not len(faces): i += 1; continue
            f = max(faces, key=lambda r: r[-1])  # il più sicuro
            chin = (f[1] + f[3]) * 2 / H; n += 1; serie.append([round(i / 30, 2), round(float(chin), 4)])
            if chin > top: bad += 1
            if chin > worst: worst, worst_t = chin, i / 30
    i += 1
print(f"{os.path.basename(path)}: mento al massimo a {worst:.3f} dell'altezza (a {worst_t:.1f} s), grafiche da {top:.3f}; fotogrammi oltre il bordo: {bad}/{n}")
import json; json.dump(serie, open(os.path.splitext(path)[0] + "_mento.json", "w"))  # serie tempo/mento, per il controllo elemento per elemento
sys.exit(1 if bad else 0)
