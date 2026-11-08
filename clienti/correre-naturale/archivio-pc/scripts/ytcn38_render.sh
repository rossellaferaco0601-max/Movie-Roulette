# Render sequenziale dei reel YTCN 38: bash scripts/ytcn38_render.sh Y1 Y2 ...  → output/ytcn38/<id>.mp4
NODE="C:/Users/roxfe/Documents/ReelStudio/tools/node/node.exe"
cd "C:/Users/roxfe/Documents/reel_progetti/correre_naturale"
for key in "$@"; do
  read -r pid rid <<<"$(python -I -c "import sys; sys.path.insert(0,'scripts'); from reels_ytcn38 import REELS; r=REELS['$key']; print('cn-'+r['id'].lower(), r['id'])")"
  echo "== $key $(date +%H:%M)"
  "$NODE" scripts/rs_render.js video "$pid" "output/ytcn38/$rid.mp4" 2>&1 | grep -E "ok|rror"
done
echo "RENDER DONE $(date +%H:%M)"
