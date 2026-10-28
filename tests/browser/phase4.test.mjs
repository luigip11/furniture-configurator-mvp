import assert from "node:assert/strict";
import { before, after, beforeEach, test } from "node:test";
import {
  ADMIN_TEST_CREDENTIALS,
  startBrowserEnvironment,
  testPage,
} from "./environment.mjs";

let environment;
before(
  async () => {
    environment = await startBrowserEnvironment();
  },
  { timeout: 120000 },
);
after(async () => {
  await environment?.close();
});
beforeEach(() => environment.fixture.reset());

// Compila il minimo necessario al form admin, sempre con dati sintetici.
async function fillProduct(page, name = "Prodotto prova") {
  await page.getByLabel("Nome IT", { exact: true }).fill(name);
  for (const [label, value] of [
    ["Larghezza mm", "700"],
    ["Altezza mm", "880"],
    ["Profondità mm", "665"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
}

// Selezionare il file attende solo la validazione locale, non un caricamento remoto.
async function selectPdf(page, large = false) {
  const buffer = large
    ? Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(6 * 1024 * 1024)])
    : Buffer.from("%PDF-1.7\nTest");
  await page
    .locator("#asset-upload-technical_file_url")
    .setInputFiles({ name: "schema.pdf", mimeType: "application/pdf", buffer });
  await page
    .getByText("File selezionato: schema.pdf", { exact: true })
    .waitFor();
}

test(
  "header senza sovrapposizioni a 320–1440 px in IT/EN/FR e vista cliente",
  { timeout: 60000 },
  async (t) => {
    const { page } = await testPage(environment, t);
    await page.goto(environment.origin + "/configuratore", {
      waitUntil: "networkidle",
    });
    for (const width of [320, 360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const language of ["Italiano", "English", "Français"]) {
        await page.getByRole("button", { name: language, exact: true }).click();
        for (const preview of [false, true]) {
          if (preview)
            await page
              .locator("header")
              .first()
              .getByRole("button")
              .first()
              .click();
          const geometry = await page
            .locator("header")
            .first()
            .evaluate((header) => {
              const controls = [...header.querySelectorAll("button,a")].map(
                (element) => {
                  const r = element.getBoundingClientRect();
                  return {
                    left: r.left,
                    right: r.right,
                    top: r.top,
                    bottom: r.bottom,
                  };
                },
              );
              return {
                controls,
                overflow: document.documentElement.scrollWidth > innerWidth,
              };
            });
          assert.equal(geometry.overflow, false, `${width} ${language}`);
          geometry.controls.forEach((a, index) =>
            geometry.controls
              .slice(index + 1)
              .forEach((b) =>
                assert.ok(
                  a.right <= b.left + 0.5 ||
                    b.right <= a.left + 0.5 ||
                    a.bottom <= b.top + 0.5 ||
                    b.bottom <= a.top + 0.5,
                  `${width} ${language}: overlapping controls`,
                ),
              ),
          );
          if (preview)
            await page
              .locator("header")
              .first()
              .getByRole("button")
              .first()
              .click();
        }
      }
    }
  },
);

test(
  "wizard ante: focus confinato, bozza annullabile, conferma, Escape e backdrop",
  { timeout: 60000 },
  async (t) => {
    const { page } = await testPage(environment, t);
    await page.goto(environment.origin + "/configuratore", {
      waitUntil: "networkidle",
    });
    await page.getByRole("button", { name: "Pensili", exact: false }).click();
    await page.getByRole("button", { name: "Aggiungi", exact: true }).click();
    const opener = page.getByRole("button", {
      name: "Configura anta",
      exact: true,
    });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Configurazione anta" });
    await dialog.waitFor();
    await page.waitForFunction(() => document.activeElement?.tagName === "H3");
    for (let index = 0; index < 30; index++) {
      await page.keyboard.press(index % 2 ? "Shift+Tab" : "Tab");
      assert.equal(
        await page.evaluate(() => !!document.activeElement.closest("dialog")),
        true,
      );
    }
    await dialog.getByRole("button", { name: "2 ante", exact: true }).click();
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    assert.equal(
      await opener.evaluate((button) => button === document.activeElement),
      true,
    );
    await opener.click();
    assert.equal(
      await dialog
        .getByRole("button", { name: "1 anta", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await dialog.getByRole("button", { name: "2 ante", exact: true }).click();
    await dialog.getByRole("button", { name: "Avanti", exact: true }).click();
    await page.waitForFunction(
      () => document.activeElement?.textContent === "Tipo posa",
    );
    await dialog.getByRole("button", { name: /5 Riepilogo/ }).click();
    await dialog
      .getByRole("button", { name: "Aggiungi alla distinta", exact: true })
      .click();
    await dialog.waitFor({ state: "detached" });
    assert.equal(
      await opener.evaluate((button) => button === document.activeElement),
      true,
    );
    await opener.click();
    assert.equal(
      await dialog
        .getByRole("button", { name: "2 ante", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.mouse.click(2, 2);
    await dialog.waitFor({ state: "detached" });
    await page.setViewportSize({ width: 390, height: 844 });
    await opener.click();
    const bounds = await dialog.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.width <= 390);
    await page.keyboard.press("Escape");
  },
);

test("preferenze dichiarate locali e indipendenti fra due browser", async (t) => {
  const { page } = await testPage(environment, t);
  await page.goto(environment.origin + "/admin/configuratore", {
    waitUntil: "networkidle",
  });
  await page
    .getByText(
      "Queste impostazioni sono salvate solo nel browser corrente. Non modificano le impostazioni degli altri utenti o dispositivi.",
      { exact: true },
    )
    .waitFor();
  await page
    .getByText("Movimento libero in modalità Aperta", { exact: true })
    .click();
  await page.getByRole("checkbox").first().focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.getByRole("checkbox").first().isChecked(), true);
  const { page: independent } = await testPage(environment, t);
  await independent.goto(environment.origin + "/admin/configuratore", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await independent.getByRole("checkbox").first().isChecked(),
    false,
  );
  assert.equal(
    await page.locator("#future-quote-recipient").isDisabled(),
    true,
  );
});

test("selezione e annullamento non caricano file; file falsi sono rifiutati localmente", async (t) => {
  const { page } = await testPage(environment, t);
  await page.goto(environment.origin + "/admin/prodotti", {
    waitUntil: "networkidle",
  });
  await selectPdf(page);
  await page.getByRole("button", { name: "Annulla", exact: true }).click();
  assert.equal(
    await page
      .getByText("File selezionato: schema.pdf", { exact: true })
      .count(),
    0,
  );
  assert.equal(environment.fixture.state.objects.size, 0);
  assert.equal(
    environment.fixture.state.calls.filter(
      (call) => !["GET", "HEAD"].includes(call.method),
    ).length,
    0,
  );
  await page.locator("#asset-upload-preview_image_url").setInputFiles({
    name: "fake.png",
    mimeType: "image/png",
    buffer: Buffer.from("<html>not PNG</html>"),
  });
  await page.getByRole("alert").filter({ hasText: "contenuto" }).waitFor();
  assert.equal(environment.fixture.state.objects.size, 0);
});

test(
  "upload oltre 4,5 MB va direttamente a Storage e i file associati non sono rimossi",
  { timeout: 60000 },
  async (t) => {
    const { page, context } = await testPage(environment, t);
    await page.goto(environment.origin + "/admin/prodotti", {
      waitUntil: "networkidle",
    });
    await fillProduct(page);
    await page.getByLabel("Prezzo opzionale", { exact: true }).fill("0");
    await selectPdf(page, true);
    const prepared = page.waitForResponse(
      (response) =>
        response.url() === environment.origin + "/api/admin/product-assets" &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Crea prodotto", exact: true })
      .click();
    const preparation = await prepared;
    const upload = await preparation.json();
    await page
      .getByRole("heading", { name: "Prodotto prova", exact: true })
      .waitFor();
    assert.ok(preparation.request().postDataBuffer().length < 2000);
    assert.ok(
      environment.fixture.state.calls.some(
        (call) => call.method === "PUT" && call.bytes > 5 * 1024 * 1024,
      ),
    );
    assert.equal(environment.fixture.state.objects.size, 1);
    assert.equal(
      environment.fixture.state.products.find(
        (product) => product.name_it === "Prodotto prova",
      ).price,
      0,
    );
    assert.ok(!JSON.stringify(upload).includes("fixture-service-key"));
    const cleanup = await context.request.delete(
      environment.origin + "/api/admin/product-assets",
      { data: { receipts: [upload.receipt] } },
    );
    assert.equal(cleanup.status(), 200);
    assert.equal(environment.fixture.state.objects.size, 1);
  },
);

test(
  "salvataggio rifiutato pulisce nuovi file e conserva il form per riprovare",
  { timeout: 60000 },
  async (t) => {
    const { page } = await testPage(environment, t);
    await page.goto(environment.origin + "/admin/prodotti", {
      waitUntil: "networkidle",
    });
    await fillProduct(page, "Prodotto da riprovare");
    await selectPdf(page);
    environment.fixture.state.failWrite = true;
    await page
      .getByRole("button", { name: "Crea prodotto", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Impossibile salvare" })
      .waitFor();
    assert.equal(environment.fixture.state.objects.size, 0);
    assert.equal(
      await page.getByLabel("Nome IT", { exact: true }).inputValue(),
      "Prodotto da riprovare",
    );
    await page
      .getByText("File selezionato: schema.pdf", { exact: true })
      .waitFor();
    environment.fixture.state.failWrite = false;
    await page
      .getByRole("button", { name: "Crea prodotto", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Prodotto da riprovare", exact: true })
      .waitFor();
    assert.equal(environment.fixture.state.objects.size, 1);
  },
);

test("upload fallito compensa anche un oggetto parzialmente ricevuto", async (t) => {
  const { page } = await testPage(environment, t);
  await page.goto(environment.origin + "/admin/prodotti", {
    waitUntil: "networkidle",
  });
  await fillProduct(page);
  await selectPdf(page);
  environment.fixture.state.failUpload = true;
  await page
    .getByRole("button", { name: "Crea prodotto", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Upload non riuscito" })
    .waitFor();
  assert.equal(environment.fixture.state.objects.size, 0);
  assert.equal(environment.fixture.state.products.length, 1);
});

test(
  "risposta di salvataggio persa non cancella un file già associato",
  { timeout: 60000 },
  async (t) => {
    const { page, context } = await testPage(environment, t);
    await page.goto(environment.origin + "/admin/prodotti", {
      waitUntil: "networkidle",
    });
    await fillProduct(page, "Prodotto con risposta persa");
    await selectPdf(page);
    await context.route(
      environment.origin + "/api/admin/products",
      async (route) => {
        await route.fetch();
        await route.abort("failed");
      },
      { times: 1 },
    );
    await page
      .getByRole("button", { name: "Crea prodotto", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Esito del salvataggio non verificabile" })
      .waitFor();
    assert.equal(environment.fixture.state.objects.size, 1);
    assert.equal(environment.fixture.state.products.length, 2);
    assert.equal(
      environment.fixture.state.calls.filter((call) => call.method === "DELETE")
        .length,
      0,
    );
    await page.reload({ waitUntil: "networkidle" });
    await page
      .getByRole("heading", {
        name: "Prodotto con risposta persa",
        exact: true,
      })
      .waitFor();
  },
);

test("API rifiutano quote, URL, categorie e ricevute non validi prima delle mutazioni", async (t) => {
  const { context } = await testPage(environment, t);
  const good = {
    name_it: "Base",
    width_mm: 700,
    height_mm: 880,
    depth_mm: 665,
    is_published: false,
  };
  for (const patch of [
    { width_mm: -1 },
    { price: -1 },
    { width_mm: "700" },
    { id: "override" },
    { model_url: "javascript:alert(1)" },
  ]) {
    const response = await context.request.post(
      environment.origin + "/api/admin/products",
      { data: { ...good, ...patch } },
    );
    assert.equal(response.status(), 400);
  }
  assert.equal(
    (
      await context.request.patch(
        environment.origin + "/api/admin/products/bad-id",
        { data: good },
      )
    ).status(),
    400,
  );
  assert.equal(
    (
      await context.request.patch(
        environment.origin +
          "/api/admin/products/11111111-1111-4111-8111-111111111111/publish",
        { data: { is_published: "false" } },
      )
    ).status(),
    400,
  );
  assert.equal(
    (
      await context.request.post(environment.origin + "/api/admin/categories", {
        data: { name: "Basi", slug: "../basi", sort_order: 1.5 },
      })
    ).status(),
    400,
  );
  assert.equal(
    (
      await context.request.post(
        environment.origin + "/api/admin/product-assets",
        {
          data: {
            field: "technical_file_url",
            fileName: "schema.pdf",
            size: 0,
          },
        },
      )
    ).status(),
    400,
  );
  assert.equal(
    (
      await context.request.delete(
        environment.origin + "/api/admin/product-assets",
        { data: { receipts: ["forged"] } },
      )
    ).status(),
    400,
  );
  assert.equal(
    (
      await context.request.post(environment.origin + "/api/admin/products", {
        data: Buffer.alloc(70000),
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
    413,
  );
  assert.equal(
    environment.fixture.state.calls.filter(
      (call) => !["GET", "HEAD"].includes(call.method),
    ).length,
    0,
  );
});

// Il limite del bucket può essere più basso di quello applicativo: viene mostrato prima di inviare i byte.
test("limite Storage inferiore blocca il caricamento e conserva la selezione locale", async (t) => {
  const { page } = await testPage(environment, t);
  await page.goto(environment.origin + "/admin/prodotti", {
    waitUntil: "networkidle",
  });
  await fillProduct(page);
  await selectPdf(page, true);
  environment.fixture.state.bucketLimit = 1024;
  await page
    .getByRole("button", { name: "Crea prodotto", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "bucket Storage consente al massimo" })
    .waitFor();
  assert.equal(environment.fixture.state.objects.size, 0);
  assert.equal(
    environment.fixture.state.calls.filter((call) => call.method === "PUT")
      .length,
    0,
  );
  await page
    .getByText("File selezionato: schema.pdf", { exact: true })
    .waitFor();
});

// Verifica anche le API nuove delle categorie attraverso il normale flusso del form.
test("categorie create e modificate con slug normalizzato e ordine intero", async (t) => {
  const { page } = await testPage(environment, t);
  await page.goto(environment.origin + "/admin/categorie", {
    waitUntil: "networkidle",
  });
  await page.getByLabel("Nome", { exact: true }).fill("Categoria prova");
  await page.getByLabel("Ordine", { exact: true }).fill("2");
  await page
    .getByRole("button", { name: "Crea categoria", exact: true })
    .click();
  const article = page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: "Categoria prova", exact: true }),
    });
  await article.waitFor();
  assert.equal(
    environment.fixture.state.categories.find(
      (category) => category.name === "Categoria prova",
    ).slug,
    "categoria-prova",
  );
  await article.getByRole("button", { name: "Modifica", exact: true }).click();
  await page.getByLabel("Ordine", { exact: true }).fill("-1");
  await page
    .getByRole("button", { name: "Salva modifiche", exact: true })
    .click();
  await article.getByText("Ordine: -1", { exact: true }).waitFor();
  assert.equal(
    environment.fixture.state.categories.find(
      (category) => category.name === "Categoria prova",
    ).sort_order,
    -1,
  );
});

// Un prodotto esistente continua a salvarsi senza nuove ricevute; zero non diventa un prezzo assente.
test("modifica prodotto esistente e pubblicazione restano operative", async (t) => {
  const { page } = await testPage(environment, t);
  await page.goto(environment.origin + "/admin/prodotti", {
    waitUntil: "networkidle",
  });
  const article = page.locator("article").first();
  await article.getByRole("button", { name: "Modifica", exact: true }).click();
  await page.getByLabel("Prezzo opzionale", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Salva modifiche", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Nuovo prodotto", exact: true })
    .waitFor();
  assert.equal(environment.fixture.state.products[0].price, 0);
  await article.getByRole("button", { name: "Nascondi", exact: true }).click();
  await article.getByText("Bozza", { exact: true }).waitFor();
  assert.equal(environment.fixture.state.products[0].is_published, false);
});

// Intestazione Basic costruita come la invierebbe il browser dopo il popup di accesso.
function basicAuthorization(username, password) {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

// Senza credenziali l'area admin è chiusa, mentre il configuratore resta pubblico.
test("area admin e API chiuse senza credenziali valide", async (t) => {
  const { context } = await testPage(environment, t, undefined, {
    authenticated: false,
  });
  const productUrl =
    environment.origin +
    "/api/admin/products/11111111-1111-4111-8111-111111111111";
  const page = await context.request.get(environment.origin + "/admin/prodotti");
  assert.equal(page.status(), 401);
  assert.match(page.headers()["www-authenticate"] || "", /^Basic realm=/);
  assert.equal(
    (
      await context.request.get(environment.origin + "/admin", {
        headers: {
          Authorization: basicAuthorization(
            ADMIN_TEST_CREDENTIALS.username,
            "password-sbagliata",
          ),
        },
      })
    ).status(),
    401,
  );
  const create = await context.request.post(
    environment.origin + "/api/admin/products",
    {
      data: {
        name_it: "Intruso",
        width_mm: 700,
        height_mm: 880,
        depth_mm: 665,
        is_published: true,
      },
    },
  );
  assert.equal(create.status(), 401);
  assert.deepEqual(await create.json(), { message: "Accesso riservato." });
  assert.equal((await context.request.delete(productUrl)).status(), 401);
  // Credenziali valide non bastano a una scrittura partita da un altro sito.
  assert.equal(
    (
      await context.request.delete(productUrl, {
        headers: {
          Authorization: basicAuthorization(
            ADMIN_TEST_CREDENTIALS.username,
            ADMIN_TEST_CREDENTIALS.password,
          ),
          "Sec-Fetch-Site": "cross-site",
        },
      })
    ).status(),
    403,
  );
  assert.equal(
    (await context.request.get(environment.origin + "/configuratore")).status(),
    200,
  );
  assert.equal(environment.fixture.state.products.length, 1);
  assert.equal(
    environment.fixture.state.calls.filter(
      (call) => !["GET", "HEAD"].includes(call.method),
    ).length,
    0,
  );
});

// La cancellazione passa dalle API protette e mostra il rifiuto senza togliere la riga dall'elenco.
test("eliminazione di prodotti e categorie tramite API admin", async (t) => {
  const { page } = await testPage(environment, t);
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto(environment.origin + "/admin/prodotti", {
    waitUntil: "networkidle",
  });
  const product = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Pensile prova" }) });
  environment.fixture.state.failWrite = true;
  await product.getByRole("button", { name: "Elimina", exact: true }).click();
  await page
    .getByRole("alert")
    .getByText("Impossibile eliminare il prodotto.", { exact: true })
    .waitFor();
  assert.equal(await product.count(), 1);
  assert.equal(environment.fixture.state.products.length, 1);

  environment.fixture.state.failWrite = false;
  await product.getByRole("button", { name: "Elimina", exact: true }).click();
  await product.waitFor({ state: "detached" });
  assert.equal(environment.fixture.state.products.length, 0);
  assert.ok(
    environment.fixture.state.calls.some(
      (call) =>
        call.method === "DELETE" && call.pathname === "/rest/v1/products",
    ),
  );

  await page.goto(environment.origin + "/admin/categorie", {
    waitUntil: "networkidle",
  });
  const category = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Pensili" }) });
  environment.fixture.state.failWrite = true;
  environment.fixture.state.writeErrorCode = "23503";
  await category.getByRole("button", { name: "Elimina", exact: true }).click();
  await page
    .getByRole("alert")
    .getByText(
      "Categoria usata da uno o più prodotti: spostali prima di eliminarla.",
      { exact: true },
    )
    .waitFor();
  assert.equal(environment.fixture.state.categories.length, 1);

  environment.fixture.state.failWrite = false;
  await category.getByRole("button", { name: "Elimina", exact: true }).click();
  await category.waitFor({ state: "detached" });
  assert.equal(environment.fixture.state.categories.length, 0);
});

// Un database irraggiungibile non deve sembrare un catalogo vuoto né lasciare un form che salva dati incompleti.
test("errore di lettura in admin mostra avviso e Riprova invece di elenchi vuoti", async (t) => {
  const { page } = await testPage(environment, t);
  environment.fixture.state.failRead = true;
  await page.goto(environment.origin + "/admin/prodotti", {
    waitUntil: "networkidle",
  });
  // Next aggiunge un proprio annunciatore con role="alert": si cerca il messaggio, non il ruolo.
  const message = page.getByText("Impossibile caricare i dati dal database.", {
    exact: false,
  });
  await message.waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Crea prodotto" }).count(),
    0,
  );

  environment.fixture.state.failRead = false;
  await page.getByRole("button", { name: "Riprova", exact: true }).click();
  await page
    .getByRole("heading", { name: "Pensile prova", exact: true })
    .waitFor();
  assert.equal(await message.count(), 0);

  environment.fixture.state.failRead = true;
  await page.goto(environment.origin + "/admin", { waitUntil: "networkidle" });
  await message.waitFor();
  assert.ok((await page.getByText("—", { exact: true }).count()) >= 4);
  assert.equal(
    await page.getByText("Nessun modulo pubblicato", { exact: false }).count(),
    0,
  );
});

// Il codice resta libero, ma un valore senza distinta tecnica viene segnalato prima del salvataggio.
test("codice prodotto non riconosciuto mostra un avviso non bloccante", async (t) => {
  const { page } = await testPage(environment, t);
  await page.goto(environment.origin + "/admin/prodotti", {
    waitUntil: "networkidle",
  });
  const code = page.getByLabel("Codice", { exact: true });
  await page
    .getByText("Senza codice il modulo non avrà distinta tecnica", {
      exact: false,
    })
    .waitFor();
  await code.fill("PENSILE_ORIZZONTALE_A_VISTA_ZZ");
  const warning = page.getByText("Codice non presente nel catalogo tecnico", {
    exact: false,
  });
  await warning.waitFor();
  assert.match(
    (await code.getAttribute("aria-describedby")) || "",
    /.+/,
  );
  await code.fill("pensile_orizzontale_a_vista_sx");
  await warning.waitFor({ state: "detached" });
});

// Un errore di rete sulla pubblicazione viene mostrato e il pulsante torna utilizzabile.
test("pubblicazione con rete assente mostra l'errore senza bloccare la lista", async (t) => {
  const { page, context } = await testPage(environment, t);
  await page.goto(environment.origin + "/admin/prodotti", {
    waitUntil: "networkidle",
  });
  await context.route("**/api/admin/products/*/publish", (route) =>
    route.abort("internetdisconnected"),
  );
  const button = page
    .locator("article")
    .first()
    .getByRole("button", { name: "Nascondi", exact: true });
  await button.click();
  await page
    .getByRole("alert")
    .getByText("Impossibile aggiornare la pubblicazione.", { exact: true })
    .waitFor();
  assert.equal(await button.isEnabled(), true);
  assert.equal(environment.fixture.state.products[0].is_published, true);
});

// La 404 segue la lingua salvata e aggiorna anche l'attributo lang del documento.
test("pagina inesistente e lingua del documento seguono la preferenza salvata", async (t) => {
  const { page, context } = await testPage(environment, t);
  const missing = await page.goto(environment.origin + "/pagina-inesistente");
  assert.equal(missing.status(), 404);
  await page
    .getByRole("heading", { name: "Pagina non trovata", exact: true })
    .waitFor();

  await context.addInitScript(() =>
    window.localStorage.setItem("furniture-configurator-locale", "en"),
  );
  await page.goto(environment.origin + "/pagina-inesistente");
  await page
    .getByRole("heading", { name: "Page not found", exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(() => document.documentElement.lang),
    "en",
  );

  await page.goto(environment.origin + "/configuratore", {
    waitUntil: "networkidle",
  });
  await page.waitForFunction(() => document.documentElement.lang === "en");
  await page.getByRole("button", { name: "Italiano" }).click();
  await page.waitForFunction(() => document.documentElement.lang === "it");
});
