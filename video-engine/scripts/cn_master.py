#!/usr/bin/env python3
"""Costruisce il master 1080x1920 di ogni reel: ritaglio 9:16 sul volto, punch-in alternato,
dissolvenze xfade/acrossfade di N fotogrammi tra i pezzi, fermo immagine (con dissolvenza) sulle schede del sorgente,
"campo largo" animato (sfondo sfocato) dove un effetto ha bisogno di spazio sopra la testa, coda di 0,5 s muta.
Uso: python3 scripts/cn_master.py work/ytcn51/reels.json public/ytcn51/masters [R1-fiatone ...]
"""
import json, os, statistics, subprocess, sys

FPS = 30
SRC_W, SRC_H = 3840, 2160
OUT_W, OUT_H = 1080, 1920
TAIL = 0.5            # secondi di coda (fermo immagine + silenzio), = TAIL_FRAMES in types.ts
WIDE = 1.25           # fattore di arretramento del campo largo (il video occupa l'80 % dell'altezza)
WIDE_RAMP = 0.45      # secondi di animazione dentro/fuori dal campo largo
AX = 0.04             # micro-incrocio dell'audio ai tagli
CARD_FADE = 0.10      # dissolvenza del fermo immagine sulle schede (solo se il bordo cade dentro il pezzo)

SHOT_XF = 5          # fotogrammi di dissolvenza sugli stacchi GIÀ presenti nel sorgente (dal fermo dell'ultimo fotogramma)
ALIGN_T = 1.2        # secondi in cui il ritaglio torna dalla posizione allineata al taglio a quella propria dell'inquadratura

def load_shots(src):
    """Inquadrature e volto del sorgente (scripts/cn_shots.py → work/shots/<nome del sorgente>.json). Se il file c'è, ogni
    inquadratura ha lo stesso ritaglio sul volto (stessa grandezza e posizione) e gli stacchi del sorgente diventano dissolvenze brevi
    con il volto allineato (Oscar 12/11: «flash neri e tagli netti»); niente più punch-in alternato."""
    p = os.path.join("work", "shots", os.path.splitext(os.path.basename(src))[0] + ".json")
    return json.load(open(p)) if os.path.exists(p) else None

def med_face(F, a, b):
    fs = [f for f in F[max(0, a):max(0, b)] if f]
    return [statistics.median(x[i] for x in fs) for i in range(4)] if len(fs) >= 2 else None

def seg_cuts(src, s, n, cuts):
    """Stacchi del sorgente dentro il pezzo, come indici di fotogramma del pezzo: il valore previsto dall'analisi viene corretto
    sul picco di differenza misurato con lo stesso identico accesso al file (-ss) usato poi per il montaggio."""
    pred = [round(c - s["from"] * FPS) for c in cuts if s["from"] * FPS + 4 < c < s["to"] * FPS - 4]
    if not pred: return []
    import numpy as np
    r = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{s['from']:.3f}", "-i", src, "-t", f"{n / FPS + 0.2:.4f}", "-vf", f"fps={FPS},scale=160:90", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True)
    fr = np.frombuffer(r.stdout, np.uint8); fr = fr[:len(fr) // 14400 * 14400].reshape(-1, 14400).astype(np.int16)
    d = [0.0] + [float(np.mean(np.abs(fr[i] - fr[i - 1]))) for i in range(1, len(fr))]
    out = []
    for q in pred:
        lo, hi = max(1, q - 3), min(len(d) - 1, q + 3)
        out.append(max(range(lo, hi + 1), key=lambda i: d[i]))
    return sorted(set(c for c in out if 4 < c < n - 4))

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-3000:]); raise SystemExit(f"ffmpeg fallito: {' '.join(cmd[:6])}…")

def crop_filter(zoom: float):
    h = SRC_H / zoom
    w = h * 9 / 16
    x = (SRC_W - w) / 2
    y = (SRC_H * 0.35) - h * 0.35
    y = max(0, min(SRC_H - h, y))
    return f"crop={int(w)}:{int(h)}:{int(x)}:{int(y)},scale={OUT_W}:{OUT_H}:flags=lanczos,fps={FPS},setsar=1"

# schede grafiche del sorgente (viola/verdi, non brand): coperte con un fermo immagine di Daniele + lento zoom
# misurate al fotogramma l'8/11: la scheda 2 è un velo semitrasparente che appare da 180.0 e sparisce del tutto a 190.1
CARDS = [(148.8, 162.3, 148.3), (179.95, 190.3, 179.6), (204.6, 219.3, 204.0)]  # (inizio, fine, fotogramma da congelare)

def freeze_inputs(src, seg, zoom, tmp, i, crop_at=None):
    extra_in, chains, k = [], [], 0
    for (a, b, t_img) in CARDS:
        # la dissolvenza sta FUORI dai bordi della scheda: il fermo immagine è pieno per tutta la durata della scheda
        lo, hi = max(a - 0.02, seg["from"]), min(b + CARD_FADE, seg["to"])
        if hi - lo < 0.3: continue
        t_img = max(0.0, a - 0.02)  # ultimo fotogramma pulito prima della scheda: il video "si ferma" senza stacco né dissolvenza
        png = os.path.join(tmp, f"frz{i}_{k}.png")
        run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t_img:.3f}", "-i", src, "-frames:v", "1", "-vf", (crop_at(t_img) if crop_at else crop_filter(zoom)).replace(f",fps={FPS}", ""), png])
        t0, t1 = lo - seg["from"], hi - seg["from"]
        nf = int(round((t1 - t0) * FPS)) + 2
        extra_in += ["-loop", "1", "-framerate", str(FPS), "-t", f"{(nf + 2) / FPS:.4f}", "-i", png]
        # niente dissolvenza se la scheda inizia/finisce col pezzo (si vedrebbe la scheda del sorgente in trasparenza)
        chains.append((t0, t1, nf, False, b + CARD_FADE < seg["to"] - 0.01))  # mai dissolvenza in entrata (fermo immagine continuo)
        k += 1
    return extra_in, chains

def wide_expr(windows):
    """K(it) in [0,1]: 1 dentro le finestre di campo largo, rampe smoothstep di WIDE_RAMP s ai bordi."""
    terms = []
    for (a, b) in windows:
        k = f"(clip((it-({a:.3f}))/{WIDE_RAMP},0,1)*clip(({b:.3f}-it)/{WIDE_RAMP},0,1))"
        terms.append(f"({k}*{k}*(3-2*{k}))")
    return "min(1," + "+".join(terms) + ")"

def build(reel, src_dir, out_dir):
    rid, segs, blend = reel["id"], reel["segments"], reel["blendFrames"]
    TAIL = reel.get("tail", 0.5)  # coda del reel (s): fermo sull'ultimo fotogramma, muto; = tailSeconds nelle props
    wide_master = reel.get("wide", [])  # finestre in secondi del master
    src = os.path.join(src_dir, reel["src"])
    tmp = os.path.join(out_dir, "tmp", rid); os.makedirs(tmp, exist_ok=True)
    parts, cursor = [], 0
    shots = load_shots(src)
    plan = {}
    if shots:
        F, CUTS = shots["faces"], shots["cuts"]
        # sotto-pezzi: ogni pezzo spezzato sugli stacchi del sorgente (indici di fotogramma del pezzo, misurati sul pezzo stesso)
        subs = []
        for i, s in enumerate(segs):
            n = round((s["to"] - s["from"]) * FPS)
            cs = [0] + seg_cuts(src, s, n, CUTS) + [n]
            for A, B in zip(cs[:-1], cs[1:]):
                g0 = round(s["from"] * FPS)
                subs.append({"seg": i, "A": A, "B": B, "gA": g0 + A, "gB": g0 + B, "face": med_face(F, g0 + A + 2, g0 + B - 2)})
        known = [u["face"] for u in subs if u["face"]]
        if not known: shots = None
    if shots:
        # stessa grandezza del volto ovunque: comanda l'inquadratura più stretta (il ritaglio non può superare l'altezza del sorgente)
        FH = max(f[3] for f in known) / SRC_H
        for u in subs:
            f = u["face"]
            u["ch"] = min(SRC_H, f[3] / FH) if f else None
        tops = sorted(u["face"][1] / u["ch"] for u in subs if u["face"]); TOPF = tops[len(tops) // 10]
        U0 = statistics.median((u["face"][0] + u["face"][2] / 2 - (SRC_W - SRC_H * 9 / 16) / 2) / (SRC_H * 9 / 16) for u in subs if u["face"])
        last = None
        for u in subs:
            f = u["face"]
            if f:
                ch = u["ch"]; cw = ch * 9 / 16
                u["crop"] = [min(max(0, f[0] + f[2] / 2 - U0 * cw), SRC_W - cw), min(max(0, f[1] - TOPF * ch), SRC_H - ch), cw, ch]
                last = u["crop"]
            else: u["crop"] = last   # schede del sorgente senza volto: resta il ritaglio dell'inquadratura prima
        nxt = None
        for u in reversed(subs):
            if u["crop"] is None: u["crop"] = nxt or [(SRC_W - SRC_H * 9 / 16) / 2, 0, SRC_H * 9 / 16, SRC_H]
            nxt = u["crop"]
        # allineamento ai tagli: il volto entra dove l'ha lasciato l'inquadratura prima, poi il ritaglio scivola alla sua posizione
        for k, u in enumerate(subs):
            u["d"] = [0.0, 0.0]; u["T"] = min(ALIGN_T, 0.7 * (u["B"] - u["A"]) / FPS)
            if k == 0: continue
            pv = subs[k - 1]
            fo, fi = med_face(F, pv["gB"] - 6, pv["gB"] - 1), med_face(F, u["gA"] + 1, u["gA"] + 6)
            if not (fo and fi): continue
            X, Y, cw, ch = u["crop"]; PX, PY, pw, ph = pv["crop"]
            xs = fi[0] + fi[2] / 2 - (fo[0] + fo[2] / 2 - PX) / pw * cw
            ys = fi[1] - (fo[1] - PY) / ph * ch
            u["d"] = [min(max(xs, 0), SRC_W - cw) - X, min(max(ys, 0), SRC_H - ch) - Y]
            u["d"] = [max(-140, min(140, u["d"][0])), max(-70, min(70, u["d"][1]))]
        for u in subs: plan.setdefault(u["seg"], []).append(u)
        print(f"{rid}: inquadrature={len(subs)} volto {FH:.3f} dell'altezza, in alto a {TOPF:.3f}, centro a {U0:.3f} della larghezza")
    for i, s in enumerate(segs):
        n = round((s["to"] - s["from"]) * FPS)
        start = 0 if i == 0 else cursor - blend
        cursor = start + n
        zoom = 1.0 if i % 2 == 0 else 1.08
        p = os.path.join(tmp, f"p{i}.mp4")
        if shots:
            us = plan[i]
            def crop_at(t, us=us, s=s):
                q = round((t - s["from"]) * FPS); u = next((x for x in us if x["A"] <= q < x["B"]), us[-1 if q >= us[-1]["B"] else 0])
                X, Y, cw, ch = u["crop"]
                return f"crop={int(cw) // 2 * 2}:{int(ch) // 2 * 2}:{int(X)}:{int(Y)},scale={OUT_W}:{OUT_H}:flags=lanczos,setsar=1"
            extra_in, chains = freeze_inputs(src, s, zoom, tmp, i, crop_at)
            fc = f"[0:v]fps={FPS},setsar=1" + (f",split={len(us)}" + "".join(f"[s{k}]" for k in range(len(us))) if len(us) > 1 else "[s0]") + ";"
            cum = 0
            for k, u in enumerate(us):
                X, Y, cw, ch = u["crop"]; dx, dy = u["d"]; T = max(0.2, u["T"])
                kk = f"pow(clip(t/{T:.3f},0,1),2)*(3-2*clip(t/{T:.3f},0,1))"
                # indici: il flusso «fps» parte un fotogramma dopo l'uscita (che duplica il primo fotogramma, come nei master di prima):
                # per restare identici nei tempi il ritaglio usa indice-1 e il primo sotto-pezzo ripete il suo primo fotogramma
                a_t, b_t = max(0, u["A"] - 1), u["B"] - 1 + (round(TAIL * FPS) + 3 if (i == len(segs) - 1 and k == len(us) - 1) else 0)
                lead = "tpad=start=1:start_mode=clone," if k == 0 else ""
                fc += (f"[s{k}]trim=start_frame={a_t}:end_frame={b_t},setpts=PTS-STARTPTS,{lead}"
                       f"crop={int(cw) // 2 * 2}:{int(ch) // 2 * 2}:x='{X:.1f}+({dx:.1f})*(1-{kk})':y='{Y:.1f}+({dy:.1f})*(1-{kk})',"
                       f"scale={OUT_W}:{OUT_H}:flags=lanczos,setsar=1[c{k}];")   # niente secondo «fps»: a fine flusso scarta l'ultimo fotogramma
                if k == 0: prevj = "[c0]"
                else:
                    fc += (f"{prevj}tpad=stop={SHOT_XF + 1}:stop_mode=clone[t{k}];"
                           f"[t{k}][c{k}]xfade=transition=fade:duration={SHOT_XF / FPS:.5f}:offset={cum / FPS:.5f}[j{k}];")
                    prevj = f"[j{k}]"
                cum += u["B"] - u["A"]
            holdj = i > 0 and blend < 4
            fc += f"{prevj}null[{'vj' if holdj else 'v0'}];"
            if holdj:
                hold = os.path.join(tmp, f"hold{i}.png")
                run(["ffmpeg", "-loglevel", "error", "-y", "-i", parts[-1][0], "-vf", f"select='eq(n,{parts[-1][1] - 1})'", "-frames:v", "1", "-update", "1", hold])
                extra_in += ["-loop", "1", "-framerate", str(FPS), "-t", f"{(SHOT_XF + 2) / FPS:.4f}", "-i", hold]
                fc += (f"[{len(chains) + 1}:v]format=rgba,fade=t=out:st=0:d={(SHOT_XF + 1) / FPS:.4f}:alpha=1[hold];"
                       f"[vj][hold]overlay=eof_action=pass[v0];")
        else:
            extra_in, chains = freeze_inputs(src, s, zoom, tmp, i)
            fc = f"[0:v]{crop_filter(zoom)}[v0];"
        prev = "[v0]"
        for j, (t0, t1, nf, fin, fout) in enumerate(chains):
            fades = (f",fade=t=in:st={t0:.4f}:d={CARD_FADE}:alpha=1" if fin else "") + (f",fade=t=out:st={t1 - CARD_FADE:.4f}:d={CARD_FADE}:alpha=1" if fout else "")
            fc += (f"[{j + 1}:v]scale=2160:3840,zoompan=z='1+0.06*on/{nf}':d=1:x='iw/2-(iw/zoom/2)':y='ih*0.35-(ih/zoom*0.35)':s={OUT_W}x{OUT_H}:fps={FPS},"
                   f"setpts=PTS-STARTPTS+{t0:.4f}/TB,format=rgba{fades}[f{j}];"
                   f"{prev}[f{j}]overlay=enable='between(t,{t0:.4f},{t1:.4f})':eof_action=pass[v{j + 1}];")
            prev = f"[v{j + 1}]"
        # finestre di campo largo che cadono in questo pezzo (tempo locale del pezzo)
        wins = []
        for (a, b) in wide_master:
            lo, hi = max(a * FPS, start), min(b * FPS, start + n)
            if hi - lo > 1:
                a = (lo - start) / FPS
                if a <= 0.05: a = -WIDE_RAMP - 0.1  # finestra dal primo fotogramma: già in campo largo, senza rampa
                wins.append((a, (hi - start) / FPS))
        if wins:
            bw, bh = int(OUT_W * WIDE), int(OUT_H * WIDE)
            # sfondo del campo largo: gradiente verde scuro del brand (niente video sfocato: lo stacco era troppo evidente)
            fc += (f"gradients=s={bw}x{bh}:c0=0x1C3D15:c1=0x0B0F0A:x0={bw // 2}:y0=0:x1={bw // 2}:y1={bh}:r={FPS}[bg];"
                   f"[bg]{prev}overlay=x=(W-w)/2:y=H-h:shortest=1[wide];"
                   f"[wide]zoompan=z='{WIDE}-{WIDE - 1:.3f}*{wide_expr(wins)}':x='iw/2-(iw/zoom/2)':y='ih-(ih/zoom)':d=1:s={OUT_W}x{OUT_H}:fps={FPS}[vw];")
            prev = "[vw]"
        # ultimo pezzo: coda di TAIL s in cui il video continua (muto) sotto la CTA; se il sorgente finisce, clona l'ultimo fotogramma
        last = i == len(segs) - 1
        nv = n + (round(TAIL * FPS) if last else 0)
        # coda: il sorgente continua dal vivo per `tailLive` s (se dopo il taglio non cambia inquadratura), poi tiene l'ultimo fotogramma;
        # la CTA sale dal basso in 9 fotogrammi, quindi il fermo non si vede mai (Ross 11/11: niente fermo immagine prima della CTA)
        live = min(round(reel.get("tailLive", TAIL) * FPS), round(TAIL * FPS))
        fc += f"{prev}trim=end_frame={n + live},tpad=stop_mode=clone:stop_duration={TAIL}[vend];" if last else ""
        if last: prev = "[vend]"
        fc = fc.rstrip(";")
        # taglio audio netto a metà dell'incrocio video (micro-incrocio di AX s): l'incrocio lungo si mangiava attacchi e code delle parole
        hb = blend / 2 / FPS
        a0 = 0 if i == 0 else hb - AX / 2
        a1 = n / FPS if last else n / FPS - hb + AX / 2
        af = f"aresample=48000,atrim={a0:.4f}:{a1:.4f},asetpts=PTS-STARTPTS" + (f",afade=t=out:st={a1 - a0 - 0.09:.4f}:d=0.09,apad=whole_dur={a1 - a0 + TAIL:.4f}" if last else "")
        run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{s['from']:.3f}", "-i", src, *extra_in, "-t", f"{nv / FPS + 0.2:.4f}",
             "-filter_complex", fc, "-map", prev, "-map", "0:a", "-frames:v", str(nv), "-af", af,
             "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", p])
        parts.append((p, nv))
    out = os.path.join(out_dir, f"{rid}.mp4")
    inputs = []
    for p, _ in parts: inputs += ["-i", p]
    fv, fa = "", ""
    prev_v, prev_a = "[0:v]", "[0:a]"
    offset, total = 0.0, parts[0][1]
    d = blend / FPS
    for i in range(1, len(parts)):
        offset += parts[i - 1][1] / FPS - d
        vo, ao = f"[v{i}]", f"[a{i}]"
        fv += f"{prev_v}[{i}:v]xfade=transition=fade:duration={d:.4f}:offset={offset:.4f}{vo};"
        fa += f"{prev_a}[{i}:a]acrossfade=d={AX}:c1=tri:c2=tri{ao};"
        prev_v, prev_a = vo, ao
        total += parts[i][1] - blend
    fc = fv + fa + f"{prev_v}null[vt];{prev_a}anull[at]"
    run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[vt]", "-map", "[at]",
         "-r", str(FPS), "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out])
    pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", out], capture_output=True, text=True)
    got = int(pr.stdout.strip() or 0)
    print(f"{rid}: pezzi={len(parts)} campo largo={wide_master} frame attesi={total} letti={got} {'OK' if abs(got-total)<=1 else 'DIFF!'}")
    return {"id": rid, "frames": total, "read": got}

if __name__ == "__main__":
    reels = json.load(open(sys.argv[1]))
    out_dir = sys.argv[2]; os.makedirs(out_dir, exist_ok=True)
    only = set(sys.argv[3:])
    meta = [build(r, "public", out_dir) for r in reels if not only or r["id"] in only]
    json.dump(meta, open(os.path.join(out_dir, "masters.json"), "w"), indent=1)
