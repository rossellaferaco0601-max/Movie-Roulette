// Effetti aggiunti il 3/11 su richiesta di Ross (reference «7 effetti»): box che si illuminano,
// post-it, widget in vetro, titolo documentario, schermo diviso con grafico, titolo spotlight, checklist in vetro.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring } from 'remotion';
import type { FxCtx } from './effects';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const G = '#49762E';
const AZ = '#B8D7EA';
const CR = '#F4F1E5';
const sec = (c: FxCtx) => c.frame / c.fps;
const fadeOut = (c: FxCtx, n = 6) => interpolate(c.frame, [c.dur - n, c.dur], [1, 0], clamp);
const glass: React.CSSProperties = {
  background: 'rgba(20,28,16,.38)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '2px solid rgba(255,255,255,.32)',
  boxShadow: '0 18px 50px rgba(0,0,0,.28)',
  borderRadius: 36,
};
// *parola* = enfasi
const em = (s: string, color: string, extra: React.CSSProperties = {}) =>
  String(s || '')
    .split(/(\*[^*]+\*)/)
    .map((x, i) => (x.startsWith('*') ? <span key={i} style={{ color, ...extra }}>{x.slice(1, -1)}</span> : <span key={i}>{x}</span>));

// 1) Due (o più) box grandi al centro: si illuminano quando Daniele nomina la voce (props.items[].at = secondi dall'inizio)
export const DuoGlow: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: { title: string; sub?: string; at: number }[] = c.props.items || [];
  const t = sec(c);
  const cur = items.reduce((k, it, i) => (t >= it.at - 0.05 ? i : k), -1);
  const inn = spring({ frame: c.frame, fps: c.fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 46, flexDirection: 'column', opacity: fadeOut(c), paddingBottom: 120 }}>
      {items.map((it, i) => {
        const on = i === cur;
        const k = spring({ frame: c.frame - Math.round(it.at * c.fps), fps: c.fps, config: { damping: 11, stiffness: 160 } });
        const lit = on ? k : 0;
        return (
          <div
            key={i}
            style={{
              width: 940,
              padding: '44px 50px',
              borderRadius: 44,
              background: on ? G : 'rgba(255,255,255,.9)',
              color: on ? '#fff' : '#0B0F0A',
              opacity: (on || i < cur ? 1 : 0.62) * inn,
              transform: `translateY(${(1 - inn) * 80}px) scale(${0.95 + 0.07 * lit})`,
              boxShadow: on ? `0 0 0 8px ${AZ}, 0 0 ${40 + 50 * lit}px rgba(184,215,234,.95), 0 24px 60px rgba(0,0,0,.35)` : '0 18px 50px rgba(0,0,0,.3)',
              fontFamily: 'Blinker, sans-serif',
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 112, letterSpacing: 2, lineHeight: 1 }}>{it.title}</div>
            {it.sub ? <div style={{ fontWeight: 700, fontSize: 54, marginTop: 12, opacity: 0.92 }}>{it.sub}</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 2) Post-it crema con nastro: righe che compaiono al loro tempo; style "strike" = frase barrata
export const PostIt: React.FC<{ c: FxCtx }> = ({ c }) => {
  const lines: { text: string; at?: number; style?: string }[] = c.props.lines || [];
  const t = sec(c);
  const sp = spring({ frame: c.frame, fps: c.fps, config: { damping: 12, stiffness: 140 } });
  const top = (c.props.y ?? 0.5) * 1920;
  return (
    <div style={{ position: 'absolute', left: 90, width: 900, top, opacity: fadeOut(c), transform: `translateY(${(1 - sp) * -260}px) rotate(${-2.5 + (1 - sp) * -8}deg) scale(${c.props.scale ?? 1})`, transformOrigin: 'top center' }}>
      <div style={{ position: 'absolute', left: 330, top: -34, width: 240, height: 66, background: 'rgba(184,215,234,.82)', transform: 'rotate(3deg)', borderRadius: 6 }} />
      <div style={{ background: CR, borderRadius: 10, padding: '64px 60px 56px', boxShadow: '0 26px 60px rgba(0,0,0,.4)', fontFamily: 'Blinker, sans-serif', color: '#0B0F0A' }}>
        {lines.map((l, i) => {
          const k = spring({ frame: c.frame - Math.round((l.at ?? 0) * c.fps), fps: c.fps, config: { damping: 14 } });
          if (t < (l.at ?? 0) - 0.05) return null;
          const strike = l.style === 'strike';
          const small = strike || l.style === 'small';
          const sw = interpolate(c.frame - Math.round((l.at ?? 0) * c.fps), [8, 22], [0, 100], clamp);
          return (
            <div key={i} style={{ position: 'relative', fontWeight: 800, fontSize: small ? 52 : 92, lineHeight: 1.04, marginTop: i ? 26 : 0, opacity: small ? 0.6 * k : k, transform: `translateY(${(1 - k) * 30}px)` }}>
              {em(l.text, G)}
              {strike ? <span style={{ position: 'absolute', left: 0, top: '52%', height: 8, width: `${sw}%`, background: G, borderRadius: 4 }} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3) Widget in vetro smerigliato (numero grande + etichetta) con posizione libera
export const GlassStats: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: { big: string; label: string; at: number; x: number; y: number; w?: number; accent?: boolean }[] = c.props.items || [];
  return (
    <AbsoluteFill style={{ opacity: fadeOut(c) }}>
      {items.map((it, i) => {
        const k = spring({ frame: c.frame - Math.round(it.at * c.fps), fps: c.fps, config: { damping: 12, stiffness: 170 } });
        if (c.frame < it.at * c.fps - 1) return null;
        return (
          <div key={i} style={{ ...glass, position: 'absolute', left: it.x * 1080, top: it.y * 1920, width: (it.w ?? 0.42) * 1080, padding: '30px 34px', transform: `scale(${0.6 + 0.4 * k})`, opacity: k, fontFamily: 'Blinker, sans-serif', color: '#fff' }}>
            <div style={{ fontWeight: 800, fontSize: 124, lineHeight: 1, color: it.accent ? AZ : '#fff' }}>{it.big}</div>
            <div style={{ fontWeight: 700, fontSize: 40, marginTop: 8, opacity: 0.95 }}>{it.label}</div>
            <div style={{ marginTop: 18, height: 10, borderRadius: 6, background: 'rgba(255,255,255,.25)' }}>
              <div style={{ height: 10, borderRadius: 6, width: `${interpolate(k, [0, 1], [0, (it as any).bar ?? 100])}%`, background: it.accent ? AZ : G }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 4) Titolo «documentario»: due righe enormi in alto (usare insieme all'effetto bw)
export const DocTitle: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = spring({ frame: c.frame, fps: c.fps, config: { damping: 15, stiffness: 170 } });
  const k2 = spring({ frame: c.frame - 5, fps: c.fps, config: { damping: 15, stiffness: 170 } });
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: (c.props.y ?? 0.08) * 1920, opacity: fadeOut(c), fontFamily: 'Blinker, sans-serif', textAlign: 'right', textShadow: '0 8px 30px rgba(0,0,0,.5)' }}>
      <div style={{ fontWeight: 800, fontSize: 150, lineHeight: 0.95, color: '#fff', textTransform: 'uppercase', transform: `translateX(${(1 - k) * 200}px)`, opacity: k }}>{c.props.l1}</div>
      <div style={{ fontWeight: 800, fontSize: 150, lineHeight: 0.95, textTransform: 'uppercase', transform: `translateX(${(1 - k2) * 200}px)`, opacity: k2 }}>
        <span style={{ background: G, color: '#fff', padding: '0 22px', borderRadius: 14 }}>{c.props.l2}</span>
      </div>
    </div>
  );
};

// 5) Schermo diviso: grafico su crema in alto, Daniele sotto (stesso momento del video)
export const SplitChart: React.FC<{ c: FxCtx }> = ({ c }) => {
  const bars: { label: string; value: number; color?: string }[] = c.props.bars || [];
  const inn = spring({ frame: c.frame, fps: c.fps, config: { damping: 200 } });
  const src = c.props.t ?? c.srcAt(c.start);
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn * 1.5, 1) * fadeOut(c, 5) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 900, background: CR, padding: '120px 80px 0', fontFamily: 'Blinker, sans-serif' }}>
        <div style={{ fontWeight: 800, fontSize: 76, color: '#0B0F0A', lineHeight: 1.02 }}>{em(c.props.title || '', G, { fontFamily: 'DMSerif, Georgia, serif', fontStyle: 'italic', fontWeight: 400 })}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 70, height: 470, marginTop: 50, borderBottom: '4px solid #0B0F0A' }}>
          {bars.map((b, i) => {
            const g = spring({ frame: c.frame - 6 - i * 8, fps: c.fps, config: { damping: 18, stiffness: 90 } });
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ width: '100%', height: `${b.value * 100 * g}%`, background: b.color || (i ? AZ : G), borderRadius: '24px 24px 0 0' }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 70, marginTop: 16 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 44, color: '#0B0F0A' }}>{b.label}</div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 900, bottom: 0, overflow: 'hidden', borderTop: `8px solid ${G}`, background: '#000' }}>
        <Sequence from={0} layout="none">
          <OffthreadVideo src={c.videoUrl} muted trimBefore={Math.round(src * c.fps)} style={{ position: 'absolute', left: 0, width: '100%', top: -60, height: 1300, objectFit: 'cover', objectPosition: `${(c.props.fx ?? 0.46) * 100}% 20%` }} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

// 6) Spotlight: vignetta scura e parola enorme in serif in alto
export const SpotTitle: React.FC<{ c: FxCtx }> = ({ c }) => {
  const k = spring({ frame: c.frame, fps: c.fps, config: { damping: 200 } });
  const blur = interpolate(c.frame, [0, 8], [14, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeOut(c) }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 30%, rgba(0,0,0,.78) 75%)', opacity: k }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: (c.props.y ?? 0.05) * 1920, textAlign: 'center', fontFamily: 'DMSerif, Georgia, serif', fontStyle: 'italic', fontSize: c.props.size || 210, color: CR, filter: `blur(${blur}px)`, opacity: k, textShadow: '0 10px 40px rgba(0,0,0,.6)', letterSpacing: -2 }}>
        {c.props.text}
      </div>
      {c.props.sub ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: (c.props.y ?? 0.05) * 1920 + (c.props.size || 210) * 1.12, textAlign: 'center', fontFamily: 'Blinker, sans-serif', fontWeight: 800, fontSize: 48, letterSpacing: 8, color: AZ, opacity: k, textTransform: 'uppercase' }}>{c.props.sub}</div>
      ) : null}
    </AbsoluteFill>
  );
};

// 7) Checklist in vetro: le voci si spuntano (o si barrano) al loro tempo
export const GlassList: React.FC<{ c: FxCtx }> = ({ c }) => {
  const items: { text: string; at: number }[] = c.props.items || [];
  const x = c.props.mode === 'x';
  const inn = spring({ frame: c.frame, fps: c.fps, config: { damping: 15 } });
  return (
    <div style={{ ...glass, position: 'absolute', left: 80, width: 920, top: (c.props.y ?? 0.47) * 1920, padding: '36px 44px', opacity: inn * fadeOut(c), transform: `translateY(${(1 - inn) * 60}px) scale(${c.props.scale ?? 1})`, transformOrigin: 'top center', fontFamily: 'Blinker, sans-serif', color: '#fff' }}>
      {c.props.title ? <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 5, textTransform: 'uppercase', color: AZ, marginBottom: 16 }}>{c.props.title}</div> : null}
      {items.map((it, i) => {
        const k = spring({ frame: c.frame - Math.round(it.at * c.fps), fps: c.fps, config: { damping: 12 } });
        const on = c.frame >= it.at * c.fps;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, fontWeight: 800, fontSize: 58, padding: '10px 0', opacity: on ? 1 : 0.45 }}>
            <div style={{ width: 62, height: 62, borderRadius: 31, border: '4px solid rgba(255,255,255,.7)', background: on ? (x ? '#B0453A' : G) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, transform: `scale(${on ? 0.7 + 0.3 * k : 1})` }}>{on ? (x ? '✕' : '✓') : ''}</div>
            <div>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

export const FX_CN: Record<string, any> = {
  duoGlow: { name: 'Box grandi che si illuminano', cat: 'Schede & UI', dur: 4, sfx: null, anim: 'cut', pos: 'center', props: { items: [{ title: 'LIFESPAN', sub: 'quanti anni vivi', at: 0.3 }, { title: 'HEALTHSPAN', sub: 'quanti anni vivi bene', at: 2 }] }, fields: [], C: DuoGlow },
  postit: { name: 'Post-it con frase', cat: 'Pop-up & sticker', dur: 3, sfx: null, anim: 'cut', pos: 'center', props: { lines: [{ text: 'Frase *chiave*', at: 0 }], y: 0.5 }, fields: [], C: PostIt },
  glassStats: { name: 'Widget in vetro (numeri)', cat: 'Grafici & numeri', dur: 4, sfx: null, anim: 'cut', pos: 'center', props: { items: [] }, fields: [], C: GlassStats },
  docTitle: { name: 'Titolo documentario', cat: 'Testo gigante', dur: 2.4, sfx: null, anim: 'cut', pos: 'top', props: { l1: 'Titolo', l2: 'evidenziato' }, fields: [], C: DocTitle },
  splitChart: { name: 'Schermo diviso con grafico', cat: 'Grafici & numeri', dur: 3.5, sfx: null, anim: 'cut', pos: 'center', props: { title: 'Titolo *serif*', bars: [{ label: 'A', value: 1 }, { label: 'B', value: 0.7 }] }, fields: [], C: SplitChart },
  spotTitle: { name: 'Titolo spotlight (serif)', cat: 'Visual hook', dur: 1.8, sfx: null, anim: 'cut', pos: 'top', props: { text: 'Parola', sub: '' }, fields: [], C: SpotTitle },
  glassList: { name: 'Checklist in vetro', cat: 'Schede & UI', dur: 4, sfx: null, anim: 'cut', pos: 'center', props: { title: '', items: [], mode: 'check' }, fields: [], C: GlassList },
};
