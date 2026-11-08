---
name: project-iphone-hdr-tonemap
description: "Le clip iPhone dell'evento (e in genere i .mov da iPhone) sono HDR HLG/Dolby Vision 10 bit BT.2020 → serve il tone mapping in ffmpeg, altrimenti il girato esce piatto e scuro"
metadata:
  node_type: memory
  type: project
  originSessionId: 56351d93-3d47-47db-8a24-1bfce604a407
  modified: 2026-11-05T19:17:12.743Z
---

Le clip .mov del telefono di Paola (`input/evento`, workshop 24/10/2026) sono HEVC 10 bit, `color_transfer=arib-std-b67` (HLG),
BT.2020, con Dolby Vision. Convertite a SDR senza tone mapping (come nella v1/v2 del vlog, 5/11/2026) escono piatte, scure e slavate:
Ross: «hai fatto un disastro… non si vede niente». Da allora `scripts/vlog_master.py` applica `TONEMAP`
(`zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv`) a ogni sorgente HDR
(`is_hdr()` guarda `color_transfer` ∈ {arib-std-b67, smpte2084}); libplacebo c'è ma tende al giallo.

**Why:** ffmpeg con `scale`+`format=yuv420p` non converte il gamma/gamut HDR→SDR; il risultato sembra «qualità bassa» ma è un
problema di colore, non di risoluzione. Le clip WhatsApp (bt709) e i video Vimeo del sito sono già SDR.
**How to apply:** per ogni materiale nuovo controllare subito `ffprobe … color_transfer`; se HDR, tone mapping prima di qualsiasi
correzione colore, anche per fotogrammi di copertina e polaroid da video. Vedi [[project-vlog-evento-workshop]].
