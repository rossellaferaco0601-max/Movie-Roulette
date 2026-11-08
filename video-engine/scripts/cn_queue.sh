#!/usr/bin/env bash
# Coda di render: un reel alla volta. Per ogni reel: master (se manca), effetti della skill (se il reel ne ha), finitura.
# Uso: scripts/cn_queue.sh v5 R1-fiatone R2-naso ...
set -uo pipefail
cd "$(dirname "$0")/.."
V="$1"; shift
npx tsx scripts/export-reels.ts >/dev/null
for ID in "$@"; do
  echo "=== START $ID $(date +%H:%M)"
  [ -f "public/ytcn51/masters/$ID.mp4" ] || python3 scripts/cn_master.py work/ytcn51/reels.json public/ytcn51/masters "$ID"
  if grep -q "master(\"$ID\", true)" src/cn/reels51.ts; then
    [ -f "public/ytcn51/masters/${ID}_fx.mp4" ] || npx tsx scripts/cn_fx.ts "$ID" 2>&1 | grep -v "^  File\|Traceback\|TypeError\|Exception ignored" | tail -2
  fi
  rm -f "out/ytcn51/${ID}_${V}_raw.mp4"
  scripts/cn_finish.sh "$ID" "$V" 2>&1 | grep -v "^\s*at " | tail -6
  echo "=== DONE $ID $(date +%H:%M)"
done
echo "=== QUEUE FINISHED"
