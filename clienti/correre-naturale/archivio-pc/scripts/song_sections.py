"""Confini di sezione (novelty di Foote su MFCC+chroma a risoluzione di colpo) e dettaglio colpi.
Uso: python scripts/song_sections.py work/evento/beats.json input/musica/brano.mp3 [t0 t1 ...finestre di dettaglio]
"""
import json, sys
import numpy as np
import librosa

beats = json.load(open(sys.argv[1]))
src = sys.argv[2]
b = np.array(beats["beats"])
y, sr = librosa.load(src, sr=22050, mono=True)
hop = 512
mf = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20, hop_length=hop)
ch = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
fr = librosa.time_to_frames(b, sr=sr, hop_length=hop)
mfs = librosa.util.sync(mf, fr, aggregate=np.mean)
chs = librosa.util.sync(ch, fr, aggregate=np.mean)
X = np.vstack([librosa.util.normalize(mfs, axis=0), chs])
X = X / (np.linalg.norm(X, axis=0, keepdims=True) + 1e-9)
S = X.T @ X
# novelty di Foote con kernel 16 colpi (4 battute) per lato
L = 16
k = np.outer(np.r_[-np.ones(L), np.ones(L)], np.r_[-np.ones(L), np.ones(L)])
k *= np.outer(np.hanning(2 * L), np.hanning(2 * L))
nov = np.zeros(S.shape[0])
for i in range(L, S.shape[0] - L):
    nov[i] = (S[i - L:i + L, i - L:i + L] * k).sum()
nov = np.maximum(nov, 0); nov /= nov.max() + 1e-9
peaks = librosa.util.peak_pick(nov, pre_max=8, post_max=8, pre_avg=16, post_avg=16, delta=0.05, wait=12)
ph = beats["downbeat_phase"]
print("confini di sezione (colpo, tempo, battuta dal downbeat, novelty):")
for p in peaks:
    print("  colpo %3d  t %6.2f  battuta %5.1f  nov %.2f" % (p, b[min(p, len(b) - 1)], (p - ph) / 4, nov[p]))
ob = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
ot = librosa.frames_to_time(np.arange(len(ob)), sr=sr, hop_length=hop)
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
wins = [float(v) for v in sys.argv[3:]]
for t0, t1 in zip(wins[::2], wins[1::2]):
    print("dettaglio %.1f-%.1f s: colpo (battuta.pos) forza_onset rms" % (t0, t1))
    for i, t in enumerate(b):
        if t0 <= t <= t1:
            j = np.searchsorted(ot, t)
            o = ob[max(0, j - 2):j + 3].max()
            r = rms[max(0, j - 2):j + 3].mean() * 100
            print("   %3d %6.2f  b%02d.%d  on %5.1f  rms %4.1f %s" % (i, t, (i - ph) // 4, (i - ph) % 4, o, r, "#" * int(o / 2)))
