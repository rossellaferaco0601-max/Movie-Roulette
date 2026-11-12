import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import type { Element } from "./types";
import { BRAND, W, H, GFX_TOP } from "./types";
import { useInOut } from "./Elements3D";

/* Animazioni per i selfie (reel CCB), dopo il controllo di Ross del 12/11: parole SOPRA la testa (anche con le lettere che cadono),
   contatore sui numeri, elenco che si costruisce accanto a Daniele, muro di parole, mappa Italia ⇄ Namibia, richiamo grande alla CTA.
   Regole: niente tocca il volto e niente tocca i sottotitoli. */

const FONT = "Blinker, sans-serif";
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const smooth = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
type P<K extends Element["kind"]> = { el: Extract<Element, { kind: K }>; start: number };

/** Bordo alto (in frazione dell'altezza) delle parole sopra la testa e della fascia sotto il mento. */
export const TOP_Y = 0.07;
export const STRIP_Y = 0.652;
/** Altezza in pixel della targa di `topword` (serve anche al controllo sul volto): righe × (corpo + 2 × margine). */
export const topwordSize = (lines: string[], max = 124) => Math.min(max, Math.floor(1640 / Math.max(9, ...lines.map((l) => l.length))));
export const topwordHeight = (lines: string[], max = 124) => { const s = topwordSize(lines, max); return lines.length * (s + 22) + (lines.length - 1) * 8; };

/* ---------- Parole sopra la testa (o nella fascia): targhe scure, parola in lime. `anim: "drop"` = lettere che cadono una a una ---------- */
export const TopWord: React.FC<P<"topword">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  // nella fascia bassa due righe devono stare sopra 0,80: corpo massimo 104
  const size = topwordSize(el.lines, el.zone === "strip" && el.lines.length > 1 ? Math.min(el.max ?? 104, 104) : el.max);
  const top = Math.round(H * (el.zone === "strip" ? STRIP_Y : el.y ?? TOP_Y));
  const on = (i: number) => (el.onAt?.[i] !== undefined ? Math.round(el.onAt[i] * fps) : i * 7);
  let letterNo = 0;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: FONT, opacity: out }}>
      {el.lines.map((line, li) => {
        const t0 = on(li);
        const k = spring({ frame: local - t0, fps, config: { damping: 13, stiffness: 200, mass: 0.7 } });
        if (local < t0) return <div key={li} style={{ height: size + 22 }} />;
        const hit = el.accent && line.toLowerCase().includes(el.accent.toLowerCase()) ? line.toLowerCase().indexOf(el.accent.toLowerCase()) : -1;
        const plate: React.CSSProperties = { background: "rgba(11,15,10,0.92)", borderRadius: 16, padding: "11px 26px", fontWeight: 900, fontSize: size, lineHeight: 1, textTransform: "uppercase", color: BRAND.white, whiteSpace: "pre", boxShadow: "0 8px 22px rgba(0,0,0,0.35)" };
        if (el.anim !== "drop") {
          return (
            <div key={li} style={{ ...plate, transform: `translateY(${(1 - k) * -40}px) scale(${0.86 + 0.14 * k})`, opacity: Math.min(1, k * 1.6) }}>
              {hit < 0 ? line : <>{line.slice(0, hit)}<span style={{ color: BRAND.lime }}>{line.slice(hit, hit + el.accent!.length)}</span>{line.slice(hit + el.accent!.length)}</>}
            </div>
          );
        }
        // lettere che cadono: la targa si apre, poi ogni lettera scende dall'alto con un rimbalzo, sfalsata di 1,6 fotogrammi.
        // Nella fascia sotto il mento le lettere cadono DENTRO la targa (ritagliate): da più in alto passerebbero sul volto
        return (
          <div key={li} style={{ ...plate, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 2), display: "flex", overflow: el.zone === "strip" ? "hidden" : "visible" }}>
            {line.split("").map((ch, ci) => {
              const n = letterNo++;
              const f = local - t0 - 2 - (ci * 1.6);
              const d = spring({ frame: f, fps, config: { damping: 9, stiffness: 170, mass: 0.6 } });
              const inAccent = hit >= 0 && ci >= hit && ci < hit + el.accent!.length;
              return (
                <span key={ci} style={{ display: "inline-block", color: inAccent ? BRAND.lime : BRAND.white, transform: `translateY(${(1 - d) * -(el.zone === "strip" ? size + 40 : 260 + (n % 3) * 40)}px) rotate(${(1 - Math.min(1, d)) * ((n % 2 ? 1 : -1) * 18)}deg)`, opacity: f < 0 ? 0 : 1 }}>{ch}</span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Contatore (fascia sotto il mento): il numero sale fino al valore, poi un piccolo colpo; sotto l'etichetta ---------- */
export const Counter: React.FC<P<"counter">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const RUN = Math.min(26, Math.max(12, Math.round(durF * 0.4)));
  const p = easeOut(local / RUN);
  const v = (el.from ?? 0) + (el.to - (el.from ?? 0)) * p;
  const shown = el.decimals ? v.toFixed(el.decimals).replace(".", ",") : String(Math.round(v));
  const hitK = spring({ frame: local - RUN, fps, config: { damping: 8, stiffness: 260, mass: 0.5 } });
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: GFX_TOP, textAlign: "center", opacity: out, fontFamily: FONT }}>
      <div style={{ display: "inline-block", background: BRAND.green, color: BRAND.white, borderRadius: 28, padding: "10px 42px 12px", transform: `scale(${s * (1 + 0.06 * (local >= RUN ? 1 - Math.min(1, hitK) : 0))})`, boxShadow: "0 14px 30px rgba(0,0,0,0.35)" }}>
        <div style={{ fontWeight: 900, fontSize: 164, lineHeight: 1, color: BRAND.lime, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {el.prefix ?? ""}{shown}<span style={{ fontSize: el.suffix && el.suffix.length > 2 ? 84 : 164 }}>{el.suffix ? (el.suffix.length > 2 ? " " : "") + el.suffix : ""}</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 48, textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap" }}>{el.label}</div>
      </div>
    </div>
  );
};

/* ---------- Richiamo grande alla CTA a voce («te lo spiego qui sotto»): targa larga con due frecce che rimbalzano ---------- */
export const BigPointer: React.FC<P<"pointer">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  // due righe quando la frase finisce con la parte in evidenza («Te lo spiego» / «qui sotto»): la scritta diventa molto più grande (Ross 12/11)
  const two = !!el.accent && el.text.endsWith(el.accent) && el.text.length > el.accent.length + 1;
  const rows = two ? [el.text.slice(0, -el.accent!.length).trim(), el.accent!] : [el.text];
  const room = el.arrow === false ? 826 : 692;
  const size = two ? Math.min(100, Math.floor(room / (0.57 * Math.max(...rows.map((r) => r.length))))) : Math.min(96, Math.floor(1500 / Math.max(12, el.text.length)));
  const bob = Math.sin((local / fps) * Math.PI * 2 * 1.5) * 9;
  const pulse = 1 + 0.025 * Math.sin((local / fps) * Math.PI * 2 * 1.5);
  const hit = el.accent && el.text.includes(el.accent) ? el.text.indexOf(el.accent) : -1;
  const Arrow = () => (
    <div style={{ width: 112, height: 112, borderRadius: 56, background: BRAND.lime, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {el.arrow === false ? (
        <svg width="50" height="50" viewBox="0 0 34 34"><path d="M9 4h16a2 2 0 0 1 2 2v24l-10-6-10 6V6a2 2 0 0 1 2-2z" fill={BRAND.ink} /></svg>
      ) : (
        <svg width="66" height="66" viewBox="0 0 36 36" style={{ transform: `translateY(${bob}px)` }}><path d="M18 4v24M7 18l11 11 11-11" fill="none" stroke={BRAND.ink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: Math.round(H * (el.y ?? STRIP_Y)), display: "flex", justifyContent: "center", fontFamily: FONT, opacity: out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: "rgba(11,15,10,0.94)", border: `6px solid ${BRAND.lime}`, borderRadius: two ? 84 : 999, padding: "12px 14px", transform: `translateY(${(1 - s) * 60}px) scale(${(0.9 + 0.1 * s) * pulse})`, opacity: Math.min(1, s * 1.4), boxShadow: "0 12px 34px rgba(0,0,0,0.45)" }}>
        <Arrow />
        <div style={{ fontWeight: 900, fontSize: size, lineHeight: 1, textTransform: "uppercase", color: BRAND.white, whiteSpace: "nowrap", padding: "0 6px" }}>
          {two ? <div style={{ textAlign: "center", lineHeight: 1.06, padding: "6px 0" }}><div>{rows[0]}</div><div style={{ color: BRAND.lime }}>{rows[1]}</div></div>
            : hit < 0 ? el.text : <>{el.text.slice(0, hit)}<span style={{ color: BRAND.lime }}>{el.accent}</span>{el.text.slice(hit + el.accent!.length)}</>}
        </div>
        {el.arrow === false ? null : <Arrow />}
      </div>
    </div>
  );
};

/* ---------- Muro di parole (a tutto schermo): il pannello sale dal basso, le parole si accumulano riga per riga sulle parole dette ---------- */
export const Wall: React.FC<P<"wall">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, visible } = useInOut(start, durF);
  if (!visible) return null;
  const IN = 9, OUT = 9;
  const up = 1 - Math.pow(1 - clamp01(local / IN), 3), down = Math.pow(1 - clamp01((durF - local) / OUT), 3);
  const n = el.rows.length;
  const rowH = Math.min(230, Math.floor((H * 0.745 - 190) / n));   // il muro si ferma sopra i sottotitoli
  const styles: React.CSSProperties[] = [
    { background: BRAND.lime, color: BRAND.ink }, { background: "rgba(255,255,255,0.08)", color: BRAND.white, border: "3px solid rgba(255,255,255,0.35)" },
    { background: BRAND.cream, color: BRAND.green }, { background: BRAND.green, color: BRAND.white }, { background: "#0B0F0A", color: BRAND.lime, border: `3px solid ${BRAND.lime}` },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1C3D15 0%,#0B0F0A 75%)", transform: `translateY(${(1 - up) * 100 + down * 100}%)`, fontFamily: FONT }}>
      {el.title ? <div style={{ position: "absolute", top: 70, left: 0, width: W, textAlign: "center", fontWeight: 900, fontSize: 64, letterSpacing: 3, color: BRAND.lime, textTransform: "uppercase" }}>{el.title}</div> : null}
      {el.rows.map((r, i) => {
        const t0 = el.onAt?.[i] !== undefined ? Math.round(el.onAt[i] * fps) : 4 + i * 6;
        const k = spring({ frame: local - t0, fps, config: { damping: 11, stiffness: 230, mass: 0.6 } });
        if (local < t0) return null;
        const size = Math.min(rowH - 44, Math.floor(1500 / Math.max(7, r.length)));
        const fromLeft = i % 2 === 0;
        return (
          <div key={i} style={{ position: "absolute", top: 190 + i * rowH, left: 40, width: W - 80, height: rowH - 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...styles[i % styles.length], borderRadius: 22, padding: `0 34px`, height: rowH - 14, display: "flex", alignItems: "center", fontWeight: 900, fontSize: size, lineHeight: 1, textTransform: "uppercase", whiteSpace: "nowrap", transform: `translateX(${(1 - k) * (fromLeft ? -260 : 260)}px) rotate(${(1 - Math.min(1, k)) * (fromLeft ? -4 : 4)}deg) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 1.8), boxSizing: "border-box" }}>{r}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Pannello laterale: il video di Daniele si ritira a sinistra (resta sempre visibile) e a destra si costruisce un elenco
   («effetto elenco», una voce per parola detta) oppure scorre la mappa Italia ⇄ Namibia. La parte «camera» sta in CNReel (sideCam). ---------- */
export const SIDE = { scale: 0.5, x: 28, y: 280, px: 590, pw: 462 };   // video ridotto: 605×1075 a (36,150); pannello a destra da x 660, largo 384
export const sideK = (local: number, durF: number) => smooth(local / 12) * smooth((durF - local) / 12);

const land = feature(world as any, (world as any).objects.countries) as any;
const ROME: [number, number] = [12.5, 41.9], WINDHOEK: [number, number] = [17.08, -22.56];

const SideMap: React.FC<{ dir: "it-na" | "na-it"; local: number; durF: number; fps: number }> = ({ dir, local, durF }) => {
  const PW = SIDE.pw, PH = 960;
  const proj = geoMercator().fitExtent([[10, 60], [PW - 10, PH - 40]], { type: "MultiPoint", coordinates: [[-14, 46], [44, 46], [-14, -35], [44, -35]] } as any);
  const path = geoPath(proj);
  const a = proj(dir === "it-na" ? ROME : WINDHOEK)!, b = proj(dir === "it-na" ? WINDHOEK : ROME)!;
  const ctrl: [number, number] = [(a[0] + b[0]) / 2 + (dir === "it-na" ? 120 : -120), (a[1] + b[1]) / 2];
  const p = smooth((local - 14) / Math.max(20, durF - 44));
  const q = (t: number): [number, number] => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * ctrl[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * ctrl[1] + t * t * b[1]];
  const pts = Array.from({ length: 41 }, (_, i) => q((i / 40) * p));
  const head = q(p), prev = q(Math.max(0, p - 0.03));
  const ang = (Math.atan2(head[1] - prev[1], head[0] - prev[0]) * 180) / Math.PI;
  const it = proj(ROME)!, na = proj(WINDHOEK)!;
  const Label: React.FC<{ at: [number, number]; text: string; on: boolean; side: "l" | "r" }> = ({ at, text, on, side }) => (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <circle r={on ? 13 : 9} fill={BRAND.lime} /><circle r={on ? 26 : 0} fill="none" stroke={BRAND.lime} strokeWidth={3} opacity={0.5} />
      <g transform={`translate(${side === "r" ? 22 : -22} 0)`}>
        <rect x={side === "r" ? 0 : -text.length * 24 - 26} y={-30} width={text.length * 24 + 26} height={60} rx={14} fill={on ? BRAND.lime : "rgba(11,15,10,0.9)"} />
        <text x={side === "r" ? 12 : -12} y={12} textAnchor={side === "r" ? "start" : "end"} fontFamily={FONT} fontWeight={900} fontSize={38} fill={on ? BRAND.ink : BRAND.white}>{text}</text>
      </g>
    </g>
  );
  return (
    <svg width={PW} height={PH} style={{ borderRadius: 30, background: "#0E1F0B" }}>
      <path d={path(land) ?? ""} fill="#27521C" stroke="#3E7A2E" strokeWidth={0.8} />
      {land.features.filter((f: any) => f.id === "380" || f.id === "516").map((f: any) => <path key={f.id} d={path(f) ?? ""} fill={BRAND.lime} opacity={0.9} />)}
      <polyline points={pts.map((x) => x.join(",")).join(" ")} fill="none" stroke={BRAND.white} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" />
      <Label at={it as [number, number]} text="ITALIA" on={dir === "it-na" ? p < 0.5 : p > 0.9} side="r" />
      <Label at={na as [number, number]} text="NAMIBIA" on={dir === "it-na" ? p > 0.9 : p < 0.5} side="r" />
      <g transform={`translate(${head[0]} ${head[1]}) rotate(${ang})`} opacity={p > 0.01 && p < 0.995 ? 1 : 0}>
        <circle r={22} fill={BRAND.white} /><path d="M-10 -8 L12 0 L-10 8 L-5 0 Z" fill={BRAND.green} />
      </g>
    </svg>
  );
};

export const Side: React.FC<P<"side">> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durF = Math.round(el.dur * fps);
  const local = frame - start;
  if (local < 0 || local >= durF) return null;
  const k = sideK(local, durF);
  const items = el.items ?? [];
  const rowH = items.length ? Math.min(190, Math.floor((960 - (el.title ? 100 : 0)) / items.length)) : 0;
  return (
    <div style={{ position: "absolute", left: SIDE.px, top: SIDE.y, width: SIDE.pw, height: 960, fontFamily: FONT, opacity: Math.min(1, k * 1.5), transform: `translateX(${(1 - k) * 140}px)` }}>
      {el.map ? <SideMap dir={el.map} local={local} durF={durF} fps={fps} /> : (
        <>
          {el.title ? <div style={{ background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 52, lineHeight: 1.05, letterSpacing: 1, textTransform: "uppercase", borderRadius: 18, padding: "14px 18px", marginBottom: 16, textAlign: "center" }}>{el.title}</div> : null}
          {items.map((it, i) => {
            const t0 = el.onAt?.[i] !== undefined ? Math.round(el.onAt[i] * fps) : 14 + i * 12;
            const r = spring({ frame: local - t0, fps, config: { damping: 13, stiffness: 210, mass: 0.6 } });
            const on = local >= t0;
            // le voci sono SEMPRE più grandi dei sottotitoli (64): una riga se sta nella larghezza, altrimenti due righe dentro la casella
            const room = el.pairs ? 430 : 334;
            const fit = (t: string) => { const one = Math.min(84, rowH - 44, Math.floor(room / (0.57 * t.length))); if (one >= 66 || !t.includes(" ")) return one;
              const w = t.split(" "); let best = 99; for (let c = 1; c < w.length; c++) best = Math.min(best, Math.max(w.slice(0, c).join(" ").length, w.slice(c).join(" ").length));
              return Math.min(78, Math.floor((rowH - 30) / 2.1), Math.floor(room / (0.57 * best))); };
            const size = Math.min(...items.map(fit));
            return (
              <div key={i} style={{ height: rowH - 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 14, background: on ? "rgba(11,15,10,0.88)" : "rgba(255,255,255,0.05)", borderRadius: 18, padding: "0 16px", transform: `translateX(${on ? (1 - r) * 120 : 0}px)`, border: on ? `2px solid ${BRAND.lime}` : "2px solid rgba(255,255,255,0.10)", boxSizing: "border-box" }}>
                {el.pairs ? null : <div style={{ width: 66, height: 66, borderRadius: 33, background: on ? BRAND.lime : "rgba(255,255,255,0.12)", color: BRAND.ink, fontWeight: 900, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${on ? 0.7 + 0.3 * r : 1})` }}>{on ? i + 1 : ""}</div>}
                <div style={{ fontWeight: 900, fontSize: size, lineHeight: 1.02, textTransform: "uppercase", color: on ? (el.pairs && i % 2 === 0 ? BRAND.lime : BRAND.white) : "rgba(255,255,255,0)", textAlign: el.pairs ? "center" : "left", flex: 1, overflow: "hidden", maxHeight: rowH - 18 }}>{it}</div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};
