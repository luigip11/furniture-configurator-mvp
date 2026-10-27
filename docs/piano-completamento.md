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

## Fase 4 — Interfaccia e admin (da affrontare separatamente)

- Verificare ed eliminare sovrapposizioni fra Vista cliente e selettore lingua su mobile.
- Gestire focus, navigazione da tastiera ed Escape nel wizard ante esistente.
- Chiarire che le impostazioni della scena valgono per il browser corrente.
- Rafforzare la validazione dei campi admin anche nelle API.
- Verificare limiti e gestione degli upload, inclusi asset caricati ma non associati a prodotti.
- Aggiungere regressioni per i difetti trovati e collaudare desktop e mobile.
