import { AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

export type Shot = {
  /** file in public/ (mp4, mov, jpg, png) */
  src: string;
  /** durata in secondi */
  seconds: number;
  /** zoom Ken Burns: 1 = nessuno, 1.15 = leggero */
  zoom?: number;
  label?: string;
};

export type BRollMontageProps = { shots: Shot[]; transition?: "fade" | "slide" };

const isImage = (s: string) => /\.(png|jpe?g|webp)$/i.test(s);

const KenBurns: React.FC<{ shot: Shot; frames: number }> = ({ shot, frames }) => {
  const frame = useCurrentFrame();
  const zoom = shot.zoom ?? 1.12;
  const scale = interpolate(frame, [0, frames], [1, zoom], { extrapolateRight: "clamp" });
  const style = { width: "100%", height: "100%", objectFit: "cover" as const, transform: `scale(${scale})` };
  return (
    <AbsoluteFill>
      {isImage(shot.src) ? <Img src={staticFile(shot.src)} style={style} /> : <OffthreadVideo src={staticFile(shot.src)} style={style} muted />}
      {shot.label ? (
        <div style={{ position: "absolute", left: 60, bottom: 160, color: "white", fontSize: 54, fontWeight: 800, fontFamily: "Inter, sans-serif", textShadow: "0 2px 12px #000" }}>
          {shot.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Montaggio B-roll: serie di clip/immagini con Ken Burns e transizioni. */
export const BRollMontage: React.FC<BRollMontageProps> = ({ shots, transition = "fade" }) => {
  const { fps } = useVideoConfig();
  const presentation = transition === "slide" ? slide({ direction: "from-right" }) : fade();
  return (
    <TransitionSeries>
      {shots.map((shot, i) => {
        const frames = Math.round(shot.seconds * fps);
        return (
          <>
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={frames}>
              <KenBurns shot={shot} frames={frames} />
            </TransitionSeries.Sequence>
            {i < shots.length - 1 ? (
              <TransitionSeries.Transition key={`t${i}`} presentation={presentation} timing={linearTiming({ durationInFrames: 12 })} />
            ) : null}
          </>
        );
      })}
    </TransitionSeries>
  );
};

export const bRollDuration = (shots: Shot[], fps: number) =>
  shots.reduce((acc, s) => acc + Math.round(s.seconds * fps), 0) - 12 * Math.max(0, shots.length - 1);
