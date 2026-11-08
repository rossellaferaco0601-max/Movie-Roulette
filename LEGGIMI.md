# Movie-Roulette — studio di montaggio reel con Claude

Tutto quello che serve per montare reel e video (oggi per Correre Naturale®) sta in questa cartella. Parti da qui.

## Mappa
```
Movie-Roulette/
├─ LEGGIMI.md                 ← questa mappa
├─ CLAUDE.md                  ← istruzioni per Claude (strumenti, regole di lavoro)
├─ .claude/skills/            ← skill: regole del cliente, Remotion, tipografia, 3D, sottotitoli…
├─ clienti/
│  ├─ correre-naturale/
│  │  ├─ REGOLE-MONTAGGIO.md  ← FONTE DI VERITÀ: brief, correzioni di Ross/Paola/Oscar, note tecniche
│  │  ├─ CONTESTO.md          ← persone, brand, stile, stato dei progetti
│  │  ├─ memoria/             ← note di Claude dal PC: ogni correzione spiegata (perché e come applicarla)
│  │  ├─ brand/               ← brand.json, 8 loghi, manuale del marchio (PDF + pagine), font Blinker, foto stories
│  │  ├─ guide/               ← guida ai reel (13 capitoli), guida e prompt dei caroselli, regole caroselli
│  │  ├─ reference/           ← reel CN già pubblicati, reference reel, analisi del materiale di riferimento
│  │  ├─ consegne/            ← cosa è stato consegnato: longevita/, ytcn38/, evento/, ytcn51/ (checklist, didascalie, copertine)
│  │  └─ archivio-pc/         ← vecchio flusso Windows (script Python, CLAUDE del PC, proposte): solo consultazione
│  └─ vale-fitcoach/          ← secondo cliente (solo contesto, per ora)
└─ video-engine/              ← il motore di montaggio (Remotion)
   ├─ src/cn/                 ← motore «CN»: master FFmpeg, sottotitoli, hook, grafiche 2D/3D, CTA (reel YTCN 51)
   ├─ src/rs/                 ← motore «ReelStudio» (lo stesso del PC): 60+ effetti, legge i project.json
   ├─ reelstudio/             ← codice originale di ReelStudio, i 35 project.json fatti finora, CLAUDE.md con
   │                            lo schema e il catalogo effetti, REGOLE-REELSTUDIO.md (reel, caroselli, storie)
   ├─ scripts/                ← transcribe.py (Whisper), cn_master.py (tagli), cn_finish.sh (controlli e consegna),
   │                            cn_queue.sh (coda render), rs_render.sh (render di un project.json), blender_text3d.py…
   ├─ public/rs/              ← font, 29 suoni, 15 musiche, loghi usati dai motori
   ├─ public/<progetto>/      ← video sorgente e master (NON in git)
   ├─ work/<progetto>/        ← trascrizioni e file di lavoro
   └─ out/<progetto>/consegna ← reel finiti, copertine, didascalie, anteprime (NON in git)
```

## Come si lavora (flusso tipo)
1. Carichi il video sorgente su Drive (condiviso «Chiunque abbia il link») e dici a Claude il nome.
2. Claude lo scarica in `video-engine/public/<progetto>/`, lo trascrive con Whisper, propone i reel (piano in chat) e aspetta il via.
3. Monta con le regole del cliente; mostra fotogrammi e anteprima; ogni correzione finisce in `REGOLE-MONTAGGIO.md`.
4. Consegna: MP4 1080×1920 + copertina + didascalia, controlli automatici (ritrascrizione, loudness, volto libero).

## Due motori, quando usarli
- **CN** (`src/cn`): reel da video lunghi, tagli precisi, sottotitoli hormozi, grafiche 3D e simulazioni. È quello usato per YTCN 51.
- **ReelStudio** (`src/rs`): gli stessi effetti e stili della dashboard del PC, guidati da un `project.json`. Utile per rifare o ritoccare un reel già costruito sul PC: `scripts/rs_render.sh progetto.json video.mp4 out.mp4`.

## Ambiente cloud
«video editing correre naturale»: installa da solo FFmpeg, Blender, Whisper e le librerie; rete aperta verso Drive, Hugging Face, Remotion, ElevenLabs e Runway. Le chiavi API non stanno mai nel repo (vanno nei secret dell'ambiente).
