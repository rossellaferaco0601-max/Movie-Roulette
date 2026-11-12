import words from "./words51.json";
import wordsDaniela from "./wordsDaniela.json";
import wordsMassimiliano from "./wordsMassimiliano.json";
import wordsLaura from "./wordsLaura.json";
import wordsTaddeo from "./wordsTaddeo.json";
import wordsMattia from "./wordsMattia.json";
import wordsC3500 from "./wordsC3500.json";
import wordsC3501 from "./wordsC3501.json";
import wordsC3502 from "./wordsC3502.json";
import wordsC3504 from "./wordsC3504.json";
import wordsCcbV1Runner from "./wordsCcbV1Runner.json";
import wordsCcbV1Namibia from "./wordsCcbV1Namibia.json";
import wordsCcbV2Ricetta from "./wordsCcbV2Ricetta.json";
import wordsCcbV2Ritrova from "./wordsCcbV2Ritrova.json";
import wordsCcbV2Sentendo from "./wordsCcbV2Sentendo.json";
import wordsLongevita from "./wordsLongevita.json";
import type { CNReelProps, Seg } from "./types";
import { layout } from "./timeline";

const SRC = "ytcn51/ytcn51_src.mp4";
const master = (id: string, fx = false) => `ytcn51/masters/${id}${fx ? "_fx" : ""}.mp4`;
const LIME = "#95FF00";

const base = {
  src: SRC,
  words: words as CNReelProps["words"],
  blendFrames: 5,
  ctaSeconds: 8, // 11/11: CTA in tre passi con il tempo di leggerli (era 7)
  // le parole di YTCN 51 sono allineate col riconoscitore fonetico (cn_align.py): la grafica parte 2 fotogrammi prima dell'attacco della parola
  wordOffset: -0.06,
  wordFix: {} as Record<string, string>,
};

/** `cover`: copertina nel formato unico (CNCover): fotogramma pulito del master, occhiello della serie, titolo, parola in lime.
 *  `frame` a mano oppure scelto da scripts/cn_smile.py (sorriso, occhi aperti); `shiftY` alza il video nei selfie (il mento arriverebbe sotto il titolo). */
export type ReelDef = { id: string; title: string; props: CNReelProps; didascalia: string; cover?: { frame?: number; kicker: string; lines: string[]; accent?: string; shiftY?: number; master?: string } };
const seg = (from: number, to: number) => ({ from, to });
/** Pezzi a partire dai PUNTI DI TAGLIO DELL'AUDIO (misurati con scripts/cn_align.py, nelle pause tra le parole): il video sborda di mezzo
 *  incrocio (0,083 s) sui tagli interni e ogni pezzo dura un numero intero di fotogrammi. */
const cutN = (blend: number, ...a: [number, number][]) => a.map(([f, t], i) => {
  const hb = blend / 2 / 30, from = +(i ? f - hb : f).toFixed(3), to0 = i < a.length - 1 ? t + hb : t;
  return { from, to: +(from + Math.round((to0 - from) * 30) / 30).toFixed(4) };
});
const cut = (...a: [number, number][]) => cutN(5, ...a);
const BREATH = [{ label: "INSPIRA", sec: 3.5, scale: 1 }, { label: "ESPIRA", sec: 4.5, scale: 0.25 }];

/** Pezzi di un reel accorciato a `endSec` (tempo del reel): serve per le varianti dei reel CCB senza rifare i tagli. */
const upTo = (segs: Seg[], blend: number, endSec: number): Seg[] => {
  const f = Math.round(endSec * 30), out: Seg[] = [];
  for (const it of layout(segs, blend).items) {
    if (f - it.start < 3) break;
    if (it.start + it.len <= f) out.push(it.seg);
    else { out.push({ from: it.seg.from, to: +(it.seg.from + (f - it.start) / 30).toFixed(4) }); break; }
  }
  return out;
};
/** Coda dell'ultimo pezzo di un reel, da `fromSec` (tempo del reel) alla fine. */
const tailFrom = (segs: Seg[], blend: number, fromSec: number): Seg => {
  const items = layout(segs, blend).items, it = items[items.length - 1];
  return { from: +(it.seg.from + (Math.round(fromSec * 30) - it.start) / 30).toFixed(4), to: it.seg.to };
};
/** Pezzi di un reel ridotto ad alcuni intervalli del suo master (tempi del master, in secondi): ogni intervallo ridiventa uno o più pezzi
 *  del sorgente, così parole e grafiche si riagganciano da sole. Un bordo che cade dentro un incrocio vale per il pezzo che resta. */
const cutRanges = (segs: Seg[], blend: number, ranges: [number, number][]): Seg[] => {
  const items = layout(segs, blend).items, out: Seg[] = [];
  for (const [a, b] of ranges) {
    const fa = Math.round(a * 30), fb = Math.round(b * 30);
    for (const it of items) {
      const s = Math.max(fa, it.start), e = Math.min(fb, it.start + it.len);
      if (e - s <= Math.max(2, blend)) continue;
      out.push({ from: +(it.seg.from + (s - it.start) / 30).toFixed(4), to: +(it.seg.from + (e - it.start) / 30).toFixed(4) });
    }
  }
  return out;
};
/** Grafiche di un reel riportate su una variante fatta di intervalli del suo master: restano quelle che cadono per intero in un intervallo
 *  (la coda di 0,5 s vale come margine), spostate sul nuovo tempo; i richiami alla CTA a voce (`pointer`) passano solo se `pointers`. */
const keepEls = (els: CNReelProps["elements"], ranges: [number, number][], blend = 1, pointers = false): CNReelProps["elements"] => {
  const out: CNReelProps["elements"] = [];
  let off = 0;
  ranges.forEach(([a, b], i) => {
    for (const e of els) if ((pointers || e.kind !== "pointer") && e.at >= a - 0.05 && e.at + e.dur <= b + 0.45) out.push({ ...e, at: +(e.at - a + off).toFixed(2) });
    off += b - a - (i < ranges.length - 1 ? blend / 30 : 0);
  });
  return out;
};
const playEnd = (segs: Seg[], blend: number) => +((layout(segs, blend).total - 15) / 30).toFixed(4);
/** Ricette dei master ritagliati da master già fatti (scripts/ccb_build.ts): id → sorgenti, intervalli (tempo del master di partenza),
 *  incrocio in fotogrammi (1 = stacco netto) e file di uscita (default: public/ccb/masters/<id>.mp4). */
export const CCB_BUILD: Record<string, { srcs: string[]; ranges: [number, number][]; blend?: number; out?: string; tailLive?: boolean }> = {};

// T2 Laura senza riferimenti a Superhuman (Ross 12/11: «parla solo di metodo Correre Naturale»): dal master v1 restano tre intervalli.
// Via «con Superhuman ho avuto l'opportunità di farlo e sta funzionando» (21,13-27,43) e «e soprattutto con la Superhuman Academy» (30,77-34,63).
const T2_SEGS = cut([119.82, 128.37], [133.78, 138.05], [138.52, 139.66], [51.15, 55.7], [57.28, 60.05], [72.47, 73.97], [74.18, 78.9], [164.06, 171.14], [172.12, 177.19], [178.19, 182.42], [201.06, 204.03], [222.85, 237.4], [272.7, 277.0], [277.5, 282.6]);
const T2_KEEP: [number, number][] = [[0, 634 / 30], [823 / 30, 923 / 30], [1039 / 30, playEnd(T2_SEGS, 5)]];
CCB_BUILD["T2-laura-v2"] = { srcs: ["testimonianze/T2-laura.mp4"], ranges: T2_KEEP, blend: 5, out: "testimonianze/T2-laura_v2.mp4" };

const C6_SEGS = cutN(1, [17.61, 44.99], [53.17, 96.92], [116.56, 121.58]);
const C7_SEGS = cutN(1, [0.5, 17.31], [231.85, 275.22]);

export const REELS: ReelDef[] = [
  {
    id: "R1-fiatone",
    title: "Non sei fatto per correre? Sbagliato",
    cover: { kicker: "Respirazione nella corsa", lines: ["Ti manca", "il fiato?"], accent: "il fiato?" },
    props: {
      ...base,
      master: master("R1-fiatone", true),
      capFrom: 3.85, // niente sottotitoli finché dura l'hook visivo (Oscar 12/11)
      // tagli: la frase "e in questo video ti spiego perché" (16.9-23.8) è tolta; i bordi cadono nelle pause tra le parole
      segments: [seg(0.0, 16.8), seg(23.88, 44.84)],
      // motivo visivo del reel 1: allarme / frequenza (riflettore, ECG, timbro, titolo spezzato)
      hook: null,
      fx: [
        { fx: "spotlight", at: 0, dur: 3.4, wide: true, text: "TI MANCA IL FIATO?", color: LIME, font: "bold", push: 1.0 },
        { fx: "reject-stamp", at: 10.2, word: "sbagliato", dur: 2.4, text: "SBAGLIATO", color: LIME, bg: "#0B0F0A", y: 0.62 },
      ],
      elements: [
        { kind: "ecg", at: 6.4, word: "cuore", dur: 3.2, title: "Il cuore in gola", bpmFrom: 148, bpmTo: 176 },
        { kind: "widget", at: 12.9, dur: 3.6, title: "Il problema non è il corpo", lines: ["Nessuno ti ha insegnato", "a respirare nel modo giusto"] },
        { kind: "wave", at: 17.2, word: "fiatone", dur: 6.0, title: "Il fiatone", mode: "calm-to-chaos" },
        { kind: "stairs", at: 24.4, word: "gradi", dur: 2.8, title: "Il corpo si allena per gradi", steps: 5 },
        { kind: "widget", at: 27.7, word: "veloce", dur: 4.8, title: "Se parti troppo veloce", lines: ["il respiro si scompone", "il cervello va in allarme", "e ti ferma"] },
        { kind: "split", at: 32.8, word: "corsa", dur: 4.3, lines: ["Non è la corsa", "è il respiro"], accent: "respiro" },
      ],
      cta: { word: "FIATO", title: "Vuoi correre senza fiatone?" },
    },
    didascalia: `Ti manca il fiato dopo pochi minuti di corsa? Non è il tuo corpo che non è adatto: nessuno ti ha mai insegnato a respirare nel modo giusto.

Il fiatone quasi mai è un segno di scarso allenamento. È il segnale che stai correndo fuori controllo: parti troppo veloce, il respiro si scompone, il cervello va in allarme e ti ferma. Il corpo si allena per gradi, non per forza di volontà.

Non è la corsa che ti stanca: è la respirazione che ti sta sabotando.

Vuoi imparare a correre senza fiatone? Commenta FIATO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #fiatone #respirazione #corsa #running`,
  },
  {
    id: "R2-naso",
    title: "Il primo passo: respira con il naso",
    cover: { kicker: "Respirazione nella corsa", lines: ["Respira", "con il naso"], accent: "naso" },
    props: {
      ...base,
      master: master("R2-naso"),
      capFrom: 4.2, // niente sottotitoli finché dura l'hook visivo (Oscar 12/11)
      // 11/11 (Ross: «le animazioni non seguono le parole e sono sempre le stesse, cambialo completamente»): sei grafiche tutte diverse,
      // ognuna con le parti interne agganciate alle parole dette; niente effetti sul master, coda ferma (niente salto prima della CTA)
      segments: cut([53.8, 74.16]), // il sorgente cambia inquadratura a 74,20
      tailLive: 0,
      hook: null,
      elements: [
        { kind: "step", at: 0.2, word: "primo", dur: 4.0, cues: ["passo", "fiatone", "quando"], n: "1", label: "Il primo passo", sub: "per eliminare il", strike: "Fiatone" },
        { kind: "airflow", at: 4.4, word: "respirare", dur: 2.6, cues: ["respirare", "naso"], lines: ["Respira", "con il naso"] },
        { kind: "filter", at: 7.16, word: "filtro", dur: 3.3, cues: ["filtro", "regolatore"] },
        { kind: "beats", at: 10.9, word: "obbliga", dur: 3.6, cues: ["ritmo", "sostenibile"], words: ["Ritmo", "sostenibile"] },
        { kind: "ring", at: 14.7, word: "usare", dur: 2.95, cues: ["ossigeno", "efficiente"], words: ["Ossigeno", "efficiente"] },
        { kind: "duo", at: 17.85, word: "controllo", dur: 2.75, cues: ["corpo", "e"], title: "Controllo", words: ["Corpo", "Mente"] },
      ],
      cta: { word: "NASO", title: "Vuoi imparare a respirare bene quando corri?" },
    },
    didascalia: `È come far girare un motore in quinta appena lo accendi: non regge, va in tilt. Nella corsa servono le marce giuste, e la prima marcia è il naso.

Respirare con il naso è il primo passo per eliminare il fiatone. Il naso è il filtro e il regolatore naturale del respiro: ti obbliga a tenere un ritmo sostenibile, ti aiuta a usare l'ossigeno in modo efficiente e ti tiene in controllo sul corpo e sulla mente.

Prova nella prossima corsa: bocca chiusa, e se ti viene voglia di aprirla, rallenta.

Commenta NASO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #respirazionenasale #corsa #running #fiatone`,
  },
  {
    id: "R3-bocca",
    title: "Chiudi la bocca e trova il tuo ritmo",
    cover: { kicker: "Respirazione nella corsa", lines: ["Chiudi", "la bocca"], accent: "la bocca" },
    props: {
      ...base,
      master: master("R3-bocca"),
      capFrom: 2.73, // niente sottotitoli finché dura l'hook visivo (Oscar 12/11)
      // 11/11: la bocca disegnata («dozzinale») è sostituita da una clip realistica generata (Canva), che chiude la bocca su «chiudi»;
      // le altre grafiche sono le stesse della v8, agganciate alle parole
      segments: cut([74.2, 98.5]),
      tailLive: 0.06,
      hook: null,
      // 11/11 sera (Ross: «troppo veloci e discordanti»): meno grafiche e più lunghe; tolta la sfera inspira/espira che non c'entrava col parlato
      elements: [
        { kind: "clip", at: 0.1, word: "durante", dur: 2.7, cues: ["chiudi"], src: "ytcn51/b3d/runner_naso_chiaro.mp4", from: 1.0, posY: 0.12, tag: "Durante la corsa", text: "Chiudi la bocca" },
        { kind: "checklist", at: 2.98, word: "voglia", dur: 6.5, big: true, cues: ["voglia", "rallenta"], items: ["Voglia di aprire la bocca?", "Rallenta o cammina"] },
        { kind: "widget", at: 9.96, word: "respirazione", dur: 5.55, cues: ["stimola", "ossigena", "calma"], title: "Respirazione nasale", lines: ["Stimola il diaframma", "Ossigena i tessuti", "Calma il sistema nervoso"] },
        { kind: "graph", at: 20.02, word: "sentire", dur: 3.95, title: "Energia dopo la corsa", label: "non meno, come spesso capita", from: 40, to: 100 },
      ],
      cta: { word: "ENERGIA", title: "Vuoi finire la corsa con più energia di prima?" },
    },
    didascalia: `Durante la corsa chiudi la bocca. Se ti viene voglia di aprirla, rallenta o cammina: così il corpo impara mano a mano a trovare il suo ritmo naturale.

La respirazione nasale stimola il diaframma, ossigena meglio i tessuti e calma il sistema nervoso. Il risultato non è solo respirare meglio: è sentire più energia dopo la corsa, non meno come spesso capita.

Commenta ENERGIA e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #respirazione #corsa #running #energia`,
  },
  {
    id: "R4-piano",
    title: "Il secondo errore: corri troppo forte",
    cover: { kicker: "Respirazione nella corsa", lines: ["Corri", "troppo forte?"], accent: "troppo forte?" },
    props: {
      ...base,
      master: master("R4-piano"),
      capFrom: 2.6, // niente sottotitoli finché dura l'hook visivo (Oscar 12/11)
      // audio e Daniele partono da "molti pensano…"; il titolo grande "Correre troppo forte" apre il reel (Ross 8/11)
      // 11/11: ogni grafica entra sulla parola detta (tempi allineati), righe degli elenchi comprese
      segments: cut([101.71, 130.58]),
      tailLive: 0,
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 2.6, lines: ["Correre", "troppo forte"], accent: "forte" },
        { kind: "runner", at: 2.75, word: "spingere", dur: 5.2, cues: ["imparare", "più"], fast: "Spingere di più", slow: "Più piano", bpmFrom: 182, bpmTo: 142 },
        { kind: "road3d", at: 8.17, word: "obiettivo", dur: 5.6, title: "Obiettivo iniziale", fromLabel: "TROPPO FORTE", toLabel: "PIANO", fromSpeed: 178, toSpeed: 138, unit: "bpm" },
        { kind: "stat", at: 14.89, word: "20", dur: 1.3, value: "20-30", label: "minuti di corsa" },
        { kind: "checklist", at: 16.29, word: "respira", dur: 1.9, big: true, cues: ["respira"], items: ["Respira solo dal naso"] },
        { kind: "compare", at: 18.4, word: "senti", dur: 6.75, cues: ["perdere", "cammina", "torni", "riparti"], sides: [{ q: "Perdi il controllo?", a: "Cammina" }, { q: "Torni calmo?", a: "Riparti" }] },
        { kind: "bars", at: 25.45, word: "l'allenamento", dur: 3.2, title: "Capacità aerobica", labels: ["Sett. 1", "Sett. 2", "Sett. 3", "Sett. 4"], values: [30, 48, 68, 92] },
      ],
      cta: { word: "PIANO", title: "Vuoi costruire resistenza senza farti male?" },
    },
    didascalia: `Il secondo errore di chi inizia a correre è correre troppo forte. Molti pensano che per migliorare bisogna spingere di più: in realtà bisogna imparare a correre più piano.

All'inizio l'obiettivo non è la velocità, è costruire resistenza e insegnare al corpo a gestire l'energia. Prova così: corsa di 20-30 minuti respirando solo dal naso; ogni volta che senti di perdere il controllo cammina, e quando torni a respirare con calma riparti. Questa alternanza è l'allenamento perfetto per costruire capacità aerobica.

Commenta PIANO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #correrepiano #resistenza #corsa #running`,
  },
  {
    id: "R5-esercizi",
    title: "Tre esercizi per allenare il respiro",
    cover: { kicker: "Respirazione nella corsa", lines: ["3 esercizi", "per il respiro"], accent: "3 esercizi" },
    props: {
      ...base,
      master: master("R5-esercizi"),
      capFrom: 3.5, // niente sottotitoli finché dura l'hook visivo (Oscar 12/11)
      blendFrames: 2,
      capShift: 34,     // sottotitoli più in basso (sempre sopra 0,80): la palla delle guide sta al centro dello schermo
      // 11/11 (Ross): apertura tagliata su «correre bene / dipende / da come respiri» con lo schianto su «respiri»; i tre esercizi tutti in un
      // reel (R6 e R7 scartati); su «tre esercizi» fermo immagine con i titoli in orbita sopra la testa. Le schede grafiche del sorgente
      // (148,8-162,3 · 179,95-190,3 · 204,6-219,3) sono coperte dalle guide a tutto schermo, a tappe agganciate alle parole.
      segments: cutN(2, [131.26, 131.98], [133.56, 134.09], [134.47, 146.71], [149.34, 165.5], [172.52, 190.89], [198.98, 205.0], [205.08, 218.8], [221.54, 235.48]),
      hook: null,
      elements: [
        { kind: "slam", at: 0, dur: 3.5, cues: ["correre", "dipende", "respiri"], lead: ["Correre bene", "dipende da come"], text: "Respiri" },
        { kind: "kinetic", at: 3.9, word: "allenare", dur: 2.9, words: ["SI ALLENA", "COME UN MUSCOLO"], accentIndex: 1 },
        { kind: "orbit", at: 8.7, word: "tre", dur: 5.0, cues: ["semplici"], titles: ["Nasale controllata", "Pause respiratorie", "Respirazione ritmica"], headX: 0.55, headTop: 0.05, back: 0.68 },
        { kind: "drill", at: 13.4, dur: 13.3, fadeIn: 0, cues: ["chiudi", "inspira", "espira"], n: 1, title: "Respirazione|nasale controllata", steps: [
          { label: "Bocca chiusa", sub: "molto semplice", shape: "hold", color: "cream" },
          { label: "Inspira", sub: "lentamente dal naso · 3-4 secondi", shape: "grow", color: "az" },
          { label: "Espira", sub: "sempre dal naso · 4-5 secondi", shape: "shrink", color: "lime" },
        ] },
        { kind: "stat", at: 27.3, word: "respiri", dur: 2.0, value: "10 respiri", label: "mantenendo la calma" },
        { kind: "kinetic", at: 31.0, word: "più", dur: 1.75, words: ["PIÙ RESISTENZA", "MENO AFFANNO"], accentIndex: 0 },
        { kind: "title", at: 33.3, word: "secondo", dur: 3.5, cues: ["secondo", "quello"], lines: ["Esercizio 2", "Pause respiratorie"], accent: "2" },
        { kind: "drill", at: 36.87, dur: 10.8, fadeIn: 5, cues: ["dopo", "trattieni", "riprendi", "fallo"], n: 2, title: "Pause|respiratorie", steps: [
          { label: "Espira", sub: "una normale espirazione", shape: "shrink", color: "lime" },
          { label: "Trattieni", sub: "il respiro per qualche secondo", shape: "ring", color: "cream" },
          { label: "Riprendi", sub: "a respirare dal naso", shape: "grow", color: "az" },
          { label: "volte", sub: "mi raccomando, senza forzare", shape: "count", big: "5-10" },
        ] },
        { kind: "kinetic", at: 50.1, word: "controllo", dur: 2.6, words: ["IN CONTROLLO", "SENZA PANICO"], accentIndex: 0 },
        { kind: "drill", at: 53.43, dur: 14.57, fadeIn: 5, fadeOut: 4, cues: ["cammina", "inspira", "espira", "trova"], n: 3, title: "Respirazione|ritmica", steps: [
          { label: "Cammina o corri", sub: "piano, respirando dal naso", shape: "feet", n: 4, color: "cream" },
          { label: "Inspira", sub: "per 3 passi", shape: "feet", n: 3, color: "az" },
          { label: "Espira", sub: "per 4 passi", shape: "feet", n: 4, color: "lime" },
          { label: "Trova il tuo ritmo", sub: "quello che ti fa sentire in equilibrio", shape: "pulse", color: "lime" },
        ] },
        { kind: "widget", at: 68.8, word: "sincronizzerai", dur: 5.6, cues: ["sincronizzerai", "sforzo", "fluidità"], title: "Il risultato", lines: ["Respiro e movimento insieme", "Meno sforzo", "Più fluidità"] },
        { kind: "title", at: 76.3, word: "sembrano", dur: 2.75, cues: ["sembrano", "cambiano"], lines: ["Sembrano semplici", "ma cambiano tutto"], accent: "tutto" },
        { kind: "kinetic", at: 79.3, word: "gestire", dur: 2.5, words: ["GESTIRE IL RESPIRO", "INVECE DI SUBIRLO"], accentIndex: 0 },
      ],
      cta: { word: "ESERCIZI", title: "Vuoi tutti gli esercizi per respirare meglio?" },
    },
    didascalia: `Correre bene dipende da come respiri. E la buona notizia è che la respirazione si allena, proprio come un muscolo. Tre esercizi semplici che puoi iniziare oggi stesso.

1. Respirazione nasale controllata: bocca chiusa, inspira lentamente dal naso per 3-4 secondi, espira sempre dal naso per 4-5 secondi. Dieci respiri, con calma. Risultato: più resistenza, meno affanno.

2. Pause respiratorie: dopo una normale espirazione trattieni il respiro per qualche secondo, poi riprendi a respirare dal naso. 5-10 volte, senza forzare. Impari a correre in controllo, senza panico.

3. Respirazione ritmica: cammina o corri piano respirando dal naso, inspira per tre passi ed espira per quattro, e trova il ritmo che ti fa sentire in equilibrio. Sincronizzi respiro e movimento: meno sforzo, più fluidità.

Sembrano semplici, ma cambiano tutto: ti insegnano a gestire il respiro invece di subirlo.

Commenta ESERCIZI e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #respirazione #esercizi #corsa #running`,
  },
  {
    id: "R8-dialogo",
    title: "La corsa è un dialogo con il tuo corpo",
    cover: { kicker: "Respirazione nella corsa", lines: ["Un dialogo", "con il tuo corpo"], accent: "dialogo" },
    props: {
      ...base,
      master: master("R8-dialogo"),
      capFrom: 2.67, // niente sottotitoli finché dura l'hook visivo (Oscar 12/11)
      // 11/11: «Il concetto chiave [di questo video] è che…»: tolto "di questo video" con un taglio nelle pause; grafiche agganciate alle parole
      // 11/11 sera: parte direttamente da «la corsa non è un test di resistenza»
      segments: cut([244.68, 279.8]),
      tailLive: 0.1,
      hook: null,
      elements: [
        { kind: "chat", at: 0.06, word: "corsa", dur: 2.6, cues: ["corsa", "test"], sender: "Il tuo corpo", messages: ["La corsa non è", "un test di resistenza"] },
        { kind: "kinetic", at: 3.4, word: "dialogo", dur: 2.6, words: ["UN DIALOGO", "CON IL TUO CORPO"], accentIndex: 0 },
        { kind: "widget", at: 6.12, word: "ascoltarlo", dur: 4.4, cues: ["smetti", "inizi"], title: "Quando impari ad ascoltarlo", lines: ["Smetti di soffrire", "Inizi a goderti ogni passo"] },
        { kind: "bigstrike", at: 11.24, word: "spingere", dur: 1.4, text: "Spingere di più" },
        { kind: "lungs", at: 12.82, word: "respirare", dur: 2.2, title: "Respirare meglio", sub: "non di più" },
        { kind: "stack", at: 15.2, word: "fiato", dur: 7.4, cues: ["fermarti", "respirare", "rallentare", "ascoltare"], title: "Se ti manca il fiato", items: ["Non fermarti", "Impara a respirare", "Impara a rallentare", "Ascolta il tuo corpo"] },
        { kind: "horizon", at: 24.32, word: "correrai", dur: 3.5, title: "Più lontano, meno sforzo", kmTo: 10 },
        { kind: "title", at: 32.02, word: "significa", dur: 3.4, cues: ["significa", "lontano", "ed"], lines: ["Correre bene =", "Andare lontano", "ed essere sostenibili"], accent: "lontano" },
      ],
      cta: { word: "LONTANO", title: "Vuoi correre più lontano con meno sforzo?" },
    },
    didascalia: `La corsa non è un test di resistenza: è un dialogo tra te e il tuo corpo. Quando impari ad ascoltarlo smetti di soffrire e inizi a goderti ogni passo.

Non serve spingere di più, serve respirare meglio. Se ti manca il fiato non fermarti: impara a respirare, a rallentare e ad ascoltare il tuo corpo. In poco tempo correrai più lontano, con più energia e meno sforzo. Correre bene non significa andare forte: significa andare lontano ed essere sostenibili.

Commenta LONTANO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #corsa #running #ascoltailcorpo #sostenibile`,
  },
  {
    id: "D1-daniela",
    title: "Dal divano alla mezza maratona a 60 anni (testimonianza di Daniela, workshop 24/10)",
    cover: { kicker: "Testimonianza", lines: ["Daniela", "la mezza a 60 anni"], accent: "Daniela" },
    props: {
      ...base,
      src: "daniela/daniela_src.mp4",
      words: wordsDaniela as CNReelProps["words"],
      master: "daniela/D1-daniela.mp4",
      // testimonianza: poche grafiche, grandi, mai sul volto; stacco sul gruppo che corre in "sono ritornata a correre"
      // tagli misurati sull'audio (10/11): ogni pezzo sborda di mezzo incrocio (0,083 s) oltre il punto di taglio dell'audio
      segments: [seg(0, 10.83), seg(26.36, 31.52), seg(33.72, 48.96), seg(50.27, 53.83), seg(62.27, 68.93), seg(72.72, 76.21), seg(112.3, 116.42), seg(118.96, 126.9)],
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 3.5, lines: ["Dal divano", "alla mezza maratona", "a 60 anni"], accent: "60" },
        { kind: "kinetic", at: 9.2, word: "miracolato.", dur: 1.1, words: ["MI HA", "MIRACOLATO"], accentIndex: 1 },
        { kind: "kinetic", at: 12.33, word: "secondo", dur: 2.6, words: ["IL SECONDO", "MIRACOLO"], accentIndex: 1 },
        { kind: "kinetic", at: 31.1, word: "era", dur: 2.9, words: ["PRESO", "IN TEMPO"], accentIndex: 1 },
        { kind: "stat", at: 36.13, word: "tre", dur: 2.4, value: "3 settimane", label: "ed è tornata a correre" },
        { kind: "kinetic", at: 42.9, word: "filosofia", dur: 1.1, words: ["UNA FILOSOFIA", "DI VITA"], accentIndex: 1 },
        { kind: "stat", at: 44.42, word: "60", dur: 3.2, value: "60 anni", label: "la stessa mezza maratona" },
        { kind: "kinetic", at: 49.97, word: "Daniela", dur: 3.7, words: ["LA DANIELA DI 60", "BATTE", "LA DANIELA DI 50"], accentIndex: 1 },
        { kind: "stat", at: 53.97, word: "20", dur: 1.8, value: "−20 min", label: "dieci anni dopo" },
      ],
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«Ero una che stava sul divano a guardare la televisione e non avevo mai corso.»

Daniela ha iniziato con Correre Naturale® per dimagrire. Poi è arrivato quello che lei chiama il secondo miracolo: grazie alla filosofia della cura del proprio corpo ha fatto gli esami che doveva fare, e ha scoperto in tempo un brutto male. Dopo tre settimane era di nuovo a correre.

E c'è un numero che dice tutto: nella mezza maratona la Daniela di 60 anni batte la Daniela di 50 di oltre 20 minuti.

Non è solo correre: è una filosofia di vita. Tra dieci anni puoi stare meglio di adesso.

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running #mezzamaratona`,
  },
  {
    id: "T1-massimiliano",
    title: "Una vita di infortuni, poi la svolta a 54 anni (testimonianza di Massimiliano)",
    cover: { kicker: "Testimonianza", lines: ["Massimiliano", "la svolta a 54 anni"], accent: "Massimiliano" },
    props: {
      ...base,
      src: "testimonianze/massimiliano_src.mp4",
      words: wordsMassimiliano as CNReelProps["words"],
      master: "testimonianze/T1-massimiliano.mp4",
      // volto grande (intervista stretta): grafiche sotto il mento (da 0,53) e più piccole, tutto sopra 0,80 (zona sicura Instagram)
      gfxShift: 173,
      gfxScale: 0.8,
      capShift: 30,
      // testimonianza da intervista: tagli misurati sull'audio, domande dell'intervistatore a schermo (fuori microfono nel girato)
      segments: [seg(56.17, 57.58), seg(64.27, 68.38), seg(73.9, 76.28), seg(80.86, 86.33), seg(91.52, 101.18), seg(15.32, 16.48), seg(17.22, 23.83), seg(372.47, 375.13), seg(283.42, 288.11), seg(292.43, 297.43), seg(312.54, 317.18), seg(321.3, 326.78), seg(332.32, 334.43), seg(342.73, 347.42), seg(348.2, 352.9)],
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 3.0, lines: ["Una vita di infortuni", "poi la svolta", "a 54 anni"], accent: "54" },
        { kind: "nametag", at: 3.2, dur: 2.4, name: "Massimiliano", sub: "54 anni · Pavia" },
        { kind: "kinetic", at: 6.2, word: "fatto", dur: 1.3, words: ["HO FATTO IL", "FAI DA TE"], accentIndex: 1 },
        { kind: "kinetic", at: 10.5, word: "fatto", dur: 2.1, words: ["MI SONO FATTO MALE", "TANTE VOLTE"], accentIndex: 1 },
        { kind: "kinetic", at: 13.2, word: "riprendevo", dur: 2.6, words: ["RIPRENDEVO", "MOLLAVO"], accentIndex: 1 },
        { kind: "kinetic", at: 19.9, word: "consapevolezza", dur: 1.6, words: ["AVEVO BISOGNO DI", "UNA GUIDA"], accentIndex: 1 },
        { kind: "question", at: 22.15, dur: 1.5, text: "Cosa è cambiato?" },
        { kind: "stack", at: 23.9, dur: 5.55, title: "È cambiato tutto", items: ["Il fisico", "La mente", "L'energia", "La disciplina"], onAt: [0.1, 1.2, 2.75, 4.5] },
        { kind: "kinetic", at: 30.8, word: "ben", dur: 1.25, words: ["BEN OLTRE", "LE ASPETTATIVE"], accentIndex: 0 },
        { kind: "question", at: 32.15, dur: 2.3, text: "Cosa diresti a chi è indeciso?" },
        { kind: "stat", at: 35.5, word: "54", dur: 1.5, value: "54 anni", label: "non aspettare quanto me" },
        { kind: "kinetic", at: 38.0, word: "scelta", dur: 2.6, words: ["LA SCELTA PIÙ", "IMPORTANTE"], accentIndex: 1 },
        { kind: "kinetic", at: 41.65, word: "sentirti", dur: 3.2, words: ["SENTIRTI MEGLIO", "STARE MEGLIO"], accentIndex: 1 },
        { kind: "stack", at: 46.33, dur: 4.6, title: "Lo trasmetti", items: ["in casa", "alla tua famiglia", "ai tuoi figli"], onAt: [1.4, 2.45, 4.1] },
        { kind: "kinetic", at: 52.33, word: "non", dur: 1.0, words: ["NON HA", "PREZZO"], accentIndex: 1 },
        { kind: "kinetic", at: 56.93, word: "prima", dur: 1.1, words: ["IL PRIMA", "POSSIBILE"], accentIndex: 1 },
        { kind: "kinetic", at: 59.93, word: "svolta", dur: 2.3, words: ["TI SVOLTA", "LA VITA"], accentIndex: 1 },
      ],
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«Una vita di infortuni.»

Massimiliano correva anche dieci volte a settimana, con il fai da te. Si è fatto male tante volte, ha ripreso e mollato per anni, finché ha capito di avere bisogno di una guida.

Con il percorso Correre Naturale® è cambiato tutto: il fisico, la mente, l'energia e soprattutto la disciplina. «È andato ben oltre le mie aspettative.»

Il suo consiglio a chi è indeciso: non aspettare i 54 anni. Stare meglio lo trasmetti in casa, alla tua famiglia, ai tuoi figli. E questo non ha prezzo.

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running #infortuni`,
  },
  // ---------- LONGEVITÀ («Ho letto 5 studi sulla longevità», video YouTube già montato) ----------
  // Master con scripts/cn_master_shots.py (un ritaglio per inquadratura); le schede grafiche del sorgente sono coperte da grafiche a tutto schermo.
  {
    id: "L1-ventanni",
    title: "Gli ultimi 20 anni",
    cover: { kicker: "Longevità", lines: ["Gli ultimi", "20 anni"], accent: "20 anni" },
    props: {
      ...base,
      src: "longevita/longevita.webm",
      words: wordsLongevita as CNReelProps["words"],
      master: "longevita/masters/L1-ventanni.mp4",
      gfxShift: 30, // grafiche e sottotitoli un filo più in basso (sempre sopra 0,80): margine sul mento quando Daniele si muove
      capShift: 20,
      blendFrames: 2,
      tailLive: 0.2,
      segments: cutN(2, [0.0, 12.9], [58.72, 69.34], [76.7, 113.95], [661.7, 666.74]),
      hook: null,
      elements: [
        { kind: "kinetic", at: 1.8, word: "30", dur: 2.2, words: ["30 ANNI", "DI VITA IN PIÙ"], accentIndex: 0 },
        { kind: "kinetic", at: 4.9, word: "tutti", dur: 1.25, words: ["TUTTI", "ALLA FINE"], accentIndex: 1 },
        { kind: "kinetic", at: 10.4, word: "quanti", dur: 2.3, words: ["QUANTI ANNI IN SALUTE", "TI AGGIUNGE CORRERE?"], accentIndex: 1 },
        { kind: "pair", at: 12.87, dur: 10.7, fadeIn: 0, fadeOut: 0, cues: ["primo", "lifespan", "secondo", "healthspan"], title: "Due numeri", sub: "definiscono la tua vita", items: [{ def: "Quanti anni vivi", name: "Lifespan" }, { def: "Quanti anni vivi bene", name: "Healthspan" }] },
        { kind: "kinetic", at: 26.8, word: "non", dur: 1.4, words: ["NON VANNO", "PIÙ INSIEME"], accentIndex: 1 },
        { kind: "lifebar", at: 28.3, word: "in", dur: 16.45, fadeOut: 0, cues: ["83", "60", "20", "pensa", "mesi", "due"], place: "In Italia", title: "Aspettativa di vita media", total: 83, healthy: 60, decline: "Ultimi 20 anni", declineSub: "in declino", focus: "20 anni", focusNot: "non sono pochi mesi", focusIs: "Due decenni" },
        { kind: "kinetic", at: 45.8, word: "spegne", dur: 1.3, words: ["IL CORPO", "SI SPEGNE"], accentIndex: 1 },
        { kind: "bigstrike", at: 53.45, word: "quanto", dur: 1.35, text: "Quanto a lungo vivo?" },
        { kind: "question", at: 55.05, word: "vera", dur: 3.75, label: "La domanda vera", text: "Quando il mio corpo smetterà di funzionare?" },
        { kind: "fulltext", at: 59.0, dur: 1.85, fadeIn: 0, fadeOut: 0, lines: ["E perderò", "la mia libertà"] },
        { kind: "title", at: 60.97, dur: 4.75, cues: ["non", "perché", "ma", "perché"], lines: ["Non si smette di correre", "perché si invecchia.", "Si invecchia perché", "si smette di correre."], accent: "invecchia" },
      ],
      cta: { word: "PIANO", title: "Vuoi vivere più anni in salute?" },
    },
    didascalia: `La medicina moderna ci ha regalato 30 anni di vita in più. Ma c'è un problema: ce li ha messi tutti alla fine.

Due numeri definiscono la tua vita: il lifespan, quanti anni vivi, e l'healthspan, quanti anni vivi bene. In Italia l'aspettativa di vita è circa 83 anni, ma quella in salute si ferma intorno ai 60: in media passiamo gli ultimi 20 anni in declino. Dolori cronici, fiato corto, perdita di autonomia.

La domanda vera non è «quanto a lungo vivo», ma «a che punto il mio corpo smetterà di funzionare come dovrebbe».

Non si smette di correre perché si invecchia: si invecchia perché si smette di correre.

Vuoi costruire il tuo piano? Commenta PIANO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #longevità #healthspan #corsa #running`,
  },
  {
    id: "L2-farmaco",
    title: "Nessun farmaco ha questo effetto",
    cover: { kicker: "Longevità", lines: ["Nessun farmaco", "ha questo effetto"], accent: "farmaco" },
    props: {
      ...base,
      src: "longevita/longevita.webm",
      words: wordsLongevita as CNReelProps["words"],
      master: "longevita/masters/L2-farmaco.mp4",
      gfxShift: 30,
      capShift: 20,
      blendFrames: 2,
      tailLive: 0,
      // quasi tutto il tratto, nel video YouTube, è fatto di schede di dati: qui sono rifatte a tutto schermo, un gruppo alla volta sulle parole
      segments: cutN(2, [126.42, 130.24], [162.6, 163.9], [169.14, 174.02], [178.12, 198.42], [198.48, 201.66], [204.18, 241.74]),
      hook: null,
      elements: [
        { kind: "kinetic", at: 0.2, word: "segnale", dur: 1.6, words: ["IL SEGNALE", "PIÙ POTENTE"], accentIndex: 1 },
        { kind: "fulltext", at: 2.0, dur: 1.85, fadeIn: 0, fadeOut: 0, lines: ["Il movimento", "aerobico"] },
        { kind: "slides", at: 5.1, dur: 20.95, fadeIn: 0, fadeOut: 4, cues: ["100.000", "misurando", "risultato", "ogni", "13%", "15%"], header: "Meta-analisi", source: "Kodama et al. (2009), JAMA", steps: [
          { g: 0, kind: "stat", value: "100.000", label: "persone sane seguite nel tempo" },
          { g: 0, kind: "chip", label: "misurata la capacità aerobica" },
          { g: 1, kind: "text", lines: ["Il risultato?"], accent: 0 },
          { g: 2, kind: "text", lines: ["Ogni piccolo incremento", "del motore aerobico"] },
          { g: 2, kind: "stat", value: "−13%", label: "rischio di morire per qualsiasi causa" },
          { g: 2, kind: "stat", value: "−15%", label: "rischio di evento cardiovascolare" },
        ] },
        { kind: "kinetic", at: 26.25, dur: 3.2, words: ["NESSUN FARMACO", "HA QUESTO EFFETTO"], accentIndex: 0 },
        { kind: "fulltext", at: 29.57, dur: 1.0, fadeIn: 0, fadeOut: 0, lines: ["Nessuno"] },
        { kind: "question", at: 30.7, dur: 2.6, label: "La domanda", text: "Quanto devo correre?" },
        { kind: "kinetic", at: 33.68, word: "studio", dur: 2.45, words: ["UNO STUDIO", "DI 15 ANNI"], accentIndex: 1 },
        { kind: "slides", at: 36.33, dur: 35.1, fadeIn: 0, fadeOut: 0, cues: ["155.000", "confrontato", "51", "sotto", "meno", "30%", "45%", "10", "non", "tenere", "questo"], header: "Studio americano", source: "Lee et al. (2014), Journal of the American College of Cardiology", steps: [
          { g: 0, kind: "stat", value: "155.000", label: "adulti seguiti per 15 anni" },
          { g: 1, kind: "text", lines: ["Chi corre", "contro chi no"], accent: 0 },
          { g: 2, kind: "stat", value: "< 51 min", label: "di corsa a settimana" },
          { g: 2, kind: "chip", label: "anche sotto i 10 km/h" },
          { g: 2, kind: "chip", label: "anche meno di 10 km totali" },
          { g: 3, kind: "stat", value: "−30%", label: "mortalità per tutte le cause" },
          { g: 3, kind: "stat", value: "−45%", label: "mortalità cardiovascolare" },
          { g: 4, kind: "text", lines: ["10 minuti", "al giorno"], accent: 0 },
          { g: 4, kind: "chip", label: "non una maratona" },
          { g: 5, kind: "text", lines: ["Tenere accesa", "la macchina biologica"], accent: 1 },
          { g: 5, kind: "chip", label: "è questo che sposta l'ago" },
        ] },
      ],
      cta: { word: "MOTORE", title: "Vuoi costruire il tuo motore aerobico?" },
    },
    didascalia: `Il segnale più potente che esista per vivere a lungo e bene è uno: il movimento aerobico.

Una meta-analisi su 100.000 persone sane ha misurato la capacità aerobica: ogni piccolo incremento del motore aerobico abbassa del 13% il rischio di morire per qualsiasi causa e del 15% quello di un evento cardiovascolare. Non esiste farmaco al mondo con questo effetto sulla longevità.

E quanto devi correre? Uno studio americano ha seguito per 15 anni più di 155.000 adulti: bastano meno di 51 minuti a settimana, anche piano, per ridurre del 30% la mortalità per tutte le cause e del 45% quella cardiovascolare.

10 minuti al giorno, non una maratona.

Commenta MOTORE e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #longevità #motoreaerobico #corsa #running`,
  },
  {
    id: "L3-cellule",
    title: "Cosa succede nelle tue cellule quando corri",
    cover: { kicker: "Longevità", lines: ["Le tue cellule", "quando corri"], accent: "cellule" },
    props: {
      ...base,
      src: "longevita/longevita.webm",
      words: wordsLongevita as CNReelProps["words"],
      master: "longevita/masters/L3-cellule.mp4",
      gfxShift: 30,
      capShift: 20,
      blendFrames: 2,
      tailLive: 0.3,
      // hook sulla ripresa del corridore (rallentata di un soffio: la frase finisce 4 fotogrammi dopo lo stacco del sorgente), poi tutto il discorso sui mitocondri di fila; salta la ripetizione «lo dico in modo diverso»
      segments: cutN(2, [243.21, 246.54], [252.74, 315.5], [327.0, 334.0]),
      hook: null,
      elements: [
        { kind: "kinetic", at: 0.1, word: "cosa", dur: 3.05, words: ["COSA SUCCEDE", "NELLE CELLULE", "QUANDO CORRI?"], accentIndex: 1 },
        { kind: "title", at: 3.49, word: "risposta", dur: 2.4, cues: ["risposta", "mitocondri"], lines: ["La risposta", "Mitocondri"], accent: "Mitocondri" },
        { kind: "flow", at: 6.01, word: "sono", dur: 7.15, cues: ["ossigeno", "nutrienti", "ATP"], title: "Mitocondri", sub: "le centrali energetiche delle cellule", inputs: ["Ossigeno", "Nutrienti"], output: "ATP", outSub: "energia" },
        { kind: "slides", at: 14.93, dur: 4.8, fadeIn: 0, fadeOut: 0, cues: ["paga", "battito", "pensiero", "passo"], header: "ATP · la moneta del corpo", steps: [
          { g: 0, kind: "text", lines: ["Paga ogni cosa"], accent: 0 },
          { g: 0, kind: "chip", label: "ogni battito del cuore" },
          { g: 0, kind: "chip", label: "ogni pensiero" },
          { g: 0, kind: "chip", label: "ogni passo" },
        ] },
        { kind: "checklist", at: 21.65, word: "corpo", dur: 2.95, big: true, cues: ["ripara", "rinnova", "resta"], items: ["Il corpo si ripara", "Si rinnova", "Resta giovane"] },
        { kind: "kinetic", at: 26.43, word: "sistema", dur: 1.45, words: ["IL SISTEMA", "DECADE"], accentIndex: 1 },
        { kind: "slides", at: 28.07, dur: 4.6, fadeIn: 0, fadeOut: 0, cues: ["questo", "invecchiamento", "non"], steps: [
          { g: 0, kind: "chip", label: "questo è quello che chiamiamo" },
          { g: 0, kind: "text", lines: ["Invecchiamento"], accent: 0 },
          { g: 1, kind: "text", lines: ["Non è", "il tempo che passa"], accent: 0 },
        ] },
        { kind: "kinetic", at: 35.17, word: "smettono", dur: 1.9, words: ["SMETTONO", "DI LAVORARE"], accentIndex: 0 },
        { kind: "kinetic", at: 38.37, word: "ecco", dur: 1.6, words: ["IL FATTO CHE", "CAMBIA TUTTO"], accentIndex: 1 },
        { kind: "fulltext", at: 40.13, dur: 2.04, fadeIn: 0, fadeOut: 0, cues: ["mitocondri", "non"], lines: ["I mitocondri", "non sono statici"] },
        { kind: "kinetic", at: 42.27, word: "rispondono", dur: 2.0, words: ["RISPONDONO", "AI SEGNALI"], accentIndex: 1 },
        { kind: "checklist", at: 44.61, word: "segnali", dur: 4.25, big: true, cues: ["movimento", "respirazione", "intensità"], items: ["Movimento aerobico", "Respirazione nasale", "Intensità controllata"] },
        { kind: "kinetic", at: 49.65, word: "più", dur: 1.9, words: ["PIÙ MITOCONDRI", "E PIÙ", "EFFICIENTI"], accentIndex: 2 },
        { kind: "renew", at: 54.4, dur: 7.53, cues: ["mitofagia", "corpo", "vecchi", "sostituisce"], term: "Mitofagia", sub: "il rinnovo dei mitocondri", oldLabel: "Vecchi e malfunzionanti", newLabel: "Sostituiti con nuovi" },
        { kind: "title", at: 62.35, word: "aggiornamento", dur: 3.55, cues: ["aggiornamento", "hardware", "rinnovamento"], lines: ["Un aggiornamento", "dell'hardware", "Rinnovamento cellulare"], accent: "cellulare" },
        { kind: "stat", at: 66.87, word: "90%", dur: 2.4, value: "90%", label: "del valore della corsa" },
        { kind: "kinetic", at: 69.55, word: "quasi", dur: 1.5, words: ["QUASI NESSUNO", "LO CONOSCE"], accentIndex: 1 },
        { kind: "kinetic", at: 71.33, word: "attento", dur: 1.6, words: ["ATTENTO:", "DEVI CORRERE", "BENE"], accentIndex: 2 },
      ],
      cta: { word: "RINNOVO", title: "Vuoi correre per rinnovare le tue cellule?" },
    },
    didascalia: `Cosa succede dentro le tue cellule quando corri?

La risposta si chiama mitocondri: sono le centrali energetiche delle tue cellule. Prendono ossigeno e nutrienti e li trasformano in ATP, la moneta con cui il corpo paga ogni cosa: ogni battito del cuore, ogni pensiero, ogni passo.

Quando queste centrali funzionano bene il corpo si ripara, si rinnova, resta giovane. Quando funzionano male il sistema decade: è quello che chiamiamo invecchiamento. Non è il tempo che passa, sono le centrali che smettono di fare il loro lavoro.

Ma i mitocondri non sono statici: rispondono ai segnali che gli mandi. Movimento aerobico, respirazione nasale, intensità controllata producono più mitocondri e più efficienti. E attivano la mitofagia: il corpo riconosce quelli vecchi e malfunzionanti e li sostituisce con nuovi.

Questo è il 90% del valore della corsa, e quasi nessuno lo conosce. Ma attento: devi correre bene.

Commenta RINNOVO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #longevità #mitocondri #corsa #running`,
  },
  {
    id: "L4-cervello",
    title: "Camminare fa crescere il cervello",
    cover: { kicker: "Longevità", lines: ["Il cervello", "cresce camminando"], accent: "cervello" },
    props: {
      ...base,
      src: "longevita/longevita.webm",
      words: wordsLongevita as CNReelProps["words"],
      master: "longevita/masters/L4-cervello.mp4",
      gfxShift: 30,
      capShift: 20,
      blendFrames: 2,
      tailLive: 0.25,
      // un solo pezzo: il discorso sul cervello fila senza tagli; la scheda dello studio (37 s nel video YouTube) è rifatta a tutto schermo
      segments: cutN(2, [473.95, 534.35]),
      hook: null,
      elements: [
        { kind: "kinetic", at: 0.3, word: "nostro", dur: 2.9, words: ["IL CERVELLO", "SI È EVOLUTO", "CON IL MOVIMENTO"], accentIndex: 0 },
        { kind: "bigstrike", at: 3.67, word: "sta", dur: 1.5, text: "Sta bene se ti muovi" },
        { kind: "title", at: 5.33, word: "non", dur: 4.45, cues: ["non", "senza", "corpo"], lines: ["Non può funzionare", "senza un corpo", "in movimento"], accent: "movimento" },
        { kind: "slides", at: 9.93, dur: 23.76, fadeIn: 0, fadeOut: 0, cues: ["esperimento", "120", "metà", "3", "anno", "partendo", "altra", "solo", "prima", "ippocampo", "struttura", "gestisce", "2%"], header: "Lo studio", source: "Erickson et al. (2011), PNAS", steps: [
          { g: 0, kind: "text", lines: ["Un esperimento"] },
          { g: 0, kind: "stat", value: "120", label: "anziani sedentari" },
          { g: 1, kind: "text", lines: ["Metà", "ha camminato"], accent: 1 },
          { g: 1, kind: "chip", label: "3 volte a settimana" },
          { g: 1, kind: "chip", label: "per un anno" },
          { g: 1, kind: "chip", label: "da 10 a 40 minuti" },
          { g: 2, kind: "text", lines: ["L'altra metà"] },
          { g: 2, kind: "chip", label: "solo stretching leggero" },
          { g: 3, kind: "text", lines: ["Prima e dopo:", "risonanza magnetica"], accent: 1 },
          { g: 3, kind: "chip", label: "dell'ippocampo" },
          { g: 4, kind: "text", lines: ["Ippocampo"], accent: 0 },
          { g: 4, kind: "chip", label: "gestisce la memoria" },
          { g: 4, kind: "stat", value: "−2%", label: "all'anno, con l'età", color: "coral" },
        ] },
        { kind: "versus", at: 33.69, dur: 15.72, cues: ["cresciuto", "diminuito", "chi", "ha", "indietro"], header: "Dopo un anno", title: "L'ippocampo", a: { label: "Chi ha camminato", value: "+2%" }, b: { label: "Solo stretching", value: "−1,4%" }, final: ["Chi si è mosso", "ha fatto tornare", "indietro l'orologio", "del cervello"], source: "Erickson et al. (2011), PNAS" },
        { kind: "grid4", at: 49.55, dur: 7.22, onAt: [0, 0.02, 0.92, 1.78, 5.0], items: ["Motore", "Muscoli", "Tendini", "Cervello"], foot: "4 capitoli di un'unica storia" },
        { kind: "kinetic", at: 58.41, word: "ogni", dur: 1.9, words: ["OGNI PEZZO", "AMPLIFICA", "GLI ALTRI"], accentIndex: 1 },
      ],
      cta: { word: "CAMMINA", title: "Vuoi muoverti nel modo giusto?" },
    },
    didascalia: `Il nostro cervello si è coevoluto con il movimento. Non è che sta bene se ti muovi: è che non può funzionare correttamente senza un corpo in movimento.

Un esperimento ha preso 120 anziani sedentari. Metà ha camminato 3 volte a settimana per un anno, partendo da 10 minuti fino ad arrivare a 40. L'altra metà ha fatto solo stretching leggero.

Prima e dopo, risonanza magnetica dell'ippocampo: la struttura del cervello che gestisce la memoria e che normalmente si riduce con l'età.

Il risultato? Nel gruppo che aveva camminato l'ippocampo era cresciuto del 2%. Nel gruppo di controllo era diminuito.

Chi si è mosso ha letteralmente fatto tornare indietro l'orologio del cervello.

Commenta CAMMINA e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #longevità #cervello #camminare #running`,
  },
  {
    id: "L5-bugia",
    title: "La bugia più diffusa del running",
    cover: { kicker: "Longevità", lines: ["La bugia", "del running"], accent: "bugia" },
    props: {
      ...base,
      src: "longevita/longevita.webm",
      words: wordsLongevita as CNReelProps["words"],
      master: "longevita/masters/L5-bugia.mp4",
      gfxShift: 30,
      capShift: 20,
      blendFrames: 2,
      tailLive: 0.25,
      // un taglio solo: salta il passaggio sulla zona aerobica (già nel reel sulle cellule) e va dritto al principio cardine
      // 12/11 (Ross): via il riferimento ai mitocondri («non stai rinnovando i mitocondri», 564,58-566,46): il taglio cade sotto la scheda a tutto schermo
      segments: cutN(2, [537.8, 564.58], [566.46, 583.1], [593.95, 609.95]),
      hook: null,
      elements: [
        { kind: "kinetic", at: 0.12, word: "non", dur: 1.95, words: ["NON BASTA", "USCIRE A CORRERE"], accentIndex: 0 },
        { kind: "kinetic", at: 2.28, word: "quella", dur: 2.85, words: ["LA BUGIA", "PIÙ DIFFUSA", "DEL RUNNING"], accentIndex: 0 },
        { kind: "checklist", at: 6.06, word: "correre", dur: 5.0, big: true, cross: true, cues: ["male", "pronto", "allenare"], items: ["Correre male", "Corpo non pronto", "Non sapersi allenare"] },
        { kind: "title", at: 11.26, word: "non", dur: 4.04, cues: ["non", "quando"], lines: ["Non è se ti farai male", "È quando"], accent: "quando" },
        { kind: "title", at: 18.4, word: "segnale", dur: 4.04, cues: ["segnale", "manda", "direzione"], lines: ["Un segnale sbagliato", "manda la biologia", "nella direzione sbagliata"], accent: "sbagliata" },
        { kind: "slides", at: 22.55, dur: 7.46, fadeIn: 4, fadeOut: 0, cues: ["troppo", "bocca", "fiatone", "senza", "stressando"], header: "Segnali sbagliati", steps: [
          { g: 0, kind: "chip", label: "correre troppo forte", color: "coral" },
          { g: 0, kind: "chip", label: "con la bocca aperta", color: "coral" },
          { g: 0, kind: "chip", label: "col fiatone", color: "coral" },
          { g: 0, kind: "chip", label: "senza saper correre", color: "coral" },
          { g: 1, kind: "text", lines: ["Stai stressando", "un sistema non pronto"], accent: 0 },
        ] },
        { kind: "kinetic", at: 31.28, word: "naso", dur: 2.3, words: ["IL NASO", "LIMITATORE", "NATURALE"], accentIndex: 0 },
        { kind: "question", at: 34.00, word: "se", dur: 2.6, label: "Il test", text: "Riesci a respirare solo dal naso?" },
        { kind: "kinetic", at: 37.00, word: "probabilmente", dur: 2.05, words: ["STAI ANDANDO", "TROPPO FORTE"], accentIndex: 1 },
        { kind: "kinetic", at: 39.38, word: "rallenta", dur: 1.5, words: ["RALLENTA", "O CAMMINA"], accentIndex: 0 },
        { kind: "kinetic", at: 41.08, word: "non", dur: 2.24, words: ["NON È DEBOLEZZA", "È INTELLIGENZA", "BIOLOGICA"], accentIndex: 2 },
        { kind: "slides", at: 43.39, dur: 3.59, fadeIn: 0, fadeOut: 0, cues: ["principio", "metodo"], steps: [
          { g: 0, kind: "text", lines: ["Il principio", "cardine"], accent: 1 },
          { g: 0, kind: "chip", label: "del metodo Correre Naturale®" },
        ] },
        { kind: "bigstrike", at: 47.99, word: "correre", dur: 1.75, text: "Correre di più o più veloce" },
        { kind: "kinetic", at: 50.41, word: "mandare", dur: 1.65, words: ["I SEGNALI", "GIUSTI"], accentIndex: 1 },
        { kind: "checklist", at: 52.27, word: "con", dur: 5.6, big: true, cues: ["tecnica", "corpo", "intensità"], items: ["Tecnica corretta", "Corpo preparato", "Intensità sostenibile"] },
        { kind: "kinetic", at: 58.13, word: "resto", dur: 1.25, words: ["IL RESTO È UNA", "CONSEGUENZA"], accentIndex: 1 },
      ],
      cta: { word: "TECNICA", title: "Vuoi imparare a correre bene?" },
    },
    didascalia: `Non basta uscire a correre. Quella è la bugia più diffusa nel mondo del running.

Se esci a correre male, con un corpo non pronto e senza saperti allenare, la questione non è se ti farai male. È quando.

Il corpo risponde ai segnali che gli mandi, e un segnale sbagliato manda la biologia nella direzione sbagliata. Correre troppo forte, con la bocca aperta, col fiatone, senza saper correre: stai stressando un sistema che non è pronto.

Il naso è il limitatore naturale dell'essere umano: se mentre corri non riesci a respirare solo dal naso, molto probabilmente stai andando troppo forte. Rallentare o camminare non è debolezza, è intelligenza biologica.

Questo è il principio cardine del metodo Correre Naturale®: non si tratta di correre di più o più veloce, ma di mandare al corpo i segnali giusti. Con la tecnica corretta, con un corpo preparato, con un'intensità che il tuo sistema può gestire. Il resto è una conseguenza.

Commenta TECNICA e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #longevità #tecnicadicorsa #corsa #running`,
  },
  {
    id: "L6-domani",
    title: "Tre cose da fare da domani",
    cover: { kicker: "Longevità", lines: ["3 cose", "da fare domani"], accent: "3 cose" },
    props: {
      ...base,
      src: "longevita/longevita.webm",
      words: wordsLongevita as CNReelProps["words"],
      master: "longevita/masters/L6-domani.mp4",
      gfxShift: 30,
      capShift: 20,
      blendFrames: 2,
      tailLive: 0.3,
      // nel video YouTube qui ci sono 40 s di schede: sotto la voce vanno le riprese di copertura del video stesso (work/L6.json), le tre istruzioni sono schede nuove a tutto schermo
      segments: cutN(2, [610.8, 660.9]),
      hook: null,
      elements: [
        { kind: "kinetic", at: 0.2, word: "cosa", dur: 1.7, words: ["COSA PUOI FARE", "DA DOMANI?"], accentIndex: 1 },
        { kind: "plan", at: 2.0, dur: 5.0, cues: ["esci", "almeno", "respirando"], n: 1, kicker: "Prima cosa", title: ["Esci", "e cammina"], points: ["almeno 10 minuti", "respirando solo dal naso"], art: "walk" },
        { kind: "title", at: 7.28, word: "pranzo", dur: 2.55, cues: ["pranzo", "momenti"], lines: ["Dopo pranzo", "uno dei momenti migliori"], accent: "pranzo" },
        { kind: "kinetic", at: 10.56, word: "segnale", dur: 1.9, words: ["UN SEGNALE", "POTENTISSIMO"], accentIndex: 1 },
        { kind: "kinetic", at: 12.78, word: "motore", dur: 2.1, words: ["ACCENDI", "IL MOTORE", "AEROBICO"], accentIndex: 1 },
        { kind: "kinetic", at: 15.02, word: "mitocondri", dur: 2.4, words: ["MITOCONDRI", "AL LAVORO"], accentIndex: 0 },
        { kind: "kinetic", at: 17.72, word: "inizia", dur: 1.03, words: ["INIZIA", "DA QUI"], accentIndex: 1 },
        { kind: "plan", at: 18.8, dur: 7.0, cues: ["se", "inserire", "dire"], n: 2, kicker: "Seconda cosa", pre: "se già cammini", title: ["Qualche minuto", "di corsa facile"], points: ["facile = il naso basta"], art: "run" },
        { kind: "title", at: 26.06, word: "naso", dur: 2.05, cues: ["naso", "torni"], lines: ["Il naso non basta?", "Torna a camminare"], accent: "camminare" },
        { kind: "kinetic", at: 28.7, word: "senza", dur: 1.3, words: ["SENZA FRETTA", "SENZA EGO"], accentIndex: 1 },
        { kind: "plan", at: 30.1, dur: 10.03, cues: ["squat", "talloni", "restaci", "riesci"], n: 3, kicker: "Terza cosa", title: ["Squat", "completo"], points: ["talloni a terra", "resta giù 30 secondi"], foot: "Non ci riesci senza dolore? Hai trovato il tuo primo esercizio", art: "timer" },
        { kind: "kinetic", at: 41.44, word: "manutenzione", dur: 1.4, words: ["MANUTENZIONE", "QUOTIDIANA"], accentIndex: 1 },
        { kind: "kinetic", at: 44.48, word: "squat", dur: 2.0, words: ["LO SQUAT", "UNO DEI GESTI", "PIÙ POTENTI"], accentIndex: 0 },
        { kind: "kinetic", at: 46.76, word: "rimettere", dur: 3.1, words: ["RIMETTE", "IN FUNZIONE", "IL CORPO"], accentIndex: 2 },
      ],
      cta: { word: "DOMANI", title: "Vuoi iniziare nel modo giusto?" },
    },
    didascalia: `Cosa puoi fare da domani? Tre cose.

1. Esci e cammina almeno 10 minuti, respirando solo dal naso. Dopo pranzo è uno dei momenti migliori. Sembra poco, ma è un segnale potentissimo: stai accendendo il motore aerobico e stai dicendo ai tuoi mitocondri di mettersi al lavoro.

2. Se già cammini, inserisci qualche minuto di corsa facile. Facile vuol dire che respirare dal naso basta. Se il naso non basta, torni a camminare: senza fretta e senza ascoltare l'ego.

3. Inizia con lo squat: squat completo, talloni a terra, e restaci per 30 secondi. Se non ci riesci senza dolore, hai appena trovato il tuo primo esercizio di manutenzione quotidiana.

Nel metodo Correre Naturale® lo squat è uno dei gesti più potenti per rimettere in funzione il corpo.

Commenta DOMANI e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #longevità #camminare #squat #running`,
  },
  {
    id: "T2-laura",
    title: "«Non ho avuto più infortuni» (testimonianza di Laura)",
    cover: { kicker: "Testimonianza", lines: ["Laura", "mai più infortuni"], accent: "Laura" },
    props: {
      ...base,
      src: "testimonianze/laura_src.mp4",
      words: wordsLaura as CNReelProps["words"],
      master: "testimonianze/T2-laura_v2.mp4",
      gfxShift: 50, // con l'avvicinamento dei pezzi alterni il mento arriva a 0,45: grafiche da 0,466
      capShift: 30,
      // intervista: tagli nei punti più silenziosi delle pause (misurati sull'energia dell'audio), domande a schermo (l'intervistatore è fuori microfono)
      segments: cutRanges(T2_SEGS, 5, T2_KEEP),
      hook: null,
      // grafiche della v1 riportate sui tre intervalli che restano (quelle su Superhuman cadono da sole)
      elements: keepEls([
        { kind: "nametag", at: 0.4, dur: 2.5, name: "Laura", sub: "Roma · con Correre Naturale dal 2016" },
        { kind: "pill", at: 3.14, word: "CN", dur: 2.6, text: "CN = Correre Naturale®" },
        { kind: "kinetic", at: 7.28, word: "non", dur: 1.8, words: ["NON HO AVUTO PIÙ", "INFORTUNI"], accentIndex: 1 },
        { kind: "checklist", at: 9.33, word: "frequentare", dur: 4.3, big: true, cross: true, cues: ["fisioterapisti", "osteopati"], items: ["Fisioterapisti", "Osteopati"] },
        { kind: "kinetic", at: 14.92, word: "benessere", dur: 2.9, words: ["BENESSERE", "A 360 GRADI"], accentIndex: 0 },
        { kind: "bigstrike", at: 18.64, word: "rincorrere", dur: 2.3, text: "Performance cronometrica" },
        { kind: "title", at: 21.47, word: "Superhuman", dur: 3.2, lines: ["Superhuman Academy", "percorso di Correre Naturale®"], accent: "Superhuman" },
        { kind: "kinetic", at: 26.18, word: "sta", dur: 1.1, words: ["STA", "FUNZIONANDO"], accentIndex: 1 },
        { kind: "question", at: 27.5, dur: 2.6, text: "Cosa è cambiato in te?" },
        { kind: "stack", at: 34.88, word: "fatto", dur: 8.7, cues: ["centrata", "motivata", "attenta", "ma"], title: "Il percorso ha fatto di me", items: ["Più centrata", "Più motivata", "Più attenta a se stessa", "E agli altri"] },
        { kind: "question", at: 43.92, dur: 1.9, text: "Cosa ti frenava?" },
        { kind: "kinetic", at: 47.73, word: "gravoso", dur: 1.6, words: ["UN IMPEGNO GRAVOSO", "DI TEMPO"], accentIndex: 1 },
        { kind: "kinetic", at: 51.29, word: "non", dur: 2.4, words: ["NON HO TUTTO", "QUESTO TEMPO"], accentIndex: 1 },
        { kind: "kinetic", at: 54.35, word: "lui", dur: 2.1, words: ["PER DANIELE", "VOLERE", "È POTERE"], accentIndex: 2 },
        { kind: "kinetic", at: 58.25, word: "bella", dur: 1.45, words: ["UNA BELLA", "SORPRESA"], accentIndex: 1 },
        { kind: "kinetic", at: 59.89, word: "buon", dur: 1.2, words: ["UN BUON", "COMPROMESSO"], accentIndex: 1 },
        { kind: "question", at: 61.35, dur: 2.1, text: "Cosa diresti a chi è indeciso?" },
        { kind: "kinetic", at: 63.64, word: "devi", dur: 1.9, words: ["SE TI VUOI BENE", "DEVI ADERIRE"], accentIndex: 1 },
        { kind: "kinetic", at: 67.82, word: "non", dur: 2.5, words: ["NON ASPETTARE", "CERCALI"], accentIndex: 1 },
      ], T2_KEEP, 5),
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«Da quando sono seguita da Correre Naturale non ho avuto più infortuni.»

Laura corre con Correre Naturale® dal 2016. Ha smesso di frequentare fisioterapisti e osteopati, e oggi il suo obiettivo non è rincorrere una performance cronometrica: è il benessere, a 360 gradi.

Il percorso l'ha resa più centrata, più motivata, più attenta a se stessa e agli altri. La resistenza più grande era il tempo: «non ho tutto questo tempo a disposizione». La sorpresa è stata trovare un buon compromesso.

Il suo consiglio a chi è indeciso: «Se ti vuoi bene devi assolutamente aderire. Non aspettare che loro vengano da te: cercali.»

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running #benessere`,
  },
  {
    id: "T3-taddeo",
    title: "«La salute viene cento volte prima dei soldi» (testimonianza di Taddeo)",
    cover: { kicker: "Testimonianza", lines: ["Taddeo", "prima la salute"], accent: "Taddeo" },
    props: {
      ...base,
      src: "testimonianze/C3499-008.MP4",
      words: wordsTaddeo as CNReelProps["words"],
      master: "testimonianze/T3-taddeo.mp4",
      gfxShift: 50,
      capShift: 30,
      // tagli solo nei silenzi veri (scripts/cn_pauses.py): parla fitto e spesso lega le frasi, i tempi delle parole da soli non bastano
      segments: cut([95.2, 104.96], [106.08, 123.1], [23.52, 39.6], [283.15, 296.93], [340.9, 349.19], [354.8, 360.39], [447.15, 452.6]),
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 3.5, lines: ["Dopo le gare stava male", "oggi finisce meglio", "di come è partito"], accent: "meglio" },
        { kind: "nametag", at: 3.7, dur: 2.4, name: "Taddeo", sub: "Vicenza" },
        { kind: "checklist", at: 10.43, word: "mal", dur: 3.0, big: true, cross: true, cues: ["stomaco", "testa"], items: ["Mal di stomaco", "Mal di testa"] },
        { kind: "kinetic", at: 14.61, word: "non", dur: 1.9, words: ["NON SONO STATO BENE", "DOPO", "UNA CORSA"], accentIndex: 2 },
        { kind: "title", at: 20.09, word: "finisco", dur: 3.95, cues: ["finisco", "sto"], lines: ["Adesso finisco una gara", "e sto bene"], accent: "bene" },
        { kind: "kinetic", at: 24.43, word: "meglio", dur: 1.9, words: ["MEGLIO DI QUANDO", "SONO PARTITO"], accentIndex: 1 },
        { kind: "question", at: 26.78, dur: 2.3, text: "Cosa è cambiato?" },
        { kind: "stack", at: 30.26, word: "energia", dur: 4.9, cues: ["energia", "benessere", "mentale"], title: "I miglioramenti", items: ["L'energia", "Il benessere", "Soprattutto la mente"] },
        { kind: "checklist", at: 38.68, word: "sicurezza", dur: 3.9, big: true, cues: ["sicurezza", "fiducia", "disciplina"], items: ["Sicurezza", "Fiducia in me stesso", "Disciplina"] },
        { kind: "question", at: 42.88, dur: 2.1, text: "Avevi delle resistenze?" },
        { kind: "kinetic", at: 45.28, word: "sotto", dur: 2.0, words: ["LA RESISTENZA?", "ECONOMICA"], accentIndex: 1 },
        { kind: "title", at: 48.34, word: "salute", dur: 5.1, cues: ["salute", "cento", "dei"], lines: ["La salute viene", "cento volte prima", "dei soldi"], accent: "soldi" },
        { kind: "kinetic", at: 53.74, word: "faccio", dur: 2.5, words: ["LO FACCIO", "MI FA BENE"], accentIndex: 1 },
        { kind: "question", at: 56.6, dur: 2.0, text: "Cosa diresti a chi è indeciso?" },
        { kind: "kinetic", at: 58.94, word: "nessuno", dur: 1.6, words: ["SE NON LO FAI TU", "NESSUNO LO FA", "AL POSTO TUO"], accentIndex: 1 },
        { kind: "kinetic", at: 62.02, word: "salute", dur: 2.5, words: ["LA SALUTE", "LA COSA PIÙ", "IMPORTANTE"], accentIndex: 0 },
        { kind: "kinetic", at: 66.02, word: "inizia", dur: 2.3, words: ["INIZIA SUBITO", "NON ASPETTARE"], accentIndex: 0 },
        { kind: "kinetic", at: 68.66, word: "cogli", dur: 1.6, words: ["COGLI L'OPPORTUNITÀ", "AL VOLO"], accentIndex: 1 },
        { kind: "question", at: 70.5, dur: 2.2, text: "La tua esperienza in una parola?" },
        { kind: "kinetic", at: 74.55, word: "vitalità", dur: 1.4, words: ["VITALITÀ"], accentIndex: 0 },
      ],
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«La salute viene cento volte prima dei soldi.»

Taddeo, da Vicenza, andava oltre le sue potenzialità: superava i suoi limiti e spesso dopo una corsa stava male, tra mal di stomaco e mal di testa. Oggi finisce una gara e sta bene, anzi meglio di quando è partito.

Con il percorso Correre Naturale® sono migliorati l'energia, il benessere e soprattutto la testa: sicurezza, fiducia in se stesso, disciplina.

L'unica resistenza era quella economica. Poi il ragionamento: è un investimento sulla salute, e lo ha fatto.

Il suo consiglio a chi è indeciso: «Se non lo fai tu, nessuno lo fa al posto tuo. Inizia subito, non aspettare.» La sua esperienza in una parola: vitalità.

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running #salute`,
  },
  {
    id: "T4-mattia",
    title: "«Ero sempre fermo, bloccato dagli infortuni» (testimonianza di Mattia)",
    cover: { kicker: "Testimonianza", lines: ["Mattia", "di nuovo in corsa"], accent: "Mattia" },
    props: {
      ...base,
      src: "testimonianze/C3497-006.MP4",
      words: wordsMattia as CNReelProps["words"],
      master: "testimonianze/T4-mattia.mp4",
      // volto grande (inquadratura stretta, come Massimiliano): grafiche sotto il mento (da 0,53) e più piccole, tutto sopra 0,80
      gfxShift: 173,
      gfxScale: 0.8,
      capShift: 30,
      segments: cut([42.98, 55.8], [126.26, 138.74], [172.42, 179.88], [399.56, 408.72], [411.1, 420.38], [447.82, 449.98], [461.84, 464.77], [466.06, 470.98], [479.91, 493.75], [554.3, 557.3]),
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 3.4, lines: ["Sempre fermo", "bloccato dagli infortuni", "poi la svolta"], accent: "svolta" },
        { kind: "nametag", at: 3.6, dur: 2.4, name: "Mattia", sub: "Milano" },
        { kind: "kinetic", at: 9.72, word: "rimaneva", dur: 2.6, words: ["TANTA VOGLIA", "CHE RIMANEVA", "SOLO VOGLIA"], accentIndex: 2 },
        { kind: "kinetic", at: 17.98, word: "amare", dur: 2.2, words: ["HO INIZIATO AD", "AMARE LA CORSA"], accentIndex: 1 },
        { kind: "kinetic", at: 23.22, word: "veicolo", dur: 1.85, words: ["UN VEICOLO PER", "MIGLIORARE", "LA MIA VITA"], accentIndex: 1 },
        { kind: "question", at: 25.3, dur: 2.4, text: "Il beneficio più grande?" },
        { kind: "kinetic", at: 31.1, word: "capacità", dur: 1.45, words: ["LA CAPACITÀ DI", "ASCOLTARMI"], accentIndex: 1 },
        { kind: "question", at: 32.77, dur: 2.3, text: "Avevi delle resistenze?" },
        { kind: "kinetic", at: 37.41, word: "seguito", dur: 2.3, words: ["GIÀ SEGUITO DA", "ALTRI COACH"], accentIndex: 1 },
        { kind: "kinetic", at: 44.9, word: "portato", dur: 2.4, words: ["MI AVEVA PORTATO A", "INFORTUNARMI"], accentIndex: 1 },
        { kind: "title", at: 48.98, word: "perché", dur: 1.95, cues: ["perché", "dovrebbe"], lines: ["Perché questa volta", "dovrebbe essere diverso?"], accent: "diverso?" },
        { kind: "kinetic", at: 51.59, word: "veramente", dur: 1.5, words: ["VERAMENTE", "FELICE"], accentIndex: 1 },
        { kind: "question", at: 53.32, dur: 2.2, text: "Cosa diresti a chi è indeciso?" },
        { kind: "kinetic", at: 55.69, word: "prova", dur: 1.1, words: ["PROVA"], accentIndex: 0 },
        { kind: "kinetic", at: 57.19, word: "massimo", dur: 1.7, words: ["COSA PUÒ", "SUCCEDERE?"], accentIndex: 1 },
        { kind: "kinetic", at: 59.45, word: "investito", dur: 1.6, words: ["HAI INVESTITO", "PER TE STESSO"], accentIndex: 1 },
        { kind: "kinetic", at: 65.77, word: "netto", dur: 1.7, words: ["UN NETTO", "MIGLIORAMENTO"], accentIndex: 1 },
        { kind: "kinetic", at: 72.73, word: "andare", dur: 2.0, words: ["VERSO L'ALTO", "ESPONENZIALE"], accentIndex: 1 },
        { kind: "question", at: 75.07, dur: 1.35, text: "In una parola?" },
        { kind: "title", at: 76.63, word: "consapevolezza", dur: 1.3, lines: ["Consapevolezza"], accent: "Consapevolezza" },
      ],
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«Ero sostanzialmente fermo, sempre bloccato da infortuni.»

Mattia, da Milano, aveva tanta voglia di fare, ma rimaneva solo voglia. Con il percorso Correre Naturale® ha iniziato ad amare la corsa per la sua essenza: un veicolo per migliorare la sua vita. Il beneficio più grande: la capacità di ascoltarsi.

Prima di iniziare aveva una resistenza: era già stato seguito da altri coach, e seguire i loro consigli lo aveva portato a infortunarsi. «Perché questa volta dovrebbe essere diverso?» Oggi è veramente felice di averlo intrapreso.

Il suo consiglio a chi è indeciso: «Prova. Al massimo cosa può succedere? Hai investito per te stesso.» La sua esperienza in una parola: consapevolezza.

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running #infortuni`,
  },
  {
    id: "T5-seiore",
    title: "«Mi sono messo alla guida del mio corpo» (testimonianza: la sei ore)",
    cover: { kicker: "Testimonianza", lines: ["Franco", "la sei ore"], accent: "Franco" },
    props: {
      ...base,
      src: "testimonianze/C3500-007.MP4",
      words: wordsC3500 as CNReelProps["words"],
      master: "testimonianze/T5-seiore.mp4",
      // racconto libero (non un'intervista a domande): cinque pezzi, tagli solo nei silenzi veri; nel girato non dice il nome, quindi niente cartellino.
      // Maglietta bianca con stampa a colori: le scritte sono tutte su fondo scuro (title), non parole libere, per restare leggibili
      gfxShift: 100, // mento al massimo a 0,46: grafiche da 0,49, appena ridotte
      gfxScale: 0.9,
      capShift: 30,
      segments: cut([267.9, 277.5], [378.54, 429.18], [458.36, 466.95], [481.49, 485.91], [546.31, 550.5]),
      hook: null,
      elements: [
        // nome di fantasia (Ross 12/11): nel girato non lo dice
        { kind: "nametag", at: 12.55, dur: 1.95, name: "Franco", sub: "6 ore · 50 km" },
        { kind: "title", at: 0, dur: 3.6, lines: ["6 ore di corsa", "50 chilometri", "e una scoperta"], accent: "50" },
        { kind: "title", at: 5.18, word: "tutto", dur: 3.9, lines: ["Tutto il lavoro", "di questi anni"], accent: "lavoro" },
        { kind: "title", at: 9.9, word: "momento", dur: 2.4, lines: ["Il momento più duro"] },
        { kind: "title", at: 14.88, word: "nipotina", dur: 2.4, lines: ["La mia nipotina", "mi salutava a ogni giro"], accent: "nipotina" },
        { kind: "stat", at: 20.08, word: "quattro", dur: 2.2, value: "4h30", label: "non c'era più lei" },
        { kind: "title", at: 25.56, word: "down", dur: 1.7, lines: ["Un down pazzesco"], accent: "pazzesco" },
        { kind: "title", at: 32.16, word: "guida", dur: 3.0, lines: ["Alla guida", "del mio corpo"], accent: "guida" },
        { kind: "lights", at: 38.32, word: "cruscotto", dur: 8.75, cues: ["benzina", "acqua", "caldo"], title: "Il mio cruscotto", items: ["Benzina", "Acqua", "Caldo"] },
        { kind: "checklist", at: 50.92, word: "rallentato", dur: 9.0, big: true, cues: ["rallentato", "rallentato", "ritrovato"], items: ["Rallento la corsa", "Rallento il respiro", "Ritrovo tranquillità"] },
        { kind: "title", at: 63.65, word: "clamoroso", dur: 1.5, lines: ["Clamoroso"], accent: "Clamoroso" },
        { kind: "title", at: 65.35, word: "veloce", dur: 3.0, lines: ["Il giro più veloce", "di tutti i 50 km"], accent: "veloce" },
        { kind: "stat", at: 70.48, word: "6", dur: 2.6, value: "6 secondi", label: "allo scoccare delle 6 ore" },
        { kind: "title", at: 75.87, word: "non", dur: 1.6, lines: ["Non mi ferma", "più nessuno"], accent: "nessuno" },
      ],
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«Finita quella sei ore sono scoppiato a piangere: ho pensato a tutto il lavoro di questi anni.»

Sei ore di corsa, 50 chilometri. Il momento più duro arriva dopo quattro ore e mezza, quando la nipotina che lo salutava a ogni giro va via: un down pazzesco.

«Allora mi sono messo alla guida del mio corpo, mi sono guardato il mio cruscotto: le spie accese della benzina, dell'acqua, del caldo.» Ha rallentato la corsa, ha rallentato il respiro, ha ritrovato consapevolezza e tranquillità.

L'ultimo giro è stato il più veloce di tutti i 50 chilometri, chiuso a 6 secondi dallo scoccare delle sei ore. «Adesso, con questa chiave di lettura, non mi ferma più nessuno.»

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running #ultramaratona`,
  },
  {
    id: "T6-giancarlo",
    title: "«Arrivi a casa nervoso per il tempo? Questo non esiste più» (testimonianza di Giancarlo)",
    cover: { kicker: "Testimonianza", lines: ["Giancarlo", "oltre il cronometro"], accent: "Giancarlo" },
    props: {
      ...base,
      src: "testimonianze/C3501-003.MP4",
      words: wordsC3501 as CNReelProps["words"],
      master: "testimonianze/T6-giancarlo.mp4",
      // volto grande e mobile: grafiche da 0,547 e ridotte, sottotitoli appena più giù; scritte tutte su fondo scuro
      gfxShift: 205,
      gfxScale: 0.72,
      capShift: 40,
      segments: cut([310.52, 332.14], [52.3, 66.1], [192.66, 205.76], [372.49, 384.88], [510.52, 517.58], [552.06, 557.76]),
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 3.4, lines: ["La corsa non deve", "interrompere", "tutto il resto"], accent: "resto" },
        { kind: "nametag", at: 3.6, dur: 2.4, name: "Giancarlo", sub: "Esine · Valle Camonica" },
        { kind: "checklist", at: 9.5, word: "stanco", dur: 3.75, big: true, cross: true, cues: ["stanco", "nervoso", "tempo"], items: ["Stanco", "Nervoso", "Per il tempo mancato"] },
        { kind: "title", at: 13.46, word: "questo", dur: 1.6, lines: ["Questo non esiste più"], accent: "più" },
        { kind: "title", at: 17.56, word: "soddisfatto", dur: 3.8, cues: ["soddisfatto", "fatto"], lines: ["Arrivare a casa soddisfatto", "hai fatto quello che potevi"], accent: "soddisfatto" },
        { kind: "question", at: 21.6, dur: 2.1, text: "Cosa è cambiato?" },
        { kind: "checklist", at: 27.02, word: "conoscenza", dur: 5.2, big: true, cues: ["conoscenza", "fisico", "mentale"], items: ["Conoscenza di me", "Fisico", "Mente"] },
        { kind: "title", at: 32.92, word: "crescita", dur: 2.3, lines: ["Una crescita", "costante e progressiva"], accent: "costante" },
        { kind: "question", at: 35.42, dur: 2.1, text: "Il beneficio più grande?" },
        { kind: "title", at: 37.86, word: "conoscersi", dur: 1.9, lines: ["Conoscersi"], accent: "Conoscersi" },
        { kind: "bigstrike", at: 42.04, word: "tal", dur: 2.6, text: "Fare il tal tempo" },
        { kind: "title", at: 47.18, word: "godersi", dur: 2.1, lines: ["Godersi il cammino"], accent: "cammino" },
        { kind: "title", at: 52.31, word: "frutto", dur: 3.2, lines: ["Aspettare che il frutto", "sia maturo"], accent: "maturo" },
        { kind: "title", at: 55.87, word: "natura", dur: 4.8, cues: ["natura", "noi"], lines: ["La natura ha i suoi tempi", "noi abbiamo i nostri"], accent: "tempi" },
        { kind: "question", at: 60.92, dur: 2.1, text: "Cosa diresti a chi è indeciso?" },
        { kind: "title", at: 63.84, word: "primo", dur: 4.0, cues: ["primo", "provare"], lines: ["Il primo passo", "è provare, iniziare"], accent: "iniziare" },
        { kind: "checklist", at: 68.28, word: "competenza", dur: 5.35, big: true, cues: ["competenza", "serietà", "rete"], items: ["La competenza c'è", "La serietà c'è", "La rete di sicurezza c'è"] },
      ],
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«Arrivi a casa stanco, nervoso perché non sei riuscito a fare il tempo che volevi? No, questo non esiste più.»

Giancarlo viene da Esine, in Valle Camonica. Da quando ha conosciuto Correre Naturale® è migliorato soprattutto nella conoscenza di sé, nel fisico e nella mente: una crescita costante e progressiva.

Il beneficio più grande? Conoscersi. Non riuscire a fare «il tal tempo», ma godersi il cammino. «A volte bisogna aspettare che il frutto sia maturo prima di raccoglierlo: la natura ha i suoi tempi, noi abbiamo i nostri.»

A chi tentenna dice: «Il primo passo è provare, iniziare. La competenza c'è, la serietà c'è, la rete di sicurezza c'è.»

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running #benessere`,
  },
  {
    id: "C1-runner",
    title: "Il runner che sapeva troppo",
    cover: { kicker: "Tecnica di corsa", lines: ["Il runner che", "sapeva troppo"], accent: "troppo", shiftY: -0.09 },
    props: {
      ...base,
      src: "ccb/v1_runner.mov",
      words: wordsCcbV1Runner as CNReelProps["words"],
      master: "ccb/masters/C1-runner.mp4",
      // selfie in camminata («yapping»): deve sembrare spontaneo. Tagli netti, niente grafiche (il volto arriva a 0,62), niente pannello CTA: solo sottotitoli
      blendFrames: 1,
      ctaSeconds: 0,
      segments: cutN(1, [6.08, 54.7], [60.8, 69.74], [71.31, 79.76], [85.34, 94.94], [99.73, 109.18]),
      hook: null,
      // selfie (volto fino a 0,63): parole grandi SOPRA la testa dove c'è spazio; in basso un solo testo alla volta (grafica grande oppure
      // sottotitoli, mai insieme); elenchi e mappa nel pannello laterale; sulla CTA a voce il richiamo grande. Testi corti: max 16 lettere a riga
      gfxShift: 418,
      capShift: 80,
      capHideOnGfx: true,
      elements: [
        { kind: "topword", at: 0.1, dur: 3.6, lines: ["Sapeva troppo"], accent: "troppo", anim: "drop", max: 112 },
        { kind: "topword", at: 5.9, word: "migliorare", dur: 2.5, lines: ["Migliora la tecnica"], accent: "tecnica" },
        { kind: "cycle", at: 9.2, word: "informa,", dur: 4.0, cues: ["informa,", "guarda", "legge", "salva"], items: ["Si informa", "Guarda video", "Legge articoli", "Salva tutorial"] },
        { kind: "wall", at: 15.1, word: "testa", dur: 6.1, cues: ["testa", "busto", "piede", "braccia", "spalle"], title: "Le regole da ricordare", rows: ["Testa così", "Busto così", "Piede così", "Braccia a 90°", "Spalle basse"] },
        { kind: "topword", at: 25.0, word: "pensare", dur: 2.4, lines: ["Ogni singolo passo"], accent: "passo" },
        { kind: "cycle", at: 27.6, word: "testa", dur: 5.4, cues: ["testa", "aspetta", "toccato", "l'avampiede"], items: ["La testa qui", "Aspetta, il piede", "Il tallone", "No, l'avampiede!"] },
        { kind: "title", at: 34.5, word: "più", dur: 3.2, lines: ["Più rigido", "più stanco"], accent: "rigido" },
        { kind: "topword", at: 39.8, word: "peggio", dur: 1.5, lines: ["Peggio di prima"], accent: "Peggio", anim: "drop" },
        { kind: "topword", at: 44.5, word: "non", dur: 2.6, lines: ["Non è colpa tua"], accent: "colpa tua", zone: "strip" },
        { kind: "bigstrike", at: 50.0, word: "funziona", dur: 2.6, text: "Funziona così" },
        { kind: "side", at: 55.1, word: "dentro", dur: 10.0, cues: ["pensante,", "lento", "motorio,", "rapidissimo,"], title: "Due cervelli", items: ["Pensante", "Lento, calcolatore", "Motorio", "Rapido, istintivo"] },
        { kind: "title", at: 69.1, word: "cervello", dur: 3.0, lines: ["Il pensante", "si intromette"], accent: "intromette" },
        { kind: "topword", at: 73.2, word: "lumaca", dur: 2.2, lines: ["Una lumaca al volante"], accent: "lumaca" },
        { kind: "title", at: 78.0, word: "spiegata", dur: 1.75, lines: ["Non alla testa"], accent: "testa" },
        { kind: "topword", at: 80.2, word: "insegnata", dur: 1.9, lines: ["Insegnata al corpo"], accent: "corpo", anim: "drop", zone: "strip" },
        { kind: "pointer", at: 83.2, word: "Beh,", dur: 1.85, text: "Te lo spiego qui sotto", accent: "qui sotto" },
      ],
      cta: { word: "", title: "" },
    },
    didascalia: `Un runner decide di migliorare la sua tecnica: si informa, guarda video, salva tutorial. La mattina dopo pensa a ogni singolo passo, e torna a casa più rigido di quando è uscito.

Non è colpa tua: dentro di te ci sono due cervelli, quello pensante e quello motorio. La tecnica giusta non va spiegata alla testa, va insegnata al corpo.

#correrenaturale #tecnicadicorsa #corsa #running`,
  },
  {
    id: "C2-namibia",
    title: "Quello che ho visto in Namibia",
    cover: { kicker: "Tecnica di corsa", lines: ["Cosa ho visto", "in Namibia"], accent: "Namibia", shiftY: -0.09 },
    props: {
      ...base,
      src: "ccb/v1_namibia.mov",
      words: wordsCcbV1Namibia as CNReelProps["words"],
      master: "ccb/masters/C2-namibia.mp4",
      // selfie in camminata («yapping»): deve sembrare spontaneo. Tagli netti, niente grafiche (il volto arriva a 0,62), niente pannello CTA: solo sottotitoli
      blendFrames: 1,
      ctaSeconds: 0,
      segments: cutN(1, [11.89, 64.94], [87.42, 92.84], [97.84, 125.87]),
      hook: null,
      // selfie (volto fino a 0,63): parole grandi SOPRA la testa dove c'è spazio; in basso un solo testo alla volta (grafica grande oppure
      // sottotitoli, mai insieme); elenchi e mappa nel pannello laterale; sulla CTA a voce il richiamo grande. Testi corti: max 16 lettere a riga
      gfxShift: 418,
      capShift: 80,
      capHideOnGfx: true,
      elements: [
        { kind: "title", at: 0.05, dur: 1.3, lines: ["Cosa ho visto", "in Namibia"], accent: "Namibia" },
        { kind: "side", at: 1.5, word: "Boscimani", dur: 4.4, map: "it-na" },
        { kind: "title", at: 10.7, word: "migliaia", dur: 2.3, lines: ["Da migliaia", "di anni"], accent: "migliaia" },
        { kind: "title", at: 17.6, word: "nessuno", dur: 2.7, lines: ["Nessuno", "insegnava"], accent: "Nessuno" },
        { kind: "cycle", at: 20.6, word: "nessun", dur: 3.15, cues: ["allenatore,", "tabella,", "video,"], items: ["Nessun allenatore", "Nessuna tabella", "Nessun video"] },
        { kind: "topword", at: 23.9, word: "correvano", dur: 1.9, lines: ["Tutti allo", "stesso modo"], accent: "stesso modo", anim: "drop", zone: "strip" },
        { kind: "title", at: 26.1, word: "bambini,", dur: 2.9, lines: ["Bambini, adulti,", "anziani"], accent: "anziani" },
        { kind: "cycle", at: 29.4, word: "leggeri,", dur: 6.65, cues: ["leggeri,", "dritti,", "piede", "rumore."], items: ["Leggeri", "Dritti", "Piede sotto di sé", "Senza rumore"] },
        { kind: "side", at: 36.2, word: "tornato", dur: 3.4, map: "na-it" },
        { kind: "title", at: 41.7, word: "ognuno", dur: 1.7, lines: ["Ognuno a", "modo suo"], accent: "suo" },
        { kind: "cycle", at: 44.0, word: "guardava", dur: 8.6, cues: ["guardava", "seduto", "martello,", "pugni"], items: ["Guarda a terra", "Sembra seduto", "Piede a martello", "Pugni stretti"] },
        { kind: "title", at: 53.6, word: "perché", dur: 4.4, lines: ["Perché ognuno", "a modo suo?"], accent: "suo?" },
        { kind: "bigstrike", at: 59.4, word: "stile", dur: 1.5, text: "Stile o personalità" },
        { kind: "title", at: 61.5, word: "abbiamo", dur: 2.2, lines: ["Abbiamo perso", "qualcosa"], accent: "perso" },
        { kind: "title", at: 66.7, word: "madre", dur: 2.6, lines: ["Come madre", "natura"], accent: "natura" },
        { kind: "title", at: 73.9, word: "leggera,", dur: 2.2, lines: ["Leggera, dritta,", "naturale"], accent: "naturale" },
        { kind: "title", at: 76.6, word: "l'avevi", dur: 2.6, lines: ["Ce l'avevi", "anche tu"], accent: "tu" },
        { kind: "topword", at: 79.6, word: "va", dur: 1.6, lines: ["Va solo ritrovata"], accent: "ritrovata", anim: "drop", zone: "strip" },
        { kind: "pointer", at: 81.4, word: "racconto", dur: 5.0, text: "Te lo racconto qui sotto", accent: "qui sotto" },
      ],
      cta: { word: "", title: "" },
    },
    didascalia: `In Namibia, con i Boscimani, nessuno insegnava a un altro come si corre. Eppure correvano tutti allo stesso modo: leggeri, dritti, quasi senza far rumore.

Poi sono tornato in Italia, e al parco ognuno correva a modo suo. Non è questione di stile: è il segno che abbiamo perso qualcosa. Quella corsa ce l'avevi anche tu da bambino: va solo ritrovata.

#correrenaturale #corsanaturale #corsa #running`,
  },
  {
    id: "C3-ricetta",
    title: "La ricetta della corsa",
    cover: { kicker: "Tecnica di corsa", lines: ["La ricetta", "della corsa"], accent: "ricetta", shiftY: -0.09 },
    props: {
      ...base,
      src: "ccb/v2_ricetta.mov",
      words: wordsCcbV2Ricetta as CNReelProps["words"],
      master: "ccb/masters/C3-ricetta.mp4",
      // selfie in camminata («yapping»): deve sembrare spontaneo. Tagli netti, niente grafiche (il volto arriva a 0,62), niente pannello CTA: solo sottotitoli
      blendFrames: 1,
      ctaSeconds: 0,
      segments: cutN(1, [3.88, 38.95], [60.08, 80.66], [109.92, 131.02], [142.95, 148.67]),
      hook: null,
      // selfie (volto fino a 0,63): parole grandi SOPRA la testa dove c'è spazio; in basso un solo testo alla volta (grafica grande oppure
      // sottotitoli, mai insieme); elenchi e mappa nel pannello laterale; sulla CTA a voce il richiamo grande. Testi corti: max 16 lettere a riga
      gfxShift: 418,
      capShift: 80,
      capHideOnGfx: true,
      elements: [
        { kind: "topword", at: 0.05, dur: 2.6, lines: ["La ricetta", "della corsa"], accent: "ricetta", anim: "drop", zone: "strip" },
        { kind: "counter", at: 3.3, word: "pane", dur: 2.6, to: 3, label: "ingredienti per il pane" },
        { kind: "cycle", at: 6.3, word: "acqua,", dur: 2.45, cues: ["acqua,", "farina", "lievito."], items: ["Acqua", "Farina", "Lievito"] },
        { kind: "bigstrike", at: 8.9, word: "lievito,", dur: 1.6, text: "Lievito" },
        { kind: "title", at: 11.4, word: "ottieni", dur: 2.0, lines: ["Non ottieni", "il pane"], accent: "pane" },
        { kind: "counter", at: 17.2, word: "stesso", dur: 1.8, to: 7, label: "ingredienti della corsa" },
        { kind: "side", at: 19.3, word: "postura,", dur: 5.8, cues: ["postura,", "ritmo,", "relax,", "appoggio", "posizione", "uso", "parabola."], title: "I 7 ingredienti", items: ["Postura", "Ritmo", "Relax", "Appoggio del piede", "Posizione della testa", "Uso delle braccia", "Parabola"] },
        { kind: "title", at: 25.3, word: "manca", dur: 2.6, lines: ["Se ne manca uno"], accent: "uno" },
        { kind: "topword", at: 28.4, word: "non", dur: 2.4, lines: ["Non lievita"], accent: "lievita", anim: "drop", zone: "strip" },
        { kind: "cycle", at: 32.7, word: "fastidi,", dur: 2.3, cues: ["fastidi,", "fatica,", "poca"], items: ["Fastidi", "Fatica", "Poca voglia"] },
        { kind: "title", at: 38.7, word: "tuo", dur: 1.6, lines: ["Il corpo", "te lo dice"], accent: "corpo" },
        { kind: "cycle", at: 42.1, word: "Come", dur: 9.3, cues: ["Come", "dopo?", "Hai", "Esci", "Sei"], items: ["Come ti senti?", "E dopo?", "Hai fastidi?", "Esci con piacere?", "Sei soddisfatto?"] },
        { kind: "title", at: 53.7, word: "nella", dur: 1.9, lines: ["Qualcosa", "non va"], accent: "non" },
        { kind: "counter", at: 57.6, word: "dodici", dur: 2.4, to: 12, suffix: "anni", label: "di lavoro ed errori" },
        { kind: "pointer", at: 60.6, word: "manuale", dur: 7.6, arrow: false, text: "Manuale «Come correre bene»", accent: "«Come correre bene»" },
        { kind: "cycle", at: 68.6, word: "sette", dur: 7.9, cues: ["sette", "esercizi", "video"], items: ["Le 7 fondamenta", "Gli esercizi", "I video"] },
        { kind: "pointer", at: 78.2, word: "lo", dur: 4.1, text: "Lo trovi qui sotto", accent: "qui sotto" },
      ],
      cta: { word: "", title: "" },
    },
    didascalia: `Per il pane servono tre ingredienti: acqua, farina e lievito. Se togli il lievito non ottieni il pane.

La corsa ne ha sette: postura, ritmo, relax, appoggio del piede, posizione della testa, uso delle braccia e parabola. Se ne manca uno, la tua corsa non lievita.

#correrenaturale #comecorrerebene #corsa #running`,
  },
  {
    id: "C4-zoo",
    title: "Esseri umani da zoo",
    cover: { kicker: "Tecnica di corsa", lines: ["Esseri umani", "da zoo"], accent: "da zoo", shiftY: -0.09 },
    props: {
      ...base,
      src: "ccb/v2_ritrova.mov",
      words: wordsCcbV2Ritrova as CNReelProps["words"],
      master: "ccb/masters/C4-zoo.mp4",
      // selfie in camminata («yapping»): deve sembrare spontaneo. Tagli netti, niente grafiche (il volto arriva a 0,62), niente pannello CTA: solo sottotitoli
      blendFrames: 1,
      ctaSeconds: 0,
      segments: cutN(1, [2.82, 43.8], [47.31, 71.93], [164.09, 170.26]),
      hook: null,
      // selfie (volto fino a 0,63): parole grandi SOPRA la testa dove c'è spazio; in basso un solo testo alla volta (grafica grande oppure
      // sottotitoli, mai insieme); elenchi e mappa nel pannello laterale; sulla CTA a voce il richiamo grande. Testi corti: max 16 lettere a riga
      gfxShift: 418,
      capShift: 80,
      capHideOnGfx: true,
      elements: [
        { kind: "topword", at: 0.05, dur: 1.65, lines: ["Una giornata", "normale"], accent: "normale", anim: "drop", zone: "strip" },
        // a 5,5 s Daniele piega la testa in avanti (il mento scende a 0,66): lì niente grafica
        { kind: "counter", at: 2.0, word: "8", dur: 2.9, to: 8, suffix: "ore", label: "seduto alla scrivania" },
        { kind: "cycle", at: 6.4, word: "avanti,", dur: 6.9, cues: ["avanti,", "scarpe", "macchina."], items: ["Testa in avanti", "Scarpe strette", "Ore in macchina"] },
        { kind: "title", at: 14.2, word: "corpo", dur: 1.7, lines: ["Il corpo", "si adatta"], accent: "adatta" },
        { kind: "cycle", at: 16.2, word: "muscoli", dur: 5.6, cues: ["muscoli", "articolazioni", "tendini"], items: ["Muscoli deboli", "Giunture rigide", "Tendini rigidi"] },
        { kind: "topword", at: 24.3, word: "esseri", dur: 2.2, lines: ["Esseri umani", "da zoo"], accent: "da zoo", anim: "drop", zone: "strip" },
        { kind: "title", at: 27.8, word: "gabbia", dur: 1.9, lines: ["Una gabbia", "fatta da soli"], accent: "gabbia" },
        { kind: "title", at: 30.0, word: "perso", dur: 4.4, lines: ["Non sappiamo", "più correre"], accent: "correre" },
        { kind: "title", at: 36.7, word: "può", dur: 3.4, lines: ["Si può tornare", "indietro"], accent: "indietro" },
        { kind: "counter", at: 42.8, word: "12", dur: 2.4, to: 12, suffix: "anni", label: "di analisi" },
        { kind: "counter", at: 46.1, word: "7", dur: 3.6, to: 7, label: "elementi della corsa" },
        { kind: "side", at: 52.8, word: "postura,", dur: 6.55, cues: ["postura,", "ritmo,", "relax,", "appoggio", "posizione", "uso", "parabola."], title: "Le 7 fondamenta", items: ["Postura", "Ritmo", "Relax", "Appoggio del piede", "Posizione della testa", "Uso delle braccia", "Parabola"] },
        { kind: "title", at: 60.4, word: "Boscimani", dur: 2.3, lines: ["I Boscimani", "lo fanno"], accent: "Boscimani" },
        { kind: "title", at: 63.4, word: "invece", dur: 1.9, lines: ["Noi dobbiamo", "reimparare"], accent: "reimparare" },
        { kind: "pointer", at: 65.7, word: "Trovi", dur: 5.9, text: "Trovi tutto qui sotto", accent: "qui sotto" },
      ],
      cta: { word: "", title: "" },
    },
    didascalia: `Otto ore seduto, il telefono in mano, scarpe che fanno il lavoro al posto dei piedi. Il corpo si adatta: siamo diventati esseri umani da zoo.

La buona notizia è che si può tornare indietro. Le sette fondamenta della corsa secondo natura: postura, ritmo, relax, appoggio del piede, posizione della testa, uso delle braccia e parabola.

#correrenaturale #corsanaturale #corsa #running`,
  },
  {
    id: "C5-muro",
    title: "Il test del muro",
    cover: { kicker: "Tecnica di corsa", lines: ["Il test", "del muro"], accent: "muro", shiftY: -0.09 },
    props: {
      ...base,
      src: "ccb/v2_ritrova.mov",
      words: wordsCcbV2Ritrova as CNReelProps["words"],
      master: "ccb/masters/C5-muro.mp4",
      // selfie in camminata («yapping»): deve sembrare spontaneo. Tagli netti, niente grafiche (il volto arriva a 0,62), niente pannello CTA: solo sottotitoli
      blendFrames: 1,
      ctaSeconds: 0,
      segments: cutN(1, [71.93, 88.0], [90.71, 118.86], [142.16, 153.12], [154.84, 170.26]),
      hook: null,
      // selfie (volto fino a 0,63): parole grandi SOPRA la testa dove c'è spazio; in basso un solo testo alla volta (grafica grande oppure
      // sottotitoli, mai insieme); elenchi e mappa nel pannello laterale; sulla CTA a voce il richiamo grande. Testi corti: max 16 lettere a riga
      gfxShift: 418,
      capShift: 80,
      capHideOnGfx: true,
      elements: [
        { kind: "topword", at: 0.1, dur: 1.8, lines: ["Un dato scioccante"], accent: "scioccante", anim: "drop" },
        { kind: "counter", at: 2.2, word: "l'87%", dur: 4.8, to: 87, suffix: "%", label: "tecnica scorretta" },
        { kind: "counter", at: 7.8, word: "9", dur: 2.5, to: 9, suffix: "su 10", label: "persone" },
        { kind: "topword", at: 12.3, word: "quanto", dur: 3.4, lines: ["Quanto sei lontano?"], accent: "lontano?" },
        { kind: "side", at: 17.7, word: "talloni", dur: 11.3, cues: ["talloni", "nuca", "sguardo", "filo", "rilassati."], title: "Il test del muro", items: ["Talloni al battiscopa", "Nuca al muro", "Sguardo avanti", "Un filo ti tira su", "Rilassati"] },
        { kind: "title", at: 29.6, word: "passo", dur: 2.0, lines: ["Un passo", "avanti"], accent: "avanti" },
        { kind: "counter", at: 32.0, word: "corri", dur: 2.3, to: 20, suffix: "secondi", label: "corsa sul posto" },
        { kind: "cycle", at: 35.0, word: "posizione", dur: 3.3, cues: ["posizione", "sbilanciato"], items: ["Posizione strana?", "Sbilanciato?"] },
        { kind: "title", at: 39.8, word: "sensazione", dur: 4.2, lines: ["Il corpo si è", "abituato ad altro"], accent: "altro" },
        { kind: "title", at: 44.6, word: "solo", dur: 1.7, lines: ["Uno dei tanti", "esercizi"], accent: "esercizi" },
        { kind: "pointer", at: 46.75, word: "manuale", dur: 8.2, arrow: false, text: "Manuale «Come correre bene»", accent: "«Come correre bene»" },
        { kind: "counter", at: 57.6, word: "tagliando", dur: 5.6, to: 8, suffix: "test", label: "in regalo" },
        { kind: "pointer", at: 64.5, word: "Trovi", dur: 5.9, text: "Trovi tutto qui sotto", accent: "qui sotto" },
      ],
      cta: { word: "", title: "" },
    },
    didascalia: `L'87% delle persone che abbiamo analizzato aveva una tecnica scorretta. Vuoi sentire quanto ti sei allontanato dalla corsa secondo natura?

Talloni contro il battiscopa, nuca al muro, sguardo all'orizzonte. Fai un passo avanti senza cambiare niente e corri sul posto per 20 secondi.

#correrenaturale #tecnicadicorsa #corsa #running`,
  },
  {
    id: "C6-metronomo",
    title: "Il test del metronomo",
    cover: { kicker: "Tecnica di corsa", lines: ["Il test", "del metronomo"], accent: "metronomo", shiftY: -0.09 },
    props: {
      ...base,
      src: "ccb/v2_sentendo.mov",
      words: wordsCcbV2Sentendo as CNReelProps["words"],
      master: "ccb/masters/C6-metronomo-manuale.mp4",
      // selfie in camminata («yapping»): deve sembrare spontaneo. Tagli netti, niente grafiche (il volto arriva a 0,62), niente pannello CTA: solo sottotitoli
      blendFrames: 1,
      ctaSeconds: 0,
      // chiusa a voce presa dal finale del girato (lo stesso di C7): «Trovi tutto qui sotto. Lascia a casa le regole e lascia correre il tuo corpo.»
      segments: [...C6_SEGS, tailFrom(C7_SEGS, 1, 55.0667)],
      hook: null,
      // selfie (volto fino a 0,63): parole grandi SOPRA la testa dove c'è spazio; in basso un solo testo alla volta (grafica grande oppure
      // sottotitoli, mai insieme); elenchi e mappa nel pannello laterale; sulla CTA a voce il richiamo grande. Testi corti: max 16 lettere a riga
      gfxShift: 418,
      capShift: 80,
      capHideOnGfx: true,
      elements: [
        { kind: "topword", at: 0.05, dur: 3.0, lines: ["Il test del", "metronomo"], accent: "metronomo", anim: "drop", zone: "strip" },
        { kind: "title", at: 4.5, word: "un'app", dur: 3.0, lines: ["Un'app gratuita"], accent: "gratuita" },
        { kind: "beat", at: 10.0, word: "110", dur: 6.6, bpm: 110, label: "saltella a tempo" },
        { kind: "title", at: 19.0, word: "saltello", dur: 2.4, lines: ["Ogni saltello", "lo fai tu"], accent: "tu" },
        { kind: "cycle", at: 21.8, word: "pieghi", dur: 3.12, cues: ["pieghi", "spingi,", "atterri,", "ricominci"], items: ["Pieghi le gambe", "Spingi", "Atterri", "Ricominci"] },
        { kind: "title", at: 25.1, word: "tutta", dur: 2.1, lines: ["Tutta fatica", "muscolare"], accent: "muscolare" },
        { kind: "beat", at: 29.2, word: "220", dur: 5.9, bpm: 220, label: "velocissimo", tone: "coral" },
        { kind: "title", at: 37.0, word: "sprecare", dur: 2.2, lines: ["Sprechi", "efficienza"], accent: "efficienza" },
        { kind: "beat", at: 42.5, word: "175", dur: 4.2, bpm: 175, label: "l'ultimo test" },
        { kind: "cycle", at: 47.4, word: "saltelli", dur: 3.5, cues: ["saltelli", "accadono"], items: ["Un po' li fai tu", "Un po' da soli"] },
        { kind: "topword", at: 51.8, word: "rimbalzare,", dur: 2.6, lines: ["Inizi a", "rimbalzare"], accent: "rimbalzare", anim: "drop", zone: "strip" },
        { kind: "cycle", at: 57.3, word: "piede,", dur: 2.4, cues: ["piede,", "tendine", "fascia"], items: ["Piede", "Tendine d'Achille", "Fascia plantare"] },
        { kind: "title", at: 59.9, word: "lavorano", dur: 1.5, lines: ["Come molle"], accent: "molle" },
        { kind: "cycle", at: 61.7, word: "assorbono", dur: 5.4, cues: ["assorbono", "restituiscono"], items: ["Assorbono energia", "E la restituiscono"] },
        { kind: "title", at: 71.8, word: "spiegato", dur: 1.7, lines: ["Non con", "una regola"], accent: "regola" },
        { kind: "title", at: 73.9, word: "fatto", dur: 1.9, lines: ["Te l'ho fatto", "sentire"], accent: "sentire" },
        { kind: "pointer", at: 76.2, word: "Trovi", dur: 1.8, text: "Il manuale è qui sotto", accent: "qui sotto" },
        { kind: "cycle", at: 78.3, word: "Lascia", dur: 2.9, cues: ["regole", "correre"], items: ["Lascia le regole", "Lascia correre"] },
      ],
      cta: { word: "", title: "" },
    },
    didascalia: `Ti serve solo un metronomo. A 110 battiti ogni saltello lo fai tu: tutta fatica muscolare. A 220 sprechi efficienza. A 175 succede una cosa strana: inizi a rimbalzare.

È il tuo sistema piede, tendine d'Achille, fascia plantare che lavora come una molla. Non te l'ho spiegato con una regola: te l'ho fatto sentire.

#correrenaturale #cadenza #corsa #running`,
  },
  {
    id: "C7-tecnica",
    title: "Esercizi che tatuano la tecnica",
    cover: { kicker: "Tecnica di corsa", lines: ["Esercizi che", "tatuano la tecnica"], accent: "tatuano", shiftY: -0.09 },
    props: {
      ...base,
      src: "ccb/v2_sentendo.mov",
      words: wordsCcbV2Sentendo as CNReelProps["words"],
      master: "ccb/masters/C7-tecnica.mp4",
      // selfie in camminata («yapping»): deve sembrare spontaneo. Tagli netti, niente grafiche (il volto arriva a 0,62), niente pannello CTA: solo sottotitoli
      blendFrames: 1,
      ctaSeconds: 0,
      segments: C7_SEGS,
      hook: null,
      // selfie (volto fino a 0,63): parole grandi SOPRA la testa dove c'è spazio; in basso un solo testo alla volta (grafica grande oppure
      // sottotitoli, mai insieme); elenchi e mappa nel pannello laterale; sulla CTA a voce il richiamo grande. Testi corti: max 16 lettere a riga
      gfxShift: 418,
      capShift: 80,
      capHideOnGfx: true,
      elements: [
        { kind: "topword", at: 0.1, dur: 2.6, lines: ["La tecnica", "al corpo"], accent: "corpo", anim: "drop", zone: "strip" },
        { kind: "title", at: 3.0, word: "esercizi", dur: 1.6, lines: ["Esercizi precisi"], accent: "precisi" },
        { kind: "cycle", at: 5.1, word: "prima,", dur: 2.3, cues: ["prima,", "durante", "dopo"], items: ["Prima", "Durante", "Dopo la corsa"] },
        { kind: "title", at: 9.6, word: "direttamente", dur: 2.1, lines: ["Al cervello", "motorio"], accent: "motorio" },
        { kind: "bigstrike", at: 12.0, word: "senza", dur: 1.5, text: "Spiegazioni" },
        { kind: "bigstrike", at: 13.8, word: "senza", dur: 2.7, text: "Troppe regole" },
        { kind: "counter", at: 19.3, word: "12", dur: 2.0, to: 12, suffix: "anni", label: "con questi esercizi" },
        { kind: "title", at: 21.8, word: "migliaia", dur: 1.2, lines: ["Migliaia", "di corridori"], accent: "Migliaia" },
        { kind: "topword", at: 23.9, word: "tatuano", dur: 2.9, lines: ["Tatuano", "la tecnica"], accent: "Tatuano", anim: "drop", zone: "strip" },
        { kind: "title", at: 28.1, word: "corri", dur: 3.0, lines: ["Corri bene", "senza pensarci"], accent: "bene" },
        { kind: "pointer", at: 32.3, word: "manuale", dur: 7.4, arrow: false, text: "Manuale «Come correre bene»", accent: "«Come correre bene»" },
        { kind: "counter", at: 41.9, word: "Corsa", dur: 5.8, to: 30, suffix: "secondi", label: "Corsa perfetta" },
        { kind: "title", at: 50.7, word: "test", dur: 3.6, lines: ["Il test del", "corridore"], accent: "corridore" },
        { kind: "pointer", at: 55.15, word: "Trovi", dur: 1.8, text: "Trovi tutto qui sotto", accent: "qui sotto" },
        { kind: "cycle", at: 57.2, word: "Lascia", dur: 2.9, cues: ["regole", "correre"], items: ["Lascia le regole", "Lascia correre"] },
      ],
      cta: { word: "", title: "" },
    },
    didascalia: `Insegnare la tecnica di corsa al corpo vuol dire usare esercizi precisi, che trasmettono il gesto giusto direttamente al cervello motorio. Senza spiegazioni e senza troppe regole da ricordare.

Un po' alla volta tatuano la tecnica giusta nel tuo corpo. Lascia a casa le regole e lascia correre il tuo corpo.

#correrenaturale #comecorrerebene #corsa #running`,
  },
  {
    id: "T7-bilancio",
    title: "«Da 10 che pensavo potesse fare, il mio corpo sa fare 100» (testimonianza: bilancio di metà percorso)",
    cover: { kicker: "Testimonianza", lines: ["Davide", "da 10 a 100"], accent: "Davide" },
    props: {
      ...base,
      src: "testimonianze/C3502-001.MP4",
      words: wordsC3502 as CNReelProps["words"],
      master: "testimonianze/T7-bilancio.mp4",
      // bilancio di metà percorso della Superhuman Academy (racconto libero): nel girato non dice il nome, quindi niente cartellino
      gfxShift: 100,
      gfxScale: 0.9,
      capShift: 30,
      segments: cut([142.05, 152.36], [48.54, 50.6], [52.95, 69.35], [76.85, 88.33], [117.31, 132.05], [153.47, 165.72]),
      hook: null,
      elements: [
        // nome di fantasia (Ross 12/11): nel girato non lo dice
        { kind: "nametag", at: 3.82, dur: 2.2, name: "Davide", sub: "con Correre Naturale®" },
        { kind: "title", at: 0.2, dur: 3.3, lines: ["La mente risponde", "al corpo"], accent: "corpo" },
        { kind: "stat", at: 6.45, word: "100", dur: 2.3, value: "10 → 100", label: "quello che il corpo sa fare" },
        { kind: "stat", at: 9.15, word: "3000", dur: 1.75, value: "10.000", label: "quello che la mente sa di poter fare" },
        { kind: "title", at: 12.49, word: "estremamente", dur: 2.6, lines: ["Bilancio di metà percorso", "estremamente positivo"], accent: "positivo" },
        { kind: "title", at: 16.05, word: "vanno", dur: 2.9, lines: ["Molto al di là", "della corsa"], accent: "corsa" },
        { kind: "title", at: 20.79, word: "percorso", dur: 4.4, cues: ["percorso", "360"], lines: ["Un percorso che ti forma", "a 360 gradi"], accent: "360" },
        { kind: "title", at: 26.53, word: "ripensare", dur: 2.0, lines: ["Ripensare", "molti schemi"], accent: "schemi" },
        { kind: "checklist", at: 34.09, word: "condizione", dur: 5.9, big: true, cues: ["condizione", "segnali"], items: ["La condizione fisica", "I segnali del corpo"] },
        { kind: "checklist", at: 45.04, word: "ambito", dur: 9.6, big: true, cues: ["corsa", "quotidiana", "lavorativo", "ambizioni"], items: ["Nella corsa", "Nella vita quotidiana", "Nel lavoro", "Nelle ambizioni"] },
        { kind: "title", at: 58.29, word: "tasselli", dur: 2.4, lines: ["Tasselli che si mettono", "in fila"], accent: "fila" },
        { kind: "title", at: 61.27, word: "tessere", dur: 5.6, cues: ["tessere", "può", "mirare"], lines: ["Come le tessere del domino", "si può sempre mirare", "a qualcosa di più"], accent: "più" },
      ],
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«Se so che il mio corpo, da 10 che pensavo potesse fare, sa fare 100, la mia mente ora sa che può fare 3000, 10.000.»

Bilancio di metà percorso: estremamente positivo, per aspetti che vanno molto al di là della corsa. È un percorso che ti forma a 360 gradi, come persona.

Ha imparato a gestire meglio la condizione fisica e a riconoscere i segnali del corpo. E ha scoperto possibilità nuove: nella corsa, nella vita quotidiana, nel lavoro, nelle ambizioni.

«È tutto un processo di tasselli che si mettono in fila: come le tessere del domino, si può sempre mirare a qualcosina di più.»

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running`,
  },
  {
    id: "T8-trail",
    title: "«Quattro anni di fascite plantare, e ora il mio primo trail» (testimonianza)",
    cover: { kicker: "Testimonianza", lines: ["Giulia", "il primo trail"], accent: "Giulia" },
    props: {
      ...base,
      src: "testimonianze/C3504-010.MP4",
      words: wordsC3504 as CNReelProps["words"],
      master: "testimonianze/T8-trail.mp4",
      // bilancio di sei mesi di Superhuman Academy (racconto libero): nel girato non dice il nome, quindi niente cartellino
      gfxShift: 30,
      capShift: 20,
      segments: cut([43.91, 48.49], [83.25, 95.74], [300.12, 303.06], [308.33, 319.54], [321.66, 324.59], [330.22, 336.6], [146.89, 157.86], [163.03, 168.2], [192.06, 204.3]),
      hook: null,
      elements: [
        // nome di fantasia (Ross 12/11): nel girato non lo dice
        { kind: "nametag", at: 4.25, dur: 2.15, name: "Giulia", sub: "con Correre Naturale®" },
        { kind: "stat", at: 1.19, word: "quattro", dur: 2.8, value: "4 anni", label: "di fascite plantare" },
        { kind: "title", at: 6.79, word: "maratona", dur: 2.6, lines: ["La mia prima maratona", "ad aprile"], accent: "maratona" },
        { kind: "bigstrike", at: 11.99, word: "saltare", dur: 2.6, text: "La prima maratona" },
        { kind: "checklist", at: 18.76, word: "esercizi", dur: 7.4, big: true, cues: ["esercizi", "rallentando", "pazienza"], items: ["Gli esercizi giusti", "Rallentare un po'", "Pazienza, soprattutto"] },
        { kind: "title", at: 27.25, word: "tornata", dur: 3.6, cues: ["tornata", "senza"], lines: ["Tornata come prima", "senza alcun fastidio"], accent: "prima" },
        { kind: "title", at: 32.96, word: "coach", dur: 2.2, lines: ["I coach sempre a fianco"], accent: "coach" },
        { kind: "title", at: 36.81, word: "programma", dur: 3.4, lines: ["Il programma cambiava", "con i miei piedi"], accent: "piedi" },
        { kind: "title", at: 44.03, word: "obiettivi", dur: 2.0, lines: ["Ho rivisto i miei obiettivi"], accent: "obiettivi" },
        { kind: "title", at: 49.63, word: "correre", dur: 1.9, lines: ["A correre", "sui sentieri"], accent: "sentieri" },
        { kind: "stat", at: 54.35, word: "trail", dur: 2.0, value: "25 km", label: "il mio primo trail" },
        { kind: "title", at: 56.76, word: "obiettivo", dur: 3.4, lines: ["Un obiettivo", "può saltare"], accent: "saltare" },
        { kind: "title", at: 63.6, word: "pilastri", dur: 2.25, lines: ["Grazie ai pilastri", "di Correre Naturale"], accent: "pilastri" },
        { kind: "title", at: 66.4, word: "può", dur: 2.1, lines: ["Si può fare", "tutt'altro"], accent: "tutt'altro" },
      ],
      cta: { word: "PERCORSO", title: "Vuoi scrivere anche tu la tua storia?" },
    },
    didascalia: `«Ho sofferto per quattro anni di fascite plantare.»

Aveva in programma la sua prima maratona ad aprile, e ha dovuto saltarla per un fastidio all'altro piede. Ma sapeva che con gli esercizi giusti, rallentando un po' e soprattutto con pazienza sarebbe tornata come prima, senza alcun fastidio. E così è stato.

I coach sempre a fianco, il programma modificato in corso d'opera in base a come stavano i suoi piedi. Poi ha rivisto gli obiettivi: ha iniziato a correre sui sentieri, e tra una settimana ha il suo primo trail di 25 km.

«Un obiettivo può non essere raggiunto, ma grazie ai pilastri di Correre Naturale® si può andare a fare tutt'altro.»

Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.

#correrenaturale #testimonianza #corsa #running #trailrunning`,
  },
];

/* ---------- CCB «percorso» (Ross 12/11): stessi reel senza la parte sul manuale «Come correre bene», chiusi dal pannello
   «Commenta PERCORSO» con le regole degli altri reel. I master sono ritagli dei master CCB (`CCB_BUILD`, scripts/ccb_build.ts). ---------- */
const PERCORSO_CTA = "Vuoi iniziare il tuo percorso? Commenta PERCORSO e ti mando tutte le info sui percorsi di coaching personalizzato di Correre Naturale®.";
const ccb = (id: string) => REELS.find((r) => r.id === id)!;
// Tagli rifatti il 12/11 dopo il controllo di Ross («i tagli sono proprio sbagliati», «anche la durata riduci un po'»): non più il reel
// «manuale» troncato, ma una scelta di frasi complete con una chiusa vera, più corta; ogni bordo cade in un silenzio misurato sull'audio
// (fotogrammi del master «manuale»). La coda sotto il pannello della CTA è dal vivo, non un fermo immagine.
const fr = (...f: [number, number][]): [number, number][] => f.map(([a, b]) => [+(a / 30).toFixed(4), +(b / 30).toFixed(4)]);
const PERCORSO: { from: string; ranges: [number, number][]; title: string }[] = [
  // 58 s: scena del runner → pensa a ogni passo → torna a casa più rigido → non è colpa tua, due cervelli → «va insegnata al corpo»
  { from: "C1-runner", ranges: fr([0, 392], [647, 821], [1000, 1975], [2268, 2456]), title: "Vuoi insegnare la tecnica al tuo corpo?" },
  // 62 s: i Boscimani corrono tutti allo stesso modo → in Italia ognuno a modo suo → abbiamo perso qualcosa → «va solo ritrovata»
  { from: "C2-namibia", ranges: fr([0, 781], [873, 1303], [1591, 1908], [2089, 2417]), title: "Vuoi ritrovare la tua corsa naturale?" },
  // 50 s: il pane e i 7 ingredienti → le domande per capire se ne manca uno → «nella tua ricetta qualcosa non va»
  { from: "C3-ricetta", ranges: fr([0, 872], [1053, 1668]), title: "Vuoi scoprire quale ingrediente ti manca?" },
  // 41 s: la giornata da zoo → il corpo si adatta → la gabbia → «si può tornare indietro, ma bisogna sapere cosa c'è da ritrovare»
  { from: "C4-zoo", ranges: fr([0, 1229]), title: "Vuoi tornare a correre secondo natura?" },
  // 44 s: l'87% → il test del muro → «quella sensazione è la misura di quanto il tuo corpo si è abituato a qualcos'altro»
  { from: "C5-muro", ranges: fr([0, 1327]), title: "Vuoi correggere la tua tecnica di corsa?" },
  // 58 s: metronomo a 110, 220 e 175 → le molle → «non te l'ho spiegato con una regola, te l'ho fatto percepire»
  { from: "C6-metronomo", ranges: fr([0, 619], [742, 936], [1079, 1845], [2134, 2282]), title: "Vuoi correre con questa elasticità?" },
  // 35 s: insegnare la tecnica al corpo → esercizi che la tatuano → «lascia a casa le regole e lascia correre il tuo corpo»
  { from: "C7-tecnica", ranges: [...fr([0, 947]), [1716 / 30, playEnd(C7_SEGS, 1)]], title: "Vuoi tatuare la tecnica giusta nel tuo corpo?" },
];
CCB_BUILD["C6-metronomo-manuale"] = { srcs: ["ccb/masters/C6-metronomo.mp4", "ccb/masters/C7-tecnica.mp4"], ranges: [[0, playEnd(C6_SEGS, 1)], [55.0667, playEnd(C7_SEGS, 1)]] };
for (const v of PERCORSO) {
  const r = ccb(v.from), id = `${v.from}-percorso`;
  CCB_BUILD[id] = { srcs: [r.props.master], ranges: v.ranges, tailLive: true };
  REELS.push({
    id,
    title: `${r.title} (versione percorso)`,
    cover: r.cover ? { ...r.cover, master: r.props.master } : undefined,
    props: { ...r.props, master: `ccb/masters/${id}.mp4`, segments: cutRanges(r.props.segments, 1, v.ranges), elements: keepEls(r.props.elements, v.ranges, 1), ctaSeconds: 8, cta: { word: "PERCORSO", title: v.title } },
    didascalia: r.didascalia.replace(/\n\n(#[^\n]*)$/, `\n\n${PERCORSO_CTA}\n\n$1`),
  });
}
