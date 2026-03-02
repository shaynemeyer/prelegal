// @ts-nocheck — node:sqlite is Node 22+ built-in, not yet in @types/node v20
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

export default function globalTeardown() {
  const dbPath = path.resolve(__dirname, "../../backend/prelegal.db");

  if (!fs.existsSync(dbPath)) return;

  const db = new DatabaseSync(dbPath);
  db.exec(
    "DELETE FROM documents WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com')"
  );
  db.exec("DELETE FROM users WHERE email LIKE '%@example.com'");
  db.close();
}
