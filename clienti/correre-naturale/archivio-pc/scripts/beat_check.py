"""Verifica della griglia: onset medio sui colpi vs a meta'; PLP (pulsazione locale) come griglia alternativa.
Uso: python scripts/beat_check.py work/evento/beats.json input/musica/brano.mp3 work/evento/beats_plp.json
"""
import json, sys
import numpy as np
import librosa

beats = json.load(open(sys.argv[1]))
b = np.array(beats["beats"])
y, sr = librosa.load(sys.argv[2], sr=22050, mono=True)
hop = 256
ob = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
ot = librosa.frames_to_time(np.arange(len(ob)), sr=sr, hop_length=hop)
def at(x, tt):
    j = np.searchsorted(ot, tt); return x[max(0, j - 2):j + 3].max()
on_b = np.array([at(ob, t) for t in b])
on_m = np.array([at(ob, (b[i] + b[i + 1]) / 2) for i in range(len(b) - 1)])
print("onset medio sui colpi librosa %.2f, a meta' %.2f" % (on_b.mean(), on_m.mean()))
# scansione di fase: sposta la griglia di k/8 di colpo e misura l'onset medio
iv = np.diff(b)
for k in range(8):
    sh = np.array([b[i] + iv[min(i, len(iv) - 1)] * k / 8 for i in range(len(b) - 1)])
    print("  fase +%d/8: onset medio %.2f" % (k, np.mean([at(ob, t) for t in sh])))
# PLP
pulse = librosa.beat.plp(onset_envelope=ob, sr=sr, hop_length=hop, tempo_min=100, tempo_max=140)
pk = np.flatnonzero(librosa.util.localmax(pulse))
pt = ot[pk]
# tieni solo picchi con intervallo plausibile
print("PLP: %d picchi, intervallo mediano %.3f" % (len(pt), np.median(np.diff(pt))))
on_p = np.array([at(ob, t) for t in pt])
print("onset medio sui picchi PLP %.2f" % on_p.mean())
# scostamento picchi PLP dai colpi librosa (in frazione di colpo)
d = []
for t in pt:
    i = np.searchsorted(b, t)
    if 0 < i < len(b):
        d.append((t - b[i - 1]) / (b[i] - b[i - 1]))
d = np.array(d)
hist, edges = np.histogram(d, bins=8, range=(0, 1))
print("posizione dei picchi PLP tra due colpi librosa (istogramma in ottavi):", hist.tolist())
json.dump(dict(beats=[round(float(t), 4) for t in pt], onset=[round(float(o), 2) for o in on_p]), open(sys.argv[3], "w"))
# colpi forti: istogramma onset per i colpi librosa pari/dispari in finestre
print("finestre 32 colpi: onset pari / dispari")
for s in range(0, len(b) - 32, 32):
    print("  %5.1f-%5.1f s: pari %.2f dispari %.2f" % (b[s], b[s + 31], on_b[s:s + 32:2].mean(), on_b[s + 1:s + 32:2].mean()))
