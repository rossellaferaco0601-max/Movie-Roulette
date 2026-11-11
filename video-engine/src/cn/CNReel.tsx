import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig, interpolate, useCurrentFrame, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Blinker";
import { useMemo } from "react";
import type { CNReelProps, Element } from "./types";
import { FPS, TAIL_FRAMES, H } from "./types";
import { layout, remapWords, resolveStart, resolveCues, secToFrames, tailFrames } from "./timeline";
import { Captions } from "./Captions";
import { Hook } from "./Hook";
import { ElementView } from "./Elements";
import { Text3D, Wave, Sphere3D, Gauge3D, ECG, Steps, Bars } from "./Elements3D";
import { CTA } from "./CTA";
import { Stairs, SplitCard, splitCamera, SPLIT_CARD_H, Metronome, Road3D, Graph, Toggles } from "./Elements2";
import { Clip, Compare, Step, Airflow, Filter, Beats, Ring, Duo, Slam, Orbit, Drill, slamImpact, slamShake, orbitCam } from "./Elements5";
import { Pair, Lifebar, Fulltext, Slides } from "./Elements6";
import { Flow, Renew, Versus, Grid4, Plan } from "./Elements7";
import { Title, Mouth, Runner, Lungs, Horizon, Chat, BigStrike, Stack, Guide, Question, NameTag } from "./Elements4";

loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });

/** elementi che occupano tutto il fotogramma: fuori dallo spostamento/scala della zona grafiche */
const FULLSCREEN = new Set<Element["kind"]>(["orbit", "drill", "guide", "pair", "lifebar", "fulltext", "slides", "renew", "versus", "plan"]);

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
    case "title": return <Title el={el} start={start} />;
    case "mouth": return <Mouth el={el} start={start} />;
    case "runner": return <Runner el={el} start={start} />;
    case "lungs": return <Lungs el={el} start={start} />;
    case "horizon": return <Horizon el={el} start={start} />;
    case "chat": return <Chat el={el} start={start} />;
    case "bigstrike": return <BigStrike el={el} start={start} />;
    case "stack": return <Stack el={el} start={start} />;
    case "guide": return <Guide el={el} start={start} />;
    case "question": return <Question el={el} start={start} />;
    case "pair": return <Pair el={el} start={start} />;
    case "lifebar": return <Lifebar el={el} start={start} />;
    case "fulltext": return <Fulltext el={el} start={start} />;
    case "slides": return <Slides el={el} start={start} />;
    case "flow": return <Flow el={el} start={start} />;
    case "renew": return <Renew el={el} start={start} />;
    case "versus": return <Versus el={el} start={start} />;
    case "grid4": return <Grid4 el={el} start={start} />;
    case "plan": return <Plan el={el} start={start} />;
    case "clip": return <Clip el={el} start={start} />;
    case "compare": return <Compare el={el} start={start} />;
    case "step": return <Step el={el} start={start} />;
    case "airflow": return <Airflow el={el} start={start} />;
    case "filter": return <Filter el={el} start={start} />;
    case "beats": return <Beats el={el} start={start} />;
    case "ring": return <Ring el={el} start={start} />;
    case "duo": return <Duo el={el} start={start} />;
    case "slam": return <Slam el={el} start={start} />;
    case "orbit": return <Orbit el={el} start={start} />;
    case "drill": return <Drill el={el} start={start} />;
    case "nametag": return <NameTag el={el} start={start} />;
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
  const tailF = tailFrames(p.tailSeconds);
  const { items, total } = useMemo(() => layout(p.segments, p.blendFrames, tailF), [p.segments, p.blendFrames, tailF]);
  const words = useMemo(() => remapWords(p.words, items, p.wordFix, p.wordOffset), [p.words, items, p.wordFix, p.wordOffset]);
  const starts = useMemo(() => p.elements.map((el) => resolveStart(el, words)), [p.elements, words]);
  const ctaFrames = Math.round(p.ctaSeconds * fps);
  const xfade = tailF; // la CTA parte al taglio e sale dal basso mentre il video (coda) continua sotto
  const tailPush = 1;
  const videoFade = 1; // niente dissolvenza verde sul video: il pannello della CTA lo copre salendo
  // camera del titolo spezzato: il video scende sotto la scheda a tutta larghezza (la testa resta intera)
  let cam = 0;
  p.elements.forEach((el, i) => { if (el.kind === "split") cam = Math.max(cam, splitCamera(frame, starts[i], Math.round(el.dur * fps))); });
  const camShift = H * SPLIT_CARD_H * cam;
  // push-in lento durante l'hook (tutto in Remotion: niente doppia immagine al rilascio)
  const hookF = p.hook ? Math.round(p.hook.dur * fps) : 0;
  const hookZoom = p.hookZoom && hookF ? interpolate(frame, [0, hookF, hookF + 15], [1, p.hookZoom, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }) : 1;

  // schianto: scossa della camera sull'urto della parola
  let shake = { dx: 0, dy: 0, sc: 1 };
  p.elements.forEach((el, i) => { if (el.kind === "slam") { const sh = slamShake(frame, slamImpact({ ...el, onAt: resolveCues(el, starts[i], words) } as Extract<Element, { kind: "slam" }>, starts[i], fps)); if (sh.sc !== 1) shake = sh; } });

  // orbita: il video continua a scorrere ma arretra (ancorato in basso), su fondo brand
  let orb = 0, orbBack = 0.72;
  p.elements.forEach((el, i) => { if (el.kind === "orbit") { const z = orbitCam(el, starts[i], frame, fps); if (z > orb) { orb = z; orbBack = el.back ?? 0.72; } } });
  const orbScale = 1 - (1 - orbBack) * orb;

  return (
    <AbsoluteFill style={{ background: "#2F4D1E", fontFamily: "Blinker, sans-serif" }}>
      <Sequence from={0} durationInFrames={total} layout="none">
        {cam > 0 ? <AbsoluteFill style={{ background: "#E9E4D2", opacity: cam }} /> : null}
        {orb > 0 ? <AbsoluteFill style={{ background: "linear-gradient(180deg,#1C3D15 0%,#0B0F0A 100%)" }} /> : null}
        <AbsoluteFill style={{ transform: `scale(${orbScale})`, transformOrigin: "50% 100%", borderRadius: 44 * orb, overflow: "hidden", boxShadow: orb > 0 ? "0 -20px 80px rgba(0,0,0,0.6)" : "none" }}>
        <AbsoluteFill style={{ opacity: videoFade, transform: `translate(${shake.dx}px, ${camShift + shake.dy}px) scale(${hookZoom * shake.sc * tailPush})`, transformOrigin: "50% 30%" }}>
          <Master src={p.master} total={total} />
        </AbsoluteFill>
        </AbsoluteFill>
        {p.hook ? <Hook hook={p.hook} /> : null}
        <AbsoluteFill style={{ transform: `translateY(${p.gfxShift ?? 0}px) scale(${p.gfxScale ?? 1})`, transformOrigin: `50% ${H * 0.44}px` }}>
          {p.elements.map((el, i) => (FULLSCREEN.has(el.kind) ? null : (
            <AnyElement key={i} el={{ ...el, onAt: resolveCues(el, starts[i], words) } as Element} start={starts[i]} />
          )))}
        </AbsoluteFill>
        {/* le grafiche a tutto schermo non si spostano né si rimpiccioliscono: devono coprire tutto il fotogramma (Ross 11/11: banda in alto) */}
        {p.elements.map((el, i) => (FULLSCREEN.has(el.kind) ? (
          <AnyElement key={i} el={{ ...el, onAt: resolveCues(el, starts[i], words) } as Element} start={starts[i]} />
        ) : null))}
        <AbsoluteFill style={{ transform: `translateY(${p.capShift ?? 0}px)` }}>
          <Captions words={words} endFrame={total - 4} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={total - xfade} durationInFrames={ctaFrames + xfade} layout="none">
        <CTA cta={p.cta} frames={ctaFrames} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const reelDuration = (p: CNReelProps) => layout(p.segments, p.blendFrames, tailFrames(p.tailSeconds)).total + Math.round(p.ctaSeconds * FPS);
