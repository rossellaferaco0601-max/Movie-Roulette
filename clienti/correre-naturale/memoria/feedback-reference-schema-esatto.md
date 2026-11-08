---
name: feedback-reference-schema-esatto
description: "Quando Ross dà una reference video, misurarla e replicarne lo schema esatto (cadenza degli stacchi, durata inquadrature, posizione testi), non solo lo stile"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 56351d93-3d47-47db-8a24-1bfce604a407
  modified: 2026-11-06T20:43:03.416Z
---

6/11/2026: il primo condensato del vlog (scene da 2-3 s, 5 frasi parlate) è stato bocciato: «si è perso completamente il ritmo
della reference, devi seguire quello schema esatto per l'editing, il ritmo deve essere molto veloce». La reference era un reel
da 17 s con uno stacco ogni ~1,1 s e una parola per scena.

Seconda bocciatura (v2, parole grandi e titolo fisso): «la struttura deve essere questa, devi replicare applicando le cose del brand,
la prima parte deve essere così, poi magari allunghi». Ross ha mandato anche il progetto CapCut della reference: lì si leggono le durate dei testi.

**Why:** per Ross la reference è uno schema di montaggio da copiare (ritmo, struttura), non un'ispirazione di stile.

**How to apply:** prima di montare, misurare la reference con ffmpeg (scene detection, inviluppo audio, contact sheet a 4 fps):
durata delle inquadrature, cadenza, dove stanno i testi, quante inquadrature per etichetta. Replicare quei numeri (es. 34 fotogrammi
a stacco), poi tradurre solo la grafica nel brand. I tratti parlati devono restare frasi intere ma brevi; se una frase intera è lunga,
scena muta con etichetta. Il logo va sempre scontornato (logo circolare bianco), mai su disco. Vedi [[feedback-vlog-dinamico]],
[[feedback-solo-punti-richiesti]].

7/11/2026: Ross ha dato un brano commerciale (Jalen Ngonda) per il condensato: «usa questo audio, max 1 minuto, riprese migliori, togli ogni altro
audio o suono». Con un brano dato da Ross nel reel c'è solo quello (clip mute, niente pop/sfx/parlato) e gli stacchi vanno sui colpi MISURATI
(librosa in venv_tts), perché il tempo delle band dal vivo oscilla. Il brano parte DALL'INIZIO del file (la versione dal ritornello è stata
bocciata: «doveva partire dall'inizio»); la CTA va dove cade una frase forte, trovata trascrivendo il testo con Whisper.
Dettagli tecnici in REGOLE-MONTAGGIO.md (voce 2026-11-07).

