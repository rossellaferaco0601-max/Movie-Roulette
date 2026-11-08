# Render veloce in serie (6/11 mattina, consegna): render + fotogrammi neri + 3 fotogrammi. bash scripts/mattina.sh Y1 … Y9v2
NODE="C:/Users/roxfe/Documents/ReelStudio/tools/node/node.exe"
cd "C:/Users/roxfe/Documents/reel_progetti/correre_naturale"
export PYTHONIOENCODING=utf-8 RS_CONC=5
for key in "$@"; do
  if [ "$key" = "Y9v2" ]; then pid=cn-y9v2_costanza; rid=Y9v2_costanza
  else read -r pid rid <<<"$(python -I -c "import sys; sys.path.insert(0,'scripts'); from reels_ytcn38 import REELS; r=REELS['$key']; print('cn-'+r['id'].lower(), r['id'])")"; fi
  mp4="output/ytcn38/$rid.mp4"
  echo "== $key $(date +%H:%M) render"
  "$NODE" scripts/rs_render.js video "$pid" "$mp4" 2>&1 | grep -E "ok|rror"
  python -X utf8 scripts/qa_black.py "$mp4"
  echo "== $key $(date +%H:%M) FINE"
done
echo "MATTINA DONE $(date +%H:%M)"
