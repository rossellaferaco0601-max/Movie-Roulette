"""Uso: python scripts/build.py R1 [R2 ...]  → output/<id>.mp4"""
import os, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_engine import ROOT, build  # noqa: E402
from reels_longevita import REELS  # noqa: E402

for key in sys.argv[1:] or list(REELS):
    t = time.time()
    out, meta = build(REELS[key], os.path.join(ROOT, "output"))
    print(f"{key}: {out}  {meta['vframes'] / 30:.1f}s + CTA  ({time.time() - t:.0f}s)")
