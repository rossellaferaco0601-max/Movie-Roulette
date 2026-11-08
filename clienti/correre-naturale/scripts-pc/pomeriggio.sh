# Render in serie della seconda revisione (6/11 pomeriggio): render + fotogrammi neri + lampi. bash scripts/pomeriggio.sh Y1 … Y9v2
# Un reel alla volta, 3 code (Ross: niente sovraccarico). Log in work/pomeriggio.log.
NODE="C:/Users/roxfe/Documents/ReelStudio/tools/node/node.exe"
cd "C:/Users/roxfe/Documents/reel_progetti/correre_naturale"
export PYTHONIOENCODING=utf-8 RS_CONC=3
for key in "$@"; do
  if [ "$key" = "Y9v2" ]; then pid=cn-y9v2_costanza; rid=Y9v2_costanza
  else read -r pid rid <<<"$(python -I -c "import sys; sys.path.insert(0,'scripts'); from reels_ytcn38 import REELS; r=REELS['$key']; print('cn-'+r['id'].lower(), r['id'])")"; fi
  mp4="output/ytcn38/$rid.mp4"
  echo "== $key $(date +%H:%M) render"
  "$NODE" scripts/rs_render.js video "$pid" "$mp4" 2>&1 | grep -E "ok|rror"
  python -X utf8 scripts/qa_black.py "$mp4"
  python -X utf8 scripts/qa_flash.py "$mp4" | tail -3
  echo "== $key $(date +%H:%M) FINE"
done
echo "POMERIGGIO DONE $(date +%H:%M)"
