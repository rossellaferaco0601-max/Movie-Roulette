"""Monta il brano sul render muto del condensato: taglio esatto dal colpo d'inizio, livello -14 LUFS, dissolvenza finale.
Uso: python scripts/vlog_mix60s.py work/evento/VLOG60s_muto.mp4 output/evento/VLOG_workshop_60s.mp4
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mute, out = sys.argv[1], sys.argv[2]
meta = json.load(open(os.path.join(ROOT, "work", "evento", "meta60s.json")))
song, t0 = meta["song"], meta["song_start"]
T = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mute]).decode().strip())
FADE = 5.0   # 7/11 notte, Ross: «la musica deve sfumare meglio sul finale» → 5 s (era 2) con curva a S (hsin): parte piano e si spegne dolcemente
base = f"atrim=start={t0:.4f}:end={t0 + T:.4f},asetpts=PTS-STARTPTS"
# 1) misura del tratto usato
r = subprocess.run(["ffmpeg", "-v", "info", "-i", song, "-af", base + ",loudnorm=print_format=summary", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = float(re.search(r"Input Integrated:\s+(-?[\d.]+)", r).group(1))
tp = float(re.search(r"Input True Peak:\s+(-?[\d.]+)", r).group(1))
gain = -14.0 - lufs
print(f"tratto {t0:.2f}-{t0 + T:.2f} s: {lufs:.1f} LUFS, picco {tp:.1f} dBTP -> guadagno {gain:+.1f} dB (picco atteso {tp + gain:.1f} dBTP)")
af = base + f",volume={gain:.2f}dB"
if tp + gain > -1.0:
    af += ",alimiter=limit=0.89:attack=3:release=60:level=false"
af += f",afade=t=out:st={T - FADE:.3f}:d={FADE}:curve=hsin"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mute, "-i", song, "-filter_complex", f"[1:a]{af}[a]", "-map", "0:v:0", "-map", "[a]",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", out], check=True)
r = subprocess.run(["ffmpeg", "-v", "info", "-i", out, "-af", "loudnorm=print_format=summary", "-f", "null", "-"], capture_output=True, text=True).stderr
print("uscita:", re.search(r"Input Integrated:\s+(-?[\d.]+)", r).group(1), "LUFS, picco", re.search(r"Input True Peak:\s+(-?[\d.]+)", r).group(1), "dBTP")
print("ok", out)
