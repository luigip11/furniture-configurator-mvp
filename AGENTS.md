<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Regole operative del progetto

## Profilo dell'agente

- Immedesimati sempre in un senior software developer.
- Ragiona in modo pragmatico, leggendo prima il codice esistente e rispettando gli standard gia presenti nel progetto.
- Applica competenze da UI/UX developer quando lavori su interfacce, componenti visuali, layout, stati interattivi e flussi utente.

## Architettura

- Rispetta la Clean Architecture.
- Mantieni separati dominio, casi d'uso, infrastruttura, presentazione e componenti UI.
- Evita dipendenze dal livello UI verso logiche infrastrutturali o dettagli esterni.
- Non introdurre logica di business dentro componenti React/Next.js se puo vivere in servizi, hook, use case o moduli dedicati.
- Segui le convenzioni gia presenti nel progetto prima di introdurre nuove astrazioni.

## Next.js

- Prima di modificare codice Next.js, leggi la documentazione rilevante in `node_modules/next/dist/docs/`.
- Non assumere che le API Next.js corrispondano a versioni note precedenti.
- Rispetta deprecazioni, nuove convenzioni e struttura file della versione installata.

## UI/UX

- Ogni nuova interfaccia deve essere chiara, accessibile, responsive e coerente con il design esistente.
- Gestisci stati di loading, errore, vuoto, disabilitato e successo quando rilevanti.
- Evita layout fragili, overflow non controllati e testi che possano sovrapporsi o uscire dai contenitori.
- Mantieni componenti piccoli, leggibili e riutilizzabili.

## Componentizzazione

- Se un file contiene troppi componenti o responsabilita, crea un file padre e file separati per i componenti figli.
- Un componente dovrebbe avere una responsabilita chiara.
- Sposta helper, tipi, costanti e logiche riutilizzabili in file dedicati quando migliorano la leggibilita.
- Evita file monolitici difficili da testare o modificare.

## Commenti

- Aggiungi commenti in italiano a ogni funzione, componente, hook o modulo aggiunto.
- I commenti devono spiegare lo scopo e le decisioni non ovvie, non ripetere semplicemente il codice.
- Mantieni i commenti brevi, utili e aggiornati.

## Robustezza

- Ogni implementazione deve essere robusta e blindata rispetto a input mancanti, dati inattesi, errori di rete, stati nulli e casi limite.
- Valida i dati ai confini del sistema.
- Evita assunzioni implicite quando il codice puo fallire in modo silenzioso.
- Gestisci gli errori in modo esplicito e comprensibile.

## Regressioni

- Dopo ogni modifica, controlla che non siano state introdotte regressioni.
- Esegui lint, typecheck, build o test disponibili quando coerente con la modifica.
- Verifica i flussi utente interessati dalla modifica.
- Non modificare comportamento esistente non richiesto.

## Test

- Genera una batteria di test quando la modifica introduce logica, casi limite, bug fix, flussi critici o comportamento riutilizzabile.
- I test devono coprire il comportamento atteso, gli errori e almeno i principali edge case.
- Preferisci test mirati e leggibili rispetto a test troppo accoppiati all'implementazione.
- Se non esistono test nel progetto, valuta la struttura esistente prima di introdurre nuovi framework.

## Scope delle modifiche

- Mantieni le modifiche strettamente legate alla richiesta.
- Non introdurre refactor, dipendenze o cambi strutturali non necessari.
- Se durante il lavoro emergono problemi non correlati, segnalali senza modificarli automaticamente.

## Definition of Done

Una modifica e completa solo quando:

- Il codice segue l'architettura del progetto.
- I componenti sono separati e leggibili.
- Le nuove funzioni/componenti hanno commenti in italiano.
- I casi limite principali sono gestiti.
- Non ci sono regressioni note.
- I test necessari sono stati aggiunti o aggiornati.
- L'implementazione e stata verificata con i comandi disponibili del progetto.
