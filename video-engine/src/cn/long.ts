import type { CNLongProps } from "./CNLong";
import wordsMassimilianoLong from "./wordsMassimilianoLong.json";
import planMassimiliano from "../../work/massimiliano_long.json";
import wordsLauraLong from "./wordsLauraLongV2.json"; // v2 (12/11): senza i passaggi su Superhuman, sottotitoli della v1 riportati sulla nuova scaletta
import planLaura from "../../work/laura_long_v2.json";
import wordsTaddeoLong from "./wordsTaddeoLong.json";
import planTaddeo from "../../work/taddeo_long.json";
import wordsMattiaLong from "./wordsMattiaLong.json";
import planMattia from "../../work/mattia_long.json";
import wordsGiancarloLong from "./wordsGiancarloLong.json";
import planGiancarlo from "../../work/giancarlo_long.json";

/** Versioni lunghe orizzontali delle testimonianze (piano dei tagli: scripts/cn_long_plan.py). */
export const LONGS: { id: string; props: CNLongProps }[] = [
  {
    id: "T1-massimiliano-lungo",
    props: {
      master: "testimonianze/T1-massimiliano-lungo.mp4",
      // le parole sono ritrascritte sul master montato: un solo pezzo lungo quanto il master
      segments: [{ from: 0, to: planMassimiliano.total }],
      blendFrames: 0,
      words: wordsMassimilianoLong as CNLongProps["words"],
      wordFix: {},
      wordOffset: -0.05,
      chapters: planMassimiliano.chapters,
      name: "Massimiliano",
      sub: "54 anni · Pavia",
      end: { title: "Vuoi scrivere anche tu la tua storia?", sub: "Scopri i percorsi di coaching personalizzato" },
      endSeconds: 6,
    },
  },
  {
    id: "T2-laura-lungo",
    props: {
      master: "testimonianze/T2-laura-lungo.mp4",
      segments: [{ from: 0, to: planLaura.total }],
      blendFrames: 0,
      words: wordsLauraLong as CNLongProps["words"],
      wordFix: {},
      wordOffset: -0.05,
      chapters: planLaura.chapters,
      name: "Laura",
      sub: "Roma · con Correre Naturale dal 2016",
      end: { title: "Vuoi scrivere anche tu la tua storia?", sub: "Scopri i percorsi di coaching personalizzato" },
      endSeconds: 6,
    },
  },
  {
    id: "T3-taddeo-lungo",
    props: {
      master: "testimonianze/T3-taddeo-lungo.mp4",
      segments: [{ from: 0, to: planTaddeo.total }],
      blendFrames: 0,
      words: wordsTaddeoLong as CNLongProps["words"],
      wordFix: {},
      wordOffset: -0.05,
      chapters: planTaddeo.chapters,
      name: "Taddeo",
      sub: "Vicenza",
      end: { title: "Vuoi scrivere anche tu la tua storia?", sub: "Scopri i percorsi di coaching personalizzato" },
      endSeconds: 6,
    },
  },
  {
    id: "T4-mattia-lungo",
    props: {
      master: "testimonianze/T4-mattia-lungo.mp4",
      segments: [{ from: 0, to: planMattia.total }],
      blendFrames: 0,
      words: wordsMattiaLong as CNLongProps["words"],
      wordFix: {},
      wordOffset: -0.05,
      chapters: planMattia.chapters,
      name: "Mattia",
      sub: "Milano",
      end: { title: "Vuoi scrivere anche tu la tua storia?", sub: "Scopri i percorsi di coaching personalizzato" },
      endSeconds: 6,
    },
  },
  {
    id: "T6-giancarlo-lungo",
    props: {
      master: "testimonianze/T6-giancarlo-lungo.mp4",
      segments: [{ from: 0, to: planGiancarlo.total }],
      blendFrames: 0,
      words: wordsGiancarloLong as CNLongProps["words"],
      wordFix: {},
      wordOffset: -0.05,
      chapters: planGiancarlo.chapters,
      name: "Giancarlo",
      sub: "Esine · Valle Camonica",
      end: { title: "Vuoi scrivere anche tu la tua storia?", sub: "Scopri i percorsi di coaching personalizzato" },
      endSeconds: 6,
    },
  },
];
