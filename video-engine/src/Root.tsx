import { Composition } from "remotion";
import { FORMATS } from "./lib/formats";
import { CNReel, reelDuration } from "./cn/CNReel";
import { REELS } from "./cn/reels51";
import { RSReel, rsDuration } from "./rs/RSReel";
import rsDemo from "./rs/demo.json";

const reel = FORMATS.reel;

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
  </>
);
