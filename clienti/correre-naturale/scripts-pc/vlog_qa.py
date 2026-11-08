"""Controllo qualità del vlog montato.
Uso: python scripts/vlog_qa.py audio   → ritrascrive il render e confronta con le parole previste (segnala le differenze vicino ai tagli)
     python scripts/vlog_qa.py frames  → work/evento/frames/sheet.jpg (14 fotogrammi) + volto rilevato
"""
import difflib, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_engine import ROOT, _norm  # noqa: E402

WD = os.path.join(ROOT, "work", "evento")
MP4 = os.environ.get("QA_MP4") or os.path.join(ROOT, "output", "evento", "VLOG_workshop.mp4")
meta = json.load(open(os.path.join(WD, os.environ.get("QA_META", "meta.json")), encoding="utf-8"))   # QA_META=meta60.json per il condensato
proj = json.load(open(f"C:/Users/roxfe/Documents/ReelStudio/progetti/{os.environ.get('QA_PID', 'cn-vlog_workshop')}/project.json", encoding="utf-8"))
mode = sys.argv[1]

if mode == "audio":
    from faster_whisper import WhisperModel
    model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=16)
    wav = os.path.join(WD, "qa16k.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", MP4, "-t", str(meta["total"]), "-ac", "1", "-ar", "16000", wav], check=True)
    segs, _ = model.transcribe(wav, language="it", word_timestamps=True, beam_size=5, vad_filter=True, condition_on_previous_text=False)
    heard = []
    for s_ in segs:
        for w in s_.words:
            x = w.word.strip()
            if heard and x[:1] in "'%-":
                heard[-1] = (heard[-1][0] + x, heard[-1][1])
            else:
                heard.append((x, w.start))
    exp = [_norm(w["text"]) for w in proj["words"] if _norm(w["text"])]
    got = [_norm(x) for x, _ in heard if _norm(x)]
    cuts = [c["s"] for c in proj["cuts"]][1:]
    print(f"parole previste {len(exp)}  sentite {len(got)}")
    sm = difflib.SequenceMatcher(a=exp, b=got, autojunk=False)
    gi = [t for x, t in heard if _norm(x)]
    issues = 0
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == "equal":
            continue
        t = gi[min(b0, len(gi) - 1)] if gi else 0
        near = min(cuts, key=lambda c: abs(c - t))
        flag = f" (taglio a {near:.2f}s)" if abs(near - t) < 1.0 else ""
        print(f"  {op:8s} @{t:6.2f}s  previsto={' '.join(exp[a0:a1])!r}  sentito={' '.join(got[b0:b1])!r}{flag}")
        issues += bool(flag)
    print(f"ratio={sm.ratio():.3f}  differenze vicino ai tagli={issues}")

elif mode == "frames":
    import cv2
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    d = os.path.join(WD, "frames")
    os.makedirs(d, exist_ok=True)
    T = meta["total"]
    ts = [0.5, 2.0] + [T * k / 12 for k in range(1, 12)] + [T + 2.0, T + 5.5]
    ys = []
    for i, t in enumerate(ts):
        f = os.path.join(d, f"f{i:02d}.jpg")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", MP4, "-frames:v", "1", f], check=True)
        im = cv2.imread(f)
        g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
        fs = casc.detectMultiScale(g, 1.1, 5, minSize=(90, 90))
        if len(fs):
            x, y, w, h = max(fs, key=lambda q: q[2] * q[3])
            ys.append((round(t, 1), round(y / 1920, 2), round((y + h) / 1920, 2)))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "1", "-i", os.path.join(d, "f%02d.jpg"), "-vf", "scale=300:-1,tile=5x3",
                    "-frames:v", "1", os.path.join(WD, "frames", "sheet.jpg")], check=True)
    print(f"{len(ts)} fotogrammi -> work/evento/frames/sheet.jpg  volto(t,y0,y1)={ys}")
