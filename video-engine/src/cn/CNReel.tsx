import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont } from "@remotion/google-fonts/Blinker";
import { useMemo } from "react";
import type { CNReelProps } from "./types";
import { FPS, H, SRC_W, VID_SCALE, W } from "./types";
import { layout, remapWords, secToFrames } from "./timeline";
import { Captions } from "./Captions";
import { Hook } from "./Hook";
import { ElementView } from "./Elements";
import { CTA } from "./CTA";

loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });

/** Clip del sorgente 16:9 4K ritagliata in 9:16 sul volto, con punch-in alternato e dissolvenze audio. */
const Clip: React.FC<{ src: string; from: number; to: number; punch: number; len: number }> = ({ src, from, to, punch, len }) => {
  const frame = useCurrentFrame();
  const fadeIn = secToFrames(0.12), fadeOut = secToFrames(0.28);
  const volume = (f: number) =>
    Math.min(
      interpolate(f, [0, fadeIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      interpolate(f, [len - fadeOut, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    );
  const vidW = SRC_W * VID_SCALE;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", left: (W - vidW) / 2, top: 0, width: vidW, height: H, transform: `scale(${punch})`, transformOrigin: "50% 28%" }}>
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={secToFrames(from)}
          endAt={secToFrames(to)}
          volume={volume}
          style={{ width: vidW, height: H, objectFit: "cover" }}
        />
      </div>
      <span style={{ display: "none" }}>{frame}</span>
    </AbsoluteFill>
  );
};

export const CNReel: React.FC<CNReelProps> = (p) => {
  const { fps } = useVideoConfig();
  const { items, total } = useMemo(() => layout(p.segments, p.blendFrames), [p.segments, p.blendFrames]);
  const words = useMemo(() => remapWords(p.words, items, p.wordFix), [p.words, items, p.wordFix]);
  const ctaFrames = Math.round(p.ctaSeconds * fps);

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: "Blinker, sans-serif" }}>
      <TransitionSeries>
        {items.map((it, i) => (
          <>
            <TransitionSeries.Sequence key={`c${i}`} durationInFrames={it.len}>
              <Clip src={p.src} from={it.seg.from} to={it.seg.to} punch={i % 2 === 0 ? 1 : 1.08} len={it.len} />
            </TransitionSeries.Sequence>
            {i < items.length - 1 ? (
              <TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({ durationInFrames: p.blendFrames })} />
            ) : null}
          </>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence durationInFrames={ctaFrames + 12}>
          <CTA cta={p.cta} frames={ctaFrames} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* livello grafico (sopra il video, sotto il volto) */}
      <Sequence from={0} durationInFrames={total} layout="none">
        <Hook hook={p.hook} />
        {p.elements.map((el, i) => (
          <ElementView key={i} el={el} start={secToFrames(el.at)} />
        ))}
        <Captions words={words} emph={p.emph} endFrame={total - 6} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const reelDuration = (p: CNReelProps) => layout(p.segments, p.blendFrames).total + Math.round(p.ctaSeconds * FPS);
