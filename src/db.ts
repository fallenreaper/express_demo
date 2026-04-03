import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use DATABASE_PATH environment variable for the database directory, default to ../db if not set
const dbDirectory = process.env.DATABASE_PATH || path.join(__dirname, "../db");
const dbPath = path.join(dbDirectory, "orders.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Initialize tables
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export default db;
