import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Blinker";
import { useMemo } from "react";
import type { CNReelProps, Element } from "./types";
import { FPS } from "./types";
import { layout, remapWords, resolveStart, secToFrames } from "./timeline";
import { Captions } from "./Captions";
import { Hook } from "./Hook";
import { ElementView } from "./Elements";
import { Text3D, Wave, Sphere3D, Gauge3D, ECG, Steps, Bars } from "./Elements3D";
import { CTA } from "./CTA";

loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });

const AnyElement: React.FC<{ el: Element; start: number }> = ({ el, start }) => {
  switch (el.kind) {
    case "text3d": return <Text3D el={el} start={start} />;
    case "wave": return <Wave el={el} start={start} />;
    case "sphere3d": return <Sphere3D el={el} start={start} />;
    case "gauge3d": return <Gauge3D el={el} start={start} />;
    case "ecg": return <ECG el={el} start={start} />;
    case "steps": return <Steps el={el} start={start} />;
    case "bars": return <Bars el={el} start={start} />;
    default: return <ElementView el={el} start={start} />;
  }
};

/** Il master (già montato con FFmpeg) scorre continuo: niente seek tra i tagli, niente lampi. */
const Master: React.FC<{ src: string; total: number }> = ({ src, total }) => {
  const frame = useCurrentFrame();
  const tail = secToFrames(0.5);
  const volume = interpolate(frame, [total - tail, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <OffthreadVideo src={staticFile(src)} volume={volume} style={{ width: "100%", height: "100%" }} />;
};

export const CNReel: React.FC<CNReelProps> = (p) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { items, total } = useMemo(() => layout(p.segments, p.blendFrames), [p.segments, p.blendFrames]);
  const words = useMemo(() => remapWords(p.words, items, p.wordFix, p.wordOffset), [p.words, items, p.wordFix, p.wordOffset]);
  const starts = useMemo(() => p.elements.map((el) => resolveStart(el, words)), [p.elements, words]);
  const ctaFrames = Math.round(p.ctaSeconds * fps);
  const xfade = 12;
  const videoFade = interpolate(frame, [total - xfade, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#2F4D1E", fontFamily: "Blinker, sans-serif" }}>
      <Sequence from={0} durationInFrames={total} layout="none">
        <AbsoluteFill style={{ opacity: videoFade }}>
          <Master src={p.master} total={total} />
        </AbsoluteFill>
        <Hook hook={p.hook} />
        {p.elements.map((el, i) => (
          <AnyElement key={i} el={el} start={starts[i]} />
        ))}
        <Captions words={words} endFrame={total - 4} />
      </Sequence>
      <Sequence from={total - xfade} durationInFrames={ctaFrames + xfade} layout="none">
        <CTA cta={p.cta} frames={ctaFrames} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const reelDuration = (p: CNReelProps) => layout(p.segments, p.blendFrames).total + Math.round(p.ctaSeconds * FPS);
