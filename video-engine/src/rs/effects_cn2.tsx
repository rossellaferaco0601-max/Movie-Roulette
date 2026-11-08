// @ts-nocheck — codice ReelStudio (PC di Ross) importato così com'è; vedi video-engine/reelstudio/
// Effetti «firma» dei reel R2-R6 (3/11 notte, Ross: un'animazione diversa per ogni reel, Daniele protagonista).
// Reference: glass-widget, documentary, orbit, bento, uninstall, jiggle-delete, prompt-bar, swipe, gravity-drop…
// Tutti i tempi in props (at, doneAt, …) sono secondi dall'inizio dell'effetto.
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring } from 'remotion';
import type { FxCtx } from './effects';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const G = '#49762E';
const GD = '#2C4A1B';
const AZ = '#B8D7EA';
const CR = '#F4F1E5';
const INK = '#0B0F0A';
const RED = '#C2503F';
const LIME2 = '#95FF00';
const FONT = 'Blinker, sans-serif';
const SERIF = 'DMSerif, Georgia, serif';
const fr = (c: FxCtx, s: number) => Math.round(s * c.fps);
const since = (c: FxCtx, s?: number) => c.frame - fr(c, s || 0);
const sp = (c: FxCtx, s = 0, cfg: any = { damping: 14, stiffness: 160 }) => spring({ frame: since(c, s), fps: c.fps, config: cfg });
const fadeIO = (c: FxCtx, n = 6) => Math.min(interpolate(c.frame, [0, n], [0, 1], clamp), interpolate(c.frame, [c.dur - n, c.dur], [1, 0], clamp));
const on = (c: FxCtx, s?: number) => c.frame >= fr(c, s || 0);
const glass: React.CSSProperties = {
  background: 'rgba(18,26,14,.42)',
  backdropFilter: 'blur(20px) saturate(1.3)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
  border: '2px solid rgba(255,255,255,.34)',
  boxShadow: '0 20px 60px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.35)',
  borderRadius: 40,
  color: '#fff',
  fontFamily: FONT,
};
const em = (s: string, color: string, extra: React.CSSProperties = {}) =>
  String(s || '')
    .split(/(\*[^*]+\*)/)
    .map((x, i) => (x.startsWith('*') ? <span key={i} style={{ color, ...extra }}>{x.slice(1, -1)}</span> : <span key={i}>{x}</span>));

// clip di Daniele: v = { src: '/progetti/…/originale.mp4', from } oppure { t } (stesso video sorgente)
type V = { src?: string; from?: number; t?: number; px?: number; py?: number; z?: number; zoom?: number };
const Clip: React.FC<{ c: FxCtx; v: V; delay?: number; style?: React.CSSProperties }> = ({ c, v, delay = 0, style }) => {
  const url = v.src ? (v.src.startsWith('/') ? c.assetBase + v.src : v.src) : c.videoUrl;
  const start = v.src ? v.from || 0 : v.t || 0;
  const op = `${(v.px ?? 0.5) * 100}% ${(v.py ?? 0.5) * 100}%`;
  const z = (v.z ?? 1) + (v.zoom ?? 0.04) * (c.frame / Math.max(1, c.dur));
  const st: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: op, transformOrigin: op, transform: `scale(${z})`, ...style };
  // fermo immagine nitido di Daniele (nessun problema di labiale), con lento movimento di camera
  if ((v as any).img) return <Img src={c.assetBase + (v as any).img} style={st} />;
  return (
    <Sequence from={fr(c, delay)} layout="none">
      <OffthreadVideo src={url} muted trimBefore={Math.round(start * c.fps)} style={st} />
    </Sequence>
  );
};

/* ============================== R2 · Nessun farmaco ============================== */

// widget in vetro con anello che si riempie e numero che conta (stile widget iOS)
export const RingWidget: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: any[] = c.props.items || [];
  const y = (c.props.y ?? 0.5) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40 }}>
        {items.map((it, i) => {
          if (!on(c, it.at - 0.05)) return <div key={i} style={{ width: 460 }} />;
          const k = sp(c, it.at, { damping: 13, stiffness: 150 });
          const g = interpolate(since(c, it.at), [4, 30], [0, 1], { ...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3) });
          const n = Math.round((it.num || 0) * g);
          const R = 92;
          const L = 2 * Math.PI * R;
          return (
            <div key={i} style={{ ...glass, width: 460, padding: '34px 30px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - k) * 80}px) scale(${0.85 + 0.15 * k})`, opacity: k }}>
              <div style={{ position: 'relative', width: 230, height: 230 }}>
                <svg width={230} height={230} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx={115} cy={115} r={R} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={22} />
                  <circle cx={115} cy={115} r={R} fill="none" stroke={i % 2 ? AZ : '#7FB356'} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${L * (it.fill ?? 0.6) * g} ${L}`} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 84, letterSpacing: -2 }}>
                  {it.prefix ?? '−'}{n}<span style={{ fontSize: 46 }}>{it.suffix ?? '%'}</span>
                </div>
              </div>
              <div style={{ marginTop: 18, fontWeight: 700, fontSize: 38, lineHeight: 1.12, textAlign: 'center' }}>{it.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// barra «prompt» con bordo animato: la domanda si scrive, invio, poi risposta in un chip
export const PromptBar: React.FC<{ c: FxCtx }> = ({ c }) => {
  const txt = String(c.props.text || '');
  const t0 = c.props.typeAt ?? 0.1;
  const t1 = c.props.typeEnd ?? t0 + txt.length * 0.045;
  const n = Math.floor(interpolate(c.frame, [fr(c, t0), fr(c, t1)], [0, txt.length], clamp));
  const sent = on(c, t1 + 0.15);
  const k = sp(c, 0, { damping: 15, stiffness: 150 });
  const rot = (c.frame * 4) % 360;
  const y = (c.props.y ?? 0.52) * 1920;
  const res = c.props.result;
  const rk = res ? sp(c, c.props.resultAt ?? t1 + 0.4, { damping: 12, stiffness: 170 }) : 0;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ position: 'absolute', left: 60, width: 960, top: y, transform: `translateY(${(1 - k) * 60}px) scale(${0.92 + 0.08 * k})`, opacity: k }}>
        <div style={{ padding: 5, borderRadius: 70, background: `conic-gradient(from ${rot}deg, ${AZ}, #7FB356, ${CR}, ${AZ})`, boxShadow: `0 0 ${30 + 10 * Math.sin(c.frame / 5)}px rgba(184,215,234,.7)` }}>
          <div style={{ ...glass, border: 'none', background: 'rgba(14,20,11,.78)', borderRadius: 66, padding: '30px 30px 30px 40px', display: 'flex', alignItems: 'center', gap: 22 }}>
            <svg width={52} height={52} viewBox="0 0 24 24" style={{ flex: 'none', transform: `rotate(${c.frame * 2}deg)` }}>
              <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill={AZ} />
            </svg>
            <div style={{ flex: 1, fontSize: 46, fontWeight: 700, lineHeight: 1.15, minHeight: 53 }}>
              {n ? txt.slice(0, n) : <span style={{ opacity: 0.5 }}>{c.props.placeholder || 'Chiedi qualcosa…'}</span>}
              {!sent ? <span style={{ opacity: Math.floor(c.frame / 7) % 2 ? 0 : 1, color: AZ }}>|</span> : null}
            </div>
            <div style={{ flex: 'none', width: 84, height: 84, borderRadius: 42, background: sent ? G : 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sent ? 1 + 0.25 * Math.max(0, 1 - since(c, t1 + 0.15) / 8) : 1})` }}>
              <svg width={44} height={44} viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
        {res && rk > 0.01 ? (
          <div style={{ ...glass, marginTop: 26, marginLeft: 40, display: 'inline-flex', alignItems: 'center', gap: 18, padding: '20px 34px', borderRadius: 30, transform: `translateY(${(1 - rk) * 30}px)`, opacity: rk }}>
            <span style={{ width: 46, height: 46, borderRadius: 23, background: c.props.resultOk ? G : RED, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800 }}>{c.props.resultOk ? '✓' : '✕'}</span>
            <span style={{ fontSize: 48, fontWeight: 800 }}>{em(res, AZ)}</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// numero gigante con cifre che rotolano (contachilometri)
export const Odometer: React.FC<{ c: FxCtx }> = ({ c }) => {
  const val = String(c.props.value || '0');
  const k = sp(c, 0);
  const y = (c.props.y ?? 0.52) * 1920;
  const H = 170;
  let di = 0;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ ...glass, position: 'absolute', left: 90, right: 90, top: y, padding: '36px 40px 34px', textAlign: 'center', transform: `scale(${0.85 + 0.15 * k})`, opacity: k }}>
        {c.props.kicker ? <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 6, color: AZ, textTransform: 'uppercase' }}>{c.props.kicker}</div> : null}
        <div style={{ display: 'flex', justifyContent: 'center', height: H, overflow: 'hidden', fontWeight: 800, fontSize: 168, lineHeight: `${H}px`, letterSpacing: -3 }}>
          {val.split('').map((ch, i) => {
            if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
            const d = Number(ch);
            const j = di++;
            const g = interpolate(c.frame, [4 + j * 3, 30 + j * 4], [0, 1], { ...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 4) });
            const pos = g * (20 + d);
            return (
              <span key={i} style={{ display: 'inline-block', height: H, overflow: 'hidden' }}>
                <span style={{ display: 'flex', flexDirection: 'column', transform: `translateY(${-pos * H}px)` }}>
                  {Array.from({ length: 31 }, (_, q) => <span key={q} style={{ height: H }}>{q % 10}</span>)}
                </span>
              </span>
            );
          })}
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, marginTop: 6 }}>{em(c.props.label || '', AZ)}</div>
        {c.props.sub ? <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.9, marginTop: 4, transform: `translateY(${(1 - sp(c, c.props.subAt || 0.6)) * 20}px)`, opacity: sp(c, c.props.subAt || 0.6) } as any}>{c.props.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// numero grande + chip che entrano uno alla volta
export const StatStack: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0);
  const chips: any[] = c.props.chips || [];
  const y = (c.props.y ?? 0.5) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ position: 'absolute', left: 80, right: 80, top: y }}>
        <div style={{ ...glass, padding: '30px 40px', display: 'flex', alignItems: 'baseline', gap: 22, transform: `translateX(${(1 - k) * -120}px)`, opacity: k }}>
          <div style={{ fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: -3 }}>{em(c.props.big || '', AZ)}</div>
          <div style={{ fontWeight: 700, fontSize: 46 }}>{c.props.label}</div>
        </div>
        {chips.map((ch, i) => {
          const q = sp(c, ch.at, { damping: 13, stiffness: 170 });
          if (!on(c, ch.at - 0.05)) return null;
          return (
            <div key={i} style={{ ...glass, marginTop: 18, marginLeft: 60 + i * 40, display: 'inline-flex', alignItems: 'center', gap: 18, padding: '18px 30px', borderRadius: 28, transform: `translateX(${(1 - q) * 300}px)`, opacity: q }}>
              <span style={{ width: 48, height: 48, borderRadius: 24, background: G, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800 }}>✓</span>
              <span style={{ fontWeight: 800, fontSize: 50 }}>{ch.text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// barre orizzontali che si accorciano (riduzione del rischio)
export const BarDrop: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: any[] = c.props.items || [];
  const k = sp(c, 0);
  const y = (c.props.y ?? 0.5) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ ...glass, position: 'absolute', left: 70, right: 70, top: y, padding: '34px 40px', transform: `translateY(${(1 - k) * 60}px)`, opacity: k }}>
        {c.props.title ? <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: 5, color: AZ, textTransform: 'uppercase', marginBottom: 14 }}>{c.props.title}</div> : null}
        {items.map((it, i) => {
          const g = interpolate(since(c, it.at), [0, 24], [0, 1], { ...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3) });
          const shown = on(c, it.at - 0.05);
          const v = Math.abs(it.value || 0);
          return (
            <div key={i} style={{ marginTop: i ? 26 : 0, opacity: shown ? 1 : 0.35 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 44, fontWeight: 700 }}>{it.label}</div>
                <div style={{ fontSize: 86, fontWeight: 800, color: i % 2 ? AZ : '#9BD06F' }}>{shown ? `−${Math.round(v * g)}%` : ''}</div>
              </div>
              <div style={{ position: 'relative', height: 34, borderRadius: 18, background: 'rgba(255,255,255,.14)', marginTop: 8, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${100 - v * g}%`, borderRadius: 18, background: i % 2 ? AZ : '#7FB356' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${100 - v * g}%`, right: 0, background: 'repeating-linear-gradient(45deg, rgba(255,255,255,.18) 0 10px, transparent 10px 20px)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ORBIT: Daniele in un cerchio al centro, i risultati gli girano intorno
export const Orbit: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: any[] = c.props.items || [];
  const k = sp(c, 0, { damping: 16, stiffness: 120 });
  const cy = (c.props.cy ?? 0.4) * 1920;
  const D = 500;
  const rx = 300;
  const ry = 335;
  const base = c.frame * 0.018;
  const strike = c.props.strike;
  const placed = items.map((it, i) => {
    const a = base + (i / Math.max(1, items.length)) * Math.PI * 2;
    return { it, i, a, z: Math.sin(a) };
  });
  const chip = ({ it, i, a, z }: any) => {
    if (!on(c, it.at - 0.05)) return null;
    const q = sp(c, it.at, { damping: 12, stiffness: 160 });
    const s = (0.86 + 0.14 * (z + 1) / 2) * q;
    return (
      <div key={i} style={{ ...glass, position: 'absolute', left: Math.max(235, Math.min(845, 540 + Math.cos(a) * rx)), top: cy + z * ry, transform: `translate(-50%,-50%) scale(${s})`, opacity: q, padding: '14px 24px', borderRadius: 28, whiteSpace: 'nowrap', fontSize: 42, fontWeight: 800 }}>
        {em(it.text, AZ)}
      </div>
    );
  };
  const sk = strike ? sp(c, strike.at, { damping: 13 }) : 0;
  const sw = strike ? interpolate(since(c, strike.at), [6, 16], [0, 100], clamp) : 0;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c, 7) }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${(cy / 1920) * 100}%, #3D6526 0%, ${GD} 45%, #0E170A 100%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 0.35 * k }}>
        <ellipse cx={540} cy={cy} rx={rx} ry={ry} fill="none" stroke={AZ} strokeWidth={3} strokeDasharray="6 14" />
        <ellipse cx={540} cy={cy} rx={rx * 0.72} ry={ry * 0.72} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="4 18" />
      </svg>
      {placed.filter((p) => p.z < 0).map(chip)}
      <div style={{ position: 'absolute', left: 540 - D / 2, top: cy - D / 2, width: D, height: D, borderRadius: D / 2, overflow: 'hidden', transform: `scale(${0.6 + 0.4 * k})`, boxShadow: `0 0 0 10px ${AZ}, 0 0 80px rgba(184,215,234,.8)`, background: '#000' }}>
        {c.props.v ? <Clip c={c} v={c.props.v} /> : null}
      </div>
      {placed.filter((p) => p.z >= 0).map(chip)}
      {c.props.center ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: cy + 395, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 96, color: '#fff', opacity: sp(c, c.props.centerAt || 0), textShadow: '0 8px 30px rgba(0,0,0,.5)' }}>{em(c.props.center, AZ)}</div>
      ) : null}
      {strike && on(c, strike.at - 0.05) ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: cy + 505, display: 'flex', justifyContent: 'center', opacity: sk }}>
          <div style={{ position: 'relative', fontFamily: FONT, fontWeight: 800, fontSize: 64, color: CR, opacity: 0.85 }}>
            {strike.text}
            <span style={{ position: 'absolute', left: -10, top: '52%', height: 9, width: `calc(${sw}% + 20px)`, background: RED, borderRadius: 5 }} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// lancetta che si sposta (quadrante)
export const Gauge: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0);
  const to = c.props.to ?? 150;
  // 6/11 (Ross, Y2): props.low = gradi che la lancetta percorre subito, nella zona delle basse intensità; da moveAt sale fino a «to»
  const low = c.props.low ?? 0;
  const g0 = interpolate(c.frame, [6, 6 + 2.4 * c.fps], [0, 1], { ...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3) });
  const g = interpolate(since(c, c.props.moveAt ?? 0.4), [0, 26], [0, 1], { ...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3) });
  const v = (low * g0 + (to - low) * g) / to;
  const wob = Math.sin(c.frame / 2.2) * 2 * Math.max(g, g0 * 0.7);
  const ang = -80 + to * v + wob;
  const y = (c.props.y ?? 0.5) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ ...glass, position: 'absolute', left: 150, width: 780, top: y, padding: '30px 30px 26px', textAlign: 'center', transform: `scale(${(0.85 + 0.15 * k) * (c.props.scale ?? 1)})`, transformOrigin: 'top center', opacity: k }}>
        <svg width={720} height={380} viewBox="0 0 720 380">
          <path d="M60 360 A300 300 0 0 1 660 360" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={40} />
          <path d="M60 360 A300 300 0 0 1 660 360" fill="none" stroke="url(#gg)" strokeWidth={40} strokeDasharray={`${942 * v} 942`} />
          <defs>
            <linearGradient id="gg" x1="0" x2="1">
              <stop offset="0" stopColor={AZ} />
              <stop offset="1" stopColor="#7FB356" />
            </linearGradient>
          </defs>
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI - (i / 10) * Math.PI;
            return <line key={i} x1={360 + Math.cos(a) * 250} y1={360 - Math.sin(a) * 250} x2={360 + Math.cos(a) * 225} y2={360 - Math.sin(a) * 225} stroke="#fff" strokeWidth={5} opacity={0.6} />;
          })}
          <g transform={`rotate(${ang} 360 360)`}>
            <line x1={360} y1={360} x2={360} y2={110} stroke="#fff" strokeWidth={12} strokeLinecap="round" />
          </g>
          <circle cx={360} cy={360} r={26} fill={G} stroke="#fff" strokeWidth={6} />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 40, fontWeight: 800, marginTop: -6, padding: '0 20px' }}>
          <span style={{ opacity: 0.7 }}>{c.props.left || ''}</span>
          <span style={{ color: '#9BD06F' }}>{c.props.right || ''}</span>
        </div>
        {c.props.label ? <div style={{ fontSize: 54, fontWeight: 800, marginTop: 6 }}>{em(c.props.label, AZ)}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/* ============================== R3 · Cellule ============================== */

// lente d'ingrandimento sopra Daniele: dentro si vede la cellula (mitocondri)
export const Lens: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0.1, { damping: 13, stiffness: 120 });
  const out = interpolate(c.frame, [c.dur - 7, c.dur], [1, 0], clamp);
  const R = (c.props.r ?? 250) * k * out;
  const x = (c.props.x ?? 0.5) * 1080 + Math.sin(c.frame / 18) * 18;
  const y = (c.props.y ?? 0.55) * 1920 + Math.cos(c.frame / 22) * 14;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: x - R, top: y - R, width: R * 2, height: R * 2, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 0 14px rgba(255,255,255,.92), 0 0 0 20px ${G}, 0 30px 70px rgba(0,0,0,.5)` }}>
        {c.props.inner ? <Clip c={c} v={{ zoom: 0.25, ...c.props.inner }} style={{ filter: 'saturate(1.2)' }} /> : null}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.45), rgba(255,255,255,0) 35%), radial-gradient(circle, rgba(0,0,0,0) 62%, rgba(0,0,0,.45) 100%)' }} />
      </div>
      <div style={{ position: 'absolute', left: x + R * 0.62, top: y + R * 0.62, width: 46 * k * out, height: 200 * k * out, background: `linear-gradient(${G}, ${GD})`, borderRadius: 24, transform: 'rotate(-45deg)', transformOrigin: 'top center', boxShadow: '0 10px 30px rgba(0,0,0,.4)' }} />
      {c.props.label ? (
        <div style={{ ...glass, position: 'absolute', left: x - 260, width: 520, top: y + R + 50, textAlign: 'center', padding: '14px 20px', borderRadius: 26, fontSize: 44, fontWeight: 800, opacity: sp(c, 0.5) * out }}>{em(c.props.label, AZ)}</div>
      ) : null}
    </AbsoluteFill>
  );
};

// GRAVITY DROP: tessere che cadono dall'alto e si impilano; quelle «old» cadono giù al tempo outAt
export const GravityDrop: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: any[] = c.props.items || [];
  const base = (c.props.y ?? 0.7) * 1920; // dove poggia la pila
  const H = 128;
  return (
    <AbsoluteFill style={{ opacity: interpolate(c.frame, [c.dur - 6, c.dur], [1, 0], clamp) }}>
      {c.props.title ? <div style={{ position: 'absolute', left: 0, right: 0, top: base - (c.props.stack ?? items.length) * (H + 14) - 90, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: 6, color: AZ, textTransform: 'uppercase', textShadow: '0 4px 20px rgba(0,0,0,.6)', opacity: sp(c, 0) }}>{c.props.title}</div> : null}
      {items.map((it, i) => {
        if (!on(c, it.at - 0.02)) return null;
        const slot = it.slot ?? i;
        const target = base - (slot + 1) * (H + 14);
        const q = spring({ frame: since(c, it.at), fps: c.fps, config: { damping: c.props.damping ?? 13, stiffness: 140, mass: 0.9 } });   // 6/11: meno rimbalzo (a 9 le schede scendevano ~450 px sotto la base, fin sui sottotitoli)
        let yy = interpolate(q, [0, 1], [-260, target]);
        let rot = (1 - q) * (i % 2 ? 14 : -12);
        let op = 1;
        if (it.out !== undefined && on(c, it.out)) {
          const tt = since(c, it.out) / c.fps;
          yy = target + 0.5 * 5200 * tt * tt;
          rot = (i % 2 ? 1 : -1) * tt * 120;
          op = Math.max(0, 1 - tt * 1.4);
        }
        const old = it.out !== undefined && on(c, it.out);
        return (
          <div key={i} style={{ ...glass, position: 'absolute', left: 120 + (slot % 2) * 30, width: 780, top: yy, height: H, display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', borderRadius: 34, transform: `rotate(${rot}deg)`, opacity: op, background: it.good ? 'rgba(73,118,46,.82)' : old ? 'rgba(120,40,30,.7)' : glass.background }}>
            {it.emoji ? <span style={{ fontSize: 60 }}>{it.emoji}</span> : <span style={{ width: 46, height: 46, borderRadius: 23, background: it.good === false ? RED : LIME2, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span>}
            <span style={{ fontSize: 54, fontWeight: 800 }}>{it.text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// aggiornamento software (barra di installazione) che diventa «completato»
export const SoftwareUpdate: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0);
  const doneAt = c.props.doneAt ?? c.dur / c.fps - 0.8;
  const v = interpolate(c.frame, [6, fr(c, doneAt)], [0, 1], { ...clamp, easing: (x: number) => x * (2 - x) });
  const done = on(c, doneAt);
  const dk = done ? sp(c, doneAt, { damping: 10, stiffness: 180 }) : 0;
  const y = (c.props.y ?? 0.52) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ ...glass, position: 'absolute', left: 80, right: 80, top: y, padding: '34px 40px', transform: `translateY(${(1 - k) * 70}px)`, opacity: k }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ width: 130, height: 130, borderRadius: 34, background: done ? G : `linear-gradient(135deg, #5E8F3C, ${GD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', transform: `scale(${1 + 0.15 * dk * (1 - dk)})` }}>
            {done ? (
              <span style={{ fontSize: 80, fontWeight: 800, transform: `scale(${dk})` }}>✓</span>
            ) : (
              <svg width={80} height={80} viewBox="0 0 24 24" style={{ transform: `rotate(${c.frame * 6}deg)` }}>
                <path d="M12 3a9 9 0 1 1-8.5 6" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                <path d="M3 4v5h5" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.8 }}>{done ? c.props.doneSub || 'Completato' : c.props.sub || 'Installazione in corso…'}</div>
            <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.05 }}>{done ? c.props.doneTitle || c.props.title : c.props.title}</div>
          </div>
        </div>
        <div style={{ height: 26, borderRadius: 14, background: 'rgba(255,255,255,.16)', marginTop: 26, overflow: 'hidden' }}>
          <div style={{ width: `${v * 100}%`, height: '100%', borderRadius: 14, background: done ? '#7FB356' : `linear-gradient(90deg, ${AZ}, #7FB356)` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 32, fontWeight: 700, opacity: 0.8 }}>
          <span>{c.props.left || ''}</span>
          <span>{Math.round(v * 100)}%</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// notifica push che scende (righe che compaiono al loro tempo)
export const Notif: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0, { damping: 14, stiffness: 170 });
  const lines: any[] = c.props.lines || [];
  const y = (c.props.y ?? 0.5) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ position: 'absolute', left: 50, right: 50, top: y, transform: `translateY(${(1 - k) * -300}px) scale(${c.props.scale || 1})`, transformOrigin: 'center top', opacity: k, textAlign: c.props.align || 'left' }}>
        <div style={{ ...glass, background: 'rgba(245,245,240,.82)', color: INK, border: '2px solid rgba(255,255,255,.7)', padding: '28px 34px', borderRadius: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 32, fontWeight: 700, opacity: 0.75 }}>
            <div style={{ width: 62, height: 62, borderRadius: 16, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>{c.props.emoji ? c.props.emoji : <svg viewBox="0 0 24 24" width={38} height={38} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>}</div>
            <span style={{ letterSpacing: 2, textTransform: 'uppercase', flex: 1 }}>{c.props.app || 'Il tuo corpo'}</span>
            <span>ora</span>
          </div>
          {c.props.title ? <div style={{ fontSize: 50, fontWeight: 800, marginTop: 16 }}>{c.props.title}</div> : null}
          {lines.map((l, i) => {
            if (!on(c, l.at - 0.05)) return null;
            const q = sp(c, l.at, { damping: 14 });
            return (
              <div key={i} style={{ fontSize: 50, fontWeight: l.strong ? 800 : 600, lineHeight: 1.15, marginTop: 10, opacity: q, transform: `translateY(${(1 - q) * 16}px)`, color: l.strong ? G : INK }}>
                {em(l.text, G)}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================== R4 · Cervello ============================== */

// DOCUMENTARY: bande nere, grana, data e titolo che si scrive a macchina (usare con l'effetto bw)
export const Documentary: React.FC<{ c: FxCtx }> = ({ c }) => {
  const bars = interpolate(c.frame, [0, 10], [0, 1], { ...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3) }) * interpolate(c.frame, [c.dur - 8, c.dur], [1, 0], clamp);
  const lines: any[] = c.props.lines || [];
  const seed = c.frame % 6;
  const tc = (c.frame / c.fps + (c.props.tc0 ?? 12)).toFixed(0).padStart(2, '0');
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: '#fff' }}>
      <AbsoluteFill style={{ opacity: 0.22 * bars, mixBlendMode: 'overlay' }}>
        <svg width="100%" height="100%">
          <filter id={`dg${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
          </filter>
          <rect width="100%" height="100%" filter={`url(#dg${seed})`} />
        </svg>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 150 * bars, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 * bars, background: '#000' }} />
      <div style={{ position: 'absolute', top: 170, right: 60, fontSize: 32, fontWeight: 700, letterSpacing: 4, opacity: 0.85 * bars, fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: '#E2453C', opacity: Math.floor(c.frame / 15) % 2 ? 0.3 : 1 }}>●</span> {c.props.corner || 'STUDIO'} · 00:00:{tc}
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: (c.props.y ?? 0.52) * 1920 }}>
        {lines.map((l, i) => {
          const t0 = l.at ?? i * 0.5;
          const txt = String(l.text || '');
          const n = Math.floor(interpolate(c.frame, [fr(c, t0), fr(c, t0) + txt.length * 1.3], [0, txt.length], clamp));
          if (!on(c, t0)) return null;
          const big = l.style !== 'small';
          return (
            <div key={i} style={{ marginTop: i ? 12 : 0 }}>
              <span style={{ display: 'inline-block', background: big ? 'rgba(0,0,0,.72)' : G, padding: big ? '6px 22px' : '6px 18px', fontFamily: big ? SERIF : FONT, fontStyle: big ? 'italic' : 'normal', fontWeight: big ? 400 : 800, fontSize: big ? 84 : 36, letterSpacing: big ? 0 : 6, textTransform: big ? 'none' : 'uppercase', opacity: bars }}>
                {txt.slice(0, n)}
                {n < txt.length ? <span style={{ opacity: 0.7 }}>▌</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// BENTO con video: griglia di tessere, alcune con Daniele dentro
export const BentoVideo: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: any[] = c.props.items || [];
  const top = (c.props.y ?? 0.12) * 1920;
  const bg = 1;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c, 7) }}>
      <AbsoluteFill style={{ background: CR }} />
      {c.props.title ? <div style={{ position: 'absolute', left: 60, right: 60, top: top, fontFamily: FONT, fontWeight: 800, fontSize: 70, color: INK, lineHeight: 1, opacity: bg }}>{em(c.props.title, G, { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400 })}</div> : null}
      <div style={{ position: 'absolute', left: 50, right: 50, top: top + (c.props.title ? 110 : 0), display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: c.props.rowH || 300, gap: 22 }}>
        {items.map((it, i) => {
          const q = sp(c, it.at ?? i * 0.15, { damping: 14, stiffness: 150 });
          const dark = it.tone === 'green' || !!it.v;
          return (
            <div key={i} style={{ position: 'relative', gridColumn: it.span === 2 ? 'span 2' : undefined, gridRow: it.rows ? `span ${it.rows}` : undefined, borderRadius: 36, overflow: 'hidden', background: it.tone === 'green' ? G : it.tone === 'blue' ? AZ : '#fff', boxShadow: '0 14px 34px rgba(0,0,0,.14)', transform: `scale(${0.7 + 0.3 * q})`, opacity: q, fontFamily: FONT }}>
              {it.v ? <Clip c={c} v={it.v} delay={0} /> : null}
              {it.v ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.6) 100%)' }} /> : null}
              <div style={{ position: 'absolute', left: 30, right: 30, bottom: 26, color: dark ? '#fff' : INK }}>
                {it.big ? <div style={{ fontWeight: 800, fontSize: it.bigSize || 104, lineHeight: 1, color: dark ? '#fff' : G }}>{it.big}</div> : null}
                {it.emoji ? <div style={{ fontSize: 76 }}>{it.emoji}</div> : null}
                <div style={{ fontWeight: 800, fontSize: it.size || 56, lineHeight: 1.08 }}>{em(it.text || '', dark ? AZ : G)}</div>
                {it.sub ? <div style={{ fontWeight: 700, fontSize: 42, opacity: 0.9, marginTop: 4 }}>{it.sub}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// scansione «risonanza magnetica»: linea che scorre, griglia, angoli HUD, etichette
export const BrainScan: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = fadeIO(c, 6);
  const per = 1.6 * c.fps;
  const yy = ((c.frame % per) / per) * 1920;
  const tags: any[] = c.props.tags || [];
  const br = (x: number, y: number, r: number) => (
    <path d={`M${x} ${y + 70 * Math.sign(r)} L${x} ${y} L${x + 70 * (r > 0 ? 1 : -1) * (x < 540 ? 1 : -1) * (x < 540 ? 1 : 1)} ${y}`} />
  );
  return (
    <AbsoluteFill style={{ opacity: k, fontFamily: FONT, color: '#fff' }}>
      <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(184,215,234,.12) 2px, transparent 2px), linear-gradient(90deg, rgba(184,215,234,.12) 2px, transparent 2px)', backgroundSize: '90px 90px' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: yy - 120, height: 120, background: 'linear-gradient(180deg, rgba(184,215,234,0), rgba(184,215,234,.35))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: yy, height: 6, background: AZ, boxShadow: `0 0 30px ${AZ}` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} fill="none" stroke={AZ} strokeWidth={6}>
        <path d="M70 330 L70 260 L140 260" />
        <path d="M1010 330 L1010 260 L940 260" />
        <path d="M70 1240 L70 1310 L140 1310" />
        <path d="M1010 1240 L1010 1310 L940 1310" />
      </svg>
      <div style={{ position: 'absolute', top: 200, left: 70, fontSize: 34, fontWeight: 800, letterSpacing: 6, color: AZ }}>{c.props.head || 'RM · SCANSIONE'}</div>
      {tags.map((tg, i) => {
        if (!on(c, tg.at - 0.05) || (tg.out !== undefined && on(c, tg.out))) return null;
        const q = sp(c, tg.at, { damping: 13, stiffness: 170 });
        return (
          <div key={i} style={{ ...glass, position: 'absolute', left: (tg.x ?? 0.1) * 1080, top: (tg.y ?? 0.55) * 1920, padding: '14px 26px', borderRadius: 24, fontSize: tg.size || 48, fontWeight: 800, transform: `scale(${q})`, transformOrigin: 'left center', background: tg.tone === 'green' ? 'rgba(73,118,46,.85)' : tg.tone === 'red' ? 'rgba(160,55,40,.85)' : glass.background }}>
            {em(tg.text, AZ)}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// risultati dei due gruppi: barra che sale (verde) e barra che scende (rossa)
export const GroupResult: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0);
  const cols: any[] = c.props.cols || [];
  const y = (c.props.y ?? 0.5) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ ...glass, position: 'absolute', left: 80, right: 80, top: y, height: 680, padding: '30px 40px', transform: `translateY(${(1 - k) * 60}px)`, opacity: k }}>
        {c.props.title ? <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: 5, color: AZ, textTransform: 'uppercase' }}>{c.props.title}</div> : null}
        <div style={{ position: 'absolute', left: 40, right: 40, top: 340, height: 4, background: 'rgba(255,255,255,.6)' }} />
        {cols.map((col, i) => {
          const g = interpolate(since(c, col.at), [0, 22], [0, 1], { ...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3) });
          const shown = on(c, col.at - 0.05);
          const up = col.dir !== 'down';
          const h = 130 * g;
          const left = 90 + i * 430;
          return (
            <div key={i} style={{ position: 'absolute', left, width: 300, top: 0, bottom: 0, opacity: shown ? 1 : 0.35 }}>
              <div style={{ position: 'absolute', left: 50, width: 200, top: up ? 342 - h : 346, height: h, background: up ? '#7FB356' : RED, borderRadius: up ? '20px 20px 0 0' : '0 0 20px 20px' }} />
              {shown ? <div style={{ position: 'absolute', left: 0, right: 0, top: up ? 342 - h - 100 : 346 + h + 4, textAlign: 'center', fontSize: 78, fontWeight: 800, color: up ? '#9BD06F' : '#F0A08F', opacity: g }}>{col.big}</div> : null}
              <div style={{ position: 'absolute', left: -20, right: -20, bottom: 26, textAlign: 'center', fontSize: 38, fontWeight: 800, lineHeight: 1.1 }}>{col.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// REWIND: Daniele che torna indietro (video al contrario), righe VHS, orologio con lancette all'indietro
export const Rewind: React.FC<{ c: FxCtx }> = ({ c }) => {
  const a = -c.frame * 22;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c, 6) }}>
      {c.props.v ? <Clip c={c} v={{ zoom: 0, ...c.props.v }} /> : null}
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(180deg, rgba(0,0,0,.14) 0 3px, rgba(0,0,0,0) 3px 7px)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: ((c.frame * 37) % 1920), height: 26, background: 'rgba(255,255,255,.08)' }} />
      <div style={{ position: 'absolute', top: 210, left: 70, fontFamily: FONT, fontWeight: 800, fontSize: 64, color: '#fff', letterSpacing: 4, textShadow: '0 4px 20px rgba(0,0,0,.6)', opacity: Math.floor(c.frame / 10) % 2 ? 0.55 : 1 }}>◀◀ {c.props.label || 'REWIND'}</div>
      <div style={{ position: 'absolute', left: 540 - 150, top: (c.props.y ?? 0.52) * 1920, width: 300, height: 300, borderRadius: 150, ...glass, transform: `scale(${sp(c, 0.1)})` }}>
        <svg width={300} height={300} viewBox="0 0 300 300" style={{ position: 'absolute', inset: -2 }}>
          {Array.from({ length: 12 }, (_, i) => {
            const q = (i / 12) * Math.PI * 2;
            return <line key={i} x1={150 + Math.cos(q) * 118} y1={150 + Math.sin(q) * 118} x2={150 + Math.cos(q) * 132} y2={150 + Math.sin(q) * 132} stroke="#fff" strokeWidth={6} />;
          })}
          <line x1={150} y1={150} x2={150} y2={62} stroke="#fff" strokeWidth={10} strokeLinecap="round" transform={`rotate(${a} 150 150)`} />
          <line x1={150} y1={150} x2={150} y2={92} stroke={AZ} strokeWidth={12} strokeLinecap="round" transform={`rotate(${a / 12} 150 150)`} />
          <circle cx={150} cy={150} r={14} fill={G} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* ============================== R5 · La bugia ============================== */

// timbro: frase su striscia di carta + timbro che sbatte
export const Stamp: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0, { damping: 15 });
  const sAt = c.props.stampAt ?? 0.5;
  const s = on(c, sAt) ? spring({ frame: since(c, sAt), fps: c.fps, config: { damping: 9, stiffness: 260 } }) : 0;
  const shake = on(c, sAt) && since(c, sAt) < 6 ? Math.sin(since(c, sAt) * 3) * 6 : 0;
  const y = (c.props.y ?? 0.52) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ position: 'absolute', left: 80, right: 80, top: y, transform: `translate(${shake}px, ${(1 - k) * 60}px) rotate(-2deg)`, opacity: k }}>
        <div style={{ background: CR, color: INK, fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.05, padding: '44px 50px', borderRadius: 12, boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>{em(c.props.text || '', G)}</div>
        {s > 0.01 ? (
          <div style={{ position: 'absolute', right: 30, top: 200, transform: `rotate(-10deg) scale(${2.4 - 1.4 * s})`, opacity: Math.min(1, s * 1.5), border: `10px solid ${c.props.color || RED}`, color: c.props.color || RED, fontFamily: FONT, fontWeight: 800, fontSize: 96, letterSpacing: 8, padding: '0 30px', borderRadius: 18, background: 'rgba(244,241,229,.35)' }}>
            {c.props.stamp || 'FALSO'}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// JIGGLE DELETE: icone-app che tremano; al tempo delAt vengono cancellate una a una
// 6/11 (Ross, Y6): icone SVG (orologio, cardiofrequenzimetro, tabella) al posto delle emoji nelle app che si cancellano
const AppIcon: React.FC<{ kind: string; f: number }> = ({ kind, f }) => {
  const s: any = { fill: 'none', stroke: G, strokeWidth: 6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'watch') {
    const a = (f / 9) * Math.PI;
    return (
      <svg viewBox="0 0 100 100" width={118} height={118} {...s}>
        <rect x={25} y={25} width={50} height={50} rx={13} />
        <path d="M36 25V10h28v15M36 75v15h28V75" />
        <path d="M50 50V37" />
        <path d={`M50 50l${(11 * Math.cos(a)).toFixed(1)} ${(11 * Math.sin(a)).toFixed(1)}`} stroke="#7FB356" />
        <circle cx={50} cy={50} r={3} fill={G} stroke="none" />
      </svg>
    );
  }
  if (kind === 'heart') {
    const n = 120, k = ((f * 4) % (n + 30)) / n;
    return (
      <svg viewBox="0 0 100 100" width={118} height={118} {...s}>
        <path d="M50 86C30 70 12 56 12 38a18 18 0 0 1 38-6 18 18 0 0 1 38 6c0 18-18 32-38 48z" />
        <path d="M18 50h14l6-12 8 26 8-20 4 6h24" stroke="#7FB356" strokeDasharray={n} strokeDashoffset={n * (1 - Math.min(1, k))} />
      </svg>
    );
  }
  const row = Math.floor(f / 10) % 3;
  return (
    <svg viewBox="0 0 100 100" width={118} height={118} {...s}>
      <rect x={14} y={18} width={72} height={64} rx={8} />
      <path d="M14 36h72M14 52h72M14 68h72M40 36v46M64 36v46" opacity={0.75} />
      <rect x={16} y={38 + row * 16} width={68} height={12} fill="rgba(127,179,86,.45)" stroke="none" />
    </svg>
  );
};

export const JiggleApps: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: any[] = c.props.items || [];
  const delAt = c.props.delAt ?? 99;
  const y = (c.props.y ?? 0.5) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: c.props.gap ?? 34 }}>
        {items.map((it, i) => {
          const cw = c.props.colW ?? 210;
          if (!on(c, it.at - 0.05)) return <div key={i} style={{ width: cw }} />;
          const q = sp(c, it.at, { damping: 11, stiffness: 190 });
          const dT = delAt + i * 0.18;
          const d = on(c, dT) ? spring({ frame: since(c, dT), fps: c.fps, config: { damping: 200, stiffness: 200 } }) : 0;
          const jig = Math.sin(c.frame / 1.4 + i * 2) * 4;
          return (
            <div key={i} style={{ width: cw, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `rotate(${jig}deg) scale(${q * (1 - d)})`, opacity: 1 - d, fontFamily: FONT }}>
              <div style={{ position: 'relative', width: 180, height: 180, borderRadius: 46, background: it.color || 'linear-gradient(140deg, #fff, #E6E2D3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, boxShadow: '0 14px 30px rgba(0,0,0,.35)' }}>
                {it.icon ? <AppIcon kind={it.icon} f={since(c, it.at)} /> : it.emoji}
                <div style={{ position: 'absolute', top: -14, left: -14, width: 58, height: 58, borderRadius: 29, background: on(c, delAt - 0.6) ? RED : 'rgba(80,80,80,.85)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, border: '3px solid #fff' }}>✕</div>
              </div>
              <div style={{ marginTop: 14, fontSize: Math.min(38, Math.floor((cw * 1.85) / Math.max(6, String(it.text || '').split(' ').sort((a: string, b: string) => b.length - a.length)[0].length))), fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.05, textShadow: '0 3px 14px rgba(0,0,0,.7)' }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// limitatore: barra di velocità con la linea del naso; oltre la linea diventa rossa
export const Limiter: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0);
  const lim = c.props.limit ?? 0.62;
  const overAt = c.props.overAt ?? 1.5;
  const v1 = interpolate(c.frame, [6, fr(c, overAt)], [0.1, lim - 0.04], clamp);
  const v2 = interpolate(since(c, overAt), [0, 14], [0, 0.3], clamp);
  const v = Math.min(0.97, v1 + v2) + (on(c, overAt) ? Math.sin(c.frame / 1.5) * 0.008 : 0);
  const over = v > lim;
  const y = (c.props.y ?? 0.52) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ ...glass, position: 'absolute', left: 80, right: 80, top: y, padding: '30px 40px 34px', transform: `translateY(${(1 - k) * 60}px)`, opacity: k, boxShadow: over ? `0 0 0 6px ${RED}, 0 0 60px rgba(194,80,63,.6)` : glass.boxShadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 48, fontWeight: 800 }}>
          <span style={{ fontSize: 64 }}></span>
          <span>{em(c.props.title || '', AZ)}</span>
        </div>
        <div style={{ position: 'relative', height: 70, borderRadius: 36, background: 'rgba(255,255,255,.14)', marginTop: 74, overflow: 'visible' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 36, background: over ? `linear-gradient(90deg, #7FB356, #E0A030 ${lim * 100}%, ${RED})` : 'linear-gradient(90deg, #7FB356, #A8D27F)' }} />
          <div style={{ position: 'absolute', left: `${lim * 100}%`, top: -18, bottom: -18, width: 8, background: '#fff', borderRadius: 4, boxShadow: '0 0 14px #fff' }} />
          <div style={{ position: 'absolute', left: `${lim * 100}%`, top: -64, transform: 'translateX(-50%)', fontSize: 30, fontWeight: 800, whiteSpace: 'nowrap', color: AZ }}>{c.props.limitLabel || 'solo naso'}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 36, fontWeight: 800 }}>
          <span style={{ opacity: 0.8 }}>{c.props.low || 'piano'}</span>
          <span style={{ color: over ? '#F0A08F' : 'rgba(255,255,255,.6)' }}>{over ? c.props.overText || '' : c.props.high || ''}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SWIPE: la carta sbagliata vola via a sinistra (), sotto c'è quella giusta ()
export const Swipe: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0);
  const sAt = c.props.swipeAt ?? 0.8;
  const s = on(c, sAt) ? interpolate(since(c, sAt), [0, 12], [0, 1], { ...clamp, easing: (x: number) => x * x }) : 0;
  const bk = sp(c, c.props.bAt ?? sAt + 0.2, { damping: 12, stiffness: 170 });
  const y = (c.props.y ?? 0.5) * 1920;
  const card = (txt: string, good: boolean, style: React.CSSProperties) => (
    <div style={{ position: 'absolute', left: 140, width: 800, height: 380, top: 0, borderRadius: 44, background: good ? G : CR, color: good ? '#fff' : INK, boxShadow: '0 24px 60px rgba(0,0,0,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 80, lineHeight: 1.02, textAlign: 'center', padding: 40, ...style }}>
      <div style={{ width: 96, height: 96, borderRadius: 48, background: good ? '#fff' : RED, color: good ? G : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, marginBottom: 20 }}>{good ? '✓' : '✕'}</div>
      {txt}
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y, height: 400 }}>
        {on(c, (c.props.bAt ?? sAt + 0.2) - 0.05) ? card(c.props.b || '', true, { transform: `scale(${0.85 + 0.15 * bk})`, opacity: bk }) : null}
        {s < 1 ? card(c.props.a || '', false, { transform: `translate(${-s * 1100}px, ${(1 - k) * 80 + s * 120}px) rotate(${-s * 28 + Math.sin(c.frame / 6) * (s ? 0 : 1)}deg)`, opacity: k }) : null}
      </div>
    </AbsoluteFill>
  );
};

// barre del segnale (come sul telefono) che si riempiono con ogni voce
export const Signal: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: any[] = c.props.items || [];
  const k = sp(c, 0);
  const n = items.filter((it) => on(c, it.at)).length;
  const y = (c.props.y ?? 0.5) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ ...glass, position: 'absolute', left: 70, right: 70, top: y, padding: '30px 40px', display: 'flex', gap: 36, alignItems: 'center', transform: `translateY(${(1 - k) * 60}px)`, opacity: k }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 240, flex: 'none' }}>
          {items.map((_, i) => {
            const q = on(c, items[i].at) ? sp(c, items[i].at, { damping: 10, stiffness: 200 }) : 0;
            return <div key={i} style={{ width: 48, height: 70 + i * 80, borderRadius: 12, background: 'rgba(255,255,255,.18)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${q * 100}%`, background: n === items.length ? '#7FB356' : AZ }} />
            </div>;
          })}
        </div>
        <div style={{ flex: 1 }}>
          {c.props.title ? <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 5, color: AZ, textTransform: 'uppercase', marginBottom: 8 }}>{c.props.title}</div> : null}
          {items.map((it, i) => {
            const q = sp(c, it.at, { damping: 14 });
            return (
              <div key={i} style={{ fontSize: 52, fontWeight: 800, padding: '6px 0', opacity: on(c, it.at) ? 1 : 0.3, transform: `translateX(${(1 - (on(c, it.at) ? q : 0)) * 30}px)` }}>{it.text}</div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================== R6 · 3 cose da domani ============================== */

// app Note con la lista «da fare»: i cerchi si riempiono; con props.v una ripresa di Daniele allegata alla nota
export const NotesTodo: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: any[] = c.props.items || [];
  const k = sp(c, 0, { damping: 16, stiffness: 140 });
  const full = !!c.props.full;
  const top = (c.props.y ?? (full ? 0.08 : 0.5)) * 1920;
  const cur = items.reduce((a, it, i) => (it.hl !== undefined && on(c, it.hl) ? i : a), -1);
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c, 7) }}>
      {full ? <AbsoluteFill style={{ background: '#16190F' }} /> : null}
      <div style={{ position: 'absolute', left: full ? 40 : 70, right: full ? 40 : 70, top, borderRadius: 44, background: '#1E2218', boxShadow: '0 30px 70px rgba(0,0,0,.5)', padding: '30px 44px 36px', fontFamily: FONT, color: '#F2F0E8', transform: `translateY(${(1 - k) * 120}px)`, opacity: k, border: '2px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 36, fontWeight: 700, color: '#E3B341' }}>
          <span style={{ fontSize: 46, marginRight: 6 }}>‹</span> Note
          <span style={{ flex: 1 }} />
          {c.props.badge && on(c, c.props.badgeAt || 0) ? <span style={{ position: 'absolute', right: 40, top: 120, background: '#E3B341', color: '#1E2218', borderRadius: 20, padding: '8px 24px', fontSize: 58, fontWeight: 800, transform: `scale(${sp(c, c.props.badgeAt || 0, { damping: 9, stiffness: 220 })})` }}>{c.props.badge}</span> : null}
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 14, lineHeight: 1 }}>{em(c.props.title || 'Da fare domani', '#9BD06F')}</div>
        <div style={{ fontSize: 30, opacity: 0.55, marginTop: 6 }}>{c.props.date || ''}</div>
        {c.props.v ? (
          <div style={{ position: 'relative', height: c.props.vh || 620, borderRadius: 30, overflow: 'hidden', marginTop: 26, background: '#000' }}>
            <Clip c={c} v={c.props.v} />
          </div>
        ) : null}
        <div style={{ marginTop: 18 }}>
          {items.map((it, i) => {
            if (it.at !== undefined && !on(c, it.at - 0.05)) return null;
            const q = sp(c, it.at ?? 0, { damping: 14 });
            const done = it.done !== undefined && on(c, it.done);
            const dk = done ? sp(c, it.done, { damping: 9, stiffness: 220 }) : 0;
            const hl = i === cur;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '16px 14px', marginTop: 6, borderRadius: 22, background: hl ? 'rgba(155,208,111,.16)' : 'transparent', opacity: q, transform: `translateX(${(1 - q) * 40}px)` }}>
                <div style={{ width: 60, height: 60, borderRadius: 30, border: `4px solid ${done ? '#9BD06F' : 'rgba(255,255,255,.5)'}`, background: done ? G : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 800, flex: 'none', transform: `scale(${done ? 0.8 + 0.2 * dk : 1})` }}>{done ? '✓' : ''}</div>
                <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.05, opacity: done ? 0.6 : 1 }}>{it.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// timer circolare (es. 10 minuti, 30 secondi) che scorre veloce
export const TimerRing: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0, { damping: 13, stiffness: 160 });
  const total = c.props.seconds ?? 600;
  const g = interpolate(c.frame, [8, c.dur - 8], [0, 1], clamp);
  const left = c.props.mode === 'up' ? total * g : total * (1 - g);
  const mm = Math.floor(left / 60);
  const ss = Math.floor(left % 60);
  const R = 150;
  const L = 2 * Math.PI * R;
  const x = (c.props.x ?? 0.5) * 1080;
  const y = (c.props.y ?? 0.6) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ ...glass, position: 'absolute', left: x - 200, top: y, width: 400, height: 400, borderRadius: 200, transform: `scale(${0.6 + 0.4 * k})`, opacity: k }}>
        <svg width={400} height={400} style={{ position: 'absolute', inset: -2, transform: 'rotate(-90deg)' }}>
          <circle cx={200} cy={200} r={R} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={24} />
          <circle cx={200} cy={200} r={R} fill="none" stroke="#9BD06F" strokeWidth={24} strokeLinecap="round" strokeDasharray={`${L * g} ${L}`} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 100, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: -2 }}>{`${mm}:${String(ss).padStart(2, '0')}`}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: AZ, marginTop: -4 }}>{c.props.label || ''}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// pulsante di accensione che si illumina («accendi il motore»)
export const PowerOn: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0, { damping: 13 });
  const pAt = c.props.pressAt ?? 0.5;
  const pressed = on(c, pAt);
  const pk = pressed ? sp(c, pAt, { damping: 8, stiffness: 220 }) : 0;
  const ring = pressed ? interpolate(since(c, pAt), [0, 24], [0, 1], clamp) : 0;
  const y = (c.props.y ?? 0.52) * 1920;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(c) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.7 + 0.3 * k})`, opacity: k }}>
        <div style={{ position: 'relative', width: 300, height: 300 }}>
          {pressed ? <div style={{ position: 'absolute', inset: -ring * 160, borderRadius: '50%', border: `6px solid rgba(155,208,111,${1 - ring})` }} /> : null}
          <div style={{ ...glass, position: 'absolute', inset: 0, borderRadius: 150, background: pressed ? `radial-gradient(circle, #7FB356, ${G})` : glass.background, boxShadow: pressed ? `0 0 ${60 + 40 * Math.sin(c.frame / 4)}px rgba(155,208,111,.9)` : glass.boxShadow, transform: `scale(${pressed ? 1 - 0.08 * (1 - pk) : 1})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={150} height={150} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round">
              <path d="M12 3v8" />
              <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
            </svg>
          </div>
        </div>
        <div style={{ ...glass, marginTop: 34, padding: '16px 34px', borderRadius: 30, fontSize: 52, fontWeight: 800 }}>
          {em(c.props.label || '', AZ)} <span style={{ color: pressed ? '#9BD06F' : 'rgba(255,255,255,.5)' }}>{pressed ? 'ON' : 'OFF'}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// sfondo «palco» del brand con una ripresa di Daniele in finestra (scene grafiche al posto delle schede 16:9)
export const Stage: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = c.props.plate ? 1 : fadeIO(c, 7);   // plate: fondo fisso sotto le scene, nasconde le schede del sorgente
  const tone = c.props.tone || 'green';
  const bg = tone === 'cream' ? CR : tone === 'dark' ? '#0E170A' : `radial-gradient(circle at 50% 30%, #3D6526, ${GD} 60%, #0E170A)`;
  const w = c.props.win;
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <AbsoluteFill style={{ background: bg }} />
      {w ? (
        <div style={{ position: 'absolute', left: (w.x ?? 0.08) * 1080, top: (w.y ?? 0.1) * 1920, width: (w.w ?? 0.84) * 1080, height: (w.h ?? 0.36) * 1920, borderRadius: w.round ?? 44, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.4)', border: `6px solid ${tone === 'cream' ? '#fff' : 'rgba(255,255,255,.25)'}` }}>
          <Clip c={c} v={w} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const FX_CN2: Record<string, any> = {
  ringWidget: { name: 'Widget ad anello (vetro)', cat: 'Grafici & numeri', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: RingWidget },
  promptBar: { name: 'Barra prompt AI', cat: 'Schede & UI', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { text: 'Domanda' }, fields: [], C: PromptBar },
  odometer: { name: 'Numero che rotola', cat: 'Grafici & numeri', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { value: '100' }, fields: [], C: Odometer },
  statStack: { name: 'Numero + chip', cat: 'Grafici & numeri', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { big: '10', chips: [] }, fields: [], C: StatStack },
  barDrop: { name: 'Barre che si accorciano', cat: 'Grafici & numeri', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: BarDrop },
  orbit: { name: 'Orbita intorno a Daniele', cat: 'Visual hook', dur: 4, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: Orbit },
  gauge: { name: 'Quadrante con lancetta', cat: 'Grafici & numeri', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: {}, fields: [], C: Gauge },
  lens: { name: 'Lente sulle cellule', cat: 'Visual hook', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: {}, fields: [], C: Lens },
  gravityDrop: { name: 'Tessere che cadono (gravità)', cat: 'Schede & UI', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: GravityDrop },
  softwareUpdate: { name: 'Aggiornamento in corso', cat: 'Schede & UI', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { title: 'Aggiornamento' }, fields: [], C: SoftwareUpdate },
  notif: { name: 'Notifica push', cat: 'Notifiche', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { lines: [] }, fields: [], C: Notif },
  documentary: { name: 'Documentario (bande + macchina da scrivere)', cat: 'Cornici', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { lines: [] }, fields: [], C: Documentary },
  bentoVideo: { name: 'Bento con video', cat: 'Collage & foto', dur: 4, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: BentoVideo },
  brainScan: { name: 'Scansione RM (HUD)', cat: 'Cornici', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { tags: [] }, fields: [], C: BrainScan },
  groupResult: { name: 'Risultato due gruppi', cat: 'Grafici & numeri', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { cols: [] }, fields: [], C: GroupResult },
  rewind: { name: 'Rewind (video al contrario)', cat: 'Transizioni', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: {}, fields: [], C: Rewind },
  stamp: { name: 'Timbro su frase', cat: 'Pop-up & sticker', dur: 2.4, sfx: null, anim: 'cut', pos: 'center', props: { text: 'Frase', stamp: 'FALSO' }, fields: [], C: Stamp },
  jiggleApps: { name: 'App che tremano e si cancellano', cat: 'Schede & UI', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: JiggleApps },
  limiter: { name: 'Limitatore (barra)', cat: 'Grafici & numeri', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: {}, fields: [], C: Limiter },
  swipe: { name: 'Carta che vola via (swipe)', cat: 'Schede & UI', dur: 2.6, sfx: null, anim: 'cut', pos: 'center', props: { a: 'Sbagliato', b: 'Giusto' }, fields: [], C: Swipe },
  signal: { name: 'Barre del segnale', cat: 'Schede & UI', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: Signal },
  notesTodo: { name: 'App Note: lista da fare', cat: 'Schede & UI', dur: 4, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: NotesTodo },
  timerRing: { name: 'Timer circolare', cat: 'Grafici & numeri', dur: 2.5, sfx: null, anim: 'cut', pos: 'center', props: { seconds: 600 }, fields: [], C: TimerRing },
  powerOn: { name: 'Pulsante di accensione', cat: 'Schede & UI', dur: 2.5, sfx: null, anim: 'cut', pos: 'center', props: {}, fields: [], C: PowerOn },
  stage: { name: 'Palco del brand con finestra video', cat: 'Collage & foto', dur: 4, sfx: null, anim: 'cut', pos: 'center', props: { tone: 'green' }, fields: [], C: Stage },
};
