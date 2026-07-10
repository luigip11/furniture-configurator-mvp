#!/usr/bin/env node
/**
 * Sincronizza su Vercel solo le variabili pubbliche richieste dalla build Next.js.
 *
 * I valori vengono letti da .env.local e passati alla CLI tramite stdin, evitando
 * di stamparli nei log del terminale.
 */

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const PUBLIC_ENV_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

// Legge un .env semplice preservando solo chiavi esplicitamente consentite.
async function readDotEnv(filePath) {
  const content = await readFile(filePath, "utf8");
  const values = new Map();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (PUBLIC_ENV_KEYS.includes(key)) {
      values.set(key, rawValue.replace(/^["']|["']$/g, ""));
    }
  }

  return values;
}

// Esegue `vercel env add` senza mostrare il valore della variabile.
function addVercelEnv(key, value) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["vercel", "env", "add", key, "production"], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        console.log(`Sincronizzata ${key} su production.`);
        resolve();
        return;
      }

      if (/already exists/i.test(output)) {
        console.log(`${key} gia presente su production.`);
        resolve();
        return;
      }

      reject(new Error(`Impossibile sincronizzare ${key}: ${output.trim()}`));
    });

    child.stdin.end(`${value}\n`);
  });
}

// Coordina la sincronizzazione delle env pubbliche necessarie al deploy.
async function run() {
  const envPath = path.join(process.cwd(), ".env.local");
  const env = await readDotEnv(envPath);

  for (const key of PUBLIC_ENV_KEYS) {
    const value = env.get(key);
    if (!value) {
      throw new Error(`${key} mancante in .env.local.`);
    }

    await addVercelEnv(key, value);
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
