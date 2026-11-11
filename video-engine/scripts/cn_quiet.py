#!/usr/bin/env python3
"""Punti di taglio dell'audio nelle pause, per i pezzi di un'intervista.
Per ogni pezzo «inizio prima parola - fine ultima parola» (tempi delle parole allineate) cerca il punto più silenzioso
nella pausa che precede la prima parola (ultimi 0,35 s) e in quella che segue l'ultima (primi 0,45 s, o fino alla parola dopo).
Uso: python3 scripts/cn_quiet.py audio16k.wav parole.json "a1-b1,a2-b2,..."
Stampa i pezzi pronti per cut([...]) e segnala le pause strette (< 0,12 s) o non silenziose (> -55 dB), da controllare a orecchio/trascrizione."""
import json, sys, wave, numpy as np
w = wave.open(sys.argv[1]); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
ws = json.load(open(sys.argv[2])); S = [x["startMs"] / 1000 for x in ws]; E = [x["endMs"] / 1000 for x in ws]
def db(t, win=0.03): return 20 * np.log10(float(np.sqrt(np.mean(a[max(0, int((t - win / 2) * sr)):int((t + win / 2) * sr)] ** 2))) + 1e-9)
def quiet(t0, t1):
    xs = np.arange(t0 + 0.015, max(t0 + 0.02, t1 - 0.015), 0.005); return min(xs, key=db)
out = []
for piece in sys.argv[3].split(","):
    f, t = [float(v) for v in piece.split("-")]
    i = min(range(len(ws)), key=lambda k: abs(S[k] - f)); j = min(range(len(ws)), key=lambda k: abs(E[k] - t))
    p0 = E[i - 1] if i else 0.0; n1 = S[j + 1] if j + 1 < len(ws) else E[j] + 2
    cin = quiet(max(p0, S[i] - 0.35), S[i]); cout = quiet(E[j], min(n1, E[j] + 0.45))
    warn = ("  ⚠ pausa stretta prima" if S[i] - p0 < 0.12 else "") + ("  ⚠ pausa stretta dopo" if n1 - E[j] < 0.12 else "") + ("  ⚠ non silenzioso" if max(db(cin), db(cout)) > -55 else "")
    out.append((round(float(cin), 2), round(float(cout), 2), f"«{ws[i]['text'].strip()} … {ws[j]['text'].strip()}»  {db(cin):.0f} / {db(cout):.0f} dB{warn}"))
print(", ".join(f"[{a_}, {b_}]" for a_, b_, _ in out))
for a_, b_, m in out: print(f"  {a_:7.2f} → {b_:7.2f}  ({b_ - a_:5.2f} s)  {m}")
print("totale", round(sum(b_ - a_ for a_, b_, _ in out), 2))
