---
name: project-master-concat-aac-drift
description: Master multi-clip fatto con ffmpeg concat -c copy di pezzi AAC slitta di ~25 ms a pezzo (priming AAC) → parole mozzate ai tagli; serve duration esplicita nel concat + audio PCM ricostruito
metadata:
  type: project
---

Nel vlog del workshop (5/11/2026) le «parole tagliate» a fine frase, lamentate da Ross su v1, v2 e v3, venivano dal master:
`ffmpeg -f concat -c copy` di pezzi H.264+AAC accumula il priming AAC (~25 ms a pezzo), così audio e video del master erano in
ritardo fino a +545 ms rispetto ai tempi calcolati (n fotogrammi / 30) e i cuts di ReelStudio tagliavano l'ultima parola.
Corretto in `scripts/vlog_master.py`: `duration n/FPS` per ogni file nella lista del concat e audio ricostruito come un unico
flusso PCM a lunghezza esatta, codificato una volta. Verifica: durata del master = somma n/FPS, cross-correlazione audio pezzo/master = 0 ms.

**Why:** il difetto non si vede nei singoli pezzi né nei sottotitoli (che seguono i tempi calcolati), si sente solo come parola mozzata.
**How to apply:** mai concatenare in copia pezzi AAC per un master a tempi calcolati; dopo ogni master misurare lo scarto.
Vedi [[project-vlog-evento-workshop]] e [[project-iphone-hdr-tonemap]].
