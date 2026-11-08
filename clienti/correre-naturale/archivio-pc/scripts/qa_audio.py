"""Ritrascrive l'audio del reel montato e lo confronta con il testo previsto.

Segnala parole mancanti/doppie/mozzate e le mostra vicino ai punti di taglio.
Uso: python scripts/qa_audio.py R1 [R2 ...]
"""
import difflib, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_engine import ROOT, _norm  # noqa: E402
from reels_longevita import REELS  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402

model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=16)
for key in sys.argv[1:] or list(REELS):
    r = REELS[key]
    meta = json.load(open(os.path.join(ROOT, "work", r["id"], "meta.json"), encoding="utf-8"))
    mp4 = os.path.join(ROOT, "output", os.environ.get("QA_DIR", ""), r["id"] + ".mp4")
    wav = os.path.join(ROOT, "work", r["id"], "qa16k.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-t", str(meta["vframes"] / 30), "-ac", "1",
                    "-ar", "16000", wav], check=True)
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
        if not flag:
            continue   # differenze lontane dai tagli = rumore di trascrizione
        print(f"  {op:8s} @{t:6.2f}s  previsto={' '.join(exp[a0:a1])!r}  sentito={' '.join(got[b0:b1])!r}{flag}")
        issues += 1
    print(f"  ratio={sm.ratio():.3f}  differenze vicino ai tagli={issues}")
    print("  tagli (uscita s -> sorgente):", ", ".join(f"{iv['o']/30:.2f}->{iv['s']:.2f}" for iv in meta["ivs"]))
