#!/usr/bin/env python3
"""Piano della versione lunga di una testimonianza: per ogni capitolo (domanda + intervalli della risposta) toglie le pause
lunghe misurandole sull'audio e scrive i pezzi (punti di taglio audio) e l'inizio di ogni capitolo nel master.
Uso: python3 scripts/cn_long_plan.py audio16k.wav piano.json out.json   (piano: {chapters:[{q, ranges:[[a,b],..]}], blendFrames})
"""
import json, sys, wave, numpy as np
FPS = 30
THR, GAP, LEAD, TRAIL = -50.0, 0.9, 0.15, 0.28   # soglia parlato (dB), pausa minima da tagliare, aria prima/dopo
f = wave.open(sys.argv[1]); a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(float)
hop = 160; rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2) + 1) for i in range(0, len(a) - hop, hop)]); db = 20 * np.log10(rms / 32768)
plan = json.load(open(sys.argv[2])); blend = plan.get("blendFrames", 8); h = blend / 2 / FPS
GAP = plan.get("gap", 1.6)          # si tagliano solo le pause davvero lunghe: troppi tagli = scatti (Ross 10/11)
ZOOMS = plan.get("zooms", [1.0, 1.06])  # un'inquadratura per capitolo, mai un cambio di zoom dentro la risposta
segs, chapters = [], []
segzoom = []
for ci, ch in enumerate(plan["chapters"]):
    first = len(segs)
    for (a0, b0) in ch["ranges"]:
        sp = db[int(a0 * 100):int(b0 * 100)] > THR
        iv, i = [], 0
        while i < len(sp):
            if sp[i]:
                j = i
                while j < len(sp) and sp[j]: j += 1
                if j - i >= 4: iv.append([a0 + i / 100, a0 + j / 100])
                i = j
            else: i += 1
        merged = []
        for s, e in iv:
            if merged and s - merged[-1][1] < GAP: merged[-1][1] = e
            else: merged.append([s, e])
        for k, (s, e) in enumerate(merged):
            A = max(a0, s - LEAD) if k else a0
            B = min(b0, e + TRAIL) if k < len(merged) - 1 else b0
            if B - A > 0.5: segs.append([round(A, 2), round(B, 2)]); segzoom.append(ZOOMS[ci % len(ZOOMS)])
    chapters.append({"q": ch["q"], "seg": first})
# pezzi video: sbordano di mezzo incrocio oltre il taglio audio; durate lontane dai mezzi fotogrammi
out = []
for i, (A, B) in enumerate(segs):
    fr = round(A - h, 2) if i else A; to = round(B + h, 2) if i < len(segs) - 1 else B
    while abs((to - fr) * FPS - round((to - fr) * FPS)) > 0.4: to = round(to + 0.01, 2)
    out.append({"from": fr, "to": to, "zoom": segzoom[i]})
cur, starts = 0, []
for i, s in enumerate(out):
    n = round((s["to"] - s["from"]) * FPS); st = 0 if i == 0 else cur - blend; cur = st + n; starts.append(st)
for c in chapters: c["at"] = round(starts[c["seg"]] / FPS, 2)
json.dump({"segments": out, "chapters": chapters, "blendFrames": blend, "total": cur / FPS}, open(sys.argv[3], "w"), indent=1, ensure_ascii=False)
print(f"{len(out)} pezzi, durata {cur / FPS:.1f} s"); [print(f"  {c['at']:7.2f}  {c['q']}") for c in chapters]
