import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { gsap } from "gsap";
import { BRAND, GFX_H, GFX_TOP, H, W } from "./types";
import type { Element } from "./types";
import { useInOut } from "./Elements3D";

const FONT = "Blinker, sans-serif";
const easeOut = gsap.parseEase("power3.out");

/* ---------- Gradini: il corpo si allena per gradi (scala che si costruisce un gradino alla volta, pallina che sale) ---------- */
export const Stairs: React.FC<{ el: Extract<Element, { kind: "stairs" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  const n = el.steps ?? 5;
  const boxW = W - 140, boxH = GFX_H - 10;
  const padX = 60, baseY = boxH - 44, stepW = (boxW - padX * 2) / n, stepH = (boxH - 150) / n;
  const per = Math.max(6, Math.floor((durF - 30) / n)); // frame per gradino
  const k = (local - 10) / per; // gradino corrente (frazionario)
  const ballIdx = Math.min(n - 1, Math.max(0, Math.floor(k)));
  const ballT = Math.min(1, Math.max(0, k - ballIdx));
  const hop = Math.sin(Math.PI * ballT) * 36;
  const bx = padX + stepW * (ballIdx + 0.5) + stepW * easeOut(ballT) * (ballIdx < n - 1 ? 1 : 0);
  const by = baseY - stepH * (ballIdx + 1) - 26 - hop - (ballIdx < n - 1 ? stepH * easeOut(ballT) : 0);
  return (
    <div
      style={{
        position: "absolute", left: 70, width: boxW, top: GFX_TOP, height: boxH, borderRadius: 30, overflow: "hidden",
        background: "rgba(11,15,10,0.88)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", fontFamily: FONT, color: BRAND.white,
        opacity: Math.min(1, s * 1.3) * out, transform: `translateY(${(1 - s) * 40}px)`,
      }}
    >
      <div style={{ position: "absolute", top: 18, left: 0, width: "100%", textAlign: "center", fontWeight: 800, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: BRAND.lime }}>{el.title}</div>
      <svg width={boxW} height={boxH} style={{ position: "absolute", top: 0, left: 0 }}>
        {Array.from({ length: n }).map((_, i) => {
          const g = interpolate(local - 10 - i * per, [0, per * 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.4)) });
          const h = stepH * (i + 1) * g;
          const lit = k >= i;
          return (
            <g key={i}>
              <rect x={padX + stepW * i + 6} y={baseY - h} width={stepW - 12} height={h} rx={10} fill={lit ? BRAND.green : "rgba(255,255,255,0.12)"} />
              <rect x={padX + stepW * i + 6} y={baseY - h} width={stepW - 12} height={Math.min(10, h)} rx={5} fill={lit ? BRAND.lime : "rgba(255,255,255,0.25)"} />
              <text x={padX + stepW * (i + 0.5)} y={baseY + 32} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={lit ? BRAND.cream : "rgba(255,255,255,0.45)"}>{i === 0 ? "SETT. 1" : `${i + 1}`}</text>
            </g>
          );
        })}
        <line x1={padX} x2={boxW - padX} y1={baseY} y2={baseY} stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
        {local > 10 ? <circle cx={bx} cy={by} r={22} fill={BRAND.lime} style={{ filter: `drop-shadow(0 0 12px ${BRAND.lime})` }} /> : null}
      </svg>
    </div>
  );
};

/* ---------- Titolo spezzato: scheda crema dall'alto, il video si rimpicciolisce sotto (nessun taglio della testa) ---------- */
export const splitCamera = (frame: number, start: number, durF: number) => {
  const local = frame - start;
  if (local < -1 || local > durF + 1) return 0;
  const kin = easeOut(Math.min(1, Math.max(0, local / 13)));
  const kout = Math.min(1, Math.max(0, (durF - local) / 9));
  return kin * kout;
};
export const SPLIT_CARD_H = 0.3; // frazione dell'altezza
export const SPLIT_SCALE = 0.7;

export const SplitCard: React.FC<{ el: Extract<Element, { kind: "split" }>; start: number }> = ({ el, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const k = splitCamera(frame, start, durF);
  if (k <= 0) return null;
  const ch = H * SPLIT_CARD_H;
  const local = frame - start;
  const size = 108;
  return (
    <div style={{ position: "absolute", left: 0, top: ch * (k - 1), width: W, height: ch, background: BRAND.cream, borderBottom: `8px solid ${BRAND.green}`, fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 70, top: ch * 0.16, display: "flex", flexDirection: "column", gap: 8 }}>
        {el.lines.map((ln, j) => {
          const kj = interpolate(local - 5 - j * 4, [0, 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <div key={j} style={{ fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: -2, textTransform: "uppercase", color: BRAND.ink, opacity: kj, transform: `translateY(${(1 - kj) * 36}px)`, whiteSpace: "nowrap" }}>
              {ln.split(" ").map((w, wi) => {
                const acc = w.toLowerCase() === el.accent.toLowerCase();
                const hk = acc ? interpolate(local - 16, [0, 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 0;
                return (
                  <span key={wi} style={{ position: "relative", display: "inline-block", marginRight: "0.25em" }}>
                    {acc ? <span style={{ position: "absolute", left: -12, right: -12, top: 2, bottom: -2, background: BRAND.green, borderRadius: 18, transform: `scaleX(${hk})`, transformOrigin: "left" }} /> : null}
                    <span style={{ position: "relative", color: acc && hk > 0.6 ? BRAND.lime : BRAND.ink, padding: acc ? "0 2px" : 0 }}>{w}</span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", right: 60, bottom: 22, fontWeight: 700, fontSize: 30, color: BRAND.green, letterSpacing: 1 }}>Correre Naturale®</div>
    </div>
  );
};
