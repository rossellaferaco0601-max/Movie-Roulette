# Project — progetti di contenuti social

Ogni progetto ha la sua cartella. Lavora solo nella cartella del progetto della sessione.

| Cartella | Progetto | Leggi prima |
|---|---|---|
| `caroselli-valefitcoach/` | Caroselli Instagram per @vale.fitcoach | `CONTESTO.md` |
| `video-editing-correre-naturale/` | Reel e vlog per Correre Naturale® | skill `cliente-correre-naturale`, `REGOLE-MONTAGGIO.md`, `CONTESTO.md` |
| `video-editing-valefitcoach/` | Reel per @vale.fitcoach | `../caroselli-valefitcoach/CONTESTO.md` |
| `ciak-studio/` | Ciak Studio | `README.md` |
| `video-engine/` | Motore grafico condiviso (Remotion) per tutti i progetti video | `video-engine/README.md` |

Le skill in `.claude/skills/` valgono per tutti i progetti.

# Motore grafico video/reel (`video-engine/`)

Claude è usato come motore grafico per montare video e reel. Il progetto Remotion vive in `video-engine/`; le composizioni specifiche di un cliente stanno in `video-engine/src/<cliente>/` (es. `src/cn/` per Correre Naturale) e i file di lavoro in `video-engine/work/`.

## Strumenti
- Node 22 / npm / TypeScript, Python 3.13, FFmpeg 6, Git, Blender 4 (headless, Cycles CPU).
- Remotion 4 (+ transitions, captions, lottie, three, shapes, paths, noise, motion-blur, media-utils, gif), React 19, Three.js + react-three/fiber/drei, GSAP, lottie-web, SDK ElevenLabs.
- Whisper: `faster-whisper` (Python) via `video-engine/scripts/transcribe.py`.
- Chromium di sistema per il render: `/opt/pw-browsers/chromium` (impostato in `video-engine/remotion.config.ts`, override con `REMOTION_BROWSER`).

## Skill disponibili (`.claude/skills/`)
- Remotion ufficiali: `remotion-best-practices`, `remotion-create`, `remotion-markup`, `remotion-render`, `remotion-studio`, `remotion-captions`, `remotion-multimedia`, `remotion-interactivity`, `remotion-maps`, `remotion-saas`, `remotion-docs`, `remotion-upgrade`, `remotion-license`.
- Personalizzate: `kinetic-typography`, `motion-graphics`, `cinematic-animation`, `video-editing`, `compositing`, `audio-sync`, `subtitle-animation`, `broll-editing`, `web-animation-stack`.

## Comandi
```bash
cd video-engine
npm run dev                                   # Remotion Studio (preview)
npx remotion render KineticTitle out/a.mp4    # render
npx remotion still SubtitledReel out/f.png --frame=75
python3 scripts/transcribe.py public/clip.mp4 --lang it --out src/captions/clip.json
scripts/ffmpeg-presets.sh                     # elenco preset FFmpeg
blender -b -P scripts/blender_render.py -- "TITOLO" out/title.png
```

## Clienti
Contesto e regole di montaggio stanno nella cartella di ogni progetto (vedi tabella sopra). Per Correre Naturale usa la skill `cliente-correre-naturale` prima di qualsiasi montaggio. Ogni nuova regola di montaggio va nel `REGOLE-MONTAGGIO.md` del progetto.

## Regole
- Le sorgenti (video/audio/immagini) vanno in `video-engine/public/` e si caricano con `staticFile()`.
- Ogni animazione è funzione pura di `useCurrentFrame()`; niente timer o CSS transition nel render.
- Controlla uno still prima di un render completo. Output in `video-engine/out/` (ignorato da git).
- Le chiavi API (ElevenLabs, Runway) vanno nei secret dell'ambiente, mai nel repo.

Connettori Claude attivi sull'account: Canva, Fathom, Google Calendar, Google Drive, Google Sheets, Windsor.ai.
