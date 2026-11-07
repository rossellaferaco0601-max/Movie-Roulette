import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { popIn, fadeOut } from "../lib/easing";

export type KineticTitleProps = {
  words: string[];
  accent?: string;
  background?: string;
};

/**
 * Kinetic typography: ogni parola entra con una molla, sfalsata di pochi frame,
 * con leggera rotazione e scala. Pensato per reel verticali 1080x1920.
 */
export const KineticTitle: React.FC<KineticTitleProps> = ({
  words,
  accent = "#FF3366",
  background = "#0B0B0F",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const stagger = 6;

  return (
    <AbsoluteFill
      style={{
        background,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, Helvetica, Arial, sans-serif",
        opacity: fadeOut(frame, durationInFrames),
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, padding: 80 }}>
        {words.map((word, i) => {
          const s = popIn(frame, fps, i * stagger);
          const rotate = interpolate(s, [0, 1], [-12, 0]);
          const isAccent = i % 3 === 2;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: 140,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -4,
                color: isAccent ? accent : "white",
                transform: `scale(${s}) rotate(${rotate}deg) translateY(${(1 - s) * 60}px)`,
                opacity: s,
                textTransform: "uppercase",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
