"""Didascalie dei reel YTCN 38 → output/ytcn38/<id>_didascalia.txt
Schema (REGOLE-MONTAGGIO): tema → approfondimento non detto nel video → conclusione → CTA con parola chiave → pochi hashtag.
"""
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output", "ytcn38")
os.makedirs(OUT, exist_ok=True)

C = {
"Y1_auto-efficiente": """Correre con meno fatica non è una questione di volontà: è una questione di efficienza.

Immagina due auto con lo stesso serbatoio. Una consuma tantissimo e si ferma dopo pochi chilometri; l'altra fa quattro volte la distanza senza affaticare il motore. Il tuo corpo funziona allo stesso modo: quando impari a correre nel modo giusto consuma meno energia alla stessa velocità e inizia a usare il carburante migliore, i grassi.

Nel video non lo dico, ma è il motivo per cui nel metodo Correre Naturale non partiamo mai dai chilometri o dai tempi: partiamo da come il corpo usa l'energia. Un corpo efficiente si affatica meno, si infortuna meno e migliora anche nelle gare brevi.

Vuoi rendere efficiente il tuo motore? Commenta EFFICIENTE e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #corsa #running #efficienza #metodocorrerenaturale""",

"Y2_flessibilita-metabolica": """La flessibilità metabolica è la capacità naturale del corpo di cambiare marcia tra grassi e zuccheri in base all'intensità.

A bassa intensità, come nella camminata o nella corsa lenta, il corpo dovrebbe usare soprattutto i grassi: la fonte di energia più abbondante e stabile che abbiamo. Più l'intensità sale, più passa ai carboidrati, che danno energia in fretta ma sono limitati.

Un dettaglio che non dico nel video: la maggior parte dei runner amatoriali corre quasi sempre a un'intensità in cui brucia soprattutto zuccheri, anche nelle uscite «facili». È per questo che le scorte finiscono presto e la fatica arriva prima del dovuto. La flessibilità metabolica si allena, e si allena soprattutto correndo lento nel modo giusto.

Vuoi insegnare al tuo corpo a usare il carburante giusto? Commenta CARBURANTE e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #flessibilitametabolica #corsalenta #running #metodocorrerenaturale""",

"Y3_a-cosa-serve": """A cosa serve, in pratica, la flessibilità metabolica a chi corre?

Ti permette di correre a lungo senza esaurire le scorte, riduce i crolli improvvisi e le crisi di fame in allenamento e in gara, migliora il recupero e ti rende meno dipendente dagli zuccheri esterni. In più è legata a una migliore salute metabolica anche fuori dalla corsa.

Quello che non dico nel video: questa capacità non si costruisce con un integratore o con un gel in più, ma con il modo in cui alleni il corpo ogni settimana. È una delle prime cose su cui lavoriamo nei percorsi Correre Naturale, prima ancora di parlare di ritmi.

Vuoi correre più a lungo senza crolli? Commenta RESISTENZA e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #resistenza #running #corsa #metodocorrerenaturale""",

"Y4_vero-segreto": """Il vero segreto per correre meglio non è spingere di più: è diventare economici.

Quando il corpo diventa efficiente trasforma meglio aria e cibo in energia utile: porta più ossigeno ai muscoli, usa i grassi come carburante principale, produce meno scorie e le smaltisce più in fretta. Risultato: meno fatica, meno stress, meno infortuni e prestazioni migliori, a parità di sforzo.

Nel video non lo dico, ma questo è esattamente il motivo per cui due runner con gli stessi chilometri a settimana possono avere risultati opposti: non conta solo quanto corri, conta come il tuo corpo gestisce il carburante che ha dentro.

Vuoi correre meglio a parità di sforzo? Commenta SEGRETO e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #correremeglio #running #corsa #metodocorrerenaturale""",

"Y5_corri-lento": """Per correre più a lungo e più forte devi prima imparare a correre più lentamente.

Non parlo di correre piano tanto per fare: parlo di un lento attivo, consapevole e di qualità, quello che permette al corpo di riprendersi la capacità che la natura gli ha dato. La maggior parte delle persone corre sempre troppo forte, anche nei giorni in cui dovrebbe rigenerarsi, e così il corpo non migliora: accumula solo stress.

Quello che non dico nel video: «lento» non è un ritmo fisso. Per qualcuno è una camminata veloce, per altri è una corsa che a un osservatore esterno sembra comoda. Lo decide il tuo corpo, non il cronometro.

Vuoi imparare a correre lento nel modo giusto? Commenta LENTO e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #corsalenta #motoreaerobico #running #metodocorrerenaturale""",

"Y6_naso-bianco": """Non servono orologi, cardiofrequenzimetri o tabelle complicate per sapere se stai correndo all'intensità giusta.

Lo strumento principale che usiamo nel metodo Correre Naturale è la respirazione nasale: se riesci a respirare solo dal naso, in modo fluido e senza sforzo, sei nel range aerobico giusto. Appena senti il bisogno di aprire la bocca, stai chiedendo troppo al tuo corpo. E il «naso bianco» è il passo successivo: respirare dal naso facendo meno rumore possibile.

Nel video non lo dico, ma all'inizio quasi tutti devono rallentare molto, e spesso camminare, per restare con il naso. È normale: è il corpo che ti dice da dove ripartire.

Vuoi allenarti ascoltando il tuo corpo? Commenta NASO e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #respirazionenasale #nasobianco #running #metodocorrerenaturale""",

"Y7_sforzo-percepito": """Su una scala da 1 a 10, la corsa a bassa intensità dovrebbe stare tra 3 e 4.

Non devi mai avere la sensazione di essere in difficoltà: devi sentire di poter correre così praticamente all'infinito. Più sviluppi questa capacità di ascolto, più il corpo diventa efficiente e più sarà lui a guidarti, senza bisogno di numeri o dispositivi esterni.

Quello che non dico nel video: lo sforzo percepito funziona insieme alla respirazione nasale. Se il naso regge ma lo sforzo ti sembra un 6, qualcosa non torna: quasi sempre è la tecnica o la stanchezza accumulata. Due strumenti semplici che si controllano a vicenda.

Vuoi che sia il tuo corpo a guidarti? Commenta ASCOLTO e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #sforzopercepito #running #corsa #metodocorrerenaturale""",

"Y8_cinque-strategie": """Oltre alla corsa a bassa intensità, ci sono 5 strategie per diventare più efficienti.

1. Aumentare gradualmente il volume, con criterio.
2. Inserire attività complementari come bici e nuoto, che stimolano il sistema aerobico senza sovraccaricare articolazioni e muscoli.
3. Lavorare su forza e mobilità: un corpo forte e libero consuma meno energia per restare stabile.
4. Curare alimentazione e recupero: senza carburante giusto e senza recupero la fatica si accumula.
5. Camminare: molti la considerano una sconfitta, in realtà è uno strumento potentissimo per resistenza, carico e base.

Nel video non lo dico, ma l'ordine conta: senza una base di corsa lenta e camminata, aggiungere volume o forza serve a poco. Per questo nei percorsi Correre Naturale le strategie si inseriscono una alla volta.

Vuoi un piano che metta insieme tutte le strategie? Commenta STRATEGIE e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #allenamento #running #corsa #metodocorrerenaturale""",

"Y9_costanza": """C'è una cosa che vale più della corsa lenta, del programma perfetto e di qualsiasi tecnica: la costanza.

Non importa cosa fai oggi o domani. Conta cosa fai ogni giorno, ogni settimana, ogni mese e ogni anno. La corsa, quella vera, si costruisce nel tempo: più tempo passi a correre nel modo giusto, più il corpo si trasforma, più veloce, più leggero, più elastico e più efficiente. Con meno sforzo.

Quello che non dico nel video: la costanza non nasce dalla forza di volontà, nasce da un allenamento che puoi sostenere. Se ogni uscita ti lascia distrutto, prima o poi salti. Se ogni uscita ti lascia bene, continui.

Vuoi una routine che regga nel tempo? Commenta COSTANZA e ti mando tutte le info sui percorsi di coaching personalizzati.

#correrenaturale #costanza #running #corsa #metodocorrerenaturale""",
}

for k, v in C.items():
    open(os.path.join(OUT, f"{k}_didascalia.txt"), "w", encoding="utf-8").write(v.strip() + "\n")
print(len(C), "didascalie in", OUT)
