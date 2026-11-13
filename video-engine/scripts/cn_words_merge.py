#!/usr/bin/env python3
"""Sottotitoli delle versioni lunghe: unisce la trascrizione dell'intero girato (più completa nelle frasi, tempi allineati) con quella
rifatta pezzo per pezzo (scripts/cn_long_words.py), che ritrova le parole saltate vicino alle pause lunghe.
Regola: si tengono le parole vecchie; dalla nuova si prendono le AGGIUNTE (parole che la vecchia non ha) e le sostituzioni elencate in --usa.
Uso: python3 scripts/cn_words_merge.py work/x_long.json vecchie.json nuove.json uscita.json [--usa "vecchia=nuova" ...] [--no "testo da non aggiungere" ...]"""
import json, sys, re, difflib
args = sys.argv[1:]; usa, no = set(), []
while "--usa" in args: i = args.index("--usa"); usa.add(args[i + 1]); del args[i:i + 2]
while "--no" in args: i = args.index("--no"); no.append(args[i + 1]); del args[i:i + 2]
plan, old, new = (json.load(open(a)) for a in args[:3])
norm = lambda t: re.sub(r"[^\wàèéìòù]", "", t.lower())
# la nuova trascrizione spezza apostrofi e trattini («l 'asticella», «marzo -aprile»): si riattaccano
def rejoin(ws):
    joined = []
    for w in ws:
        t = w["text"].strip()
        if joined and (t[:1] in "'-," and len(t) > 1 or joined[-1]["text"].strip().endswith(("'", "-"))):
            joined[-1] = dict(joined[-1], text=joined[-1]["text"] + t, endMs=w["endMs"])
        else: joined.append(dict(w))
    return joined
old, new = rejoin(old), rejoin(new)
def inside(ws, a, b): return [w for w in ws if a <= (w["startMs"] + w["endMs"]) / 2000 <= b and norm(w["text"])]
out = []
for k, s in enumerate(plan["segments"]):
    o, n = inside(old, s["from"], s["to"]), inside(new, s["from"], s["to"])
    sm = difflib.SequenceMatcher(None, [norm(w["text"]) for w in o], [norm(w["text"]) for w in n], autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        ot, nt = " ".join(w["text"].strip() for w in o[i1:i2]), " ".join(w["text"].strip() for w in n[j1:j2])
        if tag in ("equal", "delete"): out += o[i1:i2]
        elif tag == "insert":
            if any(x.lower() in nt.lower() for x in no): print(f"[{k}] non aggiunta: «{nt}»"); continue
            out += n[j1:j2]; print(f"[{k}] aggiunta: «{nt}»")
        elif f"{ot}={nt}" in usa: out += n[j1:j2]; print(f"[{k}] sostituita: «{ot}» → «{nt}»")
        else: out += o[i1:i2]
# l'ordine è quello del discorso (non si riordina per tempo: le parole vecchie allungate sopra una pausa hanno inizi sbagliati);
# i tempi si rendono crescenti dentro ogni pezzo
segof = lambda w: next((k for k, s in enumerate(plan["segments"]) if s["from"] <= (w["startMs"] + w["endMs"]) / 2000 <= s["to"]), -1)
for i in range(1, len(out)):
    if segof(out[i]) == segof(out[i - 1]) and out[i]["startMs"] <= out[i - 1]["startMs"]:
        out[i] = dict(out[i]); out[i]["startMs"] = out[i - 1]["startMs"] + 60; out[i]["endMs"] = max(out[i]["endMs"], out[i]["startMs"] + 120)
# parole allungate sopra una pausa (durano più di 1,2 s): la fine torna vicina all'inizio, così il sottotitolo non resta appeso
for i, w in enumerate(out):
    if w["endMs"] - w["startMs"] > 1200: w["endMs"] = w["startMs"] + min(700, 110 * len(w["text"].strip()) + 150)
    if i + 1 < len(out) and w["endMs"] > out[i + 1]["startMs"] > w["startMs"]: w["endMs"] = out[i + 1]["startMs"]
json.dump(out, open(args[3], "w"), ensure_ascii=False, indent=1); print(len(out), "parole →", args[3])
