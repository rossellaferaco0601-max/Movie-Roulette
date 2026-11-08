"""Posizione del volto nei primi secondi di ogni reel (per piazzare gli hook): fotogrammi a 0.4/1.4/2.4 s + Haar.
Uso: python scripts/hook_face.py cn-y1_auto-efficiente [cn-y2...]  → stampa x0 x1 y0 y1 (frazioni) per ogni tempo."""
import os, subprocess, sys, glob
import cv2, numpy as np
NODE = "C:/Users/roxfe/Documents/ReelStudio/tools/node/node.exe"
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
for pid in sys.argv[1:]:
    d = f"work/hookpos/{pid}"; os.makedirs(d, exist_ok=True)
    for f in glob.glob(d + "/*.png"): os.remove(f)
    subprocess.run([NODE, "scripts/rs_render.js", "still", pid, d, "0.4", "1.4", "2.4"], capture_output=True)
    for f in sorted(glob.glob(d + "/*.png")):
        im = cv2.imread(f, cv2.IMREAD_GRAYSCALE); im = cv2.resize(im, (270, 480))
        det = casc.detectMultiScale(im, 1.1, 4, minSize=(40, 40))
        if len(det):
            x, y, w, h = max(det, key=lambda q: q[2] * q[3])
            print(f"{pid} {os.path.basename(f)[1:-4]}: x {x/270:.2f}-{(x+w)/270:.2f}  y {y/480:.2f}-{(y+h)/480:.2f}  centro ({(x+w/2)/270:.2f},{(y+h/2)/480:.2f})")
        else:
            print(f"{pid} {os.path.basename(f)[1:-4]}: volto non trovato")
