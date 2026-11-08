import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { gsap } from "gsap";
import { ThreeCanvas } from "@remotion/three";
import { BRAND, GFX_H, GFX_TOP, H, W, PANEL_X, PANEL_W } from "./types";
import type { Element } from "./types";
import { useInOut } from "./Elements3D";

const FONT = "Blinker, sans-serif";
const easeOut = gsap.parseEase("power3.out");

/* ---------- Gradini: il corpo si allena per gradi (scala che si costruisce un gradino alla volta, pallina che sale) ---------- */
export const Stairs: React.FC<{ el: Extract<Element, { kind: "stairs" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const n = el.steps ?? 5;
  const boxW = PANEL_W, boxH = GFX_H - 10;
  const padX = 60, baseY = boxH - 44, stepW = (boxW - padX * 2) / n, stepH = (boxH - 150) / n;
  const per = Math.max(6, Math.floor((durF - 30) / n)); // frame per gradino
  const k = (local - 10) / per; // gradino corrente (frazionario)
  const ballIdx = Math.min(n - 1, Math.max(0, Math.floor(k)));
  const ballT = Math.min(1, Math.max(0, k - ballIdx));
  const hop = Math.sin(Math.PI * ballT) * 36;
  const bx = padX + stepW * (ballIdx + 0.5) + stepW * easeOut(ballT) * (ballIdx < n - 1 ? 1 : 0);
  const by = baseY - stepH * (ballIdx + 1) - 26 - hop - (ballIdx < n - 1 ? stepH * easeOut(ballT) : 0);
  return (
    <div
      style={{
        position: "absolute", left: PANEL_X, width: boxW, top: GFX_TOP, height: boxH, borderRadius: 30, overflow: "hidden",
        background: "rgba(11,15,10,0.88)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", fontFamily: FONT, color: BRAND.white,
        opacity: Math.min(1, s * 1.3) * out, transform: `translateY(${(1 - s) * 40}px)`,
      }}
    >
      <div style={{ position: "absolute", top: 18, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: BRAND.lime }}>{el.title}</div>
      <svg width={boxW} height={boxH} style={{ position: "absolute", top: 0, left: 0 }}>
        {Array.from({ length: n }).map((_, i) => {
          const g = interpolate(local - 10 - i * per, [0, per * 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.4)) });
          const h = stepH * (i + 1) * g;
          const lit = k >= i;
          return (
            <g key={i}>
              <rect x={padX + stepW * i + 6} y={baseY - h} width={stepW - 12} height={h} rx={10} fill={lit ? BRAND.green : "rgba(255,255,255,0.12)"} />
              <rect x={padX + stepW * i + 6} y={baseY - h} width={stepW - 12} height={Math.min(10, h)} rx={5} fill={lit ? BRAND.lime : "rgba(255,255,255,0.25)"} />
              <text x={padX + stepW * (i + 0.5)} y={baseY + 32} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={lit ? BRAND.cream : "rgba(255,255,255,0.45)"}>{i === 0 ? "SETT. 1" : `${i + 1}`}</text>
            </g>
          );
        })}
        <line x1={padX} x2={boxW - padX} y1={baseY} y2={baseY} stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
        {local > 10 ? <circle cx={bx} cy={by} r={22} fill={BRAND.lime} style={{ filter: `drop-shadow(0 0 12px ${BRAND.lime})` }} /> : null}
      </svg>
    </div>
  );
};

/* ---------- Titolo spezzato: scheda crema dall'alto, il video si rimpicciolisce sotto (nessun taglio della testa) ---------- */
export const splitCamera = (frame: number, start: number, durF: number) => {
  const local = frame - start;
  if (local < -1 || local > durF + 1) return 0;
  const kin = easeOut(Math.min(1, Math.max(0, local / 13)));
  const kout = Math.min(1, Math.max(0, (durF - local) / 9));
  return kin * kout;
};
export const SPLIT_CARD_H = 0.22; // frazione dell'altezza: il video scende di altrettanto, a tutta larghezza

export const SplitCard: React.FC<{ el: Extract<Element, { kind: "split" }>; start: number }> = ({ el, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const k = splitCamera(frame, start, durF);
  if (k <= 0) return null;
  const ch = H * SPLIT_CARD_H;
  const local = frame - start;
  const size = 100;
  return (
    <div style={{ position: "absolute", left: 0, top: ch * (k - 1), width: W, height: ch, background: BRAND.cream, borderBottom: `8px solid ${BRAND.green}`, fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: PANEL_X, bottom: 34, display: "flex", flexDirection: "column", gap: 4 }}>
        {el.lines.map((ln, j) => {
          const kj = interpolate(local - 5 - j * 4, [0, 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <div key={j} style={{ fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: -2, textTransform: "uppercase", color: BRAND.ink, opacity: kj, transform: `translateY(${(1 - kj) * 36}px)`, whiteSpace: "nowrap" }}>
              {ln.split(" ").map((w, wi) => {
                const acc = w.toLowerCase() === el.accent.toLowerCase();
                const hk = acc ? interpolate(local - 16, [0, 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 0;
                return (
                  <span key={wi} style={{ position: "relative", display: "inline-block", marginRight: "0.25em" }}>
                    {acc ? <span style={{ position: "absolute", left: -12, right: -12, top: 2, bottom: -2, background: BRAND.green, borderRadius: 18, transform: `scaleX(${hk})`, transformOrigin: "left" }} /> : null}
                    <span style={{ position: "relative", color: acc && hk > 0.6 ? BRAND.lime : BRAND.ink, padding: acc ? "0 2px" : 0 }}>{w}</span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", right: 60, top: 26, fontWeight: 700, fontSize: 28, color: BRAND.green, letterSpacing: 1 }}>Correre Naturale®</div>
    </div>
  );
};

/* ---------- Metronomo: pendolo che oscilla, 3 battiti inspira / 4 espira (hook visivo del reel ritmica) ---------- */
export const Metronome: React.FC<{ el: Extract<Element, { kind: "metronome" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const bpm = el.bpm ?? 160; // passi al minuto
  const beat = (t * bpm) / 60;
  const cycle = el.inhale + el.exhale;
  const idx = Math.floor(beat) % cycle;
  const inhaling = idx < el.inhale;
  const swing = Math.sin(beat * Math.PI) * 26; // gradi
  const boxW = PANEL_W, boxH = GFX_H - 10;
  const cx = 230, pivotY = boxH - 70;
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: boxW, top: GFX_TOP, height: boxH, borderRadius: 30, overflow: "hidden", background: "rgba(11,15,10,0.88)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", fontFamily: FONT, color: BRAND.white, opacity: Math.min(1, s * 1.3) * out, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ position: "absolute", top: 18, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: BRAND.lime }}>{el.title}</div>
      <svg width={boxW} height={boxH} style={{ position: "absolute", top: 0, left: 0 }}>
        <path d={`M ${cx - 120} ${pivotY + 20} L ${cx - 70} 90 L ${cx + 70} 90 L ${cx + 120} ${pivotY + 20} Z`} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth={3} />
        <g transform={`rotate(${swing} ${cx} ${pivotY})`}>
          <line x1={cx} y1={pivotY} x2={cx} y2={110} stroke={BRAND.cream} strokeWidth={8} strokeLinecap="round" />
          <rect x={cx - 34} y={150} width={68} height={34} rx={8} fill={inhaling ? BRAND.az : BRAND.lime} />
        </g>
        <circle cx={cx} cy={pivotY} r={16} fill={BRAND.lime} />
        {Array.from({ length: cycle }).map((_, i) => {
          const x = 470 + (i % 4) * 110 + (i >= el.inhale ? 0 : 0);
          const row = i < el.inhale ? 0 : 1;
          const col = i < el.inhale ? i : i - el.inhale;
          const on = idx === i;
          return <circle key={i} cx={470 + col * 100} cy={150 + row * 150} r={on ? 30 : 20} fill={row === 0 ? (on ? BRAND.az : "rgba(184,215,234,0.35)") : on ? BRAND.lime : "rgba(149,255,0,0.3)"} style={on ? { filter: `drop-shadow(0 0 12px ${row === 0 ? BRAND.az : BRAND.lime})` } : undefined} />;
        })}
        <text x={470 - 30} y={95} fontFamily={FONT} fontWeight={800} fontSize={30} fill={BRAND.az}>INSPIRA · {el.inhale} PASSI</text>
        <text x={470 - 30} y={245} fontFamily={FONT} fontWeight={800} fontSize={30} fill={BRAND.lime}>ESPIRA · {el.exhale} PASSI</text>
        <text x={470 - 30} y={pivotY + 16} fontFamily={FONT} fontWeight={900} fontSize={46} fill={inhaling ? BRAND.az : BRAND.lime}>{inhaling ? "INSPIRA" : "ESPIRA"}</text>
      </svg>
    </div>
  );
};

/* ---------- Strada 3D in prospettiva che rallenta: da "troppo forte" a "piano" (Three.js) ---------- */

const RoadScene: React.FC<{ offset: number; speedNorm: number }> = ({ offset, speedNorm }) => {
  const dashes = 14;
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 5, 3]} intensity={1.4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -6]}>
        <planeGeometry args={[6, 40]} />
        <meshStandardMaterial color="#1b2a14" />
      </mesh>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.99, -6]}>
          <planeGeometry args={[0.18, 40]} />
          <meshBasicMaterial color={BRAND.cream} />
        </mesh>
      ))}
      {Array.from({ length: dashes }).map((_, i) => {
        const z = -24 + ((i * 2.6 + offset) % (dashes * 2.6));
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, z]}>
            <planeGeometry args={[0.22, 1.3]} />
            <meshBasicMaterial color={speedNorm > 0.5 ? "#FF6B4A" : BRAND.lime} />
          </mesh>
        );
      })}
    </>
  );
};

export const Road3D: React.FC<{ el: Extract<Element, { kind: "road3d" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const prog = Math.min(1, Math.max(0, (local - 8) / (durF - 24)));
  const speedNorm = 1 - gsap.parseEase("power2.inOut")(prog); // 1 = troppo forte, 0 = piano
  // distanza percorsa: integrale della velocità (veloce all'inizio, lenta alla fine)
  const dist = t * 6 * (0.25 + 0.75 * (1 - prog * 0.5 * prog));
  const boxW = PANEL_W, boxH = GFX_H - 10;
  const kmh = Math.round(el.fromSpeed + (el.toSpeed - el.fromSpeed) * (1 - speedNorm));
  const label = speedNorm > 0.5 ? el.fromLabel : el.toLabel;
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: boxW, top: GFX_TOP, height: boxH, borderRadius: 30, overflow: "hidden", background: "rgba(11,15,10,0.88)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", fontFamily: FONT, color: BRAND.white, opacity: Math.min(1, s * 1.3) * out, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ position: "absolute", top: 18, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: BRAND.lime, zIndex: 2 }}>{el.title}</div>
      <div style={{ position: "absolute", left: 0, top: 50, width: boxW, height: boxH - 50 }}>
        <ThreeCanvas width={boxW} height={boxH - 50} camera={{ fov: 55, position: [0, 0.6, 2.5] }} style={{ background: "transparent" }}>
          <RoadScene offset={dist} speedNorm={speedNorm} />
        </ThreeCanvas>
      </div>
      <div style={{ position: "absolute", left: 40, bottom: 26, fontWeight: 900, fontSize: 60, color: speedNorm > 0.5 ? "#FF6B4A" : BRAND.lime, textShadow: "0 2px 12px #000" }}>{label}</div>
      <div style={{ position: "absolute", right: 40, bottom: 30, fontWeight: 800, fontSize: 44, color: BRAND.cream, textShadow: "0 2px 12px #000" }}>{kmh} <span style={{ fontSize: 26 }}>{el.unit ?? "bpm"}</span></div>
    </div>
  );
};

/* ---------- Grafico che sale con numero che conta (energia, capacità…) ---------- */
export const Graph: React.FC<{ el: Extract<Element, { kind: "graph" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const prog = gsap.parseEase("power2.out")(Math.min(1, Math.max(0, (local - 6) / (durF - 26))));
  const boxW = PANEL_W, boxH = GFX_H - 10;
  const gx = 50, gy = 90, gw = boxW - 100, gh = boxH - 190;
  const pts: string[] = [];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const x = i / n;
    const y = Math.pow(x, 1.6) * 0.55 + x * 0.45; // curva che accelera
    if (x <= prog + 0.001) pts.push(`${(gx + x * gw).toFixed(1)},${(gy + gh - y * gh).toFixed(1)}`);
  }
  const value = Math.round(el.from + (el.to - el.from) * prog);
  const lastY = gy + gh - (Math.pow(prog, 1.6) * 0.55 + prog * 0.45) * gh;
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: boxW, top: GFX_TOP, height: boxH, borderRadius: 30, overflow: "hidden", background: "rgba(11,15,10,0.88)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", fontFamily: FONT, color: BRAND.white, opacity: Math.min(1, s * 1.3) * out, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ position: "absolute", top: 18, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: BRAND.lime }}>{el.title}</div>
      <svg width={boxW} height={boxH} style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <linearGradient id="gfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={BRAND.lime} stopOpacity={0.35} /><stop offset="1" stopColor={BRAND.lime} stopOpacity={0} /></linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={gx} x2={gx + gw} y1={gy + gh - f * gh} y2={gy + gh - f * gh} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />)}
        {pts.length > 1 ? <polygon points={`${gx},${gy + gh} ${pts.join(" ")} ${pts[pts.length - 1].split(",")[0]},${gy + gh}`} fill="url(#gfill)" /> : null}
        {pts.length > 1 ? <polyline points={pts.join(" ")} fill="none" stroke={BRAND.lime} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${BRAND.lime})` }} /> : null}
        {pts.length > 1 ? <circle cx={gx + prog * gw} cy={lastY} r={16} fill={BRAND.white} /> : null}
        <line x1={gx} x2={gx + gw} y1={gy + gh} y2={gy + gh} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: 50, bottom: 24, fontWeight: 700, fontSize: 34, color: BRAND.cream }}>{el.label}</div>
      <div style={{ position: "absolute", right: 50, bottom: 16, fontWeight: 900, fontSize: 84, color: BRAND.lime, lineHeight: 1 }}>{value}<span style={{ fontSize: 40, marginLeft: 4 }}>{el.unit ?? "%"}</span></div>
    </div>
  );
};

/* ---------- Interruttori: righe con switch che si accendono uno alla volta (stile impostazioni, colori brand) ---------- */
export const Toggles: React.FC<{ el: Extract<Element, { kind: "toggles" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const boxW = PANEL_W, rowH = 96;
  const boxH = 70 + el.items.length * rowH + 20;
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: boxW, top: GFX_TOP + Math.max(0, (GFX_H - 10 - boxH) / 2), height: boxH, borderRadius: 30, overflow: "hidden", background: "rgba(11,15,10,0.88)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", fontFamily: FONT, color: BRAND.white, opacity: Math.min(1, s * 1.3) * out, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ position: "absolute", top: 18, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: BRAND.lime }}>{el.title}</div>
      {el.items.map((it, i) => {
        const onF = Math.round((el.onAt?.[i] ?? 0.5 + i * 1.2) * fps);
        const k = interpolate(local - onF, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
        return (
          <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 70 + i * rowH, height: rowH - 12, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < el.items.length - 1 ? "2px solid rgba(255,255,255,0.1)" : "none" }}>
            <div style={{ fontWeight: 700, fontSize: 44, color: k > 0.5 ? BRAND.white : "rgba(255,255,255,0.6)" }}>{it}</div>
            <div style={{ width: 120, height: 66, borderRadius: 33, background: k > 0.5 ? BRAND.lime : "rgba(255,255,255,0.22)", position: "relative", transition: "none" }}>
              <div style={{ position: "absolute", top: 6, left: 6 + 54 * k, width: 54, height: 54, borderRadius: 27, background: BRAND.white, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
