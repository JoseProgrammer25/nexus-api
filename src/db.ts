import Dexie, { type Table } from "dexie";
import type { HistoryItem } from "./types";

class NexusDatabase extends Dexie {
  history!: Table<HistoryItem, number>;

  constructor() {
    super("NexusDB");

    this.version(1).stores({
      history: "++id, method, url, createdAt",
    });

    this.version(2).stores({
      history: "++id, method, url, responseStatus, createdAt",
    });
  }

  async addHistory(item: Omit<HistoryItem, "id">): Promise<number> {
    return this.history.add(item);
  }

  async getHistory(): Promise<HistoryItem[]> {
    return this.history.orderBy("createdAt").reverse().toArray();
  }

  async searchHistory(query: string): Promise<HistoryItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getHistory();
    const all = await this.getHistory();
    return all.filter(
      (item) =>
        item.url.toLowerCase().includes(q) ||
        item.method.toLowerCase().includes(q) ||
        String(item.responseStatus ?? "").includes(q),
    );
  }

  async deleteItem(id: number): Promise<void> {
    await this.history.delete(id);
  }

  async clearHistory(): Promise<void> {
    await this.history.clear();
  }
}

export const db = new NexusDatabase();
