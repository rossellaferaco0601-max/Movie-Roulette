"""Trova i fotogrammi isolati sbagliati (immagine che salta per 1-2 fotogrammi e torna uguale) e li sostituisce
col fotogramma precedente. Copia prima l'audio così com'è; il video è ricodificato a qualità alta solo se serve.

Uso: python scripts/repair_flash.py entrata.mp4 uscita.mp4
"""
import os, re, shutil, subprocess, sys, tempfile

src, dst = sys.argv[1], sys.argv[2]
tmp = os.path.join(tempfile.gettempdir(), "cn_yavg.txt")
cwd = os.path.dirname(tmp)
subprocess.run(f'ffmpeg -v error -y -i "{os.path.abspath(src)}" -vf "scale=108:192,signalstats,'
               f'metadata=print:key=lavfi.signalstats.YAVG:file=cn_yavg.txt" -f null -', shell=True, check=True, cwd=cwd)
y = [float(m) for m in re.findall(r"YAVG=([\d.]+)", open(tmp).read())]
bad = []
for n in range(1, len(y) - 3):
    for w in (1, 2):   # glitch lungo w fotogrammi
        if abs(y[n - 1] - y[n + w]) < 4 and all(abs(y[n + k] - y[n - 1]) > 12 for k in range(w)):
            bad.append((n, n + w - 1))
            break
print(os.path.basename(src), "fotogrammi isolati:", [(a, round(a / 30, 2)) for a, _ in bad])
if not bad:
    shutil.copyfile(src, dst)
else:
    # freezeframes vuole due ingressi: il video e la copia da cui prendere il fotogramma buono
    g, cur = [], "0:v"
    for i, (a, b) in enumerate(bad):
        g.append(f"[{cur}]split[a{i}][b{i}];[a{i}][b{i}]freezeframes=first={a}:last={b}:replace={a - 1}[v{i}]")
        cur = f"v{i}"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", ";".join(g), "-map", f"[{cur}]", "-map", "0:a",
                    "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "copy",
                    "-movflags", "+faststart", dst], check=True)
