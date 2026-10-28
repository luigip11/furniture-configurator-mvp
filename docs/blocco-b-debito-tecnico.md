# Blocco B — Debito tecnico da affrontare dopo la demo

Interventi rimandati di proposito a dopo il feedback del committente, emersi dall'analisi del 28 ottobre 2026. Non cambiano quello che il committente vede, ma rendono il progetto più solido da far evolvere. Il feedback potrebbe cambiare proprio queste parti (catalogo, pannello proprietà), quindi conviene rivederle prima di iniziare.

Già fatto prima della demo, come contesto:

- **Area admin protetta** (`d454194`): HTTP Basic Auth con `ADMIN_USERNAME`/`ADMIN_PASSWORD`; le cancellazioni passano dalle API server.
- **Errori non più silenziosi** (`a53c049`): banner di errore in admin, pagine di errore e 404, avviso sui codici sconosciuti, limite alla cronologia annulla/ripeti.

## Ordine consigliato

| # | Intervento | Dipende da | Rischio |
|---|------------|------------|---------|
| B0 | Schema DB e setup nel repo | — | Basso |
| B1 | Dipendenze tra livelli | — | Basso |
| B2 | Componenti troppo grandi | B1 | Medio |
| B3 | Dominio legato ai codici testuali | B0, feedback | Alto |
| B4 | Minori | — | Basso |

Dopo ogni punto: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:python`, `npm run build` e `npm run test:browser`. Per la suite browser serve Chromium di Playwright, oppure Chrome tramite `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

---

## B0 — Schema DB e setup nel repo

**Problema.** In [`supabase/`](../supabase/) ci sono solo due script occasionali. Tabelle, chiavi esterne, regole RLS e configurazione del bucket `product-assets` esistono solo nel progetto Supabase. Per questo non si può ricreare l'ambiente, né verificare la sicurezza leggendo il codice. Il [`README.md`](../README.md) è ancora quello generato da create-next-app.

Stato verificato il 28 ottobre 2026, da riportare nello schema esportato:

- RLS attiva su `products` e `categories`.
- Sola lettura pubblica: `Public read published products` (`is_published = true`) e `Public read categories`.
- Nessuna policy su `storage.objects`: le scritture passano solo dagli URL firmati dal server.

- [ ] Esportare lo schema `public`: tabelle, vincoli, indici, RLS e policy. Per esempio con `supabase db dump --schema public`, oppure `pg_dump --schema-only`. Salvarlo in `supabase/schema.sql`.
- [ ] Esportare le policy di `storage.objects` e la configurazione del bucket `product-assets`: pubblico, limiti di dimensione e MIME.
- [ ] Documentare il comportamento di `products.category_id` alla cancellazione di una categoria (RESTRICT, SET NULL o CASCADE). L'API `DELETE` delle categorie gestisce già il caso RESTRICT, con il codice `23503`.
- [ ] Riscrivere il README:
  - variabili d'ambiente, incluse `ADMIN_*`, password di almeno 12 caratteri;
  - avvio in locale;
  - comandi di test;
  - deploy: ogni push su `main` va in produzione su Vercel; le variabili si caricano con `tools/sync_vercel_env.mjs`.

**Verifica.** Un nuovo progetto Supabase creato da `schema.sql` avvia l'app senza passaggi manuali non documentati.

---

## B1 — Dipendenze tra livelli (Clean Architecture)

**Problema.** Il dominio dipende dalla cartella dello store, e il file dei tipi contiene anche logica.

- [`src/lib/configurator/composition-constraints.ts`](../src/lib/configurator/composition-constraints.ts) importa da `src/store/configurator-calculations.ts`. Quel file (332 righe) contiene solo logica pura di dominio, ma si trova in `store/`.
- [`src/types/configurator.ts`](../src/types/configurator.ts) (358 righe) mescola tipi, costanti di default, liste di opzioni per la UI e funzioni come `getTechnicalVariantKey` e `getDoorConfigurationSummary`.

- [ ] Spostare `src/store/configurator-calculations.ts` in `src/lib/configurator/`. Aggiornare gli import in `configurator-store.ts`, `composition-constraints.ts`, `ConfiguratorScene.tsx` e nei test `configurator-calculations.test.ts` e `technical-coherence.test.ts`.
- [ ] Lasciare in `src/types/configurator.ts` solo i tipi. Spostare costanti, opzioni e funzioni in moduli di `src/lib/configurator/`, per esempio `defaults.ts`, `options.ts` e `door-configuration.ts`.

**Verifica.** Nessun file in `src/lib` o `src/types` importa da `src/store`, `src/components` o `src/app`:

```bash
grep -rnE "from ['\"](@/|\.\./)+(store|components|app)" src/lib src/types
```

---

## B2 — Componenti troppo grandi

**Problema.** Diversi componenti superano di molto la dimensione indicata in `AGENTS.md` e mescolano UI, stato e chiamate di rete.

| File | Righe | Note |
|------|-------|------|
| [`ConfiguratorScene.tsx`](../src/components/configurator/ConfiguratorScene.tsx) | 898 | `SceneContent` con 5 effetti e la logica di trascinamento |
| [`ProductAdmin.tsx`](../src/components/admin/ProductAdmin.tsx) | 845 | Un solo componente da circa 680 righe, con 11 `useState` e chiamate `fetch` dirette |
| [`ProductPropertiesPanel.tsx`](../src/components/configurator/ProductPropertiesPanel.tsx) | 583 | Un solo componente da circa 520 righe |
| [`DoorConfigurationDialog.tsx`](../src/components/configurator/DoorConfigurationDialog.tsx) | 513 | Secondario |
| [`ProductModel.tsx`](../src/components/configurator/ProductModel.tsx) | 499 | Secondario: quote e frecce si possono separare |

Procedere in ordine di copertura dei test, dal più protetto al meno protetto:

- [ ] **`ProductAdmin`** (coperto dai test browser su salvataggio, upload, pubblicazione e cancellazione):
  - separare elenco prodotti, form e campi;
  - spostare le chiamate API (salvataggio e pubblicazione) in un client dedicato in `src/lib/admin/`, come già fatto per `admin-delete-client.ts`;
  - spostare lo stato del form in un hook.
- [ ] **`ProductPropertiesPanel`**: una sezione per pannello (proprietà, posizione, finiture). L'intestazione `CollapsiblePanelHeader` è già separata.
- [ ] **`ConfiguratorScene`**, per ultimo:
  - prima aggiungere test sul trascinamento (gesto singolo in cronologia, vincoli a filo parete o fronte, rilascio fuori scena);
  - poi estrarre il trascinamento in un hook;
  - infine portare in moduli dedicati di `src/lib/configurator/` le funzioni pure di camera e ingombro (`getMaxCameraDistance`, `getFootprintSummary`, `getSceneFocus`).

**Verifica.** Nessun cambiamento visibile. Tutti i test passano, e il configuratore va provato a mano su desktop e mobile prima del merge.

---

## B3 — Dominio legato ai codici testuali

**Problema.** Varianti, gruppi del catalogo e distinta tecnica vengono dedotti dal testo di `code` e del nome prodotto.

- [`product-variants.ts`](../src/lib/configurator/product-variants.ts) riconosce le varianti dai suffissi del codice, refusi compresi: `_CON_2_FIANCHIA_VISTA`, `FIANCOA`.
- Lo stesso file assegna i gruppi del catalogo cercando parole chiave nel nome ("colonna", "pensile", "lavatrice"…) e ignora `category_id`.
- Il catalogo tecnico generato (`generated-technical-catalog.ts`, 55 codici) e le formule parametriche (`parametric-bom.ts`) sono indicizzati per codice.

Se un codice viene rinominato, il modulo perde distinta e varianti. Oggi il form admin avvisa quando il codice non è riconosciuto (`src/lib/admin/product-code-check.ts`): è una mitigazione, non una soluzione.

- [ ] Rivedere col committente la struttura del catalogo emersa dal feedback, prima di progettare le colonne.
- [ ] Aggiungere a `products` colonne esplicite: per esempio `family_key` (famiglia di varianti), `variant_key` (lato a vista o fianchi) e `technical_key` (collegamento alla distinta, non modificabile dall'admin).
- [ ] Usare `category_id` per i gruppi del catalogo al posto delle parole chiave.
- [ ] Scrivere una migrazione che popoli le nuove colonne con la logica attuale, eseguirla in staging, verificare che nessun prodotto cambi gruppo o variante e poi portarla in produzione.
- [ ] Aggiornare form e validazione admin (`product-validation.ts`) con i nuovi campi.

**Verifica.** Un test confronta, per ogni prodotto del catalogo, gruppo, variante e distinta prima e dopo la migrazione: devono coincidere.

---

## B4 — Minori

- [ ] **Segreto dedicato per le ricevute di upload.** Oggi le firma `SUPABASE_SERVICE_ROLE_KEY` (`getUploadReceiptSecret` in `src/lib/admin/product-asset-server.ts`). Introdurre `UPLOAD_RECEIPT_SECRET` e aggiungerlo a `tools/sync_vercel_env.mjs`. Cambiandolo, le ricevute in corso (valide 24 ore) smettono di funzionare.
- [ ] **Prestazioni del trascinamento**, solo se in prova si notano rallentamenti. A ogni movimento lo store esegue `JSON.stringify` dello snapshot completo (`commit` in `configurator-store.ts`) e la validazione della composizione. Misurare prima di ottimizzare.
- [ ] **Avviso `MODULE_TYPELESS_PACKAGE_JSON` nei test Node.** Valutare `"type": "module"` in `package.json`, verificando l'impatto su config e script in `tools/`.
