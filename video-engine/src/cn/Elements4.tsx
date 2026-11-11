import React from "react";
import { AbsoluteFill, useVideoConfig, interpolate, Easing } from "remotion";
import { gsap } from "gsap";
import { BRAND, GFX_H, GFX_TOP, H, W, PANEL_X, PANEL_W } from "./types";
import type { Element } from "./types";
import { useInOut } from "./Elements3D";

const FONT = "Blinker, sans-serif";
const easeOut = gsap.parseEase("power3.out");
const easeInOut = gsap.parseEase("power2.inOut");
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const CORAL = "#FF6B4A";

/** scatola scura standard della zona grafiche */
const Box: React.FC<{ s: number; out: number; children: React.ReactNode; height?: number; title?: string; pad?: boolean }> = ({ s, out, children, height = GFX_H - 10, title }) => (
  <div style={{ position: "absolute", left: PANEL_X, width: PANEL_W, top: GFX_TOP, height, borderRadius: 30, overflow: "hidden", background: "rgba(11,15,10,0.88)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", fontFamily: FONT, color: BRAND.white, opacity: Math.min(1, s * 1.3) * out, transform: `translateY(${(1 - s) * 40}px)` }}>
    {title ? <div style={{ position: "absolute", top: 18, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: BRAND.lime, zIndex: 2 }}>{title}</div> : null}
    {children}
  </div>
);

/* ---------- Titolo grande (apertura): righe su targhe scure, una parola in lime ---------- */
export const Title: React.FC<{ el: Extract<Element, { kind: "title" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const maxLen = Math.max(...el.lines.map((l) => l.length));
  const size = Math.min(98, Math.floor(1750 / maxLen));
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: GFX_TOP + 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: out, fontFamily: FONT }}>
      {el.lines.map((line, li) => {
        const k = easeOut(clamp01((local - (el.onAt ? Math.round(el.onAt[li] * fps) : li * 5)) / 12));
        return (
          <div key={li} style={{ transform: `translateY(${(1 - k) * 50}px) scale(${0.85 + 0.15 * k})`, opacity: k, background: "rgba(11,15,10,0.86)", borderLeft: `12px solid ${BRAND.green}`, borderRadius: 16, padding: "12px 36px", fontWeight: 900, fontSize: size, lineHeight: 1.02, textTransform: "uppercase", color: BRAND.white, letterSpacing: -1, whiteSpace: "nowrap" }}>
            {line.split(" ").map((w, wi) => <span key={wi} style={{ color: el.accent && w.toLowerCase() === el.accent.toLowerCase() ? BRAND.lime : BRAND.white }}>{w} </span>)}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Bocca che si chiude (illustrazione) + testo dell'hook ---------- */
export const Mouth: React.FC<{ el: Extract<Element, { kind: "mouth" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const open = 1 - easeInOut(clamp01((local - 14) / 18)); // da aperta a chiusa
  const cx = 200, cy = 230, w = 150;
  const gap = 10 + 70 * open;
  const upper = `M ${cx - w} ${cy} Q ${cx - w / 2} ${cy - 40 - 10 * open} ${cx} ${cy - 22} Q ${cx + w / 2} ${cy - 40 - 10 * open} ${cx + w} ${cy} Q ${cx} ${cy + 8} ${cx - w} ${cy} Z`;
  const lower = `M ${cx - w} ${cy} Q ${cx} ${cy + gap + 50} ${cx + w} ${cy} Q ${cx} ${cy + gap} ${cx - w} ${cy} Z`;
  const inner = `M ${cx - w + 10} ${cy} Q ${cx} ${cy + gap} ${cx + w - 10} ${cy} Q ${cx} ${cy + 6} ${cx - w + 10} ${cy} Z`;
  const closed = open < 0.05;
  return (
    <Box s={s} out={out}>
      <svg width={400} height={GFX_H - 10} style={{ position: "absolute", left: 10, top: 0 }}>
        <path d={inner} fill="#2a0f0f" />
        <path d={upper} fill={BRAND.cream} stroke={BRAND.ink} strokeWidth={5} />
        <path d={lower} fill={BRAND.cream} stroke={BRAND.ink} strokeWidth={5} />
        {closed ? <line x1={cx - w + 20} x2={cx + w - 20} y1={cy + 4} y2={cy + 4} stroke={BRAND.lime} strokeWidth={8} strokeLinecap="round" /> : null}
        {/* naso: freccia dell'aria che entra */}
        {closed ? <path d={`M ${cx} 60 L ${cx} 150`} stroke={BRAND.az} strokeWidth={10} strokeLinecap="round" strokeDasharray="22 16" strokeDashoffset={-local * 6} /> : null}
      </svg>
      <div style={{ position: "absolute", left: 420, top: 70, width: 440 }}>
        {el.lines.map((l, i) => <div key={i} style={{ fontWeight: 900, fontSize: i === el.lines.length - 1 ? 72 : 44, textTransform: "uppercase", color: i === el.lines.length - 1 ? BRAND.lime : BRAND.cream, lineHeight: 1.05, marginTop: i ? 10 : 0 }}>{l}</div>)}
        <div style={{ marginTop: 18, fontWeight: 700, fontSize: 32, color: closed ? BRAND.az : "rgba(255,255,255,0.4)" }}>{closed ? "respira dal naso" : "…"}</div>
      </div>
    </Box>
  );
};

/* ---------- Corridore stilizzato: da "spingere di più" (veloce, rosso) a "più piano" (lento, lime) ---------- */
const RunnerFig: React.FC<{ phase: number; color: string; x: number; y: number }> = ({ phase, color, x, y }) => {
  const a = Math.sin(phase) * 0.9, b = Math.sin(phase + Math.PI) * 0.9;
  const leg = (ang: number, k: number) => `M ${x} ${y + 60} L ${x + Math.sin(ang) * 55} ${y + 60 + Math.cos(ang) * 55 * k} L ${x + Math.sin(ang) * 55 + Math.sin(ang - 0.9) * 50} ${y + 60 + Math.cos(ang) * 55 * k + Math.cos(ang - 0.9) * 50}`;
  const arm = (ang: number) => `M ${x} ${y - 10} L ${x + Math.sin(ang) * 45} ${y - 10 + Math.cos(ang) * 45} L ${x + Math.sin(ang) * 45 + Math.sin(ang + 1.6) * 40} ${y - 10 + Math.cos(ang) * 45 + Math.cos(ang + 1.6) * 40}`;
  return (
    <g stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx={x + 12} cy={y - 70} r={26} fill={color} stroke="none" />
      <path d={`M ${x + 6} ${y - 40} L ${x} ${y + 60}`} />
      <path d={leg(a, 1)} /><path d={leg(b, 1)} />
      <path d={arm(b)} /><path d={arm(a)} />
    </g>
  );
};
export const Runner: React.FC<{ el: Extract<Element, { kind: "runner" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const k0 = el.onAt ? el.onAt[0] * fps : durF * 0.45, k1 = el.onAt && el.onAt[1] !== undefined ? el.onAt[1] * fps : k0 + durF * 0.25;
  const k = easeInOut(clamp01((local - k0) / Math.max(1, k1 - k0))); // 0 = veloce, 1 = piano (passaggio agganciato alle parole se ci sono `cues`)
  const hz = 4.2 - 2.4 * k;
  const phase = t * hz * Math.PI * 2;
  const color = k < 0.5 ? CORAL : BRAND.lime;
  const bpm = Math.round(el.bpmFrom + (el.bpmTo - el.bpmFrom) * k);
  const ground = GFX_H - 10 - 70;
  return (
    <Box s={s} out={out}>
      <svg width={PANEL_W} height={GFX_H - 10} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={40} x2={PANEL_W - 40} y1={ground} y2={ground} stroke="rgba(255,255,255,0.25)" strokeWidth={4} />
        {/* linee di velocità */}
        {Array.from({ length: 6 }).map((_, i) => {
          const len = (1 - k) * 120 + 20;
          const xx = 70 + ((i * 97 + t * (900 - 600 * k)) % 260);
          return <line key={i} x1={300 - xx} x2={300 - xx - len} y1={ground - 190 + i * 30} y2={ground - 190 + i * 30} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.25 + 0.5 * (1 - k)} />;
        })}
        <RunnerFig phase={phase} color={color} x={320} y={ground - 130} />
        {/* ombra che "respira" col ritmo */}
        <ellipse cx={330} cy={ground + 6} rx={60 + Math.abs(Math.sin(phase)) * 20} ry={8} fill="rgba(0,0,0,0.4)" />
      </svg>
      <div style={{ position: "absolute", left: 470, top: 70, width: 380 }}>
        <div style={{ fontWeight: 900, fontSize: 60, textTransform: "uppercase", color, lineHeight: 1 }}>{k < 0.5 ? el.fast : el.slow}</div>
        <div style={{ fontWeight: 900, fontSize: 120, lineHeight: 1, color: BRAND.white, marginTop: 10 }}>{bpm}<span style={{ fontSize: 40, marginLeft: 8, color: BRAND.cream }}>bpm</span></div>
        <div style={{ fontWeight: 700, fontSize: 32, color: BRAND.cream, marginTop: 6 }}>{k < 0.5 ? "fiato corto, cervello in allarme" : "respiro in controllo"}</div>
      </div>
    </Box>
  );
};

/* ---------- Polmoni che respirano (illustrazione) ---------- */
export const Lungs: React.FC<{ el: Extract<Element, { kind: "lungs" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const br = 0.5 + 0.5 * Math.sin(t * Math.PI / 1.6 - Math.PI / 2); // 0..1 respiro lento (3,2 s)
  const sc = 0.9 + 0.16 * br;
  const cx = 210, top = 60;
  const lobe = (dir: number) => `M ${cx + dir * 18} ${top + 70} C ${cx + dir * 30} ${top + 40} ${cx + dir * 150} ${top + 60} ${cx + dir * 160} ${top + 190} C ${cx + dir * 165} ${top + 290} ${cx + dir * 120} ${top + 330} ${cx + dir * 60} ${top + 320} C ${cx + dir * 25} ${top + 310} ${cx + dir * 18} ${top + 260} ${cx + dir * 18} ${top + 200} Z`;
  return (
    <Box s={s} out={out}>
      <svg width={420} height={GFX_H - 10} style={{ position: "absolute", left: 20, top: 0 }}>
        <g transform={`translate(${cx} ${top + 190}) scale(${sc}) translate(${-cx} ${-(top + 190)})`}>
          <path d={lobe(-1)} fill={BRAND.green} stroke={BRAND.lime} strokeWidth={5} opacity={0.75 + 0.25 * br} />
          <path d={lobe(1)} fill={BRAND.green} stroke={BRAND.lime} strokeWidth={5} opacity={0.75 + 0.25 * br} />
        </g>
        <path d={`M ${cx} ${top} L ${cx} ${top + 90} M ${cx} ${top + 90} L ${cx - 40} ${top + 130} M ${cx} ${top + 90} L ${cx + 40} ${top + 130}`} stroke={BRAND.cream} strokeWidth={12} strokeLinecap="round" fill="none" />
        {/* aria che entra/esce */}
        {[0, 1, 2].map((i) => <circle key={i} cx={cx} cy={top - 10 - ((t * 60 + i * 24) % 70)} r={6 + i * 2} fill={BRAND.az} opacity={br > 0.5 ? 0.8 : 0.25} />)}
      </svg>
      <div style={{ position: "absolute", left: 460, top: 90, width: 400 }}>
        <div style={{ fontWeight: 900, fontSize: 66, textTransform: "uppercase", color: BRAND.lime, lineHeight: 1 }}>{el.title}</div>
        {el.sub ? <div style={{ fontWeight: 700, fontSize: 40, color: BRAND.cream, marginTop: 16, lineHeight: 1.15 }}>{el.sub}</div> : null}
        <div style={{ marginTop: 26, fontWeight: 800, fontSize: 34, color: br > 0.5 ? BRAND.az : BRAND.lime }}>{br > 0.5 ? "INSPIRA" : "ESPIRA"}</div>
      </div>
    </Box>
  );
};

/* ---------- Orizzonte: il corridore si allontana, i km salgono e lo sforzo scende ---------- */
export const Horizon: React.FC<{ el: Extract<Element, { kind: "horizon" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const prog = easeInOut(clamp01((local - 8) / (durF - 24)));
  const hzn = 150, bottom = GFX_H - 10 - 90, vx = PANEL_W * 0.42;
  const ry = bottom - (bottom - hzn) * prog * 0.92;
  const rs = 1 - 0.8 * prog;
  const km = (1 + (el.kmTo - 1) * prog).toFixed(1);
  const effort = 1 - 0.75 * prog;
  return (
    <Box s={s} out={out} title={el.title}>
      <svg width={PANEL_W} height={GFX_H - 10} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0B0F0A" /><stop offset="1" stopColor="#1f3a2a" /></linearGradient>
          <linearGradient id="grd" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2f5a24" /><stop offset="1" stopColor="#16300f" /></linearGradient>
        </defs>
        <rect x={0} y={60} width={PANEL_W} height={hzn - 60} fill="url(#sky)" />
        <rect x={0} y={hzn} width={PANEL_W} height={bottom + 90 - hzn} fill="url(#grd)" />
        <circle cx={PANEL_W * 0.72} cy={hzn - 8} r={34} fill={BRAND.lime} opacity={0.9} />
        <path d={`M ${vx - 260} ${bottom + 90} L ${vx - 6} ${hzn} L ${vx + 6} ${hzn} L ${vx + 260} ${bottom + 90} Z`} fill={BRAND.cream} opacity={0.85} />
        {[0.15, 0.35, 0.6].map((f, i) => { const y = hzn + (bottom + 90 - hzn) * f; const hw = 6 + 254 * f; return <line key={i} x1={vx - hw + 20} x2={vx + hw - 20} y1={y} y2={y} stroke={BRAND.green} strokeWidth={2 + 4 * f} opacity={0.5} />; })}
        <g transform={`translate(${vx} ${ry}) scale(${rs})`}>
          <circle cx={0} cy={-150} r={26} fill={BRAND.ink} />
          <path d={`M 0 -120 L 0 -40 M 0 -40 L ${-30 + Math.sin(t * 8) * 25} 20 M 0 -40 L ${30 - Math.sin(t * 8) * 25} 20 M 0 -100 L ${-35 * Math.sin(t * 8)} -60 M 0 -100 L ${35 * Math.sin(t * 8)} -60`} stroke={BRAND.ink} strokeWidth={14} strokeLinecap="round" fill="none" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 40, bottom: 20, display: "flex", alignItems: "flex-end", gap: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 80, lineHeight: 1, color: BRAND.lime }}>{km}</div>
        <div style={{ fontWeight: 700, fontSize: 32, color: BRAND.cream, paddingBottom: 10 }}>km</div>
      </div>
      <div style={{ position: "absolute", right: 40, bottom: 28, width: 300 }}>
        <div style={{ fontWeight: 800, fontSize: 28, color: BRAND.cream, letterSpacing: 2 }}>SFORZO</div>
        <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.15)", marginTop: 8 }}><div style={{ width: `${effort * 100}%`, height: 22, borderRadius: 11, background: effort > 0.6 ? CORAL : BRAND.lime }} /></div>
      </div>
    </Box>
  );
};

/* ---------- Chat: messaggi dal corpo, bolle che compaiono una alla volta ---------- */
export const Chat: React.FC<{ el: Extract<Element, { kind: "chat" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const n = el.messages.length;
  const per = Math.max(10, Math.floor((durF - 24) / n));
  return (
    <Box s={s} out={out}>
      <div style={{ position: "absolute", top: 16, left: 30, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>C</div>
        <div style={{ fontWeight: 800, fontSize: 34, color: BRAND.cream }}>{el.sender}</div>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: BRAND.lime, marginLeft: 6 }} />
      </div>
      {el.messages.map((msg, i) => {
        const k = easeOut(clamp01((local - (el.onAt ? Math.round(el.onAt[i] * fps) : 8 + i * per)) / 9));
        if (k <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 30, top: 90 + i * 108, maxWidth: PANEL_W - 120, background: BRAND.green, color: BRAND.white, borderRadius: 26, borderTopLeftRadius: 8, padding: "18px 30px", fontWeight: 700, fontSize: 42, lineHeight: 1.15, transform: `translateX(${(1 - k) * -60}px) scale(${0.9 + 0.1 * k})`, transformOrigin: "left center", opacity: k }}>
            {msg}
          </div>
        );
      })}
    </Box>
  );
};

/* ---------- Parola grande barrata ---------- */
export const BigStrike: React.FC<{ el: Extract<Element, { kind: "bigstrike" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const k = easeOut(clamp01((local - 10) / 10));
  return (
    <Box s={s} out={out} height={260}>
      <div style={{ position: "absolute", left: 0, width: "100%", top: 0, height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", fontWeight: 900, fontSize: 96, textTransform: "uppercase", color: BRAND.cream, letterSpacing: -1, whiteSpace: "nowrap" }}>
          {el.text}
          <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 14, marginTop: -7, background: CORAL, borderRadius: 7, transform: `scaleX(${k}) rotate(-3deg)`, transformOrigin: "left center", boxShadow: `0 0 18px ${CORAL}` }} />
        </div>
      </div>
    </Box>
  );
};

/* ---------- Pillole impilate che entrano da sinistra alla parola detta ---------- */
export const Stack: React.FC<{ el: Extract<Element, { kind: "stack" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const rowH = 86;
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: PANEL_W, top: GFX_TOP, fontFamily: FONT, opacity: out }}>
      <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 40, textTransform: "uppercase", padding: "10px 26px", borderRadius: 14, transform: `translateX(${(1 - s) * -80}px)`, opacity: s }}>{el.title}</div>
      {el.items.map((it, i) => {
        const k = easeOut(clamp01((local - Math.round((el.onAt?.[i] ?? i * 1.2) * fps)) / 9));
        return (
          <div key={i} style={{ marginTop: 12, height: rowH - 12, display: "flex", alignItems: "center", background: "rgba(11,15,10,0.9)", borderLeft: `12px solid ${BRAND.lime}`, borderRadius: 14, padding: "0 28px", fontWeight: 800, fontSize: 48, color: BRAND.white, width: "fit-content", maxWidth: PANEL_W - 60, transform: `translateX(${(1 - k) * -120}px)`, opacity: k }}>
            {it}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Guida a tutto schermo (b-roll illustrato): l'esercizio si fa guardando il video ---------- */
const Foot: React.FC<{ x: number; y: number; color: string; flip: boolean; k: number }> = ({ x, y, color, flip, k }) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k}) ${flip ? "scale(-1 1)" : ""}`} opacity={k}>
    <ellipse cx={0} cy={0} rx={34} ry={62} fill={color} />
    {[-26, -8, 10, 26].map((dx, i) => <circle key={i} cx={dx} cy={-78 + Math.abs(dx) * 0.5} r={i === 0 ? 14 : 9} fill={color} />)}
  </g>
);
export const Guide: React.FC<{ el: Extract<Element, { kind: "guide" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, visible, t } = useInOut(start, durF);
  if (!visible) return null;
  const fade = Math.min(clamp01(local / 10), clamp01((durF - local) / 10));
  const titleF = Math.round((el.titleSec ?? (el.title ? 2.4 : 0)) * fps);
  const inTitle = local < titleF;
  const te = Math.max(0, local - titleF) / fps; // tempo dell'esercizio
  const big: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, textTransform: "uppercase", lineHeight: 1, textAlign: "center" };
  let body: React.ReactNode = null;
  if (!inTitle && el.mode === "ritmica") {
    const inh = el.inhale ?? 3, exh = el.exhale ?? 4, cycle = inh + exh, stepSec = 60 / 160;
    const stepIdx = Math.floor(te / stepSec);
    const inCycle = stepIdx % cycle;
    const inhaling = inCycle < inh;
    const kStep = clamp01((te - stepIdx * stepSec) / 0.18);
    const color = inhaling ? BRAND.az : BRAND.lime;
    body = (
      <>
        <div style={{ ...big, position: "absolute", top: 210, left: 0, width: W, fontSize: 150, color }}>{inhaling ? "INSPIRA" : "ESPIRA"}</div>
        <div style={{ ...big, position: "absolute", top: 370, left: 0, width: W, fontSize: 60, color: BRAND.cream, fontWeight: 700, textTransform: "none" }}>{inhaling ? `${inh} passi` : `${exh} passi`} · dal naso</div>
        <svg width={W} height={700} style={{ position: "absolute", top: 460, left: 0 }}>
          <path d={`M 540 700 L 540 0`} stroke="rgba(255,255,255,0.12)" strokeWidth={6} strokeDasharray="20 24" />
          {Array.from({ length: cycle }).map((_, i) => {
            const shown = i < inCycle ? 1 : i === inCycle ? kStep : 0;
            const c = i < inh ? BRAND.az : BRAND.lime;
            return <Foot key={i} x={540 + (i % 2 === 0 ? -90 : 90)} y={640 - i * 88} color={c} flip={i % 2 === 1} k={shown} />;
          })}
        </svg>
        <div style={{ position: "absolute", top: 1180, left: 0, width: W, display: "flex", justifyContent: "center", gap: 16 }}>
          {Array.from({ length: cycle }).map((_, i) => <div key={i} style={{ width: 54, height: 16, borderRadius: 8, background: i <= inCycle ? (i < inh ? BRAND.az : BRAND.lime) : "rgba(255,255,255,0.2)" }} />)}
        </div>
      </>
    );
  } else if (!inTitle && el.mode === "nasale") {
    const inh = el.inhale ?? 3.5, exh = el.exhale ?? 4.5, cycle = inh + exh;
    const tc = te % cycle, inhaling = tc < inh;
    const prog = inhaling ? tc / inh : (tc - inh) / exh;
    const r = inhaling ? 150 + 220 * easeInOut(prog) : 370 - 220 * easeInOut(prog);
    const remaining = Math.ceil((inhaling ? inh - tc : cycle - tc));
    const breath = Math.min(el.breaths ?? 10, Math.floor(te / cycle) + 1);
    const color = inhaling ? BRAND.az : BRAND.lime;
    return (
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#1C3D15 0%,#0B0F0A 70%)", opacity: fade, fontFamily: FONT }}>
        <div style={{ ...big, position: "absolute", top: 170, left: 0, width: W, fontSize: 140, color }}>{inhaling ? "INSPIRA" : "ESPIRA"}</div>
        <div style={{ ...big, position: "absolute", top: 320, left: 0, width: W, fontSize: 52, color: BRAND.cream, fontWeight: 700, textTransform: "none" }}>dal naso · {inhaling ? `${inh}` : `${exh}`} secondi</div>
        <svg width={W} height={820} style={{ position: "absolute", top: 400, left: 0 }}>
          <circle cx={540} cy={410} r={390} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={4} />
          <circle cx={540} cy={410} r={r} fill={color} opacity={0.22} />
          <circle cx={540} cy={410} r={r * 0.78} fill={color} opacity={0.35} />
          <circle cx={540} cy={410} r={r * 0.5} fill={color} />
        </svg>
        <div style={{ ...big, position: "absolute", top: 690, left: 0, width: W, fontSize: 190, color: BRAND.ink }}>{remaining}</div>
        <div style={{ ...big, position: "absolute", top: 1230, left: 0, width: W, fontSize: 44, color: BRAND.cream, fontWeight: 700, textTransform: "none" }}>respiro {breath} di {el.breaths ?? 10}</div>
      </AbsoluteFill>
    );
  } else if (!inTitle && el.mode === "hold") {
    const exh = el.exhale ?? 2, hold = el.hold ?? 4, inh = el.inhale ?? 3, cycle = exh + hold + inh;
    const tc = te % cycle;
    const phase = tc < exh ? 0 : tc < exh + hold ? 1 : 2;
    const prog = phase === 0 ? tc / exh : phase === 1 ? (tc - exh) / hold : (tc - exh - hold) / inh;
    const r = phase === 0 ? 330 - 170 * easeInOut(prog) : phase === 1 ? 160 : 160 + 170 * easeInOut(prog);
    const label = ["ESPIRA", "TRATTIENI", "INSPIRA"][phase];
    const color = [BRAND.lime, BRAND.cream, BRAND.az][phase];
    const remaining = Math.ceil(phase === 0 ? exh - tc : phase === 1 ? exh + hold - tc : cycle - tc);
    const circ = 2 * Math.PI * 300;
    return (
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#1C3D15 0%,#0B0F0A 70%)", opacity: fade, fontFamily: FONT }}>
        <div style={{ ...big, position: "absolute", top: 170, left: 0, width: W, fontSize: 140, color }}>{label}</div>
        <div style={{ ...big, position: "absolute", top: 320, left: 0, width: W, fontSize: 52, color: BRAND.cream, fontWeight: 700, textTransform: "none" }}>{phase === 1 ? "qualche secondo, senza forzare" : "dal naso, con calma"}</div>
        <svg width={W} height={820} style={{ position: "absolute", top: 400, left: 0 }}>
          <circle cx={540} cy={410} r={300} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={16} />
          {phase === 1 ? <circle cx={540} cy={410} r={300} fill="none" stroke={BRAND.lime} strokeWidth={16} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} transform="rotate(-90 540 410)" /> : null}
          <circle cx={540} cy={410} r={r} fill={color} opacity={0.3} />
          <circle cx={540} cy={410} r={r * 0.6} fill={color} />
        </svg>
        <div style={{ ...big, position: "absolute", top: 700, left: 0, width: W, fontSize: 180, color: BRAND.ink }}>{remaining}</div>
        <div style={{ ...big, position: "absolute", top: 1230, left: 0, width: W, fontSize: 44, color: BRAND.cream, fontWeight: 700, textTransform: "none" }}>5-10 volte · poi riprendi dal naso</div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1C3D15 0%,#0B0F0A 70%)", opacity: fade, fontFamily: FONT }}>
      {inTitle ? (
        <div style={{ position: "absolute", top: 520, left: 0, width: W, padding: "0 80px", textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 44, letterSpacing: 6, color: BRAND.lime }}>ESERCIZIO</div>
          {(el.title ?? "").split("|").map((l, i) => {
            const k = easeOut(clamp01((local - 4 - i * 6) / 12));
            return <div key={i} style={{ ...big, fontSize: 112, color: BRAND.white, marginTop: 10, transform: `translateY(${(1 - k) * 50}px)`, opacity: k }}>{l}</div>;
          })}
        </div>
      ) : body}
    </AbsoluteFill>
  );
};

/* ---------- Testimonianze: domanda dell'intervistatore a schermo e cartellino con il nome ---------- */
export const Question: React.FC<{ el: Extract<Element, { kind: "question" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const size = Math.min(76, Math.floor(1500 / Math.max(14, el.text.length / (el.text.length > 22 ? 2 : 1))));
  const chars = Math.round(clamp01(local / Math.min(18, durF * 0.4)) * el.text.length);
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: PANEL_W, top: GFX_TOP + 20, fontFamily: FONT, opacity: out, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 34, letterSpacing: 2, textTransform: "uppercase", padding: "8px 22px", borderRadius: "14px 14px 0 0" }}>{el.label ?? "La domanda"}</div>
      <div style={{ background: BRAND.cream, color: BRAND.ink, borderRadius: "0 22px 22px 22px", padding: "30px 38px", fontWeight: 800, fontSize: size, lineHeight: 1.12, boxShadow: "0 14px 34px rgba(0,0,0,0.4)", minHeight: size * 1.12 }}>
        {el.text.slice(0, chars)}
        <span style={{ opacity: chars < el.text.length ? 1 : 0, color: BRAND.green }}>|</span>
      </div>
    </div>
  );
};

export const NameTag: React.FC<{ el: Extract<Element, { kind: "nametag" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const k = easeOut(clamp01((local - 6) / 10));
  return (
    <div style={{ position: "absolute", left: PANEL_X, top: GFX_TOP + 60, fontFamily: FONT, opacity: out }}>
      <div style={{ display: "flex", alignItems: "stretch", transform: `translateX(${(1 - s) * -120}px)`, opacity: s }}>
        <div style={{ width: 14, background: BRAND.lime, borderRadius: 7 }} />
        <div style={{ marginLeft: 18 }}>
          <div style={{ background: "rgba(11,15,10,0.9)", color: BRAND.white, fontWeight: 900, fontSize: 72, padding: "10px 30px", borderRadius: 14, width: "fit-content" }}>{el.name}</div>
          {el.sub ? <div style={{ marginTop: 10, background: BRAND.cream, color: BRAND.green, fontWeight: 800, fontSize: 40, padding: "8px 24px", borderRadius: 12, width: "fit-content", opacity: k, transform: `translateY(${(1 - k) * -16}px)` }}>{el.sub}</div> : null}
        </div>
      </div>
    </div>
  );
};
