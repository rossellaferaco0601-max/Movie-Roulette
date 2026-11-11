#!/usr/bin/env python3
"""Pause vere (silenzio misurato sull'audio) dentro una finestra: python3 scripts/cn_pauses.py audio16k.wav "t0-t1,t0-t1,..." [soglia_dB=-58]
Per ogni finestra stampa gli intervalli di silenzio di almeno 60 ms (inizio-fine, centro): i tagli vanno messi lì."""
import sys, wave, numpy as np
w = wave.open(sys.argv[1]); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
thr = float(sys.argv[3]) if len(sys.argv) > 3 else -58
for win in sys.argv[2].split(","):
    t0, t1 = [float(v) for v in win.split("-")]; res = []; st = None
    for t in np.arange(t0, t1, 0.01):
        q = 20 * np.log10(float(np.sqrt(np.mean(a[int(t * sr):int((t + 0.02) * sr)] ** 2))) + 1e-9) < thr
        if q and st is None: st = t
        if not q and st is not None:
            if t - st >= 0.06: res.append((st, t))
            st = None
    if st is not None and t1 - st >= 0.06: res.append((st, t1))
    print(f"{t0:.2f}-{t1:.2f}: " + ("  ".join(f"{s:.2f}-{e:.2f} (centro {(s + e) / 2:.2f})" for s, e in res) or "nessun silenzio"))
