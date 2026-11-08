#!/usr/bin/env python3
"""Gemini per il montaggio: analisi video/immagini, testi, immagini (Imagen) e video (Veo).
La chiave è iniettata dal proxy dell'ambiente (secret di rete su generativelanguage.googleapis.com,
intestazione x-goog-api-key): qui si manda un valore segnaposto.

Uso:
  python3 scripts/gemini.py models                                   # elenco modelli disponibili
  python3 scripts/gemini.py testo "Scrivi 3 hook per un reel su..."   # testo
  python3 scripts/gemini.py analizza video.mp4 "Dimmi i 5 momenti più forti con i tempi"   # video/immagine
  python3 scripts/gemini.py immagine "descrizione" out.png           # Imagen
  python3 scripts/gemini.py video "descrizione" out.mp4 [--immagine ref.png]   # Veo (asincrono, 1-3 min)
"""
import json, sys, time, base64, mimetypes, os, urllib.request, urllib.error

BASE = "https://generativelanguage.googleapis.com"
H = {"x-goog-api-key": "injected-by-proxy", "Content-Type": "application/json"}
MODEL_TEXT = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
MODEL_IMG = os.environ.get("GEMINI_IMAGE_MODEL", "imagen-4.0-generate-001")
MODEL_VIDEO = os.environ.get("GEMINI_VIDEO_MODEL", "veo-3.0-generate-001")

def call(method, path, body=None, raw=False):
    req = urllib.request.Request(BASE + path, method=method, headers=H, data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            data = r.read(); return data if raw else json.loads(data)
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Gemini {e.code}: {e.read().decode()[:800]}")

def upload(path):
    """File API (resumable) per video/immagini grandi; ritorna l'uri del file quando è ACTIVE."""
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"; size = os.path.getsize(path)
    req = urllib.request.Request(BASE + "/upload/v1beta/files", method="POST", data=json.dumps({"file": {"display_name": os.path.basename(path)}}).encode(),
        headers={**H, "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start", "X-Goog-Upload-Header-Content-Length": str(size), "X-Goog-Upload-Header-Content-Type": mime})
    with urllib.request.urlopen(req, timeout=120) as r: up = r.headers["X-Goog-Upload-URL"]
    with open(path, "rb") as f: data = f.read()
    req = urllib.request.Request(up, method="POST", data=data, headers={"Content-Length": str(size), "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize"})
    with urllib.request.urlopen(req, timeout=900) as r: info = json.loads(r.read())["file"]
    while info.get("state") == "PROCESSING":
        time.sleep(4); info = call("GET", "/v1beta/" + info["name"])
    return info["uri"], mime

def testo(prompt, parts_extra=None):
    body = {"contents": [{"parts": (parts_extra or []) + [{"text": prompt}]}]}
    out = call("POST", f"/v1beta/models/{MODEL_TEXT}:generateContent", body)
    return "".join(p.get("text", "") for p in out["candidates"][0]["content"]["parts"])

def main():
    a = sys.argv[1:]
    if not a or a[0] == "models":
        m = call("GET", "/v1beta/models?pageSize=100"); print("\n".join(x["name"].replace("models/", "") for x in m.get("models", []))); return
    cmd = a[0]
    if cmd == "testo": print(testo(a[1]))
    elif cmd == "analizza":
        uri, mime = upload(a[1]); print(testo(a[2] if len(a) > 2 else "Descrivi il video con i tempi dei momenti chiave.", [{"file_data": {"file_uri": uri, "mime_type": mime}}]))
    elif cmd == "immagine":
        out = call("POST", f"/v1beta/models/{MODEL_IMG}:predict", {"instances": [{"prompt": a[1]}], "parameters": {"sampleCount": 1, "aspectRatio": "9:16"}})
        open(a[2], "wb").write(base64.b64decode(out["predictions"][0]["bytesBase64Encoded"])); print("salvata", a[2])
    elif cmd == "video":
        inst = {"prompt": a[1]}
        if "--immagine" in a:
            p = a[a.index("--immagine") + 1]; inst["image"] = {"bytesBase64Encoded": base64.b64encode(open(p, "rb").read()).decode(), "mimeType": mimetypes.guess_type(p)[0]}
        op = call("POST", f"/v1beta/models/{MODEL_VIDEO}:predictLongRunning", {"instances": [inst], "parameters": {"aspectRatio": "9:16"}})
        name = op["name"]; print("operazione", name)
        while True:
            time.sleep(10); op = call("GET", "/v1beta/" + name)
            if op.get("done"): break
            print("…in lavorazione")
        vid = op["response"]["generateVideoResponse"]["generatedSamples"][0]["video"]["uri"]
        data = call("GET", vid.replace(BASE, ""), raw=True); open(a[2], "wb").write(data); print("salvato", a[2])
    else: print(__doc__)

if __name__ == "__main__": main()
