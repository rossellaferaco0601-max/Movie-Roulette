#!/usr/bin/env bash
# Rende un project.json di ReelStudio con il motore cloud (composizione RSReel).
# Uso: scripts/rs_render.sh <project.json> <video in public/, es. ytcn51/ytcn51_src.mp4> <out.mp4> [srcW srcH]
set -euo pipefail
cd "$(dirname "$0")/.."
PROJ="$1"; VIDEO="$2"; OUT="$3"; SW="${4:-}"; SH="${5:-}"
PROPS="work/rs_props_$$.json"
npx tsx scripts/rs_props.ts "$PROJ" "$VIDEO" "$PROPS" $SW $SH
npx remotion render RSReel "$OUT" --props="$PROPS" --codec=h264 --crf=18 --timeout=180000 --log=error
rm -f "$PROPS"; echo "ok $OUT"
