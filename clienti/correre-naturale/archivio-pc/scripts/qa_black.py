"""Fotogrammi neri o quasi (YAVG < soglia) in un MP4, fuori dalla CTA: python scripts/qa_black.py a.mp4 [b.mp4 ...]
Serve a trovare il fotogramma nero singolo che può comparire su un taglio con dissolvenza (5/11, Y8 a 42,40 s)."""
import re, subprocess, sys

for f in sys.argv[1:]:
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-vf", "scale=270:-1,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-",
                          "-an", "-f", "null", "-"], capture_output=True, text=True).stdout
    times, vals = re.findall(r"pts_time:([\d.]+)", out), [float(v) for v in re.findall(r"YAVG=([\d.]+)", out)]
    dur = float(times[-1]) if times else 0
    dark = [(float(t), v) for t, v in zip(times, vals) if v < 30 and float(t) < dur - 7.5]   # la CTA (7 s) è scura di suo
    print(f"{f.split('/')[-1]}  {dur:.1f}s  fotogrammi scuri fuori CTA: {[(round(t, 2), round(v, 1)) for t, v in dark][:12]}")
