"""Prova di clonazione vocale (Chatterbox multilingue, CPU): scarica i pesi e genera una frase di prova."""
import sys, time, torch, torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
ref, out, text = sys.argv[1], sys.argv[2], sys.argv[3]
t = time.time()
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
print("modello caricato in %.0fs" % (time.time() - t), flush=True)
t = time.time()
wav = m.generate(text, language_id="it", audio_prompt_path=ref, exaggeration=0.45, cfg_weight=0.5)
torchaudio.save(out, wav, m.sr)
print("generato %.1fs di audio in %.0fs" % (wav.shape[-1] / m.sr, time.time() - t))
