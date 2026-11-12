#!/usr/bin/env python3
"""Riquadro del volto nel master, un fotogramma ogni 5 (YuNet): serve per mettere parole e grafiche SOPRA la testa o ai lati senza
mai toccare il volto. Uso (venv della skill effects): ../.claude/skills/effects/.venv/bin/python scripts/cn_facebox.py public/x/master.mp4
Scrive <master>_volto.json: [[t, sinistra, alto, destra, mento, cima_capelli], ...] in frazioni del fotogramma
(cima dei capelli stimata: alto del riquadro meno il 42 % della sua altezza)."""
import sys, os, json, cv2
path = sys.argv[1]
model = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "effects", "models", "yunet.onnx")
cap = cv2.VideoCapture(path); W, H = int(cap.get(3)), int(cap.get(4))
det = cv2.FaceDetectorYN.create(model, "", (W // 2, H // 2), 0.6)
out, i = [], 0
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % 5 == 0:
        _, fs = det.detect(cv2.resize(fr, (W // 2, H // 2)))
        if fs is not None and len(fs):
            fs = [r for r in fs if r[3] * 2 / H > 0.12]
            if fs:
                x, y, w, h = [float(v) * 2 for v in max(fs, key=lambda r: r[2] * r[3])[:4]]
                out.append([round(i / 30, 2), round(x / W, 4), round(y / H, 4), round((x + w) / W, 4), round((y + h) / H, 4), round((y - 0.42 * h) / H, 4)])
    i += 1
json.dump(out, open(os.path.splitext(path)[0] + "_volto.json", "w"))
hair = sorted(r[5] for r in out); chin = sorted(r[4] for r in out)
print(f"{os.path.basename(path)}: {len(out)} misure · cima dei capelli: minimo {hair[0]:.3f}, 5° percentile {hair[len(hair)//20]:.3f}, mediana {hair[len(hair)//2]:.3f} · mento massimo {chin[-1]:.3f} · larghezza volto mediana {sorted(r[3]-r[1] for r in out)[len(out)//2]:.3f}")
