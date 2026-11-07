import { Composition } from "remotion";
import { FORMATS, seconds } from "./lib/formats";
import { KineticTitle } from "./compositions/KineticTitle";
import { SubtitledReel } from "./compositions/SubtitledReel";
import { BRollMontage, bRollDuration } from "./compositions/BRollMontage";
import demoCaptions from "./captions/demo.json";

const reel = FORMATS.reel;

const demoShots = [
  { src: "demo/shot1.jpg", seconds: 2.5, label: "Scena 1" },
  { src: "demo/shot2.jpg", seconds: 2.5, label: "Scena 2" },
  { src: "demo/shot3.jpg", seconds: 2.5, label: "Scena 3" },
];

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="KineticTitle"
      component={KineticTitle}
      durationInFrames={seconds(4, reel.fps)}
      {...reel}
      defaultProps={{ words: ["Monta", "i tuoi", "reel", "con", "Claude"] }}
    />
    <Composition
      id="SubtitledReel"
      component={SubtitledReel}
      durationInFrames={seconds(6, reel.fps)}
      {...reel}
      defaultProps={{ captions: demoCaptions }}
    />
    <Composition
      id="BRollMontage"
      component={BRollMontage}
      durationInFrames={bRollDuration(demoShots, reel.fps)}
      {...reel}
      defaultProps={{ shots: demoShots, transition: "fade" as const }}
    />
  </>
);
