"""Assembla il «master» del vlog: un unico file 1080×1920 30 fps fatto dei pezzi delle clip dell'evento,
nell'ordine finale. ReelStudio lavora su un solo sorgente: i tagli (cuts) del progetto coincidono con i pezzi.

Uso (da vlog_build.py): build_master(segments, out_mp4) -> lista dei pezzi con i tempi nel master.
segment = dict(clip="IMG_0620", s=97.6, e=112.6, kind="speech"|"broll"|"selfie", vol=1.0)
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IN = os.path.join(ROOT, "input", "evento")
WD = os.path.join(ROOT, "work", "evento", "master")
FPS, W, H = 30, 1080, 1920
# 5/11 sera (Ross: «non si vede niente»): le clip iPhone sono HDR (HLG / Dolby Vision, BT.2020, 10 bit). Senza tone mapping
# la conversione a SDR esce piatta, scura e slavata; qui ogni pezzo HDR passa da un tone mapping Hable a BT.709 (TONEMAP),
# poi una correzione leggera. GRADE_FLARE (controluce sul prato / pergola): alte luci un po' più compresse e ombre aperte.
TONEMAP = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE_STD = "hqdn3d=1:1:3:3,unsharp=5:5:0.5:5:5:0,eq=contrast=1.04:saturation=1.06"
GRADE_FLARE = "hqdn3d=1:1:3:3,unsharp=5:5:0.5:5:5:0,curves=m='0/0 0.25/0.27 0.6/0.6 0.9/0.86 1/0.97',eq=contrast=1.05:saturation=1.10"
PIPE_VERSION = 4   # 4: dissolvenza audio in/out sui pezzi parlati (Ross 5/11 sera: «parole tagliate» = taglio secco sull'ambiente)


def has_audio(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name", "-of", "csv=p=0", path],
                       capture_output=True, text=True).stdout.strip()
    return r and r != "apple_apac"


def src_of(clip):
    """Percorso del sorgente: clip iPhone .mov, WhatsApp wa_*.mp4, testimonianze del sito in sito/*.mp4."""
    if clip.startswith("testimonianza_"):
        return os.path.join(IN, "sito", clip + ".mp4")
    return os.path.join(IN, clip + (".mp4" if clip.startswith("wa_") else ".mov"))


def is_hdr(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer", "-of", "csv=p=0", path],
                       capture_output=True, text=True).stdout.strip()
    return r in ("arib-std-b67", "smpte2084")


def piece(seg, i):
    """Esporta un pezzo normalizzato (video 1080×1920 30 fps H.264 quasi lossless, audio AAC 48 kHz stereo)."""
    os.makedirs(WD, exist_ok=True)
    src = src_of(seg["clip"])
    grade = seg.get("grade", "std")
    zoom = seg.get("zoom", 1.0)
    out = os.path.join(WD, f"{seg['clip']}_{seg['s']:.2f}_{seg['e']:.2f}_{seg['kind']}_{grade}{'' if zoom == 1.0 else f'_z{zoom}'}.mp4")
    key = json.dumps({**{k: seg.get(k) for k in ("clip", "s", "e", "kind", "grade", "zoom", "zx", "zy", "fi", "fo")}, "v": PIPE_VERSION}, sort_keys=True)
    if os.path.exists(out + ".json") and open(out + ".json").read() == key:
        return out
    dur = seg["e"] - seg["s"]
    n = max(1, round(dur * FPS))
    if seg["kind"] == "selfie":
        # clip WhatsApp 576×1024: sfondo sfocato + clip ingrandita al centro (resta leggibile senza spalmarla a tutto schermo)
        vf = (f"[0:v]split=2[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30:4,eq=brightness=-0.12[bg];"
              f"[b]scale=900:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2:format=auto,fps={FPS},format=yuv420p[v]")
        vmap = ["-filter_complex", vf, "-map", "[v]"]
    else:
        # qualità (5/11, Ross): rumore giù, nitidezza, contrasto locale, alte luci compresse; «flare» = più forte sui controluce
        g = {"none": "", "std": GRADE_STD, "flare": GRADE_FLARE}[grade]
        z = "" if zoom == 1.0 else f",crop=iw/{zoom}:ih/{zoom}:{seg.get('zx', 0.5)}*(iw-iw/{zoom}):{seg.get('zy', 0.5)}*(ih-ih/{zoom}),scale={W}:{H}:flags=lanczos"
        tm = ("," + TONEMAP) if is_hdr(src) else ",format=yuv420p"
        # tpad: se il sorgente (VFR dell'iPhone) dà un fotogramma in meno, l'ultimo viene clonato: il pezzo ha SEMPRE n fotogrammi (7/11)
        vmap = ["-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}{z}{tm}{(',' + g) if g else ''},setpts=PTS-STARTPTS,fps={FPS},format=yuv420p,tpad=stop_mode=clone:stop_duration=1", "-map", "0:v:0"]   # setpts: il primo fotogramma dopo il seek parte da 0
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{seg['s']:.3f}", "-i", src]
    if has_audio(src):
        # parlato: normalizzato a -16 LUFS; ambiente: -24 LUFS (sta sotto la musica)
        tgt = -16 if seg["kind"] in ("speech", "selfie") else -24
        af = f"aresample=48000,loudnorm=I={tgt}:TP=-1.5:LRA=9,aformat=channel_layouts=stereo"
        if seg["kind"] in ("speech", "selfie"):
            # coda e attacco morbidi: la parola finale resta intera e l'eventuale parola successiva sfuma invece di essere troncata
            fi, fo = seg.get("fi", 0.12), seg.get("fo", 0.28)
            af += f",afade=t=in:st=0:d={fi},afade=t=out:st={max(0.0, n / FPS - fo):.3f}:d={fo}"
        amap = ["-map", "0:a:0", "-af", af + ",apad"]   # apad: l'audio non deve mai accorciare il pezzo (-shortest = i fotogrammi video)
    else:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
        amap = ["-map", "1:a:0"]
    cmd += vmap + amap + ["-frames:v", str(n), "-t", f"{n / FPS:.4f}", "-c:v", "libx264", "-preset", "medium", "-crf", "14",
                          "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out]   # niente -shortest: con loudnorm tagliava 1-2 fotogrammi (7/11)
    subprocess.run(cmd, check=True)
    open(out + ".json", "w").write(key)
    return out


def build_master(segments, out_mp4):
    with ThreadPoolExecutor(4) as ex:
        files = list(ex.map(lambda a: piece(a[1], a[0]), enumerate(segments)))
    # tempi nel master (frame esatti)
    t, timeline = 0.0, []
    for seg, f in zip(segments, files):
        n = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets",
                                "-of", "csv=p=0", f], capture_output=True, text=True).stdout.strip().strip(",") or 0)
        timeline.append({**seg, "file": f, "ms": round(t, 4), "me": round(t + n / FPS, 4), "n": n})
        t += n / FPS
    lst = os.path.join(WD, "concat.txt")
    # «duration» esplicita per ogni file: il concat usa quella per i timestamp del video, non la durata del contenitore
    # (che include il priming AAC): anche il video resta a lunghezza esatta n/FPS per pezzo
    open(lst, "w", encoding="utf-8").write("".join(f"file '{f.replace(chr(92), '/')}'\nduration {x['n'] / FPS:.6f}\n" for x, f in zip(timeline, files)))
    # 5/11 notte: il concat «-c copy» dell'AAC accumula il priming di ogni pezzo (~25 ms l'uno): dopo 30 pezzi l'audio era in ritardo
    # di mezzo secondo sul video e ogni taglio mozzava la fine della frase. Ora il video si concatena in copia e l'audio si ricostruisce
    # come un unico flusso PCM a lunghezza esatta (n fotogrammi × 1600 campioni a 48 kHz), poi si codifica una volta sola.
    vid = os.path.join(WD, "concat_video.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-an", "-c:v", "copy", vid], check=True)
    raw = os.path.join(WD, "concat_audio.raw")
    with open(raw, "wb") as fo:
        for seg, f in zip(timeline, files):
            want = seg["n"] * 1600 * 2 * 2   # campioni per fotogramma × canali × byte
            pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-vn", "-ac", "2", "-ar", "48000", "-f", "s16le", "-"], capture_output=True).stdout
            fo.write(pcm[:want] + bytes(max(0, want - len(pcm))))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-f", "s16le", "-ar", "48000", "-ac", "2", "-i", raw, "-map", "0:v:0", "-map", "1:a:0",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out_mp4], check=True)
    return timeline


if __name__ == "__main__":
    # prova rapida: python scripts/vlog_master.py IMG_0598:10:14 IMG_0613:20:24 wa_daniele_vigilia:0:4:selfie
    segs = []
    for a in sys.argv[1:]:
        p = a.split(":")
        segs.append(dict(clip=p[0], s=float(p[1]), e=float(p[2]), kind=p[3] if len(p) > 3 else "broll"))
    tl = build_master(segs, os.path.join(WD, "test_master.mp4"))
    for x in tl:
        print(f"{x['ms']:7.2f}-{x['me']:7.2f} {x['clip']} {x['s']}-{x['e']} {x['kind']}")
