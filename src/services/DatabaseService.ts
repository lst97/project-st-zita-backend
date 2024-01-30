import { Service } from "typedi";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

@Service()
export class DatabaseService {
  private db: Database | null = null;

  async connect() {
    this.db = await open({
      filename: "path/to/database.db",
      driver: sqlite3.Database,
    });
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  // Example method to get data from the database
  async getData(query: string): Promise<any[]> {
    if (!this.db) {
      throw new Error("Database not connected");
    }
    return this.db.all(query);
  }

  // Example method to execute a query like INSERT, UPDATE, DELETE
  async runQuery(query: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not connected");
    }
    await this.db.exec(query);
  }
}
