#!/usr/bin/env python3
"""Solo la voce (Oscar 14/11, serie Longevità: «va tolta la musica di sottofondo e lasciata solo la voce di Daniele, la musica
sarà aggiunta su Edits»). Nei reel tagliati da un video già montato la musica sta dentro l'audio del sorgente: qui si rifà la
traccia audio del reel togliendo la musica dal parlato (voce = audio − musica isolata, scripts/cn_music_stem.py) e lasciando la
CTA com'è in origine (solo il clic di «Pubblica», niente musica). Il video non viene ricodificato: si prende da una versione già finita.
Uso: python3 scripts/cn_voce.py ID versione_video versione_uscita     (es. L5-bugia v3 v4)
Passi: audio del reel da Remotion (solo audio, work/audio/ID.wav) → voce isolata fino all'inizio della CTA → stessa finitura di cn_finish.sh."""
import json, os, subprocess, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cn_music_stem import stem

ID, VIN, VOUT = sys.argv[1], sys.argv[2], sys.argv[3]
OUT = "out/ytcn51/consegna"; fin, fout = f"{OUT}/{ID}_{VIN}.mp4", f"{OUT}/{ID}_{VOUT}.mp4"
LUFS = os.environ.get("LUFS", "-13")
info = json.loads(subprocess.run(["npx", "tsx", "-e", f"import {{REELS}} from './src/cn/reels51'; const r=REELS.find(x=>x.id==='{ID}')!; console.log(JSON.stringify({{cta:r.props.ctaSeconds}}))"], capture_output=True, text=True).stdout.strip().splitlines()[-1])
cta = float(info["cta"])
os.makedirs("work/audio", exist_ok=True); raw = f"work/audio/{ID}.wav"
if not os.path.exists(raw):
    subprocess.run(["npx", "remotion", "render", ID, raw, "--codec=wav", "--log=error"], check=True)


def pcm(path, sr):
    return np.frombuffer(subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-vn", "-ac", "2", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).T.copy()


a = pcm(raw, 44100); D = a.shape[1] / 44100
cut = int((D - cta - 0.25) * 44100)             # fine del parlato + mezza coda: da qui in poi c'è solo la CTA (clic), che resta com'è
voce = a.copy(); voce[:, :cut] = a[:, :cut] - stem(a[:, :cut])
db = lambda v: 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-9)
tmp = f"work/audio/{ID}_voce.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", "44100", "-ac", "2", "-i", "-", "-ar", "48000", tmp], input=np.ascontiguousarray(voce.T).tobytes(), check=True)
# stessa finitura di cn_finish.sh: loudness, clic di «Pubblica» discreto, limitatore; video copiato dalla versione già finita
CA, CB = round(D - cta - 0.5 + 142 / 30 - 0.03, 3), round(D - cta - 0.5 + 142 / 30 + 0.3, 3)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", fin, "-i", tmp, "-map", "0:v", "-map", "1:a",
                "-af", f"loudnorm=I={LUFS}:TP=-1.5:LRA=11,volume=volume=0.3:enable='between(t,{CA},{CB})',alimiter=limit=0.75:level=disabled:attack=3:release=40,aresample=48000",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", fout], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", fout, "-vf", "scale=540:-2", "-c:v", "libx264", "-crf", "28", "-preset", "fast", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", fout.replace(".mp4", "_anteprima.mp4")], check=True)
if os.path.exists(fin.replace(".mp4", ".jpg")): subprocess.run(["cp", fin.replace(".mp4", ".jpg"), fout.replace(".mp4", ".jpg")])
w = int(0.2 * 44100); m = a[:, :cut].mean(0); v = voce[:, :cut].mean(0)
ev = np.array([db(v[i:i + w]) for i in range(0, len(v) - w, w)]); em = np.array([db(m[i:i + w]) for i in range(0, len(m) - w, w)]); q = np.argsort(ev)[:max(3, int(len(ev) * 0.12))]
print(f"{ID} {VIN}→{VOUT}: durata {D:.2f} s, parlato {np.median(em):.1f} → {np.median(ev):.1f} dB, pause {np.mean(em[q]):.1f} → {np.mean(ev[q]):.1f} dB, CTA {db(a[:, cut:]):.1f} dB (invariata)")
