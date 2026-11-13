#!/usr/bin/env python3
"""Parole per i sottotitoli di una versione lunga, ritrascritte PEZZO PER PEZZO sull'audio del girato (tempi del girato):
la trascrizione dell'intero girato, nei punti con pause lunghe, salta parole o le allunga sopra la pausa (13/11: «un … che non avevo»
al posto di «un livello anche di benessere mentale, sociale, che non avevo»). Finestre corte = testo completo e punteggiatura.
Uso: python3 scripts/cn_long_words.py work/x_long.json work/cXXXX.wav src/cn/wordsXLong.json
Stampa il testo di ogni pezzo: va letto tutto, anche per scoprire chiacchiere fuori campo finite dentro un intervallo."""
import json, subprocess, sys, tempfile, os
from faster_whisper import WhisperModel
plan = json.load(open(sys.argv[1])); wav = sys.argv[2]
m = WhisperModel("medium", device="cpu", compute_type="int8"); out = []; tmp = tempfile.mkdtemp()
for i, s in enumerate(plan["segments"]):
    a, b = s["from"], s["to"]; f = os.path.join(tmp, "s.wav")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{max(0, a - 0.15):.3f}", "-t", f"{b - a + 0.3:.3f}", "-i", wav, "-ac", "1", "-ar", "16000", f], check=True)
    segs, _ = m.transcribe(f, language="it", vad_filter=False, word_timestamps=True, condition_on_previous_text=False, initial_prompt="Testimonianza di un corridore di Correre Naturale, con punteggiatura.")
    ws = [w for sg in segs for w in sg.words]
    for w in ws:
        st, en = max(a, a - 0.15 + w.start), min(b, a - 0.15 + w.end)
        if en - st < 0.02: continue
        out.append({"text": " " + w.word.strip(), "startMs": round(st * 1000), "endMs": round(en * 1000), "timestampMs": round((st + en) * 500), "confidence": w.probability})
    print(f"[{i}] {a:.1f}-{b:.1f}  " + " ".join(w.word.strip() for w in ws))
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False, indent=1); print(len(out), "parole →", sys.argv[3])
