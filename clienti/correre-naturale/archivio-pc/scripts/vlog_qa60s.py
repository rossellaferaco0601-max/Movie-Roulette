"""QA del condensato con brano: stacchi rilevati nel montato vs colpi del brano (ri-misurati sull'audio del MP4), foglio di fotogrammi.
Uso: python scripts/vlog_qa60s.py output/evento/VLOG_workshop_60s.mp4 work/evento/frames60s   (python di sistema per ffmpeg/PIL;
     la parte beat usa la venv_tts se trovata)
"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp4, fdir = sys.argv[1], sys.argv[2]
meta = json.load(open(os.path.join(ROOT, "work", "evento", "meta60s.json")))
FPS = 30
os.makedirs(fdir, exist_ok=True)
total = meta["total"]
T = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]).decode().strip())
print(f"durata {T:.3f} s (montato {total:.3f} + CTA {meta['cta']})")

# 1) stacchi rilevati (scene detection) vs attesi
r = subprocess.run(["ffmpeg", "-v", "info", "-i", mp4, "-t", f"{total:.3f}", "-vf", "select='gt(scene,0.25)',showinfo", "-f", "null", "-"], capture_output=True, text=True).stderr
det = sorted(set(round(float(m) * FPS) for m in re.findall(r"pts_time:\s*([\d.]+)", r)))
exp = meta["cut_frames"][1:]
miss = [f for f in exp if min(abs(f - d) for d in det) > 1] if det else exp
extra = [d for d in det if min(abs(d - f) for f in exp) > 1]
print(f"stacchi attesi {len(exp)} (oltre ai {len([s for s in meta['segments'] if s.get('burst')]) - 1} della raffica), rilevati {len(det)}: mancanti {miss}  in piu {extra}")

# 2) colpi del brano misurati sull'audio del MP4 e distanza di ogni stacco dal colpo piu vicino
venv = "C:/Users/roxfe/Documents/ReelStudio/tools/venv_tts/Scripts/python.exe"
wav = os.path.join(fdir, "_a.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-ac", "1", "-ar", "22050", wav], check=True)
code = ("import numpy as np, librosa, json, sys\n"
        "y, sr = librosa.load(sys.argv[1], sr=22050)\n"
        "ob = librosa.onset.onset_strength(y=y, sr=sr, hop_length=256)\n"
        "t, b = librosa.beat.beat_track(onset_envelope=ob, sr=sr, hop_length=256, units='time', trim=False)\n"
        "print(json.dumps([float(x) for x in b]))\n")
res = subprocess.run([venv, "-c", code, wav], capture_output=True, text=True)
beats = json.loads([l for l in res.stdout.splitlines() if l.startswith("[")][-1])
d = []
for f in exp:
    t = f / FPS
    d.append(min(abs(t - b) for b in beats) * 1000)
print(f"stacco -> colpo piu vicino (audio del montato): medio {sum(d) / len(d):.0f} ms, max {max(d):.0f} ms, oltre 60 ms: {sum(1 for x in d if x > 60)}")
os.remove(wav)

# 3) loudness
r = subprocess.run(["ffmpeg", "-v", "info", "-i", mp4, "-af", "loudnorm=print_format=summary", "-f", "null", "-"], capture_output=True, text=True).stderr
print("loudness:", re.search(r"Input Integrated:\s+(-?[\d.]+)", r).group(1), "LUFS, picco", re.search(r"Input True Peak:\s+(-?[\d.]+)", r).group(1), "dBTP")
r = subprocess.run(["ffmpeg", "-v", "info", "-i", mp4, "-ss", f"{total:.3f}", "-af", "loudnorm=print_format=summary", "-f", "null", "-"], capture_output=True, text=True).stderr
print("loudness CTA:", re.search(r"Input Integrated:\s+(-?[\d.]+)", r).group(1), "LUFS")

# 4) foglio di fotogrammi: a meta di ogni scena etichettata + raffica + CTA
segs = [s for s in meta["segments"] if s["kind"] != "lib"]
o = 0.0
times = []
for s in segs:
    ol = s["n"] / s.get("speed", 1.0) / FPS
    if s.get("label") or s.get("burst"):
        times.append((o + ol / 2, (s.get("label") or "raffica")[:22]))
    o += ol
times += [(total + 1.0, "CTA"), (total + 5.0, "CTA fine")]
TW, TH = 216, 384
cols = 8
rows = (len(times) + cols - 1) // cols
sheet = Image.new("RGB", (cols * TW, rows * (TH + 20)), "black")
dr = ImageDraw.Draw(sheet)
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 14)
for i, (t, lab) in enumerate(times):
    tmp = os.path.join(fdir, f"f{i:02d}.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", mp4, "-frames:v", "1", "-vf", f"scale={TW}:{TH}", tmp], check=True)
    x, y = (i % cols) * TW, (i // cols) * (TH + 20)
    sheet.paste(Image.open(tmp), (x, y + 20))
    dr.text((x + 3, y + 3), f"{t:5.1f}s {lab}", fill="white", font=font)
sheet.save(os.path.join(fdir, "sheet.jpg"), quality=85)
print("foglio", os.path.join(fdir, "sheet.jpg"), len(times), "fotogrammi")
