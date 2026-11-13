import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { BRAND, GFX_TOP, W } from "./types";
import type { Hook as HookT } from "./types";

/** Hook "boxed": scritta animata sotto il mento di Daniele, visibile dal primo fotogramma, una sola parola in lime. */
export const Hook: React.FC<{ hook: HookT }> = ({ hook }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durF = Math.round(hook.dur * fps);
  if (frame > durF + 8) return null;
  const out = interpolate(frame, [durF, durF + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: W,
        top: GFX_TOP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity: out,
      }}
    >
      {hook.lines.map((line, li) => {
        const s = spring({ frame: frame - li * 4, fps, config: { damping: 13, stiffness: 200 } });
        return (
          <div
            key={li}
            style={{
              transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + 0.1 * s})`,
              opacity: Math.min(1, s * 1.2),
              background: "rgba(11,15,10,0.82)",
              borderLeft: `10px solid ${BRAND.green}`,
              borderRadius: 14,
              padding: "10px 30px",
              fontFamily: "Blinker, sans-serif",
              fontWeight: 900,
              fontSize: 76,
              lineHeight: 1.05,
              textTransform: "uppercase",
              color: BRAND.white,
              letterSpacing: -1,
            }}
          >
            {line.split(" ").map((w, wi) => (
              <span key={wi} style={{ color: w.toLowerCase() === hook.keyword.toLowerCase() ? BRAND.lime : BRAND.white }}>
                {w}{" "}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};
