#!/usr/bin/env python3
"""Controllo del volto grafica per grafica: per ogni elemento NON a tutto schermo di un reel, il mento più basso mentre la grafica è a schermo
deve restare sopra il bordo alto delle grafiche. Usa la serie *_mento.json di cn_facecheck.py e i tempi di validate-reels.ts.
Uso: python3 scripts/cn_facecheck_elements.py R2-naso public/ytcn51/masters/R2-naso_mento.json [bordo=0.44]"""
import json, re, subprocess, sys
rid, serie = sys.argv[1], json.load(open(sys.argv[2])); top = float(sys.argv[3]) if len(sys.argv) > 3 else 0.44
out = subprocess.run(["npx", "tsx", "scripts/validate-reels.ts"], capture_output=True, text=True).stdout
block = out.split(f"\n{rid}:")[1].split("\n\n")[0]; bad = 0
for m in re.finditer(r"^\s*([\d.]+)-\s*([\d.]+)\s+(\S+)", block, re.M):
    a, b, name = float(m.group(1)), float(m.group(2)), m.group(3)
    if re.search(r"orbit|drill|guide|pair|lifebar|fulltext|slides|renew|versus|plan", name): continue
    c = [y for t, y in serie if a <= t <= b]
    if not c: continue
    ok = max(c) < top; bad += not ok
    print(f"  {a:6.2f}-{b:6.2f} {name:14s} mento max {max(c):.3f} {'ok' if ok else '✗ TOCCA IL VOLTO'}")
print(f"{rid}: {'✗ ' + str(bad) + ' grafiche sul volto' if bad else '✓ volto sempre libero'}"); sys.exit(1 if bad else 0)
