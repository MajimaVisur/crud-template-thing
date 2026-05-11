import { env, SQL } from "bun";

const DATABASE_URL = env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL not set. Defaulting to sqlite:./dev.sqlite");
}

const resolvedUrl = DATABASE_URL || "sqlite:./dev.sqlite";

let db = new SQL(resolvedUrl);

export default db;

export function close() {
  try {
    return db.close();
  } catch (e) {
    // ignore
  }
}
