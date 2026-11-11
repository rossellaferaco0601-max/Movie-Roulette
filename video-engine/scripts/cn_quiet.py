#!/usr/bin/env python3
"""Punti di taglio dell'audio nei SILENZI VERI attorno ai pezzi di un'intervista.
Per ogni pezzo «inizio prima parola - fine ultima parola» (tempi indicativi delle parole allineate) cerca il silenzio che
precede l'attacco e quello che segue la chiusura (intervalli di almeno 60 ms sotto soglia; soglia = rumore di fondo + 7 dB)
e mette il taglio 0,12 s prima dell'attacco e 0,16 s dopo la chiusura (o al centro del silenzio, se è più corto).
Uso: python3 scripts/cn_quiet.py audio16k.wav "a1-b1,a2-b2,..."
Stampa i pezzi pronti per cut([...]); ⚠ se entro 0,7 s non c'è un silenzio (frasi legate: scegliere un altro punto)."""
import sys, wave, numpy as np
w = wave.open(sys.argv[1]); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
hop = int(0.01 * sr); E = np.array([20 * np.log10(float(np.sqrt(np.mean(a[i:i + 2 * hop] ** 2))) + 1e-9) for i in range(0, len(a) - 2 * hop, hop)])
thr = float(np.percentile(E, 10)) + 7
q = E < thr; sil = []; st = None
for i, v in enumerate(q):
    if v and st is None: st = i
    if not v and st is not None:
        if i - st >= 6: sil.append((st / 100, i / 100))
        st = None
out = []
for piece in sys.argv[2].split(","):
    f, t = [float(v) for v in piece.split("-")]
    before = [s for s in sil if s[1] <= f + 0.12 and s[1] >= f - 0.7]
    after = [s for s in sil if s[0] >= t - 0.12 and s[0] <= t + 0.7]
    warn = ""
    if before: s0, s1 = before[-1]; cin = max(s0 + 0.02, s1 - 0.12) if s1 - s0 > 0.16 else (s0 + s1) / 2
    else: cin = f - 0.08; warn += "  ⚠ nessun silenzio prima"
    if after: s0, s1 = after[0]; cout = min(s1 - 0.02, s0 + 0.16) if s1 - s0 > 0.2 else (s0 + s1) / 2
    else: cout = t + 0.1; warn += "  ⚠ nessun silenzio dopo"
    out.append((round(cin, 2), round(cout, 2), warn))
print(f"soglia {thr:.0f} dB")
print(", ".join(f"[{a_}, {b_}]" for a_, b_, _ in out))
for (a_, b_, m), piece in zip(out, sys.argv[2].split(",")): print(f"  {piece:>16s}  →  {a_:7.2f} - {b_:7.2f}  ({b_ - a_:5.2f} s){m}")
print("totale", round(sum(b_ - a_ for a_, b_, _ in out), 2))
