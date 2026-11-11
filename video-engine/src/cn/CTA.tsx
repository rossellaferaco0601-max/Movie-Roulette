import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { BRAND, W } from "./types";
import type { CTA as CTAT } from "./types";

const FONT = "Blinker, sans-serif";

/** CTA coaching animata: commento che si scrive e si pubblica, notifica DM, bottone Segui. Nessuna emoji: solo forme e SVG. */
export const CTA: React.FC<{ cta: CTAT; frames: number }> = ({ cta, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (delay: number, cfg = { damping: 13, stiffness: 200 }) => spring({ frame: frame - delay, fps, config: cfg });
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // tempi (frame)
  const T_TITLE = 4, T_BOX = 30, T_TYPE = 45, T_TAP = 95, T_PUB = 108, T_DM = 135, T_FOLLOW = 165;
  const typed = cta.word.slice(0, Math.floor(interpolate(frame, [T_TYPE, T_TYPE + 24], [0, cta.word.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const published = frame >= T_PUB;
  const tap = s(T_TAP, { damping: 9, stiffness: 260 });
  const confetti = Array.from({ length: 26 }, (_, i) => i);
  const followed = frame >= T_FOLLOW + 18;

  // evidenziatore sulla frase chiave: fascia lime che si stende dietro al testo
  const HL: React.CSSProperties = { color: BRAND.ink, fontWeight: 800, padding: "2px 10px", borderRadius: 10, backgroundImage: `linear-gradient(${BRAND.lime}, ${BRAND.lime})`, backgroundRepeat: "no-repeat", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" };
  return (
    <AbsoluteFill style={{ background: BRAND.green, opacity: fadeIn, fontFamily: FONT, color: BRAND.white }}>
      {/* suono del tocco su "Pubblica" (unico suono della CTA, discreto) */}
      <Sequence from={T_TAP + 4} layout="none"><Audio src={staticFile("sfx/click.wav")} volume={0.8} /></Sequence>
      {/* motivo di fondo */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 20%, rgba(149,255,0,0.18), transparent 55%)` }} />

      {/* titolo */}
      <div style={{ position: "absolute", top: 230, left: 0, width: W, textAlign: "center", padding: "0 70px", transform: `translateY(${(1 - s(T_TITLE)) * 40}px)`, opacity: s(T_TITLE) }}>
        <div style={{ fontWeight: 900, fontSize: 86, lineHeight: 1.02, textTransform: "uppercase" }}>{cta.title}</div>
        <div style={{ fontWeight: 600, fontSize: 44, marginTop: 22, color: BRAND.cream, lineHeight: 1.2 }}>
          {cta.sub ?? (
            <>
              Nei percorsi di <span style={{ ...HL, backgroundSize: `${100 * s(T_TITLE + 14, { damping: 20, stiffness: 90 })}% 100%` }}>coaching personalizzato di Correre Naturale®</span> ti insegniamo a farlo passo dopo passo.
            </>
          )}
        </div>
      </div>

      {/* parola da commentare */}
      <div style={{ position: "absolute", top: 640, left: 0, width: W, textAlign: "center", opacity: s(T_BOX) }}>
        <div style={{ fontWeight: 700, fontSize: 46, color: BRAND.cream }}>Commenta la parola</div>
        <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1, color: BRAND.lime, transform: `scale(${0.8 + 0.2 * s(T_BOX, { damping: 8, stiffness: 220 })})` }}>{cta.word}</div>
      </div>

      {/* finto campo commento */}
      <div style={{ position: "absolute", top: 920, left: 90, width: W - 180, transform: `translateY(${(1 - s(T_BOX)) * 60}px)`, opacity: s(T_BOX) }}>
        <div style={{ background: BRAND.white, borderRadius: 999, height: 108, display: "flex", alignItems: "center", padding: "0 20px 0 30px", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: BRAND.az, marginRight: 22 }} />
          <div style={{ flex: 1, fontSize: 46, fontWeight: 700, color: typed ? BRAND.ink : "#9aa" }}>
            {typed || "Aggiungi un commento…"}
            {frame >= T_TYPE && frame < T_PUB && Math.floor(frame / 8) % 2 === 0 ? <span style={{ color: BRAND.green }}>|</span> : null}
          </div>
          <div
            style={{
              background: published ? BRAND.lime : BRAND.green,
              color: published ? BRAND.ink : BRAND.white,
              borderRadius: 999,
              padding: "16px 30px",
              fontWeight: 900,
              fontSize: 36,
              transform: `scale(${1 - 0.15 * Math.sin(Math.PI * Math.min(1, tap))})`,
            }}
          >
            {published ? "✓ Pubblicato" : "Pubblica"}
          </div>
        </div>
        {/* dito (cerchio) che tocca */}
        {frame >= T_TAP - 10 && frame < T_PUB + 6 ? (
          <div style={{ position: "absolute", right: 60, top: 30, width: 70, height: 70, borderRadius: 35, border: `6px solid ${BRAND.lime}`, background: "rgba(149,255,0,0.35)", transform: `scale(${1.6 - 0.6 * tap})`, opacity: 0.9 }} />
        ) : null}
        {/* coriandoli */}
        {published
          ? confetti.map((i) => {
              const t = (frame - T_PUB) / fps;
              const ang = (i / confetti.length) * Math.PI * 2;
              const dist = 60 + 320 * Math.min(1, t * 1.6);
              const x = Math.cos(ang) * dist + (W - 180) * 0.85;
              const y = Math.sin(ang) * dist * 0.7 + 54 + 260 * t * t;
              const op = interpolate(t, [0, 0.9], [1, 0], { extrapolateRight: "clamp" });
              return <div key={i} style={{ position: "absolute", left: x, top: y, width: 16, height: 26, borderRadius: 4, background: [BRAND.lime, BRAND.az, BRAND.cream][i % 3], transform: `rotate(${i * 47 + t * 400}deg)`, opacity: op }} />;
            })
          : null}
      </div>

      {/* notifica DM */}
      <div style={{ position: "absolute", top: 1100, left: 90, width: W - 180, transform: `translateY(${(1 - s(T_DM)) * 80}px)`, opacity: s(T_DM) }}>
        <div style={{ background: "rgba(11,15,10,0.9)", borderRadius: 28, padding: "24px 30px", display: "flex", gap: 22, alignItems: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
          <div style={{ width: 104, height: 104, borderRadius: 52, background: BRAND.green, border: `3px solid ${BRAND.lime}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Img src={staticFile("brand/logo-cn-bianco.png")} style={{ width: 92, height: 92 }} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 34, color: BRAND.lime }}>Correre Naturale® · messaggio</div>
            <div style={{ fontWeight: 600, fontSize: 38, lineHeight: 1.2 }}>Ecco tutte le info sui percorsi di <span style={{ color: BRAND.lime, fontWeight: 800 }}>coaching personalizzato</span></div>
          </div>
        </div>
      </div>

      {/* segui */}
      <div style={{ position: "absolute", top: 1360, left: 0, width: W, textAlign: "center", opacity: s(T_FOLLOW), transform: `scale(${0.9 + 0.1 * s(T_FOLLOW)})` }}>
        <div style={{ fontWeight: 700, fontSize: 40, color: BRAND.cream, marginBottom: 14 }}>@correrenaturale</div>
        <div style={{ display: "inline-block", background: followed ? BRAND.lime : BRAND.white, color: BRAND.ink, borderRadius: 999, padding: "20px 60px", fontWeight: 900, fontSize: 48 }}>
          {followed ? "✓ Segui già" : "+ Segui"}
        </div>
      </div>
    </AbsoluteFill>
  );
};
