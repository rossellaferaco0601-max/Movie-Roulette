---
name: broll-editing
description: Montaggio B-roll: sequenze di clip/immagini di copertura, Ken Burns, transizioni, ritmo sul parlato, stock footage e generazione (Runway). Usa per coprire un voiceover con immagini, montaggi fotografici, slideshow dinamici, inserti.
---

# B-roll Editing

Base: `video-engine/src/compositions/BRollMontage.tsx` (lista di `shots` con `src`, `seconds`, `zoom`, `label`; transizioni `fade`/`slide`).

## Regole di montaggio
- Il B-roll copre il parlato: cambia inquadratura quando cambia il concetto nella trascrizione (usa i `startMs` delle frasi dal `.srt`).
- Durata per shot: 1.5–3 s nei reel, 3–5 s in video lunghi; alterna campi larghi e dettagli.
- Ken Burns: zoom 1.08–1.15 o pan leggero; alterna direzioni (in/out, sinistra/destra) tra shot consecutivi.
- Transizioni: taglio secco di default; `fade` 8–12 frame per cambi di sezione; `slide`/`wipe` solo con intenzione stilistica.
- Mantieni il colore coerente: stesso grading (`filter`) su tutti gli shot o LUT comune.
- Immagini: ≥ 2160px sul lato lungo se si usa zoom; `objectFit: cover`.

## Sorgenti
- Clip dell'utente in `public/`; immagini `jpg/png/webp`.
- Stock: Pexels/Pixabay (richiedono API key o download manuale).
- **Runway** (generazione video AI): API REST `api.dev.runwayml.com` con header `Authorization: Bearer $RUNWAYML_API_SECRET` e `X-Runway-Version: 2024-11-06`; task `image_to_video` (modello `gen4_turbo`, `ratio` 720:1280 per verticale), poll `GET /v1/tasks/{id}` finché `SUCCEEDED`, scarica l'output in `public/`. SDK npm: `@runwayml/sdk` (installabile al bisogno). La chiave va in un secret di ambiente, mai nel repo.

## Da trascrizione a shot list (pattern)
1. Leggi `src/captions/clip.srt`, estrai frasi con tempi.
2. Per ogni frase scegli/genera un'immagine o clip; crea `shots = [{src, seconds: (end-start)/1000}]`.
3. Passa `shots` come props: `npx remotion render BRollMontage out/broll.mp4 --props=shots.json`.
4. Sovrapponi voce e sottotitoli componendo `BRollMontage` dentro `SubtitledReel` (B-roll come layer di sfondo).
