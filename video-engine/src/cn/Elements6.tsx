import { AbsoluteFill, useVideoConfig, spring } from "remotion";
import type { Element } from "./types";
import { BRAND, W } from "./types";
import { useInOut } from "./Elements3D";

/* Longevità: grafiche a tutto schermo che sostituiscono le schede del video YouTube (stile vecchio), agganciate alle parole.
   Stesso fondo delle guide degli esercizi; tutto tra y 230 e 1300 (sottotitoli a 0,69, zona sicura fino a 0,80). */

const FONT = "Blinker, sans-serif";
const CORAL = "#FF6B4A";
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x: number) => { const c = clamp01(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };
type P<K extends Element["kind"]> = { el: Extract<Element, { kind: K }>; start: number };
const cueF = (el: Element, i: number, fps: number, def: number) => Math.round((el.onAt?.[i] ?? def) * fps);
const BG = "linear-gradient(180deg,#1C3D15 0%,#0B0F0A 70%)";
const big: React.CSSProperties = { position: "absolute", left: 0, width: W, textAlign: "center", fontFamily: FONT, fontWeight: 900, textTransform: "uppercase", lineHeight: 1 };
/** dissolvenza del solo fondo: il contenuto compare quando il fondo è pieno */
const useFull = (el: Element & { fadeIn?: number; fadeOut?: number }, start: number) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const io = useInOut(start, durF);
  const fin = el.fadeIn ?? 5, fout = el.fadeOut ?? 5;
  const fade = Math.min(fin ? clamp01(io.local / fin) : 1, fout ? clamp01((durF - io.local) / fout) : 1);
  const pop = (f0: number) => spring({ frame: io.local - f0, fps, config: { damping: 13, stiffness: 190, mass: 0.7 } });
  return { ...io, fps, durF, fade, pop };
};
const Full: React.FC<{ fade: number; children: React.ReactNode }> = ({ fade, children }) => (
  <AbsoluteFill style={{ background: BG, opacity: fade, fontFamily: FONT }}>
    <AbsoluteFill style={{ opacity: fade < 1 ? 0 : 1 }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);
const Chip: React.FC<{ top: number; k: number; children: React.ReactNode }> = ({ top, k, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: W, textAlign: "center" }}>
    <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 48, letterSpacing: 4, padding: "8px 30px", borderRadius: 16, textTransform: "uppercase", transform: `scale(${k})` }}>{children}</div>
  </div>
);

/* ---------- due numeri a confronto: la definizione entra per prima, il nome arriva sulla parola ---------- */
export const Pair: React.FC<P<"pair">> = ({ el, start }) => {
  const u = useFull(el, start);
  if (!u.visible) return null;
  const f = [0, 1, 2, 3].map((i) => cueF(el, i, u.fps, 2 + i * 2));
  const card = (i: number) => {
    const d = el.items[i], a = u.pop(f[i * 2]), b = u.pop(f[i * 2 + 1]);
    return (
      <div key={i} style={{ position: "absolute", left: 90, width: W - 180, top: 500 + i * 400, height: 350, borderRadius: 36, background: "rgba(11,15,10,0.9)", border: `5px solid ${b > 0.5 ? BRAND.lime : "rgba(255,255,255,0.2)"}`, boxSizing: "border-box", opacity: a, transform: `translateY(${(1 - a) * 60}px)` }}>
        <div style={{ position: "absolute", left: 36, top: 34, width: 96, height: 96, borderRadius: 48, background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 70, lineHeight: "96px", textAlign: "center" }}>{i + 1}</div>
        <div style={{ position: "absolute", left: 160, right: 30, top: 46, fontWeight: 800, fontSize: 62, lineHeight: 1.05, color: BRAND.white }}>{d.def}</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", fontWeight: 900, fontSize: 124, lineHeight: 1, textTransform: "uppercase", color: BRAND.lime, transform: `scale(${0.6 + 0.4 * b})`, opacity: b }}>{d.name}</div>
      </div>
    );
  };
  const t0 = u.pop(4), t1 = easeOut((u.local - 12) / 12);
  return (
    <Full fade={u.fade}>
      <Chip top={236} k={t0}>{el.title}</Chip>
      <div style={{ ...big, top: 340, fontSize: 68, textTransform: "none", fontWeight: 800, color: BRAND.white, opacity: t1 }}>{el.sub}</div>
      {card(0)}{card(1)}
    </Full>
  );
};

/* ---------- la barra della vita: 83 anni, in salute fino a 60, gli ultimi 20 in declino; poi «20 anni» a tutto schermo ---------- */
export const Lifebar: React.FC<P<"lifebar">> = ({ el, start }) => {
  const u = useFull(el, start);
  if (!u.visible) return null;
  const f = [0, 1, 2, 3, 4, 5].map((i) => cueF(el, i, u.fps, 2 + i * 2));
  const second = u.local >= f[3];
  if (!second) {
    const count = Math.round(el.total * easeOut((u.local - 6) / Math.max(8, f[0] - 2)));
    const kNum = u.pop(6), healthy = easeInOut((u.local - f[1] + 4) / 18), decl = u.pop(f[2]);
    const bw = 880, bx = (W - bw) / 2, hw = bw * (el.healthy / el.total);
    return (
      <Full fade={u.fade}>
        <Chip top={236} k={u.pop(3)}>{el.place}</Chip>
        <div style={{ ...big, top: 336, fontSize: 64, textTransform: "none", fontWeight: 800, color: BRAND.white, opacity: kNum }}>{el.title}</div>
        <div style={{ ...big, top: 440, fontSize: 250, color: BRAND.white, transform: `scale(${0.8 + 0.2 * kNum})`, opacity: kNum }}>{count}<span style={{ fontSize: 90, marginLeft: 14, color: BRAND.cream }}>anni</span></div>
        <div style={{ position: "absolute", left: bx, top: 800, width: bw, height: 96, borderRadius: 48, background: "rgba(255,255,255,0.14)", border: "3px solid rgba(255,255,255,0.35)", boxSizing: "border-box", overflow: "hidden", opacity: kNum }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: hw * healthy, background: BRAND.lime }} />
          <div style={{ position: "absolute", left: hw, top: 0, bottom: 0, right: 0, background: CORAL, opacity: decl * (0.75 + 0.25 * Math.sin(u.local / 4)) }} />
        </div>
        <div style={{ position: "absolute", left: bx, top: 916, width: hw, textAlign: "center", fontWeight: 900, fontSize: 56, lineHeight: 1.05, color: BRAND.lime, textTransform: "uppercase", opacity: healthy }}>{el.healthy} anni<br /><span style={{ fontSize: 44, color: BRAND.white }}>in salute</span></div>
        <div style={{ ...big, top: 1090, fontSize: 104, color: CORAL, transform: `scale(${0.6 + 0.4 * decl})`, opacity: decl }}>{el.decline}</div>
        <div style={{ ...big, top: 1206, fontSize: 60, color: BRAND.white, opacity: decl }}>{el.declineSub}</div>
      </Full>
    );
  }
  const a = u.pop(f[3]), b = u.pop(f[4]), c = u.pop(f[5]);
  return (
    <Full fade={u.fade}>
      <div style={{ ...big, top: 470, fontSize: 280, color: CORAL, transform: `scale(${0.7 + 0.3 * a})`, opacity: a }}>{el.focus}</div>
      <div style={{ ...big, top: 800, fontSize: 76, color: BRAND.white, textTransform: "none", fontWeight: 800, opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>{el.focusNot}</div>
      <div style={{ ...big, top: 950, fontSize: 150, color: BRAND.lime, transform: `scale(${0.6 + 0.4 * c})`, opacity: c }}>{el.focusIs}</div>
    </Full>
  );
};

/* ---------- frase a tutto schermo (copre una scheda di testo del sorgente) ---------- */
export const Fulltext: React.FC<P<"fulltext">> = ({ el, start }) => {
  const u = useFull(el, start);
  if (!u.visible) return null;
  const maxLen = Math.max(...el.lines.map((l) => l.length));
  const size = Math.min(190, Math.floor(1650 / maxLen)), top = 800 - (el.lines.length * size * 1.08) / 2;
  return (
    <Full fade={u.fade}>
      {el.lines.map((l, i) => {
        const k = u.pop(cueF(el, i, u.fps, 0.25 + i * 0.25));
        return <div key={i} style={{ ...big, top: top + i * size * 1.08, fontSize: size, color: i === (el.accentIndex ?? el.lines.length - 1) ? BRAND.lime : BRAND.white, transform: `scale(${0.7 + 0.3 * k})`, opacity: k }}>{l}</div>;
      })}
    </Full>
  );
};
