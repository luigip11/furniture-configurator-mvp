import { cpSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { startFixture } from "./fixture.mjs";

// Usa una copia isolata e credenziali fittizie: la suite non può scrivere su Supabase reale.
export async function startBrowserEnvironment() {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const directory = mkdtempSync(join(tmpdir(), "furniture-phase4-"));
  cpSync(root, directory, {
    recursive: true,
    filter: (source) =>
      !["node_modules", ".git", ".next"].includes(basename(source)) &&
      !basename(source).startsWith(".env") &&
      !source.endsWith(".tsbuildinfo"),
  });
  symlinkSync(
    join(root, "node_modules"),
    join(directory, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const fixture = await startFixture();
  const probe = createServer();
  await new Promise((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  let output = "";
  const app = spawn(
    process.execPath,
    [
      join(root, "node_modules/next/dist/bin/next"),
      "dev",
      "--webpack",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd: directory,
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: fixture.origin,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "fixture-service-key",
        NODE_USE_ENV_PROXY: "0",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  app.stdout.on("data", (chunk) => {
    output = (output + chunk.toString()).slice(-16000);
  });
  app.stderr.on("data", (chunk) => {
    output = (output + chunk.toString()).slice(-16000);
  });
  let browser;
  // Rilascia processi e file di prova anche se l'app non parte o Chromium non è installato.
  async function close() {
    await browser?.close();
    if (app.exitCode === null) {
      const exited = new Promise((resolve) => app.once("exit", resolve));
      app.kill("SIGTERM");
      const killTimer = setTimeout(() => app.kill("SIGKILL"), 5000);
      await exited;
      clearTimeout(killTimer);
    }
    await fixture.close();
    rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
  }
  try {
    const deadline = Date.now() + 90000;
    let ready = false;
    while (Date.now() < deadline) {
      if (app.exitCode !== null) throw new Error(output);
      try {
        const result = await fetch(origin + "/configuratore", {
          signal: AbortSignal.timeout(20000),
        });
        await result.arrayBuffer();
        if (result.ok) {
          ready = true;
          break;
        }
      } catch {
        /* L'avvio e la prima compilazione possono non essere ancora conclusi. */
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error("Next non disponibile: " + output);
    browser = await chromium.launch({
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      headless: true,
      args: [
        "--no-sandbox",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    });
    return { browser, fixture, origin, close };
  } catch (error) {
    await close();
    throw error;
  }
}

// Blocca richieste esterne al collaudo; ogni pagina usa un profilo nuovo e indipendente.
export async function testPage(
  environment,
  t,
  viewport = { width: 1440, height: 1100 },
) {
  const context = await environment.browser.newContext({ viewport });
  await context.route("**/*", (route) =>
    [environment.origin, environment.fixture.origin].includes(
      new URL(route.request().url()).origin,
    )
      ? route.continue()
      : route.abort(),
  );
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  t.after(async () => {
    await context.close();
    if (errors.length) throw new Error(errors.join("\n"));
  });
  return { context, page };
}
