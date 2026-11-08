# fotogrammi di prova dell'hook (1.2 e 2.3 s) per ogni reel, in serie: bash scripts/hook_stills.sh pid1 pid2 …
NODE="C:/Users/roxfe/Documents/ReelStudio/tools/node/node.exe"
cd "C:/Users/roxfe/Documents/reel_progetti/correre_naturale"
for pid in "$@"; do
  rm -rf "work/hookpos/$pid"; mkdir -p "work/hookpos/$pid"
  "$NODE" scripts/rs_render.js still "$pid" "work/hookpos/$pid" 0.6 1.3 2.3 2>&1 | grep -E "ok|rror"
done
python - <<'PY'
from PIL import Image
import glob, os
pids=sorted(d for d in os.listdir("work/hookpos") if os.path.isdir("work/hookpos/"+d))
rows=[]
for pid in pids:
    fs=sorted(glob.glob(f"work/hookpos/{pid}/*.png"))
    if len(fs)!=3: continue
    row=Image.new("RGB",(3*360+20,640),(20,20,20))
    for i,f in enumerate(fs): row.paste(Image.open(f).resize((360,640)),(i*370,0))
    row.save(f"work/hookpos/{pid}.jpg",quality=85); rows.append(pid)
print("tiles:", rows)
PY
