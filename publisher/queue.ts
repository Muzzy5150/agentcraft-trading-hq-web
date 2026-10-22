import { DatabaseSync } from "node:sqlite";
import type { PublicEvent } from "../lib/schema";
export class Queue {
  db: DatabaseSync;
  constructor(file: string) {
    this.db = new DatabaseSync(file);
    this.db.exec(
      "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS queue(id TEXT PRIMARY KEY, payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS seen(id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);",
    );
  }
  add(events: PublicEvent[]) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const insert = this.db.prepare(
        "INSERT OR IGNORE INTO queue SELECT ?,? WHERE NOT EXISTS (SELECT 1 FROM seen WHERE id=?)",
      );
      for (const e of events) insert.run(e.id, JSON.stringify(e), e.id);
      if (
        (this.db.prepare("SELECT count(*) AS n FROM queue").get()
          ?.n as number) > 10000
      )
        throw Error("Queue full; source remains untouched");
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  take() {
    return this.db
      .prepare("SELECT payload FROM queue ORDER BY rowid LIMIT 100")
      .all()
      .map((r) => JSON.parse(String(r.payload)) as PublicEvent);
  }
  ack(events: PublicEvent[]) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      for (const e of events) {
        this.db.prepare("INSERT OR IGNORE INTO seen VALUES(?)").run(e.id);
        this.db.prepare("DELETE FROM queue WHERE id=?").run(e.id);
      }
      this.db
        .prepare("INSERT OR REPLACE INTO meta VALUES(?,?)")
        .run("lastSuccessfulSync", new Date().toISOString());
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  health() {
    return {
      pending: this.db.prepare("SELECT count(*) AS n FROM queue").get()?.n,
      lastSuccessfulSync:
        this.db
          .prepare("SELECT value FROM meta WHERE key=?")
          .get("lastSuccessfulSync")?.value || null,
    };
  }
  close() {
    this.db.close();
  }
}
