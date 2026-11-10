import type { CNLongProps } from "./CNLong";
import wordsMassimilianoLong from "./wordsMassimilianoLong.json";
import planMassimiliano from "../../work/massimiliano_long.json";

/** Versioni lunghe orizzontali delle testimonianze (piano dei tagli: scripts/cn_long_plan.py). */
export const LONGS: { id: string; props: CNLongProps }[] = [
  {
    id: "T1-massimiliano-lungo",
    props: {
      master: "testimonianze/T1-massimiliano-lungo.mp4",
      segments: planMassimiliano.segments,
      blendFrames: planMassimiliano.blendFrames,
      words: wordsMassimilianoLong as CNLongProps["words"],
      wordFix: {},
      wordOffset: -0.08,
      chapters: planMassimiliano.chapters,
      name: "Massimiliano",
      sub: "54 anni · Pavia",
      end: { title: "Vuoi scrivere anche tu la tua storia?", sub: "Scopri i percorsi di coaching personalizzato" },
      endSeconds: 6,
    },
  },
];
