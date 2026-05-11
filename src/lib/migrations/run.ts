import { readdir } from "fs/promises";
import db, { close } from "../db";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dirUrl = new URL(".", import.meta.url);

export async function runMigrations() {
  const entries = await readdir(__dirname);

  const migrationFiles = entries
    .filter((f) => /^\d+.*\.(ts|js)$/.test(f))
    .filter((f) => !/^run(\.|$)/.test(f))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );

  for (const fileName of migrationFiles) {
    const fileUrl = new URL(fileName, dirUrl).href;
    console.log("Running migration:", fileName);
    try {
      const mod = await import(fileUrl);
      const up = mod.up ?? mod.default;
      if (typeof up !== "function") {
        console.log("  -> no `up` function found, skipping");
        continue;
      }
      await up();
      console.log("  -> done");
    } catch (err) {
      console.error("Migration failed:", fileName, err);
      throw err;
    }
  }
}

if (import.meta.main) {
  (async () => {
    try {
      await runMigrations();
      console.log("All migrations finished");
    } catch (e) {
      console.error("Migrations terminated with error", e);
      process.exitCode = 1;
    } finally {
      try {
        close();
      } catch (err) {
        // ignore
      }
    }
  })();
}

export default runMigrations;
