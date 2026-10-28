# Piano di completamento

Login e salvataggio della sessione restano esclusi per scelta concordata.

## Fase 3 — Riepilogo e richiesta preventivo

- Prodotti senza prezzo identificati nel catalogo e nel riepilogo. Zero è un prezzo valido.
- Totale parziale quando almeno un modulo è senza prezzo o richiede quotazione personalizzata. Gli importi da definire non vengono sommati come zeri né presentati come inclusi.
- Prezzi catalogo indicativi; le varianti usano il prezzo del proprio record. Spostamento e rotazione non cambiano il prezzo.
- Quote diverse dal catalogo, top e ante aggiunte, o configurazioni ante diverse dalle opzioni iniziali richiedono una quotazione. Non vengono inventate formule o maggiorazioni senza listino approvato.
- Modulo contatti con fotografia della composizione: codice, variante, misure, posizione, top/ante e stato economico. La validazione conserva il modulo in caso di errore.
- Per decisione successiva del committente, **l'invio è soltanto dimostrativo**: nessun servizio email, nessuna API di invio e nessuna scrittura persistente. Anche la conferma e l'eventuale file JSON scaricato indicano esplicitamente la simulazione. I contatti restano solo in memoria fino alla chiusura del modulo.
- Admin → Configuratore: campo destinatario disabilitato, lucchetto e indicazione di funzionalità futura. Non è un'impostazione operativa né persistita.
- Distinzione fra errore di caricamento, catalogo vuoto e ricerca senza risultati; Riprova aggiorna i dati tramite refresh del router senza ricaricare l'intera pagina.
- Traduzioni IT/EN/FR per tutti i nuovi testi.

Per attivare l'invio reale serviranno destinatario, provider e credenziali server, validazione lato server dei dati e del catalogo, gestione degli errori di consegna e protezione dagli abusi. Non è attivo un finto endpoint che confermi richieste mai consegnate.

### Collaudo manuale

1. Aggiungere un prodotto senza prezzo: verificare il messaggio dedicato e Totale parziale.
2. Aggiungere un prodotto con prezzo: il totale parziale include solo gli importi disponibili. Un prezzo pari a zero resta valido.
3. Su un modulo parametrico con prezzo, cambiare una misura o aggiungere top/ante: verificare Personalizzazione da quotare. Ripristinare le scelte iniziali per recuperare il riferimento catalogo.
4. Aprire Richiedi preventivo: verificare composizione, misure e opzioni. Usare solo contatti di prova.
5. Provare contatti non validi, poi correggerli e confermare la simulazione. Verificare che la conferma dichiari il mancato invio.
6. Scaricare il riepilogo demo: confrontare i moduli e verificare `mode: demo`. Chiudere e riaprire: i contatti non devono restare compilati.
7. Verificare il modulo da tastiera, Escape e ripristino del focus; ripetere su viewport mobile.
8. In Admin → Configuratore verificare il campo email disabilitato e il lucchetto.

Test automatici: `npm test`, `npm run test:python`, `npm run typecheck`, `npm run lint`, `npm run build`. Le prove browser di errore, catalogo vuoto e prezzo zero usano un catalogo sintetico isolato, senza alterare Supabase.

## Fase 4 — Interfaccia e admin

- Header senza sovrapposizioni a 320, 360, 390, 768 e 1440 px, in IT/EN/FR e nelle due viste.
- Wizard ante in un dialog nativo: sfondo non interattivo, focus confinato, ritorno al pulsante di apertura, Escape e chiusura sullo sfondo. Ogni passaggio porta il focus al proprio titolo. La bozza si applica solo alla conferma.
- Impostazioni della scena dichiarate come preferenze del browser corrente; focus visibile sui toggle da tastiera. Il campo email futuro della fase 3 rimane disabilitato.
- Validazione condivisa fra form e API per prodotti e categorie: quote entro i limiti geometrici, spessore positivo compatibile, prezzo nullo o non negativo (zero valido), URL HTTP(S) senza credenziali, UUID, testo limitato, slug e ordine intero. I campi extra e i JSON eccessivi o malformati sono rifiutati.
- File selezionati conservati solo in memoria fino al salvataggio. Annullamento, sostituzione della selezione e cambio prodotto non avviano upload. Il form rimane bloccato durante il salvataggio.
- Upload diretto a Supabase con URL firmato e percorso univoco, senza far transitare i byte del file dalle funzioni Vercel. Restano i limiti applicativi di 8 MB per immagini, 80 MB per modelli e 180 MB per tecnici, subordinati ai limiti effettivi del servizio Storage. Gli errori di quota o rete non vengono trattati come successi.
- Controlli di estensione, dimensione e firma iniziale del contenuto; GLB v2 con lunghezza coerente e GLTF locale autosufficiente. I controlli non certificano validità CAD, integrità completa del documento o assenza di malware.
- Ricevute firmate e verifica lato server di percorso, campo, dimensione effettiva e intestazione del file prima dell'associazione al prodotto.
- Un fallimento noto del salvataggio compensa i nuovi upload. La pulizia controlla tutti i prodotti con paginazione e tutti i campi asset, includendo URL firmati o con query, e non cancella quelli già associati. Non rimuove i vecchi file sostituiti o condivisi.
- Un esito di salvataggio incerto conserva i file e chiede di verificare l'elenco prodotti prima di riprovare. Chiusura del browser, interruzioni di rete o pulizia fallita possono lasciare oggetti da revisionare: non viene promessa una transazione atomica tra database e storage.

### Test di regressione ripetibili

```bash
npm ci
npx playwright install chromium
npm test
npm run test:python
npm run typecheck
npm run lint
npm run build
npm run test:browser
```

La suite browser avvia una copia temporanea dell'app e un backend Supabase simulato in memoria con credenziali fittizie. Blocca richieste verso host esterni e non usa il database reale. Comprende header responsive, tastiera e bozza del wizard, preferenze indipendenti, selezione/annullamento file, upload diretto di 6 MB, errore di upload, errore di salvataggio con pulizia, risposta persa senza perdita dell'asset associato e validazione delle API.

Per usare Chromium già presente nell'ambiente cloud:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

Il collaudo mobile è su viewport Chromium; non sostituisce una prova su dispositivi fisici Safari/iOS o Android.

### Inventario degli asset storici

`npm run audit:assets` legge `.env.local`/`.env` se presenti e produce un report JSON di sola lettura, senza opzioni di cancellazione. Servono le stesse variabili Supabase server dell'app. Nell'ambiente cloud con proxy: `NODE_USE_ENV_PROXY=1 npm run audit:assets`.

Verifica del 27 ottobre 2026: bucket `product-assets` pubblico, senza limiti specifici di dimensione o MIME impostati a livello bucket; il limite globale del piano non è stato modificato né dedotto dal valore nullo. Inventariati 43 oggetti: 3 non risultano referenziati dai campi asset dei prodotti, tutti più vecchi di 24 ore. Nessun oggetto è stato cancellato. Il report non conosce riferimenti esterni al catalogo: i candidati richiedono revisione prima di una pulizia manuale.

### Collaudo manuale della fase 4

1. Verificare header e cambio vista su schermo piccolo nelle tre lingue.
2. Aprire Configura anta: navigare con Tab/Shift+Tab, selezionare opzioni e cambiare passaggio. Escape o chiusura devono annullare la bozza e restituire il focus al pulsante di apertura.
3. Confermare l'anta e riaprire: le scelte confermate devono restare applicate.
4. In Admin → Configuratore leggere l'ambito locale delle preferenze; un altro browser deve mantenere i propri valori.
5. Selezionare un file valido nel form prodotti e annullare: nessun caricamento deve partire. Un file incompatibile deve mostrare un errore.
6. Provare scritture, upload e fallimenti esclusivamente nel backend isolato della suite o in uno staging dedicato. Non usare prodotti reali per forzare errori e verificare cancellazioni.
