#!/usr/bin/env python3
"""Trascrive audio/video con faster-whisper e produce caption per @remotion/captions
(timestamp per parola) + SRT. Uso:
    python3 scripts/transcribe.py input.mp4 [--model small] [--lang it] [--out src/captions/clip.json]
"""
import argparse, json, subprocess, tempfile, os
from faster_whisper import WhisperModel

def fmt_srt(ms):
    h, r = divmod(ms, 3600000); m, r = divmod(r, 60000); s, ms = divmod(r, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input"); ap.add_argument("--model", default="small")
    ap.add_argument("--lang", default=None); ap.add_argument("--out", default=None)
    a = ap.parse_args()
    # estrae wav 16k mono (whisper-friendly)
    wav = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg","-loglevel","error","-y","-i",a.input,"-ac","1","-ar","16000",wav], check=True)
    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(wav, language=a.lang, word_timestamps=True, vad_filter=True)
    caps, srt, n = [], [], 1
    for seg in segments:
        srt.append(f"{n}\n{fmt_srt(int(seg.start*1000))} --> {fmt_srt(int(seg.end*1000))}\n{seg.text.strip()}\n"); n += 1
        for w in seg.words or []:
            s, e = int(w.start*1000), int(w.end*1000)
            caps.append({"text": w.word, "startMs": s, "endMs": e, "timestampMs": (s+e)//2, "confidence": float(w.probability)})
    os.remove(wav)
    base = a.out or os.path.splitext(a.input)[0] + ".captions.json"
    with open(base, "w") as f: json.dump(caps, f, ensure_ascii=False, indent=1)
    with open(os.path.splitext(base)[0] + ".srt", "w") as f: f.write("\n".join(srt))
    print(f"lingua={info.language} parole={len(caps)} -> {base}")

if __name__ == "__main__":
    main()
