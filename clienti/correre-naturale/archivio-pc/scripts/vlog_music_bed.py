"""Letto musicale per il vlog lungo (v4, 7/11): il brano di Ross (Jalen Ngonda, 146,9 s) è più corto del vlog (140,8 + CTA 10 = 160,8 s)
e il renderer, con «loop», lo farebbe ripartire da capo dentro la CTA. Qui il brano viene allungato con una GIUNTA SUI COLPI MISURATI
(work/evento/beats_jalen.json): si suona da 0 alla fine del secondo ritornello (colpo 264, 128,8 s) e si riprende dalla levata del secondo
ritornello (colpo 216, 105,4 s) fino alla coda; crossfade di 40 ms sulla giunta, dissolvenza di 4 s sul finale, lunghezza 161 s.
Uso: python scripts/vlog_music_bed.py   → work/evento/musica/jalen_bed_vlog.wav + ReelStudio/assets/music/jalen_bed_vlog.mp3
     (nel project.json: "music": "jalen_bed_vlog")
"""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SONG = os.path.join(ROOT, "input", "musica", "jalen_ngonda.wav")
BEATS = json.load(open(os.path.join(ROOT, "work", "evento", "beats_jalen.json")))["beats"]
OUT_WAV = os.path.join(ROOT, "work", "evento", "musica", "jalen_bed_vlog.wav")
OUT_MP3 = "C:/Users/roxfe/Documents/ReelStudio/assets/music/jalen_bed_vlog.mp3"
B_END, B_BACK = 264, 216      # colpo in cui si taglia (fine del 2° ritornello) e colpo da cui si riprende (levata del 2° ritornello); entrambi battere
TOTAL, FADE = 161.0, 4.0

tA, tB = BEATS[B_END], BEATS[B_BACK]
os.makedirs(os.path.dirname(OUT_WAV), exist_ok=True)
fc = (f"[0:a]atrim=0:{tA:.4f},asetpts=PTS-STARTPTS[a];[0:a]atrim={tB:.4f},asetpts=PTS-STARTPTS[b];"
      f"[a][b]acrossfade=d=0.04:c1=tri:c2=tri,atrim=0:{TOTAL},afade=t=out:st={TOTAL - FADE:.2f}:d={FADE}[o]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SONG, "-filter_complex", fc, "-map", "[o]", "-ar", "48000", "-c:a", "pcm_s16le", OUT_WAV], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", OUT_WAV, "-c:a", "libmp3lame", "-b:a", "256k", OUT_MP3], check=True)
print(f"letto {TOTAL} s: 0-{tA:.2f} s + {tB:.2f} s-fine (giunta sui colpi {B_END}->{B_BACK}), dissolvenza {FADE} s -> {OUT_WAV} e {OUT_MP3}")
