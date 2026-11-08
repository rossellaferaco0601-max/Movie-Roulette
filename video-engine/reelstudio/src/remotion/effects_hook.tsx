// Hook visivi «primi secondi» per i reel Correre Naturale (6/11/2026, idee di Ross dalle immagini generate: tachimetro
// sopra la testa, corpo con le centrali energetiche, ciclo grassi/carboidrati/energia…), tradotti in SVG nei colori del
// brand (verde #49762E, azzurro #B8D7EA, crema #F4F1E5, bianco; lime solo come accento) e senza mai coprire il volto.
// Due effetti: hkBack (dietro la persona scontornata: archi, anelli, cicli, punti) e hkFront (davanti: sagome, badge,
// icone, corpo, calendario, lucchetto, raggi). Il «kind» nei props sceglie la variante; coordinate in frazioni del quadro.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring } from 'remotion';
import type { FxCtx } from './effects';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const G = '#49762E';
const LIME = '#95FF00';
const CR = '#F4F1E5';
const AZ = '#B8D7EA';
const INK = '#0B0F0A';
const FONT = 'Blinker, sans-serif';
const W = 1080;
const H = 1920;
const fr = (c: FxCtx, s: number) => Math.round(s * c.fps);
const sp = (c: FxCtx, s = 0, cfg: any = { damping: 13, stiffness: 150 }) => spring({ frame: c.frame - fr(c, s), fps: c.fps, config: cfg });
const ease = (c: FxCtx, s: number, d: number) => interpolate(c.frame, [fr(c, s), fr(c, s + d)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const fadeOut = (c: FxCtx, n = 6) => interpolate(c.frame, [c.dur - n, c.dur], [1, 0], clamp);
const px = (v: number | undefined, def: number, base = W) => (v === undefined ? def : v <= 1.5 ? v * base : v);
const dash = (k: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: Math.max(0, 1 - k) } as any);
const DEG = Math.PI / 180;
// punti di un arco (gradi schermo: 0 = destra, 90 = basso), in senso orario
const arcPts = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 90) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (a0 + ((a1 - a0) * i) / n) * DEG;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as [number, number];
  });
const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
// freccia in punta a un tratto (direzione dal penultimo all'ultimo punto)
const Arrow: React.FC<{ pts: [number, number][]; k: number; color: string; size?: number }> = ({ pts, k, color, size = 34 }) => {
  if (k <= 0.02) return null;
  const i = Math.min(pts.length - 1, Math.max(1, Math.round(k * (pts.length - 1))));
  const [x, y] = pts[i];
  const [px0, py0] = pts[i - 1];
  const ang = (Math.atan2(y - py0, x - px0) / DEG) + 90;
  return <path d={`M0,${-size} L${size * 0.62},${size * 0.1} L0,${-size * 0.2} L${-size * 0.62},${size * 0.1} Z`} fill={color} transform={`translate(${x},${y}) rotate(${ang})`} />;
};
const Defs: React.FC<{ id: string; glow?: string }> = ({ id, glow = AZ }) => (
  <defs>
    <filter id={`sh-${id}`} x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.55" />
    </filter>
    <filter id={`gl-${id}`} x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.5" />
      <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor={glow} floodOpacity="0.6" />
    </filter>
    <linearGradient id={`gr-${id}`} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor={CR} />
      <stop offset="0.5" stopColor={AZ} />
      <stop offset="1" stopColor={G} />
    </linearGradient>
  </defs>
);
const Svg: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0, opacity, overflow: 'visible' }}>{children}</svg>
);
const Label: React.FC<{ x: number; y: number; text: string; k: number; size?: number; dark?: boolean }> = ({ x, y, text, k, size = 40, dark }) => (
  <g transform={`translate(${x},${y}) scale(${0.6 + 0.4 * k})`} opacity={k}>
    <rect x={-text.length * size * 0.33 - 22} y={-size * 0.72} width={text.length * size * 0.66 + 44} height={size * 1.44} rx={size * 0.72} fill={dark ? G : '#fff'} filter="url(#sh-hk)" />
    <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={dark ? '#fff' : INK} letterSpacing={1}>{text}</text>
  </g>
);

/* ===================== DIETRO la persona ===================== */
// arc: tachimetro (arco sfumato crema→azzurro→verde + lancetta); ring: anello ellittico con freccia; cycle: cerchio attorno
// alla testa fatto di archi-freccia tra i badge; dots: cerchi numerati su un arco sopra la testa; ecg: linea calma lime.
export const HkBack: React.FC<{ c: FxCtx }> = ({ c }) => {
  const p = c.props;
  const kind = p.kind || 'arc';
  const cx = px(p.cx, 0.47 * W);
  const cy = px(p.cy, 0.26 * H, H);
  const op = fadeOut(c);
  if (kind === 'arc') {
    const r = px(p.r, 430);
    const k = ease(c, p.at ?? 0.05, 0.5);
    const pts = arcPts(cx, cy, r, r, 180, 360);
    const nk = sp(c, (p.at ?? 0.05) + 0.25, { damping: 9, stiffness: 70 });
    const ang = 180 + (p.needleTo ?? 150) * nk;   // da sinistra (fatica) verso destra (scioltezza)
    const nl = r - 70;
    const ticks = [200, 225, 250, 275, 300, 325, 350];
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={AZ} />
        <path d={poly(pts)} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth={54} strokeLinecap="round" {...dash(k)} />
        <path d={poly(pts)} fill="none" stroke="url(#gr-hk)" strokeWidth={36} strokeLinecap="round" filter="url(#gl-hk)" {...dash(k)} />
        {ticks.map((a) => {
          const on = (a - 180) / 180 <= k;
          const [x1, y1] = [cx + (r - 32) * Math.cos(a * DEG), cy + (r - 32) * Math.sin(a * DEG)];
          const [x2, y2] = [cx + (r + 32) * Math.cos(a * DEG), cy + (r + 32) * Math.sin(a * DEG)];
          return on ? <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.9} /> : null;
        })}
        <g filter="url(#sh-hk)" opacity={Math.min(1, nk * 3)}>
          <line x1={cx} y1={cy} x2={cx + nl * Math.cos(ang * DEG)} y2={cy + nl * Math.sin(ang * DEG)} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={26} fill={G} stroke="#fff" strokeWidth={8} />
        </g>
      </Svg>
    );
  }
  if (kind === 'ring') {
    const rx = px(p.rx, 520);
    const ry = px(p.ry, 230, H);
    const k = ease(c, p.at ?? 0.3, 0.9);
    const pts = arcPts(cx, cy, rx, ry, p.a0 ?? 200, (p.a0 ?? 200) + (p.sweep ?? 330), 160);
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={p.color || AZ} />
        <path d={poly(pts)} fill="none" stroke="rgba(0,0,0,.5)" strokeWidth={22} strokeLinecap="round" {...dash(k)} />
        <path d={poly(pts)} fill="none" stroke={p.color || AZ} strokeWidth={12} strokeLinecap="round" filter="url(#gl-hk)" {...dash(k)} />
        <Arrow pts={pts} k={k} color={p.color || AZ} />
      </Svg>
    );
  }
  if (kind === 'cycle') {
    const r = px(p.r, 470);
    const angs: number[] = p.angles || [200, 300, 10];   // posizione dei badge (gradi schermo)
    const gap = p.gap ?? 34;
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={LIME} />
        {angs.map((a, i) => {
          const b = angs[(i + 1) % angs.length];
          const a1 = b > a ? b : b + 360;
          const pts = arcPts(cx, cy, r, r, a + gap, a1 - gap, 60);
          const k = ease(c, (p.at ?? 0.15) + i * 0.35, 0.5);
          return (
            <g key={i}>
              <path d={poly(pts)} fill="none" stroke="rgba(0,0,0,.5)" strokeWidth={24} strokeLinecap="round" {...dash(k)} />
              <path d={poly(pts)} fill="none" stroke={p.color || LIME} strokeWidth={12} strokeLinecap="round" filter="url(#gl-hk)" {...dash(k)} />
              <Arrow pts={pts} k={k} color={p.color || LIME} size={30} />
            </g>
          );
        })}
      </Svg>
    );
  }
  if (kind === 'dots') {
    const n = p.n ?? 5;
    const r = px(p.r, 440);
    const a0 = p.a0 ?? 195;
    const a1 = p.a1 ?? 345;
    const arc = arcPts(cx, cy, r, r, a0, a1, 80);
    const ka = ease(c, p.at ?? 0.05, 0.6);
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={AZ} />
        <path d={poly(arc)} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={18} strokeLinecap="round" {...dash(ka)} />
        <path d={poly(arc)} fill="none" stroke={AZ} strokeWidth={8} strokeLinecap="round" filter="url(#gl-hk)" {...dash(ka)} />
        {Array.from({ length: n }, (_, i) => {
          const a = (a0 + ((a1 - a0) * i) / (n - 1)) * DEG;
          const k = sp(c, (p.at ?? 0.05) + 0.3 + i * 0.16, { damping: 11, stiffness: 180 });
          return (
            <g key={i} transform={`translate(${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}) scale(${k})`} filter="url(#sh-hk)">
              <circle r={62} fill={G} stroke="#fff" strokeWidth={8} />
              <text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={68} fill="#fff">{i + 1}</text>
            </g>
          );
        })}
      </Svg>
    );
  }
  if (kind === 'ecg') {
    // linea del battito calma che attraversa il quadro dietro le spalle
    const y = px(p.y, 0.48 * H, H);
    const amp = p.amp ?? 70;
    const seg = [0, 0, 0, 0, -0.25, 0, 1, -0.6, 0, 0, 0.2, 0, 0, 0, 0];
    const pts: [number, number][] = [];
    for (let rep = 0; rep < 3; rep++) seg.forEach((v, i) => pts.push([(rep * seg.length + i) * (W / (3 * seg.length - 1)), y - v * amp]));
    const k = ease(c, p.at ?? 0.05, 1.1);
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={LIME} />
        <path d={poly(pts)} fill="none" stroke="rgba(0,0,0,.5)" strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" {...dash(k)} />
        <path d={poly(pts)} fill="none" stroke={p.color || LIME} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" filter="url(#gl-hk)" {...dash(k)} />
      </Svg>
    );
  }
  return null;
};

/* ===================== DAVANTI alla persona ===================== */
// sagoma «stanca» (tratti spessi bianchi, piegata in avanti, mani sulle ginocchia)
const Tired: React.FC<{ k: number }> = ({ k }) => (
  <g stroke="#fff" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={k}>
    <circle cx={150} cy={44} r={30} fill="#fff" stroke="none" />
    <path d="M136,72 Q98,86 72,138" />
    <path d="M118,86 L140,166" />
    <path d="M72,138 L104,196 L98,260" />
    <path d="M72,138 L42,196 L30,260" />
  </g>
);
const Speed: React.FC<{ k: number; x: number; y: number; dir?: number }> = ({ k, x, y, dir = 1 }) => (
  <g opacity={k} stroke={LIME} strokeWidth={12} strokeLinecap="round" filter="url(#gl-hk)">
    {[0, 1, 2].map((i) => <line key={i} x1={x} y1={y + i * 34} x2={x - dir * (120 - i * 30) * k} y2={y + i * 34} />)}
  </g>
);
// icone semplici in bianco (orologio, fascia cardio, telefono, lucchetto)
const Icon: React.FC<{ kind: string; s?: number }> = ({ kind, s = 1 }) => {
  const st = { stroke: '#fff', strokeWidth: 12, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  if (kind === 'watch') return <g transform={`scale(${s})`} {...st}><rect x={-60} y={-80} width={120} height={160} rx={30} /><rect x={-36} y={-130} width={72} height={40} rx={10} /><rect x={-36} y={90} width={72} height={40} rx={10} /><path d="M-30,0 L-10,0 L0,-28 L12,24 L24,0 L40,0" stroke={LIME} /></g>;
  if (kind === 'strap') return <g transform={`scale(${s})`} {...st}><path d="M-150,0 Q-100,-60 -50,0 Q0,60 50,0 Q100,-60 150,0" /><rect x={-50} y={-50} width={100} height={100} rx={26} fill="rgba(0,0,0,.35)" /><path d="M-26,0 L-10,0 L0,-24 L10,22 L20,0 L28,0" stroke={LIME} /></g>;
  if (kind === 'phone') return <g transform={`scale(${s})`} {...st}><rect x={-60} y={-110} width={120} height={220} rx={26} /><line x1={-20} y1={84} x2={20} y2={84} /><rect x={-36} y={-70} width={72} height={46} rx={8} stroke={LIME} /><line x1={-36} y1={-4} x2={36} y2={-4} /><line x1={-36} y1={24} x2={16} y2={24} /></g>;
  if (kind === 'bolt') return <path d="M12,-70 L-40,10 L-4,10 L-16,70 L40,-14 L4,-14 Z" fill={LIME} stroke={INK} strokeWidth={6} strokeLinejoin="round" transform={`scale(${s})`} />;
  if (kind === 'drops') return <g transform={`scale(${s})`}>{[[-40, -20, 38], [30, -30, 30], [0, 30, 34], [44, 26, 22], [-48, 36, 20]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={CR} stroke={G} strokeWidth={6} />)}</g>;
  if (kind === 'fibers') return <g transform={`scale(${s})`}>{[-40, -14, 12, 38].map((y, i) => <rect key={i} x={-70 + (i % 2) * 10} y={y - 11} width={130} height={22} rx={11} fill={G} stroke="#fff" strokeWidth={4} />)}</g>;
  if (kind === 'heart') return <path d="M0,60 C-80,0 -70,-60 -20,-60 C0,-60 0,-40 0,-30 C0,-40 0,-60 20,-60 C70,-60 80,0 0,60 Z" fill={LIME} stroke={INK} strokeWidth={6} transform={`scale(${s})`} />;
  if (kind === 'key') return <g transform={`scale(${s})`} {...st}><circle cx={-50} cy={0} r={40} /><line x1={-10} y1={0} x2={90} y2={0} /><line x1={60} y1={0} x2={60} y2={30} /><line x1={86} y1={0} x2={86} y2={30} /></g>;
  return null;
};

export const HkFront: React.FC<{ c: FxCtx }> = ({ c }) => {
  const p = c.props;
  const kind = p.kind || 'sides';
  const op = fadeOut(c);
  if (kind === 'ring' || kind === 'ecg') return <HkBack c={c} />;   // stesse grafiche, ma davanti alla persona
  const pict = `${c.assetBase}/clients/${c.brand?.id || 'correre-naturale'}/pittogramma-bianco.png`;
  if (kind === 'sides') {
    // sagoma stanca a sinistra, pittogramma CN che corre a destra con linee di velocità (ai lati delle spalle)
    const kl = sp(c, p.at ?? 0.25);
    const kr = sp(c, (p.at ?? 0.25) + 0.2);
    const lx = px(p.lx, 0.04 * W), ly = px(p.ly, 0.30 * H, H), rx = px(p.rx, 0.76 * W), ry = px(p.ry, 0.30 * H, H);
    const s = p.size ?? 1;
    return (
      <AbsoluteFill style={{ opacity: op }}>
        <Svg>
          <Defs id="hk" glow={LIME} />
          <g transform={`translate(${lx + (1 - kl) * -200},${ly}) scale(${s})`} filter="url(#sh-hk)"><Tired k={kl} /></g>
          <Speed k={kr} x={rx - 10} y={ry + 90} />
        </Svg>
        <Img src={pict} style={{ position: 'absolute', left: rx + (1 - kr) * 200, top: ry, height: 230 * s, opacity: kr, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.55))' }} />
      </AbsoluteFill>
    );
  }
  if (kind === 'body') {
    // corpo stilizzato in azzurro (contorno luminoso) con le «centrali energetiche» che si accendono e due frecce circolari
    const x = px(p.x, 0.70 * W), y = px(p.y, 0.16 * H, H), s = p.size ?? 1.5;
    const k = ease(c, p.at ?? 0.1, 0.6);
    const kb = sp(c, (p.at ?? 0.1) + 0.1, { damping: 200 });
    const body = 'M0,-150 C-36,-150 -40,-96 0,-96 C40,-96 36,-150 0,-150 Z M-24,-92 C-70,-86 -96,-60 -104,0 L-118,120 L-96,126 L-80,20 L-78,140 L-78,320 L-52,320 L-40,170 L-30,320 L-4,320 L0,160 L4,320 L30,320 L40,170 L52,320 L78,320 L78,140 L80,20 L96,126 L118,120 L104,0 C96,-60 70,-86 24,-92 Z';
    const cells = [[-30, 0], [26, 40], [-10, 90]];
    const arcA = arcPts(x, y + 60 * s, 170 * s, 150 * s, 120, 240, 40);
    const arcB = arcPts(x, y + 60 * s, 170 * s, 150 * s, 300, 420, 40);
    const ka = ease(c, (p.at ?? 0.1) + 0.5, 0.6);
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={AZ} />
        <g transform={`translate(${x},${y}) scale(${s})`} opacity={kb}>
          <path d={body} fill="rgba(11,15,10,.55)" stroke="#fff" strokeWidth={7} strokeLinejoin="round" filter="url(#gl-hk)" {...dash(k)} />
          {cells.map(([cx, cy], i) => {
            const kc = sp(c, (p.at ?? 0.1) + 0.45 + i * 0.18, { damping: 10, stiffness: 200 });
            const pulse = 1 + 0.06 * Math.sin((c.frame / c.fps) * 6 + i);
            return (
              <g key={i} transform={`translate(${cx},${cy}) rotate(${-25 + i * 20}) scale(${kc * pulse * 1.3})`}>
                <rect x={-34} y={-16} width={68} height={32} rx={16} fill={G} stroke={LIME} strokeWidth={5} />
                <path d="M-22,-8 Q-14,8 -6,-8 Q2,8 10,-8 Q18,8 24,-8" fill="none" stroke={LIME} strokeWidth={3} />
              </g>
            );
          })}
        </g>
        <path d={poly(arcA)} fill="none" stroke={CR} strokeWidth={10} strokeLinecap="round" filter="url(#sh-hk)" {...dash(ka)} />
        <Arrow pts={arcA} k={ka} color={CR} size={26} />
        <path d={poly(arcB)} fill="none" stroke={CR} strokeWidth={10} strokeLinecap="round" filter="url(#sh-hk)" {...dash(ka)} />
        <Arrow pts={arcB} k={ka} color={CR} size={26} />
      </Svg>
    );
  }
  if (kind === 'badges') {
    // badge circolari con icona e etichetta (grassi / carboidrati / energia…) in posizioni date
    const items: { x: number; y: number; icon: string; label: string }[] = p.items || [];
    const r = p.r ?? 112;
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={AZ} />
        {items.map((it, i) => {
          const k = sp(c, (p.at ?? 0.15) + i * 0.3, { damping: 11, stiffness: 170 });
          const x = px(it.x, 0.2 * W), y = px(it.y, 0.3 * H, H);
          return (
            <g key={i}>
              <g transform={`translate(${x},${y}) scale(${k})`} filter="url(#gl-hk)">
                <circle r={r} fill="rgba(11,15,10,.72)" stroke={AZ} strokeWidth={8} />
                <Icon kind={it.icon} s={r / 100} />
              </g>
              <Label x={x} y={y + r + 46} text={it.label} k={k} size={36} />
            </g>
          );
        })}
      </Svg>
    );
  }
  if (kind === 'strike') {
    // icone degli strumenti (orologio, fascia, telefono) barrate una dopo l'altra
    const items: string[] = p.items || ['watch', 'strap', 'phone'];
    const y = px(p.y, 0.64 * H, H);
    const gapX = p.gap ?? 300;
    const x0 = W / 2 - ((items.length - 1) * gapX) / 2;
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={LIME} />
        {items.map((ic, i) => {
          const k = sp(c, (p.at ?? 0.1) + i * 0.22);
          const ks = ease(c, (p.at ?? 0.1) + 0.5 + i * 0.22, 0.25);
          const x = x0 + i * gapX;
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <g transform={`scale(${k})`} filter="url(#sh-hk)"><circle r={120} fill="rgba(11,15,10,.6)" stroke="rgba(255,255,255,.35)" strokeWidth={4} /><Icon kind={ic} s={0.72} /></g>
              <line x1={-96} y1={-96} x2={96} y2={96} stroke={LIME} strokeWidth={18} strokeLinecap="round" filter="url(#gl-hk)" {...dash(ks)} />
            </g>
          );
        })}
      </Svg>
    );
  }
  if (kind === 'calendar') {
    // calendario 4 settimane: i giorni si spuntano uno dopo l'altro (costanza)
    const x = px(p.x, 0.60 * W), y = px(p.y, 0.19 * H, H), cell = p.cell ?? 54, cols = 7, rows = p.rows ?? 4;
    const k0 = sp(c, p.at ?? 0.1, { damping: 200 });
    const run: number[] = p.days || [0, 2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25];
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={LIME} />
        <g transform={`translate(${x},${y}) scale(${k0})`} filter="url(#sh-hk)">
          <rect x={-24} y={-80} width={cols * cell + 48} height={rows * cell + 110} rx={26} fill="rgba(11,15,10,.74)" stroke={AZ} strokeWidth={5} />
          <rect x={-24} y={-80} width={cols * cell + 48} height={54} rx={26} fill={G} />
          <text x={(cols * cell) / 2} y={-42} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff" letterSpacing={2}>{p.title || 'OGNI SETTIMANA'}</text>
          {Array.from({ length: rows * cols }, (_, i) => {
            const cx = (i % cols) * cell + cell / 2, cy = Math.floor(i / cols) * cell + cell / 2;
            const j = run.indexOf(i);
            const kc = j >= 0 ? sp(c, (p.at ?? 0.1) + 0.3 + j * 0.11, { damping: 10, stiffness: 220 }) : 0;
            return (
              <g key={i} transform={`translate(${cx},${cy})`}>
                <rect x={-cell / 2 + 5} y={-cell / 2 + 5} width={cell - 10} height={cell - 10} rx={10} fill={j >= 0 ? `rgba(149,255,0,${0.18 * kc})` : 'rgba(255,255,255,.08)'} stroke="rgba(255,255,255,.25)" strokeWidth={2} />
                {j >= 0 ? <path d="M-14,0 L-4,10 L14,-12" fill="none" stroke={LIME} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" transform={`scale(${kc})`} /> : null}
              </g>
            );
          })}
        </g>
      </Svg>
    );
  }
  if (kind === 'lock') {
    // lucchetto che si apre (il «segreto») con bagliore lime
    const x = px(p.x, 0.80 * W), y = px(p.y, 0.30 * H, H), s = p.size ?? 1;
    const k = sp(c, p.at ?? 0.15);
    const ko = sp(c, (p.at ?? 0.15) + 0.55, { damping: 9, stiffness: 120 });
    const burst = ease(c, (p.at ?? 0.15) + 0.6, 0.5);
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={LIME} />
        <g transform={`translate(${x},${y}) scale(${k * s})`} filter="url(#gl-hk)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1={Math.cos(a * DEG) * 150} y1={Math.sin(a * DEG) * 150} x2={Math.cos(a * DEG) * (150 + 70 * burst)} y2={Math.sin(a * DEG) * (150 + 70 * burst)} stroke={LIME} strokeWidth={10} strokeLinecap="round" opacity={burst * (1 - burst * 0.6)} />)}
          <g transform={`translate(${-30 * ko},${-110 - 40 * ko}) rotate(${-28 * ko})`}><path d="M-60,80 L-60,0 A60,60 0 0 1 60,0 L60,40" fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="round" /></g>
          <rect x={-100} y={-30} width={200} height={160} rx={30} fill={G} stroke="#fff" strokeWidth={10} />
          <circle cx={0} cy={40} r={22} fill={ko > 0.5 ? LIME : '#fff'} />
          <rect x={-8} y={50} width={16} height={40} rx={8} fill={ko > 0.5 ? LIME : '#fff'} />
        </g>
      </Svg>
    );
  }
  if (kind === 'rays') {
    // raggi lime ai lati del titolo (come nelle immagini di Ross)
    const x = px(p.x, W / 2), y = px(p.y, 0.62 * H, H), spread = p.spread ?? 330;
    const k = sp(c, p.at ?? 0.5, { damping: 10, stiffness: 160 });
    const rays = [[-spread, 0, -150], [-spread + 30, 60, -115], [-spread + 10, -60, 175], [spread, 0, -30], [spread - 30, 60, -65], [spread - 10, -60, 5]];
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={LIME} />
        {rays.map(([dx, dy, a], i) => <line key={i} x1={x + dx} y1={y + dy} x2={x + dx + Math.cos(a * DEG) * 70 * k} y2={y + dy + Math.sin(a * DEG) * 70 * k} stroke={LIME} strokeWidth={14} strokeLinecap="round" filter="url(#gl-hk)" opacity={k} />)}
      </Svg>
    );
  }
  if (kind === 'scale') {
    // barra 1→10 con cursore che scivola (sforzo percepito)
    const x = px(p.x, W / 2), y = px(p.y, 0.66 * H, H), w = p.w ?? 760;
    const k = ease(c, p.at ?? 0.1, 0.5);
    const kk = sp(c, (p.at ?? 0.1) + 0.4, { damping: 12, stiffness: 60 });
    const pos = p.from ?? 0.95, to = p.to ?? 0.3;
    const cx = x - w / 2 + w * (pos + (to - pos) * kk);
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={AZ} />
        <g filter="url(#sh-hk)">
          <rect x={x - w / 2 - 14} y={y - 30} width={(w + 28) * k} height={60} rx={30} fill="rgba(0,0,0,.5)" />
          <rect x={x - w / 2} y={y - 18} width={w * k} height={36} rx={18} fill="url(#gr-hk)" />
          <text x={x - w / 2 - 50} y={y + 22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#fff" opacity={k}>1</text>
          <text x={x + w / 2 + 64} y={y + 22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#fff" opacity={k}>10</text>
          <circle cx={cx} cy={y} r={38} fill="#fff" stroke={G} strokeWidth={10} opacity={Math.min(1, kk * 4)} />
        </g>
      </Svg>
    );
  }
  if (kind === 'icon') {
    // una singola icona grande (cuore, chiave…) in una posizione
    const x = px(p.x, 0.8 * W), y = px(p.y, 0.3 * H, H), s = p.size ?? 1.4;
    const k = sp(c, p.at ?? 0.2);
    return (
      <Svg opacity={op}>
        <Defs id="hk" glow={LIME} />
        <g transform={`translate(${x},${y}) scale(${k * s})`} filter="url(#gl-hk)"><Icon kind={p.icon || 'heart'} /></g>
      </Svg>
    );
  }
  return null;
};

export const FX_HOOK: Record<string, any> = {
  hkBack: { name: 'Hook: grafica dietro la persona (arco, anello, ciclo, punti, battito)', cat: 'Visual hook', dur: 2.8, sfx: null, anim: 'cut', pos: 'top', behind: true, props: { kind: 'arc' }, fields: [], C: HkBack },
  hkFront: { name: 'Hook: grafica davanti (sagome, corpo, badge, icone, calendario, lucchetto, raggi, scala)', cat: 'Visual hook', dur: 2.8, sfx: null, anim: 'cut', pos: 'top', props: { kind: 'sides' }, fields: [], C: HkFront },
};
