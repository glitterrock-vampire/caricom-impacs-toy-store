import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const defaultDbPath = process.env.VERCEL ? path.join("/tmp", "app.sqlite") : path.join(dataDir, "app.sqlite");
const dbPath = process.env.SQLITE_DB_PATH ?? defaultDbPath;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schemaSql);

const seedSql = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
db.exec(seedSql);

export { dbPath };
