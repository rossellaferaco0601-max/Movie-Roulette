"""Motore di montaggio Reel Correre Naturale.

Pipeline: parole Whisper -> intervalli (tagli agganciati ai silenzi) -> pezzi video
(Volto / B-roll / Intero) da 4K -> audio + SFX -> grafiche PIL fotogramma per
fotogramma -> mux finale 1080x1920 30 fps.
"""
import json, math, os, re, subprocess, sys, wave
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "input", "longevita.webm")
PROXY = os.path.join(ROOT, "work", "proxy_360.mp4")
RAW48 = os.path.join(ROOT, "work", "src48.raw")
WORDS = os.path.join(ROOT, "work", "longevita_words.json")
FONTS = os.path.join(ROOT, "assets", "fonts")
EMOJI_FONT = "C:/Windows/Fonts/seguiemj.ttf"

FPS, W, H = 30, 1080, 1920
SW, SH = 3840, 2160
SR = 48000

GREEN = (73, 118, 46)
GREEN_D = (46, 77, 28)
BLUE = (184, 215, 234)
CREAM = (244, 241, 229)
INK = (24, 32, 18)
RED = (176, 64, 52)

# Zone del frame verticale (vedi PROPOSTE-REEL): il volto occupa ~x300-780, y250-900
FACE_BOX = (300, 250, 780, 900)
CAP_Y = 1060          # centro sottotitoli
CARD_Y = 1345         # centro schede
CARD_TOP = 1212       # le schede non salgono mai sopra questa riga (sottotitoli)
SIDE_L, SIDE_R, SIDE_Y = 165, 915, 600
INTERO_Y = 560        # centro della grafica originale nel layout Intero

# ---------------------------------------------------------------- tipi di scena
FACE = [(0, 4.2), (14.2, 20.7), (25.2, 27.7), (36.4, 45.9), (55.4, 58.7), (73.7, 84.6), (92.5, 93.5),
        (97.8, 100.4), (105.4, 112.2), (114.1, 116.2), (121.5, 128.4), (135.5, 138.0), (160.3, 164.7),
        (201.7, 204.2), (246.3, 251.8), (252.7, 255.4), (262.2, 264.3), (268.9, 277.5), (284.7, 289.5),
        (291.6, 295.0), (299.9, 303.8), (311.4, 317.0), (321.7, 325.5), (332.2, 340.8), (377.0, 378.7),
        (383.5, 388.6), (395.0, 406.7), (411.1, 416.5), (422.3, 425.6), (452.7, 454.9), (461.4, 473.5),
        (479.9, 483.9), (523.4, 538.0), (543.0, 549.3), (554.4, 561.4), (569.7, 573.4), (578.2, 589.4),
        (597.5, 602.3), (653.7, 661.6), (667.0, 671.8), (677.8, 701.1), (706.2, 720.5)]
CARD = [(20.7, 25.2), (58.7, 69.4), (84.6, 92.5), (93.5, 97.8), (112.2, 114.1), (128.4, 130.3),
        (138.0, 141.3), (148.6, 156.3), (164.7, 197.7), (197.7, 198.5), (211.2, 243.2), (251.8, 252.7),
        (264.3, 268.9), (277.5, 282.1), (289.5, 291.6), (340.8, 377.0), (416.5, 422.3), (425.6, 445.8),
        (485.7, 523.4), (593.8, 597.5), (610.3, 612.1), (612.1, 650.9)]
SCENE_CUTS = sorted({t for a, b in FACE + CARD for t in (a, b)} |
                    {float(x) for x in open(os.path.join(ROOT, "work", "scenes.txt")).read().split()})


def scene_type(t):
    for a, b in FACE:
        if a <= t < b:
            return "face"
    for a, b in CARD:
        if a <= t < b:
            return "card"
    return "broll"


# ---------------------------------------------------------------- parole
def _norm(w):
    return re.sub(r"[^\w%']", "", w.lower())


def _match(w, target):
    n, t = _norm(w), _norm(target)
    return n.startswith(t) or n.split("'")[-1].startswith(t)


def load_words():
    data = json.load(open(WORDS, encoding="utf-8"))
    toks = []
    for seg in data:
        for w in seg["words"]:
            txt = w["w"].strip()
            if not txt:
                continue
            # unisce apostrofi, %, migliaia e trattini al token precedente
            if toks and (txt[0] in "'%-" or re.match(r"^\.\d", txt) or txt in ("%", "%.", "%,")):
                toks[-1]["w"] += txt
                toks[-1]["e"] = w["e"]
                continue
            toks.append({"w": txt, "s": w["s"], "e": w["e"]})
    return apply_corrections(toks)


def _replace(toks, t0, t1, new):
    """Sostituisce i token con inizio in [t0,t1) con `new` [(testo, s, e)]."""
    out = [t for t in toks if not (t0 <= t["s"] < t1)]
    out += [{"w": a, "s": s, "e": e} for a, s, e in new]
    return sorted(out, key=lambda t: t["s"])


def apply_corrections(toks):
    toks = _replace(toks, 63.8, 64.5, [("lifespan,", 63.86, 64.76)])
    toks = _replace(toks, 67.9, 68.5, [("healthspan,", 67.96, 68.92)])
    toks = _replace(toks, 232.9, 234.4, [("10", 232.94, 233.42), ("minuti", 233.42, 233.98),
                                         ("al", 233.98, 234.02), ("giorno,", 234.02, 234.34)])
    toks = _replace(toks, 501.2, 501.45, [("la", 499.94, 500.30), ("struttura", 500.30, 500.76),
                                          ("del", 500.76, 500.86), ("cervello", 500.86, 501.2),
                                          ("che", 501.2, 501.46)])   # «che gestisce»: sentito nella ritrascrizione del 3/11
    # «E la differenza»: la "e" è attaccata a "la" (sentita in tre trascrizioni separate)
    toks = _replace(toks, 114.6, 114.97, [("E", 114.27, 114.31), ("la", 114.31, 114.45), ("differenza", 114.45, 114.98)])
    toks = _replace(toks, 564.3, 564.4, [("non", 564.34, 564.76)])
    toks = _replace(toks, 571.3, 571.6, [("il", 571.38, 571.45), ("limitatore", 571.45, 572.02)])
    toks = _replace(toks, 617.5, 619.75, [("Dopo", 617.64, 618.04), ("pranzo", 618.04, 618.52),
                                          ("è", 618.52, 618.68), ("uno", 618.68, 618.84), ("dei", 618.84, 618.94),
                                          ("momenti", 618.94, 619.32), ("migliori.", 619.32, 619.7)])
    for t in toks:
        t["w"] = t["w"].replace("allungo", "a lungo")
        if t["w"] == "dell'ippocampo." and 499 < t["s"] < 499.2:
            t["w"] = "dell'ippocampo,"
        if t["w"] == "cosa" and 610.5 < t["s"] < 610.6:   # primo sottotitolo di R6
            t["w"] = "Cosa"
    return toks


# ---------------------------------------------------------------- audio sorgente
@lru_cache(maxsize=1)
def src_audio():
    a = np.memmap(RAW48, dtype=np.int16, mode="r").reshape(-1, 2)
    return a


@lru_cache(maxsize=1)
def rms_track():
    a = src_audio().astype(np.float32).mean(axis=1) / 32768.0
    win = SR // 100  # 10 ms
    n = len(a) // win
    r = np.sqrt((a[: n * win].reshape(n, win) ** 2).mean(axis=1) + 1e-12)
    speech = r[r > np.percentile(r, 40)]
    thr = max(np.percentile(r, 12) * 2.5, np.median(speech) * 0.10)
    return r, thr


def _quiet(t0, t1):
    r, thr = rms_track()
    i0, i1 = max(0, int(t0 * 100)), int(t1 * 100)
    return r[i0:i1] < thr


def _runs(t0, t1, min_len=8):
    """Tratti silenziosi (>= min_len x 10 ms) in [t0,t1] come (inizio, fine)."""
    q = _quiet(max(t0, 0), t1)
    out, i = [], 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]:
                j += 1
            if j - i >= min_len:
                out.append((max(t0, 0) + i / 100, max(t0, 0) + j / 100))
            i = j
        else:
            i += 1
    return out


def snap_end(t, limit):
    """Primo tratto silenzioso (>=80 ms) dopo la fine stimata della parola; mai oltre limit."""
    if limit <= t + 0.04:
        return limit
    runs = _runs(t - 0.15, limit + 0.08)
    for r0, r1 in runs:
        if r1 > t:
            r0 = max(r0, t - 0.15)
            return min(r0 + min(0.12, (r1 - r0) / 2), limit)
    return limit


def snap_start(t, limit, hi):
    """Ultimo tratto silenzioso (>=80 ms) prima dell'attacco della parola, tra limit e hi."""
    limit = max(limit, 0.0)
    runs = [r for r in _runs(limit - 0.08, hi) if r[0] < hi - 0.05]
    if runs:
        r0, r1 = runs[-1][0], min(runs[-1][1], hi)
        return max(r1 - min(0.13, (r1 - r0) / 2), limit)
    return max(min(t, hi), limit)


def gap_has_speech(t0, t1):
    q = _quiet(t0, t1)
    return len(q) and (1 - q.mean()) > 0.30


# ---------------------------------------------------------------- intervalli
def build_intervals(reel, toks):
    groups = []
    for (a, b) in reel["parts"]:
        ws = [t for t in toks if a <= t["s"] < b]
        cur = [ws[0]]
        for w in ws[1:]:
            gap = w["s"] - cur[-1]["e"]
            if gap > 0.45 and not gap_has_speech(cur[-1]["e"] + 0.15, w["s"] - 0.1):
                groups.append(cur)
                cur = [w]
            else:
                cur.append(w)
        groups.append(cur)
    ivs = []
    for g in groups:
        first, last = g[0], g[-1]
        prev = max([t["e"] for t in toks if t["e"] <= first["s"] + 0.01 and t is not first] or [-1.0])
        nxt = min([t["s"] for t in toks if t["s"] >= last["e"] - 0.01 and t is not last] or [first["s"] + 999])
        s = snap_start(first["s"], max(prev + 0.10, first["s"] - 0.50), first["s"] + 0.15)
        e = snap_end(last["e"], min(nxt - 0.10, last["e"] + 0.50))
        ds, de = reel.get("adjust", {}).get(len(ivs), (0.0, 0.0))
        s, e = s + ds, e + de
        n = max(1, round((e - s) * FPS))
        ivs.append({"s": s, "e": s + n / FPS, "n": n, "words": g})
    o = 0
    for iv in ivs:
        iv["o"] = o
        o += iv["n"]
    return ivs


def src_to_out(ivs, t):
    """Tempo sorgente → tempo del reel (fuori dai pezzi: si aggancia al bordo del pezzo più vicino)."""
    prev = None
    for iv in ivs:
        if iv["s"] - 0.05 <= t <= iv["e"] + 0.05:
            return iv["o"] / FPS + min(max(t - iv["s"], 0), iv["n"] / FPS)
        if iv["s"] <= t:
            prev = iv
    if prev is not None:
        return (prev["o"] + prev["n"]) / FPS
    return ivs[0]["o"] / FPS


# ---------------------------------------------------------------- pezzi video
def plan_pieces(reel, ivs):
    overrides = reel.get("overrides", [])   # (src_a, src_b, video_src_start)
    zooms = reel.get("zoom_src", [])        # (src_a, src_b, z)
    pieces = []
    for gi, iv in enumerate(ivs):
        cuts = {iv["s"], iv["e"]}
        cuts |= {c for c in SCENE_CUTS if iv["s"] < c < iv["e"]}
        for a, b, _ in overrides:
            cuts |= {c for c in (a, b) if iv["s"] < c < iv["e"]}
        for a, b, _ in zooms:
            cuts |= {c for c in (a, b) if iv["s"] < c < iv["e"]}
        cuts = sorted(cuts)
        fr = sorted({round((c - iv["s"]) * FPS) for c in cuts} | {0, iv["n"]})
        for f0, f1 in zip(fr, fr[1:]):
            if f1 <= f0:
                continue
            t0 = iv["s"] + f0 / FPS
            mid = t0 + (f1 - f0) / FPS / 2
            vsrc, kind = t0, scene_type(mid)
            for a, b, v in overrides:
                if a <= mid < b:
                    vsrc = v + (t0 - a)
                    kind = scene_type(v + (mid - a))
            z = (1.0, 1.12)[gi % 2] if kind == "face" else (1.16, 1.22)[gi % 2] if kind == "card" else (1.0, 1.06)[gi % 2]
            for a, b, zz in zooms:
                if a <= mid < b:
                    z = zz
            pieces.append({"vsrc": vsrc, "n": f1 - f0, "kind": kind, "z": z})
    # pezzetti < 4 fotogrammi: prendono il tipo del vicino (evita flash di layout)
    for i, p in enumerate(pieces):
        if p["n"] < 4 and len(pieces) > 1:
            nb = pieces[i + 1] if i + 1 < len(pieces) else pieces[i - 1]
            if nb["kind"] != p["kind"]:
                p["vsrc"] = nb["vsrc"] if i + 1 < len(pieces) else nb["vsrc"] + nb["n"] / FPS
                p["kind"], p["z"] = nb["kind"], nb["z"]
    return pieces


_face_cache = {}


def face_cx(t):
    import cv2
    key = round(t, 1)
    if key in _face_cache:
        return _face_cache[key]
    cap = cv2.VideoCapture(PROXY)
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    xs = []
    for dt in (0.0, 0.3, 0.6):
        cap.set(cv2.CAP_PROP_POS_MSEC, (t + dt) * 1000)
        ok, f = cap.read()
        if not ok:
            continue
        fs = casc.detectMultiScale(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), 1.1, 5, minSize=(20, 20))
        if len(fs):
            x, y, w, h = max(fs, key=lambda r: r[2] * r[3])
            xs.append((x + w / 2) / f.shape[1])
    cap.release()
    cx = float(np.median(xs)) if xs else 0.475
    _face_cache[key] = cx
    return cx


def piece_filter(p):
    z = p["z"]
    if p["kind"] in ("face", "broll"):
        h = int(round(SH / z / 2) * 2)
        w = int(round(h * 9 / 16 / 2) * 2)
        cx = face_cx(p["vsrc"]) * SW if p["kind"] == "face" else SW / 2
        x = int(min(max(cx - w / 2, 0), SW - w))
        y = int(min(max(0.30 * SH - 0.30 * h, 0), SH - h))
        return f"crop={w}:{h}:{x}:{y},scale={W}:{H}:flags=lanczos,fps={FPS},setsar=1"
    fw = int(round(W * z / 2) * 2)
    fh = int(round(fw * 9 / 16 / 2) * 2)
    return (f"setpts=PTS-STARTPTS,scale={fw}:{fh}:flags=lanczos,crop={W}:{fh}[fg];color=c=0xF4F1E5:s={W}x{H}:r=24000/1001[bg];"
            f"[bg][fg]overlay=0:{INTERO_Y - fh // 2}:shortest=1,fps={FPS},setsar=1")


def render_piece(args):
    i, p, out = args
    if os.path.exists(out):
        return out
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{p['vsrc']:.3f}", "-i", SRC, "-frames:v", str(p["n"]),
           "-filter_complex", f"[0:v]{piece_filter(p)}[v]", "-map", "[v]", "-an",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", out]
    subprocess.run(cmd, check=True)
    return out


def render_base(reel, pieces, workdir, cta_frames):
    os.makedirs(workdir, exist_ok=True)
    jobs = []
    for i, p in enumerate(pieces):
        tag = f"{p['vsrc']:.3f}_{p['n']}_{p['kind']}_{p['z']:.2f}"
        jobs.append((i, p, os.path.join(workdir, f"p{i:03d}_{tag}.mp4")))
    with ThreadPoolExecutor(4) as ex:
        outs = list(ex.map(render_piece, jobs))
    tail = os.path.join(workdir, f"tail_{cta_frames}.mp4")
    if not os.path.exists(tail):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=c=0xF4F1E5:s={W}x{H}:r={FPS}",
                        "-frames:v", str(cta_frames), "-c:v", "libx264", "-preset", "veryfast", "-crf", "14",
                        "-pix_fmt", "yuv420p", tail], check=True)
    lst = os.path.join(workdir, "list.txt")
    with open(lst, "w") as f:
        for o in outs + [tail]:
            f.write(f"file '{os.path.basename(o)}'\n")
    base = os.path.join(workdir, "base.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", base], check=True)
    return base


# ---------------------------------------------------------------- audio
def synth_sfx(kind):
    if kind == "pop":
        t = np.arange(int(SR * 0.09)) / SR
        f = 1100 * np.exp(-t * 18) + 380
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38)
    else:  # impact: colpo basso morbido
        t = np.arange(int(SR * 0.45)) / SR
        f = 95 * np.exp(-t * 6) + 45
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
        rng = np.random.default_rng(1)
        n = rng.standard_normal(len(t)) * np.exp(-t * 40) * 0.25
        n = np.convolve(n, np.ones(24) / 24, mode="same")
        s = s + n
    s = s / np.abs(s).max()
    return np.stack([s, s], axis=1)


def build_audio(ivs, sfx_list, total_frames, out):
    a = src_audio()
    parts = []
    fade = int(SR * 0.006)
    for iv in ivs:
        i0 = int(round(iv["s"] * SR))
        n = int(round(iv["n"] * SR / FPS))
        seg = a[i0:i0 + n].astype(np.float32) / 32768.0
        if len(seg) < n:
            seg = np.vstack([seg, np.zeros((n - len(seg), 2), np.float32)])
        ramp = np.linspace(0, 1, fade)[:, None]
        seg[:fade] *= ramp
        seg[-fade:] *= ramp[::-1]
        parts.append(seg)
    voice = np.vstack(parts)
    total = int(round(total_frames * SR / FPS))
    mix = np.zeros((total, 2), np.float32)
    mix[:len(voice)] = voice[:total]
    peak = np.percentile(np.abs(voice), 99.9)
    for t, kind, vol in sfx_list:
        s = synth_sfx(kind) * peak * vol
        i0 = int(t * SR)
        mix[i0:i0 + len(s)] += s[: max(0, total - i0)]
    mix = np.clip(mix, -1, 1)
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    return out


# ---------------------------------------------------------------- grafica
@lru_cache(maxsize=64)
def font(weight, size):
    if weight == "emoji":
        return ImageFont.truetype(EMOJI_FONT, size)
    return ImageFont.truetype(os.path.join(FONTS, f"Blinker-{weight}.ttf"), size)


def text_size(txt, f, stroke=0):
    b = f.getbbox(txt, stroke_width=stroke)
    return b[2] - b[0], b[3] - b[1], b


def rrect(size, radius, fill, shadow=True, outline=None, ow=0):
    w, h = size
    pad = 24 if shadow else 0
    im = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    if shadow:
        sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle((pad, pad + 8, pad + w, pad + h + 8), radius, fill=(0, 0, 0, 110))
        im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(12)))
    ImageDraw.Draw(im).rounded_rectangle((pad, pad, pad + w, pad + h), radius, fill=fill, outline=outline, width=ow)
    return im, pad


def draw_text(im, xy, txt, f, fill, stroke=0, sfill=None, anchor="mm"):
    ImageDraw.Draw(im).text(xy, txt, font=f, fill=fill, stroke_width=stroke, stroke_fill=sfill, anchor=anchor)


def emoji_img(ch, size):
    f = font("emoji", 109)
    im = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((80, 80), ch, font=f, embedded_color=True, anchor="mm")
    bb = im.getbbox() or (0, 0, 160, 160)
    im = im.crop(bb)
    s = size / max(im.size)
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)


def ease_back(x):
    x = min(max(x, 0), 1)
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def pop(trel, dur, intro=0.22, outro=0.15, s0=0.6):
    if trel < 0 or trel > dur:
        return None
    sc = s0 + (1 - s0) * ease_back(trel / intro)
    al = min(1, trel / 0.10)
    if trel > dur - outro:
        k = (dur - trel) / outro
        al *= k
        sc *= 0.94 + 0.06 * k
    return round(sc, 3), round(al, 3)


class Sprite:
    """Elemento grafico: una immagine statica con animazione pop in/out."""

    def __init__(self, t0, dur, img, cx, cy, s0=0.6, big=False, bob=0.0):
        self.t0, self.dur, self.img, self.cx, self.cy = t0, dur, img, cx, cy
        self.s0, self.big, self.bob = s0, big, bob

    def state(self, t):
        st = pop(t - self.t0, self.dur, s0=self.s0)
        if st is None:
            return None
        dy = 0
        if self.bob and st[0] == 1.0:
            dy = round(math.sin((t - self.t0) * 2 * math.pi * 0.8) * self.bob)
        return (id(self), st[0], st[1], dy)


# ---------------------------------------------------------------- schede
def card_box(lines, width=860, title=None, accent=GREEN):
    """lines: [(testo, peso, size, colore)]. Scheda crema con titolo verde."""
    pad = 34
    hs = []
    for txt, wgt, sz, col in lines:
        hs.append(int(sz * 1.18))
    th = 0
    if title:
        th = 64
    h = pad * 2 + sum(hs) + th
    im, p = rrect((width, h), 34, CREAM + (250,))
    y = p + pad
    if title:
        pill_w = text_size(title, font("Black", 34))[0] + 44
        d = ImageDraw.Draw(im)
        d.rounded_rectangle((p + width // 2 - pill_w // 2, y - 6, p + width // 2 + pill_w // 2, y + 44), 22, fill=accent)
        draw_text(im, (p + width // 2, y + 19), title, font("Black", 34), CREAM)
        y += th
    for (txt, wgt, sz, col), hh in zip(lines, hs):
        draw_text(im, (p + width // 2, y + hh // 2), txt, font(wgt, sz), col)
        y += hh
    return im


def versus_card(left, right, width=900):
    """left/right: (numero, etichetta, colore)."""
    h = 300
    im, p = rrect((width, h), 34, CREAM + (250,))
    d = ImageDraw.Draw(im)
    half = width // 2
    d.line((p + half, p + 40, p + half, p + h - 40), fill=(200, 196, 180), width=4)
    for i, (num, lab, col) in enumerate((left, right)):
        cx = p + half * i + half // 2
        draw_text(im, (cx, p + 120), num, font("Black", 128), col)
        draw_text(im, (cx, p + 235), lab, font("Bold", 40), INK)
    return im


def check_rows(items, width=860, title=None, marks=None):
    """items: [testo]; marks: lista di 'ok'/'no'. Ritorna funzione n_visibili -> img."""
    rh = 84
    th = 64 if title else 0

    @lru_cache(maxsize=16)
    def make(nvis):
        h = 40 + th + rh * len(items) + 20
        im, p = rrect((width, h), 34, CREAM + (250,))
        d = ImageDraw.Draw(im)
        y = p + 30
        if title:
            draw_text(im, (p + width // 2, y + 24), title, font("Black", 50), GREEN_D)
            y += th
        for i, txt in enumerate(items):
            if i < nvis:
                ok = (marks or ["ok"] * len(items))[i] == "ok"
                col = GREEN if ok else RED
                cx, cy = p + 70, y + rh // 2
                d.ellipse((cx - 30, cy - 30, cx + 30, cy + 30), fill=col)
                draw_text(im, (cx, cy + 2), "✓" if ok else "✕", font("Black", 44), CREAM)
                draw_text(im, (p + 125, cy), txt, font("Bold", 60), INK, anchor="lm")
            y += rh
        return im

    return make


def pill(txt, size=46, fill=GREEN, col=CREAM, weight="Bold"):
    f = font(weight, size)
    tw, th, _ = text_size(txt, f)
    im, p = rrect((tw + 56, int(size * 1.55)), int(size * 0.77), fill + (255,) if len(fill) == 3 else fill)
    draw_text(im, (im.width // 2, im.height // 2 + 1), txt, f, col)
    return im


def big_word(txt, size=210):
    f = font("Black", size)
    lines = txt.split("\n")
    sizes = [text_size(l, f, 10) for l in lines]
    w = max(s[0] for s in sizes) + 60
    # riduce finché sta nei 1000 px
    while w > 1010 and size > 90:
        size -= 10
        f = font("Black", size)
        sizes = [text_size(l, f, 10) for l in lines]
        w = max(s[0] for s in sizes) + 60
    lh = int(size * 1.0)
    h = lh * len(lines) + 60
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for i, l in enumerate(lines):
        y = 30 + lh * i + lh // 2
        draw_text(sh, (w // 2 + 6, y + 10), l, f, (0, 0, 0, 160), stroke=10, sfill=(0, 0, 0, 160))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(8)))
    for i, l in enumerate(lines):
        y = 30 + lh * i + lh // 2
        draw_text(im, (w // 2, y), l, f, CREAM, stroke=10, sfill=GREEN_D)
    return im


# ---------------------------------------------------------------- sottotitoli
PROPER = {"italia", "correre", "naturale", "achille", "running", "school", "daniele"}


def clean_word(w, first):
    w = re.sub(r"[.,;:!…]+$", "", w)
    w = w.replace("’", "'")
    if w and not first:
        pass
    if w and w[0].isupper() and _norm(w) not in PROPER and not w.isupper():
        w = w[0].lower() + w[1:]
    return w


def build_captions(ivs, highlights):
    toks = []
    for iv in ivs:
        for w in iv["words"]:
            toks.append({"w": w["w"], "s": src_to_out(ivs, w["s"]), "e": src_to_out(ivs, w["e"]), "src": w["s"]})
    hl = set()
    for word, t in highlights:
        cands = [i for i, k in enumerate(toks) if _match(k["w"], word) and abs(k["src"] - t) < 2.5]
        if cands:
            hl.add(min(cands, key=lambda i: abs(toks[i]["src"] - t)))
        else:
            print("  !! highlight non trovato:", word, t)
    chunks, cur = [], []
    for i, k in enumerate(toks):
        txt = clean_word(k["w"], not cur)
        if not txt:
            continue
        item = dict(k, txt=txt, hl=i in hl)
        if cur:
            prev = cur[-1]
            chars = sum(len(c["txt"]) + 1 for c in cur) + len(txt)
            if (len(cur) >= 3 or chars > 16 or re.search(r"[.,?!:;]$", prev["w"]) or k["s"] - prev["e"] > 0.35
                    or prev["hl"] or (item["hl"] and chars > 14)):
                chunks.append(cur)
                cur = []
        cur.append(item)
    if cur:
        chunks.append(cur)
    for j, c in enumerate(chunks):
        c0 = c[0]["s"] - 0.05
        nxt = chunks[j + 1][0]["s"] - 0.05 if j + 1 < len(chunks) else 1e9
        end = min(nxt, c[-1]["e"] + 0.45)
        for it in c:
            it["chunk_t0"], it["chunk_t1"] = c0, end
    return chunks


@lru_cache(maxsize=512)
def caption_img(key):
    """key: tuple di (testo, hl, visibile)."""
    lines, cur = [], []
    for txt, hl, vis in key:
        if hl:
            if cur:
                lines.append(("n", cur))
                cur = []
            lines.append(("h", [(txt, vis)]))
        else:
            cur.append((txt, vis))
    if cur:
        lines.append(("n", cur))
    fn, fh = font("ExtraBold", 94), font("Black", 118)
    rendered = []
    for kind, ws in lines:
        if kind == "n":
            full = " ".join(t for t, _ in ws)
            tw, th, _ = text_size(full, fn, 8)
            im = Image.new("RGBA", (tw + 40, 128), (0, 0, 0, 0))
            x = 20
            for t, vis in ws:
                ww = text_size(t + " ", fn, 8)[0] if t != ws[-1][0] else text_size(t, fn, 8)[0]
                if vis:
                    draw_text(im, (x, 64), t, fn, (255, 255, 255), stroke=9, sfill=(18, 24, 14), anchor="lm")
                x += text_size(t, fn, 8)[0] + text_size(" ", fn)[0] + 4
            rendered.append(im)
        else:
            t, vis = ws[0]
            tw, th, _ = text_size(t, fh)
            im, p = rrect((tw + 60, 146), 32, GREEN + (255,))
            if not vis:
                im = Image.new("RGBA", im.size, (0, 0, 0, 0))
            else:
                draw_text(im, (im.width // 2, im.height // 2 - 2), t, fh, CREAM)
            rendered.append(im)
    w = max(r.width for r in rendered)
    h = sum(r.height for r in rendered) - 10 * (len(rendered) - 1)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    y = 0
    for r in rendered:
        out.alpha_composite(r, ((w - r.width) // 2, y))
        y += r.height - 10
    return out


# ---------------------------------------------------------------- composizione
class Overlay:
    def __init__(self, reel, ivs, total_frames, video_frames):
        self.reel, self.ivs = reel, ivs
        self.total, self.vframes = total_frames, video_frames
        self.sprites = []          # Sprite
        self.dynamic = []          # (t0, t1, fn(t)->[(img,cx,cy,sc,al)], keyfn)
        self.hide_caps = []        # (t0, t1)
        self.chunks = build_captions(ivs, reel.get("highlights", []))
        self.sfx = []
        self.log = []              # (tipo, t0, t1, bbox) per i controlli

    def at(self, anchor):
        word, t = anchor
        best, bd = None, 9e9
        for iv in self.ivs:
            for w in iv["words"]:
                if _match(w["w"], word) and abs(w["s"] - t) < bd:
                    best, bd = w, abs(w["s"] - t)
        if best is None or bd > 2.5:
            raise ValueError(f"ancora non trovata {anchor}")
        return src_to_out(self.ivs, best["s"])

    def add(self, t0, dur, img, cx, cy, kind="card", **kw):
        if kind == "card":
            cy = max(cy, CARD_TOP + img.height // 2 - 24)
        sp = Sprite(t0, dur, img, cx, cy, **kw)
        self.sprites.append(sp)
        self.log.append((kind, t0, t0 + dur, (cx - img.width // 2, cy - img.height // 2,
                                               cx + img.width // 2, cy + img.height // 2)))
        return sp

    def frame_items(self, t):
        items = []
        if t < self.vframes / FPS:
            hidden = any(a <= t < b for a, b in self.hide_caps)
            if not hidden:
                for c in self.chunks:
                    if c[0]["chunk_t0"] <= t < c[0]["chunk_t1"]:
                        key = tuple((it["txt"], it["hl"], t >= it["s"] - 0.06) for it in c)
                        trel = t - c[0]["chunk_t0"]
                        sc = round(0.86 + 0.14 * ease_back(trel / 0.16), 3) if trel < 0.16 else 1.0
                        items.append(("cap", key, CAP_Y, sc, 1.0, 0))
                        break
        for sp in self.sprites:
            st = sp.state(t)
            if st:
                items.append(("sp", sp, sp.cy + st[3], st[1], st[2], 0))
        for t0, t1, fn, keyfn in self.dynamic:
            if t0 <= t < t1:
                items.append(("dyn", (fn, keyfn(t)), t, 1, 1, 0))
        return items

    def render(self, t):
        items = self.frame_items(t)
        key = tuple((a, (b if a != "sp" else id(b)), c, d, e) if a != "dyn" else (a, b[1]) for a, b, c, d, e, _ in items)
        if key == getattr(self, "_lastkey", None):
            return self._lastbytes
        frame = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        for kind, obj, y, sc, al, _ in items:
            if kind == "cap":
                img, cx, cy = caption_img(obj), W // 2, y
            elif kind == "sp":
                img, cx, cy = obj.img, obj.cx, y
            else:
                for img, cx, cy, sc2, al2 in obj[0](t):
                    self._paste(frame, img, cx, cy, sc2, al2)
                continue
            self._paste(frame, img, cx, cy, sc, al)
        self._lastkey, self._lastbytes = key, frame.tobytes()
        return self._lastbytes

    @staticmethod
    def _paste(frame, img, cx, cy, sc, al):
        if sc != 1.0:
            img = img.resize((max(1, int(img.width * sc)), max(1, int(img.height * sc))), Image.BILINEAR)
        if al < 1.0:
            img = img.copy()
            a = img.getchannel("A").point(lambda v: int(v * al))
            img.putalpha(a)
        frame.alpha_composite(img, (int(cx - img.width / 2), int(cy - img.height / 2)))


# ---------------------------------------------------------------- copertina hook e CTA
def cover_layer(ov, kicker, lines, dur=2.9):
    """Copertina animata 'Parliamo di…': lines = lista di stringhe, parola tra {} evidenziata."""
    fk = font("Black", 40)
    fl = font("ExtraBold", 92)
    fh = font("Black", 108)
    words = []
    y = 0
    for li, line in enumerate(lines):
        for m in re.finditer(r"\{([^}]+)\}|(\S+)", line):
            words.append((li, m.group(1) or m.group(2), bool(m.group(1))))
    # layout statico
    line_imgs = []
    for li in range(len(lines)):
        ws = [(t, h) for l, t, h in words if l == li]
        line_imgs.append(ws)
    box_w = 1000

    def fn(t):
        out = []
        tr = t
        # pannello
        st = pop(tr, dur, intro=0.25, s0=0.85)
        if not st:
            return out
        panel = _cover_panel(len(lines))
        out.append((panel, W // 2, CARD_Y + 40, st[0], st[1] * 0.96))
        kp = _cover_kicker(kicker)
        stk = pop(tr - 0.05, dur - 0.05, s0=0.5)
        if stk:
            out.append((kp, W // 2, CARD_Y - 140, stk[0], stk[1]))
        idx = 0
        ytop = CARD_Y - 15
        for li, ws in enumerate(line_imgs):
            # misura la riga
            parts = []
            for txt, h in ws:
                img = _cover_word(txt, h)
                parts.append(img)
            total = sum(p.width for p in parts) + 18 * (len(parts) - 1)
            x = W // 2 - total // 2
            for img in parts:
                stw = pop(tr - 0.18 - idx * 0.09, dur - 0.18 - idx * 0.09, intro=0.2, s0=0.4)
                if stw:
                    out.append((img, x + img.width // 2, ytop + li * 118, stw[0], stw[1]))
                x += img.width + 18
                idx += 1
        return out

    ov.dynamic.append((0, dur, fn, lambda t: round(min(t, 1.2) * 30)))
    ov.log.append(("cover", 0, dur, (40, CARD_Y - 200, 1040, CARD_Y + 200)))


@lru_cache(maxsize=8)
def _cover_panel(nlines):
    im, p = rrect((1000, 340 + 118 * (nlines - 2)), 44, CREAM + (246,))
    return im


@lru_cache(maxsize=8)
def _cover_kicker(txt):
    return pill(txt, size=48, fill=GREEN, col=CREAM, weight="Black")


@lru_cache(maxsize=64)
def _cover_word(txt, hl):
    if hl:
        f = font("Black", 104)
        tw = text_size(txt, f)[0]
        im, p = rrect((tw + 44, 120), 26, GREEN + (255,), shadow=False)
        draw_text(im, (im.width // 2, im.height // 2 - 2), txt, f, CREAM)
        return im
    f = font("ExtraBold", 92)
    tw, th, _ = text_size(txt, f)
    im = Image.new("RGBA", (tw + 8, 120), (0, 0, 0, 0))
    draw_text(im, (im.width // 2, 58), txt, f, GREEN_D)
    return im


def cta_layer(ov, keyword, sub):
    t0 = ov.vframes / FPS
    dur = (ov.total - ov.vframes) / FPS

    @lru_cache(maxsize=4)
    def static():
        im = Image.new("RGBA", (W, H), CREAM + (255,))
        d = ImageDraw.Draw(im)
        draw_text(im, (W // 2, 330), "CORRERE NATURALE®", font("Black", 66), GREEN)
        d.line((W // 2 - 120, 395, W // 2 + 120, 395), fill=GREEN, width=5)
        draw_text(im, (W // 2, 660), "Scrivimi in DM", font("ExtraBold", 110), INK)
        fs = 60
        while text_size(sub, font("Bold", fs))[0] > 960:
            fs -= 2
        draw_text(im, (W // 2, 1230), sub, font("Bold", fs), GREEN_D)
        draw_text(im, (W // 2, 1420), "Daniele Vecchioni", font("Bold", 52), (90, 96, 80))
        return im

    @lru_cache(maxsize=4)
    def bubble(n):
        f = font("Black", 190)
        tw = text_size(keyword, f)[0]
        im, p = rrect((max(tw + 120, 520), 300), 70, GREEN + (255,))
        if n == 0:
            for i in range(3):
                d = ImageDraw.Draw(im)
                cx = im.width // 2 + (i - 1) * 70
                d.ellipse((cx - 18, im.height // 2 - 18, cx + 18, im.height // 2 + 18), fill=CREAM)
        else:
            draw_text(im, (im.width // 2, im.height // 2 - 8), keyword, f, CREAM)
        return im

    def fn(t):
        tr = t - t0
        out = [(static(), W // 2, H // 2, 1, min(1, tr / 0.25))]
        ph = 0 if tr < 0.6 else 1
        st = pop(tr - (0.15 if ph == 0 else 0.6), dur, s0=0.7)
        if st:
            out.append((bubble(ph), W // 2, 920, st[0], st[1]))
        e = emoji_img("📩", 120)
        st2 = pop(tr - 0.9, dur, s0=0.3)
        if st2:
            out.append((e, W // 2, 1110, st2[0], st2[1]))
        return out

    ov.dynamic.append((t0, t0 + dur + 1, fn, lambda t: (round(min(t - t0, 1.4) * 30))))


# ---------------------------------------------------------------- effetti dichiarativi
def apply_fx(ov, fx):
    for e in fx:
        typ = e["type"]
        t = ov.at(e["at"])
        if "until" in e:
            dur = ov.at(e["until"]) - t + e.get("pad", 0.4)
        else:
            dur = e.get("dur", 2.5)
        if typ == "emoji":
            # di default nella zona schede (sotto i sottotitoli); "R"/"L" = accanto al volto
            pos = e.get("pos", "C")
            x = e.get("x", {"L": SIDE_L, "R": SIDE_R, "C": W // 2}[pos])
            y = e.get("y", SIDE_Y if pos in "LR" else CARD_Y)
            size = e.get("size", 150 if pos in "LR" else 190)
            ov.add(t, dur, emoji_img(e["char"], size), x, y, "emoji", s0=0.3, bob=6)
        elif typ == "big":
            dur = min(dur, 1.5)
            ov.add(t, dur, big_word(e["text"], e.get("size", 210)), W // 2, e.get("y", CAP_Y + 20), "big", s0=0.5)
            ov.hide_caps.append((t - 0.02, t + dur))
        elif typ == "card":
            ov.add(t, dur, card_box(e["lines"], e.get("width", 860), e.get("title")), W // 2, CARD_Y, "card")
        elif typ == "versus":
            full = versus_card(tuple(e["left"]), tuple(e["right"]))
            # la colonna destra compare sulla sua parola: due sprite sovrapposti
            tr = ov.at(e["right_at"])
            ov.add(t, tr - t + 0.15, versus_card(tuple(e["left"]), ("", "", INK)), W // 2, CARD_Y, "card")
            ov.add(tr, t + dur - tr, full, W // 2, CARD_Y, "card", s0=1.0)
        elif typ == "pill":
            ov.add(t, dur, pill(e["text"], e.get("size", 48), e.get("fill", GREEN)), e.get("x", W // 2),
                   e.get("y", CARD_Y), "card")
        elif typ == "pills":   # pill impilate che compaiono una per parola
            times = [ov.at(a) for a in e["items_at"]]
            end = ov.at(e["until"]) + 0.5 if "until" in e else times[-1] + 1.6
            n = len(e["items"])
            for i, (txt, ti) in enumerate(zip(e["items"], times)):
                col, row = i % 2, i // 2
                x = W // 2 + (-250 if col == 0 else 250) if n > 1 else W // 2
                y = CARD_Y - 50 + row * 140
                ov.add(ti, end - ti, pill(txt, 50, GREEN), x, y, "card", s0=0.4)
        elif typ == "checklist":
            times = [ov.at(a) for a in e["items_at"]]
            make = check_rows(tuple(e["items"]), e.get("width", 860), e.get("title"), tuple(e.get("marks", [])) or None)
            end = ov.at(e["until"]) + 0.6 if "until" in e else times[-1] + 2.0
            t_start = t
            base = make(len(e["items"]))
            ov.log.append(("card", t_start, end, (W // 2 - base.width // 2, CARD_Y - base.height // 2,
                                                  W // 2 + base.width // 2, CARD_Y + base.height // 2)))

            def fn(tt, make=make, times=times, t_start=t_start, end=end):
                nvis = sum(1 for x in times if tt >= x - 0.05)
                st = pop(tt - t_start, end - t_start, s0=0.7)
                if not st:
                    return []
                im = make(nvis)
                return [(im, W // 2, max(CARD_Y, CARD_TOP + im.height // 2 - 24), st[0], st[1])]

            def kf(tt, times=times, t_start=t_start, end=end):
                st = pop(tt - t_start, end - t_start, s0=0.7)
                return (id(make), sum(1 for x in times if tt >= x - 0.05), st)

            ov.dynamic.append((t_start, end, fn, kf))
        elif typ == "bar":   # barra che si riempie / svuota
            frm, to, label = e.get("from", 0.0), e.get("to", 1.0), e["label"]
            t_start, d = t, dur

            @lru_cache(maxsize=64)
            def barimg(k, label=label):
                im, p = rrect((820, 190), 34, CREAM + (250,))
                dd = ImageDraw.Draw(im)
                draw_text(im, (p + 410, p + 50), label, font("Black", 46), GREEN_D)
                dd.rounded_rectangle((p + 50, p + 100, p + 770, p + 150), 25, fill=(214, 210, 195))
                if k > 0.02:
                    dd.rounded_rectangle((p + 50, p + 100, p + 50 + int(720 * k), p + 150), 25, fill=GREEN)
                return im

            def fn(tt, t_start=t_start, d=d, frm=frm, to=to, barimg=barimg):
                st = pop(tt - t_start, d, s0=0.7)
                if not st:
                    return []
                k = frm + (to - frm) * min(1, max(0, (tt - t_start - 0.2) / max(0.4, d - 0.8)))
                return [(barimg(round(k, 2)), W // 2, CARD_Y, st[0], st[1])]

            ov.dynamic.append((t_start, t_start + d, fn,
                               lambda tt, t_start=t_start, d=d, frm=frm, to=to: (
                                   id(barimg), pop(tt - t_start, d, s0=0.7),
                                   round(frm + (to - frm) * min(1, max(0, (tt - t_start - 0.2) / max(0.4, d - 0.8))), 2))))
            ov.log.append(("card", t_start, t_start + d, (W // 2 - 434, CARD_Y - 119, W // 2 + 434, CARD_Y + 119)))
        elif typ == "tracker":   # 1-2-3 in alto
            steps = [ov.at(a) for a in e["items_at"]]
            end = ov.at(e["until"]) + 0.3
            t_start = t

            @lru_cache(maxsize=8)
            def trk(k):
                im, p = rrect((420, 120), 60, CREAM + (240,))
                dd = ImageDraw.Draw(im)
                for i in range(3):
                    cx = p + 85 + i * 125
                    cy = p + 60
                    on = i < k
                    dd.ellipse((cx - 42, cy - 42, cx + 42, cy + 42), fill=GREEN if on else (214, 210, 195))
                    draw_text(im, (cx, cy + 1), str(i + 1), font("Black", 52), CREAM if on else (120, 120, 110))
                return im

            def fn(tt, steps=steps, t_start=t_start, end=end, trk=trk):
                st = pop(tt - t_start, end - t_start, s0=0.7)
                if not st:
                    return []
                return [(trk(sum(1 for x in steps if tt >= x - 0.05)), W // 2, 175, st[0], st[1])]

            ov.dynamic.append((t_start, end, fn, lambda tt, steps=steps, t_start=t_start, end=end: (
                id(trk), sum(1 for x in steps if tt >= x - 0.05), pop(tt - t_start, end - t_start, s0=0.7))))
            ov.log.append(("tracker", t_start, end, (W // 2 - 234, 90, W // 2 + 234, 260)))
        elif typ == "sfx":
            ov.sfx.append((t, e.get("kind", "pop"), e.get("vol", 0.55)))
        else:
            raise ValueError(typ)


# ---------------------------------------------------------------- build
def build(reel, outdir):
    toks = load_words()
    assert any("più" in t["w"] for t in toks), "encoding parole errato"
    ivs = build_intervals(reel, toks)
    vframes = ivs[-1]["o"] + ivs[-1]["n"]
    cta_frames = 4 * FPS
    total = vframes + cta_frames
    # punch-in definiti su parole -> intervalli sorgente
    reel.setdefault("zoom_src", [])
    pieces = plan_pieces(reel, ivs)
    rid = reel["id"]
    work = os.path.join(ROOT, "work", rid)
    base = render_base(reel, pieces, os.path.join(work, "pieces"), cta_frames)

    ov = Overlay(reel, ivs, total, vframes)
    cover_layer(ov, reel["cover"]["kicker"], reel["cover"]["lines"])
    apply_fx(ov, reel.get("fx", []))
    cta_layer(ov, reel["keyword"], reel["cta_sub"])
    sfx = sorted(ov.sfx)
    assert len(sfx) <= 2 and all(b[0] - a[0] >= 7 for a, b in zip(sfx, sfx[1:])) and all(s[0] > 3 for s in sfx)
    wav = build_audio(ivs, sfx, total, os.path.join(work, "audio.wav"))

    os.makedirs(outdir, exist_ok=True)
    out = os.path.join(outdir, f"{rid}.mp4")
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", base,
           "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", wav,
           "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto,format=yuv420p[v];[2:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
           "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-profile:v", "high",
           "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
           "-frames:v", str(total), out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(total):
        p.stdin.write(ov.render(f / FPS))
    p.stdin.close()
    p.wait()
    assert p.returncode == 0
    meta = {"ivs": [{k: v for k, v in iv.items() if k != "words"} | {"text": " ".join(w["w"] for w in iv["words"])}
                    for iv in ivs],
            "pieces": pieces, "log": ov.log, "sfx": sfx, "vframes": vframes, "total": total,
            "hide_caps": ov.hide_caps}
    json.dump(meta, open(os.path.join(work, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return out, meta
