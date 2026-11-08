"""Controllo qualità dei reel YTCN 38 montati.

Uso: python scripts/ytcn38_qa.py audio Y1 [Y2 ...]   → ritrascrive il reel e confronta il testo ai tagli
     python scripts/ytcn38_qa.py frames Y1 [Y2 ...]  → work/ytcn38/<id>/sheet.jpg (12 fotogrammi) + volto rilevato
"""
import difflib, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_engine import ROOT, _norm  # noqa: E402
from reels_ytcn38 import REELS  # noqa: E402

WDIR = os.path.join(ROOT, "work", "ytcn38")
OUT = os.path.join(ROOT, "output", "ytcn38")
mode, keys = sys.argv[1], sys.argv[2:] or list(REELS)

if mode == "audio":
    from faster_whisper import WhisperModel
    model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=int(os.environ.get("QA_THREADS", "6")))
    for key in keys:
        r = REELS.get(key) or {"id": key}   # chiave non in REELS (es. Y9v2_costanza): id = cartella in work/ytcn38
        meta = json.load(open(os.path.join(WDIR, r["id"], "meta.json"), encoding="utf-8"))
        mp4 = os.environ.get("QA_MP4") or os.path.join(OUT, r["id"] + ".mp4")
        wav = os.path.join(WDIR, r["id"], "qa16k.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-t", str(meta["total"]), "-ac", "1", "-ar", "16000", wav], check=True)
        segs, _ = model.transcribe(wav, language="it", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
        heard = []
        for s_ in segs:
            for w in s_.words:
                x = w.word.strip()
                if heard and x[:1] in "'%-":
                    heard[-1] = (heard[-1][0] + x, heard[-1][1])
                else:
                    heard.append((x, w.start))
        expected = " ".join(iv["text"] for iv in meta["ivs"])
        exp = [_norm(x) for x in re.split(r"\s+", expected) if _norm(x)]
        got = [_norm(x) for x, _ in heard if _norm(x)]
        cuts = [iv["o"] / 30 for iv in meta["ivs"]][1:]
        print(f"== {key}  parole previste {len(exp)}  sentite {len(got)}")
        sm = difflib.SequenceMatcher(a=exp, b=got, autojunk=False)
        issues = 0
        gi = [t for x, t in heard if _norm(x)]
        for op, a0, a1, b0, b1 in sm.get_opcodes():
            if op == "equal":
                continue
            t = gi[min(b0, len(gi) - 1)] if gi else 0
            near = min(cuts, key=lambda c: abs(c - t)) if cuts else None
            flag = f" (taglio a {near:.2f}s)" if near is not None and abs(near - t) < 1.0 else ""
            print(f"  {op:8s} @{t:6.2f}s  previsto={' '.join(exp[a0:a1])!r}  sentito={' '.join(got[b0:b1])!r}{flag}")
            issues += bool(flag)
        print(f"  ratio={sm.ratio():.3f}  differenze vicino ai tagli={issues}")
        print("  tagli (uscita s -> sorgente):", ", ".join(f"{iv['o']/30:.2f}->{iv['s']:.2f}" for iv in meta["ivs"]))

elif mode == "frames":
    import cv2
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    for key in keys:
        r = REELS.get(key) or {"id": key}   # chiave non in REELS (es. Y9v2_costanza): id = cartella in work/ytcn38
        meta = json.load(open(os.path.join(WDIR, r["id"], "meta.json"), encoding="utf-8"))
        mp4 = os.environ.get("QA_MP4") or os.path.join(OUT, r["id"] + ".mp4")
        d = os.path.join(WDIR, r["id"], "frames")
        os.makedirs(d, exist_ok=True)
        T = meta["total"] + meta["cta"]
        ts = [0.4, 1.5] + [meta["total"] * k / 10 for k in range(1, 10)] + [meta["total"] + 3.5]
        for i, t in enumerate(ts):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", mp4, "-frames:v", "1", os.path.join(d, f"f{i:02d}.jpg")], check=True)
        ys = []
        for i, t in enumerate(ts):
            im = cv2.imread(os.path.join(d, f"f{i:02d}.jpg"))
            g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
            fs = casc.detectMultiScale(g, 1.1, 5, minSize=(120, 120))
            if len(fs):
                x, y, w, h = max(fs, key=lambda q: q[2] * q[3])
                ys.append((round(t, 1), round(y / 1920, 2), round((y + h) / 1920, 2)))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "1", "-i", os.path.join(d, "f%02d.jpg"), "-vf", "scale=360:-1,tile=6x2",
                        "-frames:v", "1", os.path.join(WDIR, r["id"], "sheet.jpg")], check=True)
        print(f"{key}: {len(ts)} fotogrammi -> work/ytcn38/{r['id']}/sheet.jpg  volto(t,y0,y1)={ys}")
