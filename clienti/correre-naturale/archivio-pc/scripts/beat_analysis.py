"""Misura bpm, colpi e inviluppo di energia di un brano (librosa, venv_tts).
Uso: python scripts/beat_analysis.py input/musica/brano.mp3 work/evento/beats.json
"""
import json, sys
import numpy as np
import librosa

src, out = sys.argv[1], sys.argv[2]
y, sr = librosa.load(src, sr=22050, mono=True)
dur = len(y) / sr
onset = librosa.onset.onset_strength(y=y, sr=sr)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=onset, units="time", trim=False)
tempo = float(np.atleast_1d(tempo)[0])
beats = [float(b) for b in beats]
# bpm stimato dagli intervalli tra i colpi (mediana)
ivs = np.diff(beats)
bpm_med = 60.0 / float(np.median(ivs)) if len(ivs) else tempo
# energia RMS per secondo (per trovare i tratti piu' intensi)
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
t_rms = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
per_sec = {}
for t, v in zip(t_rms, rms):
    per_sec.setdefault(int(t), []).append(float(v))
energy = [float(np.mean(per_sec[k])) for k in sorted(per_sec)]
# downbeat stimati: colpo piu' forte in ogni gruppo di 4 (fase con somma massima)
ob = librosa.onset.onset_strength(y=y, sr=sr)
ot = librosa.frames_to_time(np.arange(len(ob)), sr=sr)
strength = [float(ob[min(len(ob) - 1, int(np.searchsorted(ot, b)))]) for b in beats]
phase = max(range(4), key=lambda p: sum(strength[p::4]))
res = dict(file=src, duration=round(dur, 3), tempo_librosa=round(tempo, 3), bpm_median=round(bpm_med, 3),
           n_beats=len(beats), beats=[round(b, 4) for b in beats], downbeat_phase=phase,
           beat_strength=[round(s, 3) for s in strength], energy_per_sec=[round(e, 4) for e in energy])
json.dump(res, open(out, "w"), indent=1)
print("durata %.2f s  bpm librosa %.2f  bpm mediana intervalli %.3f  colpi %d  fase downbeat %d"
      % (dur, tempo, bpm_med, len(beats), phase))
print("intervallo colpi: min %.3f max %.3f std %.4f" % (ivs.min(), ivs.max(), ivs.std()))
print("primi colpi:", [round(b, 2) for b in beats[:12]])
print("energia per secondo (x100):")
print(" ".join("%d:%d" % (i, e * 100) for i, e in enumerate(energy)))
