#!/usr/bin/env python3
"""Musica anche sotto il pannello della CTA (Ross 12/11, serie Longevità): nei reel tagliati da un video già montato la musica
sta dentro l'audio del sorgente e si ferma con l'ultima parola. Qui la si fa continuare: dal sorgente si prende quello che viene
DOPO l'ultimo taglio, si toglie la voce (scripts/cn_music_stem.py) e la sola musica prosegue sotto la CTA, allo stesso livello
che aveva sotto la voce (poi sale un po', perché non c'è più il parlato) e sfuma in chiusura. Il video non viene ricodificato.
Uso: python3 scripts/cn_cta_music.py ID versione_ingresso versione_uscita     (es. L5-bugia v2 v3)"""
import json, os, subprocess, sys, tempfile
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cn_music_stem import stem, read as read441

ID, VIN, VOUT = sys.argv[1], sys.argv[2], sys.argv[3]
RAMP, FADE_OUT, XF = 1.0, 1.3, 0.09
OUT = "out/ytcn51/consegna"; fin, fout = f"{OUT}/{ID}_{VIN}.mp4", f"{OUT}/{ID}_{VOUT}.mp4"
info = json.loads(subprocess.run(["npx", "tsx", "-e", f"import {{REELS}} from './src/cn/reels51'; const r=REELS.find(x=>x.id==='{ID}')!; const s=r.props.segments as any[]; const l=s[s.length-1]; console.log(JSON.stringify({{src:r.props.src, end:l.to ?? l[1], cta:r.props.ctaSeconds}}))"], capture_output=True, text=True).stdout.strip().splitlines()[-1])
src, t_end, cta = "public/" + info["src"], float(info["end"]), float(info["cta"])


def pcm(path, sr, ch, start=None, dur=None):
    cmd = ["ffmpeg", "-loglevel", "error"] + (["-ss", str(start)] if start is not None else []) + (["-t", str(dur)] if dur is not None else []) + ["-i", path, "-vn", "-ac", str(ch), "-ar", str(sr), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, ch).T.copy()


SR = 48000
mix = pcm(fin, SR, 2); D = mix.shape[1] / SR
# 1) dove cade nel reel la fine dell'ultimo pezzo: correlazione fra l'audio del sorgente (ultimi secondi di parlato) e quello del reel
W = 3.6
a = pcm(src, 16000, 1, t_end - W - 0.2, W)[0]; f16 = pcm(fin, 16000, 1)[0]
lo = max(0, int((D - cta - 12) * 16000)); seg = f16[lo:]
n = len(seg) + len(a) - 1; nf = 1 << (n - 1).bit_length()
cc = np.fft.irfft(np.fft.rfft(seg, nf) * np.conj(np.fft.rfft(a, nf)), nf)[:len(seg) - len(a) + 1]
cs = np.concatenate([[0.0], np.cumsum(seg.astype(np.float64) ** 2)]); en = np.sqrt((cs[len(a):] - cs[:-len(a)]) * float(np.sum(a.astype(np.float64) ** 2)))
nc = cc / (en + 0.02 * float(en.max()) + 1e-12)      # correlazione normalizzata (il silenzio della CTA non deve vincere)
k = int(np.argmax(nc)); score = float(cc[k] / (en[k] + 1e-12))
t_f = (lo + k) / 16000 + W + 0.2      # tempo del reel che corrisponde a t_end del sorgente
m_fin = seg[k:k + len(a)]; gain = float(np.sqrt(np.mean(m_fin ** 2)) / (np.sqrt(np.mean(a ** 2)) + 1e-9))
if score < 0.6: raise SystemExit(f"{ID}: non trovo la fine del parlato nel reel (correlazione {score:.2f})")
# 2) sola musica: 24 s prima della fine del parlato (contesto per il modello e riserva) + il seguito del sorgente
PRE = 24.0; need = D - t_f + XF + 0.2
s441 = stem(read441(src, t_end - PRE, PRE + need))
tmp = tempfile.mkdtemp(prefix="cta_music_"); w441 = os.path.join(tmp, "stem.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", "44100", "-ac", "2", "-i", "-", w441], input=np.ascontiguousarray(s441.T).tobytes(), check=True)
allst = pcm(w441, SR, 2)
db = lambda v: 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-9)
# il seguito va bene finché resta la stessa musica: se entra un brano più forte o un effetto sonoro (più forte di tutto quello che
# c'era sotto la voce), da lì si torna con una dissolvenza di 1 s alla musica che stava sotto le ultime frasi
w = int(0.5 * SR); p0 = int((PRE - 20) * SR); pe = int(PRE * SR)
thr = max(db(allst[:, i:i + w]) for i in range(p0, pe - w + 1, w // 2)) + 3.0
S = need
for i in range(pe, allst.shape[1] - w + 1, w // 4):
    if db(allst[:, i:i + w]) > thr: S = max(2.0, (i - pe) / SR - 0.6); break
fwd = allst[:, int((PRE - XF) * SR):int((PRE - XF) * SR) + int(min(S + XF, need) * SR)]
if S < need - 0.3:
    XB = 1.0; rest = int((need - XF - S + XB) * SR); back = allst[:, pe - rest:pe]; nx = int(XB * SR); k = np.linspace(0, 1, nx, dtype=np.float32)
    st = np.concatenate([fwd[:, :-nx], fwd[:, -nx:] * np.sqrt(1 - k) + back[:, :nx] * np.sqrt(k), back[:, nx:]], axis=1)
else:
    st = fwd
# 3) inviluppo: entra in XF allo stesso livello che aveva sotto la voce, poi in RAMP secondi sale fino a TARGET_DB (non c'è più il parlato),
#    sfuma negli ultimi FADE_OUT secondi del reel
i0 = int(round((t_f - XF) * SR)); L = min(st.shape[1], mix.shape[1] - i0); t = np.arange(L) / SR
TARGET_DB, MAX_BOOST = -27.0, 18.0
boost = float(np.clip(TARGET_DB - (db(st[:, :L]) + 20 * np.log10(gain)), 0.0, MAX_BOOST))
env = np.clip(t / XF, 0, 1) * 10 ** (boost * np.clip((t - XF) / RAMP, 0, 1) / 20) * np.clip((D - (i0 / SR + t)) / FADE_OUT, 0, 1)
music = st[:, :L] * gain * env
out = mix.copy(); out[:, i0:i0 + L] += music
pk = float(np.max(np.abs(out)));
if pk > 0.89: out *= 0.89 / pk
wout = os.path.join(tmp, "mix.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", wout], input=np.ascontiguousarray(out.T).tobytes(), check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", fin, "-i", wout, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", fout], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", fout, "-vf", "scale=540:-2", "-c:v", "libx264", "-crf", "28", "-preset", "fast", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", fout.replace(".mp4", "_anteprima.mp4")], check=True)
if os.path.exists(fin.replace(".mp4", ".jpg")): subprocess.run(["cp", fin.replace(".mp4", ".jpg"), fout.replace(".mp4", ".jpg")])
r = lambda v: 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-9)
c0 = int((t_f + 1.5) * SR)
print(f"{ID} {VIN}→{VOUT}: fine parlato a {t_f:.2f} s (correlazione {score:.2f}), guadagno {20 * np.log10(gain):+.1f} dB, musica alzata di {boost:.1f} dB, seguito usato {min(S, need):.1f} s su {need:.1f}, CTA prima {r(mix[:, c0:]):.1f} dB → dopo {r(out[:, c0:]):.1f} dB, durata {D:.2f} s")
