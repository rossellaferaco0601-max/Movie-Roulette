"""Trascrizione parola per parola (large-v3, VAD, senza condizionamento sul testo precedente) di tratti di una clip.
Uso: python scripts/transcribe_ranges.py <wav16k> <out_words.json> a-b [c-d ...]   (secondi della clip; i tempi restano assoluti)
"""
import json, os, subprocess, sys, tempfile
from faster_whisper import WhisperModel
wav, out = sys.argv[1], sys.argv[2]
ranges = [tuple(float(x) for x in r.split("-")) for r in sys.argv[3:]]
model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=16)
data = []
for a, b in ranges:
    tmp = os.path.join(tempfile.gettempdir(), f"rng_{a:.1f}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", wav, tmp], check=True)
    segs, _ = model.transcribe(tmp, language="it", word_timestamps=True, beam_size=5, vad_filter=True, condition_on_previous_text=False)
    for s in segs:
        d = {"start": round(s.start + a, 3), "end": round(s.end + a, 3), "text": s.text.strip(),
             "words": [{"w": w.word, "s": round(w.start + a, 3), "e": round(w.end + a, 3)} for w in (s.words or [])]}
        data.append(d)
        print(f"[{d['start']:7.2f} - {d['end']:7.2f}] {d['text']}", flush=True)
json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("DONE", len(data))
