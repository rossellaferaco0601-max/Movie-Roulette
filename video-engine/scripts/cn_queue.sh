#!/usr/bin/env bash
# Coda di render: un reel alla volta, aspetta master e testi 3D necessari. Uso: scripts/cn_queue.sh v3 R1-fiatone R2-naso ...
set -uo pipefail
cd "$(dirname "$0")/.."
V="$1"; shift
declare -A WORDS=( [R1-fiatone]=SBAGLIATO [R2-naso]=NASO [R3-bocca]=ENERGIA [R4-piano]=PIANO [R5-esercizio1]=RESPIRA [R6-breathhold]=CONTROLLO [R7-ritmica]=RITMO [R8-dialogo]="RESPIRA LONTANO" )
for ID in "$@"; do
  for w in ${WORDS[$ID]}; do
    until [ "$(ls public/ytcn51/b3d/$w 2>/dev/null | wc -l)" -ge 48 ] && ! pgrep -f "b3d/$w " >/dev/null; do sleep 20; done
  done
  until [ -f "public/ytcn51/masters/$ID.mp4" ] && ! pgrep -f cn_master.py >/dev/null; do sleep 20; done
  echo "=== START $ID $(date +%H:%M)"
  rm -f "out/ytcn51/${ID}_${V}_raw.mp4"
  scripts/cn_finish.sh "$ID" "$V" 2>&1 | grep -v "^\s*at " | tail -5
  echo "=== DONE $ID $(date +%H:%M)"
done
echo "=== QUEUE FINISHED"
