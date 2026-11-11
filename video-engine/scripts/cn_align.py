#!/usr/bin/env python3
"""Allineamento forzato parola per parola (wav2vec2 italiano, ONNX): dà l'istante reale di inizio e fine di ogni parola,
molto più preciso dei tempi di Whisper (che sbagliano anche di 0,2-0,4 s). Serve per agganciare grafiche e tagli al parlato.
Uso: python3 scripts/cn_align.py audio_o_video parole.json uscita.json [banda_s=3]
parole.json = formato caption di Remotion (text, startMs, endMs): i tempi di Whisper servono solo come guida (banda ±N s).
Modello: ~/.cache/cn_align/model_int8.onnx (XDcobra/wav2vec2-large-xlsr-53-italian-ONNX su Hugging Face)."""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np, onnxruntime as ort

U = "zero uno due tre quattro cinque sei sette otto nove dieci undici dodici tredici quattordici quindici sedici diciassette diciotto diciannove".split()
TENS = {2: "venti", 3: "trenta", 4: "quaranta", 5: "cinquanta", 6: "sessanta", 7: "settanta", 8: "ottanta", 9: "novanta"}
def numero(n):
    """Numeri in lettere (0-9999), per allineare le cifre della trascrizione al parlato."""
    if n < 20: return U[n]
    if n < 100:
        d, u = divmod(n, 10); t = TENS[d]
        return t if u == 0 else (t[:-1] if u in (1, 8) else t) + U[u]
    if n < 1000:
        c, r = divmod(n, 100); return ("cento" if c == 1 else U[c] + "cento") + (numero(r) if r else "")
    m, r = divmod(n, 1000); return ("mille" if m == 1 else numero(m) + "mila") + (numero(r) if r else "")
D = os.path.expanduser("~/.cache/cn_align"); SR = 16000; HOP = 320
vocab = json.load(open(f"{D}/vocab.json")); BLANK = vocab["<pad>"]; BAR = vocab["|"]

def norm(t):
    t = t.lower().replace("’", "'").replace("co₂", "ci o due")
    t = re.sub(r"\d+", lambda m: " " + numero(int(m.group())) + " ", t)
    return [w for w in re.sub(r"[^a-zàáèéìíòóùú' ]", " ", t).split() if w.strip("'")]

def emissions(x):
    s = ort.InferenceSession(f"{D}/model_int8.onnx", providers=["CPUExecutionProvider"])
    x = (x - x.mean()) / (x.std() + 1e-7)
    W, OV = 30 * SR, 2 * SR; out = []; pos = 0
    while pos < len(x):
        a, b = max(0, pos - OV), min(len(x), pos + W + OV)
        lg = s.run(None, {"input_values": x[None, a:b].astype(np.float32)})[0][0]
        lg = lg - np.logaddexp.reduce(lg, axis=1, keepdims=True)
        f0 = (pos - a) // HOP; f1 = f0 + (min(len(x), pos + W) - pos) // HOP
        out.append(lg[f0:f1]); pos += W
    return np.concatenate(out)

def align(em, toks, guide, band):
    T, N = len(em), len(toks); S = 2 * N + 1
    st = np.full(S, BLANK); st[1::2] = toks
    g = np.interp(np.arange(S), np.arange(1, S, 2), guide)  # fotogramma guida per ogni stato
    lo, hi = np.maximum(0, g - band).astype(int), np.minimum(T - 1, g + band).astype(int)
    skip = np.zeros(S, bool); skip[3::2] = toks[1:] != toks[:-1]
    NEG = -1e9; sc = np.full(S, NEG); sc[0] = em[0, BLANK]; sc[1] = em[0, st[1]]
    bp = np.zeros((T, S), np.int8)
    for t in range(1, T):
        a = sc; b = np.concatenate(([NEG], sc[:-1])); c = np.where(skip, np.concatenate(([NEG, NEG], sc[:-2])), NEG)
        m = np.maximum(np.maximum(a, b), c); bp[t] = np.where(m == a, 0, np.where(m == b, 1, 2))
        sc = m + em[t, st]; sc[(t < lo) | (t > hi)] = NEG
    s = S - 1 if sc[S - 1] >= sc[S - 2] else S - 2; path = np.zeros(T, int)
    for t in range(T - 1, -1, -1):
        path[t] = s; s -= int(bp[t, s])
    return path

if __name__ == "__main__":
    src, wj, outj = sys.argv[1:4]; band = float(sys.argv[4]) if len(sys.argv) > 4 else 3.0
    wav = tempfile.mktemp(suffix=".wav"); subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", str(SR), wav], check=True)
    f = wave.open(wav); x = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768; os.remove(wav)
    words = json.load(open(wj)); em = emissions(x)
    toks, guide, owner = [], [], []   # owner: indice della parola (del json) per ogni token; -1 = separatore
    for i, w in enumerate(words):
        parts = norm(w["text"]); n = sum(len(p) for p in parts) + max(0, len(parts) - 1)
        if not n: continue
        if toks: toks.append(BAR); guide.append(w["startMs"] / 1000 * SR / HOP); owner.append(-1)
        k = 0
        for pi, p in enumerate(parts):
            if pi: toks.append(BAR); guide.append(0); owner.append(i); k += 1
            for ch in p:
                toks.append(vocab.get(ch, vocab["<unk>"])); owner.append(i); k += 1
                guide.append(0)
        s0, s1 = w["startMs"] / 1000 * SR / HOP, w["endMs"] / 1000 * SR / HOP
        guide[-k:] = list(np.linspace(s0, max(s0, s1), k))
    path = align(em, np.array(toks), np.array(guide), band * SR / HOP)
    first, last = {}, {}
    for t, s in enumerate(path):
        if s % 2 == 1:
            o = owner[s // 2]
            if o >= 0: first.setdefault(o, t); last[o] = t
    diff = []
    for i, w in enumerate(words):
        if i in first:
            s, e = int(first[i] * HOP / SR * 1000), int((last[i] + 1) * HOP / SR * 1000)
            diff.append(s - w["startMs"]); w["whisperStartMs"] = w["startMs"]
            w["startMs"], w["endMs"], w["timestampMs"] = s, max(e, s + 40), (s + e) // 2
    json.dump(words, open(outj, "w"), ensure_ascii=False, indent=1)
    d = np.array(diff); print(f"{len(d)} parole allineate; scarto dai tempi di Whisper: mediana {np.median(d):.0f} ms, |scarto| medio {np.abs(d).mean():.0f} ms, oltre 150 ms: {(np.abs(d) > 150).sum()}, massimo {np.abs(d).max():.0f} ms")
