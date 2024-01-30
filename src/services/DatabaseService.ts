import { Service } from "typedi";
import { Database } from "sqlite";
import * as DatabaseUtils from "../utils/database";

@Service()
export class DatabaseService {
  private db: Database | null = null;

  async connect() {
    this.db = await DatabaseUtils.openDatabase();
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
