import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig, interpolate, useCurrentFrame, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Blinker";
import { useMemo } from "react";
import type { CNReelProps, Element } from "./types";
import { FPS, TAIL_FRAMES, H } from "./types";
import { layout, remapWords, resolveStart, secToFrames } from "./timeline";
import { Captions } from "./Captions";
import { Hook } from "./Hook";
import { ElementView } from "./Elements";
import { Text3D, Wave, Sphere3D, Gauge3D, ECG, Steps, Bars } from "./Elements3D";
import { CTA } from "./CTA";
import { Stairs, SplitCard, splitCamera, SPLIT_CARD_H, Metronome, Road3D, Graph, Toggles } from "./Elements2";

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
    case "stairs": return <Stairs el={el} start={start} />;
    case "split": return <SplitCard el={el} start={start} />;
    case "metronome": return <Metronome el={el} start={start} />;
    case "road3d": return <Road3D el={el} start={start} />;
    case "graph": return <Graph el={el} start={start} />;
    case "toggles": return <Toggles el={el} start={start} />;
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
  const xfade = TAIL_FRAMES;
  const videoFade = interpolate(frame, [total - xfade, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // camera del titolo spezzato: il video scende sotto la scheda a tutta larghezza (la testa resta intera)
  let cam = 0;
  p.elements.forEach((el, i) => { if (el.kind === "split") cam = Math.max(cam, splitCamera(frame, starts[i], Math.round(el.dur * fps))); });
  const camShift = H * SPLIT_CARD_H * cam;
  // push-in lento durante l'hook (tutto in Remotion: niente doppia immagine al rilascio)
  const hookF = p.hook ? Math.round(p.hook.dur * fps) : 0;
  const hookZoom = p.hookZoom && hookF ? interpolate(frame, [0, hookF, hookF + 15], [1, p.hookZoom, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }) : 1;

  return (
    <AbsoluteFill style={{ background: "#2F4D1E", fontFamily: "Blinker, sans-serif" }}>
      <Sequence from={0} durationInFrames={total} layout="none">
        {cam > 0 ? <AbsoluteFill style={{ background: "#E9E4D2", opacity: cam }} /> : null}
        <AbsoluteFill style={{ opacity: videoFade, transform: `translateY(${camShift}px) scale(${hookZoom})`, transformOrigin: "50% 30%" }}>
          <Master src={p.master} total={total} />
        </AbsoluteFill>
        {p.hook ? <Hook hook={p.hook} /> : null}
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
