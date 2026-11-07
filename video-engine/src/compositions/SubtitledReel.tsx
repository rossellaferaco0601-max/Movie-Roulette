import { AbsoluteFill, OffthreadVideo, Audio, staticFile, useCurrentFrame, useVideoConfig, Sequence, interpolate, spring } from "remotion";
import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { useMemo } from "react";

export type SubtitledReelProps = {
  /** file in public/, es. "clip.mp4" (vuoto = sfondo scuro) */
  video?: string;
  /** file audio opzionale in public/ */
  audio?: string;
  /** caption nel formato @remotion/captions (output di scripts/transcribe.py) */
  captions: Caption[];
  highlight?: string;
};

/**
 * Reel con sottotitoli animati stile TikTok: la parola corrente viene evidenziata
 * e "salta" con una molla. Le caption arrivano da Whisper (scripts/transcribe.py).
 */
export const SubtitledReel: React.FC<SubtitledReelProps> = ({ video, audio, captions, highlight = "#FFD400" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 900 }),
    [captions],
  );

  const tMs = (frame / fps) * 1000;
  const page = pages.find((p) => tMs >= p.startMs && tMs < p.startMs + p.durationMs);

  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {video ? <OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      {audio ? <Audio src={staticFile(audio)} /> : null}

      {page ? (
        <Sequence from={Math.round((page.startMs / 1000) * fps)} layout="none">
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 14,
                maxWidth: 900,
                padding: "24px 32px",
                borderRadius: 24,
                background: "rgba(0,0,0,0.55)",
                fontFamily: "Inter, Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: 72,
                color: "white",
                textAlign: "center",
                textShadow: "0 4px 18px rgba(0,0,0,0.8)",
              }}
            >
              {page.tokens.map((tok, i) => {
                const active = tMs >= tok.fromMs && tMs < tok.toMs;
                const local = frame - Math.round((tok.fromMs / 1000) * fps);
                const s = active ? spring({ frame: local, fps, config: { damping: 10, stiffness: 220 } }) : 0;
                const scale = 1 + interpolate(s, [0, 1], [0, 0.1]);
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      padding: "0 10px",
                      transformOrigin: "center bottom",
                      color: active ? highlight : "white",
                      transform: `scale(${scale})`,
                    }}
                  >
                    {tok.text}
                  </span>
                );
              })}
            </div>
          </AbsoluteFill>
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
