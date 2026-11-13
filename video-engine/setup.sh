#!/usr/bin/env bash
# Installa/verifica gli strumenti del motore grafico (Linux Debian/Ubuntu). Idempotente.
set -euo pipefail
cd "$(dirname "$0")"
echo "== Node/npm/Python/Git/FFmpeg"
node --version; npm --version; python3 --version; git --version; ffmpeg -version | head -1
if ! command -v blender >/dev/null; then
  echo "== Blender"; sudo apt-get update -qq && sudo apt-get install -y -qq blender libegl1 libgl1 libgles2
fi
blender --version | head -1
echo "== Python: faster-whisper"
export HF_HUB_DISABLE_XET=1
pip3 install --quiet --break-system-packages faster-whisper "av<16" "av<16"
echo "== npm: Remotion, React, Three.js, GSAP, Lottie, ElevenLabs"
npm install
echo "== Remotion skills (già copiate in ../.claude/skills; per aggiornarle: npx skills add remotion-dev/skills)"
npx tsc && echo "typecheck ok"
echo "Tutto pronto. Preview: npm run dev — Render: npm run render -- KineticTitle out/test.mp4"
