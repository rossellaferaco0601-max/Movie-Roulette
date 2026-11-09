import words from "./words51.json";
import wordsDaniela from "./wordsDaniela.json";
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
      master: master("R2-naso", true),
      // parte da "E il primo passo per eliminare il fiatone…" (Ross 8/11: la metafora del motore non va bene come inizio)
      segments: [seg(53.66, 74.28)],
      // motivo visivo del reel 2: il naso regolatore (insegna LED, interruttori, onda calma)
      hook: { lines: ["Il primo passo", "contro il fiatone"], keyword: "fiatone", dur: 3.6 },
      fx: [{ fx: "led-sign", at: 5.9, word: "naso", dur: 2.6, wide: true, text: "RESPIRA|DAL NASO", color: LIME, push: 1.0 }],
      elements: [
        { kind: "toggles", at: 9.1, dur: 5.4, title: "Il naso è il regolatore", items: ["Ritmo sostenibile", "Ossigeno usato meglio", "Controllo su corpo e mente"], onAt: [0.5, 2.2, 3.9] },
        { kind: "wave", at: 14.8, dur: 5.2, title: "Respiro dal naso", mode: "calm" },
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
      segments: [seg(101.78, 130.74)],
      // motivo visivo del reel 4: velocità (corridore illustrato che rallenta, PIANO grande, strada 3D, barre)
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 2.7, lines: ["Correre", "troppo forte"], accent: "forte" },
        { kind: "runner", at: 2.9, word: "spingere", dur: 3.4, fast: "Spingere di più", slow: "Più piano", bpmFrom: 182, bpmTo: 142 },
        { kind: "kinetic", at: 6.55, word: "piano", dur: 2.2, words: ["PIANO", "SI MIGLIORA COSÌ"], accentIndex: 0 },
        { kind: "road3d", at: 8.9, dur: 4.9, title: "Obiettivo iniziale", fromLabel: "TROPPO FORTE", toLabel: "PIANO", fromSpeed: 178, toSpeed: 138, unit: "bpm" },
        { kind: "stat", at: 15.2, word: "20", dur: 2.6, value: "20-30", label: "minuti di corsa" },
        { kind: "checklist", at: 18.2, dur: 5.5, items: ["Respira solo dal naso", "Perdi il controllo? Cammina", "Torna calmo? Riparti"] },
        { kind: "bars", at: 24.0, word: "alternanza", dur: 4.7, title: "Capacità aerobica", labels: ["Sett. 1", "Sett. 2", "Sett. 3", "Sett. 4"], values: [30, 48, 68, 92] },
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
      master: master("R5-esercizio1", true),
      segments: [seg(130.7, 175.82)],
      // motivo visivo del reel 5: allenamento (apertura a punti, conto alla rovescia veloce, guida a tutto schermo al posto del fermo immagine)
      hook: { lines: ["Correre bene", "dipende da come respiri"], keyword: "respiri", dur: 4.6 },
      fx: [
        { fx: "dot-reveal", at: 0, dur: 1.3, color: LIME },
        { fx: "countdown-flip", at: 11.1, word: "tre", dur: 1.5, wide: true, from: 3 },
      ],
      elements: [
        { kind: "kinetic", at: 6.4, word: "allenare", dur: 2.6, words: ["SI ALLENA", "COME UN MUSCOLO"], accentIndex: 1 },
        { kind: "guide", at: 18.1, dur: 13.6, mode: "nasale", inhale: 3.5, exhale: 4.5, breaths: 10 },
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
      // motivo visivo del reel 6: controllo e pressione (push-in lento, guida a tutto schermo, barre CO₂, parole cinetiche)
      hook: { lines: ["Correre in controllo", "senza panico"], keyword: "controllo", dur: 3.7 },
      hookZoom: 1.14,
      elements: [
        { kind: "guide", at: 4.15, dur: 10.35, mode: "hold", exhale: 2, hold: 4, inhale: 3 },
        { kind: "sphere3d", at: 14.75, dur: 6.85, phases: [{ label: "ESPIRA", sec: 2, scale: 0.25 }, { label: "TRATTIENI", sec: 4, scale: 0.25 }, { label: "INSPIRA", sec: 3, scale: 1 }] },
        { kind: "bars", at: 21.75, dur: 3.1, title: "La CO₂ sale, tu resti calmo", labels: ["0 s", "3 s", "6 s", "9 s"], values: [22, 46, 70, 94] },
        { kind: "kinetic", at: 25.65, word: "controllo", dur: 1.9, words: ["IN CONTROLLO", "SENZA PANICO"], accentIndex: 0 },
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
      master: master("R7-ritmica", true),
      // parte da "durante una camminata…": l'esercizio è presentato dal titolo della guida, non da "il terzo esercizio" (Ross 8/11)
      segments: [seg(208.62, 242.8)],
      // motivo visivo del reel 7: ritmo (guida a tutto schermo con i passi, metronomo, titolo con punch-in)
      hook: null,
      fx: [{ fx: "headline-box", at: 31.1, word: "naturale", dur: 2.9, wide: true, text: "RITMO NATURALE|LEGGERO, MEDITATIVO", zoom: 1.0 }],
      elements: [
        { kind: "guide", at: 0, dur: 10.9, mode: "ritmica", title: "Respirazione|ritmica", titleSec: 2.4, inhale: 3, exhale: 4 },
        { kind: "metronome", at: 13.9, word: "sincronizzerai", dur: 3.2, title: "Respiro e passo insieme", inhale: 3, exhale: 4, bpm: 160 },
        { kind: "widget", at: 17.2, dur: 3.0, title: "Risultato", lines: ["Meno sforzo", "Più fluidità"] },
        { kind: "kinetic", at: 22.8, word: "cambiano", dur: 2.2, words: ["CAMBIANO", "TUTTO"], accentIndex: 1 },
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
      // motivo visivo del reel 8: dialogo (chat dal corpo, polmoni illustrati, pillole che entrano, orizzonte, titolo finale)
      hook: null,
      elements: [
        { kind: "chat", at: 0, dur: 4.4, sender: "Il tuo corpo", messages: ["La corsa non è un test di resistenza", "È un dialogo tra te e me", "Ascoltami"] },
        { kind: "kinetic", at: 4.6, word: "dialogo", dur: 2.6, words: ["UN DIALOGO", "CON IL TUO CORPO"], accentIndex: 0 },
        { kind: "widget", at: 8.07, dur: 4.8, title: "Quando impari ad ascoltarlo", lines: ["Smetti di soffrire", "Inizi a goderti ogni passo"] },
        { kind: "bigstrike", at: 13.7, word: "spingere", dur: 1.4, text: "Spingere di più" },
        { kind: "lungs", at: 15.22, word: "respirare", dur: 2.3, title: "Respirare meglio", sub: "non di più" },
        { kind: "stack", at: 18.77, dur: 7.4, title: "Se ti manca il fiato", items: ["Non fermarti", "Impara a respirare", "Impara a rallentare", "Ascolta il tuo corpo"], onAt: [0.1, 1.7, 3.4, 5.4] },
        { kind: "horizon", at: 27.0, word: "lontano", dur: 3.4, title: "Più lontano, meno sforzo", kmTo: 10 },
        { kind: "title", at: 34.1, word: "significa", dur: 3.4, lines: ["Correre bene =", "Andare lontano", "ed essere sostenibili"], accent: "lontano" },
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
      segments: [seg(0.0, 10.6), seg(26.25, 31.6), seg(33.72, 48.8), seg(50.45, 53.85), seg(61.2, 68.8), seg(74.25, 76.15), seg(112.05, 116.3), seg(119.0, 126.85)],
      hook: null,
      elements: [
        { kind: "title", at: 0, dur: 3.5, lines: ["Dal divano", "alla mezza maratona", "a 60 anni"], accent: "60" },
        { kind: "kinetic", at: 9.2, word: "miracolato.", dur: 1.15, words: ["MI HA", "MIRACOLATO"], accentIndex: 1 },
        { kind: "kinetic", at: 12.2, word: "secondo", dur: 2.6, words: ["IL SECONDO", "MIRACOLO"], accentIndex: 1 },
        { kind: "kinetic", at: 30.7, word: "era", dur: 2.9, words: ["PRESO", "IN TEMPO"], accentIndex: 1 },
        { kind: "stat", at: 36.8, word: "tre", dur: 2.4, value: "3 settimane", label: "ed è tornata a correre" },
        { kind: "kinetic", at: 41.5, word: "filosofia", dur: 1.25, words: ["UNA FILOSOFIA", "DI VITA"], accentIndex: 1 },
        { kind: "stat", at: 43.6, word: "60", dur: 3.2, value: "60 anni", label: "la stessa mezza maratona" },
        { kind: "kinetic", at: 49.0, word: "Daniela", dur: 3.7, words: ["LA DANIELA DI 60", "BATTE", "LA DANIELA DI 50"], accentIndex: 1 },
        { kind: "stat", at: 53.0, word: "20", dur: 1.8, value: "−20 min", label: "dieci anni dopo" },
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
];
