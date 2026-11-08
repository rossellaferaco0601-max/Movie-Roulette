"""Scontorno di Daniele fotogramma per fotogramma con RobustVideoMatting (ONNX, CPU).

Uso: python scripts/rvm_cutout.py <video> <cartella_out> a-b [a-b ...]   (a, b in secondi del sorgente)
Scrive <cartella_out>/<idx>.png (RGBA 1920×1080, idx = secondi×30) nel formato che ReelStudio usa per
l'effetto «scritta dietro la persona» (progetti/<sorgente>/scontorni).
"""
import os, subprocess, sys, time
import numpy as np, cv2, onnxruntime as ort

MODEL = "C:/Users/roxfe/Documents/ReelStudio/tools/rvm/rvm_resnet50_fp32.onnx"
W, H, FPS = 1920, 1080, 30
video, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
so = ort.SessionOptions(); so.intra_op_num_threads = int(os.environ.get("RVM_THREADS", "4"))
sess = ort.InferenceSession(MODEL, so, providers=["CPUExecutionProvider"])
for r in sys.argv[3:]:
    a, b = map(float, r.split("-"))
    i0, i1 = round(a * FPS), round(b * FPS)
    t = time.time()
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{i0 / FPS:.4f}", "-i", video, "-t", f"{(i1 - i0) / FPS + 0.02:.4f}",
                          "-vf", f"fps={FPS},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
    n = 0
    for k in range(i1 - i0 + 1):
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        x = (img.astype(np.float32) / 255).transpose(2, 0, 1)[None]
        fgr, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": np.array([0.25], np.float32)})
        rgb = (np.clip(fgr[0], 0, 1) * 255).round().astype(np.uint8).transpose(1, 2, 0)
        a8 = (np.clip(pha[0, 0], 0, 1) * 255).round().astype(np.uint8)
        cv2.imwrite(os.path.join(out, f"{i0 + k}.png"), np.dstack([rgb[:, :, ::-1], a8]))
        n += 1
    p.stdout.close(); p.wait()
    print(f"{a:.2f}-{b:.2f}: {n} fotogrammi ({i0}-{i0 + n - 1}) in {time.time() - t:.0f}s", flush=True)
