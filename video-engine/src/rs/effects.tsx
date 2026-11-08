// @ts-nocheck — codice ReelStudio (PC di Ross) importato così com'è; vedi video-engine/reelstudio/
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, Freeze, OffthreadVideo, useVideoConfig, Easing, Sequence } from 'remotion';
import { enterExit } from './anim';
import { logoUrl, parseEmph, TITLE_FONTS } from './lib';
import { FX_CN } from './effects_cn';
import { FX_CN2 } from './effects_cn2';
import { FX_CN3 } from './effects_cn3';
import { FX_HOOK } from './effects_hook';

export type FxCtx = {
  frame: number;
  fps: number;
  dur: number;
  P: any;
  brand: any;
  assetBase: string;
  titleFont: string;
  videoUrl: string;
  props: any;
  anim: string;
  position: string;
  srcAt: (outSec: number) => number;
  start: number;
  face?: { y0: number; y1: number } | null; // zona del volto in px (le grafiche la evitano)
  boxH?: number;
};

// sposta la grafica sopra o sotto il volto se ci finirebbe sopra
export const placeTop = (c: FxCtx, base: number, h: number) => {
  const f = c.face;
  if (!f) return base;
  if (base + h <= f.y0 || base >= f.y1) return base;
  const below = f.y1 + 30;
  if (below + h <= 1920 * 0.74) return below;
  const above = f.y0 - h - 30;
  if (above >= 140) return above;
  return below;
};

const POS: Record<string, number> = { top: 210, upper: 470, center: 760, lower: 1040 };

const Box: React.FC<{ c: FxCtx; children: React.ReactNode; w?: number; style?: React.CSSProperties }> = ({ c, children, w = 900, style }) => {
  const ee = enterExit(c.anim, c.frame, c.fps, c.dur);
  return (
    <div style={{ position: 'absolute', left: (1080 - w) / 2, width: w, top: placeTop(c, POS[c.position] ?? POS.upper, c.boxH || 300), display: 'flex', justifyContent: 'center', ...ee, ...style }}>
      {children}
    </div>
  );
};

const card: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 34,
  boxShadow: '0 22px 60px rgba(0,0,0,.35)',
  padding: '34px 40px',
  fontFamily: 'Blinker, Inter, sans-serif',
  color: '#0B0F0A',
};

const tf = (c: FxCtx) => TITLE_FONTS[c.titleFont] || TITLE_FONTS.brand;

const Emph: React.FC<{ text: string; color: string; c: FxCtx }> = ({ text, color, c }) => (
  <>
    {parseEmph(text).map((p, i) => (
      <span key={i} style={p.e ? { color, fontStyle: tf(c).italicEmph ? 'italic' : 'normal' } : {}}>
        {p.t}
      </span>
    ))}
  </>
);

// ---------------- EFFETTI ----------------
const BigNumber: React.FC<{ c: FxCtx }> = ({ c }) => {
  const f = tf(c);
  return (
    <Box c={c} w={1040}>
      <div style={{ textAlign: 'center', color: '#fff', textShadow: '0 8px 40px rgba(0,0,0,.55)' }}>
        <div style={{ fontFamily: f.css, fontWeight: f.weight, fontSize: c.props.size || 210, lineHeight: 0.95, letterSpacing: -4, textTransform: f.upper ? 'uppercase' : 'none' }}>
          <Emph text={c.props.text || '-3 min'} color={c.P.accent} c={c} />
        </div>
        {c.props.sub ? (
          <div style={{ fontFamily: 'Blinker', fontWeight: 800, fontSize: 46, letterSpacing: 6, textTransform: 'uppercase', marginTop: 14 }}>{c.props.sub}</div>
        ) : null}
      </div>
    </Box>
  );
};

const BigText: React.FC<{ c: FxCtx }> = ({ c }) => {
  const f = tf(c);
  const words = (c.props.text || 'CORRI COSÌ.').split(' ');
  return (
    <AbsoluteFill style={{ background: c.props.background === 'none' ? 'transparent' : c.props.background || c.P.primary, justifyContent: 'center', alignItems: 'center', padding: 70 }}>
      <div style={{ textAlign: 'center', fontFamily: f.css, fontWeight: f.weight, color: '#fff', fontSize: c.props.size || 170, lineHeight: 0.92, textTransform: 'uppercase', letterSpacing: -2 }}>
        {words.map((w: string, i: number) => {
          const appear = i * 4;
          const s = interpolate(c.frame - appear, [0, 4, 7], [2.2, 0.95, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <span key={i} style={{ display: 'inline-block', margin: '0 14px', opacity: c.frame >= appear ? 1 : 0, transform: `scale(${s})` }}>
              {w}
            </span>
          );
        })}
      </div>
      {c.props.showLogo !== false ? (
        <Img src={logoUrl(c.assetBase, c.brand, 'pictogramOnDark')} style={{ position: 'absolute', bottom: 160, height: 120, opacity: 0.9 }} />
      ) : null}
    </AbsoluteFill>
  );
};

const Checklist: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: string[] = c.props.items || ['Busto dritto', 'Passo corto', 'Appoggio sotto il bacino'];
  const per = Math.max(10, Math.floor((c.dur - 20) / items.length));
  return (
    <Box c={c} w={860}>
      <div style={{ ...card, width: 860 }}>
        <div style={{ color: c.P.primary, fontWeight: 800, letterSpacing: 4, fontSize: 30, textTransform: 'uppercase', marginBottom: 14 }}>{c.props.title || 'I 3 errori'}</div>
        {items.map((it, i) => {
          const on = c.frame > 12 + i * per;
          const sp = spring({ frame: c.frame - (12 + i * per), fps: c.fps, config: { damping: 12 } });
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 52, fontWeight: 700, margin: '10px 0', color: on ? '#0B0F0A' : '#9AA39C' }}>
              <div style={{ width: 58, height: 58, borderRadius: 14, flex: 'none', border: `5px solid ${on ? c.P.primary : '#C9D0CB'}`, background: on ? c.P.primary : 'transparent', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 40, transform: `scale(${on ? 0.8 + 0.2 * sp : 1})` }}>
                {on ? (c.props.mode === 'x' ? '✕' : '✓') : ''}
              </div>
              <span>{it}</span>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

const Notification: React.FC<{ c: FxCtx }> = ({ c }) => (
  <Box c={{ ...c, position: c.position || 'top' }} w={960}>
    <div style={{ ...card, width: 960, borderRadius: 40, padding: '28px 32px', display: 'flex', gap: 26, alignItems: 'center', background: 'rgba(255,255,255,.96)' }}>
      <div style={{ width: 96, height: 96, borderRadius: 24, background: c.P.primary, display: 'grid', placeItems: 'center', flex: 'none' }}>
        <Img src={logoUrl(c.assetBase, c.brand, 'pictogramOnDark')} style={{ height: 70 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30, color: '#6B726D', fontWeight: 600 }}>
          <span style={{ color: '#0B0F0A', fontWeight: 800 }}>{c.props.app || c.brand?.notificationApp || c.brand?.name}</span>
          <span>ora</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, marginTop: 4 }}>{c.props.title || 'Il tuo piano di corsa è pronto'}</div>
        {c.props.body ? <div style={{ fontSize: 34, color: '#3B423D', marginTop: 2 }}>{c.props.body}</div> : null}
      </div>
    </div>
  </Box>
);

const DataCard: React.FC<{ c: FxCtx }> = ({ c }) => {
  const fill = interpolate(c.frame, [6, 30], [0, c.props.value ?? 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bars = 18;
  return (
    <Box c={c} w={900}>
      <div style={{ ...card, width: 900, background: '#0B0F0A', color: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -30, left: 34, background: c.P.primary, color: '#fff', fontWeight: 800, fontSize: 30, padding: '8px 22px', borderRadius: 40, letterSpacing: 2 }}>{c.props.badge || 'CADENZA 180'}</div>
        <div style={{ fontSize: 30, letterSpacing: 4, color: '#9AA59F', fontWeight: 700, marginTop: 10 }}>{(c.props.label || 'PASSO · CADENZA').toUpperCase()}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {Array.from({ length: bars }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 70, borderRadius: 6, background: i / bars < fill ? c.P.accent : '#2B332E' }} />
          ))}
        </div>
      </div>
    </Box>
  );
};

const Polaroid: React.FC<{ c: FxCtx }> = ({ c }) => {
  const caps: string[] = c.props.captions || ['prima', 'durante', 'dopo'];
  const times: number[] = c.props.times || caps.map((_, i) => c.srcAt(Math.max(0, c.start - 6 + i * 3)));
  return (
    <Box c={c} w={1040}>
      <div style={{ position: 'relative', width: 1040, height: 560 }}>
        {caps.map((cap, i) => {
          const sp = spring({ frame: c.frame - i * 5, fps: c.fps, config: { damping: 13 } });
          const rot = [-9, 3, 11][i % 3];
          return (
            <div key={i} style={{ position: 'absolute', left: 40 + i * 320, top: 30 + (i % 2) * 40, width: 330, background: '#fff', padding: '16px 16px 70px', boxShadow: '0 18px 40px rgba(0,0,0,.4)', transform: `rotate(${rot * sp}deg) scale(${sp})` }}>
              <div style={{ width: 298, height: 380, overflow: 'hidden', background: '#ccc' }}>
                <Freeze frame={Math.round(times[i] * c.fps)}>
                  <OffthreadVideo src={c.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Freeze>
              </div>
              <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontFamily: 'Caveat', fontSize: 50, color: '#222' }}>{cap}</div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

const Strike: React.FC<{ c: FxCtx }> = ({ c }) => {
  const line = interpolate(c.frame, [10, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Box c={c} w={1000}>
      <div style={{ ...card, position: 'relative', transform: 'rotate(-5deg)', fontSize: c.props.size || 66, fontWeight: 800, textTransform: 'uppercase', padding: '22px 40px' }}>
        {c.props.text || 'Scarpe da 200€'}
        <div style={{ position: 'absolute', left: -20, top: '50%', height: 12, borderRadius: 8, background: c.props.color || '#E0337A', width: `${line * 110}%`, transform: 'rotate(-8deg)' }} />
      </div>
    </Box>
  );
};

const Progress: React.FC<{ c: FxCtx }> = ({ c }) => {
  const v = interpolate(c.frame, [8, c.dur - 12], [0, c.props.value ?? 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Box c={c} w={900}>
      <div style={{ ...card, width: 900, background: c.P.primary, color: '#fff' }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 3, color: c.P.accent }}>{(c.props.label || 'POSTI RUNNING SCHOOL').toUpperCase()}</div>
        <div style={{ fontSize: 46, fontWeight: 700, margin: '6px 0 18px' }}>{c.props.title || 'Quasi esauriti'}</div>
        <div style={{ height: 34, borderRadius: 30, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${v * 100}%`, background: '#fff', borderRadius: 30 }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: 36, fontWeight: 800, marginTop: 10 }}>{Math.round(v * 100)}%</div>
      </div>
    </Box>
  );
};

const Typing: React.FC<{ c: FxCtx }> = ({ c }) => {
  const txt: string = c.props.text || 'Ciao Daniele, voglio iniziare';
  const n = Math.floor(interpolate(c.frame, [8, 8 + txt.length * 1.6], [0, txt.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <Box c={c} w={900}>
      <div style={{ ...card, width: 900 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 3, color: c.P.primary }}>{(c.props.label || 'Scrivi in DM').toUpperCase()}</div>
        <div style={{ fontSize: 50, fontWeight: 600, marginTop: 8, minHeight: 64 }}>
          {txt.slice(0, n)}
          <span style={{ opacity: Math.floor(c.frame / 8) % 2 ? 0 : 1, color: c.P.primary }}>|</span>
        </div>
      </div>
    </Box>
  );
};

const Rec: React.FC<{ c: FxCtx }> = ({ c }) => {
  const m = 70;
  const L = 90;
  const st: React.CSSProperties = { position: 'absolute', width: L, height: L, borderColor: '#fff', borderStyle: 'solid', borderWidth: 0 };
  const t = c.start + c.frame / c.fps;
  const tc = `00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(Math.floor((t % 1) * 30)).padStart(2, '0')}`;
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, c.frame / 5) }}>
      <div style={{ ...st, left: m, top: m + 140, borderLeftWidth: 7, borderTopWidth: 7 }} />
      <div style={{ ...st, right: m, top: m + 140, borderRightWidth: 7, borderTopWidth: 7 }} />
      <div style={{ ...st, left: m, bottom: m + 260, borderLeftWidth: 7, borderBottomWidth: 7 }} />
      <div style={{ ...st, right: m, bottom: m + 260, borderRightWidth: 7, borderBottomWidth: 7 }} />
      <div style={{ position: 'absolute', left: m + 110, top: m + 160, color: '#fff', fontFamily: 'JBMono', fontSize: 36, display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ width: 24, height: 24, borderRadius: 20, background: '#FF3B30', opacity: Math.floor(c.frame / 15) % 2 ? 0.2 : 1 }} /> REC
      </div>
      <div style={{ position: 'absolute', right: m + 110, top: m + 160, color: '#fff', fontFamily: 'JBMono', fontSize: 32 }}>{tc}</div>
    </AbsoluteFill>
  );
};

const Emoji: React.FC<{ c: FxCtx }> = ({ c }) => {
  const sp = spring({ frame: c.frame, fps: c.fps, config: { damping: 9 } });
  const out = interpolate(c.frame, [c.dur - 6, c.dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  let x = c.props.x ?? 0.18;
  const y = c.props.y ?? 0.32;
  // niente emoji sopra la faccia: se cade nella zona del volto la sposto di lato
  if (c.face && y * 1920 > c.face.y0 - 80 && y * 1920 < c.face.y1 + 80 && x > 0.22 && x < 0.78) x = x < 0.5 ? 0.13 : 0.87;
  return (
    <div style={{ position: 'absolute', left: x * 1080, top: y * 1920, fontSize: c.props.size || 170, transform: `translate(-50%,-50%) scale(${sp * out}) rotate(${Math.sin(c.frame / 4) * 8 - 8}deg)`, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,.35))' }}>
      {c.props.emoji || '🏃'}
    </div>
  );
};

const Arrow: React.FC<{ c: FxCtx }> = ({ c }) => {
  const draw = interpolate(c.frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const bob = Math.sin(c.frame / 5) * 14;
  const x = (c.props.x ?? 0.5) * 1080;
  const y = (c.props.y ?? 0.62) * 1920;
  return (
    <div style={{ position: 'absolute', left: x - 120, top: y - 200 + bob, width: 240, textAlign: 'center', opacity: draw }}>
      {c.props.label ? <div style={{ ...card, display: 'inline-block', padding: '10px 24px', fontSize: 40, fontWeight: 800, marginBottom: 10 }}>{c.props.label}</div> : null}
      <svg width="160" height="200" viewBox="0 0 160 200" style={{ display: 'block', margin: '0 auto', transform: `rotate(${c.props.rotate || 0}deg)` }}>
        <path d="M80 10 Q 110 90 80 170" stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 * (1 - draw)} />
        <path d="M45 140 L80 182 L115 140" stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={draw > 0.8 ? 1 : 0} />
      </svg>
    </div>
  );
};

const Badge: React.FC<{ c: FxCtx }> = ({ c }) => (
  <Box c={c} w={900}>
    <div style={{ background: c.props.color || c.P.primary, color: '#fff', fontFamily: 'Blinker', fontWeight: 800, fontSize: 64, padding: '18px 44px', borderRadius: 80, transform: 'rotate(-4deg)', boxShadow: '0 14px 30px rgba(0,0,0,.3)', textTransform: 'uppercase' }}>
      {c.props.text || '+500 runner'}
    </div>
  </Box>
);

const LowerThird: React.FC<{ c: FxCtx }> = ({ c }) => {
  const w = interpolate(c.frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const out = interpolate(c.frame, [c.dur - 8, c.dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 70, top: c.position === 'top' ? 260 : 1060, opacity: out }}>
      <div style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden', borderRadius: 18, boxShadow: '0 12px 30px rgba(0,0,0,.3)', clipPath: `inset(0 ${100 - w * 100}% 0 0)` }}>
        <div style={{ width: 16, background: c.P.accent }} />
        <div style={{ background: c.P.primary, color: '#fff', padding: '18px 30px', fontFamily: 'Blinker' }}>
          <div style={{ fontSize: 50, fontWeight: 800 }}>{c.props.name || 'Daniele Vecchioni'}</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: c.P.accent }}>{c.props.role || 'Ideatore del metodo Correre Naturale®'}</div>
        </div>
      </div>
    </div>
  );
};

const TipCard: React.FC<{ c: FxCtx }> = ({ c }) => (
  <Box c={c} w={900}>
    <div style={{ ...card, width: 900, borderTop: `14px solid ${c.P.primary}` }}>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 4, color: c.P.primary }}>{(c.props.label || 'Consiglio').toUpperCase()}</div>
      <div style={{ fontSize: 54, fontWeight: 700, marginTop: 6, lineHeight: 1.1 }}>{c.props.text || 'Accorcia il passo, non allungarlo'}</div>
    </div>
  </Box>
);

const Counter: React.FC<{ c: FxCtx }> = ({ c }) => {
  const from = c.props.from ?? 0;
  const to = c.props.to ?? 180;
  const v = interpolate(c.frame, [4, Math.min(c.dur - 10, 40)], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Box c={c} w={1000}>
      <div style={{ textAlign: 'center', color: '#fff', textShadow: '0 8px 40px rgba(0,0,0,.55)' }}>
        <div style={{ fontFamily: 'Blinker', fontWeight: 800, fontSize: 220, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {c.props.prefix || ''}
          {Math.round(v)}
          <span style={{ fontSize: 90, color: c.P.accent }}>{c.props.suffix ?? ' spm'}</span>
        </div>
        <div style={{ fontFamily: 'Blinker', fontWeight: 800, fontSize: 44, letterSpacing: 5, textTransform: 'uppercase' }}>{c.props.label || 'cadenza ideale'}</div>
      </div>
    </Box>
  );
};

const MythTruth: React.FC<{ c: FxCtx }> = ({ c }) => {
  const s2 = spring({ frame: c.frame - 18, fps: c.fps, config: { damping: 12 } });
  const one = (title: string, text: string, good: boolean, sc: number) => (
    <div style={{ ...card, width: 470, padding: '26px 28px', transform: `scale(${sc}) rotate(${good ? 2 : -2}deg)`, borderTop: `14px solid ${good ? c.P.primary : '#D64545'}` }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: good ? c.P.primary : '#D64545' }}>{good ? '✓ ' : '✕ '}{title}</div>
      <div style={{ fontSize: 40, fontWeight: 600, marginTop: 8, lineHeight: 1.1 }}>{text}</div>
    </div>
  );
  return (
    <Box c={c} w={1020}>
      <div style={{ display: 'flex', gap: 30 }}>
        {one(c.props.leftTitle || 'MITO', c.props.left || 'Atterra sul tallone', false, 1)}
        {one(c.props.rightTitle || 'VERITÀ', c.props.right || 'Appoggia sotto il bacino', true, s2)}
      </div>
    </Box>
  );
};

// capitolo numerato (5/11, Ross: più animazione): il numero entra con rimbalzo, la barra lime si allunga, il titolo scorre dopo
const Chapter: React.FC<{ c: FxCtx }> = ({ c }) => {
  const kN = spring({ frame: c.frame, fps: c.fps, config: { damping: 9, stiffness: 170 } });
  const kBar = spring({ frame: c.frame - 5, fps: c.fps, config: { damping: 16, stiffness: 120 } });
  const kT = spring({ frame: c.frame - 9, fps: c.fps, config: { damping: 14, stiffness: 160 } });
  const pulse = 1 + 0.03 * Math.sin(c.frame / 5);
  const col = c.props.color || '#95FF00';
  return (
    <Box c={c} w={940}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, background: 'rgba(11,15,10,.84)', borderRadius: 32, padding: '22px 40px 22px 30px', color: '#fff', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: col, transform: `scaleY(${kBar})`, transformOrigin: 'top' }} />
        <div style={{ fontFamily: 'Blinker', fontWeight: 800, fontSize: 124, color: col, lineHeight: 1, transform: `translateX(${(1 - kN) * -140}px) scale(${(0.6 + 0.4 * kN) * pulse})`, opacity: Math.min(1, kN * 1.5), textShadow: `0 0 ${24 * kN}px rgba(149,255,0,.45)` }}>{c.props.number || '01'}</div>
        <div style={{ width: 4, alignSelf: 'stretch', background: 'rgba(255,255,255,.25)', transform: `scaleY(${kBar})` }} />
        <div style={{ fontFamily: 'Blinker', fontWeight: 800, fontSize: c.props.size || 62, lineHeight: 1.05, opacity: kT, transform: `translateX(${(1 - kT) * 60}px)` }}>{c.props.title || 'La postura'}</div>
      </div>
    </Box>
  );
};

const Comment: React.FC<{ c: FxCtx }> = ({ c }) => (
  <Box c={c} w={940}>
    <div style={{ ...card, width: 940, display: 'flex', gap: 24, alignItems: 'center', borderRadius: 30 }}>
      <div style={{ width: 90, height: 90, borderRadius: 50, background: c.P.accent, display: 'grid', placeItems: 'center', fontSize: 50, flex: 'none' }}>🏃</div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 800 }}>{c.props.user || 'runner_felice'} <span style={{ color: '#8A918C', fontWeight: 500 }}>· adesso</span></div>
        <div style={{ fontSize: 46, fontWeight: 600 }}>{c.props.text || 'CORRO 🔥'}</div>
      </div>
      <div style={{ marginLeft: 'auto', fontSize: 50, color: '#E0337A' }}>♥</div>
    </div>
  </Box>
);

const Stopwatch: React.FC<{ c: FxCtx }> = ({ c }) => {
  const t = (c.props.from ?? 0) + (c.frame / c.fps) * (c.props.speed ?? 1);
  const mm = Math.floor(t / 60);
  const ss = Math.floor(t % 60);
  const cs = Math.floor((t % 1) * 100);
  return (
    <Box c={c} w={760}>
      <div style={{ ...card, background: '#0B0F0A', color: '#fff', fontFamily: 'JBMono', fontSize: 120, padding: '20px 50px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontSize: 80 }}>⏱</span>
        {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
        <span style={{ fontSize: 60, color: c.P.accent }}>.{String(cs).padStart(2, '0')}</span>
      </div>
    </Box>
  );
};

const Flash: React.FC<{ c: FxCtx }> = ({ c }) => {
  const o = interpolate(c.frame, [0, 2, c.dur], [0, 0.9, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: c.props.color || '#fff', opacity: o }} />;
};

const LogoSting: React.FC<{ c: FxCtx }> = ({ c }) => (
  <Box c={c} w={800}>
    <div style={{ background: 'rgba(255,255,255,.95)', borderRadius: 36, padding: '30px 50px', boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
      <Img src={logoUrl(c.assetBase, c.brand, 'onLight')} style={{ height: 200 }} />
    </div>
  </Box>
);

// Parola chiave "a comparsa" (al posto del sottotitolo), con riflesso sotto
const KeywordPop: React.FC<{ c: FxCtx }> = ({ c }) => {
  const txt = String(c.props.text || 'PAROLA').toUpperCase();
  const f = tf(c);
  const size = Math.min(c.props.size || 170, Math.floor(1800 / Math.max(4, txt.length)));
  const color = c.props.color || c.P.accent;
  const sp = spring({ frame: c.frame, fps: c.fps, config: { damping: 14, stiffness: 190 } });
  const sp2 = spring({ frame: c.frame - 3, fps: c.fps, config: { damping: 16, stiffness: 150 } });
  const out = interpolate(c.frame, [c.dur - 5, c.dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blur = interpolate(c.frame, [0, 5], [8, 0], { extrapolateRight: 'clamp' });
  const top = c.position === 'center' ? 760 : c.position === 'lower' ? 1040 : c.face ? Math.max(170, c.face.y0 - size * 1.55) : 230;
  const base: React.CSSProperties = { fontFamily: f.upper ? f.css : 'Blinker, Inter, sans-serif', fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: -1, whiteSpace: 'nowrap', textAlign: 'center' };
  // props.stroke: contorno (es. bianco) per leggere bene il verde del brand sul video
  if (c.props.stroke) Object.assign(base, { WebkitTextStroke: `${c.props.stroke}px ${c.props.strokeColor || '#fff'}`, paintOrder: 'stroke fill' as any });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out }}>
      <div style={{ ...base, color, transform: `translateY(${(1 - sp) * 60}px) scale(${0.85 + 0.15 * sp})`, filter: `blur(${blur}px) drop-shadow(0 6px 18px rgba(0,0,0,.45))` }}>{txt}</div>
      <div
        style={{
          ...base,
          color,
          marginTop: -size * 0.12,
          transform: `scaleY(-1) translateY(${(1 - sp2) * -40}px)`,
          opacity: 0.45 * sp2,
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,0) 70%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,0) 70%)',
        }}
      >
        {txt}
      </div>
    </div>
  );
};

// Effetti aggiunti dal materiale di riferimento (visual hook, UI, doodle, B-roll)
// Questo file viene incluso in effects.tsx: usa Box, card, tf, Emph, placeTop, POS definiti lì.

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// 1) Titolo misto: riga bold + riga serif corsiva + riga bold ("THIS IS A / Visual / hook")
const MixTitle: React.FC<{ c: FxCtx }> = ({ c }) => {
  const lines = [c.props.l1, c.props.l2, c.props.l3].filter(Boolean);
  const col = c.props.color || '#fff';
  const acc = c.props.accent || c.P.accent;
  const ee = enterExit(c.anim, c.frame, c.fps, c.dur);
  const top = placeTop(c, POS[c.position] ?? POS.top, 420);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top, textAlign: c.props.align || 'center', opacity: ee.opacity }}>
      {lines.map((l, i) => {
        const sp = spring({ frame: c.frame - i * 4, fps: c.fps, config: { damping: 12, stiffness: 170 } });
        const serif = i === 1;
        return (
          <div
            key={i}
            style={{
              fontFamily: serif ? 'DMSerif, Georgia, serif' : 'Anton, Impact, sans-serif',
              fontStyle: serif ? 'italic' : 'normal',
              fontSize: (serif ? 150 : 128) * (c.props.size || 1),
              lineHeight: serif ? 0.95 : 0.92,
              color: serif ? acc : col,
              textTransform: serif ? 'none' : 'uppercase',
              letterSpacing: serif ? 0 : 1,
              textShadow: '0 8px 30px rgba(0,0,0,.45)',
              transform: `translateY(${(1 - sp) * 80}px) rotate(${(1 - sp) * (i % 2 ? 6 : -6)}deg)`,
              opacity: sp,
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

// 2) Parola scritta a mano che si disegna
const ScriptWord: React.FC<{ c: FxCtx }> = ({ c }) => {
  const prog = interpolate(c.frame, [0, 14], [0, 100], clamp);
  const ee = enterExit(c.anim === 'pop' ? 'fade' : c.anim, c.frame, c.fps, c.dur);
  return (
    <Box c={{ ...c, anim: 'cut' }} w={1000}>
      <div style={{ fontFamily: 'Caveat, cursive', fontSize: 190 * (c.props.size || 1), color: c.props.color || '#F6B8D6', transform: `rotate(${c.props.rotate ?? -6}deg)`, clipPath: `inset(0 ${100 - prog}% 0 0)`, textShadow: '0 6px 24px rgba(0,0,0,.35)', opacity: ee.opacity, lineHeight: 1 }}>
        {c.props.text || 'davvero?'}
      </div>
    </Box>
  );
};

// 3) Interruttori stile iPhone che si accendono uno alla volta
const Pills: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: string[] = c.props.items || ['Un solo video', 'Effetti già pronti', 'Zero app di montaggio'];
  return (
    <Box c={c} w={760}>
      <div style={{ ...card, width: 760, padding: '26px 34px', borderRadius: 40 }}>
        {items.map((it, i) => {
          const on = interpolate(c.frame, [8 + i * 7, 13 + i * 7], [0, 1], clamp);
          const sp = spring({ frame: c.frame - i * 4, fps: c.fps, config: { damping: 14 } });
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < items.length - 1 ? '2px solid #EEE' : 'none', opacity: sp, transform: `translateX(${(1 - sp) * 60}px)` }}>
              <span style={{ fontSize: 50, fontWeight: 700 }}>{it}</span>
              <span style={{ width: 120, height: 70, borderRadius: 40, background: on > 0.5 ? c.props.color || '#34C759' : '#D8D8D8', position: 'relative', flex: 'none' }}>
                <span style={{ position: 'absolute', top: 6, left: 6 + on * 50, width: 58, height: 58, borderRadius: 40, background: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,.25)' }} />
              </span>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

// 4) Grafico a barre che cresce con numero grande
const BarChart: React.FC<{ c: FxCtx }> = ({ c }) => {
  const vals: number[] = (c.props.values || [12, 25, 41, 70, 100]).map(Number);
  const max = Math.max(...vals, 1);
  const g = interpolate(c.frame, [4, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const big = Math.round((c.props.to ?? vals[vals.length - 1]) * g);
  return (
    <Box c={c} w={900}>
      <div style={{ ...card, width: 900, padding: '30px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: '#666' }}>{c.props.label || 'Risultati'}</span>
          <span style={{ fontSize: 96, fontWeight: 800, color: c.P.primary }}>
            {big}
            {c.props.suffix || ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, height: 300, marginTop: 20 }}>
          {vals.map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${(v / max) * 100 * interpolate(c.frame, [4 + i * 3, 22 + i * 3], [0, 1], clamp)}%`, background: i === vals.length - 1 ? c.P.primary : c.P.accent, borderRadius: '16px 16px 6px 6px' }} />
          ))}
        </div>
      </div>
    </Box>
  );
};

// 5) Telefono con chat (messaggi che arrivano)
const PhoneChat: React.FC<{ c: FxCtx }> = ({ c }) => {
  const msgs: string[] = c.props.messages || ['Ciao Daniele! Ho visto il reel', '>Ciao! Scrivimi CORRO e ti mando la guida', 'CORRO 🏃'];
  return (
    <Box c={c} w={620}>
      <div style={{ width: 600, height: 860, borderRadius: 80, background: '#111', padding: 22, boxShadow: '0 30px 70px rgba(0,0,0,.5)' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 60, background: '#F4F1E5', overflow: 'hidden', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
          <div style={{ height: 120, background: '#fff', display: 'flex', alignItems: 'center', gap: 16, padding: '30px 28px 0', borderBottom: '2px solid #eee' }}>
            <div style={{ width: 64, height: 64, borderRadius: 40, background: c.P.primary }} />
            <b style={{ fontSize: 30 }}>{c.props.name || c.brand?.name || 'Correre Naturale'}</b>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {msgs.map((m, i) => {
              const mine = m.startsWith('>');
              const sp = spring({ frame: c.frame - 6 - i * 12, fps: c.fps, config: { damping: 14 } });
              return (
                <div key={i} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', background: mine ? c.P.primary : '#fff', color: mine ? '#fff' : '#111', fontSize: 30, fontWeight: 600, padding: '16px 22px', borderRadius: 30, transform: `scale(${sp})`, transformOrigin: mine ? 'right bottom' : 'left bottom', opacity: sp, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
                  {mine ? m.slice(1) : m}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Box>
  );
};

// 6) Box domande di Instagram
const QuestionBox: React.FC<{ c: FxCtx }> = ({ c }) => {
  const txt = c.props.text || 'Ogni quanto devo correre?';
  const n = Math.floor(interpolate(c.frame, [8, 8 + txt.length * 0.9], [0, txt.length], clamp));
  return (
    <Box c={c} w={760}>
      <div style={{ width: 720, borderRadius: 40, overflow: 'visible', position: 'relative', boxShadow: '0 22px 50px rgba(0,0,0,.35)' }}>
        <div style={{ position: 'absolute', top: -50, left: 310, width: 100, height: 100, borderRadius: 60, background: c.P.primary, border: '6px solid #fff' }} />
        <div style={{ background: c.props.bg || c.P.primary, color: '#fff', borderRadius: '40px 40px 0 0', padding: '70px 30px 30px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 46 }}>{c.props.title || 'Fammi una domanda'}</div>
        <div style={{ background: '#fff', borderRadius: '0 0 40px 40px', padding: '30px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 44, color: '#222', minHeight: 60 }}>
          {txt.slice(0, n)}
          <span style={{ opacity: n < txt.length ? 1 : 0 }}>|</span>
        </div>
      </div>
    </Box>
  );
};

// 7) Muro di titoli (headline wall) a tutto schermo
const TextWall: React.FC<{ c: FxCtx }> = ({ c }) => {
  const t = (c.props.text || 'CORRERE NATURALE').toUpperCase();
  const rows = 9;
  const out = interpolate(c.frame, [c.dur - 6, c.dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: c.props.background || 'rgba(0,0,0,.72)', overflow: 'hidden', opacity: out, justifyContent: 'center' }}>
      {Array.from({ length: rows }).map((_, i) => {
        const dir = i % 2 ? 1 : -1;
        const x = dir * (c.frame * 9) - 400;
        const hi = i === Math.floor(rows / 2);
        return (
          <div key={i} style={{ whiteSpace: 'nowrap', fontFamily: 'Anton, Impact, sans-serif', fontSize: 190, lineHeight: 1.05, color: hi ? c.P.accent : 'rgba(255,255,255,.18)', transform: `translateX(${x}px)` }}>
            {(t + ' · ').repeat(6)}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 8) Messaggio vocale (onda audio)
const VoicePill: React.FC<{ c: FxCtx }> = ({ c }) => (
  <Box c={c} w={760}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: c.props.color || c.P.primary, borderRadius: 80, padding: '24px 36px', boxShadow: '0 18px 40px rgba(0,0,0,.35)' }}>
      <div style={{ width: 80, height: 80, borderRadius: 50, background: '#fff', display: 'grid', placeItems: 'center', fontSize: 40, color: c.P.primary }}>▶</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 90 }}>
        {Array.from({ length: 26 }).map((_, i) => (
          <div key={i} style={{ width: 9, borderRadius: 6, background: '#fff', height: 14 + Math.abs(Math.sin(i * 1.7 + c.frame / 3)) * 66 }} />
        ))}
      </div>
      <span style={{ color: '#fff', fontSize: 40, fontWeight: 700 }}>{c.props.label || '0:12'}</span>
    </div>
  </Box>
);

// 9) Finestra app con righe che si scrivono
const AppWindow: React.FC<{ c: FxCtx }> = ({ c }) => {
  const lines: string[] = c.props.lines || ['Riscaldamento 10 min', 'Corsa lenta 30 min', 'Allunghi 4×20"'];
  return (
    <Box c={c} w={880}>
      <div style={{ width: 860, borderRadius: 30, overflow: 'hidden', background: '#fff', boxShadow: '0 26px 60px rgba(0,0,0,.4)', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ height: 70, background: '#ECECEC', display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px' }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((k) => (
            <span key={k} style={{ width: 22, height: 22, borderRadius: 20, background: k }} />
          ))}
          <b style={{ marginLeft: 20, fontSize: 30, color: '#444' }}>{c.props.title || 'Il tuo piano'}</b>
        </div>
        <div style={{ padding: '24px 36px' }}>
          {lines.map((l, i) => {
            const n = Math.floor(interpolate(c.frame, [6 + i * 10, 14 + i * 10], [0, l.length], clamp));
            return (
              <div key={i} style={{ fontSize: 44, fontWeight: 600, padding: '10px 0', color: '#111' }}>
                <span style={{ color: c.P.primary }}>›</span> {l.slice(0, n)}
              </div>
            );
          })}
        </div>
      </div>
    </Box>
  );
};

// 10) Barra di ricerca / prompt che si scrive
const SearchBar: React.FC<{ c: FxCtx }> = ({ c }) => {
  const txt = c.props.text || 'come correre senza dolore alle ginocchia';
  const n = Math.floor(interpolate(c.frame, [4, 4 + txt.length * 0.8], [0, txt.length], clamp));
  return (
    <Box c={c} w={960}>
      <div style={{ width: 940, display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 70, padding: '26px 34px', boxShadow: '0 20px 50px rgba(0,0,0,.35)', fontFamily: 'Inter, sans-serif' }}>
        <span style={{ fontSize: 46 }}>🔎</span>
        <span style={{ fontSize: 42, fontWeight: 600, color: '#222', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {txt.slice(0, n)}
          <span style={{ opacity: Math.floor(c.frame / 8) % 2 ? 0 : 1 }}>|</span>
        </span>
      </div>
    </Box>
  );
};

// 11) Traguardo sbloccato
const Unlock: React.FC<{ c: FxCtx }> = ({ c }) => {
  const glow = 20 + Math.sin(c.frame / 4) * 10;
  return (
    <Box c={c} w={880}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(15,20,15,.92)', color: '#fff', borderRadius: 40, padding: '24px 34px', boxShadow: `0 0 ${glow}px ${c.P.accent}` }}>
        <div style={{ width: 120, height: 120, borderRadius: 70, background: `radial-gradient(circle, ${c.P.accent}, ${c.P.primary})`, display: 'grid', placeItems: 'center', fontSize: 64 }}>{c.props.emoji || '🏅'}</div>
        <div>
          <div style={{ fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', color: c.P.accent, fontWeight: 800 }}>{c.props.title || 'Traguardo sbloccato'}</div>
          <div style={{ fontSize: 52, fontWeight: 800 }}>{c.props.text || 'Primi 5 km senza fermarti'}</div>
        </div>
      </div>
    </Box>
  );
};

// 12) Scarabocchio disegnato a mano (cerchio, sottolineatura, freccia)
const Doodle: React.FC<{ c: FxCtx }> = ({ c }) => {
  const x = (c.props.x ?? 0.5) * 1080;
  const y = (c.props.y ?? 0.6) * 1920;
  const w = (c.props.w ?? 0.5) * 1080;
  const h = (c.props.h ?? 0.12) * 1920;
  const prog = interpolate(c.frame, [0, 12], [0, 1], clamp);
  const out = interpolate(c.frame, [c.dur - 6, c.dur], [1, 0], clamp);
  const shape = c.props.shape || 'cerchio';
  const col = c.props.color || '#FFE14D';
  let d = '';
  if (shape === 'sottolinea') d = `M ${x - w / 2} ${y} C ${x - w / 4} ${y + 18}, ${x + w / 4} ${y - 14}, ${x + w / 2} ${y + 6}`;
  else if (shape === 'freccia') d = `M ${x - w / 2} ${y + h / 2} Q ${x - w / 6} ${y - h / 2}, ${x + w / 2} ${y - h / 4} M ${x + w / 2 - 50} ${y - h / 4 - 40} L ${x + w / 2} ${y - h / 4} L ${x + w / 2 - 40} ${y - h / 4 + 45}`;
  else d = `M ${x + w / 2} ${y} A ${w / 2} ${h / 2} 0 1 0 ${x + w / 2 - 6} ${y - 24}`;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={d} fill="none" stroke={col} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.4))' }} />
      </svg>
    </AbsoluteFill>
  );
};

// 13) Banner fisso in alto (titolo del capitolo che resta)
const TopBanner: React.FC<{ c: FxCtx }> = ({ c }) => {
  const sp = spring({ frame: c.frame, fps: c.fps, config: { damping: 200 } });
  const out = interpolate(c.frame, [c.dur - 6, c.dur], [1, 0], clamp);
  return (
    <div style={{ position: 'absolute', top: 150 + (1 - sp) * -200, left: 60, right: 60, display: 'flex', justifyContent: 'center', opacity: out }}>
      <div style={{ background: c.props.color || c.P.primary, color: '#fff', fontFamily: 'Blinker', fontWeight: 800, fontSize: 52, padding: '16px 36px', borderRadius: 18, boxShadow: '0 12px 30px rgba(0,0,0,.3)', textAlign: 'center' }}>
        <Emph text={c.props.text || 'Errore n°1: il *tallone*'} color={c.P.accent} c={c} />
      </div>
    </div>
  );
};

// 14) B-roll dallo stesso video (stacco a tutto schermo su un altro momento)
const BRoll: React.FC<{ c: FxCtx }> = ({ c }) => {
  const t = c.props.t ?? 0;
  const z = (c.props.z0 ?? 1) + (c.props.zoom ?? 0.08) * (c.frame / Math.max(1, c.dur));
  const pxNow = c.props.px1 !== undefined ? interpolate(c.frame, [0, c.props.pxAt ? c.props.pxAt * c.fps : c.dur], [c.props.px ?? 0.5, c.props.px1], clamp) : c.props.px ?? 0.5;
  const op = `${pxNow * 100}% ${(c.props.py ?? 0.5) * 100}%`;
  // props.hard: stacco netto (sostituisce l'immagine sotto senza dissolvenza)
  // props.fin / props.fout = fotogrammi di dissolvenza in entrata / uscita (0 = stacco netto, per B-roll attaccati)
  const fi = c.props.hard ? 0 : c.props.fin ?? 4;
  const fo = c.props.hard ? 0 : c.props.fout ?? 4;
  const inn = fi ? interpolate(c.frame, [0, fi], [0, 1], clamp) : 1;
  const out = fo ? interpolate(c.frame, [c.dur - fo, c.dur], [1, 0], clamp) : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn, out), overflow: 'hidden', background: '#000', filter: c.props.gray ? 'grayscale(1) contrast(1.12)' : undefined }}>
      <Sequence from={0} layout="none">
        {c.props.src ? (
          <OffthreadVideo src={c.props.src.startsWith('/') ? c.assetBase + c.props.src : c.props.src} muted trimBefore={Math.round((c.props.from || 0) * c.fps)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: op, transformOrigin: op, transform: `scale(${z})` }} />
        ) : (
          <OffthreadVideo src={c.videoUrl} muted trimBefore={Math.round(t * c.fps)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: op, transformOrigin: op, transform: `scale(${z})` }} />
        )}
      </Sequence>
      {c.props.label ? <div style={{ position: 'absolute', bottom: 520, left: 60, background: '#fff', color: '#111', fontFamily: 'Blinker', fontWeight: 800, fontSize: 46, padding: '10px 24px', borderRadius: 14 }}>{c.props.label}</div> : null}
    </AbsoluteFill>
  );
};

// 15) Finestrella picture-in-picture con un altro momento del video
const Pip: React.FC<{ c: FxCtx }> = ({ c }) => {
  const t = c.props.t ?? 0;
  const sp = spring({ frame: c.frame, fps: c.fps, config: { damping: 14 } });
  const out = interpolate(c.frame, [c.dur - 6, c.dur], [1, 0], clamp);
  const w = 1080 * (c.props.size ?? 0.42);
  return (
    <div style={{ position: 'absolute', left: (c.props.x ?? 0.52) * 1080, top: (c.props.y ?? 0.5) * 1920, width: w, height: w * 1.3, borderRadius: 34, overflow: 'hidden', border: '8px solid #fff', boxShadow: '0 20px 50px rgba(0,0,0,.45)', transform: `scale(${sp * out}) rotate(${c.props.rotate ?? 4}deg)` }}>
      <Sequence from={0} layout="none">
        <OffthreadVideo src={c.videoUrl} muted trimBefore={Math.round(t * c.fps)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
    </div>
  );
};

// 16) Riflettore: scurisce tutto tranne un cerchio
const Spotlight: React.FC<{ c: FxCtx }> = ({ c }) => {
  const x = (c.props.x ?? 0.5) * 100;
  const y = (c.props.y ?? 0.35) * 100;
  const r = interpolate(c.frame, [0, 10], [80, c.props.r ?? 26], clamp);
  const out = interpolate(c.frame, [c.dur - 6, c.dur], [1, 0], clamp);
  return <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, rgba(0,0,0,0) ${r}%, rgba(0,0,0,.78) ${r + 6}%)`, opacity: out }} />;
};

// 17) Provino a griglia (contact sheet) con fermo immagine
const ContactSheet: React.FC<{ c: FxCtx }> = ({ c }) => {
  const n = 9;
  return (
    <Box c={c} w={960}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 300px)', gap: 14, background: '#fff', padding: 16, borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,.45)' }}>
        {Array.from({ length: n }).map((_, i) => {
          const sp = spring({ frame: c.frame - i * 2, fps: c.fps, config: { damping: 14 } });
          const t = c.srcAt(Math.max(0, c.start - 8 + i * 1.6));
          return (
            <div key={i} style={{ width: 300, height: 300, overflow: 'hidden', background: '#ccc', transform: `scale(${sp})` }}>
              <Freeze frame={Math.round(t * c.fps)}>
                <OffthreadVideo src={c.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Freeze>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

// 18) Giusto / Sbagliato in due colonne
const RightWrong: React.FC<{ c: FxCtx }> = ({ c }) => {
  const L: string[] = c.props.wrong || ['Passo lungo', 'Tallone avanti'];
  const R: string[] = c.props.right || ['Passo corto', 'Piede sotto il bacino'];
  const col = (items: string[], ok: boolean, d: number) => (
    <div style={{ flex: 1, background: ok ? '#E9F5E1' : '#FDE8E6', borderRadius: 28, padding: '22px 24px' }}>
      <div style={{ fontWeight: 800, fontSize: 40, color: ok ? '#2F6B1E' : '#C2361F', marginBottom: 10 }}>{ok ? '✓ GIUSTO' : '✗ SBAGLIATO'}</div>
      {items.map((it, i) => {
        const sp = spring({ frame: c.frame - d - i * 6, fps: c.fps, config: { damping: 14 } });
        return (
          <div key={i} style={{ fontSize: 40, fontWeight: 700, padding: '8px 0', opacity: sp, transform: `translateY(${(1 - sp) * 20}px)` }}>
            {it}
          </div>
        );
      })}
    </div>
  );
  return (
    <Box c={c} w={980}>
      <div style={{ ...card, width: 980, display: 'flex', gap: 18, padding: 22 }}>
        {col(L, false, 4)}
        {col(R, true, 14)}
      </div>
    </Box>
  );
};

// immagine generata con l'AI
const AiImage: React.FC<{ c: FxCtx }> = ({ c }) => {
  const inn = interpolate(c.frame, [0, 5], [0, 1], clamp);
  const out = interpolate(c.frame, [c.dur - 5, c.dur], [1, 0], clamp);
  const z = 1 + 0.08 * (c.frame / Math.max(1, c.dur));
  const src = c.props.src?.startsWith('/') ? c.assetBase + c.props.src : c.props.src;
  if (!src) return null;
  if (c.props.mode === 'finestra') {
    const sp = spring({ frame: c.frame, fps: c.fps, config: { damping: 13 } });
    return (
      <div style={{ position: 'absolute', left: 140, right: 140, top: placeTop(c, 380, 900), transform: `scale(${sp * out}) rotate(${c.props.rotate ?? -3}deg)`, background: '#fff', padding: 18, borderRadius: 30, boxShadow: '0 30px 70px rgba(0,0,0,.45)' }}>
        <Img src={src} style={{ width: '100%', borderRadius: 18, display: 'block' }} />
      </div>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn, out), background: '#000', overflow: 'hidden' }}>
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})` }} />
    </AbsoluteFill>
  );
};
// clip video generata con l'AI
const AiClip: React.FC<{ c: FxCtx }> = ({ c }) => {
  const inn = interpolate(c.frame, [0, 4], [0, 1], clamp);
  const out = interpolate(c.frame, [c.dur - 4, c.dur], [1, 0], clamp);
  const src = c.props.src?.startsWith('/') ? c.assetBase + c.props.src : c.props.src;
  if (!src) return null;
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn, out), background: '#000' }}>
      <Sequence from={0} layout="none">
        <OffthreadVideo src={src} muted={!c.props.audio} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
    </AbsoluteFill>
  );
};
// scritta gigante che passa DIETRO la persona (la persona scontornata viene disegnata sopra in Reel.tsx)
const CutoutText: React.FC<{ c: FxCtx }> = ({ c }) => {
  const sp = spring({ frame: c.frame, fps: c.fps, config: { damping: 14, stiffness: 120 } });
  const out = interpolate(c.frame, [c.dur - 6, c.dur], [1, 0], clamp);
  const txt = String(c.props.text || 'CORRI').toUpperCase();
  const f = c.props.font ? TITLE_FONTS[c.props.font] || tf(c) : TITLE_FONTS.bebas || tf(c);
  const size = (c.props.size || 1) * Math.min(520, 2300 / Math.max(3, txt.length));
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', opacity: out }}>
      <div style={{ position: 'absolute', top: (c.props.y ?? 0.2) * 1920, width: '100%', textAlign: 'center', fontFamily: f.css, fontWeight: f.weight as any, fontSize: size, lineHeight: 0.9, color: c.props.color || c.P.accent, transform: `translateY(${(1 - sp) * 200}px) scale(${0.8 + 0.2 * sp})`, letterSpacing: -2, textShadow: '0 10px 40px rgba(0,0,0,.35)' }}>{txt}</div>
    </AbsoluteFill>
  );
};


// parola gigante che si infrange come vetro
const ShatterWord: React.FC<{ c: FxCtx }> = ({ c }) => {
  const txt = String(c.props.text || 'STOP').toUpperCase();
  const f = c.props.font ? TITLE_FONTS[c.props.font] || tf(c) : TITLE_FONTS.bebas || tf(c);
  const inn = spring({ frame: c.frame, fps: c.fps, config: { damping: 10, stiffness: 200 } });
  const brAt = Math.round(c.dur * 0.55);
  const br = Math.max(0, (c.frame - brAt) / 14);
  const size = Math.min(380, 2000 / Math.max(3, txt.length)) * (c.props.size || 1);
  const pieces = Array.from({ length: 9 }, (_, j) => {
    const cx = (j % 3) * 33.3, cy = Math.floor(j / 3) * 33.3;
    return { poly: `${cx}% ${cy}%, ${cx + 36}% ${cy + 4}%, ${cx + 33}% ${cy + 36}%, ${cx - 2}% ${cy + 32}%`, dx: (j % 3) - 1 + 0.3 * Math.sin(j * 7), dy: Math.floor(j / 3) - 1 + 0.3 * Math.cos(j * 5), rot: ((j * 47) % 60) - 30 };
  });
  const top = placeTop(c, POS[c.position] ?? POS.top, size * 1.1);
  const style: React.CSSProperties = { fontFamily: f.css, fontWeight: f.weight as any, fontSize: size, lineHeight: 1, color: c.props.color || '#fff', textShadow: '0 10px 40px rgba(0,0,0,.45)', letterSpacing: 2 };
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * inn})` }}>
      <div style={{ position: 'relative' }}>
        <div style={{ ...style, visibility: br > 0 ? 'hidden' : 'visible' }}>{txt}</div>
        {br > 0
          ? pieces.map((pc, j) => (
              <div key={j} style={{ ...style, position: 'absolute', left: 0, top: 0, clipPath: `polygon(${pc.poly})`, transform: `translate(${pc.dx * br * 220}px, ${pc.dy * br * 160 + br * br * 400}px) rotate(${pc.rot * br}deg)`, opacity: Math.max(0, 1 - br * 0.7) }}>
                {txt}
              </div>
            ))
          : null}
        {br > 0 && br < 0.6 ? <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(circle, rgba(255,255,255,.7), transparent 60%)', opacity: 1 - br / 0.6 }} /> : null}
      </div>
    </div>
  );
};
// fotogramma che si spezza in schegge e rivela il video che continua sotto
const FrameBreak: React.FC<{ c: FxCtx }> = ({ c }) => {
  const t = c.srcAt(c.start);
  const br = Math.max(0, (c.frame - 4) / Math.max(8, c.dur - 4));
  const shards = [
    '0% 0%, 45% 0%, 38% 42%, 0% 30%', '45% 0%, 100% 0%, 100% 35%, 38% 42%', '0% 30%, 38% 42%, 30% 75%, 0% 70%',
    '38% 42%, 100% 35%, 100% 68%, 62% 60%', '30% 75%, 38% 42%, 62% 60%, 55% 100%, 0% 100%, 0% 70%', '62% 60%, 100% 68%, 100% 100%, 55% 100%',
  ];
  return (
    <AbsoluteFill>
      {shards.map((poly, j) => {
        const dx = [-1, 1, -1.2, 1.2, -0.4, 0.8][j], dy = [-1, -1.1, 0.2, 0.1, 1, 1.1][j];
        return (
          <div key={j} style={{ position: 'absolute', inset: 0, clipPath: `polygon(${poly})`, transform: `translate(${dx * br * 700}px, ${dy * br * 500 + br * br * 900}px) rotate(${dx * br * 35}deg) scale(${1 - br * 0.15})`, opacity: 1 - Math.max(0, br - 0.6) * 2.5, filter: br > 0 ? 'drop-shadow(0 0 6px rgba(255,255,255,.9))' : undefined }}>
            {c.props.img ? (
              <Img src={c.assetBase + c.props.img} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(c.props.px ?? 0.5) * 100}% 50%` }} />
            ) : (
              <Freeze frame={Math.round(t * c.fps)}>
                <OffthreadVideo src={c.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Freeze>
            )}
          </div>
        );
      })}
      {c.frame < 6 && !c.props.noflash ? <AbsoluteFill style={{ background: '#fff', opacity: (6 - c.frame) / 8 }} /> : null}
    </AbsoluteFill>
  );
};
// il fotogramma si scompone in tessere che volano verso lo spettatore (dispersione in profondità)
const DepthScatter: React.FC<{ c: FxCtx }> = ({ c }) => {
  const t = c.srcAt(c.start);
  const k = Math.min(1, c.frame / Math.max(1, c.dur));
  const N = 5;
  return (
    <AbsoluteFill style={{ perspective: 1400 }}>
      {Array.from({ length: N * N }, (_, j) => {
        const x = (j % N) / N, y = Math.floor(j / N) / N;
        const delay = ((j * 37) % 11) / 22;
        const p = Math.max(0, (k - delay) / (1 - delay));
        const z = p * p * (900 + ((j * 53) % 700));
        return (
          <div key={j} style={{ position: 'absolute', inset: 0, clipPath: `inset(${y * 100}% ${100 - (x + 1 / N) * 100}% ${100 - (y + 1 / N) * 100}% ${x * 100}%)`, transform: `translate3d(${(x - 0.4) * p * 400}px, ${(y - 0.4) * p * 500}px, ${z}px) rotateY(${(x - 0.5) * p * 60}deg)`, opacity: 1 - Math.max(0, p - 0.5) * 2, filter: `blur(${p * 6}px)` }}>
            <Freeze frame={Math.round(t * c.fps)}>
              <OffthreadVideo src={c.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Freeze>
          </div>
        );
      })}
      {c.props.text ? (
        <div style={{ position: 'absolute', top: 820, left: 60, right: 60, textAlign: 'center', fontFamily: (TITLE_FONTS.bebas || tf(c)).css, fontSize: 150, color: c.props.color || '#fff', opacity: Math.min(1, k * 2), textShadow: '0 10px 40px rgba(0,0,0,.6)' }}>{String(c.props.text).toUpperCase()}</div>
      ) : null}
    </AbsoluteFill>
  );
};
// il video diventa fatto di caratteri (effetto ASCII)
const AsciiFx: React.FC<{ c: FxCtx }> = ({ c }) => {
  const cell = Math.round(22 * (c.props.size || 1));
  const cols = Math.ceil(1080 / cell), rows = Math.ceil(1920 / cell);
  const set = '@#%8$WM*+=-:. 01';
  const seed = Math.floor(c.frame / 3);
  let txt = '';
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let q = 0; q < cols; q++) line += set[(r * 131 + q * 71 + seed * 17 + ((r * q) % 7)) % (set.length - 3)];
    txt += `<text x='0' y='${(r + 1) * cell}'>${line}</text>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'><style>text{font:bold ${cell}px monospace;fill:#fff;letter-spacing:${cell * 0.4}px}</style>${txt}</svg>`;
  const mask = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  const fade = Math.min(1, c.frame / 6, (c.dur - c.frame) / 6);
  return (
    <AbsoluteFill style={{ opacity: Math.max(0, fade) }}>
      <AbsoluteFill style={{ background: '#050805' }} />
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' } as any}>
        <OffthreadVideo src={c.videoUrl} muted startFrom={Math.round(c.srcAt(c.start) * c.fps)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `contrast(1.6) brightness(1.3) ${c.props.color === 'verde' || !c.props.color ? 'sepia(1) hue-rotate(50deg) saturate(3)' : ''}` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// fermo immagine con icona pausa ("pause point")
const PausePoint: React.FC<{ c: FxCtx }> = ({ c }) => {
  const sp = spring({ frame: c.frame, fps: c.fps, config: { damping: 12 } });
  const t = c.srcAt(c.start);
  return (
    <AbsoluteFill>
      <Freeze frame={Math.round(t * c.fps)}>
        <OffthreadVideo src={c.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.6) brightness(.8)' }} />
      </Freeze>
      <div style={{ position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, transform: `scale(${sp})` }}>
        <div style={{ width: 200, height: 200, borderRadius: 110, background: 'rgba(255,255,255,.92)', display: 'flex', gap: 26, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 30, height: 90, background: '#111', borderRadius: 6 }} />
          <span style={{ width: 30, height: 90, background: '#111', borderRadius: 6 }} />
        </div>
        <div style={{ background: '#fff', color: '#111', fontFamily: 'Blinker', fontWeight: 800, fontSize: 60, padding: '12px 30px', borderRadius: 20 }}>
          <Emph text={c.props.text || 'Guarda *qui*'} color={c.P.primary} c={c} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
// "Uninstall": barra di disinstallazione di una cattiva abitudine
const Uninstall: React.FC<{ c: FxCtx }> = ({ c }) => {
  const v = interpolate(c.frame, [6, c.dur - 10], [0, 1], clamp);
  return (
    <Box c={c} w={860}>
      <div style={{ ...card, width: 820, borderRadius: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 90, height: 90, borderRadius: 22, background: '#E2572B', display: 'grid', placeItems: 'center', fontSize: 50 }}>{c.props.emoji || '🦶'}</div>
          <div>
            <div style={{ fontSize: 30, color: '#888', fontWeight: 700 }}>{v < 1 ? 'Disinstallazione in corso…' : 'Disinstallato ✓'}</div>
            <div style={{ fontSize: 48, fontWeight: 800 }}>{c.props.text || 'Appoggio di tallone'}</div>
          </div>
        </div>
        <div style={{ height: 22, background: '#eee', borderRadius: 20, marginTop: 22, overflow: 'hidden' }}>
          <div style={{ width: `${v * 100}%`, height: '100%', background: v < 1 ? '#E2572B' : c.P.primary }} />
        </div>
      </div>
    </Box>
  );
};
// icona che trema e viene cancellata ("jiggle delete")
const JiggleDelete: React.FC<{ c: FxCtx }> = ({ c }) => {
  const del = c.frame > c.dur * 0.6;
  const k = del ? spring({ frame: c.frame - Math.round(c.dur * 0.6), fps: c.fps, config: { damping: 200 } }) : 0;
  const items: string[] = c.props.items || ['Scarpe ammortizzate', 'Passo lungo', 'Tallone'];
  return (
    <Box c={c} w={960}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {items.map((it, i) => {
          const victim = i === (c.props.del ?? 0);
          return (
            <div key={i} style={{ position: 'relative', background: '#fff', borderRadius: 30, padding: '24px 30px', fontFamily: 'Blinker', fontWeight: 800, fontSize: 44, boxShadow: '0 12px 30px rgba(0,0,0,.25)', transform: `rotate(${Math.sin(c.frame / 1.6 + i) * 3}deg) scale(${victim ? 1 - k : 1})`, opacity: victim ? 1 - k : 1 }}>
              <span style={{ position: 'absolute', top: -16, left: -16, width: 46, height: 46, borderRadius: 30, background: '#888', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 30 }}>−</span>
              {it}
            </div>
          );
        })}
      </div>
    </Box>
  );
};
// griglia "bento" di schede
const Bento: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: string[] = c.props.items || ['⏱ 3 min in meno', '🦶 Appoggio sotto il bacino', '❤️ Meno fatica', '🏃 Passo corto'];
  return (
    <Box c={c} w={980}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, width: 960 }}>
        {items.map((it, i) => {
          const sp = spring({ frame: c.frame - i * 4, fps: c.fps, config: { damping: 13 } });
          return (
            <div key={i} style={{ background: i % 3 === 0 ? c.P.primary : '#fff', color: i % 3 === 0 ? '#fff' : '#111', borderRadius: 30, padding: '30px 26px', fontFamily: 'Blinker', fontWeight: 800, fontSize: 46, gridColumn: i === 0 ? 'span 2' : undefined, transform: `scale(${sp})`, boxShadow: '0 12px 30px rgba(0,0,0,.2)' }}>
              {it}
            </div>
          );
        })}
      </div>
    </Box>
  );
};
// oscilloscopio / battito
const Oscilloscope: React.FC<{ c: FxCtx }> = ({ c }) => {
  const pts = Array.from({ length: 80 }, (_, i) => {
    const x = (i / 79) * 900;
    const ph = i / 6 - c.frame / 3;
    const beat = i % 20 === 10 ? -120 : i % 20 === 11 ? 90 : 0;
    return `${x},${120 + Math.sin(ph) * 14 + beat * Math.min(1, c.frame / 10)}`;
  }).join(' ');
  return (
    <Box c={c} w={980}>
      <div style={{ background: 'rgba(5,20,8,.85)', borderRadius: 30, padding: 24, width: 940 }}>
        <svg width={900} height={240}>
          <polyline points={pts} fill="none" stroke="#8BE36A" strokeWidth={6} style={{ filter: 'drop-shadow(0 0 8px #8BE36A)' }} />
        </svg>
        <div style={{ color: '#8BE36A', fontFamily: 'JBMono, monospace', fontSize: 40, fontWeight: 700 }}>{c.props.text || '♥ 142 bpm · zona 2'}</div>
      </div>
    </Box>
  );
};

// ======================= ELEMENTI LIBERI (stile Canva): testo, forme, icone, immagini =======================
export const SHAPES: Record<string, [string, string]> = {
  rettangolo: ['Rettangolo', 'M0 0H100V100H0Z'],
  arrotondato: ['Rettangolo arrotondato', 'M18 0H82Q100 0 100 18V82Q100 100 82 100H18Q0 100 0 82V18Q0 0 18 0Z'],
  cerchio: ['Cerchio', 'M50 0A50 50 0 1 1 49.99 0Z'],
  triangolo: ['Triangolo', 'M50 0L100 100H0Z'],
  rombo: ['Rombo', 'M50 0L100 50L50 100L0 50Z'],
  pentagono: ['Pentagono', 'M50 0L100 38L81 100H19L0 38Z'],
  esagono: ['Esagono', 'M25 0H75L100 50L75 100H25L0 50Z'],
  stella: ['Stella', 'M50 0L61 35H98L68 57L79 92L50 70L21 92L32 57L2 35H39Z'],
  cuore: ['Cuore', 'M50 92C20 70 0 52 0 30C0 12 14 0 28 0C38 0 46 6 50 14C54 6 62 0 72 0C86 0 100 12 100 30C100 52 80 70 50 92Z'],
  fumetto: ['Fumetto', 'M12 0H88Q100 0 100 12V64Q100 76 88 76H40L18 98L22 76H12Q0 76 0 64V12Q0 0 12 0Z'],
  freccia: ['Freccia', 'M0 35H60V10L100 50L60 90V65H0Z'],
  frecciasu: ['Freccia su', 'M50 0L90 40H65V100H35V40H10Z'],
  spunta: ['Spunta', 'M8 52L22 38L40 56L80 14L94 28L40 84Z'],
  croce: ['Croce', 'M20 6L50 36L80 6L94 20L64 50L94 80L80 94L50 64L20 94L6 80L36 50L6 20Z'],
  piu: ['Più', 'M38 0H62V38H100V62H62V100H38V62H0V38H38Z'],
  pillola: ['Pillola', 'M30 20H70A30 30 0 0 1 70 80H30A30 30 0 0 1 30 20Z'],
  scoppio: ['Scoppio', 'M50 0L58 22L80 8L74 32L100 34L80 50L100 66L74 68L80 92L58 78L50 100L42 78L20 92L26 68L0 66L20 50L0 34L26 32L20 8L42 22Z'],
  onda: ['Onda', 'M0 40Q25 10 50 40T100 40V100H0Z'],
  linea: ['Linea', 'M0 46H100V54H0Z'],
  cornice: ['Cornice', 'M0 0H100V100H0ZM8 8V92H92V8Z'],
};
const OBJ_SHADOW: Record<string, string> = { no: 'none', morbida: '0 12px 30px rgba(0,0,0,.35)', dura: '8px 8px 0 #0B0F0A', bagliore: '0 0 24px rgba(184,215,234,.95)' };
const objAnim = (pr: any, frame: number, fps: number, dur: number) => {
  const sp = (d = 12, st = 160) => spring({ frame, fps, config: { damping: d, stiffness: st } });
  const inF = Math.max(4, Math.round((pr.inSpeed || 1) * 12));
  const k = Math.min(1, frame / inF);
  const ease = Easing.out(Easing.cubic)(k);
  let tr = '';
  let op = 1;
  let clip: string | undefined;
  switch (pr.inA || 'pop') {
    case 'pop': tr += ` scale(${0.3 + 0.7 * sp(9, 180)})`; op = Math.min(1, frame / 3); break;
    case 'fade': op = ease; break;
    case 'slideUp': tr += ` translateY(${(1 - ease) * 160}px)`; op = ease; break;
    case 'slideDown': tr += ` translateY(${(1 - ease) * -160}px)`; op = ease; break;
    case 'slideLeft': tr += ` translateX(${(1 - ease) * 300}px)`; op = ease; break;
    case 'slideRight': tr += ` translateX(${(1 - ease) * -300}px)`; op = ease; break;
    case 'zoom': tr += ` scale(${2 - ease})`; op = ease; break;
    case 'rotate': tr += ` rotate(${(1 - sp()) * -90}deg) scale(${0.4 + 0.6 * sp()})`; op = Math.min(1, frame / 4); break;
    case 'bounce': { const b = spring({ frame, fps, config: { damping: 6, stiffness: 140 } }); tr += ` translateY(${(1 - b) * -260}px)`; break; }
    case 'wipe': clip = `inset(0 ${(1 - ease) * 100}% 0 0)`; break;
    case 'blur': op = ease; break;
    case 'none': break;
  }
  const outF = Math.max(4, Math.round((pr.outSpeed || 1) * 10));
  const ko = Math.min(1, Math.max(0, (frame - (dur - outF)) / outF));
  switch (pr.outA || 'fade') {
    case 'fade': op *= 1 - ko; break;
    case 'slideDown': tr += ` translateY(${ko * 160}px)`; op *= 1 - ko; break;
    case 'slideUp': tr += ` translateY(${-ko * 160}px)`; op *= 1 - ko; break;
    case 'zoomOut': tr += ` scale(${1 - ko})`; break;
    case 'slideLeft': tr += ` translateX(${-ko * 400}px)`; op *= 1 - ko; break;
    case 'none': break;
  }
  const t = frame / fps;
  switch (pr.loopA || 'none') {
    case 'pulse': tr += ` scale(${1 + 0.06 * Math.sin(t * 6)})`; break;
    case 'float': tr += ` translateY(${Math.sin(t * 3) * 14}px)`; break;
    case 'spin': tr += ` rotate(${t * 90}deg)`; break;
    case 'wiggle': tr += ` rotate(${Math.sin(t * 9) * 5}deg)`; break;
    case 'blink': op *= 0.55 + 0.45 * (Math.sin(t * 8) > 0 ? 1 : 0.2); break;
    case 'shake': tr += ` translateX(${Math.sin(t * 40) * 5}px)`; break;
  }
  const blur = (pr.inA === 'blur' ? (1 - ease) * 20 : 0);
  return { tr, op, clip, blur, k: ease };
};
const ObjFx: React.FC<{ c: FxCtx }> = ({ c }) => {
  const pr = c.props || {};
  const a = objAnim(pr, c.frame, c.fps, c.dur);
  const kind = pr.kind || 'text';
  const x = (pr.x ?? 0.5) * 1080;
  const y = (pr.y ?? 0.5) * 1920;
  const w = pr.w || (kind === 'text' ? 900 : 400);
  const h = pr.h || (kind === 'text' ? undefined : kind === 'image' ? undefined : 400);
  const fontCss = pr.font ? (TITLE_FONTS[pr.font]?.css || pr.font) : (TITLE_FONTS[c.titleFont] || TITLE_FONTS.brand).css;
  const fill = pr.fill2 ? `url(#g-${pr.uid || 'o'})` : pr.fill || '#49762E';
  let inner: React.ReactNode = null;
  if (kind === 'text') {
    let txt = String(pr.text ?? 'Testo');
    if (pr.inA === 'type') txt = txt.slice(0, Math.floor(Math.min(1, c.frame / Math.max(1, (pr.inSpeed || 1) * 30)) * txt.length));
    const parts = parseEmph(txt);
    inner = (
      <div style={{ width: w, fontFamily: fontCss, fontSize: pr.size || 90, fontWeight: pr.bold === false ? 400 : pr.weight || 800, fontStyle: pr.italic ? 'italic' : 'normal', textDecoration: pr.underline ? 'underline' : 'none', textTransform: pr.upper ? 'uppercase' : 'none', letterSpacing: (pr.letter || 0) + 'px', lineHeight: pr.lineH || 1.08, textAlign: pr.align || 'center', color: pr.color || '#FFFFFF', WebkitTextStroke: pr.strokeW ? `${pr.strokeW}px ${pr.strokeColor || '#0B0F0A'}` : undefined, paintOrder: 'stroke fill' as any, textShadow: pr.shadow && pr.shadow !== 'no' ? OBJ_SHADOW[pr.shadow] : undefined, background: pr.bg || undefined, padding: pr.bg ? `${pr.bgPad ?? 14}px ${(pr.bgPad ?? 14) * 1.6}px` : undefined, borderRadius: pr.bgRadius ?? 18, boxDecorationBreak: 'clone' as any, WebkitBoxDecorationBreak: 'clone' as any, whiteSpace: 'pre-wrap' }}>
        {parts.map((q, i) => (
          <span key={i} style={q.e ? { color: pr.emphColor || c.P.accent } : undefined}>
            {q.t}
          </span>
        ))}
      </div>
    );
  } else if (kind === 'shape') {
    const d = SHAPES[pr.shape || 'arrotondato']?.[1] || SHAPES.rettangolo[1];
    inner = (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width={w} height={h} style={{ overflow: 'visible', filter: pr.shadow && pr.shadow !== 'no' ? `drop-shadow(${OBJ_SHADOW[pr.shadow].replace(/,.*$/, '')})` : undefined }}>
        {pr.fill2 ? (
          <defs>
            <linearGradient id={`g-${pr.uid || 'o'}`} x1="0" y1="0" x2={pr.gradDir === 'v' ? '0' : '1'} y2={pr.gradDir === 'v' ? '1' : '0'}>
              <stop offset="0" stopColor={pr.fill || '#49762E'} />
              <stop offset="1" stopColor={pr.fill2} />
            </linearGradient>
          </defs>
        ) : null}
        <path d={d} fill={pr.noFill ? 'none' : fill} fillRule="evenodd" stroke={pr.strokeW ? pr.strokeColor || '#0B0F0A' : 'none'} strokeWidth={pr.strokeW ? (pr.strokeW * 100) / Math.max(40, Math.min(w, h || w)) : 0} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
    );
  } else {
    const src = pr.src && String(pr.src).startsWith('/') ? c.assetBase + pr.src : pr.src;
    if (pr.tint && /\.svg(\?|$)/i.test(String(pr.src))) {
      inner = <div style={{ width: w, height: h || w, background: pr.tint, WebkitMaskImage: `url("${src}")`, maskImage: `url("${src}")`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' } as any} />;
    } else inner = src ? <Img src={src} style={{ width: w, height: h || 'auto', objectFit: pr.fit || 'contain', borderRadius: pr.radius || 0, border: pr.borderW ? `${pr.borderW}px solid ${pr.borderColor || '#fff'}` : undefined, boxShadow: pr.shadow && pr.shadow !== 'no' ? OBJ_SHADOW[pr.shadow] : undefined }} /> : null;
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${pr.rot || 0}deg)${a.tr}`, opacity: a.op * (pr.opacity ?? 1), clipPath: a.clip, filter: a.blur ? `blur(${a.blur}px)` : undefined, transformOrigin: 'center' }}>{inner}</div>
  );
};


export const FX_EXTRA: Record<string, any> = {
  shatterWord: { name: 'Parola che si infrange (vetro)', cat: 'Testo gigante', dur: 1.8, sfx: 'impatto', anim: 'cut', pos: 'top', props: { text: 'STOP', size: 1 }, fields: [{ k: 'text', label: 'Parola' }, { k: 'size', label: 'Grandezza', type: 'number' }, { k: 'color', label: 'Colore' }], C: ShatterWord },
  frameBreak: { name: 'Fotogramma che si spezza', cat: 'Transizioni', dur: 1.2, sfx: 'impatto', anim: 'cut', pos: 'center', props: {}, fields: [], C: FrameBreak, full: true },
  depthScatter: { name: 'Dispersione in profondità', cat: 'Transizioni', dur: 1.4, sfx: 'whoosh', anim: 'cut', pos: 'center', props: { text: '' }, fields: [{ k: 'text', label: 'Parola (facoltativa)' }, { k: 'color', label: 'Colore' }], C: DepthScatter, full: true },
  ascii: { name: 'Video in caratteri (ASCII)', cat: 'Filtri colore', dur: 1.5, sfx: 'glitch', anim: 'cut', pos: 'center', props: { size: 1 }, fields: [{ k: 'size', label: 'Grandezza caratteri', type: 'number' }, { k: 'color', label: 'Colore (verde / originale)' }], C: AsciiFx, full: true },
  obj: { name: 'Elemento libero', cat: 'Elementi', dur: 3, sfx: undefined as any, anim: 'cut', pos: 'center', props: { kind: 'text', text: 'Testo', x: 0.5, y: 0.5 }, fields: [], C: ObjFx },
  pausePoint: { name: 'Pausa (fermo immagine)', cat: 'Visual hook', dur: 1.6, sfx: 'stop-disco', anim: 'cut', pos: 'center', props: { text: 'Guarda *qui*' }, fields: [{ k: 'text', label: 'Testo (*enfasi*)' }], C: PausePoint, full: true },
  uninstall: { name: 'Disinstalla abitudine', cat: 'Schede & UI', dur: 3, sfx: 'tastiera', anim: 'pop', pos: 'upper', props: { text: 'Appoggio di tallone', emoji: '🦶' }, fields: [{ k: 'text', label: 'Abitudine' }, { k: 'emoji', label: 'Emoji' }], C: Uninstall },
  jiggleDelete: { name: 'Icone che tremano e una sparisce', cat: 'Schede & UI', dur: 2.6, sfx: 'pop', anim: 'pop', pos: 'upper', props: { items: ['Scarpe ammortizzate', 'Passo lungo', 'Tallone'], del: 0 }, fields: [{ k: 'items', label: 'Voci (una per riga)', type: 'lines' }, { k: 'del', label: 'Quale sparisce (0 = prima)', type: 'number' }], C: JiggleDelete },
  bento: { name: 'Griglia bento', cat: 'Schede & UI', dur: 3, sfx: 'click', anim: 'pop', pos: 'upper', props: { items: ['⏱ 3 min in meno', '🦶 Appoggio sotto il bacino', '❤️ Meno fatica', '🏃 Passo corto'] }, fields: [{ k: 'items', label: 'Schede (una per riga)', type: 'lines' }], C: Bento },
  oscilloscope: { name: 'Oscilloscopio / battito', cat: 'Grafici & numeri', dur: 2.6, sfx: 'battito', anim: 'fade', pos: 'upper', props: { text: '♥ 142 bpm · zona 2' }, fields: [{ k: 'text', label: 'Testo' }], C: Oscilloscope },
  pixel: { name: 'Pixel (transizione)', cat: 'Transizioni', dur: 0.6, sfx: 'glitch', anim: 'cut', pos: 'center', props: {}, C: () => null, video: true },
  aiImage: { name: 'Immagine AI', cat: 'AI', dur: 2.5, sfx: 'whoosh', anim: 'cut', pos: 'center', props: { src: '', mode: 'pieno' }, fields: [{ k: 'src', label: 'File (lo mette la dashboard)' }, { k: 'mode', label: 'pieno oppure finestra' }], C: AiImage, full: true },
  aiClip: { name: 'Clip AI', cat: 'AI', dur: 5, sfx: 'whoosh', anim: 'cut', pos: 'center', props: { src: '' }, fields: [{ k: 'src', label: 'File (lo mette la dashboard)' }], C: AiClip, full: true },
  cutout: { name: 'Scritta dietro la persona', cat: 'Visual hook', dur: 3, sfx: 'impatto', anim: 'cut', pos: 'top', props: { text: 'CORRI', y: 0.18, size: 1 }, fields: [{ k: 'text', label: 'Parola' }, { k: 'y', label: 'Altezza 0-1', type: 'number' }, { k: 'size', label: 'Grandezza', type: 'number' }, { k: 'color', label: 'Colore' }], C: CutoutText },
  mixTitle: { name: 'Titolo misto (bold + corsivo)', cat: 'Visual hook', dur: 2.4, sfx: 'whoosh', anim: 'pop', pos: 'top', props: { l1: 'Stai correndo', l2: 'nel modo', l3: 'sbagliato?' }, fields: [{ k: 'l1', label: 'Riga 1 (bold)' }, { k: 'l2', label: 'Riga 2 (corsivo)' }, { k: 'l3', label: 'Riga 3 (bold)' }, { k: 'accent', label: 'Colore corsivo' }, { k: 'size', label: 'Grandezza (1 = normale)', type: 'number' }], C: MixTitle },
  script: { name: 'Parola scritta a mano', cat: 'Visual hook', dur: 1.8, sfx: 'swish', anim: 'fade', pos: 'upper', props: { text: 'davvero?', color: '#F6B8D6', rotate: -6 }, fields: [{ k: 'text', label: 'Parola' }, { k: 'color', label: 'Colore' }, { k: 'rotate', label: 'Inclinazione °', type: 'number' }], C: ScriptWord },
  textWall: { name: 'Muro di titoli', cat: 'Visual hook', dur: 2, sfx: 'riser', anim: 'cut', pos: 'center', props: { text: 'Correre naturale' }, fields: [{ k: 'text', label: 'Testo' }, { k: 'background', label: 'Sfondo' }], C: TextWall, full: true },
  question: { name: 'Box domande Instagram', cat: 'Visual hook', dur: 3, sfx: 'pop', anim: 'pop', pos: 'upper', props: { title: 'Fammi una domanda', text: 'Ogni quanto devo correre?' }, fields: [{ k: 'title', label: 'Titolo' }, { k: 'text', label: 'Domanda' }], C: QuestionBox },
  searchBar: { name: 'Barra di ricerca che si scrive', cat: 'Visual hook', dur: 3, sfx: 'tastiera', anim: 'slideDown', pos: 'top', props: { text: 'come correre senza dolore' }, fields: [{ k: 'text', label: 'Testo' }], C: SearchBar },
  pills: { name: 'Interruttori che si accendono', cat: 'Schede & UI', dur: 3, sfx: 'click', anim: 'pop', pos: 'upper', props: { items: ['Un solo video', 'Effetti già pronti', 'Zero app'] }, fields: [{ k: 'items', label: 'Voci (una per riga)', type: 'lines' }, { k: 'color', label: 'Colore acceso' }], C: Pills },
  appWindow: { name: 'Finestra app', cat: 'Schede & UI', dur: 3.2, sfx: 'tastiera', anim: 'slideUp', pos: 'upper', props: { title: 'Il tuo piano', lines: ['Riscaldamento 10 min', 'Corsa lenta 30 min', 'Allunghi 4×20"'] }, fields: [{ k: 'title', label: 'Titolo' }, { k: 'lines', label: 'Righe (una per riga)', type: 'lines' }], C: AppWindow },
  rightWrong: { name: 'Giusto / Sbagliato', cat: 'Schede & UI', dur: 3.4, sfx: 'errore', anim: 'pop', pos: 'upper', props: { wrong: ['Passo lungo', 'Tallone avanti'], right: ['Passo corto', 'Piede sotto il bacino'] }, fields: [{ k: 'wrong', label: 'Sbagliato (una per riga)', type: 'lines' }, { k: 'right', label: 'Giusto (una per riga)', type: 'lines' }], C: RightWrong },
  unlock: { name: 'Traguardo sbloccato', cat: 'Schede & UI', dur: 2.6, sfx: 'brillantini', anim: 'drop', pos: 'upper', props: { title: 'Traguardo sbloccato', text: 'Primi 5 km senza fermarti', emoji: '🏅' }, fields: [{ k: 'title', label: 'Titolo' }, { k: 'text', label: 'Testo' }, { k: 'emoji', label: 'Emoji' }], C: Unlock },
  chart: { name: 'Grafico a barre che cresce', cat: 'Grafici & numeri', dur: 3, sfx: 'riser', anim: 'slideUp', pos: 'upper', props: { values: [12, 25, 41, 70, 100], label: 'Km a settimana', suffix: ' km', to: 100 }, fields: [{ k: 'values', label: 'Valori (uno per riga)', type: 'lines' }, { k: 'label', label: 'Etichetta' }, { k: 'to', label: 'Numero grande', type: 'number' }, { k: 'suffix', label: 'Unità' }], C: BarChart },
  phone: { name: 'Telefono con chat', cat: 'Notifiche', dur: 3.6, sfx: 'invio', anim: 'slideUp', pos: 'upper', props: { messages: ['Ciao! Ho visto il reel', '>Scrivimi CORRO e ti mando la guida', 'CORRO 🏃'] }, fields: [{ k: 'messages', label: 'Messaggi (> davanti = risposta del brand)', type: 'lines' }, { k: 'name', label: 'Nome chat' }], C: PhoneChat },
  voice: { name: 'Messaggio vocale', cat: 'Notifiche', dur: 2.6, sfx: 'blip', anim: 'pop', pos: 'lower', props: { label: '0:12' }, fields: [{ k: 'label', label: 'Durata scritta' }, { k: 'color', label: 'Colore' }], C: VoicePill },
  doodle: { name: 'Scarabocchio a mano', cat: 'Pop-up & sticker', dur: 1.8, sfx: 'swish', anim: 'cut', pos: 'center', props: { shape: 'cerchio', x: 0.5, y: 0.6, w: 0.5, h: 0.12, color: '#FFE14D' }, fields: [{ k: 'shape', label: 'Forma: cerchio, sottolinea, freccia' }, { k: 'x', label: 'X 0-1', type: 'number' }, { k: 'y', label: 'Y 0-1', type: 'number' }, { k: 'w', label: 'Larghezza 0-1', type: 'number' }, { k: 'h', label: 'Altezza 0-1', type: 'number' }, { k: 'color', label: 'Colore' }], C: Doodle },
  banner: { name: 'Banner fisso in alto', cat: 'Cornici', dur: 6, sfx: 'swish', anim: 'slideDown', pos: 'top', props: { text: 'Errore n°1: il *tallone*' }, fields: [{ k: 'text', label: 'Testo (*enfasi*)' }, { k: 'color', label: 'Colore sfondo' }], C: TopBanner },
  spotlight: { name: 'Riflettore', cat: 'Cornici', dur: 2, sfx: 'suspense', anim: 'cut', pos: 'center', props: { x: 0.5, y: 0.35, r: 26 }, fields: [{ k: 'x', label: 'X 0-1', type: 'number' }, { k: 'y', label: 'Y 0-1', type: 'number' }, { k: 'r', label: 'Raggio %', type: 'number' }], C: Spotlight },
  broll: { name: 'B-roll dallo stesso video', cat: 'Collage & foto', dur: 2, sfx: 'whoosh-veloce', anim: 'cut', pos: 'center', props: { t: 0, zoom: 0.08, label: '' }, fields: [{ k: 't', label: 'Secondo del video originale da mostrare', type: 'number' }, { k: 'zoom', label: 'Zoom lento', type: 'number' }, { k: 'label', label: 'Etichetta (facoltativa)' }], C: BRoll },
  pip: { name: 'Finestrella video (PiP)', cat: 'Collage & foto', dur: 2.6, sfx: 'pop', anim: 'pop', pos: 'center', props: { t: 0, x: 0.52, y: 0.5, size: 0.42, rotate: 4 }, fields: [{ k: 't', label: 'Secondo del video originale', type: 'number' }, { k: 'x', label: 'X 0-1', type: 'number' }, { k: 'y', label: 'Y 0-1', type: 'number' }, { k: 'size', label: 'Grandezza 0-1', type: 'number' }], C: Pip },
  contactSheet: { name: 'Provino a griglia', cat: 'Collage & foto', dur: 2.4, sfx: 'scatto', anim: 'pop', pos: 'upper', props: {}, C: ContactSheet },
  glitch: { name: 'Glitch digitale', cat: 'Transizioni', dur: 0.5, sfx: 'glitch', anim: 'cut', pos: 'center', props: {}, C: () => null, video: true },
  zoomThrough: { name: 'Zoom attraverso (transizione)', cat: 'Transizioni', dur: 0.6, sfx: 'zip', anim: 'cut', pos: 'center', props: {}, C: () => null, video: true },
  pullBack: { name: 'Zoom indietro (rivela)', cat: 'Zoom & camera', dur: 1.2, sfx: 'whoosh', anim: 'cut', pos: 'center', props: { amount: 1.5 }, fields: [{ k: 'amount', label: 'Parte da (1.2-2)', type: 'number' }], C: () => null, video: true },
  blurIn: { name: 'Sfocato → nitido', cat: 'Transizioni', dur: 0.6, sfx: 'swish', anim: 'cut', pos: 'center', props: {}, C: () => null, video: true },
};

// Effetti che agiscono sul video (zoom, shake, bianco e nero) sono gestiti in Reel.tsx
const VideoFx: React.FC = () => null;

export type FxDef = {
  name: string;
  cat: string;
  dur: number;
  sfx: string | null;
  anim: string;
  pos: string;
  props: Record<string, any>;
  fields?: { k: string; label: string; type?: string }[];
  C: React.FC<{ c: FxCtx }>;
  video?: boolean;
  full?: boolean;
};

export const FX: Record<string, FxDef> = {
  keyword: { name: 'Parola a comparsa (al posto del sottotitolo)', cat: 'Testo gigante', dur: 1.3, sfx: 'whoosh-veloce', anim: 'cut', pos: 'top', props: { text: 'MISURABILE' }, fields: [{ k: 'text', label: 'Parola' }, { k: 'color', label: 'Colore (vuoto = azzurro brand)' }], C: KeywordPop },
  bigText: { name: 'Titolone a tutto schermo', cat: 'Testo gigante', dur: 1.6, sfx: 'impatto', anim: 'cut', pos: 'center', props: { text: 'CORRI COSÌ.' }, fields: [{ k: 'text', label: 'Testo' }, { k: 'background', label: 'Sfondo (colore o none)' }], C: BigText, full: true },
  bigNumber: { name: 'Numero / frase gigante', cat: 'Testo gigante', dur: 2.2, sfx: 'riser', anim: 'stamp', pos: 'upper', props: { text: '-3 *min*', sub: 'sul tuo 10K' }, fields: [{ k: 'text', label: 'Testo (*enfasi*)' }, { k: 'sub', label: 'Sottotitolo' }], C: BigNumber },
  counter: { name: 'Contatore animato', cat: 'Grafici & numeri', dur: 2.6, sfx: 'tastiera', anim: 'pop', pos: 'upper', props: { from: 0, to: 180, suffix: ' spm', label: 'cadenza ideale' }, fields: [{ k: 'from', label: 'Da', type: 'number' }, { k: 'to', label: 'A', type: 'number' }, { k: 'suffix', label: 'Unità' }, { k: 'label', label: 'Etichetta' }], C: Counter },
  dataCard: { name: 'Scheda dati / interfaccia', cat: 'Schede & UI', dur: 2.6, sfx: 'click', anim: 'slideUp', pos: 'upper', props: { badge: 'CADENZA 180', label: 'Passo · cadenza', value: 0.8 }, fields: [{ k: 'badge', label: 'Etichetta rosa' }, { k: 'label', label: 'Titolo' }, { k: 'value', label: 'Riempimento 0-1', type: 'number' }], C: DataCard },
  checklist: { name: 'Checklist animata', cat: 'Schede & UI', dur: 3.4, sfx: 'tick', anim: 'pop', pos: 'upper', props: { title: 'I 3 errori', items: ['Busto dritto', 'Passo corto', 'Appoggio sotto il bacino'], mode: 'check' }, fields: [{ k: 'title', label: 'Titolo' }, { k: 'items', label: 'Punti (uno per riga)', type: 'lines' }, { k: 'mode', label: 'check oppure x' }], C: Checklist },
  mythTruth: { name: 'Mito vs Verità', cat: 'Schede & UI', dur: 3.2, sfx: 'errore', anim: 'pop', pos: 'upper', props: { left: 'Atterra sul tallone', right: 'Appoggia sotto il bacino' }, fields: [{ k: 'left', label: 'Mito' }, { k: 'right', label: 'Verità' }], C: MythTruth },
  tipCard: { name: 'Scheda consiglio', cat: 'Schede & UI', dur: 2.8, sfx: 'blip', anim: 'slideUp', pos: 'upper', props: { label: '💡 Consiglio', text: 'Accorcia il passo, non allungarlo' }, fields: [{ k: 'label', label: 'Etichetta' }, { k: 'text', label: 'Testo' }], C: TipCard },
  notification: { name: 'Notifica dall\'alto', cat: 'Notifiche', dur: 2.6, sfx: 'ding', anim: 'slideDown', pos: 'top', props: { title: 'Il tuo piano di corsa è pronto', body: 'Scrivimi CORRO in DM' }, fields: [{ k: 'title', label: 'Titolo' }, { k: 'body', label: 'Testo' }], C: Notification },
  typing: { name: 'Testo che si scrive (DM)', cat: 'Notifiche', dur: 3, sfx: 'tastiera', anim: 'pop', pos: 'upper', props: { label: 'Scrivi in DM', text: 'Ciao Daniele, voglio iniziare' }, fields: [{ k: 'label', label: 'Etichetta' }, { k: 'text', label: 'Messaggio' }], C: Typing },
  comment: { name: 'Commento in arrivo', cat: 'Notifiche', dur: 2.4, sfx: 'pop', anim: 'slideUp', pos: 'lower', props: { user: 'runner_felice', text: 'CORRO 🔥' }, fields: [{ k: 'user', label: 'Utente' }, { k: 'text', label: 'Commento' }], C: Comment },
  badge: { name: 'Badge / etichetta', cat: 'Pop-up & sticker', dur: 1.8, sfx: 'pop', anim: 'rotate', pos: 'upper', props: { text: '+500 runner' }, fields: [{ k: 'text', label: 'Testo' }, { k: 'color', label: 'Colore' }], C: Badge },
  emoji: { name: 'Emoji a tema', cat: 'Pop-up & sticker', dur: 1.6, sfx: 'pop', anim: 'pop', pos: 'center', props: { emoji: '🏃', x: 0.2, y: 0.33 }, fields: [{ k: 'emoji', label: 'Emoji' }, { k: 'x', label: 'Posizione X 0-1', type: 'number' }, { k: 'y', label: 'Posizione Y 0-1', type: 'number' }], C: Emoji },
  arrow: { name: 'Freccia animata', cat: 'Pop-up & sticker', dur: 1.8, sfx: 'swish', anim: 'fade', pos: 'center', props: { label: 'Guarda qui', x: 0.5, y: 0.6 }, fields: [{ k: 'label', label: 'Etichetta' }, { k: 'x', label: 'X 0-1', type: 'number' }, { k: 'y', label: 'Y 0-1', type: 'number' }, { k: 'rotate', label: 'Rotazione °', type: 'number' }], C: Arrow },
  strike: { name: 'Barrato (mito cancellato)', cat: 'Pop-up & sticker', dur: 2, sfx: 'disco-graffiato', anim: 'pop', pos: 'upper', props: { text: 'Scarpe da 200€' }, fields: [{ k: 'text', label: 'Testo' }], C: Strike },
  progress: { name: 'Barra che si riempie', cat: 'Grafici & numeri', dur: 2.8, sfx: 'tastiera', anim: 'slideUp', pos: 'upper', props: { label: 'Posti Running School', title: 'Quasi esauriti', value: 0.82 }, fields: [{ k: 'label', label: 'Etichetta' }, { k: 'title', label: 'Titolo' }, { k: 'value', label: 'Valore 0-1', type: 'number' }], C: Progress },
  stopwatch: { name: 'Cronometro', cat: 'Grafici & numeri', dur: 2.6, sfx: 'bip-start', anim: 'pop', pos: 'upper', props: { from: 0, speed: 8 }, fields: [{ k: 'from', label: 'Parte da (s)', type: 'number' }, { k: 'speed', label: 'Velocità', type: 'number' }], C: Stopwatch },
  polaroid: { name: 'Polaroid a ventaglio', cat: 'Collage & foto', dur: 2.6, sfx: 'scatto', anim: 'cut', pos: 'upper', props: { captions: ['prima', 'durante', 'dopo'] }, fields: [{ k: 'captions', label: 'Didascalie (una per riga)', type: 'lines' }], C: Polaroid },
  lowerThird: { name: 'Nome e ruolo (lower third)', cat: 'Cornici', dur: 3.2, sfx: 'swish', anim: 'cut', pos: 'lower', props: { name: 'Daniele Vecchioni', role: 'Ideatore del metodo Correre Naturale®' }, fields: [{ k: 'name', label: 'Nome' }, { k: 'role', label: 'Ruolo' }], C: LowerThird },
  rec: { name: 'Cornice REC', cat: 'Cornici', dur: 4, sfx: 'bip-start', anim: 'cut', pos: 'center', props: {}, C: Rec, full: true },
  chapter: { name: 'Capitolo / step', cat: 'Cornici', dur: 2, sfx: 'whoosh', anim: 'slideLeft', pos: 'top', props: { number: '01', title: 'La postura' }, fields: [{ k: 'number', label: 'Numero' }, { k: 'title', label: 'Titolo' }], C: Chapter },
  logoSting: { name: 'Logo in evidenza', cat: 'Cornici', dur: 1.8, sfx: 'successo', anim: 'pop', pos: 'center', props: {}, C: LogoSting },
  flash: { name: 'Flash bianco', cat: 'Transizioni', dur: 0.35, sfx: 'whoosh-veloce', anim: 'cut', pos: 'center', props: {}, C: Flash, full: true },
  zoom: { name: 'Zoom punch-in', cat: 'Zoom & camera', dur: 1.5, sfx: 'whoosh-veloce', anim: 'cut', pos: 'center', props: { amount: 1.25 }, fields: [{ k: 'amount', label: 'Quanto (1.1-1.6)', type: 'number' }], C: VideoFx, video: true },
  shake: { name: 'Shake / tremolio', cat: 'Zoom & camera', dur: 0.6, sfx: 'impatto', anim: 'cut', pos: 'center', props: { intensity: 14 }, fields: [{ k: 'intensity', label: 'Intensità px', type: 'number' }], C: VideoFx, video: true },
  bw: { name: 'Bianco e nero', cat: 'Filtri colore', dur: 2.5, sfx: null, anim: 'cut', pos: 'center', props: {}, C: VideoFx, video: true },
  sfx: { name: 'Solo effetto sonoro', cat: 'Suoni', dur: 1, sfx: 'whoosh', anim: 'cut', pos: 'center', props: {}, C: VideoFx, video: true },
  slowzoom: { name: 'Zoom lento (Ken Burns)', cat: 'Zoom & camera', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { amount: 1.15 }, fields: [{ k: 'amount', label: 'Quanto', type: 'number' }], C: VideoFx, video: true },
  ...FX_EXTRA,
  ...FX_CN,
  ...FX_CN2,
  ...FX_CN3,
  ...FX_HOOK,
};

export const FX_CATS = ['Elementi', 'AI', 'Visual hook', 'Testo gigante', 'Schede & UI', 'Grafici & numeri', 'Notifiche', 'Pop-up & sticker', 'Collage & foto', 'Cornici', 'Transizioni', 'Zoom & camera', 'Filtri colore', 'Suoni'];


export const EffectLayer: React.FC<{ c: FxCtx; type: string }> = ({ c, type }) => {
  const def = FX[type];
  if (!def || def.video) return null;
  const C = def.C;
  return <C c={c} />;
};

export const useCfg = useVideoConfig;
