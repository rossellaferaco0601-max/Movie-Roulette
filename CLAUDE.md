# Movie-Roulette — motore grafico video/reel

Claude è usato come motore grafico per montare video e reel. Mappa delle cartelle in `LEGGIMI.md`. Il progetto Remotion vive in `video-engine/` (motore `CNReel` in `src/cn`, motore ReelStudio `RSReel` in `src/rs`).

## Strumenti
- Node 22 / npm / TypeScript, Python 3.13, FFmpeg 6, Git, Blender 4 (headless, Cycles CPU).
- Remotion 4 (+ transitions, captions, lottie, three, shapes, paths, noise, motion-blur, media-utils, gif), React 19, Three.js + react-three/fiber/drei, GSAP, lottie-web, SDK ElevenLabs.
- Whisper: `faster-whisper` (Python) via `video-engine/scripts/transcribe.py`.
- Chromium di sistema per il render: `/opt/pw-browsers/chromium` (impostato in `video-engine/remotion.config.ts`, override con `REMOTION_BROWSER`).

## Skill disponibili (`.claude/skills/`)
- Remotion ufficiali: `remotion-best-practices`, `remotion-create`, `remotion-markup`, `remotion-render`, `remotion-studio`, `remotion-captions`, `remotion-multimedia`, `remotion-interactivity`, `remotion-maps`, `remotion-saas`, `remotion-docs`, `remotion-upgrade`, `remotion-license`.
- Personalizzate: `kinetic-typography`, `motion-graphics`, `cinematic-animation`, `video-editing`, `compositing`, `audio-sync`, `subtitle-animation`, `broll-editing`, `web-animation-stack`, `cliente-correre-naturale`.
- `effects` (Vibha, 51 effetti con tracciamento del volto, Python/mediapipe): prima dell'uso va eseguito `bash .claude/skills/effects/scripts/setup.sh` con il consenso di Ross (codice esterno). Le regole del cliente vincono sugli effetti (niente emoji, volto libero).
- HyperFrames (`npm hyperframes` in `video-engine`): render HTML→video alternativo a Remotion per grafiche da pagina web.

## Comandi
```bash
cd video-engine
npm run dev                                   # Remotion Studio (preview)
npx remotion render R1-fiatone out/a.mp4      # render di un reel CN
npx remotion still R1-fiatone out/f.png --frame=75
scripts/cn_finish.sh R1-fiatone v3            # render + loudness + copertina + didascalia + ritrascrizione
scripts/rs_render.sh progetto.json ytcn51/ytcn51_src.mp4 out/x.mp4   # render di un project.json ReelStudio
python3 scripts/transcribe.py public/clip.mp4 --lang it --out src/captions/clip.json
scripts/ffmpeg-presets.sh                     # elenco preset FFmpeg
blender -b -P scripts/blender_render.py -- "TITOLO" out/title.png
```

## Clienti
`video-engine/reelstudio/` contiene il codice e i progetti di ReelStudio (la dashboard sul PC di Ross); nel cloud gira come composizione `RSReel` (asset in `video-engine/public/rs/`). Schema project.json e catalogo effetti: `video-engine/reelstudio/CLAUDE.md`. Mai committare `impostazioni.json` (chiavi API).
Le regole di montaggio e il contesto di ogni cliente stanno in `clienti/` (indice in `clienti/README.md`). Per Correre Naturale usa la skill `cliente-correre-naturale` prima di qualsiasi montaggio.

## Regole
- Le sorgenti (video/audio/immagini) vanno in `video-engine/public/` e si caricano con `staticFile()`.
- Ogni animazione è funzione pura di `useCurrentFrame()`; niente timer o CSS transition nel render.
- Controlla uno still prima di un render completo. Output in `video-engine/out/` (ignorato da git).
- Le chiavi API (ElevenLabs, Runway) vanno nei secret dell'ambiente, mai nel repo.
