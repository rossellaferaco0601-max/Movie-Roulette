"""Struttura del brano: griglia lineare dei colpi (residui), energia per battuta, sezioni ripetute.
Uso: python scripts/song_structure.py work/evento/beats.json input/musica/brano.mp3
"""
import json, sys
import numpy as np
import librosa

beats = json.load(open(sys.argv[1]))
src = sys.argv[2]
b = np.array(beats["beats"])
# fit lineare
idx = np.arange(len(b))
k, c = np.polyfit(idx, b, 1)
res = b - (k * idx + c)
print("griglia lineare: colpo0 %.4f s, intervallo %.5f s (%.3f bpm = %.3f frame)" % (c, k, 60 / k, k * 30))
print("residui: std %.1f ms, max %.1f ms" % (res.std() * 1000, np.abs(res).max() * 1000))
# residui a finestre di 32 colpi (deriva locale)
for s in range(0, len(b) - 32, 32):
    seg = b[s:s + 32]
    kk, cc = np.polyfit(np.arange(32), seg, 1)
    print("  colpi %3d-%3d  t %6.2f-%6.2f  bpm locale %.2f  dev dalla griglia %.0f ms" % (
        s, s + 31, seg[0], seg[-1], 60 / kk, (res[s:s + 32]).mean() * 1000))

y, sr = librosa.load(src, sr=22050, mono=True)
ph = beats["downbeat_phase"]
bars = [b[i] for i in range(ph, len(b), 4)]
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
tr = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
cent = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
print("energia e brillantezza per battuta (4 colpi), 8 battute per riga:")
line = []
for i, t0 in enumerate(bars):
    t1 = bars[i + 1] if i + 1 < len(bars) else t0 + 4 * k
    m = (tr >= t0) & (tr < t1)
    e = rms[m].mean() * 100 if m.any() else 0
    cc = cent[m].mean() if m.any() else 0
    line.append("b%02d@%5.1f e%2.0f c%4.0f" % (i, t0, e, cc))
    if len(line) == 8:
        print(" | ".join(line)); line = []
if line: print(" | ".join(line))
# sezioni ripetute: chroma per battuta -> matrice di similarita' -> ricorrenze
chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=512)
tc = librosa.frames_to_time(np.arange(chroma.shape[1]), sr=sr, hop_length=512)
bc = []
for i, t0 in enumerate(bars):
    t1 = bars[i + 1] if i + 1 < len(bars) else t0 + 4 * k
    m = (tc >= t0) & (tc < t1)
    v = chroma[:, m].mean(axis=1) if m.any() else np.zeros(12)
    bc.append(v / (np.linalg.norm(v) + 1e-9))
bc = np.array(bc)
sim = bc @ bc.T
print("battute simili (coppie i<j con similarita' chroma > 0.97, a distanza >= 8 battute):")
pairs = [(i, j, sim[i, j]) for i in range(len(bc)) for j in range(i + 8, len(bc)) if sim[i, j] > 0.97]
# riassunto: per ogni battuta, la prima battuta precedente molto simile
for i in range(len(bc)):
    cand = [j for j in range(0, i - 7) if sim[i, j] > 0.97]
    if cand:
        print("  b%02d (%.1fs) ~ b%02d (%.1fs)" % (i, bars[i], cand[0], bars[cand[0]]))
