#!/usr/bin/env bash
# Preset FFmpeg per reel. Uso: scripts/ffmpeg-presets.sh <comando> args...
set -euo pipefail
case "${1:-}" in
  to-reel)   # converte in verticale 1080x1920 con crop centrale: to-reel in.mp4 out.mp4
    ffmpeg -y -i "$2" -vf "scale=-2:1920,crop=1080:1920" -r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$3";;
  burn-srt)  # sottotitoli hard: burn-srt in.mp4 subs.srt out.mp4
    ffmpeg -y -i "$2" -vf "subtitles=$3:force_style='FontName=Inter,FontSize=22,Bold=1,Outline=2,MarginV=90'" -c:a copy "$4";;
  extract-audio) ffmpeg -y -i "$2" -vn -c:a pcm_s16le -ar 48000 "$3";;
  normalize-audio) # loudness -14 LUFS (social): normalize-audio in.mp4 out.mp4
    ffmpeg -y -i "$2" -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:v copy "$3";;
  concat)    # concat f1.mp4 f2.mp4 ... out.mp4 (stesso formato)
    out="${@: -1}"; list=$(mktemp); for f in "${@:2:$#-2}"; do echo "file '$(realpath "$f")'" >> "$list"; done
    ffmpeg -y -f concat -safe 0 -i "$list" -c copy "$out"; rm "$list";;
  thumb)     ffmpeg -y -ss "${4:-1}" -i "$2" -frames:v 1 -q:v 2 "$3";;
  *) grep -E '^\s+[a-z-]+\)' "$0"; exit 1;;
esac
