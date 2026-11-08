# Pipeline notturna (6/11): per ogni reel, in serie e senza parallelismo → render + controlli. bash scripts/notte.sh Y1 Y2 … Y9v2
# Log in work/notte.log. Y9v2 ha il suo project (cn-y9v2_costanza) e id Y9v2_costanza.
NODE="C:/Users/roxfe/Documents/ReelStudio/tools/node/node.exe"
cd "C:/Users/roxfe/Documents/reel_progetti/correre_naturale"
export PYTHONIOENCODING=utf-8 RS_CONC=3 QA_THREADS=6
for key in "$@"; do
  if [ "$key" = "Y9v2" ]; then pid=cn-y9v2_costanza; rid=Y9v2_costanza; qkey=Y9v2_costanza
  else read -r pid rid <<<"$(python -I -c "import sys; sys.path.insert(0,'scripts'); from reels_ytcn38 import REELS; r=REELS['$key']; print('cn-'+r['id'].lower(), r['id'])")"; qkey=$key; fi
  mp4="output/ytcn38/$rid.mp4"
  echo "== $key $pid $(date +%H:%M) render"
  "$NODE" scripts/rs_render.js video "$pid" "$mp4" 2>&1 | grep -E "ok|rror"
  echo "-- $key $(date +%H:%M) qa_black / qa_flash"
  python -X utf8 scripts/qa_black.py "$mp4"
  python -X utf8 scripts/qa_flash.py "$mp4" | tail -4
  echo "-- $key $(date +%H:%M) qa_volto"
  python -X utf8 scripts/qa_volto.py "$pid" "$mp4" 0.25
  echo "-- $key $(date +%H:%M) frames + audio"
  python -X utf8 scripts/ytcn38_qa.py frames "$qkey" 2>&1 | tail -3
  python -X utf8 scripts/ytcn38_qa.py audio "$qkey" 2>&1 | grep -v "^$" | tail -8
  echo "== $key $(date +%H:%M) FINE"
done
echo "NOTTE DONE $(date +%H:%M)"
