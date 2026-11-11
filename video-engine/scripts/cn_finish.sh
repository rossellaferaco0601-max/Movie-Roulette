#!/usr/bin/env bash
# Finitura e QA di un reel: loudness -14 LUFS, anteprima leggera, copertina, didascalia, foglio fotogrammi, ritrascrizione.
# Uso: scripts/cn_finish.sh R1-fiatone [versione]
set -euo pipefail
cd "$(dirname "$0")/.."
ID="$1"; V="${2:-v2}"; OUT="out/ytcn51"; mkdir -p "$OUT/check" "$OUT/consegna"
RAW="$OUT/${ID}_${V}_raw.mp4"; FIN="$OUT/consegna/${ID}_${V}.mp4"
[ -f "$RAW" ] || npx remotion render "$ID" "$RAW" --codec=h264 --crf=18 --log=error
ffmpeg -loglevel error -y -i "$RAW" -af "loudnorm=I=${LUFS:--14}:TP=-1.5:LRA=11" -c:v copy -movflags +faststart "$FIN"
# il clic di «Pubblica» nella CTA va tenuto discreto: la normalizzazione lo alza (parte quasi muta), qui lo si riporta giù di ~10 dB
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$FIN"); CA=$(python3 -c "print(round($D-${CTA_S:-8}-0.5+142/30-0.03,3))"); CB=$(python3 -c "print(round($D-${CTA_S:-8}-0.5+142/30+0.3,3))")
ffmpeg -loglevel error -y -i "$FIN" -c:v copy -af "volume=volume=0.3:enable='between(t,$CA,$CB)'" -c:a aac -b:a 256k -movflags +faststart "${FIN%.mp4}_tmp.mp4" && mv "${FIN%.mp4}_tmp.mp4" "$FIN"
ffmpeg -loglevel error -y -i "$FIN" -vf scale=540:-2 -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k -movflags +faststart "$OUT/consegna/${ID}_${V}_anteprima.mp4"
npx remotion still "$ID" "$OUT/consegna/${ID}_copertina.jpg" --frame=40 --log=error
npx tsx -e "import {REELS} from './src/cn/reels51'; const r=REELS.find(x=>x.id==='$ID')!; require('fs').writeFileSync('$OUT/consegna/${ID}_didascalia.txt', r.didascalia+'\n')"
ffmpeg -loglevel error -y -i "$FIN" -vf "fps=1/3,scale=270:-1,tile=8x2" -frames:v 1 "$OUT/check/${ID}_${V}_sheet.jpg"
echo "== $ID $V"; ffprobe -v error -show_entries format=duration -of csv=p=0 "$FIN" | sed 's/^/durata /'
ffmpeg -i "$FIN" -af "loudnorm=print_format=summary" -f null - 2>&1 | grep -E "Input Integrated|Input True Peak"
ffmpeg -loglevel error -y -i "$FIN" -ac 1 -ar 16000 -vn "work/ytcn51/${ID}_check.wav"
HF_HUB_DISABLE_XET=1 python3 - <<PY 2>/dev/null
from faster_whisper import WhisperModel
m=WhisperModel('medium',device='cpu',compute_type='int8')
segs,_=m.transcribe('work/ytcn51/${ID}_check.wav',language='it',vad_filter=False)
print('ritrascrizione:', ' '.join(s.text.strip() for s in segs))
PY
