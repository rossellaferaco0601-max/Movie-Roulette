import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { BRAND, W } from "./types";
import type { CTA as CTAT } from "./types";

const FONT = "Blinker, sans-serif";

/** CTA coaching: chiara e ordinata (Ross 11/11: «troppo incasinata, troppe cose da leggere in troppo poco tempo»).
 *  Tre passi, uno alla volta, dall'alto in basso: 1) la domanda + «coaching personalizzato di Correre Naturale®» evidenziato;
 *  2) «Commenta» + la parola, scritta e pubblicata (con il suono del tocco); 3) la notifica con il logo. Niente coriandoli, niente «Segui». */
export const CTA: React.FC<{ cta: CTAT; frames: number }> = ({ cta, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (delay: number, cfg = { damping: 16, stiffness: 130 }) => spring({ frame: frame - delay, fps, config: cfg });
  // ingresso: il pannello sale dal basso in 9 fotogrammi (niente dissolvenza: nessun velo verde sul video)
  const WIPE = 9;
  const up = 1 - Math.pow(1 - Math.min(1, frame / WIPE), 3);

  // tempi (fotogrammi): ogni blocco ha il tempo di essere letto prima del successivo
  const T_TITLE = 8, T_HL = 34, T_WORD = 72, T_BOX = 96, T_TYPE = 108, T_TAP = 138, T_PUB = 146, T_DM = 166;
  const typed = cta.word.slice(0, Math.floor(interpolate(frame, [T_TYPE, T_TYPE + 22], [0, cta.word.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const published = frame >= T_PUB;
  const tap = s(T_TAP, { damping: 9, stiffness: 260 });
  const hl = s(T_HL, { damping: 20, stiffness: 90 });
  return (
    <AbsoluteFill style={{ background: BRAND.green, transform: `translateY(${(1 - up) * 100}%)`, boxShadow: "0 -24px 60px rgba(0,0,0,0.45)", fontFamily: FONT, color: BRAND.white }}>
      {/* suono del tocco su «Pubblica» (unico suono della CTA, discreto) */}
      <Sequence from={T_TAP + 4} layout="none"><Audio src={staticFile("sfx/click.wav")} volume={0.8} /></Sequence>

      {/* 1 · domanda + frase evidenziata */}
      <div style={{ position: "absolute", top: 250, left: 0, width: W, textAlign: "center", padding: "0 80px", boxSizing: "border-box", opacity: s(T_TITLE), transform: `translateY(${(1 - s(T_TITLE)) * 40}px)` }}>
        <div style={{ fontWeight: 900, fontSize: cta.title.length > 44 ? 74 : 84, lineHeight: 1.04, textTransform: "uppercase" }}>{cta.title}</div>
        <div style={{ marginTop: 40, opacity: hl, transform: `scale(${0.9 + 0.1 * hl})` }}>
          <div style={{ fontWeight: 600, fontSize: 44, color: BRAND.cream, marginBottom: 12 }}>{cta.sub ?? "Te lo insegniamo con il"}</div>
          <div style={{ display: "inline-block", background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 52, lineHeight: 1.12, padding: "14px 30px", borderRadius: 18 }}>
            coaching personalizzato<br />di Correre Naturale®
          </div>
        </div>
      </div>

      {/* 2 · commenta la parola: campo che si scrive e si pubblica */}
      <div style={{ position: "absolute", top: 800, left: 0, width: W, textAlign: "center", opacity: s(T_WORD), transform: `translateY(${(1 - s(T_WORD)) * 40}px)` }}>
        <div style={{ fontWeight: 700, fontSize: 52, color: BRAND.cream }}>Commenta</div>
        <div style={{ fontWeight: 900, fontSize: 170, lineHeight: 1, color: BRAND.lime }}>{cta.word}</div>
      </div>
      <div style={{ position: "absolute", top: 1070, left: 90, width: W - 180, transform: `translateY(${(1 - s(T_BOX)) * 50}px)`, opacity: s(T_BOX) }}>
        <div style={{ background: BRAND.white, borderRadius: 999, height: 112, display: "flex", alignItems: "center", padding: "0 20px 0 36px", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ flex: 1, textAlign: "left", fontSize: 48, fontWeight: 700, color: typed ? BRAND.ink : "#9aa" }}>
            {typed || "Aggiungi un commento…"}
            {frame >= T_TYPE && frame < T_PUB && Math.floor(frame / 8) % 2 === 0 ? <span style={{ color: BRAND.green }}>|</span> : null}
          </div>
          <div style={{ background: published ? BRAND.lime : BRAND.green, color: published ? BRAND.ink : BRAND.white, borderRadius: 999, padding: "18px 34px", fontWeight: 900, fontSize: 38, transform: `scale(${1 - 0.15 * Math.sin(Math.PI * Math.min(1, tap))})` }}>
            {published ? "✓ Pubblicato" : "Pubblica"}
          </div>
        </div>
        {frame >= T_TAP - 8 && frame < T_PUB + 6 ? (
          <div style={{ position: "absolute", right: 70, top: 20, width: 72, height: 72, borderRadius: 36, border: `6px solid ${BRAND.lime}`, background: "rgba(149,255,0,0.35)", transform: `scale(${1.6 - 0.6 * tap})`, opacity: 0.9 }} />
        ) : null}
      </div>

      {/* 3 · notifica con il logo */}
      <div style={{ position: "absolute", top: 1250, left: 90, width: W - 180, transform: `translateY(${(1 - s(T_DM)) * 70}px)`, opacity: s(T_DM) }}>
        <div style={{ background: "rgba(11,15,10,0.92)", borderRadius: 30, padding: "24px 30px", display: "flex", gap: 24, alignItems: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
          <div style={{ width: 116, height: 116, borderRadius: 58, background: BRAND.green, border: `3px solid ${BRAND.lime}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Img src={staticFile("brand/logo-cn-bianco.png")} style={{ width: 104, height: 104 }} />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: 36, color: BRAND.lime }}>Correre Naturale®</div>
            <div style={{ fontWeight: 700, fontSize: 46, lineHeight: 1.15 }}>Ti mando tutte le info</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
