import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { BRAND, GFX_TOP, W } from "./types";
import { Trail } from "@remotion/motion-blur";
import { gsap } from "gsap";
const easeBack = gsap.parseEase("back.out(1.6)");
import type { Element } from "./types";

const FONT = "Blinker, sans-serif";

const useInOut = (start: number, durF: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - start;
  const s = spring({ frame: local, fps, config: { damping: 12, stiffness: 190, mass: 0.7 } });
  const out = interpolate(local, [durF - 8, durF], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  return { local, s, out, visible: local >= 0 && local < durF };
};

/** zona grafiche: y 0.47-0.74 (sottotitoli da 0.76) */
const ZONE_TOP = GFX_TOP;

export const Kinetic: React.FC<{ el: Extract<Element, { kind: "kinetic" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durF = Math.round(el.dur * fps);
  const { local, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: ZONE_TOP + 20, textAlign: "center", opacity: out }}>
      {el.words.map((w, i) => {
        const s = easeBack(Math.min(1, Math.max(0, (local - i * 5) / 14)));
        const accent = i === (el.accentIndex ?? el.words.length - 1);
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: accent ? 150 : 96,
              lineHeight: 0.95,
              textTransform: "uppercase",
              color: accent ? BRAND.lime : BRAND.white,
              transform: `scale(${Math.max(0.01, s)}) rotate(${(1 - s) * -6}deg)`,
              opacity: Math.min(1, Math.max(0, s)),
              textShadow: "0 6px 24px rgba(0,0,0,0.7)",
              WebkitTextStroke: accent ? "0" : "1px rgba(0,0,0,0.6)",
            }}
          >
            {w}
          </div>
        );
      })}
    </div>
  );
};

export const Widget: React.FC<{ el: Extract<Element, { kind: "widget" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: W - 120,
        top: ZONE_TOP,
        transformOrigin: "top center",
        transform: `translateY(${(1 - s) * 60}px) scale(${0.9 + 0.1 * s})`,
        opacity: Math.min(1, s * 1.3) * out,
        background: "rgba(11,15,10,0.9)",
        borderLeft: `14px solid ${BRAND.lime}`,
        border: "2px solid rgba(184,215,234,0.45)",
        borderLeftWidth: 14,
        borderLeftColor: BRAND.lime,
        borderRadius: 28,
        padding: "26px 36px 28px 34px",
        boxShadow: "0 18px 44px rgba(0,0,0,0.5)",
        fontFamily: FONT,
        color: BRAND.white,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 44, textTransform: "uppercase", color: BRAND.lime, letterSpacing: 1, marginBottom: 12, lineHeight: 1.05 }}>{el.title}</div>
      {el.lines.map((l, i) => {
        const ls = spring({ frame: local - 6 - i * 5, fps, config: { damping: 14, stiffness: 200 } });
        return (
          <div key={i} style={{ fontWeight: 700, fontSize: 52, lineHeight: 1.22, opacity: ls, transform: `translateX(${(1 - ls) * 30}px)`, textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
            <span style={{ color: BRAND.az, marginRight: 16 }}>▸</span>
            {l}
          </div>
        );
      })}
    </div>
  );
};

export const Stat: React.FC<{ el: Extract<Element, { kind: "stat" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: ZONE_TOP, textAlign: "center", opacity: out, fontFamily: FONT }}>
      <div
        style={{
          display: "inline-block",
          background: BRAND.green,
          color: BRAND.white,
          borderRadius: 30,
          padding: "14px 44px",
          transform: `scale(${s})`,
          boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1, color: BRAND.lime }}>{el.value}</div>
        <div style={{ fontWeight: 700, fontSize: 44, textTransform: "uppercase", letterSpacing: 2 }}>{el.label}</div>
      </div>
    </div>
  );
};

export const Pill: React.FC<{ el: Extract<Element, { kind: "pill" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: ZONE_TOP + 30, textAlign: "center", opacity: out, fontFamily: FONT }}>
      <div
        style={{
          display: "inline-block",
          background: BRAND.cream,
          color: BRAND.green,
          borderRadius: 999,
          padding: "16px 48px",
          fontWeight: 800,
          fontSize: 52,
          textTransform: "uppercase",
          transform: `rotate(-2deg) scale(${s})`,
          boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
        }}
      >
        {el.text}
      </div>
    </div>
  );
};

/** Scheda crema stile "palco": titolo con parola in lime e passi numerati. Copre solo la zona sotto il volto. */
export const Stage: React.FC<{ el: Extract<Element, { kind: "stage" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        width: W - 140,
        top: ZONE_TOP - 10,
        transform: `translateY(${(1 - s) * 80}px)`,
        opacity: Math.min(1, s * 1.3) * out,
        background: BRAND.cream,
        color: BRAND.ink,
        borderRadius: 30,
        padding: "26px 36px",
        boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
        fontFamily: FONT,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 48, textTransform: "uppercase", lineHeight: 1.05, marginBottom: 14, color: BRAND.green }}>
        {el.title.split(" ").map((w, i) => (
          <span key={i} style={w.toLowerCase() === el.keyword.toLowerCase() ? { background: BRAND.lime, color: BRAND.ink, padding: "0 10px", borderRadius: 8 } : {}}>
            {w}{" "}
          </span>
        ))}
      </div>
      {el.steps.map((st, i) => {
        const ls = spring({ frame: local - 8 - i * 7, fps, config: { damping: 14, stiffness: 200 } });
        return (
          <div key={i} style={{ display: "flex", gap: 18, alignItems: "center", fontSize: 42, fontWeight: 600, lineHeight: 1.2, marginBottom: 8, opacity: ls, transform: `translateX(${(1 - ls) * 40}px)` }}>
            <div style={{ minWidth: 56, height: 56, borderRadius: 28, background: BRAND.green, color: BRAND.white, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{i + 1}</div>
            <div>{st}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Checklist: React.FC<{ el: Extract<Element, { kind: "checklist" }>; start: number }> = ({ el, start }) => {
  const { fps } = useVideoConfig();
  const durF = Math.round(el.dur * fps);
  const { local, s, out, visible } = useInOut(start, durF);
  if (!visible) return null;
  return (
    <div style={{ position: "absolute", left: 120, width: W - 240, top: ZONE_TOP, opacity: Math.min(1, s * 1.3) * out, fontFamily: FONT, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {el.items.map((it, i) => {
        const ls = spring({ frame: local - i * 9, fps, config: { damping: 13, stiffness: 210 } });
        const struck = el.strike && local > i * 9 + 20;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12, transform: `translateX(${(1 - ls) * -60}px)`, opacity: ls }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: struck ? "#C2412E" : BRAND.green, display: "flex", alignItems: "center", justifyContent: "center", color: BRAND.white, fontWeight: 900, fontSize: 36 }}>{struck ? "✕" : "✓"}</div>
            <div style={{ background: "rgba(11,15,10,0.9)", color: BRAND.white, padding: "10px 26px", borderRadius: 14, fontWeight: 800, fontSize: 50, textDecoration: struck ? "line-through" : "none" }}>{it}</div>
          </div>
        );
      })}
    </div>
  );
};

export const ElementView: React.FC<{ el: Element; start: number }> = ({ el, start }) => {
  switch (el.kind) {
    case "kinetic": return <Kinetic el={el} start={start} />;
    case "widget": return <Widget el={el} start={start} />;
    case "stat": return <Stat el={el} start={start} />;
    case "pill": return <Pill el={el} start={start} />;
    case "stage": return <Stage el={el} start={start} />;
    case "checklist": return <Checklist el={el} start={start} />;
  }
};
