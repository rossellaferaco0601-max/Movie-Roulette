import words from "./words51.json";
import type { CNReelProps, Element } from "./types";

const SRC = "ytcn51/ytcn51_src.mp4";

const base = {
  src: SRC,
  words: words as CNReelProps["words"],
  blendFrames: 5,
  ctaSeconds: 7,
  wordFix: { "iperventilare": "iperventilare", "breath": "breath", "holds": "hold" } as Record<string, string>,
};

export type ReelDef = { id: string; title: string; props: CNReelProps; didascalia: string };

const seg = (from: number, to: number) => ({ from, to });

export const REELS: ReelDef[] = [
  {
    id: "R1-fiatone",
    title: "Non sei fatto per correre? Sbagliato",
    props: {
      ...base,
      segments: [seg(0.0, 16.9), seg(23.75, 44.95)],
      hook: { lines: ["Ti manca il fiato", "dopo pochi minuti?"], keyword: "fiato", dur: 4.3 },
      emph: ["fiato", "cuore", "sbagliato", "respirare", "fiatone", "controllo", "sabotando", "respiro"],
      elements: [
        { kind: "kinetic", at: 10.2, dur: 1.6, words: ["SBAGLIATO"] },
        { kind: "widget", at: 11.0, dur: 5.5, title: "Il problema non è il corpo", lines: ["Nessuno ti ha insegnato", "a respirare nel modo giusto"] },
        { kind: "pill", at: 17.3, dur: 2.2, text: "Fiatone = fuori controllo" },
        { kind: "widget", at: 25.2, dur: 5.2, title: "Se parti troppo veloce", lines: ["il respiro si scompone", "il cervello va in allarme", "e ti ferma"] },
        { kind: "kinetic", at: 33.6, dur: 3.0, words: ["NON È LA CORSA", "È IL RESPIRO"], accentIndex: 1 },
      ] as Element[],
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
      segments: [seg(44.9, 74.3)],
      hook: { lines: ["Il motore in quinta", "appena acceso"], keyword: "quinta", dur: 4.5 },
      emph: ["motore", "quinta", "marce", "naso", "filtro", "ritmo", "ossigeno", "controllo"],
      elements: [
        { kind: "kinetic", at: 5.2, dur: 1.8, words: ["VA IN TILT"] },
        { kind: "pill", at: 7.2, dur: 2.2, text: "Usa le marce giuste" },
        { kind: "kinetic", at: 13.0, dur: 2.2, words: ["RESPIRA", "CON IL NASO"], accentIndex: 1 },
        { kind: "widget", at: 16.0, dur: 12.0, title: "Il naso è il filtro", lines: ["Regola il ritmo", "Usa meglio l'ossigeno", "Mantiene il controllo"] },
      ] as Element[],
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
      segments: [seg(74.35, 98.5)],
      hook: { lines: ["Durante la corsa", "chiudi la bocca"], keyword: "bocca", dur: 4.0 },
      emph: ["bocca", "rallenta", "cammina", "ritmo", "diaframma", "ossigena", "calma", "energia"],
      elements: [
        { kind: "checklist", at: 5.0, dur: 4.5, items: ["Voglia di aprire la bocca?", "Rallenta o cammina"] },
        { kind: "widget", at: 10.0, dur: 5.5, title: "Respirazione nasale", lines: ["Stimola il diaframma", "Ossigena i tessuti", "Calma il sistema nervoso"] },
        { kind: "kinetic", at: 19.5, dur: 2.6, words: ["PIÙ ENERGIA", "DOPO LA CORSA"], accentIndex: 0 },
      ] as Element[],
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
      segments: [seg(98.65, 130.7)],
      hook: { lines: ["Il secondo errore:", "corri troppo forte"], keyword: "forte", dur: 4.3 },
      emph: ["errore", "forte", "piano", "velocità", "resistenza", "energia", "naso", "cammina", "riparti", "aerobica"],
      elements: [
        { kind: "kinetic", at: 8.5, dur: 2.0, words: ["CORRI", "PIÙ PIANO"], accentIndex: 1 },
        { kind: "widget", at: 11.0, dur: 5.5, title: "All'inizio l'obiettivo", lines: ["non è la velocità", "è costruire resistenza"] },
        { kind: "stat", at: 17.5, dur: 3.0, value: "20-30", label: "minuti di corsa" },
        { kind: "checklist", at: 21.0, dur: 7.5, items: ["Respira solo dal naso", "Perdi il controllo? Cammina", "Torna calmo? Riparti"] },
        { kind: "pill", at: 28.0, dur: 3.5, text: "Capacità aerobica" },
      ] as Element[],
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
      segments: [seg(130.65, 179.25)],
      hook: { lines: ["Correre bene", "dipende da come respiri"], keyword: "respiri", dur: 4.6 },
      emph: ["gambe", "respiri", "allenare", "muscoli", "tre", "esercizi", "fiatone", "naso", "3", "4", "5", "10", "anidride", "carbonica", "ossigeno", "resistenza", "affanno"],
      elements: [
        { kind: "kinetic", at: 5.2, dur: 2.4, words: ["ALLENA", "IL RESPIRO"], accentIndex: 1 },
        { kind: "pill", at: 10.2, dur: 3.5, text: "3 esercizi semplici" },
        { kind: "stage", at: 19.0, dur: 15.0, title: "Esercizio 1 · respirazione nasale controllata", keyword: "controllata", steps: ["Bocca chiusa", "Inspira dal naso 3-4 s", "Espira dal naso 4-5 s", "10 respiri con calma"] },
        { kind: "widget", at: 35.5, dur: 8.0, title: "Cosa allena", lines: ["Tolleranza alla CO₂", "Uso migliore dell'ossigeno", "Più resistenza, meno affanno"] },
      ] as Element[],
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
      segments: [seg(175.15, 205.1)],
      hook: { lines: ["Correre in controllo", "senza panico"], keyword: "controllo", dur: 4.0 },
      emph: ["breath", "hold", "pause", "trattieni", "naso", "5", "10", "forzare", "calmo", "anidride", "carbonica", "controllo", "panico", "iperventilare"],
      elements: [
        { kind: "stage", at: 5.0, dur: 12.0, title: "Esercizio 2 · le pause respiratorie", keyword: "pause", steps: ["Espira normalmente", "Trattieni qualche secondo", "Riprendi dal naso", "5-10 volte, senza forzare"] },
        { kind: "widget", at: 18.5, dur: 5.5, title: "Cosa insegna", lines: ["Restare calmo", "anche quando la CO₂ sale"] },
        { kind: "kinetic", at: 25.5, dur: 3.5, words: ["IN CONTROLLO", "SENZA PANICO"], accentIndex: 1 },
      ] as Element[],
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
      segments: [seg(205.05, 241.3)],
      hook: { lines: ["Inspira 3 passi,", "espira 4"], keyword: "3", dur: 4.2 },
      emph: ["ritmica", "naso", "tre", "quattro", "ritmo", "equilibrio", "meditazione", "respiro", "movimento", "fluidità", "cambiano", "tutto", "naturale", "leggero"],
      elements: [
        { kind: "stage", at: 5.5, dur: 11.0, title: "Esercizio 3 · respirazione ritmica", keyword: "ritmica", steps: ["Cammina o corri piano, dal naso", "Inspira per 3 passi", "Espira per 4 passi"] },
        { kind: "pill", at: 17.0, dur: 3.5, text: "Meditazione in movimento" },
        { kind: "widget", at: 21.0, dur: 5.5, title: "Risultato", lines: ["Respiro e movimento sincronizzati", "Meno sforzo, più fluidità"] },
        { kind: "kinetic", at: 30.8, dur: 4.5, words: ["NATURALE", "LEGGERO"], accentIndex: 1 },
      ] as Element[],
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
      segments: [seg(241.15, 279.9)],
      hook: { lines: ["La corsa non è", "un test di resistenza"], keyword: "resistenza", dur: 4.4 },
      emph: ["resistenza", "dialogo", "corpo", "ascoltarlo", "soffrire", "goderti", "spingere", "respirare", "rallentare", "ascoltare", "lontano", "energia", "forte", "sostenibili"],
      elements: [
        { kind: "kinetic", at: 5.0, dur: 2.6, words: ["UN DIALOGO", "CON IL CORPO"], accentIndex: 0 },
        { kind: "checklist", at: 14.5, dur: 4.5, items: ["Spingere di più"], strike: true },
        { kind: "kinetic", at: 17.5, dur: 2.0, words: ["RESPIRA MEGLIO"] },
        { kind: "widget", at: 21.5, dur: 7.0, title: "Se ti manca il fiato", lines: ["Non fermarti", "Impara a respirare", "Impara a rallentare", "Ascolta il corpo"] },
        { kind: "kinetic", at: 33.2, dur: 4.5, words: ["ANDARE", "LONTANO"], accentIndex: 1 },
      ] as Element[],
      cta: { word: "LONTANO", title: "Vuoi correre più lontano con meno sforzo?" },
    },
    didascalia: `La corsa non è un test di resistenza: è un dialogo tra te e il tuo corpo. Quando impari ad ascoltarlo smetti di soffrire e inizi a goderti ogni passo.

Non serve spingere di più, serve respirare meglio. Se ti manca il fiato non fermarti: impara a respirare, a rallentare e ad ascoltare il tuo corpo. In poco tempo correrai più lontano, con più energia e meno sforzo. Correre bene non significa andare forte: significa andare lontano ed essere sostenibili.

Commenta LONTANO e ti mando tutte le info sui percorsi di coaching personalizzato.

#correrenaturale #corsa #running #ascoltailcorpo #sostenibile`,
  },
];
