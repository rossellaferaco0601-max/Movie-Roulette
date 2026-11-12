import { AbsoluteFill, useVideoConfig, spring } from "remotion";
import type { Element } from "./types";
import { BRAND, W, PANEL_X, PANEL_W, GFX_TOP, GFX_H } from "./types";
import { useInOut } from "./Elements3D";
import { RunnerFig } from "./Elements4";

/* Longevità, serie «cellule»: il flusso ossigeno + nutrienti → ATP (nella zona grafiche, sopra le riprese di repertorio)
   e il rinnovo dei mitocondri a tutto schermo (copre la scheda «Search» del video YouTube). Tutto agganciato alle parole. */

const FONT = "Blinker, sans-serif";
const CORAL = "#FF6B4A";
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
type P<K extends Element["kind"]> = { el: Extract<Element, { kind: K }>; start: number };
const cueF = (el: Element, i: number, fps: number, def: number) => Math.round((el.onAt?.[i] ?? def) * fps);
const BG = "linear-gradient(180deg,#1C3D15 0%,#0B0F0A 70%)";

/* ---------- flusso: due ingressi → un prodotto (ossigeno + nutrienti → ATP) ---------- */
export const Flow: React.FC<P<"flow">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const pop = (f0: number) => spring({ frame: local - f0, fps, config: { damping: 13, stiffness: 200, mass: 0.7 } });
  const f = [0, 1, 2].map((i) => cueF(el, i, fps, 1.5 + i * 1.2));
  const a = pop(f[0]), b = pop(f[1]), c = pop(f[2]);
  const arrow = easeOut((local - f[2] + 6) / 10);
  const box = (k: number, txt: string, left: number) => (
    <div style={{ position: "absolute", left, top: 196, width: 262, height: 150, borderRadius: 26, background: "rgba(11,15,10,0.92)", border: `4px solid ${BRAND.az}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 52, color: BRAND.white, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>{txt}</div>
  );
  // puntini di energia che scorrono lungo la freccia dopo l'arrivo del prodotto
  const dots = [0, 1, 2].map((i) => ((local - f[2]) / 14 + i / 3) % 1);
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: PANEL_W, top: GFX_TOP, height: GFX_H, fontFamily: FONT, opacity: out }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: PANEL_W, textAlign: "center", opacity: s, transform: `translateY(${(1 - s) * 30}px)` }}>
        <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 50, letterSpacing: 3, textTransform: "uppercase", padding: "8px 28px", borderRadius: 16 }}>{el.title}</div>
        <div style={{ marginTop: 12 }}>
          <span style={{ display: "inline-block", background: "rgba(11,15,10,0.9)", color: BRAND.white, fontWeight: 800, fontSize: 54, lineHeight: 1.1, padding: "8px 26px", borderRadius: 16 }}>{el.sub}</span>
        </div>
      </div>
      {box(a, el.inputs[0], 0)}
      <div style={{ position: "absolute", left: 262, top: 196, width: 56, height: 150, lineHeight: "146px", textAlign: "center", fontWeight: 900, fontSize: 70, color: BRAND.white, opacity: b }}>+</div>
      {box(b, el.inputs[1], 318)}
      <div style={{ position: "absolute", left: 588, top: 264, width: 84 * arrow, height: 14, borderRadius: 7, background: BRAND.lime }} />
      <div style={{ position: "absolute", left: 588 + 84 * arrow - 6, top: 247, width: 0, height: 0, borderTop: "24px solid transparent", borderBottom: "24px solid transparent", borderLeft: `30px solid ${BRAND.lime}`, opacity: arrow }} />
      {local > f[2] + 8 ? dots.map((d, i) => <div key={i} style={{ position: "absolute", left: 584 + d * 84, top: 262, width: 18, height: 18, borderRadius: 9, background: BRAND.white, opacity: 0.9 * Math.sin(Math.PI * d) }} />) : null}
      <div style={{ position: "absolute", left: 704, top: 176, width: 176, height: 190, borderRadius: 30, background: BRAND.lime, color: BRAND.ink, opacity: c, transform: `scale(${0.5 + 0.5 * c})` }}>
        <div style={{ textAlign: "center", fontWeight: 900, fontSize: 92, lineHeight: "120px", marginTop: 6 }}>{el.output}</div>
        <div style={{ textAlign: "center", fontWeight: 800, fontSize: 38, lineHeight: 1, textTransform: "uppercase" }}>{el.outSub ?? ""}</div>
      </div>
    </div>
  );
};

/* ---------- un mitocondrio (capsula con le creste interne) ---------- */
const Mito: React.FC<{ cx: number; cy: number; rot: number; k: number; stroke: string; fill: string; dim?: boolean }> = ({ cx, cy, rot, k, stroke, fill, dim }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${Math.max(0.001, k * 1.2)})`} opacity={clamp01(k * 1.4)}>
    <rect x={-130} y={-66} width={260} height={132} rx={66} fill={fill} stroke={stroke} strokeWidth={9} />
    <path d="M -92 0 q 15 -62 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0" fill="none" stroke={stroke} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={dim ? 0.45 : 1} strokeDasharray={dim ? "14 16" : undefined} />
  </g>
);

/* ---------- rinnovo a tutto schermo: la parola, poi le centrali; le vecchie si segnano e vengono sostituite da nuove ---------- */
export const Renew: React.FC<P<"renew">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, visible } = useInOut(start, durF);
  if (!visible) return null;
  const fin = el.fadeIn ?? 0, fout = el.fadeOut ?? 0;
  const fade = Math.min(fin ? clamp01(local / fin) : 1, fout ? clamp01((durF - local) / fout) : 1);
  const pop = (f0: number, st = 190) => spring({ frame: local - f0, fps, config: { damping: 13, stiffness: st, mass: 0.7 } });
  const f = [0, 1, 2, 3].map((i) => cueF(el, i, fps, 0.2 + i * 1.6));
  const size = Math.min(190, Math.floor(1650 / el.term.length));
  const grid = local >= f[1];
  const OLD = [1, 3, 4];
  const cells = [0, 1, 2, 3, 4, 5].map((i) => ({ i, cx: 190 + (i % 3) * 350, cy: 540 + Math.floor(i / 3) * 270, rot: [-14, 9, -6, 12, -10, 7][i] }));
  const marked = local >= f[2], swapped = local >= f[3];
  return (
    <AbsoluteFill style={{ background: BG, opacity: fade, fontFamily: FONT }}>
      {!grid ? (
        <>
          <div style={{ position: "absolute", left: 0, width: W, top: 640, textAlign: "center", fontWeight: 900, fontSize: size, lineHeight: 1, textTransform: "uppercase", color: BRAND.lime, transform: `scale(${0.7 + 0.3 * pop(f[0])})`, opacity: pop(f[0]) }}>{el.term}</div>
          <div style={{ position: "absolute", left: 0, width: W, top: 640 + size + 30, textAlign: "center", fontWeight: 800, fontSize: 62, color: BRAND.white, opacity: easeOut((local - f[0] - 10) / 10) }}>{el.sub}</div>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", top: 236, left: 0, width: W, textAlign: "center" }}>
            <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 56, letterSpacing: 4, padding: "8px 34px", borderRadius: 16, textTransform: "uppercase", transform: `scale(${pop(f[1])})` }}>{el.term}</div>
          </div>
          <svg width={W} height={1000} viewBox={`0 0 ${W} 1000`} style={{ position: "absolute", left: 0, top: 0 }}>
            {cells.map(({ i, cx, cy, rot }) => {
              const isOld = OLD.includes(i), n = OLD.indexOf(i);
              const float = Math.sin(local / 11 + i * 1.7) * 6;
              const enter = pop(f[1] + 3 + i * 2);
              if (!isOld) return <Mito key={i} cx={cx} cy={cy + float} rot={rot} k={enter} stroke={BRAND.lime} fill="#2E5A1E" />;
              const shake = marked && !swapped ? Math.sin(local * 1.9 + i) * 4 : 0;
              const gone = swapped ? easeOut((local - f[3] - n * 4) / 7) : 0;
              const born = swapped ? pop(f[3] + 7 + n * 4, 230) : 0;
              const ring = swapped ? clamp01((local - f[3] - 7 - n * 4) / 14) : 0;
              return (
                <g key={i}>
                  {gone < 1 ? <Mito cx={cx + shake} cy={cy + float} rot={rot} k={enter * (1 - gone)} stroke={marked ? CORAL : BRAND.lime} fill={marked ? "#3A211B" : "#2E5A1E"} dim={marked} /> : null}
                  {born > 0 ? <Mito cx={cx} cy={cy + float} rot={rot} k={born} stroke={BRAND.lime} fill="#4E9A1F" /> : null}
                  {ring > 0 && ring < 1 ? <circle cx={cx} cy={cy} r={110 + ring * 90} fill="none" stroke={BRAND.lime} strokeWidth={8 * (1 - ring)} opacity={1 - ring} /> : null}
                </g>
              );
            })}
          </svg>
          {marked && !swapped ? <div style={{ position: "absolute", left: 0, width: W, top: 1040, padding: "0 70px", boxSizing: "border-box", textAlign: "center", fontWeight: 900, fontSize: 82, lineHeight: 1.05, textTransform: "uppercase", color: CORAL, opacity: pop(f[2]), transform: `scale(${0.75 + 0.25 * pop(f[2])})` }}>{el.oldLabel}</div> : null}
          {swapped ? <div style={{ position: "absolute", left: 0, width: W, top: 1030, padding: "0 70px", boxSizing: "border-box", textAlign: "center", fontWeight: 900, fontSize: 112, lineHeight: 1.02, textTransform: "uppercase", color: BRAND.lime, opacity: pop(f[3] + 8), transform: `scale(${0.7 + 0.3 * pop(f[3] + 8)})` }}>{el.newLabel}</div> : null}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- due gruppi a confronto su una linea di base (uno cresce, l'altro cala), poi la frase finale con l'orologio che torna indietro ---------- */
export const Versus: React.FC<P<"versus">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, visible } = useInOut(start, durF);
  if (!visible) return null;
  const fin = el.fadeIn ?? 0, fout = el.fadeOut ?? 0;
  const fade = Math.min(fin ? clamp01(local / fin) : 1, fout ? clamp01((durF - local) / fout) : 1);
  const pop = (f0: number, st = 190) => spring({ frame: local - f0, fps, config: { damping: 13, stiffness: st, mass: 0.7 } });
  const f = [0, 1, 2, 3, 4].map((i) => cueF(el, i, fps, 3 + i * 2.5));
  const final = local >= f[2];
  const BASE = 850, UP = 230, DOWN = 160;
  const ka = easeOut((local - f[0]) / 16), kb = easeOut((local - f[1]) / 16);
  const size = Math.min(120, Math.floor(1560 / Math.max(...el.final.map((l) => l.length))));
  const ang = -local * 9;
  return (
    <AbsoluteFill style={{ background: BG, opacity: fade, fontFamily: FONT }}>
      {!final ? (
        <>
          <div style={{ position: "absolute", top: 236, left: 0, width: W, textAlign: "center" }}>
            <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 48, letterSpacing: 4, padding: "8px 30px", borderRadius: 16, textTransform: "uppercase", transform: `scale(${pop(3)})` }}>{el.header}</div>
          </div>
          <div style={{ position: "absolute", top: 322, left: 0, width: W, textAlign: "center", fontWeight: 900, fontSize: 84, textTransform: "uppercase", color: BRAND.white, opacity: easeOut((local - 8) / 10) }}>{el.title}</div>
          {/* linea di base */}
          <div style={{ position: "absolute", left: 110, top: BASE - 3, width: (W - 220) * easeOut((local - 10) / 14), height: 6, borderRadius: 3, background: "rgba(255,255,255,0.55)" }} />
          {/* gruppo A: cresce */}
          <div style={{ position: "absolute", left: 110, width: 440, top: BASE + 24, textAlign: "center", opacity: easeOut((local - 14) / 10) }}><span style={{ display: "inline-block", background: "rgba(11,15,10,0.92)", border: `4px solid ${BRAND.lime}`, borderRadius: 999, padding: "12px 28px", fontWeight: 800, fontSize: 48, lineHeight: 1, color: BRAND.white }}>{el.a.label}</span></div>
          <div style={{ position: "absolute", left: 230, width: 200, top: BASE - UP * ka, height: UP * ka, borderRadius: "18px 18px 0 0", background: BRAND.lime }} />
          <div style={{ position: "absolute", left: 110, width: 440, top: BASE - UP - 156, textAlign: "center", fontWeight: 900, fontSize: 150, lineHeight: 1, color: BRAND.lime, opacity: pop(f[0] + 12), transform: `scale(${0.6 + 0.4 * pop(f[0] + 12)})` }}>{el.a.value}</div>
          {/* gruppo B: cala */}
          <div style={{ position: "absolute", left: 530, width: 440, top: BASE - 100, textAlign: "center", opacity: easeOut((local - 18) / 10) }}><span style={{ display: "inline-block", background: "rgba(11,15,10,0.92)", border: `4px solid ${CORAL}`, borderRadius: 999, padding: "12px 28px", fontWeight: 800, fontSize: 48, lineHeight: 1, color: BRAND.white }}>{el.b.label}</span></div>
          <div style={{ position: "absolute", left: 650, width: 200, top: BASE, height: DOWN * kb, borderRadius: "0 0 18px 18px", background: CORAL }} />
          <div style={{ position: "absolute", left: 530, width: 440, top: BASE + DOWN + 14, textAlign: "center", fontWeight: 900, fontSize: 150, lineHeight: 1, color: CORAL, opacity: pop(f[1] + 12), transform: `scale(${0.6 + 0.4 * pop(f[1] + 12)})` }}>{el.b.value}</div>
          {el.source ? <div style={{ position: "absolute", top: 1262, left: 0, width: W, textAlign: "center", fontWeight: 700, fontSize: 34, color: "rgba(244,241,229,0.75)" }}>{el.source}</div> : null}
        </>
      ) : (
        <>
          {/* orologio che gira all'indietro */}
          <svg width={300} height={300} viewBox="-150 -150 300 300" style={{ position: "absolute", left: (W - 300) / 2, top: 300, transform: `scale(${pop(f[2])})` }}>
            <circle r={126} fill="rgba(11,15,10,0.9)" stroke={BRAND.lime} strokeWidth={12} />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => <line key={i} x1={0} y1={-104} x2={0} y2={i % 3 === 0 ? -84 : -94} stroke={BRAND.white} strokeWidth={i % 3 === 0 ? 8 : 4} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
            <line x1={0} y1={0} x2={0} y2={-58} stroke={BRAND.white} strokeWidth={12} strokeLinecap="round" transform={`rotate(${ang / 12})`} />
            <line x1={0} y1={0} x2={0} y2={-88} stroke={BRAND.lime} strokeWidth={8} strokeLinecap="round" transform={`rotate(${ang})`} />
            <circle r={10} fill={BRAND.lime} />
          </svg>
          {el.final.map((l, i) => {
            const k = pop(f[2 + Math.min(i, 2)] + (i > 2 ? (i - 2) * 6 : 0));
            return <div key={i} style={{ position: "absolute", left: 0, width: W, top: 680 + i * size * 1.1, textAlign: "center", fontWeight: 900, fontSize: size, lineHeight: 1, textTransform: "uppercase", color: i === (el.finalAccent ?? el.final.length - 1) ? BRAND.lime : BRAND.white, opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>{l}</div>;
          })}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- quattro tessere (2×2) che entrano sulle parole, poi la frase che le unisce ---------- */
export const Grid4: React.FC<P<"grid4">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, out, visible } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const pop = (f0: number) => spring({ frame: local - f0, fps, config: { damping: 13, stiffness: 200, mass: 0.7 } });
  const f = [0, 1, 2, 3, 4].map((i) => cueF(el, i, fps, i * 0.9));
  const united = local >= f[4], ku = pop(f[4]);
  const tw = (PANEL_W - 20) / 2, th = 132;
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: PANEL_W, top: GFX_TOP, height: GFX_H, fontFamily: FONT, opacity: out }}>
      {el.items.slice(0, 4).map((it, i) => {
        const k = pop(f[i]);
        return (
          <div key={i} style={{ position: "absolute", left: (i % 2) * (tw + 20), top: Math.floor(i / 2) * (th + 16), width: tw, height: th, borderRadius: 24, background: "rgba(11,15,10,0.92)", border: `4px solid ${united ? BRAND.lime : "rgba(255,255,255,0.3)"}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 20, padding: "0 24px", opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}>
            <div style={{ width: 76, height: 76, borderRadius: 38, background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 54, lineHeight: "76px", textAlign: "center", flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontWeight: 900, fontSize: 58, textTransform: "uppercase", color: BRAND.white }}>{it}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: PANEL_W, top: 2 * th + 34, textAlign: "center", opacity: ku, transform: `translateY(${(1 - ku) * 30}px)` }}>
        <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 54, lineHeight: 1.1, padding: "10px 30px", borderRadius: 18, textTransform: "uppercase" }}>{el.foot}</div>
      </div>
    </div>
  );
};

/* ---------- scheda «cosa fare» a tutto schermo: numero, disegno animato, titolo e punti che entrano sulle parole ---------- */
export const Plan: React.FC<P<"plan">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, visible } = useInOut(start, durF);
  if (!visible) return null;
  const fin = el.fadeIn ?? 0, fout = el.fadeOut ?? 0;
  const fade = Math.min(fin ? clamp01(local / fin) : 1, fout ? clamp01((durF - local) / fout) : 1);
  const pop = (f0: number) => spring({ frame: local - f0, fps, config: { damping: 13, stiffness: 200, mass: 0.7 } });
  // ordine degli agganci: (premessa) · titolo · punti · (chiusa)
  let ci = 0;
  const cue = () => cueF(el, ci++, fps, 0.4 + ci * 1.1);
  const fPre = el.pre ? cue() : 0, fTitle = cue(), fPts = el.points.map(() => cue()), fFoot = el.foot ? cue() : 0;
  const size = Math.min(124, Math.floor(1500 / Math.max(...el.title.map((l) => l.length))));
  const titleTop = 664, ptsTop = titleTop + el.title.length * size * 1.04 + 26;
  const t = local / fps, kt = pop(fTitle);
  const fTimer = el.art === "timer" ? fPts[fPts.length - 1] : 0;
  const prog = clamp01((local - fTimer) / Math.max(1, durF - fTimer - 10)), circ = 2 * Math.PI * 78;
  return (
    <AbsoluteFill style={{ background: BG, opacity: fade, fontFamily: FONT }}>
      <div style={{ position: "absolute", top: 236, left: 0, width: W, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 48, letterSpacing: 4, padding: "8px 30px", borderRadius: 16, textTransform: "uppercase", transform: `scale(${pop(2)})` }}>{el.kicker}</div>
      </div>
      {/* disegno animato nel cerchio, con il numero */}
      <div style={{ position: "absolute", left: (W - 264) / 2, top: 326, width: 264, height: 264, borderRadius: 132, background: "rgba(11,15,10,0.9)", border: `6px solid ${BRAND.lime}`, boxSizing: "border-box", transform: `scale(${pop(5)})` }}>
        {el.art === "timer" ? (
          <svg width={252} height={252} viewBox="-109 -109 218 218">
            <circle r={78} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={14} />
            <circle r={78} fill="none" stroke={BRAND.lime} strokeWidth={14} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} transform="rotate(-90)" />
            <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={BRAND.white}>{Math.round(prog * 30)}″</text>
          </svg>
        ) : (
          <svg width={252} height={252} viewBox="-150 -125 300 300">
            <RunnerFig phase={t * (el.art === "run" ? 2.6 : 1.3) * Math.PI * 2} color={BRAND.lime} x={0} y={0} />
          </svg>
        )}
      </div>
      <div style={{ position: "absolute", left: (W - 264) / 2 - 40, top: 312, width: 104, height: 104, borderRadius: 52, background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 76, lineHeight: "104px", textAlign: "center", transform: `scale(${pop(8)})` }}>{el.n}</div>
      {el.pre ? <div style={{ position: "absolute", left: 0, width: W, top: 598, textAlign: "center", fontWeight: 700, fontSize: 52, color: BRAND.cream, opacity: pop(fPre) }}>{el.pre}</div> : null}
      {el.title.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: 0, width: W, top: titleTop + i * size * 1.04, textAlign: "center", fontWeight: 900, fontSize: size, lineHeight: 1, textTransform: "uppercase", color: i === el.title.length - 1 ? BRAND.lime : BRAND.white, opacity: kt, transform: `translateY(${(1 - kt) * 40}px)` }}>{l}</div>
      ))}
      {el.points.map((pt, i) => {
        const k = pop(fPts[i]);
        return (
          <div key={i} style={{ position: "absolute", left: 0, width: W, top: ptsTop + i * 110, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>
            <div style={{ display: "inline-block", background: "rgba(11,15,10,0.92)", border: `4px solid ${BRAND.lime}`, color: BRAND.white, fontWeight: 800, fontSize: 56, lineHeight: 1, padding: "16px 36px", borderRadius: 999 }}>{pt}</div>
          </div>
        );
      })}
      {el.foot ? <div style={{ position: "absolute", left: 0, width: W, top: ptsTop + el.points.length * 110 + 12, padding: "0 80px", boxSizing: "border-box", textAlign: "center", fontWeight: 800, fontSize: 54, lineHeight: 1.08, color: BRAND.cream, opacity: pop(fFoot), transform: `translateY(${(1 - pop(fFoot)) * 30}px)` }}>{el.foot}</div> : null}
    </AbsoluteFill>
  );
};

/* ---------- cruscotto: tre spie che si accendono sulle parole (testimonianza della sei ore) ---------- */
export const Lights: React.FC<P<"lights">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const { local, s, out, visible } = useInOut(start, Math.round(el.dur * fps));
  if (!visible) return null;
  const AMBER = "#FFB020";
  const n = el.items.length, cw = (PANEL_W - 60) / n;
  return (
    <div style={{ position: "absolute", left: PANEL_X, width: PANEL_W, top: GFX_TOP, height: 400, borderRadius: 30, background: "rgba(11,15,10,0.9)", fontFamily: FONT, opacity: out * Math.min(1, s * 1.3), transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ position: "absolute", top: 22, left: 0, width: "100%", textAlign: "center", fontWeight: 900, fontSize: 44, textTransform: "uppercase", letterSpacing: 3, color: BRAND.lime }}>{el.title}</div>
      {el.items.map((it, i) => {
        const f0 = cueF(el, i, fps, 0.8 + i * 0.9), on = local >= f0;
        const k = spring({ frame: local - f0, fps, config: { damping: 11, stiffness: 220, mass: 0.7 } });
        const pulse = on ? 0.75 + 0.25 * Math.sin((local - f0) / 3.2) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: 30 + i * cw, width: cw, top: 104, textAlign: "center" }}>
            <div style={{ display: "inline-block", width: 150, height: 150, borderRadius: 75, boxSizing: "border-box", border: `8px solid ${on ? AMBER : "rgba(255,255,255,0.25)"}`, background: on ? `rgba(255,176,32,${0.25 + 0.6 * pulse})` : "rgba(255,255,255,0.06)", transform: `scale(${on ? 0.85 + 0.15 * k : 1})` }}>
              <div style={{ fontWeight: 900, fontSize: 96, lineHeight: "134px", color: on ? BRAND.ink : "rgba(255,255,255,0.3)" }}>!</div>
            </div>
            <div style={{ marginTop: 16, fontWeight: 800, fontSize: 50, color: on ? BRAND.white : "rgba(255,255,255,0.45)" }}>{it}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Richiamo (video spontanei): una riga sola sotto il mento, sopra i sottotitoli, quando chi parla dice «lo trovi qui sotto».
   Sta fuori dalla zona grafiche (nei selfie il volto scende fino a ~0,62): `y` = bordo alto in frazione dell'altezza. ---------- */
export const Pointer: React.FC<{ el: Extract<Element, { kind: "pointer" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const size = Math.min(54, Math.floor(1300 / Math.max(14, el.text.length)));
  const bob = el.arrow === false ? 0 : Math.sin((local / fps) * Math.PI * 2 * 1.4) * 7;
  const parts = el.accent && el.text.includes(el.accent) ? [el.text.slice(0, el.text.indexOf(el.accent)), el.accent, el.text.slice(el.text.indexOf(el.accent) + el.accent.length)] : [el.text, "", ""];
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: Math.round(1920 * (el.y ?? 0.645)), display: "flex", justifyContent: "center", fontFamily: FONT, opacity: out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(11,15,10,0.92)", border: `4px solid ${BRAND.lime}`, borderRadius: 999, padding: "14px 34px 14px 18px", transform: `translateY(${(1 - s) * 40}px) scale(${0.92 + 0.08 * s})`, opacity: Math.min(1, s * 1.4) }}>
        <div style={{ width: 62, height: 62, borderRadius: 31, background: BRAND.lime, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {el.arrow === false ? (
            <svg width="34" height="34" viewBox="0 0 34 34"><path d="M9 4h16a2 2 0 0 1 2 2v24l-10-6-10 6V6a2 2 0 0 1 2-2z" fill={BRAND.ink} /></svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: `translateY(${bob}px)` }}><path d="M18 5v22M8 18l10 10 10-10" fill="none" stroke={BRAND.ink} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
        </div>
        <div style={{ fontWeight: 900, fontSize: size, lineHeight: 1, textTransform: "uppercase", color: BRAND.white, whiteSpace: "nowrap" }}>
          {parts[0]}<span style={{ color: BRAND.lime }}>{parts[1]}</span>{parts[2]}
        </div>
      </div>
    </div>
  );
};
