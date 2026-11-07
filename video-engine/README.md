# video-engine — stato degli strumenti

| Strumento | Stato nel cloud Claude Code | Note |
|---|---|---|
| Node.js 22, npm, Git, Python 3.13 | ✅ preinstallati | |
| FFmpeg 6.1 | ✅ preinstallato | preset in `scripts/ffmpeg-presets.sh` |
| Remotion 4 + pacchetti (`transitions`, `captions`, `lottie`, `three`, `shapes`, `paths`, `noise`, `motion-blur`, `media-utils`, `gif`, `player`) | ✅ installati (`npm install`) | render verificato su 3 composizioni |
| Remotion Agent Skills | ✅ copiate in `../.claude/skills/remotion-*` da `remotion-dev/skills` | aggiornare con `npx skills add remotion-dev/skills` |
| Remotion Claude Code Plugin | ⚠️ equivalente alle skill già installate | il sito remotion.dev non è raggiungibile dalla rete del container; sul tuo PC: `/plugin marketplace add remotion-dev/skills` poi `/plugin install` dalla lista |
| React 19, Three.js + R3F/drei, GSAP, lottie-web | ✅ installati | vedi skill `web-animation-stack` |
| CSS Animations, SVG, WebGL, Web Audio API | ✅ tecnologie del browser (Chromium di sistema) | linee guida nella skill `web-animation-stack` |
| Whisper | ✅ `faster-whisper` installato, script `scripts/transcribe.py` | il download dei modelli richiede accesso a `huggingface.co` (allowlist di rete) |
| Blender 4.0 | ✅ installato via apt, solo headless (`blender -b`) | Cycles CPU, denoiser disattivato; nessuna GUI nel cloud |
| ElevenLabs | ✅ SDK `elevenlabs` installato | serve `ELEVENLABS_API_KEY` come secret di ambiente |
| Runway | ⚠️ via API REST / `@runwayml/sdk` | serve `RUNWAYML_API_SECRET`; istruzioni nella skill `broll-editing` |
| DaVinci Resolve | ❌ non installabile | app desktop con GUI/GPU; usa Remotion+FFmpeg qui, Resolve sul tuo PC per il color finale |
| Visual Studio Code | ❌ non installabile nel container | usa VS Code sul tuo PC con l'estensione Claude Code su questo repo |
| Figma | ⚠️ solo via connettore/plugin Figma di Claude (il server MCP Figma non si è connesso in questa sessione) | esporta asset SVG/PNG in `public/` |

## Composizioni di esempio (1080x1920, 30 fps)
- `KineticTitle` — titolo kinetic typography (props: `words`, `accent`, `background`)
- `SubtitledReel` — reel con sottotitoli word-by-word da Whisper (props: `video`, `audio`, `captions`)
- `BRollMontage` — montaggio B-roll con Ken Burns e transizioni (props: `shots`, `transition`)

## Setup su una macchina nuova
`./setup.sh`
