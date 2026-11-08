// @ts-nocheck — codice ReelStudio (PC di Ross) importato così com'è; vedi video-engine/reelstudio/
// Effetti «stile reference» (5/11, Ross: reel zeeuiux «raw clip vs the edit» adattato a Correre Naturale).
// Testo dietro la persona con font misti, pillola ruolo, parole cinetiche, pillole-interruttore, palco crema con finestrella.
// Tutti i tempi nei props (at…) sono secondi dall'inizio dell'effetto.
import React from 'react';
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring } from 'remotion';
import type { FxCtx } from './effects';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const G = '#49762E';
const LIME = '#95FF00';
const CR = '#F4F1E5';
const INK = '#0B0F0A';
const FONT = 'Blinker, sans-serif';
const SERIF = 'DMSerif, Georgia, serif';
const fr = (c: FxCtx, s: number) => Math.round(s * c.fps);
const since = (c: FxCtx, s?: number) => c.frame - fr(c, s || 0);
const sp = (c: FxCtx, s = 0, cfg: any = { damping: 14, stiffness: 160 }) => spring({ frame: since(c, s), fps: c.fps, config: cfg });
const on = (c: FxCtx, s?: number) => c.frame >= fr(c, s || 0);
const fadeOut = (c: FxCtx, n = 6) => interpolate(c.frame, [c.dur - n, c.dur], [1, 0], clamp);
const fadeIO = (c: FxCtx, n = 6) => Math.min(interpolate(c.frame, [0, n], [0, 1], clamp), fadeOut(c, n));
const shadow = '0 10px 40px rgba(0,0,0,.35)';
// *parola* → colorata
const em = (s: string, color: string) =>
  String(s || '').split(/(\*[^*]+\*)/).map((x, i) => (x.startsWith('*') ? <span key={i} style={{ color }}>{x.slice(1, -1)}</span> : <span key={i}>{x}</span>));
// *parola* → evidenziata con barra lime (stile reference)
const hl = (s: string) =>
  String(s || '').split(/(\*[^*]+\*)/).map((x, i) => (x.startsWith('*') ? <span key={i} style={{ background: LIME, color: INK, padding: '0 18px', borderRadius: 8 }}>{x.slice(1, -1)}</span> : <span key={i}>{x}</span>));

/* 1) Titolo dietro la persona: riga piccola in corsivo serif + righe giganti in lime che passano dietro Daniele
   (la persona scontornata viene disegnata sopra da Reel.tsx grazie al flag behind nel registro). */
export const BehindTitle: React.FC<{ c: FxCtx }> = ({ c }) => {
  const lines: string[] = c.props.lines || ['DANIELE', 'VECCHIONI'];
  const at: number[] = c.props.at || lines.map((_, i) => 0.2 + i * 0.45);
  const size0 = c.props.size || 190;
  const y = (c.props.y ?? 0.1) * 1920;
  const color = c.props.color || LIME;
  const kicker = c.props.kicker;
  const kAt = c.props.kickerAt ?? 0;
  const kSize = c.props.kickerSize || 84;
  const kx = (c.props.kickerX ?? 0.12) * 1080;
  const ky = c.props.kickerY !== undefined ? c.props.kickerY * 1920 : y - kSize * 1.25;
  // mode replace: una riga alla volta nello stesso posto (DANIELE → VECCHIONI); altrimenti le righe si impilano
  const replace = c.props.mode === 'replace';
  const tSec = c.frame / c.fps;
  const lastOn = lines.reduce((acc, _, i) => (tSec >= at[i] ? i : acc), -1);
  // band: fascia scura sfumata dietro la scritta (5/11, Ross: poco contrasto col cielo chiaro)
  const bandOn = c.props.band !== false;
  const bandK = sp(c, Math.min(...at, kAt) - 0.1, { damping: 200 });
  return (
    <AbsoluteFill style={{ opacity: fadeOut(c) }}>
      {bandOn ? <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: y + size0 * 1.5, background: 'linear-gradient(180deg, rgba(5,10,4,.78) 0%, rgba(5,10,4,.62) 55%, rgba(5,10,4,0) 100%)', opacity: bandK }} /> : null}
      {kicker && on(c, kAt) ? (
        <div style={{ position: 'absolute', left: kx, top: ky, fontFamily: SERIF, fontStyle: 'italic', fontSize: kSize, color: c.props.kickerColor || '#fff', textShadow: '0 4px 18px rgba(0,0,0,.75), 0 0 3px rgba(0,0,0,.5)', opacity: sp(c, kAt), transform: `translateY(${(1 - sp(c, kAt)) * 40}px)` }}>{kicker}</div>
      ) : null}
      {lines.map((l, i) => {
        if (!on(c, at[i]) || (replace && i !== lastOn)) return null;
        const k = sp(c, at[i], { damping: 13, stiffness: 150 });
        // la parola riempie la larghezza (come «ABDUL» nel reference), senza uscire dal fotogramma
        const size = c.props.noFit ? size0 : Math.min(size0, Math.floor(1720 / Math.max(5, l.length)));   // noFit: misura data (6/11, Y4 «a parità di sforzo»)
        return (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: y + (replace ? 0 : i * size * 0.98), textAlign: c.props.align || 'center', fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -3, color, textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: '0 10px 40px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.5)', WebkitTextStroke: '3px rgba(0,0,0,.28)', paintOrder: 'stroke fill' as any, opacity: k, transform: `scale(${0.7 + 0.3 * k}) translateY(${(1 - k) * 80}px)` }}>{l}</div>
        );
      })}
    </AbsoluteFill>
  );
};

/* 2) Pillola ruolo («FONDATORE · di Correre Naturale®»), davanti alla persona, scorre da sinistra */
export const RolePill: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = sp(c, 0, { damping: 15, stiffness: 140 });
  const y = (c.props.y ?? 0.58) * 1920;
  const size = c.props.size || 46;
  return (
    <AbsoluteFill style={{ opacity: Math.min(k, fadeOut(c)) }}>
      <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: c.props.align || 'center', transform: `translateX(${(1 - k) * -120}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(11,15,10,.86)', border: '2px solid rgba(255,255,255,.22)', borderRadius: 70, padding: '18px 40px 18px 26px', boxShadow: '0 16px 40px rgba(0,0,0,.4)', fontFamily: FONT }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, background: LIME, boxShadow: `0 0 18px ${LIME}` }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: size, letterSpacing: 2, textTransform: 'uppercase' }}>{c.props.text || 'FONDATORE'}</span>
          {c.props.sub ? <span style={{ color: LIME, fontWeight: 400, fontSize: size * 1.02, fontFamily: SERIF, fontStyle: 'italic' }}>{c.props.sub}</span> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 3) Parole cinetiche: una frase grande alla volta (mode replace) o che si accumulano (mode stack), sotto il volto */
export const Kinetic: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: { text: string; at: number }[] = c.props.items || [];
  const mode = c.props.mode || 'replace';
  const size0 = c.props.size || 104;
  const tSec = c.frame / c.fps;
  const vis = items.filter((it) => tSec >= it.at);
  const show = mode === 'stack' ? vis : vis.slice(-1);
  let top = (c.props.y ?? 0.46) * 1920;
  if (c.face && top < c.face.y1 + 20) top = c.face.y1 + 20;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(c) }}>
      <div style={{ position: 'absolute', left: 40, right: 40, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {show.map((it) => {
          const k = sp(c, it.at, { damping: 12, stiffness: 180 });
          const txt = String(it.text).toUpperCase();
          // frasi lunghe vanno a capo (max 2 righe) invece di rimpicciolirsi come un sottotitolo
          const size = Math.min(size0, Math.floor(3400 / Math.max(6, txt.replace(/\*/g, '').length)));
          return (
            <div key={it.at} style={{ maxWidth: 1000, fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.02, letterSpacing: -1, color: '#fff', textAlign: 'center', textShadow: '0 6px 20px rgba(0,0,0,.55)', WebkitTextStroke: '2px rgba(0,0,0,.35)', paintOrder: 'stroke fill' as any, opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${0.85 + 0.15 * k})` }}>
              {em(txt, c.props.color || LIME)}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* 4) Pillole con interruttore (stile «BUSINESSMAN ☑ & STARTUP ☑»): nere, testo bianco, levetta lime */
export const TogglePills: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: { text: string; at: number }[] = c.props.items || [];
  let top = (c.props.y ?? 0.5) * 1920;
  if (c.face && top < c.face.y1 + 20) top = c.face.y1 + 20;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(c) }}>
      <div style={{ position: 'absolute', left: 50, right: 50, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {items.map((it, i) => {
          if (!on(c, it.at)) return null;
          const k = sp(c, it.at, { damping: 12, stiffness: 190 });
          const onv = interpolate(since(c, it.at + 0.22), [0, 6], [0, 1], clamp);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(11,15,10,.88)', border: '2px solid rgba(255,255,255,.22)', borderRadius: 60, padding: '14px 22px 14px 30px', boxShadow: '0 12px 30px rgba(0,0,0,.35)', opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: c.props.size || 42, color: '#fff', letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{it.text}</span>
              <span style={{ width: 86, height: 48, borderRadius: 30, background: onv > 0.5 ? LIME : '#3a3a3a', position: 'relative', flex: 'none' }}>
                <span style={{ position: 'absolute', top: 5, left: 5 + onv * 38, width: 38, height: 38, borderRadius: 19, background: onv > 0.5 ? INK : '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }} />
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* 5) Palco crema: titolo con evidenziazioni lime, grafico che cresce e Daniele in una finestrella in basso
   (stile scheda «we have worked with multiple brands» + «conversion rate»). Nasconde i sottotitoli. */
export const StageCard: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k0 = fadeIO(c, 7);
  const lines: string[] = c.props.lines || ['SI COSTRUISCE', '*NEL TEMPO*'];
  const at: number[] = c.props.at || lines.map((_, i) => 0.25 + i * 0.4);
  const w = c.props.win || {};
  const src = w.t ?? c.srcAt(c.start);
  const ww = (w.w ?? 0.5) * 1080, wh = (w.h ?? 0.32) * 1920, wx = (w.x ?? 0.08) * 1080, wy = (w.y ?? 0.62) * 1920;
  const prog = interpolate(since(c, c.props.chartAt ?? 0.6), [0, 36], [0, 1], clamp);
  const pts = [0, 0.1, 0.22, 0.3, 0.42, 0.5, 0.63, 0.72, 0.84, 1].map((x, i, arr) => [x * 900, 300 - Math.pow(i / (arr.length - 1), 1.35) * 260 - (i % 2 ? 14 : 0)]);
  const n = Math.max(1, Math.round(prog * (pts.length - 1)));
  const path = pts.slice(0, n + 1).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(0) + ' ' + p[1].toFixed(0)).join(' ');
  const last = pts[n];
  return (
    <AbsoluteFill style={{ opacity: k0, background: CR, fontFamily: FONT, color: INK }}>
      <div style={{ position: 'absolute', left: 70, right: 70, top: (c.props.y ?? 0.1) * 1920 }}>
        {c.props.kicker ? <div style={{ fontFamily: c.props.kickerFont === 'brand' ? FONT : SERIF, fontStyle: c.props.kickerFont === 'brand' ? 'normal' : 'italic', fontWeight: c.props.kickerFont === 'brand' ? 700 : undefined, fontSize: 60, color: G, marginBottom: 18, opacity: sp(c, 0.05) }}>{c.props.kicker}</div> : null}
        {lines.map((l, i) => {
          if (!on(c, at[i])) return null;
          const k = sp(c, at[i], { damping: 13, stiffness: 170 });
          return (
            <div key={i} style={{ fontWeight: 800, fontSize: c.props.size || 96, lineHeight: 1.08, letterSpacing: -2, textTransform: 'uppercase', opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>{hl(l)}</div>
          );
        })}
      </div>
      {c.props.chart !== false ? (
        <div style={{ position: 'absolute', left: 90, top: (c.props.chartY ?? 0.36) * 1920, width: 900, height: 320 }}>
          <svg width={900} height={320} viewBox="0 0 900 320">
            {[0, 1, 2, 3].map((i) => <line key={i} x1={0} x2={900} y1={40 + i * 86} y2={40 + i * 86} stroke="rgba(11,15,10,.10)" strokeWidth={2} />)}
            <path d={path} fill="none" stroke={G} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            {last ? <circle cx={last[0]} cy={last[1]} r={18} fill={LIME} stroke={INK} strokeWidth={6} /> : null}
          </svg>
          <div style={{ position: 'absolute', right: 0, top: -4, fontSize: 36, fontWeight: 700, color: G, opacity: prog }}>{c.props.chartLabel || ''}</div>
        </div>
      ) : null}
      <div style={{ position: 'absolute', left: wx, top: wy, width: ww, height: wh, borderRadius: w.round ?? 44, overflow: 'hidden', border: '6px solid #fff', boxShadow: '0 24px 60px rgba(0,0,0,.28)', transform: `scale(${0.85 + 0.15 * sp(c, 0.1)})`, transformOrigin: 'left bottom' }}>
        <Sequence from={0} layout="none">
          <OffthreadVideo src={c.videoUrl} muted trimBefore={Math.round(src * c.fps)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(w.px ?? 0.5) * 100}% ${(w.py ?? 0.3) * 100}%` }} />
        </Sequence>
        {c.props.winLabel ? <div style={{ position: 'absolute', left: 18, bottom: 18, background: 'rgba(11,15,10,.8)', color: '#fff', borderRadius: 30, padding: '8px 18px', fontSize: 26, fontWeight: 700 }}>{c.props.winLabel}</div> : null}
      </div>
      {c.props.side ? (
        <div style={{ position: 'absolute', left: wx + ww + 40, right: 70, top: wy + 20, fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, lineHeight: 1.2, color: INK, opacity: sp(c, 0.5) }}>{c.props.side}</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* 6) Scala da 1 a 10 (sforzo percepito): dieci tacche che compaiono una alla volta, la zona 3-4 si accende in lime,
   un indicatore scorre fino a 3-4. Niente emoji. */
export const ScaleTen: React.FC<{ c: FxCtx }> = ({ c }) => {
  const lo = c.props.lo ?? 3, hi = c.props.hi ?? 4, n = c.props.n ?? 10;
  const y = (c.props.y ?? 0.5) * 1920;
  const zoneAt = c.props.zoneAt ?? 1.2;
  const W = 960, cell = W / n;
  const left = (1080 - W) / 2;
  const zone = sp(c, zoneAt, { damping: 13, stiffness: 150 });
  const markX = interpolate(sp(c, zoneAt - 0.2, { damping: 16, stiffness: 90 }), [0, 1], [left + cell * 0.5, left + cell * ((lo + hi) / 2 - 0.5)]);
  return (
    <AbsoluteFill style={{ opacity: fadeOut(c) }}>
      {c.props.title ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: y - 120, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', textShadow: '0 4px 16px rgba(0,0,0,.6)', opacity: sp(c, 0.1) }}>{c.props.title}</div>
      ) : null}
      <div style={{ position: 'absolute', left, top: y, width: W, height: 150, display: 'flex', gap: 0 }}>
        {Array.from({ length: n }, (_, i) => {
          const k = sp(c, 0.08 + i * 0.07, { damping: 12, stiffness: 190 });
          const inZone = i + 1 >= lo && i + 1 <= hi;
          const hot = inZone ? zone : 0;
          return (
            <div key={i} style={{ width: cell, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
              <div style={{ width: cell - 10, height: 74 + hot * 26, borderRadius: 18, background: inZone ? `rgba(149,255,0,${0.25 + 0.75 * hot})` : 'rgba(11,15,10,.72)', border: `3px solid ${inZone ? LIME : 'rgba(255,255,255,.35)'}`, boxShadow: hot ? `0 0 ${30 * hot}px ${LIME}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 44, color: inZone && hot > 0.5 ? INK : '#fff' }}>{i + 1}</div>
            </div>
          );
        })}
      </div>
      {/* indicatore che scorre */}
      <div style={{ position: 'absolute', left: markX - 22, top: y + 128, width: 44, height: 44, opacity: sp(c, zoneAt - 0.3) }}>
        <svg viewBox="0 0 44 44" width={44} height={44}><path d="M22 4 L40 34 L4 34 Z" fill={LIME} stroke={INK} strokeWidth={3} strokeLinejoin="round" /></svg>
      </div>
      {c.props.label ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: y + 190, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 60, color: LIME, textShadow: '0 4px 16px rgba(0,0,0,.6)', opacity: zone, transform: `scale(${0.8 + 0.2 * zone})` }}>{c.props.label}</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* 7) Infinito: il simbolo ∞ si disegna da solo sotto il mento e un punto lime continua a percorrerlo */
export const Infinity: React.FC<{ c: FxCtx }> = ({ c }) => {
  const y = (c.props.y ?? 0.5) * 1920;
  const w = c.props.w ?? 620;
  const draw = interpolate(c.frame, [0, 32], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  // lemniscata: x = a cos t / (1 + sin² t), y = a sin t cos t / (1 + sin² t)
  const a = w / 2;
  const pts: string[] = [];
  const N = 200;
  let len = 0;   // 6/11 (Ross, Y7): lunghezza vera della curva (prima 3,8·a: il tratto finale non si disegnava mai)
  let px0 = 0, py0 = 0;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const d = 1 + Math.sin(t) ** 2;
    const X = 540 + (a * Math.cos(t)) / d, Y = y + (a * Math.sin(t) * Math.cos(t)) / d;
    if (i) len += Math.hypot(X - px0, Y - py0);
    px0 = X; py0 = Y;
    pts.push(`${X.toFixed(1)} ${Y.toFixed(1)}`);
  }
  const path = 'M' + pts.join(' L') + ' Z';
  const tt = ((c.frame - 30) / 48) * Math.PI * 2;
  const dd = 1 + Math.sin(tt) ** 2;
  const px = 540 + (a * Math.cos(tt)) / dd, py = y + (a * Math.sin(tt) * Math.cos(tt)) / dd;
  const stroke = c.props.color || LIME;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(c) }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <path d={path} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={30} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} transform="translate(0 6)" />
        <path d={path} fill="none" stroke={stroke} strokeWidth={22} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        {c.frame > 30 ? <circle cx={px} cy={py} r={26} fill="#fff" stroke={INK} strokeWidth={6} /> : null}
      </svg>
      {c.props.text ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: y + 150, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 72, color: '#fff', textTransform: 'uppercase', letterSpacing: -1, textShadow: '0 6px 20px rgba(0,0,0,.6)', opacity: sp(c, 0.5), transform: `translateY(${(1 - sp(c, 0.5)) * 30}px)` }}>{em(c.props.text, LIME)}</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* 8) Pittogrammi sport (bici con ruote che girano, nuoto con onde) in schede di vetro: niente emoji */
const Bike: React.FC<{ spin: number }> = ({ spin }) => (
  <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <g transform={`rotate(${spin} 28 56)`}><circle cx={28} cy={56} r={20} /><path d="M28 36v40M8 56h40M14 42l28 28M42 42L14 70" opacity={0.6} /></g>
    <g transform={`rotate(${spin} 92 56)`}><circle cx={92} cy={56} r={20} /><path d="M92 36v40M72 56h40M78 42l28 28M106 42L78 70" opacity={0.6} /></g>
    <path d="M28 56l22-30h22l20 30M50 26l10 30h32M60 26h-12M64 18l10 2" stroke={LIME} />
  </svg>
);
const Swim: React.FC<{ t: number }> = ({ t }) => (
  <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={84} cy={30} r={9} fill="#fff" />
    <path d="M14 46l26-18 18 14 16-8" stroke={LIME} />
    <path d="M40 28l-8 20" stroke={LIME} />
    {[0, 1].map((i) => (
      <path key={i} d={`M4 ${58 + i * 12} q 10 -8 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0`} transform={`translate(${-20 + ((t * 1.2 + i * 10) % 20)} 0)`} opacity={0.9 - i * 0.3} />
    ))}
  </svg>
);
// 6/11 (Ross, Y8): un pittogramma per ognuna delle 5 strategie, stesso stile di bici e nuoto
const Road: React.FC<{ t: number }> = ({ t }) => (
  <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 16h104" opacity={0.45} />
    <path d="M30 74L52 16M90 74L68 16" />
    {[0, 1, 2, 3].map((i) => {
      const yy = 18 + ((i * 15 + t * 1.6) % 60);
      const l = 3 + (yy - 18) * 0.16;
      return <path key={i} d={`M60 ${yy.toFixed(1)}v${l.toFixed(1)}`} stroke={LIME} strokeWidth={4 + (yy - 18) * 0.05} />;
    })}
  </svg>
);
const Steps: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.min(4, Math.floor((t % 90) / 18));
  return (
    <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 72h22V56h22V40h22V24h22V8" />
      <circle cx={19 + Math.min(k, 3) * 22 + (k === 4 ? 22 : 0)} cy={(k === 4 ? 8 : 72 - k * 16) - 8} r={6} fill={LIME} stroke="none" />
      <path d="M104 22l8-8 8 8" stroke={LIME} />
    </svg>
  );
};
const Strength: React.FC<{ t: number }> = ({ t }) => (
  <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `translateY(${(-4 * Math.sin(t / 9)).toFixed(1)}px)` }}>
    <rect x={10} y={26} width={12} height={28} rx={4} />
    <rect x={22} y={18} width={10} height={44} rx={3} />
    <rect x={98} y={26} width={12} height={28} rx={4} />
    <rect x={88} y={18} width={10} height={44} rx={3} />
    <path d="M32 40h56" stroke={LIME} strokeWidth={7} />
  </svg>
);
const Mobility: React.FC<{ t: number }> = ({ t }) => {
  const a = 18 * Math.sin(t / 8);
  return (
    <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 18a40 40 0 0 1 76 0" stroke={LIME} opacity={0.8} />
      <circle cx={60} cy={28} r={8} fill="#fff" />
      <path d="M60 36v22M60 58l-14 16M60 58l14 16" />
      <g transform={`rotate(${a.toFixed(1)} 60 40)`}><path d="M60 40L36 24M60 40l24-16" stroke={LIME} /></g>
    </svg>
  );
};
const Food: React.FC<{ t: number }> = ({ t }) => (
  <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M60 30c-16-10-32 2-30 20s14 26 30 22c16 4 28-4 30-22s-14-30-30-20z" />
    <path d="M60 30v-8" />
    <g transform={`rotate(${(6 * Math.sin(t / 7)).toFixed(1)} 60 22)`}><path d="M60 22q10-12 24-6q-10 12-24 6z" stroke={LIME} fill="rgba(149,255,0,.25)" /></g>
  </svg>
);
const Sleep: React.FC<{ t: number }> = ({ t }) => (
  <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M74 12a26 26 0 1 0 24 38 22 22 0 0 1-24-38z" />
    {[0, 1].map((i) => {
      const p = (t / 30 + i * 0.5) % 1;
      const x = 18 + i * 14, yy = 50 - p * 30 - i * 8;
      return <path key={i} d={`M${x} ${yy.toFixed(1)}h10l-10 10h10`} stroke={LIME} opacity={1 - p} />;
    })}
  </svg>
);
const Walk: React.FC<{ t: number }> = ({ t }) => {
  const a = 24 * Math.sin(t / 5);
  return (
    <svg viewBox="0 0 120 80" width={150} height={100} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={62} cy={14} r={8} fill="#fff" />
      <path d="M62 22l-3 24" />
      <g transform={`rotate(${a.toFixed(1)} 59 46)`}><path d="M59 46l-10 24" stroke={LIME} /></g>
      <g transform={`rotate(${(-a).toFixed(1)} 59 46)`}><path d="M59 46l12 22" stroke={LIME} /></g>
      <g transform={`rotate(${(-a * 0.7).toFixed(1)} 60 30)`}><path d="M60 30l-12 12" /></g>
      <g transform={`rotate(${(a * 0.7).toFixed(1)} 60 30)`}><path d="M60 30l12 10" /></g>
      <path d="M8 74h104" strokeDasharray="10 12" strokeDashoffset={-t * 1.3} opacity={0.6} />
    </svg>
  );
};
const ICON: Record<string, (f: number) => React.ReactNode> = {
  bike: (f) => <Bike spin={f * 9} />, swim: (f) => <Swim t={f} />, road: (f) => <Road t={f} />, steps: (f) => <Steps t={f} />,
  strength: (f) => <Strength t={f} />, mobility: (f) => <Mobility t={f} />, food: (f) => <Food t={f} />, sleep: (f) => <Sleep t={f} />, walk: (f) => <Walk t={f} />,
};
export const SportIcons: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: { kind: string; text: string; at: number }[] = c.props.items || [{ kind: 'bike', text: 'Bici', at: 0 }, { kind: 'swim', text: 'Nuoto', at: 0.5 }];
  let top = (c.props.y ?? 0.5) * 1920;
  if (c.face && top < c.face.y1 + 20) top = c.face.y1 + 20;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(c) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', gap: 36 }}>
        {items.map((it, i) => {
          if (!on(c, it.at)) return null;
          const k = sp(c, it.at, { damping: 12, stiffness: 170 });
          const f = since(c, it.at);
          return (
            <div key={i} style={{ width: c.props.w ?? 300, padding: '26px 20px 22px', borderRadius: 40, background: 'rgba(18,26,14,.55)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '2px solid rgba(255,255,255,.3)', boxShadow: '0 20px 60px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: k, transform: `translateY(${(1 - k) * 60}px) scale(${0.8 + 0.2 * k})` }}>
              {(ICON[it.kind] || ICON.bike)(f)}
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: Math.min(44, Math.floor(((c.props.w ?? 300) * 1.3) / Math.max(6, String(it.text || '').length))), color: '#fff', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* 9) Clip con effetto esterno (51 effetti Vibha, già renderizzati a 1080×1920 sullo stesso taglio): sopra il video, sotto sottotitoli e grafiche */
export const FxClip: React.FC<{ c: FxCtx }> = ({ c }) => {
  const src = String(c.props.src || '').startsWith('/') ? c.assetBase + c.props.src : c.props.src;
  if (!src) return null;
  const io = Math.min(interpolate(c.frame, [0, 4], [0, 1], clamp), interpolate(c.frame, [c.dur - 4, c.dur], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ opacity: io, filter: c.props.filter || 'none' }}>
      <Sequence from={0} layout="none">
        <OffthreadVideo src={src} muted trimBefore={Math.round((c.props.skip || 0) * c.fps)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const FX_CN3: Record<string, any> = {
  scaleTen: { name: 'Scala da 1 a 10', cat: 'Grafici & numeri', dur: 4, sfx: null, anim: 'cut', pos: 'center', props: { lo: 3, hi: 4 }, fields: [], C: ScaleTen },
  infinity: { name: 'Infinito che si disegna', cat: 'Visual hook', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: {}, fields: [], C: Infinity },
  sportIcons: { name: 'Pittogrammi sport animati', cat: 'Schede & UI', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: SportIcons },
  fxClip: { name: 'Clip con effetto esterno', cat: 'Collage & foto', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { src: '' }, fields: [], C: FxClip, under: true },
  behindTitle: { name: 'Titolo dietro la persona (font misti)', cat: 'Visual hook', dur: 3, sfx: null, anim: 'cut', pos: 'top', behind: true, props: { lines: ['DANIELE', 'VECCHIONI'], kicker: 'Sono' }, fields: [], C: BehindTitle },
  rolePill: { name: 'Pillola ruolo', cat: 'Cornici', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { text: 'FONDATORE', sub: 'di Correre Naturale®' }, fields: [], C: RolePill },
  kinetic: { name: 'Parole cinetiche', cat: 'Testo gigante', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: Kinetic },
  togglePills: { name: 'Pillole con interruttore', cat: 'Schede & UI', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: TogglePills },
  stageCard: { name: 'Palco crema con grafico e finestrella', cat: 'Collage & foto', dur: 3.5, sfx: null, anim: 'cut', pos: 'center', props: {}, fields: [], C: StageCard },
};
