import React, { useMemo } from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { noise2D } from "@remotion/noise";
import { evolvePath } from "@remotion/paths";
import { gsap } from "gsap";
import { BRAND, GFX_H, GFX_TOP, W } from "./types";
import type { Element } from "./types";

const FONT = "Blinker, sans-serif";
const easeOut = gsap.parseEase("power3.out");
const easeInOut = gsap.parseEase("power2.inOut");

/** entrata/uscita comuni (spring in, fade out negli ultimi 8 frame) */
export const useInOut = (start: number, durF: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - start;
  const s = spring({ frame: local, fps, config: { damping: 12, stiffness: 190, mass: 0.7 } });
  const out = interpolate(local, [durF - 8, durF], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  return { local, s, out, visible: local >= 0 && local < durF, t: local / fps };
};

const Panel: React.FC<{ title?: string; opacity: number; s: number; children: React.ReactNode; height?: number }> = ({ title, opacity, s, children, height = GFX_H - 10 }) => (
  <div
    style={{
      position: "absolute",
      left: 70,
      width: W - 140,
      top: GFX_TOP,
      height,
      opacity,
      transform: `translateY(${(1 - s) * 50}px) scale(${0.94 + 0.06 * s})`,
      transformOrigin: "top center",
      background: "rgba(11,15,10,0.88)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "2px solid rgba(184,215,234,0.45)",
      borderRadius: 30,
      overflow: "hidden",
      boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
      fontFamily: FONT,
      color: BRAND.white,
    }}
  >
    {title ? (
      <div style={{ position: "absolute", top: 18, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: BRAND.lime }}>{title}</div>
    ) : null}
    {children}
  </div>
);

/* ---------- Testo 3D reso in Blender (sequenza PNG con alpha) ---------- */
export const Text3D: React.FC<{ el: Extract<Element, { kind: "text3d" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const idx = Math.min(48, Math.max(1, local + 1));
  const file = `ytcn51/b3d/${el.word3d}/f_${String(idx).padStart(4, "0")}.png`;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: GFX_TOP + 20, textAlign: "center", opacity: out }}>
      <Img src={staticFile(file)} style={{ width: W, height: 420, objectFit: "contain", filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.55))" }} />
      {el.sub ? <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: BRAND.cream, marginTop: -30, textShadow: "0 2px 10px #000" }}>{el.sub}</div> : null}
    </div>
  );
};

/* ---------- Simulazione: onda del respiro (calma / caos) ---------- */
export const Wave: React.FC<{ el: Extract<Element, { kind: "wave" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const prog = Math.min(1, local / durF);
  const chaos =
    el.mode === "chaos" ? 1 : el.mode === "calm" ? 0 : el.mode === "chaos-to-calm" ? 1 - easeInOut(Math.min(1, prog * 1.4)) : easeInOut(Math.min(1, prog * 1.4));
  const w = W - 140 - 60, h = 260, cx = 30, cy = 70 + h / 2;
  const pts: string[] = [];
  const n = 160;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const phase = (i / n) * Math.PI * 2 * 3 - t * 2.2;
    const calm = Math.sin(phase) * 0.55;
    const jag = noise2D("resp", i * 0.35, t * 3) * 1.1 + Math.sin(phase * 4.7) * 0.5;
    const y = (calm * (1 - chaos) + jag * chaos) * (h / 2) * 0.85;
    pts.push(`${i === 0 ? "M" : "L"}${(cx + x).toFixed(1)},${(cy + y).toFixed(1)}`);
  }
  const color = chaos > 0.5 ? "#FF6B4A" : BRAND.lime;
  const label = chaos > 0.5 ? "RESPIRO FUORI CONTROLLO" : "RITMO SOSTENIBILE";
  return (
    <Panel title={el.title} opacity={Math.min(1, s * 1.3) * out} s={s} height={420}>
      <svg width={W - 140} height={400} style={{ position: "absolute", top: 40, left: 0 }}>
        <line x1={cx} x2={cx + w} y1={cy} y2={cy} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
        <path d={pts.join(" ")} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 14px ${color})` }} />
      </svg>
      <div style={{ position: "absolute", bottom: 22, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 34, letterSpacing: 2, color }}>{label}</div>
    </Panel>
  );
};

/* ---------- Three.js: sfera che respira con timer inspira/espira ---------- */
const BreathSphere: React.FC<{ scale: number; t: number; lime: boolean }> = ({ scale, t, lime }) => {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 4), []);
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <pointLight position={[-3, -2, 3]} intensity={1.2} color={BRAND.az} />
      <mesh geometry={geo} scale={scale} rotation={[t * 0.3, t * 0.5, 0]}>
        <meshStandardMaterial color={lime ? BRAND.lime : BRAND.green} roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh geometry={geo} scale={scale * 1.12} rotation={[t * 0.3, t * 0.5, 0]}>
        <meshBasicMaterial color={lime ? BRAND.lime : BRAND.az} wireframe transparent opacity={0.22} />
      </mesh>
    </>
  );
};

export const Sphere3D: React.FC<{ el: Extract<Element, { kind: "sphere3d" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const cycle = el.phases.reduce((a, p) => a + p.sec, 0);
  let tt = t % cycle, idx = 0;
  while (tt > el.phases[idx].sec) { tt -= el.phases[idx].sec; idx++; }
  const ph = el.phases[idx], prev = el.phases[(idx - 1 + el.phases.length) % el.phases.length];
  const prog = tt / ph.sec;
  const scale = prev.scale + (ph.scale - prev.scale) * easeInOut(prog);
  const remaining = Math.ceil(ph.sec - tt);
  const ringR = 150, circ = 2 * Math.PI * ringR;
  return (
    <Panel opacity={Math.min(1, s * 1.3) * out} s={s} height={GFX_H - 10}>
      <div style={{ position: "absolute", left: 20, top: 20, width: 440, height: 440 }}>
        <ThreeCanvas width={440} height={440} camera={{ fov: 40, position: [0, 0, 5] }} style={{ background: "transparent" }}>
          <BreathSphere scale={0.9 + scale * 0.9} t={t} lime={ph.label.startsWith("INSP")} />
        </ThreeCanvas>
        <svg width={440} height={440} style={{ position: "absolute", left: 0, top: 0 }}>
          <circle cx={220} cy={220} r={ringR} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10} />
          <circle cx={220} cy={220} r={ringR} fill="none" stroke={BRAND.lime} strokeWidth={10} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} transform="rotate(-90 220 220)" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 480, top: 70, width: 420 }}>
        <div style={{ fontWeight: 900, fontSize: 64, textTransform: "uppercase", color: BRAND.lime, lineHeight: 1 }}>{ph.label}</div>
        <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1, color: BRAND.white }}>{remaining}</div>
        <div style={{ fontWeight: 700, fontSize: 34, color: BRAND.cream }}>secondi · dal naso</div>
      </div>
    </Panel>
  );
};

/* ---------- Three.js: ingranaggio 3D + contagiri delle "marce" ---------- */
const Gear: React.FC<{ rot: number; color: string; r?: number }> = ({ rot, color, r = 1 }) => {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const teeth = 12, ro = r, ri = r * 0.8;
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 === 0 ? ro : ri;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, r * 0.3, 0, Math.PI * 2, true); shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
  }, [r]);
  return (
    <mesh geometry={geo} rotation={[0.35, -0.3, rot]}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
    </mesh>
  );
};

export const Gauge3D: React.FC<{ el: Extract<Element, { kind: "gauge3d" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const prog = easeInOut(Math.min(1, Math.max(0, (local - 10) / (durF - 30))));
  const val = el.from + (el.to - el.from) * prog; // marcia corrente (es. 5 → 1)
  const n = el.labels.length;
  const angle = -120 + ((val - 1) / (n - 1)) * 240;
  const red = val > n * 0.7;
  return (
    <Panel title={el.title} opacity={Math.min(1, s * 1.3) * out} s={s}>
      <div style={{ position: "absolute", left: 0, top: 60, width: 400, height: 400 }}>
        <ThreeCanvas width={400} height={400} camera={{ fov: 35, position: [0, 0, 6] }} style={{ background: "transparent" }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 5, 5]} intensity={2} />
          <group position={[-0.5, 0.2, 0]}><Gear rot={t * (0.8 + val * 0.9)} color={red ? "#FF6B4A" : BRAND.lime} /></group>
          <group position={[1.15, -1.0, 0]}><Gear rot={-t * (0.8 + val * 0.9) * 1.6 + 0.26} color={BRAND.az} r={0.62} /></group>
        </ThreeCanvas>
      </div>
      <svg width={460} height={400} style={{ position: "absolute", left: 420, top: 60 }}>
        <path d="M 60 300 A 170 170 0 1 1 400 300" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={26} strokeLinecap="round" />
        <path d="M 60 300 A 170 170 0 1 1 400 300" fill="none" stroke={`url(#g)`} strokeWidth={26} strokeLinecap="round" />
        <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stopColor={BRAND.lime} /><stop offset="0.6" stopColor="#FFD34A" /><stop offset="1" stopColor="#FF6B4A" /></linearGradient></defs>
        {el.labels.map((l, i) => {
          const a = ((-120 + (i / (n - 1)) * 240 - 90) * Math.PI) / 180;
          return <text key={i} x={230 + Math.cos(a) * 128} y={300 - 70 + Math.sin(a) * 128 + 12} fill={BRAND.white} fontSize={34} fontWeight={800} textAnchor="middle" fontFamily="Blinker">{l}</text>;
        })}
        <g transform={`rotate(${angle} 230 230)`}>
          <polygon points="230,70 242,230 218,230" fill={red ? "#FF6B4A" : BRAND.lime} />
          <circle cx={230} cy={230} r={18} fill={BRAND.white} />
        </g>
        <text x={230} y={330} fill={red ? "#FF6B4A" : BRAND.lime} fontSize={54} fontWeight={900} textAnchor="middle" fontFamily="Blinker">{el.labels[Math.round(val) - 1]}</text>
      </svg>
    </Panel>
  );
};

/* ---------- ECG: cuore in gola ---------- */
export const ECG: React.FC<{ el: Extract<Element, { kind: "ecg" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const prog = Math.min(1, local / durF);
  const bpm = Math.round(el.bpmFrom + (el.bpmTo - el.bpmFrom) * easeOut(prog));
  const beat = (t * bpm) / 60;
  const pulse = Math.exp(-((beat % 1) * 6)) * 0.25;
  // traccia ECG ripetuta
  const seg = "l 22 0 l 8 -18 l 8 18 l 10 0 l 10 -110 l 12 150 l 10 -40 l 14 0 l 10 -22 l 12 22 l 24 0";
  const d = `M -40 200 ${Array.from({ length: 8 }, () => seg).join(" ")}`;
  const { strokeDasharray, strokeDashoffset } = evolvePath(Math.min(1, local / 24), d);
  return (
    <Panel title={el.title} opacity={Math.min(1, s * 1.3) * out} s={s} height={420}>
      <svg width={W - 140} height={330} style={{ position: "absolute", top: 60, left: 0 }}>
        <g transform={`translate(${-((t * 180) % 160)} 0)`}>
          <path d={d} fill="none" stroke={BRAND.lime} strokeWidth={7} strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ filter: `drop-shadow(0 0 10px ${BRAND.lime})` }} />
        </g>
        <rect x={0} y={0} width={70} height={330} fill="url(#fadeL)" />
        <defs><linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stopColor="rgba(11,15,10,1)" /><stop offset="1" stopColor="rgba(11,15,10,0)" /></linearGradient></defs>
      </svg>
      <div style={{ position: "absolute", right: 40, bottom: 18, display: "flex", alignItems: "center", gap: 18 }}>
        <svg width={70} height={64} viewBox="0 0 24 22" style={{ transform: `scale(${1 + pulse})` }}><path d="M12 21s-8-5.3-10-10C.3 7 2.6 2.5 7 2.5c2.3 0 4 1.3 5 3 1-1.7 2.7-3 5-3 4.4 0 6.7 4.5 5 8.5-2 4.7-10 10-10 10z" fill="#FF6B4A" /></svg>
        <div style={{ fontWeight: 900, fontSize: 70, color: BRAND.white, lineHeight: 1 }}>{bpm}<span style={{ fontSize: 30, color: BRAND.cream, marginLeft: 8 }}>bpm</span></div>
      </div>
    </Panel>
  );
};

/* ---------- Impronte: inspira 3 passi, espira 4 ---------- */
const Foot: React.FC<{ x: number; y: number; flip: boolean; on: boolean; color: string }> = ({ x, y, flip, on, color }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} opacity={on ? 1 : 0.18}>
    <ellipse cx={0} cy={0} rx={22} ry={36} fill={color} />
    <ellipse cx={-14} cy={-46} rx={7} ry={9} fill={color} /><ellipse cx={-2} cy={-50} rx={6} ry={8} fill={color} /><ellipse cx={9} cy={-48} rx={5} ry={7} fill={color} /><ellipse cx={18} cy={-43} rx={4} ry={6} fill={color} />
  </g>
);

export const Steps: React.FC<{ el: Extract<Element, { kind: "steps" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const total = el.inhale + el.exhale, stepSec = 0.55;
  const k = Math.floor(t / stepSec) % total; // passo corrente
  const inhale = k < el.inhale;
  const count = inhale ? k + 1 : k - el.inhale + 1;
  return (
    <Panel opacity={Math.min(1, s * 1.3) * out} s={s} height={GFX_H - 10}>
      <div style={{ position: "absolute", top: 26, left: 0, width: "100%", textAlign: "center", fontWeight: 900, fontSize: 60, textTransform: "uppercase", color: inhale ? BRAND.lime : BRAND.az, lineHeight: 1 }}>
        {inhale ? "INSPIRA" : "ESPIRA"} <span style={{ color: BRAND.white }}>{count}</span>
      </div>
      <svg width={W - 140} height={300} style={{ position: "absolute", top: 120, left: 0 }}>
        {Array.from({ length: total }, (_, i) => (
          <Foot key={i} x={90 + i * 125} y={i % 2 === 0 ? 200 : 130} flip={i % 2 === 1} on={i <= k} color={i < el.inhale ? BRAND.lime : BRAND.az} />
        ))}
      </svg>
      <div style={{ position: "absolute", bottom: 22, left: 0, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 34, color: BRAND.cream }}>
        {el.inhale} passi inspira · {el.exhale} passi espira · sempre dal naso
      </div>
    </Panel>
  );
};

/* ---------- Barre: capacità aerobica che cresce ---------- */
export const Bars: React.FC<{ el: Extract<Element, { kind: "bars" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const n = el.values.length, maxV = Math.max(...el.values);
  const bw = Math.min(150, (W - 140 - 80) / n - 24);
  return (
    <Panel title={el.title} opacity={Math.min(1, s * 1.3) * out} s={s}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 80, bottom: 30, display: "flex", alignItems: "flex-end", justifyContent: "space-around" }}>
        {el.values.map((v, i) => {
          const p = easeOut(Math.min(1, Math.max(0, (local - 8 - i * 6) / 24)));
          const hgt = (v / maxV) * 290 * p;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: bw }}>
              <div style={{ fontWeight: 900, fontSize: 36, color: BRAND.lime, opacity: p }}>{Math.round(v * p)}%</div>
              <div style={{ width: bw, height: hgt, borderRadius: 14, background: i === n - 1 ? BRAND.lime : BRAND.green, boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }} />
              <div style={{ fontWeight: 700, fontSize: 30, color: BRAND.cream, marginTop: 10 }}>{el.labels[i]}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};
