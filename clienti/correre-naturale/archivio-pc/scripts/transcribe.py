"""Trascrizione parola per parola con faster-whisper large-v3.
Uso: python scripts/transcribe.py <audio16k.wav> <out_words.json> <out_text.txt>
"""
import json, sys
from faster_whisper import WhisperModel

wav, out_json, out_txt = sys.argv[1:4]
model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=16)
segs, info = model.transcribe(wav, language="it", word_timestamps=True, beam_size=5, vad_filter=False,
                              condition_on_previous_text=True)
data, lines = [], []
for s in segs:
    data.append({"start": round(s.start, 3), "end": round(s.end, 3), "text": s.text.strip(),
                 "words": [{"w": w.word, "s": round(w.start, 3), "e": round(w.end, 3)} for w in (s.words or [])]})
    lines.append(f"[{s.start:7.2f} - {s.end:7.2f}] {s.text.strip()}")
    print(lines[-1], flush=True)
json.dump(data, open(out_json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(out_txt, "w", encoding="utf-8").write("\n".join(lines))
print("DONE", len(data), "segmenti")
