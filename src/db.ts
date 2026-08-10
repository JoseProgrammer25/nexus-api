import Dexie, { type Table } from "dexie";
import type { Collection, HistoryItem, KeyValue } from "./types";

interface HistoryInput {
  method: HistoryItem["method"];
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  responseStatus?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  responseTime?: number;
  createdAt: number;
}

function rowsEqual(a: KeyValue[], b: KeyValue[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].key !== b[i].key ||
      a[i].value !== b[i].value ||
      a[i].active !== b[i].active
    ) {
      return false;
    }
  }
  return true;
}

class NexusDatabase extends Dexie {
  history!: Table<HistoryItem, number>;
  collections!: Table<Collection, number>;

  constructor() {
    super("NexusDB");

    this.version(1).stores({
      history: "++id, method, url, createdAt",
    });

    this.version(2).stores({
      history: "++id, method, url, responseStatus, createdAt",
    });

    this.version(3).stores({
      history: "++id, method, url, responseStatus, createdAt, [method+url]",
      collections: "++id, name, createdAt",
    });
  }

  async addHistory(item: HistoryInput): Promise<number> {
    const existing = await this.history
      .where("[method+url]")
      .equals([item.method, item.url])
      .toArray();

    const match = existing
      .sort((a, b) => b.createdAt - a.createdAt)
      .find(
        (row) =>
          row.body === item.body &&
          rowsEqual(row.headers ?? [], item.headers) &&
          rowsEqual(row.params ?? [], item.params),
      );

    if (match?.id !== undefined) {
      await this.history.update(match.id, {
        responseStatus: item.responseStatus,
        responseBody: item.responseBody,
        responseHeaders: item.responseHeaders,
        responseTime: item.responseTime,
        createdAt: item.createdAt,
      });
      return match.id;
    }

    return this.history.add(item as HistoryItem);
  }

  async getHistory(): Promise<HistoryItem[]> {
    return this.history.orderBy("createdAt").reverse().toArray();
  }

  async getLatest(): Promise<HistoryItem | undefined> {
    return this.history.orderBy("createdAt").last();
  }

  async deleteItem(id: number): Promise<void> {
    await this.history.delete(id);
  }

  async clearHistory(): Promise<void> {
    await this.history.clear();
  }

  async addCollection(item: Omit<Collection, "id">): Promise<number> {
    return this.collections.add(item);
  }

  async updateCollection(id: number, patch: Partial<Collection>): Promise<void> {
    await this.collections.update(id, patch);
  }

  async getCollections(): Promise<Collection[]> {
    return this.collections.orderBy("createdAt").reverse().toArray();
  }

  async deleteCollection(id: number): Promise<void> {
    await this.collections.delete(id);
  }
}

export const db = new NexusDatabase();
