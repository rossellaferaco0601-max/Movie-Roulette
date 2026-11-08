// @ts-nocheck — codice ReelStudio (PC di Ross) importato così com'è; vedi reelstudio-ref/
import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Easing, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions } from './captions';
import { EffectLayer, FX } from './effects';
import { enterExit } from './anim';
import { ReelProps, cutLen, cutStarts, logoUrl, musicUrl, outToSrc, outWords, pal, parseEmph, sfxUrl, TITLE_FONTS, totalDuration, useFonts } from './lib';

const FILTERS: Record<string, string> = {
  none: 'none',
  caldo: 'sepia(.18) saturate(1.15) contrast(1.05)',
  freddo: 'saturate(.9) hue-rotate(-8deg) brightness(1.03)',
  vivido: 'contrast(1.12) saturate(1.3)',
  cinema: 'contrast(1.12) saturate(.82) brightness(.96)',
  bn: 'grayscale(1) contrast(1.1)',
  morbido: 'contrast(.95) saturate(.95) brightness(1.06)',
  vintage: 'sepia(.35) contrast(.9) saturate(.85) brightness(1.05)',
  tealorange: 'contrast(1.15) saturate(1.25) hue-rotate(-12deg)',
  opaco: 'contrast(.85) saturate(.8) brightness(1.08)',
  dorato: 'sepia(.28) saturate(1.35) brightness(1.04) contrast(1.05)',
  drammatico: 'contrast(1.35) saturate(.75) brightness(.9)',
  pastello: 'saturate(.7) brightness(1.12) contrast(.88)',
  notte: 'brightness(.85) contrast(1.15) saturate(.9) hue-rotate(12deg)',
  natura: 'saturate(1.2) hue-rotate(-6deg) contrast(1.05)',
  incisione: 'grayscale(1) contrast(1.8) brightness(1.1)',
  riso: 'saturate(1.6) contrast(1.25) hue-rotate(-20deg) sepia(.15)',
};
// regolazioni manuali (luminosità, contrasto, saturazione, calore, tinta)
const adjustFilter = (a: any) => {
  if (!a) return '';
  const f: string[] = [];
  if (a.brightness !== undefined && a.brightness !== 1) f.push(`brightness(${a.brightness})`);
  if (a.contrast !== undefined && a.contrast !== 1) f.push(`contrast(${a.contrast})`);
  if (a.saturate !== undefined && a.saturate !== 1) f.push(`saturate(${a.saturate})`);
  if (a.warmth) f.push(a.warmth > 0 ? `sepia(${a.warmth * 0.5})` : `hue-rotate(${a.warmth * 25}deg)`);
  if (a.hue) f.push(`hue-rotate(${a.hue}deg)`);
  if (a.sharp) f.push(`contrast(${1 + a.sharp * 0.1})`);
  return f.join(' ');
};
const Grain: React.FC<{ amount: number; frame: number }> = ({ amount, frame }) => (
  <AbsoluteFill style={{ opacity: amount, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
    <svg width="100%" height="100%">
      <filter id={'g' + (frame % 3)}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width="100%" height="100%" filter={`url(#g${frame % 3})`} />
    </svg>
  </AbsoluteFill>
);

const VideoStack: React.FC<{ p: ReelProps; style?: React.CSSProperties; fit: 'cover' | 'contain'; muted?: boolean; extraScale?: (i: number, local: number) => number; cut?: boolean }> = ({ p, style, fit, muted, extraScale, cut }) => {
  const starts = cutStarts(p.cuts);
  const fps = p.fps;
  const fx = (p.style?.focusX ?? 0.5) * 100;
  const fy = (p.style?.focusY ?? 0.5) * 100;
  return (
    <>
      {p.cuts.map((c, i) => {
        const from = Math.round(starts[i] * fps);
        const len = Math.max(1, Math.round(cutLen(c) * fps));
        // dissolvenza tra un taglio e l'altro (3/11, Ross: niente salti bruschi): gli ultimi fotogrammi
        // del pezzo precedente (senza audio) sfumano sopra il nuovo per style.cutBlend fotogrammi
        const pc = i > 0 ? p.cuts[i - 1] : null;
        const nb = (p.style as any)?.cutBlend || 0;
        const blend = !cut && nb > 0 && pc && !(c as any).hard && (Math.abs(pc.e - c.s) > 0.05 || (c as any).blend);   // 6/11 (Ross): cut.hard = taglio netto, senza dissolvenza
        const plen = pc ? Math.max(1, Math.round(cutLen(pc) * fps)) : 1;
        return (
          <React.Fragment key={i}>
            <Sequence from={from} durationInFrames={len} layout="none">
              <CutVideo p={p} c={c} i={i} len={len} fit={fit} fx={fx} fy={fy} style={style} muted={muted} extraScale={extraScale} cut={cut} />
            </Sequence>
            {blend ? (
              <Sequence from={from} durationInFrames={Math.min(nb, len)} layout="none">
                <BlendOut n={Math.min(nb, len)}>
                  <CutVideo p={p} c={{ ...pc, s: pc.e - Math.min(nb, len) / fps }} i={i - 1} len={plen} fit={fit} fx={fx} fy={fy} style={style} muted={muted} silent extraScale={extraScale} cut={cut} />
                </BlendOut>
              </Sequence>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

const BlendOut: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, n], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) }) }}>{children}</AbsoluteFill>;
};

// fotogramma scontornato più vicino (per la scritta dietro la persona)
const nearestCut = (list: number[] | undefined, idx: number) => {
  if (!list?.length) return null;
  let best = -1;
  let bd = 3;
  for (const v of list) {
    const d = Math.abs(v - idx);
    if (d < bd) (bd = d), (best = v);
  }
  return best >= 0 ? best : null;
};
const CutVideo: React.FC<any> = ({ p, c, i, len, fit, fx, fy, style, muted, extraScale, cut, silent }) => {
  const f = useCurrentFrame();
  const s = extraScale ? extraScale(i, f / len) : 1;
  if (cut) {
    const idx = nearestCut(p.cutoutFrames, Math.round((c.s + (f / p.fps) * (c.speed || 1)) * 30));
    if (idx === null) return null;
    // stessa inquadratura del video sotto: nei pezzi «volto» il centro è quello del taglio (c.fx/c.fy), non quello di default
    const px = fit === 'cover' && c.frame === 'volto' && c.fx !== undefined ? c.fx * 100 : fx;
    const py = fit === 'cover' && c.frame === 'volto' && c.fx !== undefined ? (c.fy ?? 0.4) * 100 : fy;
    return <Img src={`${p.cutoutBase}/${idx}.png`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: `${px}% ${py}%`, transform: `scale(${s})`, ...style }} />;
  }
  // inquadratura del pezzo: volto (taglio verticale sul volto), intero (tutto il fotogramma con sfondo sfocato), diviso (grafica sopra, volto sotto)
  const fr = !muted && fit === 'cover' ? c.frame : undefined;
  const vid = (extra: React.CSSProperties, mute: boolean, f2: 'cover' | 'contain', px = fx, py = fy) => (
    <OffthreadVideo
      src={p.videoUrl}
      trimBefore={Math.round(c.s * p.fps)}
      muted={mute || !!silent || !!c.mute || p.mode === 'overlay'}
      volume={(p.audio?.voiceVolume ?? 1) * (c.vol ?? 1)}
      playbackRate={c.speed || 1}
      pauseWhenBuffering
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: f2, objectPosition: `${px}% ${py}%`, ...extra }}
    />
  );
  if (fr === 'intero')
    return (
      <>
        {vid({ filter: 'blur(38px) brightness(.5)', transform: 'scale(1.25)' }, true, 'cover')}
        {vid({ transform: `scale(${s})`, ...style }, false, 'contain')}
      </>
    );
  if (fr === 'diviso')
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: '#0B0F0A' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 250, height: 640, overflow: 'hidden' }}>{vid({ transform: `scale(${s})` }, false, 'contain')}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 900, bottom: 0, overflow: 'hidden', borderTop: '6px solid #49762E' }}>{vid({ transform: 'scale(1.6)', transformOrigin: `${(c.fx ?? 0.5) * 100}% ${(c.fy ?? 0.4) * 100}%` }, true, 'cover', (c.fx ?? 0.5) * 100, (c.fy ?? 0.4) * 100)}</div>
      </>
    );
  if (fr === 'volto' && c.fx !== undefined) return vid({ transform: `scale(${s})`, ...style }, !!muted, fit, c.fx * 100, (c.fy ?? 0.4) * 100);
  return (
    <OffthreadVideo
      src={p.videoUrl}
      trimBefore={Math.round(c.s * p.fps)}
      muted={muted || !!silent || !!c.mute || p.mode === 'overlay'}
      volume={(p.audio?.voiceVolume ?? 1) * (c.vol ?? 1)}
      playbackRate={c.speed || 1}
      pauseWhenBuffering
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: `${fx}% ${fy}%`, transform: `scale(${s})`, ...style }}
    />
  );
};

// trasformazione libera (spostata/ruotata/scalata a mano sopra il video)
export const TF: React.FC<{ id: string; tf?: any; children: React.ReactNode }> = ({ id, tf, children }) => {
  const x = (tf?.x || 0) * 1080;
  const y = (tf?.y || 0) * 1920;
  const s = tf?.s ?? 1;
  const sx = tf?.sx ?? 1;
  const sy = tf?.sy ?? 1;
  const r = tf?.r || 0;
  const o = tf?.o ?? 1;
  const has = x || y || s !== 1 || sx !== 1 || sy !== 1 || r || o !== 1;
  return (
    <AbsoluteFill data-fxid={id} style={has ? { transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s * sx}, ${s * sy})`, transformOrigin: `${(tf?.ox ?? 0.5) * 1080}px ${(tf?.oy ?? 0.5) * 1920}px`, opacity: o } : undefined}>
      {children}
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ p: ReelProps; t: number; P: any }> = ({ p, t, P }) => {
  const h = p.hook || {};
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!h.text || h.style === 'none') return null;
  const dur = h.duration ?? 2.2;
  if (t > dur) return null;
  const f = TITLE_FONTS[p.style?.titleFont || 'brand'] || TITLE_FONTS.brand;
  const parts = parseEmph(h.text);
  const words: { w: string; e: boolean }[] = [];
  parts.forEach((pp) => pp.t.split(/\s+/).filter(Boolean).forEach((w) => words.push({ w, e: pp.e })));
  const durF = Math.round(dur * fps);
  const emphColor = h.emphColor || P.accent;
  const renderWords = (size: number, color: string, gap = 4) =>
    words.map((x, i) => {
      const appear = i * gap;
      const sp = spring({ frame: frame - appear, fps, config: { damping: 12, stiffness: 180 } });
      return (
        <span key={i} style={{ display: 'inline-block', margin: '0 0.12em', opacity: frame >= appear ? 1 : 0, transform: `translateY(${(1 - sp) * 40}px) scale(${0.8 + 0.2 * sp})`, color: x.e ? emphColor : color, fontStyle: x.e && f.italicEmph ? 'italic' : 'normal' }}>
          {f.upper ? x.w.toUpperCase() : x.w}
        </span>
      );
    });
  const out = interpolate(frame, [durF - 6, durF], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (h.style === 'talk') {
    // Copertina animata stile "Let's talk about"
    const exitF = 9;
    const wipe = interpolate(frame, [durF - exitF, durF], [0, -1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
    const bgIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });
    const kick = (h.kicker || 'Parliamo di').toUpperCase();
    const kn = Math.floor(interpolate(frame, [2, 2 + kick.length * 0.8], [0, kick.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    const lines: { w: string; e: boolean }[][] = [];
    // max 2 parole per riga
    const perLine = words.length <= 3 ? 1 : 2;
    words.forEach((x, i) => {
      if (i % perLine === 0) lines.push([]);
      lines[lines.length - 1].push(x);
    });
    const longest = Math.max(...lines.map((l) => l.map((x) => x.w).join(' ').length), 4);
    const size = Math.min(240, Math.floor(1500 / longest)) * (h.size || 1);
    const coverFont = f.upper ? f.css : 'Blinker, Inter, sans-serif';
    const spin = frame * 1.6;
    const lineW = interpolate(frame, [4, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    const subIn = spring({ frame: frame - 16, fps, config: { damping: 200 } });
    return (
      <AbsoluteFill style={{ transform: `translateY(${wipe}px)` }}>
        <AbsoluteFill style={{ background: `linear-gradient(160deg, ${P.primary}F2 0%, ${P.primary}D9 45%, rgba(0,0,0,.82) 100%)`, opacity: bgIn, backdropFilter: 'blur(14px)' }} />
        <div style={{ position: 'absolute', left: 80, right: 80, top: 330, height: 6, background: P.accent, transformOrigin: 'left', transform: `scaleX(${lineW})` }} />
        <div style={{ position: 'absolute', left: 80, top: 380, display: 'inline-flex', alignItems: 'center', gap: 16, background: '#fff', color: P.primary, fontFamily: 'Blinker', fontWeight: 800, fontSize: 52, letterSpacing: 6, padding: '12px 30px', borderRadius: 60, opacity: bgIn }}>
          <span style={{ width: 18, height: 18, borderRadius: 20, background: '#E2572B', opacity: Math.floor(frame / 8) % 2 ? 0.3 : 1 }} />
          {kick.slice(0, kn)}
          <span style={{ opacity: kn < kick.length ? 1 : 0 }}>|</span>
        </div>
        <div style={{ position: 'absolute', left: 80, right: 60, top: 540 }}>
          {lines.map((ln, li) => (
            <div key={li} style={{ overflow: 'hidden', paddingBottom: 8 }}>
              <div style={{ display: 'flex', gap: size * 0.25, flexWrap: 'nowrap' }}>
                {ln.map((x, wi) => {
                  const k = li * 2 + wi;
                  const sp = spring({ frame: frame - 6 - k * 3, fps, config: { damping: 15, stiffness: 170 } });
                  const hl = spring({ frame: frame - 12 - k * 3, fps, config: { damping: 200 } });
                  return (
                    <span key={wi} style={{ position: 'relative', display: 'inline-block', transform: `translateY(${(1 - sp) * 110}%)`, fontFamily: coverFont, fontWeight: 800, fontSize: size, lineHeight: 0.98, color: x.e ? P.primary : '#fff', textTransform: 'uppercase', letterSpacing: -2 }}>
                      {x.e ? <span style={{ position: 'absolute', left: -12, right: -12, top: '12%', bottom: '4%', background: P.accent, transformOrigin: 'left', transform: `scaleX(${hl})`, zIndex: -1, borderRadius: 10 }} /> : null}
                      <span style={{ position: 'relative' }}>{x.w}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          {h.sub ? (
            <div style={{ marginTop: 34, fontFamily: 'Blinker', fontWeight: 600, fontSize: 60, color: '#fff', opacity: subIn, transform: `translateY(${(1 - subIn) * 30}px)`, lineHeight: 1.15 }}>{h.sub}</div>
          ) : null}
        </div>
        <div style={{ position: 'absolute', right: 80, bottom: 330, width: 230, height: 230, borderRadius: 200, background: '#fff', display: 'grid', placeItems: 'center', opacity: bgIn, boxShadow: '0 12px 40px rgba(0,0,0,.35)' }}>
          <Img src={logoUrl(p.assetBase, p.brand, 'circular')} style={{ width: 200, transform: `rotate(${spin}deg)` }} />
        </div>
        {p.brand?.speaker ? (
          <div style={{ position: 'absolute', left: 80, bottom: 380, fontFamily: 'Blinker', fontWeight: 700, fontSize: 44, color: '#fff', opacity: subIn }}>
            con <span style={{ color: P.accent }}>{p.brand.speaker.name}</span>
          </div>
        ) : null}
      </AbsoluteFill>
    );
  }
  const hFont = h.font ? TITLE_FONTS[h.font] || f : f;
  const plainWords = words.map((x) => x.w);
  if (h.style === 'mix') {
    // titolo misto: riga bold + riga serif corsiva + riga bold
    const n = plainWords.length;
    const a = Math.ceil(n / 3);
    const lines = [plainWords.slice(0, a).join(' '), plainWords.slice(a, a * 2).join(' '), plainWords.slice(a * 2).join(' ')].filter(Boolean);
    return (
      <div style={{ position: 'absolute', left: 50, right: 50, top: h.top ?? 260, textAlign: 'center', opacity: out }}>
        {lines.map((l, i) => {
          const sp = spring({ frame: frame - i * 4, fps, config: { damping: 12, stiffness: 170 } });
          const serif = i === 1;
          return (
            <div key={i} style={{ fontFamily: serif ? 'DMSerif, Georgia, serif' : 'Anton, Impact, sans-serif', fontStyle: serif ? 'italic' : 'normal', fontSize: (serif ? 150 : 130) * (h.size || 1), lineHeight: 0.95, color: serif ? emphColor : '#fff', textTransform: serif ? 'none' : 'uppercase', textShadow: '0 8px 30px rgba(0,0,0,.45)', transform: `translateY(${(1 - sp) * 80}px) rotate(${(1 - sp) * (i % 2 ? 6 : -6)}deg)`, opacity: sp }}>
              {l}
            </div>
          );
        })}
      </div>
    );
  }
  if (h.style === 'kinetic') {
    // una parola alla volta, enorme, a tempo
    const per = Math.max(4, Math.floor(durF / Math.max(1, words.length)));
    const k = Math.min(words.length - 1, Math.floor(frame / per));
    const lf = frame - k * per;
    const sp = spring({ frame: lf, fps, config: { damping: 9, stiffness: 220 } });
    const x = words[k];
    return (
      <AbsoluteFill style={{ background: 'rgba(0,0,0,.45)', justifyContent: 'center', alignItems: 'center', opacity: out }}>
        <div style={{ fontFamily: hFont.css, fontWeight: hFont.weight, fontSize: Math.min(300, 1700 / Math.max(3, x.w.length)) * (h.size || 1), color: x.e ? emphColor : '#fff', textTransform: 'uppercase', transform: `scale(${0.5 + 0.5 * sp}) rotate(${(k % 2 ? 4 : -4) * (1 - sp)}deg)`, textShadow: '0 10px 40px rgba(0,0,0,.6)' }}>{x.w}</div>
      </AbsoluteFill>
    );
  }
  if (h.style === 'typewriter') {
    // 5/11 (vlog): h.lines = [{text, size, color, weight}] → righe separate con dimensioni diverse, scritte una dopo l'altra
    const L: { text: string; size?: number; color?: string; weight?: number }[] = Array.isArray(h.lines) && h.lines.length ? h.lines : [{ text: plainWords.join(' ') }];
    const totalCh = L.reduce((a, l) => a + l.text.length, 0);
    const n = Math.floor(interpolate(frame, [3, Math.max(4, durF * (h.typeFrac ?? 0.6))], [0, totalCh], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    const base = 64 * (h.size || 1);
    const cursor = <span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1, color: P.primary }}>▍</span>;
    let cum = 0;
    return (
      <div style={{ position: 'absolute', top: h.top ?? 250, left: h.pad ?? 70, right: h.pad ?? 70, opacity: out, textAlign: h.align || 'left' }}>
        <div style={{ display: Array.isArray(h.lines) && h.lines.length ? 'block' : 'inline-block', background: h.bg || 'rgba(255,255,255,.96)', borderRadius: 28, padding: '28px 36px', fontFamily: h.font ? hFont.css : 'JBMono, monospace', fontWeight: 700, fontSize: base, lineHeight: 1.15, color: '#0B0F0A', boxShadow: '0 20px 50px rgba(0,0,0,.35)', textAlign: h.align || 'left' }}>
          {L.map((l, i) => {
            const start = cum;
            cum += l.text.length;
            const k = Math.max(0, Math.min(l.text.length, n - start));
            const isCur = n < totalCh ? n >= start && n < start + l.text.length : i === L.length - 1;
            const fs = base * (l.size || 1);
            return (
              <div key={i} style={{ fontSize: fs, lineHeight: 1.08, minHeight: fs * 1.08, color: l.color || '#0B0F0A', fontWeight: l.weight || 700, whiteSpace: 'pre' }}>
                {l.text.slice(0, k)}
                {isCur ? cursor : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (h.style === 'news') {
    const sp = spring({ frame, fps, config: { damping: 200 } });
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, top: h.top ?? 1180, opacity: out, transform: `translateX(${(1 - sp) * -1100}px)` }}>
        <div style={{ display: 'inline-block', background: '#D72F2F', color: '#fff', fontFamily: 'Anton', fontSize: 52, padding: '8px 30px', letterSpacing: 2 }}>{(h.kicker || 'ULTIM’ORA').toUpperCase()}</div>
        <div style={{ background: '#fff', color: '#0B0F0A', fontFamily: hFont.css, fontWeight: 800, fontSize: 70 * (h.size || 1), padding: '18px 30px', lineHeight: 1.05, boxShadow: '0 12px 30px rgba(0,0,0,.35)' }}>{renderWords(70, '#0B0F0A', 2)}</div>
      </div>
    );
  }
  if (h.style === 'boxed') {
    // parole in scatole colorate impilate (stile sticker)
    return (
      <div style={{ position: 'absolute', left: 60, right: 60, top: h.top ?? 240, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, opacity: out }}>
        {words.map((x, i) => {
          const sp = spring({ frame: frame - i * 3, fps, config: { damping: 11, stiffness: 200 } });
          return (
            <span key={i} style={{ display: 'inline-block', background: x.e ? emphColor : i % 2 ? '#fff' : P.primary, color: x.e ? P.primary : i % 2 ? '#0B0F0A' : '#fff', fontFamily: hFont.css, fontWeight: 800, fontSize: 92 * (h.size || 1), padding: '6px 22px', borderRadius: 16, transform: `scale(${sp}) rotate(${(i % 2 ? 3 : -3) * sp}deg)`, boxShadow: '0 10px 24px rgba(0,0,0,.3)', textTransform: hFont.upper ? 'uppercase' : 'none' }}>
              {x.w}
            </span>
          );
        })}
      </div>
    );
  }
  if (h.style === 'question') {
    const full = plainWords.join(' ');
    const n = Math.floor(interpolate(frame, [6, 6 + full.length * 0.8], [0, full.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    const sp = spring({ frame, fps, config: { damping: 13 } });
    return (
      <div style={{ position: 'absolute', top: h.top ?? 300, left: 170, right: 170, transform: `scale(${sp})`, opacity: out }}>
        <div style={{ background: P.primary, color: '#fff', borderRadius: '40px 40px 0 0', padding: '40px 30px 26px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 44 }}>{h.kicker || 'Fammi una domanda'}</div>
        <div style={{ background: '#fff', borderRadius: '0 0 40px 40px', padding: 30, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 48 * (h.size || 1), color: '#222', boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
          {full.slice(0, n)}
        </div>
      </div>
    );
  }
  if (h.style === 'fullscreen') {
    return (
      <AbsoluteFill style={{ background: h.background || P.primary, justifyContent: 'center', alignItems: 'center', padding: 80, opacity: frame > durF - 2 ? 0 : 1 }}>
        <div style={{ fontFamily: f.css, fontWeight: f.weight, fontSize: (h.size || 1) * 150, lineHeight: 0.95, textAlign: 'center', color: '#fff', letterSpacing: -2 }}>{renderWords(150, '#fff', 3)}</div>
        <Img src={logoUrl(p.assetBase, p.brand, 'pictogramOnDark')} style={{ position: 'absolute', bottom: 200, height: 110 }} />
      </AbsoluteFill>
    );
  }
  if (h.style === 'card') {
    const ee = enterExit('pop', frame, fps, durF);
    return (
      <div style={{ position: 'absolute', top: 240, left: 70, right: 70, display: 'flex', justifyContent: 'center', ...ee }}>
        <div style={{ background: '#fff', borderRadius: 34, padding: '28px 40px', boxShadow: '0 20px 50px rgba(0,0,0,.35)', fontFamily: f.css, fontWeight: f.weight, fontSize: (h.size || 1) * 84, lineHeight: 1.05, textAlign: 'center', color: '#0B0F0A' }}>
          {renderWords(84, '#0B0F0A')}
        </div>
      </div>
    );
  }
  // top (default)
  return (
    <div style={{ position: 'absolute', top: 210, left: 60, right: 60, textAlign: h.align || 'left', opacity: out }}>
      <div style={{ fontFamily: f.css, fontWeight: f.weight, fontSize: (h.size || 1) * 112, lineHeight: 1.0, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,.55)', letterSpacing: -1 }}>{renderWords(112, '#fff')}</div>
    </div>
  );
};

const Cta: React.FC<{ p: ReelProps; t: number; total: number; P: any }> = ({ p, t, total, P }) => {
  const c = p.cta || {};
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!c.text || c.style === 'none') return null;
  const dur = c.after ? c.duration ?? 4 : Math.min(c.duration ?? 3, total);
  const start = c.after ? total : total - dur;
  if (t < start) return null;
  const lf = frame - Math.round(start * fps);
  const durF = Math.round(dur * fps) + 10;
  const kw = c.keyword;
  const text = (c.text || '').split(kw || '\u0000');
  const txt = (
    <>
      {text.map((s: string, i: number) => (
        <React.Fragment key={i}>
          {s}
          {i < text.length - 1 ? <span style={{ background: P.primary, color: '#fff', padding: '0 14px', borderRadius: 12 }}>{kw}</span> : null}
        </React.Fragment>
      ))}
    </>
  );
  const bg = c.bg || P.primary;
  const emoji = c.emoji ?? '👇';
  // CTA «coaching» (3/11, Ross; 5/11: più animata e interattiva, con suoni): logo, testo, commento che si scrive e viene
  // pubblicato (coriandoli), notifica DM che arriva, dito che tocca mi piace / condividi / salva, bottone Segui.
  if (c.style === 'coaching') {
    const sp = (d: number, cfg: any = { damping: 14, stiffness: 160 }) => spring({ frame: lf - d, fps, config: cfg });
    const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
    const kwLen = (kw || '').length;
    const base = Math.round(start * fps);
    const T = { box: 24, tap1: 30, type: 34, sent: 34 + kwLen * 3 + 6, dm: 34 + kwLen * 3 + 34, like: 34 + kwLen * 3 + 62, share: 34 + kwLen * 3 + 82, save: 34 + kwLen * 3 + 102, follow: 34 + kwLen * 3 + 136 };
    const kwN = Math.max(0, Math.min(kwLen, Math.floor((lf - T.type) / 3)));
    const sent = lf > T.sent;
    const LIME = '#95FF00';
    const light = c.variant === 'cream';
    const ink = light ? '#0B0F0A' : '#fff';
    const bgCss = c.overlay ? c.overlay : light ? '#F4F1E5' : c.variant === 'video' ? 'linear-gradient(180deg, rgba(14,23,10,.30) 0%, rgba(14,23,10,.66) 50%, rgba(14,23,10,.86) 100%)' : 'linear-gradient(180deg, rgba(73,118,46,.92) 0%, rgba(30,52,18,.94) 100%)';
    const vsrc = c.video?.src ? (String(c.video.src).startsWith('/') ? p.assetBase + c.video.src : c.video.src) : null;
    // suoni della CTA (tastiera, invio, coriandoli, notifica, tocchi)
    const sv = p.audio?.sfxOn !== false ? p.audio?.sfxVolume ?? 0.4 : 0;
    const snd = (f: number, name: string, v = 1) =>
      sv > 0 && lf >= f - 1 && lf < f + 80 ? (
        <Sequence key={name + f} from={base + f} durationInFrames={Math.round(2.6 * fps)} layout="none">
          <Audio src={sfxUrl(p.assetBase, name)} volume={sv * v} />
        </Sequence>
      ) : null;
    // dito che tocca: si sposta tra i bersagli (commento, Pubblica, mi piace, condividi, salva, Segui), anello al tocco
    // 7/11 (vlog condensato, Ross: «rispetta gli spazi di visione di Instagram»): icone e Segui spostabili più in alto, fuori dalla fascia della didascalia
    const iconsTop: number = c.iconsTop ?? 1240;
    const followTop: number = c.followTop ?? 1510;
    const iconY = iconsTop + 85, followY = followTop + 50;
    const targets: [number, number, number][] = [[T.tap1, 540, 931], [T.sent, 880, 931], [T.like, 280, iconY], [T.share, 540, iconY], [T.save, 800, iconY], [T.follow, 540, followY]];
    const ti = targets.reduce((acc, t, i) => (lf >= t[0] - 10 ? i : acc), -1);
    let px = 540, py = 1780;
    if (ti >= 0) {
      const [tf, x, y] = targets[ti];
      const prev = ti > 0 ? targets[ti - 1] : [tf - 10, 540, 1780];   // il dito entra dal basso
      const k = interpolate(lf, [tf - 10, tf], [0, 1], { ...cl, easing: Easing.out(Easing.quad) });
      px = prev[1] + (x - prev[1]) * k;
      py = prev[2] + (y - prev[2]) * k;
    }
    const showPointer = lf >= T.tap1 - 12 && lf < T.follow + 30;
    const ring = Math.max(-1, ...targets.map((t) => (lf >= t[0] && lf < t[0] + 14 ? (lf - t[0]) / 14 : -1)));
    const press = targets.some((t) => lf >= t[0] && lf < t[0] + 5);
    const icons = [
      { lab: 'Mi piace', d: T.like, svg: <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" /> },
      { lab: 'Condividi', d: T.share, svg: <path d="M2.5 11.2 21.5 3l-6.4 18-3.4-7.6-9.2-2.2zm9.2 2.2 9.8-10.4" /> },
      { lab: 'Salva', d: T.save, svg: <path d="M6 3h12v18l-6-4-6 4z" /> },
    ];
    const dmK = sp(T.dm, { damping: 13, stiffness: 120 });
    const TS = c.textScale || 1;   // 5/11 (vlog v3, Ross): testi della CTA più grandi e leggibili
    const followed = lf >= T.follow;
    const logoOp = lf < T.dm ? sp(2, { damping: 200 }) : 1 - interpolate(lf, [T.dm, T.dm + 8], [0, 1], cl);
    return (
      <AbsoluteFill style={{ opacity: sp(0, { damping: 200 }) }}>
        {c.variant === 'video' && vsrc ? (
          // dentro una Sequence che parte con la CTA: senza, il clip partiva da «from» + tempo già trascorso nel reel (5/11: nero oltre la fine del file)
          <Sequence from={base} layout="none">
            <OffthreadVideo src={vsrc} muted trimBefore={Math.round((c.video.from || 0) * fps)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(c.video.px ?? 0.5) * 100}% 50%` }} />
          </Sequence>
        ) : null}
        <AbsoluteFill style={{ background: bgCss, fontFamily: 'Blinker, sans-serif', color: ink }}>
          <Img src={logoUrl(p.assetBase, p.brand, light ? 'onLight' : 'onDark')} style={{ position: 'absolute', top: 150, left: 340, width: 400, opacity: logoOp }} />
          <div style={{ position: 'absolute', top: c.titleTop ?? 420, left: 60, right: 60, fontWeight: 800, fontSize: 82 * TS, lineHeight: 1.05, textAlign: 'center', textShadow: c.variant === 'video' ? '0 4px 18px rgba(0,0,0,.6)' : 'none', transform: `translateY(${(1 - sp(6)) * 50}px)`, opacity: sp(6) }}>
            {parseEmph(c.text || '').map((x: any, i: number) => (
              <span key={i} style={{ color: x.e ? (light ? '#49762E' : '#B8D7EA') : ink }}>{x.t}</span>
            ))}
          </div>
          {c.sub ? <div style={{ position: 'absolute', top: c.subTop ?? 640, left: 70, right: 70, fontWeight: 600, fontSize: 44 * TS, lineHeight: 1.2, textAlign: 'center', color: light ? '#2C3A24' : '#F4F1E5', textShadow: c.variant === 'video' ? '0 3px 14px rgba(0,0,0,.6)' : 'none', opacity: sp(14) }}>{c.sub}</div> : null}
          {/* casella commento: si scrive la parola chiave, Pubblica → ✓ Pubblicato con coriandoli */}
          <div style={{ position: 'absolute', top: 870, left: 90, width: 900, background: '#fff', borderRadius: 60, padding: '26px 34px', display: 'flex', alignItems: 'center', gap: 22, color: '#0B0F0A', transform: `scale(${0.8 + 0.2 * sp(T.box)}) ${press && ti <= 1 ? 'scale(.98)' : ''}`, opacity: sp(T.box), boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: '#B8D7EA', flex: 'none' }} />
            <div style={{ flex: 1, fontSize: 52, fontWeight: 800 }}>
              {kwN ? (kw || '').slice(0, kwN) : <span style={{ color: '#888', fontWeight: 600 }}>Aggiungi un commento…</span>}
              {kwN && !sent ? <span style={{ opacity: Math.floor(lf / 6) % 2 ? 0 : 1 }}>|</span> : null}
            </div>
            <div style={{ position: 'relative', background: sent ? LIME : '#9ec9f3', color: sent ? '#0B0F0A' : '#fff', borderRadius: 40, padding: '12px 26px', fontSize: 40, fontWeight: 800, whiteSpace: 'nowrap', transform: `scale(${sent ? 1 + 0.15 * Math.max(0, 1 - (lf - T.sent) / 8) : 1})` }}>
              {sent ? '✓ Pubblicato' : 'Pubblica'}
              {sent && lf - T.sent < 26
                ? Array.from({ length: 14 }, (_, j) => {
                    const kk = lf - T.sent;
                    const ang = (j / 14) * Math.PI * 2;
                    const d = 30 + kk * 9;
                    return <span key={j} style={{ position: 'absolute', left: `calc(50% + ${Math.cos(ang) * d}px)`, top: `calc(50% + ${Math.sin(ang) * d * 0.7}px)`, width: 14, height: 14, borderRadius: j % 2 ? 7 : 3, background: [LIME, '#49762E', '#fff'][j % 3], opacity: Math.max(0, 1 - kk / 26), transform: `rotate(${kk * 20 + j * 40}deg)` }} />;
                  })
                : null}
            </div>
          </div>
          <div style={{ position: 'absolute', top: c.noteTop ?? 1012, left: 40, right: 40, textAlign: 'center', fontSize: 40 * TS, fontWeight: 700, color: light ? '#2C3A24' : '#F4F1E5', textShadow: c.variant === 'video' ? '0 3px 14px rgba(0,0,0,.6)' : 'none', opacity: sp(T.box + 6) }}>{(c.note || 'Commenta qui sotto').replace(/\s*👇/g, '')}</div>
          {/* notifica DM che arriva dopo il commento */}
          {lf >= T.dm ? (
            <div style={{ position: 'absolute', top: 60, left: 60, width: 960, transform: `translateY(${(1 - dmK) * -260}px) translateY(${Math.sin((lf - T.dm) / 9) * 4}px)`, background: '#fff', borderRadius: 36, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 24px 60px rgba(0,0,0,.45)', color: '#0B0F0A' }}>
              <div style={{ width: 96, height: 96, borderRadius: 48, background: '#F4F1E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', overflow: 'hidden' }}>
                <Img src={logoUrl(p.assetBase, p.brand, 'onLight')} style={{ width: 82 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 36, fontWeight: 800 }}>correrenaturale</span>
                  <span style={{ fontSize: 28, fontWeight: 600, color: '#8a8a8a' }}>adesso</span>
                </div>
                <div style={{ fontSize: 33, fontWeight: 600, lineHeight: 1.2, color: '#1f2a1a' }}>{c.dm || 'Ecco tutte le info sui percorsi di coaching personalizzati'}</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: LIME, color: '#0B0F0A', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>1</div>
            </div>
          ) : null}
          {/* mi piace / condividi / salva: appaiono insieme, poi il dito li tocca uno alla volta */}
          <div style={{ position: 'absolute', top: iconsTop, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 90 }}>
            {icons.map((ic, i) => {
              const k = sp(T.sent + 8 + i * 4, { damping: 11, stiffness: 190 });
              const tap = lf >= ic.d + 3;
              const bump = lf >= ic.d && lf < ic.d + 12 ? 1 + 0.25 * Math.sin(((lf - ic.d) / 12) * Math.PI) : 1;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: Math.min(1, k * 1.4), transform: `scale(${(0.5 + 0.5 * k) * bump})` }}>
                  <div style={{ width: 170, height: 170, borderRadius: 85, background: tap ? (light ? '#49762E' : '#fff') : light ? 'rgba(73,118,46,.12)' : 'rgba(255,255,255,.18)', border: `4px solid ${light ? '#49762E' : '#fff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width={96} height={96} fill={tap ? (i === 0 ? '#E2453C' : light ? '#fff' : '#49762E') : 'none'} stroke={tap ? (i === 0 ? '#E2453C' : light ? '#fff' : '#49762E') : light ? '#49762E' : '#fff'} strokeWidth={2} strokeLinejoin="round">{ic.svg}</svg>
                  </div>
                  <div style={{ fontSize: 42, fontWeight: 800 }}>{ic.lab}</div>
                </div>
              );
            })}
          </div>
          {/* cuoricini che salgono dal mi piace */}
          {lf >= T.like && lf < T.like + 40
            ? Array.from({ length: 7 }, (_, j) => {
                const kk = (lf - T.like - j * 3) / 34;
                if (kk < 0 || kk > 1) return null;
                const hs = 36 + (j % 3) * 10;
                return <svg key={j} viewBox="0 0 24 24" width={hs} height={hs} style={{ position: 'absolute', left: 280 + Math.sin(j * 2.1) * 70 * kk - hs / 2, top: iconY - 260 * kk - j * 10, opacity: 1 - kk, transform: `scale(${0.6 + 0.6 * kk})` }} fill={j % 2 ? '#E2453C' : '#95FF00'}><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" /></svg>;
              })
            : null}
          {/* aeroplanino che vola via dal condividi */}
          {lf >= T.share && lf < T.share + 24 ? (
            <svg viewBox="0 0 24 24" width={90} height={90} style={{ position: 'absolute', left: 540 - 45 + ((lf - T.share) / 24) * 300, top: iconY - 45 - ((lf - T.share) / 24) * 320, opacity: 1 - (lf - T.share) / 24, transform: 'rotate(-20deg)' }} fill="#95FF00" stroke="#0B0F0A" strokeWidth={1.2} strokeLinejoin="round">
              <path d="M2.5 11.2 21.5 3l-6.4 18-3.4-7.6-9.2-2.2z" />
            </svg>
          ) : null}
          {/* bottone Segui: + Segui → ✓ Segui già */}
          {lf >= T.follow - 24 ? (
            <div style={{ position: 'absolute', top: followTop, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sp(T.follow - 24), transform: `scale(${followed ? 1 + 0.12 * Math.max(0, 1 - (lf - T.follow) / 10) : 0.8 + 0.2 * sp(T.follow - 24)})` }}>
              <div style={{ background: followed ? LIME : 'rgba(255,255,255,.12)', color: followed ? '#0B0F0A' : '#fff', border: `4px solid ${followed ? LIME : '#fff'}`, borderRadius: 60, padding: '16px 54px', fontSize: 46, fontWeight: 800, letterSpacing: 1 }}>
                {followed ? '✓ Segui già' : '+ Segui'}
              </div>
            </div>
          ) : null}
          {/* dito che tocca */}
          {showPointer ? (
            <>
              {ring >= 0 ? <div style={{ position: 'absolute', left: px - 45 - ring * 50, top: py - 45 - ring * 50, width: 90 + ring * 100, height: 90 + ring * 100, borderRadius: '50%', border: `5px solid ${LIME}`, opacity: 1 - ring }} /> : null}
              <div style={{ position: 'absolute', left: px - 32, top: py - 32, width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,.85)', border: `4px solid ${LIME}`, boxShadow: '0 8px 24px rgba(0,0,0,.45)', transform: `scale(${press ? 0.8 : 1})` }} />
            </>
          ) : null}
        </AbsoluteFill>
        {snd(0, 'whoosh', 0.7)}
        {!c.sfxLite ? snd(T.tap1, 'click') : null}
        {!c.sfxLite ? snd(T.type, 'tastiera', 0.8) : null}
        {snd(T.sent, 'invio')}
        {!c.sfxLite ? snd(T.sent + 2, 'brillantini', 0.8) : null}
        {snd(T.dm, 'notifica')}
        {!c.sfxLite ? snd(T.like, 'pop') : null}
        {!c.sfxLite ? snd(T.share, 'swish') : null}
        {!c.sfxLite ? snd(T.save, 'click') : null}
        {snd(T.follow, 'successo', 0.8)}   {/* cta.sfxLite (7/11, vlog v4, Oscar: «troppi suoni»): solo whoosh, invio, notifica, successo */}
      </AbsoluteFill>
    );
  }
  if (c.style === 'endcard') {
    const sp = spring({ frame: lf, fps, config: { damping: 200 } });
    return (
      <AbsoluteFill style={{ background: bg, opacity: sp, justifyContent: 'center', alignItems: 'center', padding: 80, gap: 40, flexDirection: 'column' }}>
        <Img src={logoUrl(p.assetBase, p.brand, 'onDark')} style={{ width: 640 }} />
        <div style={{ fontFamily: 'Blinker', fontWeight: 800, color: '#fff', fontSize: 76, textAlign: 'center', lineHeight: 1.08, transform: `translateY(${(1 - sp) * 60}px)` }}>
          {(c.text || '').split(kw || '\u0000').map((s: string, i: number, arr: string[]) => (
            <React.Fragment key={i}>
              {s}
              {i < arr.length - 1 ? <span style={{ background: '#fff', color: P.primary, padding: '0 16px', borderRadius: 14 }}>{kw}</span> : null}
            </React.Fragment>
          ))}
        </div>
        {c.sub ? <div style={{ fontFamily: 'Blinker', fontWeight: 600, color: '#fff', fontSize: 46, textAlign: 'center', opacity: 0.9 }}>{c.sub}</div> : null}
        <div style={{ fontSize: 90, transform: `translateY(${Math.sin(lf / 5) * 12}px)` }}>{emoji}</div>
      </AbsoluteFill>
    );
  }
  const sub = c.sub ? <div style={{ fontSize: 40, fontWeight: 600, opacity: 0.85, marginTop: 10 }}>{c.sub}</div> : null;
  const spIn = spring({ frame: lf, fps, config: { damping: 14, stiffness: 160 } });
  if (c.style === 'salva') {
    return (
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 380 }}>
        <div style={{ background: '#fff', borderRadius: 40, padding: '40px 54px', textAlign: 'center', transform: `scale(${0.7 + 0.3 * spIn})`, boxShadow: '0 20px 50px rgba(0,0,0,.35)', maxWidth: 900 }}>
          <svg viewBox="0 0 24 24" width={120} height={120} style={{ transform: `translateY(${Math.sin(lf / 6) * 6}px)` }}>
            <path d="M6 3h12v18l-6-4-6 4z" fill={P.primary} />
          </svg>
          <div style={{ fontFamily: 'Blinker', fontWeight: 800, fontSize: 64, color: '#0B0F0A', lineHeight: 1.08, marginTop: 10 }}>{txt}</div>
          {sub}
        </div>
      </AbsoluteFill>
    );
  }
  if (c.style === 'manifesto') {
    const words = String(c.text || '').split(/\s+/);
    return (
      <AbsoluteFill style={{ background: P.bg || '#F4F1E5', justifyContent: 'center', padding: 90 }}>
        <div style={{ fontFamily: 'Bebas, Anton, sans-serif', fontSize: 190, lineHeight: 0.92, color: '#0B0F0A' }}>
          {words.map((w, i) => {
            const sp = spring({ frame: lf - i * 3, fps, config: { damping: 12 } });
            const isK = kw && w.toUpperCase().includes(String(kw).toUpperCase());
            return (
              <span key={i} style={{ display: 'inline-block', marginRight: 24, opacity: sp, transform: `translateY(${(1 - sp) * 60}px)`, color: isK ? P.primary : '#0B0F0A' }}>
                {w}
              </span>
            );
          })}
        </div>
        <Img src={logoUrl(p.assetBase, p.brand, 'onLight')} style={{ position: 'absolute', bottom: 160, left: 90, height: 90 }} />
      </AbsoluteFill>
    );
  }
  if (c.style === 'pillola') {
    const pulse = 1 + 0.05 * Math.sin(lf / 4);
    return (
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 330 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(11,15,10,.85)', borderRadius: 100, padding: '22px 22px 22px 46px', transform: `translateY(${(1 - spIn) * 200}px)` }}>
          <span style={{ fontFamily: 'Blinker', fontWeight: 700, fontSize: 52, color: '#fff' }}>{String(c.text || '').replace(kw || '\u0000', '').trim() || 'Commenta'}</span>
          <span style={{ background: P.accent, color: '#0B0F0A', fontFamily: 'Blinker', fontWeight: 800, fontSize: 60, padding: '10px 36px', borderRadius: 80, transform: `scale(${pulse})` }}>{kw || 'CORRO'}</span>
        </div>
      </AbsoluteFill>
    );
  }
  if (c.style === 'profilo') {
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 860, background: '#fff', borderRadius: 44, padding: 46, boxShadow: '0 30px 70px rgba(0,0,0,.4)', transform: `scale(${0.75 + 0.25 * spIn})`, fontFamily: 'Blinker' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <div style={{ width: 150, height: 150, borderRadius: '50%', background: P.primary, display: 'grid', placeItems: 'center', border: `6px solid ${P.accent}` }}>
              <Img src={logoUrl(p.assetBase, p.brand, 'pictogramOnDark')} style={{ height: 96 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 52, color: '#0B0F0A' }}>{p.brand?.handle || '@correrenaturale'}</div>
              <div style={{ fontSize: 34, color: '#555' }}>{p.brand?.tagline || 'Running Culture'}</div>
            </div>
          </div>
          <div style={{ fontWeight: 800, fontSize: 54, color: '#0B0F0A', margin: '30px 0', lineHeight: 1.1 }}>{txt}</div>
          <div style={{ background: P.primary, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 46, padding: '20px 0', borderRadius: 20, transform: `scale(${1 + 0.03 * Math.sin(lf / 5)})` }}>Segui</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (c.style === 'comment') {
    // commento Instagram che si scrive con la parola chiave
    const typed = (kw || c.text || '').slice(0, Math.floor(interpolate(lf, [8, 30], [0, (kw || c.text || '').length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
    const ee = enterExit('slideUp', lf, fps, durF);
    return (
      <AbsoluteFill style={{ background: c.after ? bg : 'transparent', justifyContent: 'flex-end' }}>
        {c.after ? <div style={{ position: 'absolute', top: 420, left: 80, right: 80, textAlign: 'center', fontFamily: 'Blinker', fontWeight: 800, fontSize: 72, color: '#fff', lineHeight: 1.1 }}>{c.text}{sub}</div> : null}
        <div style={{ margin: '0 50px 330px', background: '#fff', borderRadius: 36, padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,.35)', fontFamily: 'Inter, sans-serif', ...ee }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#666', marginBottom: 14 }}>Commenti</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 70, height: 70, borderRadius: 40, background: 'linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)' }} />
            <div style={{ flex: 1, border: '3px solid #ddd', borderRadius: 40, padding: '16px 26px', fontSize: 44, fontWeight: 700, color: '#111' }}>
              {typed}
              <span style={{ opacity: Math.floor(lf / 8) % 2 ? 0 : 1 }}>|</span>
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#0095F6' }}>Pubblica</div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  if (c.style === 'dm') {
    const ee = enterExit('pop', lf, fps, durF);
    return (
      <AbsoluteFill style={{ background: c.after ? bg : 'rgba(0,0,0,.35)', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 860, background: '#fff', borderRadius: 44, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,.4)', fontFamily: 'Inter, sans-serif', ...ee }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '24px 30px', borderBottom: '2px solid #eee' }}>
            <div style={{ width: 70, height: 70, borderRadius: 40, background: P.primary, display: 'grid', placeItems: 'center' }}>
              <Img src={logoUrl(p.assetBase, p.brand, 'pictogramOnDark')} style={{ height: 48 }} />
            </div>
            <b style={{ fontSize: 36 }}>{p.brand?.name}</b>
          </div>
          <div style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ alignSelf: 'flex-start', background: '#EFEFEF', borderRadius: 30, padding: '18px 26px', fontSize: 40, maxWidth: '80%' }}>{c.text}</div>
            {kw ? <div style={{ alignSelf: 'flex-end', background: '#3797F0', color: '#fff', borderRadius: 30, padding: '18px 30px', fontSize: 48, fontWeight: 800, transform: `scale(${spring({ frame: lf - 18, fps, config: { damping: 12 } })})` }}>{kw}</div> : null}
          </div>
        </div>
        {c.sub ? <div style={{ marginTop: 40, color: '#fff', fontFamily: 'Blinker', fontWeight: 700, fontSize: 48 }}>{c.sub}</div> : null}
      </AbsoluteFill>
    );
  }
  if (c.style === 'button') {
    const pulse = 1 + 0.05 * Math.sin(lf / 4);
    const sp = spring({ frame: lf, fps, config: { damping: 12 } });
    return (
      <AbsoluteFill style={{ background: c.after ? bg : 'transparent', justifyContent: c.after ? 'center' : 'flex-end', alignItems: 'center', paddingBottom: c.after ? 0 : 360 }}>
        {c.after ? <div style={{ fontFamily: 'Blinker', fontWeight: 800, fontSize: 70, color: '#fff', textAlign: 'center', margin: '0 80px 50px', lineHeight: 1.1 }}>{c.text}</div> : null}
        <div style={{ transform: `scale(${sp * pulse})`, background: '#fff', color: P.primary, fontFamily: 'Blinker', fontWeight: 800, fontSize: 70, padding: '26px 60px', borderRadius: 80, boxShadow: `0 0 0 ${10 + 8 * Math.sin(lf / 4)}px rgba(255,255,255,.25), 0 20px 50px rgba(0,0,0,.35)` }}>
          {kw ? `Commenta ${kw}` : c.text} {emoji}
        </div>
        {c.sub ? <div style={{ marginTop: 34, color: '#fff', fontFamily: 'Blinker', fontWeight: 700, fontSize: 44, textShadow: '0 4px 16px rgba(0,0,0,.5)' }}>{c.sub}</div> : null}
      </AbsoluteFill>
    );
  }
  if (c.style === 'sticker') {
    const sp = spring({ frame: lf, fps, config: { damping: 9, stiffness: 180 } });
    return (
      <AbsoluteFill style={{ background: c.after ? bg : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `rotate(${-6 * sp}deg) scale(${sp})`, background: '#FFE14D', color: '#0B0F0A', fontFamily: 'Anton, sans-serif', fontSize: 92, padding: '30px 50px', borderRadius: 24, boxShadow: '12px 12px 0 #0B0F0A', textAlign: 'center', lineHeight: 1.05, maxWidth: 900, textTransform: 'uppercase' }}>
          {txt}
          {sub}
        </div>
      </AbsoluteFill>
    );
  }
  if (c.style === 'minimal') {
    const sp = spring({ frame: lf, fps, config: { damping: 200 } });
    return (
      <div style={{ position: 'absolute', left: 70, right: 70, bottom: 360, textAlign: 'center', opacity: sp, transform: `translateY(${(1 - sp) * 30}px)` }}>
        <div style={{ fontFamily: 'DMSerif, serif', fontStyle: 'italic', fontSize: 70, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.6)' }}>{c.text}</div>
        <div style={{ height: 5, background: P.accent, margin: '14px auto 0', width: `${sp * 60}%`, borderRadius: 4 }} />
      </div>
    );
  }
  if (c.style === 'arrow') {
    // freccia che indica l'icona dei commenti di Instagram (a destra)
    const sp = spring({ frame: lf, fps, config: { damping: 12 } });
    const bob = Math.sin(lf / 5) * 14;
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', right: 170, top: 1050, width: 640, textAlign: 'right', fontFamily: 'Blinker', fontWeight: 800, fontSize: 60, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.6)', opacity: sp, lineHeight: 1.1 }}>
          {txt}
          {sub}
        </div>
        <svg width={260} height={220} style={{ position: 'absolute', right: 90, top: 1240 + bob, opacity: sp }}>
          <path d="M20 20 Q 150 30 200 170 M175 140 L 202 175 L 225 135" fill="none" stroke={P.accent} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </AbsoluteFill>
    );
  }
  if (c.style === 'split') {
    // schermata finale: foto di Daniele sopra, invito sotto
    const sp = spring({ frame: lf, fps, config: { damping: 200 } });
    return (
      <AbsoluteFill style={{ background: bg }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1000, overflow: 'hidden', clipPath: `inset(0 0 ${(1 - sp) * 100}% 0)` }}>
          <Freeze frame={Math.round(Math.max(0, (p.cuts[p.cuts.length - 1]?.e ?? 1) - 1) * fps)}>
            <OffthreadVideo src={p.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Freeze>
        </div>
        <div style={{ position: 'absolute', top: 1060, left: 80, right: 80, fontFamily: 'Blinker', fontWeight: 800, fontSize: 70, color: '#fff', lineHeight: 1.1, opacity: sp }}>
          {(c.text || '').split(kw || '\u0000').map((s: string, i: number, arr: string[]) => (
            <React.Fragment key={i}>
              {s}
              {i < arr.length - 1 ? <span style={{ background: '#fff', color: P.primary, padding: '0 16px', borderRadius: 14 }}>{kw}</span> : null}
            </React.Fragment>
          ))}
          {sub}
        </div>
        <Img src={logoUrl(p.assetBase, p.brand, 'onDark')} style={{ position: 'absolute', bottom: 260, left: 80, width: 380 }} />
      </AbsoluteFill>
    );
  }
  if (c.style === 'notification') {
    const ee = enterExit('slideDown', lf, fps, durF);
    return (
      <div style={{ position: 'absolute', top: 150, left: 60, right: 60, ...ee }}>
        <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 40, padding: '26px 30px', display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,.35)', fontFamily: 'Blinker' }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: P.primary, display: 'grid', placeItems: 'center', flex: 'none' }}>
            <Img src={logoUrl(p.assetBase, p.brand, 'pictogramOnDark')} style={{ height: 70 }} />
          </div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{p.brand?.name} <span style={{ color: '#8A918C', fontWeight: 500 }}>· ora</span></div>
            <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>{txt}</div>
          </div>
        </div>
      </div>
    );
  }
  // card
  const ee = enterExit('slideUp', lf, fps, durF);
  return (
    <div style={{ position: 'absolute', bottom: 330, left: 70, right: 70, display: 'flex', justifyContent: 'center', ...ee }}>
      <div style={{ background: '#fff', borderRadius: 30, padding: '26px 36px', boxShadow: '0 20px 50px rgba(0,0,0,.35)', fontFamily: 'Blinker', fontWeight: 800, fontSize: 56, textAlign: 'center', lineHeight: 1.15, color: '#0B0F0A' }}>
        💬 {txt}
      </div>
    </div>
  );
};

const ReelBody: React.FC<ReelProps> = (p) => {
  useFonts(p.assetBase);
  const frame = useCurrentFrame();
  const { fps, durationInFrames: dAll } = useVideoConfig();
  const durationInFrames = dAll - Math.round(introSec(p) * fps);
  const t = frame / fps;
  const P = pal(p.style);
  const st = p.style || {};
  const total = totalDuration(p.cuts);
  const words = useMemo(() => outWords(p.words || [], p.cuts, st.emphWords || []), [p.words, p.cuts, st.emphWords]);
  // regola di Ross (3/11): un dato già mostrato in una scheda/animazione non si ripete nei sottotitoli
  // 5/11, Ross: con captions.alwaysOn nessuna parola viene tolta dai sottotitoli (restano completi anche sotto le grafiche)
  const capWords = useMemo(() => dedupData(words, (p.style as any)?.captions?.alwaysOn ? [] : p.effects || []), [words, p.effects, p.style]);

  // effetti che agiscono sul video
  let zoom = 1;
  let shakeX = 0;
  let shakeY = 0;
  let bw = false;
  let glitch = 0;
  let blurPx = 0;
  for (const e of p.effects || []) {
    const lt = t - e.start;
    if (lt < 0 || lt > e.duration) continue;
    const lf = Math.round(lt * fps);
    const df = Math.round(e.duration * fps);
    if (e.type === 'zoom') {
      const a = (e.props?.amount ?? 1.25) - 1;
      const inn = spring({ frame: lf, fps, config: { damping: 18, stiffness: 220 } });
      const out = interpolate(lf, [df - 6, df], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      zoom *= 1 + a * inn * out;
    } else if (e.type === 'slowzoom') {
      zoom *= 1 + ((e.props?.amount ?? 1.15) - 1) * (lt / e.duration);
    } else if (e.type === 'shake') {
      const k = (e.props?.intensity ?? 14) * (1 - lt / e.duration);
      shakeX += Math.sin(lf * 2.7) * k;
      shakeY += Math.cos(lf * 3.3) * k;
    } else if (e.type === 'bw') bw = true;
    else if (e.type === 'glitch') {
      glitch = lf % 4 < 2 ? 1 : 0.4;
      shakeX += (lf % 3 === 0 ? 24 : lf % 3 === 1 ? -18 : 8) * (1 - lt / e.duration);
    } else if (e.type === 'zoomThrough') {
      const k = lt / e.duration;
      zoom *= 1 + Math.pow(k, 2.2) * 2.2;
      blurPx = Math.max(blurPx, Math.pow(k, 2) * 18);
    } else if (e.type === 'pullBack') {
      const a = (e.props?.amount ?? 1.5) - 1;
      const k = spring({ frame: lf, fps, config: { damping: 200 } });
      zoom *= 1 + a * (1 - k);
    } else if (e.type === 'pixel') {
      const k = 1 - Math.abs(lt / e.duration - 0.5) * 2;
      blurPx = Math.max(blurPx, k * 14);
      glitch = Math.max(glitch, k > 0.5 ? 0.3 : 0);
    } else if (e.type === 'blurIn') {
      blurPx = Math.max(blurPx, (1 - lt / e.duration) * 22);
    }
  }
  const breathing = st.breathing ? 1 + 0.025 * Math.sin(t * 0.9) : 1;
  const cutZoom = (i: number, prog: number) => {
    let s = 1;
    if (st.cutZoom && i % 2 === 1) s *= 1.1;
    if (st.pushIn) s *= 1 + 0.04 * prog;
    return s;
  };
  let filter = bw ? FILTERS.bn : FILTERS[st.filter || 'none'] || 'none';
  const adj = adjustFilter(st.adjust);
  if (adj) filter = `${filter === 'none' ? '' : filter} ${adj}`;
  if (glitch) filter = `${filter === 'none' ? '' : filter} hue-rotate(${glitch * 90}deg) saturate(${1 + glitch})`;
  if (blurPx > 0.3) filter = `${filter === 'none' ? '' : filter} blur(${blurPx}px)`;
  const layout = st.layout || 'full';
  const videoTransform = `translate(${shakeX}px,${shakeY}px) scale(${zoom * breathing})`;

  let videoArea: React.ReactNode;
  if (layout === 'blur') {
    videoArea = (
      <>
        <AbsoluteFill style={{ filter: `blur(40px) brightness(.55) ${filter === 'none' ? '' : filter}`, transform: 'scale(1.2)' }}>
          <VideoStack p={p} fit="cover" muted />
        </AbsoluteFill>
        <AbsoluteFill style={{ filter, transform: videoTransform }}>
          <VideoStack p={p} fit="contain" extraScale={cutZoom} />
        </AbsoluteFill>
      </>
    );
  } else if (layout === 'frame') {
    const ar = p.srcHeight / Math.max(1, p.srcWidth);
    const w = 960;
    const h = Math.min(1180, Math.round(w * (ar > 1 ? 1.25 : ar)));
    videoArea = (
      <AbsoluteFill style={{ background: P.bg }}>
        <div style={{ position: 'absolute', top: 120, left: 60, right: 60, fontFamily: (TITLE_FONTS[st.titleFont || 'brand'] || TITLE_FONTS.brand).css, fontWeight: 800, fontSize: 74, lineHeight: 1.02, color: '#0B0F0A' }}>
          {parseEmph(st.frameTitle || p.hook?.text || '').map((x, i) => (
            <span key={i} style={x.e ? { color: P.primary, fontStyle: 'italic' } : {}}>
              {x.t}
            </span>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 430, left: 60, width: w, height: h, borderRadius: 36, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,.25)' }}>
          <div style={{ position: 'absolute', inset: 0, filter, transform: videoTransform }}>
            <VideoStack p={p} fit="cover" extraScale={cutZoom} />
          </div>
        </div>
        <Img src={logoUrl(p.assetBase, p.brand, 'onLight')} style={{ position: 'absolute', bottom: 120, left: 60, height: 90 }} />
      </AbsoluteFill>
    );
  } else if (layout === 'cinema') {
    videoArea = (
      <AbsoluteFill style={{ background: '#000' }}>
        <div style={{ position: 'absolute', top: 420, left: 0, right: 0, height: 1080, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, filter, transform: videoTransform }}>
            <VideoStack p={p} fit="cover" extraScale={cutZoom} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 170, left: 70, right: 70, textAlign: 'center', fontFamily: 'Playfair, serif', fontWeight: 800, fontSize: 70, color: '#fff', lineHeight: 1.05 }}>
          {parseEmph(st.frameTitle || p.hook?.text || '').map((x, i) => (
            <span key={i} style={x.e ? { color: P.accent, fontStyle: 'italic' } : {}}>
              {x.t}
            </span>
          ))}
        </div>
      </AbsoluteFill>
    );
  } else if (layout === 'bordo' || layout === 'polaroid') {
    const pol = layout === 'polaroid';
    videoArea = (
      <AbsoluteFill style={{ background: pol ? P.bg : P.primary }}>
        <div style={{ position: 'absolute', top: pol ? 200 : 110, left: pol ? 90 : 50, right: pol ? 90 : 50, bottom: pol ? 420 : 110, background: '#fff', padding: pol ? '28px 28px 150px' : 14, borderRadius: pol ? 6 : 44, boxShadow: '0 30px 60px rgba(0,0,0,.3)', transform: pol ? 'rotate(-1.5deg)' : 'none' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: pol ? 2 : 34 }}>
            <div style={{ position: 'absolute', inset: 0, filter, transform: videoTransform }}>
              <VideoStack p={p} fit="cover" extraScale={cutZoom} />
            </div>
          </div>
          {pol ? <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', fontFamily: 'Caveat', fontSize: 74, color: '#222' }}>{(st.frameTitle || p.hook?.text || '').replace(/\*/g, '')}</div> : null}
        </div>
      </AbsoluteFill>
    );
  } else if (layout === 'zoom') {
    videoArea = (
      <AbsoluteFill style={{ filter, transform: `${videoTransform} scale(1.35)`, transformOrigin: `${(st.focusX ?? 0.5) * 100}% ${(st.focusY ?? 0.4) * 100}%` }}>
        <VideoStack p={p} fit="cover" extraScale={cutZoom} />
      </AbsoluteFill>
    );
  } else if (layout === 'square') {
    videoArea = (
      <AbsoluteFill style={{ background: P.dark || '#0B0F0A' }}>
        <AbsoluteFill style={{ filter: 'blur(50px) brightness(.4)', transform: 'scale(1.3)' }}>
          <VideoStack p={p} fit="cover" muted />
        </AbsoluteFill>
        <div style={{ position: 'absolute', top: 420, left: 0, width: 1080, height: 1080, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, filter, transform: videoTransform }}>
            <VideoStack p={p} fit="cover" extraScale={cutZoom} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 150, left: 70, right: 70, textAlign: 'center', fontFamily: (TITLE_FONTS[st.titleFont || 'brand'] || TITLE_FONTS.brand).css, fontWeight: 800, fontSize: 76, color: '#fff', lineHeight: 1.02 }}>
          {parseEmph(st.frameTitle || p.hook?.text || '').map((x, i) => (
            <span key={i} style={x.e ? { color: P.accent } : {}}>
              {x.t}
            </span>
          ))}
        </div>
      </AbsoluteFill>
    );
  } else if (layout === 'splitTop') {
    videoArea = (
      <AbsoluteFill style={{ background: P.bg }}>
        <div style={{ position: 'absolute', top: 160, left: 70, right: 70, fontFamily: (TITLE_FONTS[st.titleFont || 'brand'] || TITLE_FONTS.brand).css, fontWeight: 800, fontSize: 80, color: '#0B0F0A', lineHeight: 1 }}>
          {parseEmph(st.frameTitle || p.hook?.text || '').map((x, i) => (
            <span key={i} style={x.e ? { color: P.primary, fontStyle: 'italic' } : {}}>
              {x.t}
            </span>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 700, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: '50px 50px 0 0' }}>
          <div style={{ position: 'absolute', inset: 0, filter, transform: videoTransform }}>
            <VideoStack p={p} fit="cover" extraScale={cutZoom} />
          </div>
        </div>
      </AbsoluteFill>
    );
  } else if (layout === 'split') {
    videoArea = (
      <AbsoluteFill style={{ background: P.primary }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1150, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, filter, transform: videoTransform }}>
            <VideoStack p={p} fit="cover" extraScale={cutZoom} />
          </div>
        </div>
      </AbsoluteFill>
    );
  } else {
    videoArea = (
      <AbsoluteFill style={{ filter, transform: videoTransform }}>
        <VideoStack p={p} fit="cover" extraScale={cutZoom} />
      </AbsoluteFill>
    );
  }

  const fullEffectActive = (p.effects || []).some((e) => FX[e.type]?.full && e.type !== 'rec' && e.type !== 'flash' && t >= e.start && t <= e.start + e.duration);
  const hs = hookStart(p, total);
  const hookFull = !introOn(p) && ['fullscreen', 'talk', 'kinetic', 'mix', 'boxed', 'typewriter', 'question'].includes(p.hook?.style) && t >= hs && t <= hs + (p.hook?.duration ?? 2.2);
  // effetti che scrivono a schermo la frase detta: i sottotitoli si nascondono (niente doppioni)
  // 5/11, Ross: con style.captions.alwaysOn i sottotitoli restano anche sotto le parole animate (c'è chi legge solo quelli)
  const kwActive = !(p.style as any)?.captions?.alwaysOn && (p.effects || []).some((e) => !e.hidden && CAP_HIDE.includes(e.type) && t >= e.start && t <= e.start + e.duration);
  const ctaStart = p.cta?.after ? total : total - Math.min(p.cta?.duration ?? 3, total);
  const ctaEnd = (['endcard', 'split', 'dm', 'manifesto', 'coaching'].includes(p.cta?.style) && t >= ctaStart) || (!!p.cta?.after && t >= total);
  const lastSrc = outToSrc(Math.max(0, total - 0.1), p.cuts);
  const curCut = cutAtOut(p, t);
  const capStyle0 = layout === 'split' ? { ...st, captions: { ...(st.captions || {}), position: 'bottom' } } : layout === 'splitTop' || layout === 'square' || layout === 'cinema' ? { ...st, captions: { ...(st.captions || {}), position: st.captions?.position === 'high' ? 'high' : 'bottom' } } : st;

  // con il fotogramma intero o diviso i sottotitoli vanno in basso, fuori dalla grafica
  const capStyle = (curCut?.frame === 'intero' || curCut?.frame === 'diviso') && typeof capStyle0.captions?.y !== 'number' ? { ...capStyle0, captions: { ...(capStyle0.captions || {}), position: curCut.frame === 'diviso' ? 'low' : 'bottom' } } : capStyle0;
  // musica con ducking
  const speech = (sec: number) => words.some((w) => sec >= w.start - 0.15 && sec <= w.end + 0.25);
  const mv = p.audio?.musicVolume ?? 0.12;
  const sfxV = p.audio?.sfxVolume ?? 0.4;
  const sfxOn = p.audio?.sfxOn !== false && p.mode !== 'overlay';
  const starts = cutStarts(p.cuts);

  // persona scontornata sopra la «scritta dietro la persona»
  const cutoutActive = !!(p as any).cutoutFrames?.length && (p.effects || []).some((e) => isBehind(e) && t >= e.start && t <= e.start + e.duration);
  let personLayer: React.ReactNode = null;
  if (cutoutActive) {
    if (layout === 'blur')
      personLayer = (
        <AbsoluteFill style={{ filter, transform: videoTransform }}>
          <VideoStack p={p} fit="contain" extraScale={cutZoom} cut />
        </AbsoluteFill>
      );
    else if (layout === 'zoom')
      personLayer = (
        <AbsoluteFill style={{ filter, transform: `${videoTransform} scale(1.35)`, transformOrigin: `${(st.focusX ?? 0.5) * 100}% ${(st.focusY ?? 0.4) * 100}%` }}>
          <VideoStack p={p} fit="cover" extraScale={cutZoom} cut />
        </AbsoluteFill>
      );
    else if (layout === 'full')
      personLayer = (
        <AbsoluteFill style={{ filter, transform: videoTransform }}>
          <VideoStack p={p} fit="cover" extraScale={cutZoom} cut />
        </AbsoluteFill>
      );
  }
  const mode = p.mode || 'full';
  if (mode === 'clean') {
    return <AbsoluteFill style={{ background: '#000' }}>{videoArea}</AbsoluteFill>;
  }
  const ov = mode === 'overlay';
  return (
    <AbsoluteFill style={{ background: ov ? 'transparent' : '#000', fontFamily: 'Blinker, Inter, sans-serif' }}>
      <AbsoluteFill data-rs-frame="1" style={{ pointerEvents: 'none' }} />
      {ov ? null : videoArea}
      {st.gradient !== false && !['frame', 'bordo', 'polaroid', 'splitTop', 'square', 'cinema'].includes(layout) ? (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)' }} />
      ) : null}
      {st.vignette || st.adjust?.vignette ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${st.adjust?.vignette ?? 0.55}) 100%)` }} /> : null}
      {st.adjust?.grain ? <Grain amount={st.adjust.grain} frame={frame} /> : null}

      {(p.effects || [])
        .filter((e) => isBehind(e))
        .map((e) => {
          const from = Math.round(e.start * fps);
          const dur = Math.max(2, Math.round(e.duration * fps));
          return (
            <Sequence key={e.id} from={from} durationInFrames={dur} layout="none">
              <FxWrap e={e} p={p} P={P} dur={dur} />
            </Sequence>
          );
        })}
      {cutoutActive && !ov ? personLayer : null}
      {(p.effects || []).map((e) => {
        const def = FX[e.type];
        if (!def || def.video || isBehind(e)) return null;
        const from = Math.round(e.start * fps);
        const dur = Math.max(2, Math.round(e.duration * fps));
        return (
          <Sequence key={e.id} from={from} durationInFrames={dur} layout="none">
            <FxWrap e={e} p={p} P={P} dur={dur} />
          </Sequence>
        );
      })}

      {!fullEffectActive && !(hookFull && !p.hook?.captions) && !ctaEnd && !kwActive ? (   // hook.captions (7/11, vlog v4): sottotitoli anche sotto l'hook (voce fuori campo)
        <TF id="__captions" tf={st.captions?.tf}>
          <Captions words={capWords} t={t} fps={fps} style={capStyle} P={P} />
        </TF>
      ) : null}

      {st.logo !== false && layout !== 'frame' && !hookFull && !ctaEnd ? (
        <Img src={logoUrl(p.assetBase, p.brand, st.logoKind || 'pictogramOnDark')} style={{ position: 'absolute', top: st.logoPos === 'bottom' ? undefined : 120, bottom: st.logoPos === 'bottom' ? 140 : undefined, right: 60, height: st.logoKind === 'onDark' ? 70 : 96, opacity: 0.92 }} />
      ) : null}

      {st.progressBar ? (
        <div style={{ position: 'absolute', left: 0, top: 0, height: 12, width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`, background: P.accent }} />
      ) : null}

      {t >= hs && t <= hs + (p.hook?.duration ?? 2.2) && !introOn(p) ? (
        <Sequence from={Math.round(hs * fps)} layout="none">
          <TF id="__hook" tf={p.hook?.tf}>
            <Hook p={p} t={t - hs} P={P} />
          </TF>
        </Sequence>
      ) : null}
      {p.cta?.after && t >= total && !ov && !['endcard', 'manifesto', 'split'].includes(p.cta?.style) ? (
        <AbsoluteFill>
          <AbsoluteFill style={{ filter: 'blur(26px) brightness(.5)', transform: 'scale(1.15)' }}>
            <Freeze frame={Math.round(lastSrc * fps)}>
              <OffthreadVideo src={p.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Freeze>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      {/* verso la CTA: dissolvenza nel colore del brand, mai il nero */}
      {p.cta?.after && p.cta?.style === 'coaching' && t >= total - 0.3 && t < total + 1 ? (
        <AbsoluteFill style={{ background: p.cta?.variant === 'cream' ? '#F4F1E5' : p.cta?.variant === 'video' ? '#0E170A' : '#2C4A1B', opacity: interpolate(t, [total - 0.3, total], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
      ) : null}
      <TF id="__cta" tf={p.cta?.tf}>
        <Cta p={p} t={t} total={total} P={P} />
      </TF>

      {/* AUDIO */}
      {!ov && p.audio?.music ? <Audio
          src={musicUrl(p.assetBase, p.audio.music)}
          loop
          volume={(f) => {
            const tt = f / fps;
            let v = p.audio?.ducking !== false && speech(tt) ? mv : mv * 1.8;
            if (p.cta?.after && tt >= total) v = Math.max(v, mv * 2.2); // sulla schermata finale la musica sale
            if (((p.audio as any)?.voiceovers || []).some((vo: any) => tt >= vo.at - 0.2 && tt <= vo.at + (vo.dur || 0) + 0.3)) v = mv * 0.5; // sotto la voce fuori campo
            const end = durationInFrames / fps;
            if (tt > end - 1) v *= Math.max(0, end - tt); // dissolvenza finale
            return v;
          }}
        /> : null}
      {!ov
        ? ((p.audio as any)?.voiceovers || []).map((vo: any, i: number) => (
            <Sequence key={'vo' + i} from={Math.round(vo.at * fps)} layout="none">
              <Audio src={String(vo.src).startsWith('/') ? p.assetBase + vo.src : vo.src} volume={vo.volume ?? 1} />
            </Sequence>
          ))
        : null}
      {sfxOn && !ov
        ? (p.effects || []).map((e) => {
            const sx = e.sfx === undefined ? FX[e.type]?.sfx : e.sfx;
            return sx ? (
              <Sequence key={'s' + e.id} from={Math.max(0, Math.round((e.start + ((e as any).sfxOffset || 0)) * fps) - (sx === 'riser' ? Math.round(1.2 * fps) : 0))} durationInFrames={Math.round(2.5 * fps)} layout="none">
                <Audio src={sfxUrl(p.assetBase, sx)} volume={sfxV * ((e as any).sfxVol ?? 1)} />
              </Sequence>
            ) : null;
          })
        : null}
      {sfxOn && p.hook?.text && p.hook?.sfx && !introOn(p) ? (
        <Sequence from={Math.round(hs * fps)} durationInFrames={Math.round(2 * fps)} layout="none">
          <Audio src={sfxUrl(p.assetBase, p.hook.sfx)} volume={sfxV} />
        </Sequence>
      ) : null}
      {sfxOn && p.cta?.text && p.cta?.sfx ? (
        <Sequence from={Math.max(0, Math.round(ctaStart * fps))} durationInFrames={Math.round(2 * fps)} layout="none">
          <Audio src={sfxUrl(p.assetBase, p.cta.sfx)} volume={sfxV} />
        </Sequence>
      ) : null}
      {sfxOn && p.audio?.sfxOnCuts
        ? starts.slice(1).map((s, i) => (
            <Sequence key={'c' + i} from={Math.max(0, Math.round((s - 0.12) * fps))} durationInFrames={Math.round(0.6 * fps)} layout="none">
              <Audio src={sfxUrl(p.assetBase, 'whoosh-veloce')} volume={sfxV * 0.45} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};

// altezza indicativa delle grafiche (serve per non coprire il volto)
const BOXH: Record<string, number> = { bigNumber: 300, counter: 330, dataCard: 260, checklist: 380, mythTruth: 330, tipCard: 260, notification: 200, typing: 220, comment: 200, badge: 130, strike: 150, progress: 300, stopwatch: 200, polaroid: 560, chapter: 180, logoSting: 260 };
export const cutAtOut = (p: ReelProps, t: number): any => {
  const st0 = cutStarts(p.cuts);
  for (let i = p.cuts.length - 1; i >= 0; i--) if (t >= st0[i] - 1e-3) return p.cuts[i];
  return p.cuts[0];
};
const CAP_HIDE = ['keyword', 'mixTitle', 'question', 'typing', 'shatterWord', 'duoGlow', 'docTitle', 'postit', 'promptBar', 'notif', 'stamp', 'swipe', 'behindTitle', 'kinetic', 'stageCard'];
// effetti che vanno DIETRO la persona scontornata (cutout e quelli con behind: true nel registro)
const isBehind = (e: any) => e.type === 'cutout' || !!FX[e.type]?.behind;
// ---- sottotitoli senza doppioni: numeri e parole (4+ lettere) già scritti in un effetto attivo vengono tolti ----
const normTok = (x: string) =>
  String(x || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/(\d)[.,'](?=\d{3}(\D|$))/g, '$1')
    .replace(/[^a-z0-9%]/g, '');
export const dedupData = (words: any[], effects: any[]) => {
  const zones = effects
    .filter((e) => !e.hidden && FX[e.type] && !FX[e.type].video && !['broll', 'stage'].includes(e.type))
    .map((e) => {
      // la parola a comparsa non deve ricomparire nel sottotitolo né subito prima né subito dopo
      const big = CAP_HIDE.includes(e.type);
      const toks = new Set<string>();
      String(JSON.stringify(e.props || {}, (k, v) => (typeof v === 'number' || ['src', 'v', 'inner', 'win', 'from', 't'].includes(k) ? undefined : v)))
        .split(/[\s"*,:;!?()\[\]{}~+\-→]+/)
        .map(normTok)
        .filter(Boolean)
        .forEach((k) => (toks.add(k), toks.add(k.replace(/%$/, ''))));
      return { a: e.start - (big ? 1.5 : 0.5), b: e.start + e.duration + (big ? 1.0 : 0), toks };
    });
  const hit = words.map((w) => {
    const n = normTok(w.text);
    if (!n || !(/\d/.test(n) || n.length >= 4)) return false;
    return zones.some((z) => w.start >= z.a && w.start <= z.b && (z.toks.has(n) || z.toks.has(n.replace(/%$/, ''))));
  });
  // le parole brevi attaccate a un dato tolto (del, di, a, da…) vanno via con lui, così non restano frammenti
  const drop = hit.map((h, i) => h || (normTok(words[i].text).length <= 3 && ((hit[i - 1] && words[i].start - words[i - 1].end < 0.3) || (hit[i + 1] && words[i + 1].start - words[i].end < 0.3))));
  return words.filter((_, i) => !drop[i]);
};

// zona del volto nel momento t: dipende dall'inquadratura del pezzo (le grafiche la evitano)
export const faceZone = (p: ReelProps, t?: number) => {
  const fz = p.style?.faceZone;
  if (fz && fz.on === false) return null;
  const c = t !== undefined ? cutAtOut(p, t) : null;
  if (c?.frame === 'intero') return { y0: 0.33 * 1920, y1: 0.67 * 1920 };
  if (c?.frame === 'diviso') return { y0: 0.47 * 1920, y1: 0.9 * 1920 };
  if (c?.frame === 'volto' && c.fy !== undefined) return { y0: Math.max(0.05, c.fy - 0.15) * 1920, y1: Math.min(0.95, c.fy + 0.15) * 1920 };
  const y0 = fz?.y0 ?? 0.17;
  const y1 = fz?.y1 ?? 0.42;
  return { y0: y0 * 1920, y1: y1 * 1920 };
};

const FxWrap: React.FC<{ e: any; p: ReelProps; P: any; dur: number }> = ({ e, p, P, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const def = FX[e.type];
  if (e.hidden) return null;
  // stile del testo cambiato a mano su qualsiasi grafica (font, colore, contorno, ombra, maiuscolo, allineamento…)
  const tx = e.txt || {};
  const fontCss = tx.font ? TITLE_FONTS[tx.font]?.css || tx.font : null;
  const rules = [
    fontCss ? `font-family:${fontCss}!important` : '',
    tx.color ? `color:${tx.color}!important;-webkit-text-fill-color:${tx.color}!important` : '',
    tx.weight ? `font-weight:${tx.weight}!important` : '',
    tx.italic ? 'font-style:italic!important' : '',
    tx.upper === true ? 'text-transform:uppercase!important' : tx.upper === false ? 'text-transform:none!important' : '',
    tx.letter !== undefined ? `letter-spacing:${tx.letter}px!important` : '',
    tx.lineH ? `line-height:${tx.lineH}!important` : '',
    tx.align ? `text-align:${tx.align}!important` : '',
    tx.strokeW !== undefined ? `-webkit-text-stroke:${tx.strokeW}px ${tx.strokeColor || '#0B0F0A'}!important;paint-order:stroke fill` : '',
    tx.shadow === 'no' ? 'text-shadow:none!important' : tx.shadow === 'morbida' ? 'text-shadow:0 8px 24px rgba(0,0,0,.45)!important' : tx.shadow === 'dura' ? 'text-shadow:6px 6px 0 #0B0F0A!important' : tx.shadow === 'bagliore' ? 'text-shadow:0 0 22px rgba(184,215,234,.95)!important' : '',
  ].filter(Boolean);
  const css = rules.length ? `[data-fxid="${e.id}"] *{${rules.join(';')}}` : '';
  return (
    <TF id={e.id} tf={e.tf}>
    {css ? <style>{css}</style> : null}
    <EffectLayer
      type={e.type}
      c={{
        frame,
        fps,
        dur,
        P,
        brand: p.brand,
        assetBase: p.assetBase,
        titleFont: e.props?.font || p.style?.titleFont || 'brand',
        videoUrl: p.videoUrl,
        props: { ...(def?.props || {}), ...(e.props || {}) },
        anim: e.anim || def?.anim || 'pop',
        position: e.position || def?.pos || 'upper',
        srcAt: (o: number) => outToSrc(o, p.cuts),
        start: e.start,
        face: faceZone(p, e.start + e.duration / 2),
        boxH: BOXH[e.type] || 300,
      }}
    />
    </TF>
  );
};

export const reelDuration = (p: ReelProps) => Math.max(1, Math.round((totalDuration(p.cuts) + introSec(p) + (p.mode !== 'clean' && p.cta?.after && p.cta?.style !== 'none' && p.cta?.text ? p.cta?.duration ?? 4 : 0)) * p.fps));

// ---- posizione dell'hook: sopra l'inizio (predefinito), punto a scelta, alla fine, oppure come apertura prima del video ----
export const introOn = (p: ReelProps) => (p as any).hook?.pos === 'apertura' && !!p.hook?.text && p.hook?.style !== 'none' && p.mode !== 'clean' && p.mode !== 'overlay';
export const introSec = (p: ReelProps) => (introOn(p) ? (p as any).hook.introDur ?? 1.8 : 0);
export const hookStart = (p: ReelProps, total: number) => {
  const h: any = p.hook || {};
  if (h.pos === 'fine') return Math.max(0, total - (h.duration ?? 2.2) - 0.2);
  if (h.pos === 'punto') return Math.max(0, Math.min(total - 0.5, h.start || 0));
  return 0;
};
const IntroCard: React.FC<{ p: ReelProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = pal(p.style);
  const f = TITLE_FONTS[p.style?.titleFont || 'brand'] || TITLE_FONTS.brand;
  const words = String(p.hook?.text || '').split(/\s+/);
  const t0 = p.cuts[0]?.s || 0;
  return (
    <AbsoluteFill style={{ background: '#0B0F0A' }}>
      <AbsoluteFill style={{ filter: 'blur(30px) brightness(.45)', transform: 'scale(1.2)' }}>
        <Freeze frame={Math.round(t0 * fps)}>
          <OffthreadVideo src={p.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Freeze>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {p.hook?.kicker ? <div style={{ alignSelf: 'flex-start', background: P.primary, color: '#fff', fontFamily: 'Blinker', fontWeight: 800, fontSize: 46, padding: '8px 26px', borderRadius: 40, marginBottom: 30, opacity: Math.min(1, frame / 6) }}>{p.hook.kicker}</div> : null}
        <div style={{ fontFamily: f.css, fontWeight: f.weight as any, fontSize: 118, lineHeight: 1.02, color: '#fff' }}>
          {words.map((w, i) => {
            const sp = spring({ frame: frame - 4 - i * 3, fps, config: { damping: 12, stiffness: 180 } });
            const e = /\*/.test(w);
            return (
              <span key={i} style={{ display: 'inline-block', marginRight: '0.25em', opacity: sp, transform: `translateY(${(1 - sp) * 50}px)`, color: e ? P.accent : '#fff', fontStyle: e && f.italicEmph ? 'italic' : 'normal' }}>
                {w.replace(/\*/g, '')}
              </span>
            );
          })}
        </div>
      </div>
      {p.hook?.sfx && p.audio?.sfxOn !== false ? <Audio src={sfxUrl(p.assetBase, p.hook.sfx)} volume={p.audio?.sfxVolume ?? 0.4} /> : null}
    </AbsoluteFill>
  );
};
export const Reel: React.FC<ReelProps> = (p) => {
  const { fps } = useVideoConfig();
  const n = Math.round(introSec(p) * fps);
  if (!n) return <ReelBody {...p} />;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={n} layout="none">
        <IntroCard p={p} />
      </Sequence>
      <Sequence from={n} layout="none">
        <ReelBody {...p} />
      </Sequence>
    </AbsoluteFill>
  );
};
