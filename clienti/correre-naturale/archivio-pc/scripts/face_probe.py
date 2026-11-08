import cv2, json, sys
cap = cv2.VideoCapture("work/proxy_360.mp4")
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
res = {}
for t in [2, 17, 26, 40, 56, 78, 95, 110, 115, 125, 137, 162, 203, 249, 254, 263, 273, 287, 293, 302, 314, 323, 336, 378, 386, 480, 530, 546, 558, 571, 584, 600, 657, 669, 690]:
    cap.set(cv2.CAP_PROP_POS_MSEC, t*1000)
    ok, f = cap.read()
    if not ok: continue
    H, W = f.shape[:2]
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    faces = casc.detectMultiScale(g, 1.1, 5, minSize=(20,20))
    if len(faces):
        x,y,w,h = max(faces, key=lambda r:r[2]*r[3])
        res[t] = [round((x+w/2)/W,3), round(y/H,3), round((y+h)/H,3), round(w/W,3)]
    else: res[t] = None
for k,v in res.items(): print(k, v)
