import { Composition } from "remotion";
import { FORMATS, seconds } from "./lib/formats";
import { KineticTitle } from "./compositions/KineticTitle";
import { SubtitledReel } from "./compositions/SubtitledReel";
import { BRollMontage, bRollDuration } from "./compositions/BRollMontage";
import demoCaptions from "./captions/demo.json";
import { CNReel, reelDuration } from "./cn/CNReel";
import { REELS } from "./cn/reels51";
import { RSReel, rsDuration } from "./rs/RSReel";
import rsDemo from "./rs/demo.json";

const reel = FORMATS.reel;

const demoShots = [
  { src: "demo/shot1.jpg", seconds: 2.5, label: "Scena 1" },
  { src: "demo/shot2.jpg", seconds: 2.5, label: "Scena 2" },
  { src: "demo/shot3.jpg", seconds: 2.5, label: "Scena 3" },
];

export const RemotionRoot: React.FC = () => (
  <>
    {REELS.map((r) => (
      <Composition key={r.id} id={r.id} component={CNReel} durationInFrames={reelDuration(r.props)} {...reel} defaultProps={r.props} />
    ))}
    {/* Motore ReelStudio (project.json del PC): props = scripts/rs_props.ts */}
    <Composition
      id="RSReel"
      component={RSReel}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={150}
      defaultProps={rsDemo as any}
      calculateMetadata={({ props }: any) => ({ durationInFrames: rsDuration(props), fps: props.fps || 30 })}
    />
    <Composition id="KineticTitle" component={KineticTitle} durationInFrames={seconds(4, reel.fps)} {...reel} defaultProps={{ words: ["Monta", "i tuoi", "reel", "con", "Claude"] }} />
    <Composition id="SubtitledReel" component={SubtitledReel} durationInFrames={seconds(6, reel.fps)} {...reel} defaultProps={{ captions: demoCaptions }} />
    <Composition id="BRollMontage" component={BRollMontage} durationInFrames={bRollDuration(demoShots, reel.fps)} {...reel} defaultProps={{ shots: demoShots, transition: "fade" as const }} />
  </>
);
