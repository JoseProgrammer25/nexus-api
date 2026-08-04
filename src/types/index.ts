export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "QUERY";

export interface KeyValue {
  key: string;
  value: string;
  active: boolean;
}

export interface RequestHeader extends KeyValue {}

export interface RequestParam extends KeyValue {}

export interface HistoryItem {
  id?: number;
  method: HttpMethod;
  url: string;
  headers: RequestHeader[];
  params: RequestParam[];
  body: string;
  responseStatus?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  responseTime?: number;
  createdAt: number;
}
