#!/usr/bin/env python3
"""Preparazione di un'intervista-testimonianza (girato orizzontale 1920x1080, soggetto al centro):
misura il volto (YuNet), calcola il ritaglio verticale con la fronte a 0,10 dell'altezza (mento sopra la zona grafiche),
estrae l'audio, trascrive, allinea parola per parola e scrive le parole per i sottotitoli (apostrofi riuniti).
Uso: ../.claude/skills/effects/.venv/bin/python scripts/cn_testi_prep.py public/testimonianze/RAW.MP4 nome
Scrive: work/<nome>.wav, work/<nome>_whisper.json, work/<nome>_words.json, src/cn/words<Nome>.json, work/<nome>_prep.json
(il ritaglio va nel campo `pre` del config di cn_master_v.py: il master legge il girato grezzo solo nei pezzi che servono)."""
import json, os, subprocess, sys
import cv2, numpy as np
raw, name = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
cap = cv2.VideoCapture(raw); W, H = int(cap.get(3)), int(cap.get(4)); dur = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
det = cv2.FaceDetectorYN.create(os.path.join(here, "..", "..", ".claude", "skills", "effects", "models", "yunet.onnx"), "", (W, H), 0.6)
F = []
for t in np.linspace(15, dur - 15, 28):
    cap.set(cv2.CAP_PROP_POS_MSEC, float(t) * 1000); ok, f = cap.read()
    if not ok: continue
    _, faces = det.detect(f)
    if faces is None: continue
    x, y, w, h = max(faces, key=lambda a: a[2] * a[3])[:4]; F.append((x + w / 2, y, y + h))
F = np.array(F); cx, top, chin = float(np.median(F[:, 0])), float(np.median(F[:, 1])), float(np.percentile(F[:, 2], 95))
# altezza del ritaglio: la più grande che tiene la fronte a 0,10 e sta nel fotogramma (volto il più possibile in alto, meno ingrandimento possibile)
ch = min(H, int((H - top) / 0.9) // 2 * 2); ch = min(ch, 960); cw = int(ch * 9 / 16) // 2 * 2
y0 = int(max(0, min(H - ch, top - 0.10 * ch))) // 2 * 2; x0 = int(max(0, min(W - cw, cx - cw / 2))) // 2 * 2
pre = f"crop={cw}:{ch}:{x0}:{y0},scale=1080:1920:flags=lanczos+accurate_rnd"
info = {"raw": raw, "duration": round(dur, 2), "face": {"cx": round(cx), "top": round(top), "chin95": round(chin), "cxRange": [round(float(F[:, 0].min())), round(float(F[:, 0].max()))]},
        "pre": pre, "chinFrac": round((chin - y0) / ch, 3), "faceXLong": round(cx / W, 3), "faceYLong": round((top + chin) / 2 / H, 3)}
wav = f"work/{name}.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
subprocess.run(["python3", "scripts/transcribe.py", wav, "--model", "medium", "--lang", "it", "--out", f"work/{name}_whisper.json"], check=True, stdout=subprocess.DEVNULL)
# l'allineamento con una banda troppo stretta non trova un percorso e sbaglia tutto (scarto mediano = banda): si allarga finché torna
import re
for band in ("8", "25", "60", "120"):
    r = subprocess.run(["python3", "scripts/cn_align.py", wav, f"work/{name}_whisper.json", f"work/{name}_words.json", band], capture_output=True, text=True)
    info["align"] = r.stdout.strip().split("\n")[-1]
    m = re.search(r"mediana (-?\d+) ms", info["align"])
    if m and abs(int(m.group(1))) < 300: break
ws = json.load(open(f"work/{name}_words.json")); out = []
for x in ws:
    if x["text"].strip().startswith("'") and out:
        out[-1]["text"] = out[-1]["text"].rstrip() + x["text"].strip(); out[-1]["endMs"] = x["endMs"]; continue
    out.append(dict(x))
json.dump(out, open(f"src/cn/words{name[0].upper() + name[1:]}.json", "w"), ensure_ascii=False, indent=1)
json.dump(info, open(f"work/{name}_prep.json", "w"), indent=1); print(json.dumps(info, indent=1))
line, last = [], None
for x in out:
    s, e = x["startMs"] / 1000, x["endMs"] / 1000
    if last is not None and s - last > 0.4: print(" ".join(line), f"({last:.2f})"); line = [f"[{s:.2f} +{s - last:.2f}]"]
    elif not line: line = [f"[{s:.2f}]"]
    line.append(x["text"].strip()); last = e
print(" ".join(line))
