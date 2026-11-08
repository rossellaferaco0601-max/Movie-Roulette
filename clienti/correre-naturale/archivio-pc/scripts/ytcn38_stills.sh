# Fotogrammi di controllo per ogni reel: hook, un momento per ogni effetto, CTA → work/ytcn38/<id>/stills_sheet.jpg
NODE="C:/Users/roxfe/Documents/ReelStudio/tools/node/node.exe"
cd "C:/Users/roxfe/Documents/reel_progetti/correre_naturale"
for key in "$@"; do
  read -r pid rid ts <<<"$(python -I - "$key" <<'PY'
import json, sys
sys.path.insert(0, "scripts")
from reels_ytcn38 import REELS
key = sys.argv[1]; r = REELS[key]; pid = f"cn-{r['id'].lower()}"
p = json.load(open(f"C:/Users/roxfe/Documents/ReelStudio/progetti/{pid}/project.json", encoding="utf-8"))
total = sum(c["e"] - c["s"] for c in p["cuts"])
ts = [1.2]
for e in p["effects"]:
    if e["type"] in ("obj",): continue
    ts.append(round(e["start"] + min(0.9, e["duration"] * 0.6), 2))
ts.append(round(total + 3.5, 2))
print(pid, r["id"], " ".join(str(t) for t in sorted(set(ts))))
PY
)"
  d="work/ytcn38/$rid/stills"; rm -rf "$d"; mkdir -p "$d"
  "$NODE" scripts/rs_render.js still "$pid" "$d" $ts 2>&1 | grep -E "ok|rror" 
  n=$(ls "$d"/*.png | wc -l); cols=$(( n < 6 ? n : 6 )); rows=$(( (n + 5) / 6 ))
  python -I scripts/tile.py "work/ytcn38/$rid/stills_sheet.jpg" 300 6 "$d"/*.png
  echo "$key: $n fotogrammi -> work/ytcn38/$rid/stills_sheet.jpg ($ts)"
done
