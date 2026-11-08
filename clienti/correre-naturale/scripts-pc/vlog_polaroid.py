"""Polaroid dalle foto dell'evento (solo foto con persone): cornice bianca, foto 4:5, didascalia in Blinker verde.
Uso: python scripts/vlog_polaroid.py  → ReelStudio/progetti/cn-vlog_workshop/foto/p_<nome>.png (720×900)"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "work", "evento", "foto")
OUT = "C:/Users/roxfe/Documents/ReelStudio/progetti/cn-vlog_workshop/foto"
FONT = os.path.join(ROOT, "assets", "fonts")
PHOTOS = {  # nome -> didascalia (solo foto con persone; 5/11 v3: maiuscole, i gradini sono «LA SQUADRA»)
    "IMG_0880": "LA SQUADRA", "a06dd467-14ab-44a7-a96e-b34311b3f4b4": "DAVANTI ALLA VILLA", "b49c29cb-8d8d-4122-b9b3-59a3a75108b3": "LA SQUADRA",
    "IMG_0603": "IN SALA", "IMG_0607": "DANIELE AL MICROFONO", "IMG_0608": "LA LEZIONE", "IMG_0616": "SUL PRATO", "IMG_0617": "IL GRUPPO",
    "IMG_0618": "SI ASCOLTA", "IMG_0619": "TECNICA DI CORSA", "IMG_0630": "VISTA SULLE COLLINE",
}
fonts = [f for f in os.listdir(FONT) if "SemiBold" in f and f.lower().endswith((".ttf", ".otf"))]
font = ImageFont.truetype(os.path.join(FONT, fonts[0]), 50)
W, H, M, B = 720, 900, 28, 150     # cornice: margine 28, bordo basso 150
for name, cap in PHOTOS.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, name + ".jpg"))).convert("RGB")
    pw, ph = W - 2 * M, H - M - B
    im = ImageOps.fit(im, (pw, ph), method=Image.LANCZOS, centering=(0.5, 0.4))
    card = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    card.paste(im, (M, M))
    d = ImageDraw.Draw(card)
    tw = d.textlength(cap, font=font)
    d.text(((W - tw) / 2, H - B + 42), cap, font=font, fill=(73, 118, 46))
    card.save(os.path.join(OUT, f"p_{name[:8]}.png"))
    print(name[:8], cap)
