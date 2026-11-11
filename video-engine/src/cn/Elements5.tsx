import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Easing, random } from "remotion";
import type { Element } from "./types";
import { BRAND, W, H, PANEL_X, PANEL_W, GFX_TOP, GFX_H } from "./types";
import { useInOut } from "./Elements3D";
import { RunnerFig } from "./Elements4";

/* Grafiche dell'11/11: ogni parte entra sulla parola detta (`cues` → `el.onAt`, secondi dall'inizio dell'elemento).
   R2 (naso): Step, Airflow, Filter, Beats, Ring, Duo. R5 (tre esercizi): Slam, Orbit, Drill. */

const FONT = "Blinker, sans-serif";
const CORAL = "#FF6B4A";
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x: number) => { const c = clamp01(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };
const SHADOW = "0 4px 14px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)";
type P<K extends Element["kind"]> = { el: Extract<Element, { kind: K }>; start: number };
/** fotogramma (locale) dell'aggancio i-esimo; `def` in secondi se l'elemento non ha `cues` */
const cueF = (el: Element, i: number, fps: number, def: number) => Math.round((el.onAt?.[i] ?? def) * fps);
const pop = (local: number, f0: number, fps: number) => spring({ frame: local - f0, fps, config: { damping: 12, stiffness: 210, mass: 0.7 } });
const Zone: React.FC<{ out: number; children: React.ReactNode }> = ({ out, children }) => (
  <div style={{ position: "absolute", left: PANEL_X, width: PANEL_W, top: GFX_TOP, height: GFX_H, fontFamily: FONT, opacity: out }}>{children}</div>
);
const Panel: React.FC<{ s: number; children: React.ReactNode; h?: number }> = ({ s, children, h = GFX_H - 20 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PANEL_W, height: h, background: "rgba(11,15,10,0.88)", border: "2px solid rgba(184,215,234,0.35)", borderRadius: 30, boxShadow: "0 18px 44px rgba(0,0,0,0.5)", overflow: "hidden", transform: `translateY(${(1 - s) * 50}px) scale(${0.92 + 0.08 * s})`, opacity: Math.min(1, s * 1.4) }}>{children}</div>
);

/* ---------- R2 · 1: "il primo passo" + la parola da eliminare, barrata quando viene detta ---------- */
export const Step: React.FC<P<"step">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const a = pop(local, cueF(el, 0, fps, 0.2), fps), b = pop(local, cueF(el, 1, fps, 1.6), fps);
  const strike = easeOut((local - cueF(el, 2, fps, 2.3)) / 8);
  return (
    <Zone out={out}>
      <div style={{ position: "absolute", left: 0, top: 10, width: 190, height: 190, borderRadius: 95, background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 150, lineHeight: "190px", textAlign: "center", transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, boxShadow: "0 12px 30px rgba(0,0,0,0.45)" }}>{el.n}</div>
      <div style={{ position: "absolute", left: 220, top: 46, fontWeight: 900, fontSize: 92, lineHeight: 1, color: BRAND.white, textTransform: "uppercase", textShadow: SHADOW, transform: `translateX(${(1 - a) * 80}px)`, opacity: a }}>{el.label}</div>
      <div style={{ position: "absolute", left: 220, top: 150, fontWeight: 700, fontSize: 44, color: BRAND.cream, textShadow: SHADOW, opacity: a }}>{el.sub}</div>
      <div style={{ position: "absolute", left: 0, top: 240, width: PANEL_W, textAlign: "center", transform: `scale(${0.6 + 0.4 * b})`, opacity: b }}>
        <span style={{ position: "relative", display: "inline-block", fontWeight: 900, fontSize: 150, lineHeight: 1, textTransform: "uppercase", color: strike > 0.5 ? "rgba(255,255,255,0.55)" : CORAL, textShadow: SHADOW }}>
          {el.strike}
          <span style={{ position: "absolute", left: "-4%", top: "46%", height: 18, width: `${108 * strike}%`, background: BRAND.lime, borderRadius: 9, transform: "rotate(-4deg)", boxShadow: "0 0 18px rgba(149,255,0,0.7)" }} />
        </span>
      </div>
    </Zone>
  );
};

/* ---------- R2 · 2: flusso d'aria che si raccoglie, "respira" / "con il naso" sulle parole ---------- */
export const Airflow: React.FC<P<"airflow">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible, t } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const a = pop(local, cueF(el, 0, fps, 0.6), fps), b = pop(local, cueF(el, 1, fps, 1.6), fps);
  const gather = easeInOut((local - cueF(el, 1, fps, 1.6) + 6) / 14); // sul "naso" le linee convergono
  return (
    <Zone out={out}>
      <svg width={PANEL_W} height={GFX_H} style={{ position: "absolute", left: 0, top: 0, opacity: s }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const y0 = 30 + i * 46, yEnd = y0 + (GFX_H / 2 - y0) * gather * 0.92;
          const d = `M -40 ${y0} C 260 ${y0 + Math.sin(i * 1.7) * 60}, 520 ${yEnd - Math.cos(i) * 40}, ${PANEL_W + 40} ${yEnd}`;
          const c = i % 3 === 0 ? BRAND.lime : BRAND.az;
          return <path key={i} d={d} fill="none" stroke={c} strokeWidth={i % 3 === 0 ? 9 : 5} strokeLinecap="round" strokeDasharray="150 260" strokeDashoffset={-(t * (520 + i * 37) + i * 90)} opacity={0.35 + 0.4 * (i % 2)} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, top: 70, width: PANEL_W, textAlign: "center", fontWeight: 900, fontSize: 150, lineHeight: 1, color: BRAND.white, textTransform: "uppercase", textShadow: SHADOW, transform: `translateY(${(1 - a) * 40}px)`, opacity: a }}>{el.lines[0]}</div>
      <div style={{ position: "absolute", left: 0, top: 232, width: PANEL_W, textAlign: "center", fontWeight: 900, fontSize: 150, lineHeight: 1, color: BRAND.lime, textTransform: "uppercase", textShadow: SHADOW, transform: `scale(${0.5 + 0.5 * b})`, opacity: b }}>{el.lines[1]}</div>
    </Zone>
  );
};

/* ---------- R2 · 3: il filtro (particelle disordinate → corsie pulite), poi il regolatore (cursore che trova il punto giusto) ---------- */
export const Filter: React.FC<P<"filter">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible, t } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const fA = cueF(el, 0, fps, 0.8), fB = cueF(el, 1, fps, 2.2);
  const a = pop(local, fA, fps), b = pop(local, fB, fps);
  const slow = 1 - 0.45 * easeInOut((local - fB) / 30);
  const mx = 400, top = 110, hh = 190;
  const knob = interpolate(local, [fB + 4, fB + 34], [70, PANEL_W / 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.4)) });
  return (
    <Zone out={out}>
      <Panel s={s}>
        <div style={{ position: "absolute", left: 36, top: 24, fontWeight: 900, fontSize: 58, textTransform: "uppercase", color: BRAND.white, lineHeight: 1 }}>
          {b < 0.5 ? <>Il naso è <span style={{ color: BRAND.lime, display: "inline-block", transform: `scale(${0.7 + 0.3 * a})`, transformOrigin: "left center", opacity: 0.25 + 0.75 * a }}>il filtro</span></> : <>È <span style={{ color: BRAND.lime, display: "inline-block", transform: `scale(${0.7 + 0.3 * b})`, transformOrigin: "left center" }}>il regolatore</span> naturale</>}
        </div>
        <svg width={PANEL_W} height={hh + 20} style={{ position: "absolute", left: 0, top }}>
          {Array.from({ length: 34 }).map((_, i) => {
            const dirty = i % 3 === 0, speed = (150 + random(`sp${i}`) * 110) * slow;
            const x = ((random(`x${i}`) * PANEL_W + t * speed) % (PANEL_W + 60)) - 30;
            const lane = 40 + (i % 3) * 56, wild = 20 + random(`y${i}`) * (hh - 40) + Math.sin(t * 5 + i) * 16;
            const k = clamp01((x - (mx - 40)) / 80); // 0 prima del filtro, 1 dopo
            if (dirty && x > mx - 6) return null;     // le particelle "sporche" si fermano sul filtro
            return <circle key={i} cx={x} cy={wild + (lane - wild) * k} r={dirty ? 13 : 9 - 2 * k} fill={dirty ? CORAL : k > 0.5 ? BRAND.lime : BRAND.az} opacity={dirty ? 0.85 * clamp01((mx - x) / 60) : 0.9} />;
          })}
          <rect x={mx - 7} y={0} width={14} height={hh + 10} rx={7} fill={BRAND.lime} opacity={0.35 + 0.65 * a} />
          <rect x={mx - 16} y={0} width={32} height={hh + 10} rx={16} fill={BRAND.lime} opacity={0.14 * a * (0.6 + 0.4 * Math.sin(t * 6))} />
        </svg>
        <div style={{ position: "absolute", left: 60, right: 60, top: 336, height: 60, opacity: b }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 24, height: 12, borderRadius: 6, background: `linear-gradient(90deg, ${CORAL} 0%, ${BRAND.lime} 50%, ${CORAL} 100%)`, opacity: 0.85 }} />
          <div style={{ position: "absolute", left: knob - 60 - 26, top: 4, width: 52, height: 52, borderRadius: 26, background: BRAND.white, border: `8px solid ${BRAND.lime}`, boxShadow: "0 6px 16px rgba(0,0,0,0.5)" }} />
        </div>
      </Panel>
    </Zone>
  );
};

/* ---------- R2 · 4: battiti disordinati che diventano un ritmo regolare sulla parola "ritmo" ---------- */
export const Beats: React.FC<P<"beats">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible, t } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const fA = cueF(el, 0, fps, 1.2), fB = cueF(el, 1, fps, 1.9);
  const order = easeInOut((local - fA + 4) / 12), a = pop(local, fA, fps), b = pop(local, fB, fps);
  const n = 14, bw = 38, gap = (PANEL_W - n * bw) / (n - 1);
  return (
    <Zone out={out}>
      <svg width={PANEL_W} height={230} style={{ position: "absolute", left: 0, top: 0, opacity: s }}>
        {Array.from({ length: n }).map((_, i) => {
          const chaos = 40 + 150 * random(`b${i}-${Math.floor(t * 9)}`);
          const even = 70 + 130 * Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 1.3 - i * 0.55)), 2);
          const hgt = chaos + (even - chaos) * order;
          return <rect key={i} x={i * (bw + gap)} y={215 - hgt} width={bw} height={hgt} rx={12} fill={order > 0.5 ? BRAND.lime : CORAL} opacity={0.9} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, top: 236, width: PANEL_W, textAlign: "center", fontWeight: 900, fontSize: 112, lineHeight: 1, textTransform: "uppercase", textShadow: SHADOW }}>
        <span style={{ color: BRAND.white, display: "inline-block", transform: `scale(${0.6 + 0.4 * a})`, opacity: a }}>{el.words[0]}</span>{" "}
        <span style={{ color: BRAND.lime, display: "inline-block", transform: `translateY(${(1 - b) * 40}px)`, opacity: b }}>{el.words[1]}</span>
      </div>
    </Zone>
  );
};

/* ---------- R2 · 5: anello che si riempie tra "ossigeno" ed "efficiente" ---------- */
export const Ring: React.FC<P<"ring">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const fA = cueF(el, 0, fps, 0.5), fB = cueF(el, 1, fps, 1.6);
  const a = pop(local, fA, fps), b = pop(local, fB, fps);
  const prog = 0.28 * easeOut((local - fA) / 10) + 0.72 * easeInOut((local - fA - 6) / Math.max(8, fB - fA - 2));
  const r = 150, circ = 2 * Math.PI * r;
  return (
    <Zone out={out}>
      <svg width={380} height={380} style={{ position: "absolute", left: 10, top: 20, transform: `scale(${s})` }}>
        <circle cx={190} cy={190} r={r} fill="rgba(11,15,10,0.85)" stroke="rgba(255,255,255,0.16)" strokeWidth={34} />
        <circle cx={190} cy={190} r={r} fill="none" stroke={prog > 0.98 ? BRAND.lime : BRAND.az} strokeWidth={34} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} transform="rotate(-90 190 190)" />
        <text x={190} y={228} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={BRAND.white}>O₂</text>
      </svg>
      <div style={{ position: "absolute", left: 420, top: 60, width: PANEL_W - 420 }}>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 1, textTransform: "uppercase", color: BRAND.white, textShadow: SHADOW, transform: `translateX(${(1 - a) * 60}px)`, opacity: a }}>{el.words[0]}</div>
        <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1.05, color: BRAND.lime, textShadow: SHADOW, opacity: a }}>{Math.round(prog * 100)}%</div>
        <div style={{ fontWeight: 900, fontSize: 68, lineHeight: 1, textTransform: "uppercase", color: BRAND.lime, textShadow: SHADOW, transform: `scale(${0.6 + 0.4 * b})`, transformOrigin: "left center", opacity: b }}>{el.words[1]}</div>
      </div>
    </Zone>
  );
};

/* ---------- R2 · 6: "controllo" su due cose che si agganciano (corpo + mente) ---------- */
export const Duo: React.FC<P<"duo">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const fA = cueF(el, 0, fps, 0.9), fB = cueF(el, 1, fps, 1.9);
  const a = pop(local, fA, fps), b = pop(local, fB, fps), link = easeOut((local - fB - 3) / 8);
  const pill = (txt: string, k: number, dir: number): React.CSSProperties => ({ position: "absolute", top: 200, [dir < 0 ? "left" : "right"]: 0, width: 400, height: 150, borderRadius: 34, background: link > 0.6 ? BRAND.lime : "rgba(11,15,10,0.9)", border: `5px solid ${BRAND.lime}`, color: link > 0.6 ? BRAND.ink : BRAND.white, fontWeight: 900, fontSize: 92, lineHeight: "140px", textAlign: "center", textTransform: "uppercase", transform: `translateX(${(1 - k) * dir * 160 + dir * -20 * link}px)`, opacity: k, boxShadow: "0 12px 30px rgba(0,0,0,0.45)" } as React.CSSProperties);
  return (
    <Zone out={out}>
      <div style={{ position: "absolute", left: 0, top: 20, width: PANEL_W, textAlign: "center", fontWeight: 900, fontSize: 138, lineHeight: 1, textTransform: "uppercase", color: BRAND.white, textShadow: SHADOW, transform: `scale(${0.7 + 0.3 * s})`, opacity: s }}>{el.title}</div>
      <div style={pill(el.words[0], a, -1)}>{el.words[0]}</div>
      <div style={pill(el.words[1], b, 1)}>{el.words[1]}</div>
      <div style={{ position: "absolute", left: PANEL_W / 2 - 45, top: 230, width: 90, height: 90, borderRadius: 45, background: BRAND.white, color: BRAND.green, fontWeight: 900, fontSize: 76, lineHeight: "84px", textAlign: "center", transform: `scale(${link})`, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}>+</div>
    </Zone>
  );
};

/* ---------- R5 · schianto: la parola piomba sullo schermo sull'attacco della parola detta, con urto e scossa ---------- */
const SLAM_IN = 5; // fotogrammi di caduta: l'urto cade esattamente sull'aggancio
export const slamImpact = (el: Extract<Element, { kind: "slam" }>, start: number, fps: number) => start + Math.round((el.onAt?.[el.lead.length] ?? 1.5) * fps);
/** scossa della camera (px e scala) da applicare al video nei fotogrammi dopo l'urto */
export const slamShake = (frame: number, impact: number) => {
  const f = frame - impact;
  if (f < 0 || f > 12) return { dx: 0, dy: 0, sc: 1 };
  const d = 1 - f / 12;
  return { dx: Math.sin(f * 2.4) * 16 * d * d, dy: Math.cos(f * 3.1) * 22 * d * d, sc: 1 + 0.045 * d * d };
};
export const Slam: React.FC<P<"slam">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, out, visible } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const imp = slamImpact(el, start, fps) - start, f = local - imp;
  const fall = clamp01((f + SLAM_IN) / SLAM_IN);                    // 0 → 1 nei fotogrammi prima dell'urto
  const scale = f < 0 ? 4.2 - 3.2 * fall * fall : 1 + 0.07 * Math.exp(-f / 3) * Math.cos(f * 1.3);
  const ring = clamp01(f / 10);
  return (
    <Zone out={out}>
      {el.lead.map((l, i) => {
        const k = pop(local, cueF(el, i, fps, i * 0.6), fps);
        return <div key={i} style={{ position: "absolute", left: 0, top: 6 + i * 74, width: PANEL_W, textAlign: "center", fontWeight: 900, fontSize: 68, lineHeight: 1, textTransform: "uppercase", color: i === 0 ? BRAND.cream : BRAND.white, textShadow: SHADOW, transform: `translateY(${(1 - k) * 30}px)`, opacity: k }}>{l}</div>;
      })}
      {f >= 0 ? (
        <svg width={PANEL_W} height={GFX_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <ellipse cx={PANEL_W / 2} cy={290} rx={260 + 420 * easeOut(ring)} ry={70 + 110 * easeOut(ring)} fill="none" stroke={BRAND.lime} strokeWidth={14 * (1 - ring)} opacity={1 - ring} />
          {Array.from({ length: 14 }).map((_, i) => {
            const ang = (i / 14) * Math.PI * 2 + 0.2, r0 = 300 + 240 * easeOut(ring), r1 = r0 + 90 * (1 - ring);
            return <line key={i} x1={PANEL_W / 2 + Math.cos(ang) * r0} y1={290 + Math.sin(ang) * r0 * 0.42} x2={PANEL_W / 2 + Math.cos(ang) * r1} y2={290 + Math.sin(ang) * r1 * 0.42} stroke={i % 2 ? BRAND.white : BRAND.lime} strokeWidth={9} strokeLinecap="round" opacity={(1 - ring) * 0.9} />;
          })}
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: -60, top: 170, width: PANEL_W + 120, textAlign: "center", fontWeight: 900, fontSize: 236, lineHeight: 1, letterSpacing: -2, textTransform: "uppercase", color: BRAND.lime, textShadow: "0 10px 0 rgba(11,15,10,0.85), 0 18px 40px rgba(0,0,0,0.7)", transform: `scale(${scale}) rotate(${f < 0 ? -6 * (1 - fall) : 0}deg)`, opacity: clamp01((f + SLAM_IN) / 2), filter: f < 0 ? `blur(${6 * (1 - fall)}px)` : "none" }}>{el.text}</div>
    </Zone>
  );
};

/* ---------- R5 · orbita: il video (che continua a scorrere) arretra, i titoli girano sopra la testa e poi si impilano ----------
   Il video non si ferma (Ross 11/11: il fermo immagine «è davvero brutto»): l'arretramento è applicato al master in CNReel con orbitCam(). */
export const orbitCam = (el: Extract<Element, { kind: "orbit" }>, start: number, frame: number, fps: number) => {
  const local = frame - start, durF = Math.round(el.dur * fps);
  if (local < 0 || local >= durF) return 0;
  return easeInOut(local / 12) * easeInOut((durF - local) / 10); // 0 = pieno schermo, 1 = arretrato
};
export const Orbit: React.FC<P<"orbit">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durF = Math.round(el.dur * fps);
  const { local, visible } = useInOut(start, durF);
  if (!visible) return null;
  const back = el.back ?? 0.72;
  const z = orbitCam(el, start, frame, fps);
  const sc = 1 - (1 - back) * z;
  // punto sopra i capelli, nel video arretrato (ancorato in basso al centro)
  const hx = W / 2 + (el.headX - 0.5) * W * sc, hy = H - (1 - el.headTop) * H * sc;
  const spinEnd = cueF(el, 0, fps, 1.7), n = el.titles.length;
  const travel = Math.PI * 2 * 1.25 * easeOut(local / Math.max(1, spinEnd));
  const cardW = 620, cardH = 112, stackTop = Math.max(215, H - (1 - el.headTop) * H * back - 40 - n * (cardH + 16));
  const leave = easeInOut((durF - local) / 8);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: leave }}>
      {el.titles.map((title, i) => {
        const ang = travel + (i / n) * Math.PI * 2, depth = Math.cos(ang);         // depth > 0 = davanti
        const ox = hx + Math.sin(ang) * 300, oy = hy - 170 + depth * 62, osc = 0.62 + 0.2 * (depth + 1) / 2;
        const k = spring({ frame: local - spinEnd - i * 4, fps, config: { damping: 15, stiffness: 150 } });  // dall'orbita alla pila
        const x = ox + (W / 2 - ox) * k, y = oy + (stackTop + i * (cardH + 16) + cardH / 2 - oy) * k, s2 = osc + (1 - osc) * k;
        return (
          <div key={i} style={{ position: "absolute", left: x - cardW / 2, top: y - cardH / 2, width: cardW, height: cardH, zIndex: Math.round(50 + depth * 10 * (1 - k)), display: "flex", alignItems: "center", gap: 22, padding: "0 26px", boxSizing: "border-box", background: k > 0.5 ? BRAND.lime : "rgba(11,15,10,0.92)", border: `4px solid ${BRAND.lime}`, borderRadius: 26, transform: `scale(${s2 * easeOut(local / 8)})`, opacity: (0.6 + 0.4 * (depth + 1) / 2) * (1 - k) + k, boxShadow: "0 14px 34px rgba(0,0,0,0.55)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: k > 0.5 ? BRAND.ink : BRAND.lime, color: k > 0.5 ? BRAND.lime : BRAND.ink, fontWeight: 900, fontSize: 56, lineHeight: "72px", textAlign: "center", flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontWeight: 900, fontSize: 50, lineHeight: 1, textTransform: "uppercase", color: k > 0.5 ? BRAND.ink : BRAND.white }}>{title}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- R5 · guida a tutto schermo dell'esercizio, a tappe agganciate alle parole (copre le schede grafiche del sorgente) ---------- */
const Foot: React.FC<{ x: number; y: number; color: string; flip: boolean; k: number }> = ({ x, y, color, flip, k }) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k}) ${flip ? "scale(-1 1)" : ""}`} opacity={k}>
    <ellipse cx={0} cy={0} rx={34} ry={62} fill={color} />
    {[-26, -8, 10, 26].map((dx, i) => <circle key={i} cx={dx} cy={-78 + Math.abs(dx) * 0.5} r={i === 0 ? 14 : 9} fill={color} />)}
  </g>
);
export const Drill: React.FC<P<"drill">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, visible } = useInOut(start, durF);
  if (!visible) return null;
  const fin = el.fadeIn ?? 6, fout = el.fadeOut ?? 5;
  const fade = Math.min(fin ? clamp01(local / fin) : 1, fout ? clamp01((durF - local) / fout) : 1);
  const cues = el.steps.map((_, i) => cueF(el, i, fps, 2.4 + i * 3));
  let stage = -1;
  cues.forEach((c, i) => { if (local >= c) stage = i; });
  const big: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, textTransform: "uppercase", lineHeight: 1, textAlign: "center", position: "absolute", left: 0, width: W };
  const CY = 960 - 590; // centro della palla = centro dello schermo (y 960)
  let body: React.ReactNode;
  if (stage < 0) {
    body = (
      <div style={{ position: "absolute", top: 620, left: 0, width: W, padding: "0 70px", boxSizing: "border-box", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 54, letterSpacing: 4, padding: "10px 34px", borderRadius: 18, transform: `scale(${pop(local, 0, fps)})` }}>ESERCIZIO {el.n}</div>
        {el.title.split("|").map((l, i) => {
          const k = easeOut((local - 5 - i * 6) / 12);
          return <div key={i} style={{ fontFamily: FONT, fontWeight: 900, textTransform: "uppercase", lineHeight: 1, fontSize: 118, color: BRAND.white, marginTop: i ? 6 : 34, transform: `translateY(${(1 - k) * 50}px)`, opacity: k }}>{l}</div>;
        })}
      </div>
    );
  } else {
    const st = el.steps[stage], f0 = cues[stage], f1 = stage + 1 < cues.length ? cues[stage + 1] : durF - fout;
    const p = clamp01((local - f0) / Math.max(1, f1 - f0)), k = pop(local, f0, fps), sl = (local - f0) / fps;
    const color = st.color === "az" ? BRAND.az : st.color === "cream" ? BRAND.cream : BRAND.lime;
    const r = st.shape === "grow" ? 130 + 205 * easeInOut(p) : st.shape === "shrink" ? 335 - 205 * easeInOut(p) : st.shape === "pulse" ? 220 + 46 * Math.sin(sl * Math.PI * 2 * 1.1) : 160 + 8 * Math.sin(sl * 4);
    const circ = 2 * Math.PI * 290, feet = st.n ?? 3;
    body = st.shape === "count" ? (
      <>
        {/* una sola scritta grande, subito sotto l'intestazione dell'esercizio */}
        <div style={{ ...big, top: 400, fontSize: 320, color: BRAND.white, transform: `scale(${k})` }}>{st.big}</div>
        <div style={{ ...big, top: 716, fontSize: 150, color: BRAND.lime, opacity: k }}>{st.label}</div>
        <div style={{ ...big, top: 890, fontSize: 58, color: BRAND.cream, fontWeight: 700, textTransform: "none", opacity: k }}>{st.sub}</div>
      </>
    ) : (
      <>
        <div style={{ ...big, top: 372, fontSize: st.label.length > 12 ? 100 : 136, color, transform: `scale(${0.8 + 0.2 * k})`, opacity: k }}>{st.label}</div>
        <div style={{ ...big, top: 520, fontSize: 52, color: BRAND.cream, fontWeight: 700, textTransform: "none", opacity: k }}>{st.sub}</div>
        {st.shape === "feet" ? (
          <svg width={W} height={720} style={{ position: "absolute", top: 600, left: 0 }}>
            <path d="M 540 700 L 540 20" stroke="rgba(255,255,255,0.12)" strokeWidth={6} strokeDasharray="20 24" />
            {Array.from({ length: feet }).map((_, i) => <Foot key={i} x={540 + (i % 2 === 0 ? -95 : 95)} y={630 - i * (540 / Math.max(3, feet - 1)) * 0.9} color={color} flip={i % 2 === 1} k={easeOut((p * feet - i) / 0.5)} />)}
          </svg>
        ) : (
          <svg width={W} height={740} style={{ position: "absolute", top: 590, left: 0 }}>
            <circle cx={540} cy={CY} r={350} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={4} />
            {st.shape === "ring" ? <circle cx={540} cy={CY} r={290} fill="none" stroke={BRAND.lime} strokeWidth={18} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} transform={`rotate(-90 540 ${CY})`} /> : null}
            <circle cx={540} cy={CY} r={r} fill={color} opacity={0.22} />
            <circle cx={540} cy={CY} r={r * 0.78} fill={color} opacity={0.35} />
            <circle cx={540} cy={CY} r={r * 0.5} fill={color} />
          </svg>
        )}
      </>
    );
  }
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1C3D15 0%,#0B0F0A 70%)", opacity: fade, fontFamily: FONT }}>
      {/* durante le dissolvenze si vede solo il fondo: il contenuto non passa mai in trasparenza sul volto */}
      <AbsoluteFill style={{ opacity: fade < 1 ? 0 : 1 }}>
        {stage >= 0 ? (
          <div style={{ position: "absolute", top: 196, left: 0, width: W, textAlign: "center" }}>
            {/* intestazione su due righe: «Esercizio n» / titolo */}
            <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 40, letterSpacing: 4, padding: "6px 26px", borderRadius: 14, textTransform: "uppercase" }}>Esercizio {el.n}</div>
            <div style={{ marginTop: 12, fontWeight: 800, fontSize: 46, letterSpacing: 2, color: BRAND.white, textTransform: "uppercase" }}>{el.title.replace("|", " ")}</div>
          </div>
        ) : null}
        {body}
        {stage >= 0 ? (
          <div style={{ position: "absolute", top: 1322, left: 0, width: W, display: "flex", justifyContent: "center", gap: 16 }}>
            {el.steps.map((_, i) => <div key={i} style={{ width: i === stage ? 96 : 54, height: 14, borderRadius: 7, background: i <= stage ? BRAND.lime : "rgba(255,255,255,0.22)" }} />)}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- R3 · clip realistica (girato generato) in una scheda sotto il mento: etichetta all'inizio, scritta grande sull'aggancio ---------- */
export const Clip: React.FC<P<"clip">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const b = pop(local, cueF(el, 0, fps, 1.2), fps), cardH = GFX_H - 6;
  return (
    <Zone out={out}>
      <div style={{ position: "absolute", left: -30, top: 0, width: PANEL_W + 60, height: cardH, borderRadius: 34, overflow: "hidden", border: `6px solid ${BRAND.lime}`, boxSizing: "border-box", boxShadow: "0 18px 44px rgba(0,0,0,0.55)", transform: `translateY(${(1 - s) * 50}px) scale(${0.9 + 0.1 * s})`, opacity: Math.min(1, s * 1.4), background: BRAND.ink }}>
        <Sequence from={start} durationInFrames={durF} layout="none">
          <OffthreadVideo src={staticFile(el.src)} muted startFrom={Math.round((el.from ?? 0) * fps)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${(el.posY ?? 0.35) * 100}%`, transform: `scale(${1.03 + 0.04 * (local / durF)})` }} />
        </Sequence>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: "linear-gradient(180deg, rgba(11,15,10,0) 0%, rgba(11,15,10,0.82) 70%)" }} />
        <div style={{ position: "absolute", left: 20, top: 18, background: "rgba(11,15,10,0.85)", color: BRAND.white, fontWeight: 800, fontSize: 40, padding: "6px 22px", borderRadius: 14, textTransform: "uppercase" }}>{el.tag}</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center", fontWeight: 900, fontSize: 108, lineHeight: 1, textTransform: "uppercase", color: BRAND.lime, textShadow: SHADOW, transform: `scale(${0.6 + 0.4 * b})`, opacity: b }}>{el.text}</div>
      </div>
    </Zone>
  );
};

/* ---------- R4 · confronto tra due situazioni: domanda → risposta, a sinistra e a destra, agganciate alle parole ---------- */
export const Compare: React.FC<P<"compare">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible, t } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const f = [0, 1, 2, 3].map((i) => cueF(el, i, fps, 0.4 + i * 1.2));
  const cw = (PANEL_W - 24) / 2, ch = GFX_H - 16;
  const side = (i: number) => {
    const d = el.sides[i], q = pop(local, f[i * 2], fps), a = pop(local, f[i * 2 + 1], fps);
    const active = i === 0 ? local < f[2] : local >= f[2];
    const color = i === 0 ? CORAL : BRAND.lime, hz = i === 0 ? 1.5 : 3.1;
    return (
      <div key={i} style={{ position: "absolute", left: i * (cw + 24), top: 0, width: cw, height: ch, borderRadius: 30, background: "rgba(11,15,10,0.9)", border: `5px solid ${a > 0.5 ? color : "rgba(255,255,255,0.18)"}`, boxSizing: "border-box", boxShadow: "0 16px 40px rgba(0,0,0,0.45)", opacity: q * (active ? 1 : 0.8), transform: `translateY(${(1 - q) * 40}px) scale(${active ? 1 : 0.96})` }}>
        <div style={{ position: "absolute", left: 14, right: 14, top: 22, textAlign: "center", fontWeight: 800, fontSize: 46, lineHeight: 1.05, color: BRAND.white }}>{d.q}</div>
        <svg width={cw} height={178} viewBox="-190 -112 380 300" style={{ position: "absolute", left: 0, top: 128 }}>
          <RunnerFig phase={t * hz * Math.PI * 2} color={a > 0.5 ? color : "rgba(255,255,255,0.45)"} x={0} y={0} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, textAlign: "center", fontWeight: 900, fontSize: 78, lineHeight: 1, textTransform: "uppercase", color, transform: `scale(${0.5 + 0.5 * a})`, opacity: a }}>{d.a}</div>
      </div>
    );
  };
  return <Zone out={out}><div style={{ opacity: s }}>{side(0)}{side(1)}</div></Zone>;
};
