"""Fase dei colpi forti: energia bassa (cassa) e alta (rullante) per posizione nel gruppo di 4; outlier degli intervalli.
Uso: python scripts/beat_phase.py work/evento/beats.json input/musica/brano.mp3
"""
import json, sys
import numpy as np
import librosa

beats = json.load(open(sys.argv[1]))
b = np.array(beats["beats"])
y, sr = librosa.load(sys.argv[2], sr=22050, mono=True)
hop = 256
Sx = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
f = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = Sx[(f >= 30) & (f < 150)].sum(axis=0)
high = Sx[(f >= 1500) & (f < 6000)].sum(axis=0)
t = librosa.frames_to_time(np.arange(len(low)), sr=sr, hop_length=hop)
def win(x, tb):
    j = np.searchsorted(t, tb); return x[max(0, j - 1):j + 4].max()
L = np.array([win(low, tb) for tb in b]); H = np.array([win(high, tb) for tb in b])
L /= L.max(); H /= H.max()
print("posizione nel gruppo di 4 (dal colpo 0): media cassa / media rullante")
for p in range(4):
    print("  pos %d: cassa %.3f  rullante %.3f" % (p, L[p::4].mean(), H[p::4].mean()))
print("pari/dispari: cassa %.3f/%.3f  rullante %.3f/%.3f" % (L[0::2].mean(), L[1::2].mean(), H[0::2].mean(), H[1::2].mean()))
# per finestre di 32 colpi, quale parita' e' piu' forte (cassa)
print("finestre di 32 colpi: cassa pari vs dispari")
for s in range(0, len(b) - 32, 32):
    print("  %3d-%3d (%.1f-%.1f s): pari %.3f dispari %.3f" % (s, s + 31, b[s], b[s + 31], L[s:s + 32:2].mean(), L[s + 1:s + 32:2].mean()))
iv = np.diff(b)
med = np.median(iv)
print("intervalli anomali (>12%% dalla mediana %.3f):" % med)
for i, v in enumerate(iv):
    if abs(v - med) / med > 0.12:
        print("  colpo %d->%d  t %.2f  intervallo %.3f" % (i, i + 1, b[i], v))
# energia a meta' tra due colpi (per capire se il tempo vero e' doppio)
mid = np.array([win(low, (b[i] + b[i + 1]) / 2) for i in range(len(b) - 1)]) / 1.0
print("cassa sui colpi %.3f  vs a meta' tra i colpi %.3f (normalizzata al max)" % (L[:-1].mean(), (mid / Sx[(f >= 30) & (f < 150)].sum(axis=0).max()).mean()))
