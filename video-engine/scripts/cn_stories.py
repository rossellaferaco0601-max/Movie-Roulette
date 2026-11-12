#!/usr/bin/env python3
"""Spezzoni per le stories di Instagram («yapping»: devono sembrare video spontanei) da un selfie verticale.
Solo tagli netti nei silenzi (niente dissolvenze, zoom, grafiche o musica), 1080x1920 a 30 fps, volume uniformato.
Per ogni spezzone due file: pulito e con sottotitoli piccoli in stile Instagram (bianco su fascia scura, carattere Inter).
Uso: python3 scripts/cn_stories.py work/ccb_cuts.json out/ccb/stories [video ...]
tagli: {"<video>": {"src", "words", "stories": [[[a,b],...], ...]}}   (tempi del sorgente; i tagli vengono da scripts/cn_quiet.py)"""
import json, os, re, subprocess, sys
FIX = {"boshimani": "Boscimani", "boscimani": "Boscimani", "relaxa": "relax", "lumanca": "lumaca", "listico": "olistico", "corritori": "corridori",
       "re-imparare": "reimparare", "tigli": "tigri", "namibia": "Namibia"}
PHRASE = [("tendine da kill", "tendine d'Achille"), ("Migliaia di Ranero", "migliaia di runner"), ("da zone", "da zoo"), ("ci ha successo", "ci è successo"),
          ("ma solo ritrovata", "va solo ritrovata"), ("Fa una cosa", "Fai una cosa"), ("il regalo", "in regalo"), ("un app", "un'app"),
          ("Come correre bene", "«Come correre bene»"), ("Corsa perfetta in 30 secondi", "«Corsa perfetta in 30 secondi»")]
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2000:]); raise SystemExit("ffmpeg fallito")
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); return f"{h}:{m:02d}:{t % 60:05.2f}"
def lines_of(words, ranges):
    """parole dello spezzone nel suo tempo, raggruppate in righe brevi"""
    ws, off = [], 0.0
    for a, b in ranges:
        for w in words:
            s, e = w["startMs"] / 1000, w["endMs"] / 1000
            if a <= (s + e) / 2 <= b:
                t = w["text"].strip(); t = FIX.get(re.sub(r"[.,?!;:]", "", t).lower(), None) and re.sub(r"^[^.,?!;:]+", FIX[re.sub(r"[.,?!;:]", "", t).lower()], t) or t
                ws.append([off + max(0, s - a), off + min(b, e) - a, t, False])
        if ws: ws[-1][3] = True   # ultimo del pezzo: la riga si chiude al taglio
        off += b - a
    lines, cur = [], []
    for i, w in enumerate(ws):
        cur.append(w); txt = " ".join(x[2] for x in cur); nxt = ws[i + 1] if i + 1 < len(ws) else None
        gap = nxt[0] - w[1] if nxt else 9
        if w[3] or re.search(r"[.?!]$", w[2]) or gap > 0.45 or (len(txt) >= 26 and not (nxt and re.search(r"[.?!]$", nxt[2]) and len(txt) + 1 + len(nxt[2]) <= 36)) or (w[2].endswith(",") and len(txt) >= 14) or (nxt and len(txt) + 1 + len(nxt[2]) > (36 if re.search(r"[.?!]$", nxt[2]) else 30)):
            lines.append([cur[0][0], cur[-1][1], txt]); cur = []
    if cur: lines.append([cur[0][0], cur[-1][1], " ".join(x[2] for x in cur)])
    for i, l in enumerate(lines):
        for a_, b_ in PHRASE: l[2] = l[2].replace(a_, b_)
        l[2] = re.sub(r"[.,;:]+$", "", l[2])
        l[1] = min(l[1] + 0.25, lines[i + 1][0]) if i + 1 < len(lines) else l[1] + 0.4
    return lines
cuts = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
BOX = os.environ.get("SUB_BOX", "&H78000000")   # fascia dietro i sottotitoli (AABBGGRR): più coprente (&H38000000) sugli sfondi pieni di dettagli, come le magliette stampate
only = sys.argv[3:]
for name, v in cuts.items():
    if only and name not in only: continue
    words = json.load(open(v["words"])); short = name.split("_", 1)[1]
    for k, ranges in enumerate(v["stories"]):
        base = f"{out}/{short}_storia{k + 1}"; inputs, fc = [], ""
        SOLO_SUB = os.environ.get("SOLO_SOTTOTITOLI") and os.path.exists(base + ".mp4")   # rifà solo la versione con i sottotitoli
        for i, (a, b) in enumerate(ranges):
            inputs += ["-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", v["src"]]
            fc += f"[{i}:v]scale=1080:1920:flags=lanczos,fps=30,setsar=1,setpts=PTS-STARTPTS[v{i}];[{i}:a]aresample=48000,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.03:.3f}:d=0.03,asetpts=PTS-STARTPTS[a{i}];"
        n = len(ranges)
        fc += "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a0];[a0]loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.75:level=disabled:attack=3:release=40,aresample=48000[a]"
        if not SOLO_SUB: run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", base + ".mp4"])
        ass = ("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
               f"Style: ig,Inter,50,&H00FFFFFF,&H00FFFFFF,{BOX},{BOX},-1,0,0,0,100,100,0,0,3,14,0,2,70,70,440,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
        for s, e, t in lines_of(words, ranges): ass += f"Dialogue: 0,{ts(s)},{ts(e)},ig,,0,0,0,,{t}\n"
        open(base + ".ass", "w").write(ass)
        run(["ffmpeg", "-loglevel", "error", "-y", "-i", base + ".mp4", "-vf", f"subtitles={base}.ass", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", base + "_sottotitoli.mp4"])
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", base + ".mp4"], capture_output=True, text=True).stdout)
        print(f"{base}.mp4  {d:.1f} s  ({n} pezzi)")
