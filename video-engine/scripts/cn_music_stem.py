#!/usr/bin/env python3
"""Sola musica da un audio con voce + musica (il parlato viene tolto): serve quando la musica è già dentro il sorgente
(video YouTube già montato) e deve continuare dove la voce non c'è, per esempio sotto il pannello della CTA.
Modello UVR MDX-Net «Inst HQ 3» (ONNX, gira con onnxruntime, niente torch): work/models/uvr/UVR-MDX-NET-Inst_HQ_3.onnx
(scaricato da huggingface.co/seanghay/uvr_models; non sta nel repo).
Uso: python3 scripts/cn_music_stem.py ingresso.(wav|mp4|webm) uscita.wav [inizio_s] [durata_s]
Come modulo: stem(samples_2xN_float32_44100) -> 2xN float32."""
import os, subprocess, sys
import numpy as np

SR, NFFT, HOP, DIM_F, DIM_T = 44100, 6144, 1024, 3072, 256
CHUNK, TRIM = HOP * (DIM_T - 1), NFFT // 2
GEN = CHUNK - 2 * TRIM
WIN = (0.5 - 0.5 * np.cos(2 * np.pi * np.arange(NFFT) / NFFT)).astype(np.float32)   # hann periodica, come torch.hann_window
MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "work", "models", "uvr", "UVR-MDX-NET-Inst_HQ_3.onnx")


def _stft(x):   # x: [CHUNK] -> [NFFT/2+1, DIM_T] complesso (center=True, riflessione ai bordi)
    p = np.pad(x, (TRIM, TRIM), mode="reflect")
    idx = np.arange(NFFT)[None, :] + HOP * np.arange(DIM_T)[:, None]
    return np.fft.rfft(p[idx] * WIN, axis=1).T.astype(np.complex64)


def _istft(S):   # S: [NFFT/2+1, DIM_T] -> [CHUNK]
    fr = np.fft.irfft(S.T, n=NFFT, axis=1).astype(np.float32) * WIN
    out = np.zeros(NFFT + HOP * (DIM_T - 1), np.float32); den = np.zeros_like(out)
    for t in range(DIM_T):
        out[t * HOP:t * HOP + NFFT] += fr[t]; den[t * HOP:t * HOP + NFFT] += WIN * WIN
    return (out / np.maximum(den, 1e-8))[TRIM:TRIM + CHUNK]


def stem(mix):
    import onnxruntime as ort
    so = ort.SessionOptions(); so.log_severity_level = 3
    sess = ort.InferenceSession(MODEL, so, providers=["CPUExecutionProvider"])
    n = mix.shape[1]; pad = GEN - n % GEN
    mp = np.concatenate([np.zeros((2, TRIM), np.float32), mix, np.zeros((2, pad + TRIM), np.float32)], axis=1)
    outs = []
    for i in range(0, n + pad, GEN):
        w = mp[:, i:i + CHUNK]
        spec = np.zeros((1, 4, DIM_F, DIM_T), np.float32)
        for c in range(2):
            S = _stft(w[c])[:DIM_F]; spec[0, 2 * c] = S.real; spec[0, 2 * c + 1] = S.imag
        o = 0.5 * sess.run(None, {"input": spec})[0] - 0.5 * sess.run(None, {"input": -spec})[0]   # media con il segno invertito: meno rumore
        res = []
        for c in range(2):
            S = np.zeros((NFFT // 2 + 1, DIM_T), np.complex64); S[:DIM_F] = o[0, 2 * c] + 1j * o[0, 2 * c + 1]
            res.append(_istft(S)[TRIM:-TRIM])
        outs.append(np.stack(res))
    return np.concatenate(outs, axis=1)[:, :n]


def read(path, start=None, dur=None):
    cmd = ["ffmpeg", "-loglevel", "error"] + (["-ss", str(start)] if start is not None else []) + (["-t", str(dur)] if dur is not None else []) + ["-i", path, "-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).T.copy()


def write(path, x, sr=SR):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "2", "-i", "-", path], input=np.ascontiguousarray(x.T).tobytes(), check=True)


if __name__ == "__main__":
    a = read(sys.argv[1], float(sys.argv[3]) if len(sys.argv) > 3 else None, float(sys.argv[4]) if len(sys.argv) > 4 else None)
    m = stem(a); write(sys.argv[2], m)
    r = lambda v: 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-9)
    print(f"{os.path.basename(sys.argv[1])}: {a.shape[1] / SR:.1f} s, mix {r(a):.1f} dB, musica {r(m):.1f} dB, voce tolta {r(a - m):.1f} dB")
