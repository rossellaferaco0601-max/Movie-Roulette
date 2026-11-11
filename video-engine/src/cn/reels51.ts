import words from "./words51.json";
import wordsDaniela from "./wordsDaniela.json";
import wordsMassimiliano from "./wordsMassimiliano.json";
import type { CNReelProps } from "./types";

const SRC = "ytcn51/ytcn51_src.mp4";
const master = (id: string, fx = false) => `ytcn51/masters/${id}${fx ? "_fx" : ""}.mp4`;
const LIME = "#95FF00";

const base = {
  src: SRC,
  words: words as CNReelProps["words"],
  blendFrames: 5,
  ctaSeconds: 7,
  // le parole di YTCN 51 sono allineate col riconoscitore fonetico (cn_align.py): la grafica parte 2 fotogrammi prima dell'attacco della parola
  wordOffset: -0.06,
  wordFix: {} as Record<string, string>,
};

export type ReelDef = { id: string; title: string; props: CNReelProps; didascalia: string };
const seg = (from: number, to: number) => ({ from, to });
/** Pezzi a partire dai PUNTI DI TAGLIO DELL'AUDIO (misurati con scripts/cn_align.py, nelle pause tra le parole): il video sborda di mezzo
 *  incrocio (0,083 s) sui tagli interni e ogni pezzo dura un numero intero di fotogrammi. */
const cutN = (blend: number, ...a: [number, number][]) => a.map(([f, t], i) => {
  const hb = blend / 2 / 30, from = +(i ? f - hb : f).toFixed(3), to0 = i < a.length - 1 ? t + hb : t;
  return { from, to: +(from + Math.round((to0 - from) * 30) / 30).toFixed(4) };
});
const cut = (...a: [number, number][]) => cutN(5, ...a);
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
    props: {
      ...base,
      master: master("R2-naso"),
      // 11/11 (Ross: «le animazioni non seguono le parole e sono sempre le stesse, cambialo completamente»): sei grafiche tutte diverse,
      // ognuna con le parti interne agganciate alle parole dette; niente effetti sul master, coda ferma (niente salto prima della CTA)
      segments: cut([53.8, 74.2]),
      hook: null,
      elements: [
        { kind: "step", at: 0.2, word: "primo", dur: 3.2, cues: ["passo", "fiatone", "quando"], n: "1", label: "Il primo passo", sub: "per eliminare il", strike: "Fiatone" },
        { kind: "airflow", at: 3.6, word: "imparare", dur: 2.4, cues: ["respirare", "naso"], lines: ["Respira", "con il naso"] },
        { kind: "filter", at: 6.2, word: "naso", dur: 4.1, cues: ["filtro", "regolatore"] },
        { kind: "beats", at: 10.9, word: "obbliga", dur: 2.75, cues: ["ritmo", "sostenibile"], words: ["Ritmo", "sostenibile"] },
        { kind: "ring", at: 14.7, word: "usare", dur: 2.3, cues: ["ossigeno", "efficiente"], words: ["Ossigeno", "efficiente"] },
        { kind: "duo", at: 17.85, word: "controllo", dur: 2.45, cues: ["corpo", "mente"], title: "Controllo", words: ["Corpo", "Mente"] },
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
      // motivo visivo del reel 3: bocca chiusa / energia (bocca illustrata che si chiude, lista, sfera, grafico)
      hook: null,
      elements: [
        { kind: "mouth", at: 0, dur: 3.4, lines: ["Durante la corsa", "Chiudi la bocca"] },
        { kind: "checklist", at: 4.2, word: "rallenta", dur: 4.3, items: ["Voglia di aprire la bocca?", "Rallenta o cammina"] },
        { kind: "widget", at: 9.9, dur: 5.3, title: "Respirazione nasale", lines: ["Stimola il diaframma", "Ossigena i tessuti", "Calma il sistema nervoso"] },
        { kind: "sphere3d", at: 15.8, dur: 4.7, phases: BREATH },
        { kind: "graph", at: 21.0, word: "energia", dur: 3.1, title: "Energia dopo la corsa", label: "non meno, come spesso capita", from: 40, to: 100 },
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
      // audio e Daniele partono da "molti pensano…"; il titolo grande "Correre troppo forte" apre il reel (Ross 8/11)
      // 11/11: ogni grafica entra sulla parola detta (tempi allineati), righe degli elenchi comprese
      segments: cut([101.71, 130.62]),
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 2.6, lines: ["Correre", "troppo forte"], accent: "forte" },
        { kind: "runner", at: 2.75, word: "spingere", dur: 3.62, cues: ["realtà", "più"], fast: "Spingere di più", slow: "Più piano", bpmFrom: 182, bpmTo: 142 },
        { kind: "kinetic", at: 6.59, word: "piano", dur: 1.45, words: ["PIANO", "SI MIGLIORA COSÌ"], accentIndex: 0 },
        { kind: "road3d", at: 8.17, word: "obiettivo", dur: 5.6, title: "Obiettivo iniziale", fromLabel: "TROPPO FORTE", toLabel: "PIANO", fromSpeed: 178, toSpeed: 138, unit: "bpm" },
        { kind: "stat", at: 14.89, word: "20", dur: 1.3, value: "20-30", label: "minuti di corsa" },
        { kind: "checklist", at: 16.29, word: "respira", dur: 7.5, cues: ["respira", "perdere", "torni"], items: ["Respira solo dal naso", "Perdi il controllo? Cammina", "Torna calmo? Riparti"] },
        { kind: "bars", at: 24.09, word: "alternanza", dur: 4.6, title: "Capacità aerobica", labels: ["Sett. 1", "Sett. 2", "Sett. 3", "Sett. 4"], values: [30, 48, 68, 92] },
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
    props: {
      ...base,
      master: master("R5-esercizi"),
      blendFrames: 2,
      // 11/11 (Ross): apertura tagliata su «correre bene / dipende / da come respiri» con lo schianto su «respiri»; i tre esercizi tutti in un
      // reel (R6 e R7 scartati); su «tre esercizi» fermo immagine con i titoli in orbita sopra la testa. Le schede grafiche del sorgente
      // (148,8-162,3 · 179,95-190,3 · 204,6-219,3) sono coperte dalle guide a tutto schermo, a tappe agganciate alle parole.
      segments: cutN(2, [131.26, 131.98], [133.56, 134.09], [134.47, 146.71], [149.34, 165.5], [172.52, 190.89], [198.98, 205.0], [205.08, 218.8], [221.54, 235.48]),
      hook: null,
      elements: [
        { kind: "slam", at: 0, dur: 2.2, cues: ["correre", "dipende", "respiri"], lead: ["Correre bene", "dipende da come"], text: "Respiri" },
        { kind: "kinetic", at: 3.9, word: "allenare", dur: 2.9, words: ["SI ALLENA", "COME UN MUSCOLO"], accentIndex: 1 },
        { kind: "orbit", at: 8.7, word: "tre", dur: 5.0, cues: ["semplici"], src: master("R5-esercizi"), titles: ["Nasale controllata", "Pause respiratorie", "Respirazione ritmica"], headX: 0.55, headTop: 0.05 },
        { kind: "drill", at: 13.4, dur: 13.3, fadeIn: 0, cues: ["chiudi", "inspira", "espira"], n: 1, title: "Respirazione|nasale controllata", steps: [
          { label: "Bocca chiusa", sub: "molto semplice", shape: "hold", color: "cream" },
          { label: "Inspira", sub: "lentamente dal naso · 3-4 secondi", shape: "grow", color: "az" },
          { label: "Espira", sub: "sempre dal naso · 4-5 secondi", shape: "shrink", color: "lime" },
        ] },
        { kind: "stat", at: 27.3, word: "respiri", dur: 2.0, value: "10 respiri", label: "mantenendo la calma" },
        { kind: "kinetic", at: 31.0, word: "più", dur: 1.75, words: ["PIÙ RESISTENZA", "MENO AFFANNO"], accentIndex: 0 },
        { kind: "title", at: 33.3, word: "secondo", dur: 3.5, cues: ["secondo", "pause"], lines: ["Esercizio 2", "Pause respiratorie"], accent: "2" },
        { kind: "drill", at: 36.87, dur: 10.8, fadeIn: 5, cues: ["dopo", "trattieni", "riprendi", "fallo"], n: 2, title: "Pause|respiratorie", steps: [
          { label: "Espira", sub: "una normale espirazione", shape: "shrink", color: "lime" },
          { label: "Trattieni", sub: "il respiro per qualche secondo", shape: "ring", color: "cream" },
          { label: "Riprendi", sub: "a respirare dal naso", shape: "grow", color: "az" },
          { label: "5-10 volte", sub: "mi raccomando, senza forzare", shape: "count", big: "5-10" },
        ] },
        { kind: "kinetic", at: 50.1, word: "controllo", dur: 2.6, words: ["IN CONTROLLO", "SENZA PANICO"], accentIndex: 0 },
        { kind: "drill", at: 53.43, dur: 14.57, fadeIn: 5, fadeOut: 4, cues: ["cammina", "inspira", "espira", "trova"], n: 3, title: "Respirazione|ritmica", steps: [
          { label: "Cammina o corri", sub: "piano, respirando dal naso", shape: "feet", n: 4, color: "cream" },
          { label: "Inspira", sub: "per 3 passi", shape: "feet", n: 3, color: "az" },
          { label: "Espira", sub: "per 4 passi", shape: "feet", n: 4, color: "lime" },
          { label: "Trova il tuo ritmo", sub: "quello che ti fa sentire in equilibrio", shape: "pulse", color: "lime" },
        ] },
        { kind: "widget", at: 68.8, word: "sincronizzerai", dur: 5.6, cues: ["sincronizzerai", "sforzo", "fluidità"], title: "Il risultato", lines: ["Respiro e movimento insieme", "Meno sforzo", "Più fluidità"] },
        { kind: "title", at: 76.3, word: "sembrano", dur: 2.1, cues: ["sembrano", "cambiano"], lines: ["Sembrano semplici", "ma cambiano tutto"], accent: "tutto" },
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
    props: {
      ...base,
      master: master("R8-dialogo"),
      // 11/11: «Il concetto chiave [di questo video] è che…»: tolto "di questo video" con un taglio nelle pause; grafiche agganciate alle parole
      segments: cut([242.7, 243.6], [244.44, 279.8]),
      // motivo visivo del reel 8: dialogo (chat dal corpo, polmoni illustrati, pillole che entrano, orizzonte, titolo finale)
      hook: null,
      elements: [
        { kind: "chat", at: 1.2, word: "corsa", dur: 3.1, cues: ["corsa", "test"], sender: "Il tuo corpo", messages: ["La corsa non è", "un test di resistenza"] },
        { kind: "kinetic", at: 4.5, word: "dialogo", dur: 2.6, words: ["UN DIALOGO", "CON IL TUO CORPO"], accentIndex: 0 },
        { kind: "widget", at: 7.26, word: "ascoltarlo", dur: 4.4, cues: ["smetti", "inizi"], title: "Quando impari ad ascoltarlo", lines: ["Smetti di soffrire", "Inizi a goderti ogni passo"] },
        { kind: "bigstrike", at: 12.38, word: "spingere", dur: 1.4, text: "Spingere di più" },
        { kind: "lungs", at: 13.96, word: "respirare", dur: 1.55, title: "Respirare meglio", sub: "non di più" },
        { kind: "stack", at: 15.68, word: "se", dur: 8.1, cues: ["fermarti", "respirare", "rallentare", "ascoltare"], title: "Se ti manca il fiato", items: ["Non fermarti", "Impara a respirare", "Impara a rallentare", "Ascolta il tuo corpo"] },
        { kind: "horizon", at: 25.46, word: "correrai", dur: 3.5, title: "Più lontano, meno sforzo", kmTo: 10 },
        { kind: "title", at: 33.16, word: "significa", dur: 3.0, cues: ["significa", "lontano", "sostenibili"], lines: ["Correre bene =", "Andare lontano", "ed essere sostenibili"], accent: "lontano" },
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
];
