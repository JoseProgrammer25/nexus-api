export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface KeyValue {
  uid: string;
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

export interface Collection {
  id?: number;
  name: string;
  method: HttpMethod;
  url: string;
  headers: RequestHeader[];
  params: RequestParam[];
  body: string;
  createdAt: number;
}

export type EditorTab = "headers" | "params" | "body";

export interface RequestTab {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: RequestHeader[];
  params: RequestParam[];
  body: string;
  editorTab: EditorTab;
  responseStatus?: number;
  responseTime?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
}
