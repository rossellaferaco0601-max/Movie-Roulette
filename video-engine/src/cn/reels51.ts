import words from "./words51.json";
import type { CNReelProps } from "./types";

const SRC = "ytcn51/ytcn51_src.mp4";
const master = (id: string, fx = false) => `ytcn51/masters/${id}${fx ? "_fx" : ""}.mp4`;
const LIME = "#95FF00";

const base = {
  src: SRC,
  words: words as CNReelProps["words"],
  blendFrames: 5,
  ctaSeconds: 7,
  wordOffset: -0.08,
  wordFix: {} as Record<string, string>,
};

export type ReelDef = { id: string; title: string; props: CNReelProps; didascalia: string };
const seg = (from: number, to: number) => ({ from, to });
const BREATH = [{ label: "INSPIRA", sec: 3.5, scale: 1 }, { label: "ESPIRA", sec: 4.5, scale: 0.25 }];

export const REELS: ReelDef[] = [
  {
    id: "R1-fiatone",
    title: "Non sei fatto per correre? Sbagliato",
    props: {
      ...base,
      master: master("R1-fiatone", true),
      // tagli: la frase "e in questo video ti spiego perché" (16.9-23.8) è tolta; i bordi cadono nelle pause tra le parole
      segments: [seg(0.0, 16.8), seg(23.88, 44.84)],
      // motivo visivo del reel 1: allarme / frequenza (riflettore, ECG, timbro, titolo spezzato)
      hook: null,
      fx: [
        { fx: "spotlight", at: 0, dur: 3.4, wide: true, text: "TI MANCA IL FIATO?", color: LIME, font: "bold", push: 1.0 },
        { fx: "reject-stamp", at: 10.2, word: "sbagliato", dur: 2.4, text: "SBAGLIATO", color: LIME, y: 0.62 },
        { fx: "split-headline", at: 32.8, word: "corsa", dur: 3.9, text: "NON È LA CORSA|È IL RESPIRO", hl: "RESPIRO", pill: "Correre Naturale", color: LIME, push: 0.4, height: 0.28 },
      ],
      elements: [
        { kind: "ecg", at: 6.4, word: "cuore", dur: 3.2, title: "Il cuore in gola", bpmFrom: 148, bpmTo: 176 },
        { kind: "widget", at: 12.9, dur: 3.6, title: "Il problema non è il corpo", lines: ["Nessuno ti ha insegnato", "a respirare nel modo giusto"] },
        { kind: "wave", at: 17.2, word: "fiatone", dur: 6.0, title: "Il fiatone", mode: "calm-to-chaos" },
        { kind: "pill", at: 24.4, dur: 2.6, text: "Il corpo si allena per gradi" },
        { kind: "widget", at: 27.7, word: "veloce", dur: 4.8, title: "Se parti troppo veloce", lines: ["il respiro si scompone", "il cervello va in allarme", "e ti ferma"] },
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
    props: {
      ...base,
      master: master("R2-naso"),
      segments: [seg(44.82, 74.28)],
      hook: { lines: ["Il motore in quinta", "appena acceso"], keyword: "quinta", dur: 4.3 },
      elements: [
        { kind: "gauge3d", at: 4.8, dur: 8.3, title: "Le marce giuste", from: 5, to: 1, labels: ["1ª", "2ª", "3ª", "4ª", "5ª"] },
        { kind: "text3d", at: 14.1, word: "naso", dur: 2.4, word3d: "NASO", sub: "il filtro naturale del respiro" },
        { kind: "widget", at: 17.1, dur: 6.0, title: "Il naso è il regolatore", lines: ["Ti obbliga a un ritmo sostenibile", "Usa meglio l'ossigeno", "Mantiene il controllo"] },
        { kind: "wave", at: 23.6, dur: 5.5, title: "Respiro dal naso", mode: "calm" },
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
    props: {
      ...base,
      master: master("R3-bocca"),
      segments: [seg(74.26, 98.56)],
      hook: { lines: ["Durante la corsa", "chiudi la bocca"], keyword: "bocca", dur: 3.3 },
      elements: [
        { kind: "checklist", at: 4.2, word: "rallenta", dur: 4.3, items: ["Voglia di aprire la bocca?", "Rallenta o cammina"] },
        { kind: "widget", at: 9.9, dur: 5.3, title: "Respirazione nasale", lines: ["Stimola il diaframma", "Ossigena i tessuti", "Calma il sistema nervoso"] },
        { kind: "sphere3d", at: 15.8, dur: 4.7, phases: BREATH },
        { kind: "text3d", at: 21.0, word: "energia", dur: 3.0, word3d: "ENERGIA", sub: "dopo la corsa, non meno" },
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
    props: {
      ...base,
      master: master("R4-piano"),
      segments: [seg(98.58, 130.74)],
      hook: { lines: ["Il secondo errore:", "corri troppo forte"], keyword: "forte", dur: 4.3 },
      elements: [
        { kind: "checklist", at: 4.9, word: "spingere", dur: 3.5, items: ["Spingere di più"], strike: true },
        { kind: "text3d", at: 9.65, word: "piano", dur: 2.2, word3d: "PIANO", sub: "è così che si migliora" },
        { kind: "widget", at: 12.1, dur: 4.9, title: "All'inizio l'obiettivo", lines: ["non è la velocità", "è costruire resistenza", "e gestire l'energia"] },
        { kind: "stat", at: 18.4, word: "20", dur: 2.6, value: "20-30", label: "minuti di corsa" },
        { kind: "checklist", at: 21.4, dur: 5.5, items: ["Respira solo dal naso", "Perdi il controllo? Cammina", "Torna calmo? Riparti"] },
        { kind: "bars", at: 27.2, word: "alternanza", dur: 4.7, title: "Capacità aerobica", labels: ["Sett. 1", "Sett. 2", "Sett. 3", "Sett. 4"], values: [30, 48, 68, 92] },
      ],
      cta: { word: "PIANO", title: "Vuoi costruire resistenza senza farti male?" },
    },
    didascalia: `Il secondo errore di chi inizia a correre è correre troppo forte. Molti pensano che per migliorare bisogna spingere di più: in realtà bisogna imparare a correre più piano.

All'inizio l'obiettivo non è la velocità, è costruire resistenza e insegnare al corpo a gestire l'energia. Prova così: corsa di 20-30 minuti respirando solo dal naso; ogni volta che senti di perdere il controllo cammina, e quando torni a respirare con calma riparti. Questa alternanza è l'allenamento perfetto per costruire capacità aerobica.

Commenta PIANO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #correrepiano #resistenza #corsa #running`,
  },
  {
    id: "R5-esercizio1",
    title: "Allena il respiro: respirazione nasale controllata",
    props: {
      ...base,
      master: master("R5-esercizio1"),
      segments: [seg(130.7, 175.82)],
      hook: { lines: ["Correre bene", "dipende da come respiri"], keyword: "respiri", dur: 4.6 },
      elements: [
        { kind: "text3d", at: 6.4, word: "allenare", dur: 2.4, word3d: "RESPIRA", sub: "si allena come un muscolo" },
        { kind: "pill", at: 11.1, word: "tre", dur: 3.0, text: "3 esercizi semplici" },
        { kind: "stage", at: 18.75, dur: 14.6, title: "Esercizio 1 · respirazione nasale controllata", keyword: "controllata", steps: ["Bocca chiusa", "Inspira dal naso 3-4 s", "Espira dal naso 4-5 s", "10 respiri con calma"] },
        { kind: "sphere3d", at: 33.6, dur: 7.5, phases: BREATH },
        { kind: "widget", at: 41.7, dur: 3.3, title: "Cosa allena", lines: ["Tolleranza alla CO₂", "Uso migliore dell'ossigeno", "Più resistenza, meno affanno"] },
      ],
      cta: { word: "ESERCIZI", title: "Vuoi tutti gli esercizi per respirare meglio?" },
    },
    didascalia: `Correre bene non dipende solo dalle gambe: dipende da come respiri. E la buona notizia è che la respirazione si allena, proprio come un muscolo.

Primo esercizio, la respirazione nasale controllata: bocca chiusa, inspira lentamente dal naso per 3-4 secondi, espira sempre dal naso per 4-5 secondi. Dieci respiri così, con calma. Allena il corpo a tollerare più anidride carbonica e quindi a usare meglio l'ossigeno: più resistenza, meno affanno.

Commenta ESERCIZI e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #respirazione #esercizi #corsa #running`,
  },
  {
    id: "R6-breathhold",
    title: "Esercizio 2: le pause respiratorie",
    props: {
      ...base,
      master: master("R6-breathhold"),
      segments: [seg(175.8, 205.06)],
      hook: { lines: ["Correre in controllo", "senza panico"], keyword: "controllo", dur: 4.0 },
      elements: [
        { kind: "stage", at: 4.55, dur: 9.4, title: "Esercizio 2 · le pause respiratorie", keyword: "pause", steps: ["Espira normalmente", "Trattieni qualche secondo", "Riprendi dal naso", "5-10 volte, senza forzare"] },
        { kind: "sphere3d", at: 14.15, dur: 7.4, phases: [{ label: "ESPIRA", sec: 2, scale: 0.25 }, { label: "TRATTIENI", sec: 4, scale: 0.25 }, { label: "INSPIRA", sec: 3, scale: 1 }] },
        { kind: "widget", at: 21.75, dur: 3.1, title: "Cosa insegna", lines: ["Restare calmo", "anche quando la CO₂ sale"] },
        { kind: "text3d", at: 25.65, word: "controllo", dur: 2.2, word3d: "CONTROLLO", sub: "senza panico" },
        { kind: "wave", at: 27.65, dur: 1.5, title: "Senza iperventilare", mode: "calm" },
      ],
      cta: { word: "CONTROLLO", title: "Vuoi correre in controllo, senza affanno?" },
    },
    didascalia: `Secondo esercizio: i breath hold, le pause respiratorie. Dopo una normale espirazione trattieni il respiro per qualche secondo, poi riprendi a respirare dal naso. Fallo 5-10 volte, senza forzare.

Insegna al corpo a restare calmo anche quando l'anidride carbonica aumenta, come succede durante la corsa. Il risultato: impari a correre in controllo, senza panico e senza bisogno di iperventilare.

Commenta CONTROLLO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #breathhold #respirazione #corsa #running`,
  },
  {
    id: "R7-ritmica",
    title: "Esercizio 3: respirazione ritmica",
    props: {
      ...base,
      master: master("R7-ritmica"),
      segments: [seg(205.02, 242.8)],
      hook: { lines: ["Inspira 3 passi,", "espira 4"], keyword: "3", dur: 3.6 },
      elements: [
        { kind: "stage", at: 4.5, word: "camminata", dur: 8.0, title: "Esercizio 3 · respirazione ritmica", keyword: "ritmica", steps: ["Cammina o corri piano, dal naso", "Inspira per 3 passi", "Espira per 4 passi"] },
        { kind: "steps", at: 12.7, dur: 4.4, inhale: 3, exhale: 4 },
        { kind: "widget", at: 17.3, word: "sincronizzerai", dur: 5.0, title: "Risultato", lines: ["Respiro e movimento insieme", "Meno sforzo, più fluidità"] },
        { kind: "wave", at: 22.6, dur: 3.6, title: "Respiro e passo sincronizzati", mode: "calm" },
        { kind: "kinetic", at: 27.4, word: "cambiano", dur: 2.2, words: ["CAMBIANO", "TUTTO"], accentIndex: 1 },
        { kind: "text3d", at: 33.5, word: "naturale", dur: 1.4, word3d: "RITMO", sub: "naturale, leggero, meditativo" },
      ],
      cta: { word: "RITMO", title: "Vuoi trovare il tuo ritmo naturale di corsa?" },
    },
    didascalia: `Terzo esercizio: la respirazione ritmica. Durante una camminata o una corsa lenta respira dal naso, inspira per tre passi ed espira per quattro, e cerca il ritmo che ti fa sentire in equilibrio. È una forma di meditazione in movimento.

Il risultato è che sincronizzi respiro e movimento: meno sforzo, più fluidità. Sembrano esercizi semplici, ma cambiano tutto: impari a gestire il respiro invece di subirlo, e correre diventa naturale, leggero, quasi meditativo.

Commenta RITMO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #respirazioneritmica #corsa #running #ritmo`,
  },
  {
    id: "R8-dialogo",
    title: "La corsa è un dialogo con il tuo corpo",
    props: {
      ...base,
      master: master("R8-dialogo"),
      segments: [seg(242.78, 279.95)],
      hook: { lines: ["La corsa non è", "un test di resistenza"], keyword: "resistenza", dur: 4.4 },
      elements: [
        { kind: "kinetic", at: 4.2, word: "dialogo", dur: 2.6, words: ["UN DIALOGO", "CON IL CORPO"], accentIndex: 0 },
        { kind: "widget", at: 8.07, dur: 4.8, title: "Quando impari ad ascoltarlo", lines: ["Smetti di soffrire", "Inizi a goderti ogni passo"] },
        { kind: "checklist", at: 13.7, word: "spingere", dur: 1.4, items: ["Spingere di più"], strike: true },
        { kind: "text3d", at: 15.22, word: "respirare", dur: 2.3, word3d: "RESPIRA", sub: "meglio, non di più" },
        { kind: "widget", at: 18.77, dur: 7.4, title: "Se ti manca il fiato", lines: ["Non fermarti", "Impara a respirare", "Impara a rallentare", "Ascolta il tuo corpo"] },
        { kind: "wave", at: 26.37, dur: 3.6, title: "Più lontano, meno sforzo", mode: "calm" },
        { kind: "text3d", at: 34.0, word: "lontano", dur: 2.0, word3d: "LONTANO", sub: "ed essere sostenibili" },
      ],
      cta: { word: "LONTANO", title: "Vuoi correre più lontano con meno sforzo?" },
    },
    didascalia: `La corsa non è un test di resistenza: è un dialogo tra te e il tuo corpo. Quando impari ad ascoltarlo smetti di soffrire e inizi a goderti ogni passo.

Non serve spingere di più, serve respirare meglio. Se ti manca il fiato non fermarti: impara a respirare, a rallentare e ad ascoltare il tuo corpo. In poco tempo correrai più lontano, con più energia e meno sforzo. Correre bene non significa andare forte: significa andare lontano ed essere sostenibili.

Commenta LONTANO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #corsa #running #ascoltailcorpo #sostenibile`,
  },
];
