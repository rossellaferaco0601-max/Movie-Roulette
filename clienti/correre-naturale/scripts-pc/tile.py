"""Griglia di immagini: python scripts/tile.py <out.jpg> <larghezza_cella> <colonne> <img1> <img2> ..."""
import sys
from PIL import Image
out, cw, cols, files = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4:]
ims = [Image.open(f).convert("RGB") for f in files]
ch = round(cw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cw * cols, ch * rows), (20, 20, 20))
for i, im in enumerate(ims):
    sheet.paste(im.resize((cw, ch), Image.LANCZOS), ((i % cols) * cw, (i // cols) * ch))
sheet.save(out, quality=88)
print(out, len(ims))
