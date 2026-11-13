#!/usr/bin/env python3
"""Confronto fra due trascrizioni dello stesso girato dentro i pezzi di un piano: mostra dove una ha parole che l'altra non ha.
Uso: python3 scripts/cn_words_diff.py work/x_long.json vecchie.json nuove.json"""
import json, sys, re, difflib
plan = json.load(open(sys.argv[1])); old = json.load(open(sys.argv[2])); new = json.load(open(sys.argv[3]))
norm = lambda t: re.sub(r"[^\wàèéìòù]", "", t.lower())
def inside(ws, a, b): return [w for w in ws if a <= (w["startMs"] + w["endMs"]) / 2000 <= b and norm(w["text"])]
for i, s in enumerate(plan["segments"]):
    o, n = inside(old, s["from"], s["to"]), inside(new, s["from"], s["to"])
    sm = difflib.SequenceMatcher(None, [norm(w["text"]) for w in o], [norm(w["text"]) for w in n], autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal": continue
        t = (o[i1]["startMs"] if i1 < len(o) else n[j1]["startMs"]) / 1000
        print(f"[{i}] {t:7.2f} {tag:8} VECCHIA «{' '.join(w['text'].strip() for w in o[i1:i2])}»  NUOVA «{' '.join(w['text'].strip() for w in n[j1:j2])}»")
