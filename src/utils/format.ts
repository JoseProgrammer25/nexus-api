import type { HttpMethod } from "../types";

export const METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "QUERY",
];

export const METHOD_BADGE: Record<HttpMethod, string> = {
  GET: "bg-emerald-400/10 text-emerald-300",
  POST: "bg-amber-400/10 text-amber-300",
  PUT: "bg-sky-400/10 text-sky-300",
  PATCH: "bg-violet-400/10 text-violet-300",
  DELETE: "bg-rose-400/10 text-rose-300",
  QUERY: "bg-teal-400/10 text-teal-300",
};

export const METHOD_TEXT: Record<HttpMethod, string> = {
  GET: "text-emerald-400",
  POST: "text-amber-400",
  PUT: "text-sky-400",
  PATCH: "text-violet-400",
  DELETE: "text-rose-400",
  QUERY: "text-teal-400",
};

export const METHOD_DOT: Record<HttpMethod, string> = {
  GET: "bg-emerald-400",
  POST: "bg-amber-400",
  PUT: "bg-sky-400",
  PATCH: "bg-violet-400",
  DELETE: "bg-rose-400",
  QUERY: "bg-teal-400",
};

const STATUS_TEXT: Record<number, string> = {
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

export function statusColor(status?: number): string {
  if (status === undefined) return "text-ink-3";
  if (status < 300) return "text-emerald-400";
  if (status < 400) return "text-sky-400";
  return "text-rose-400";
}

export function statusDot(status?: number): string {
  if (status === undefined) return "bg-ink-3";
  if (status < 300) return "bg-emerald-400";
  if (status < 400) return "bg-sky-400";
  return "bg-rose-400";
}

export function statusText(status?: number): string {
  if (status === undefined) return "Sin respuesta";
  const label = STATUS_TEXT[status];
  return label ? `${status} ${label}` : `${status}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

export function prettyPrint(raw: string): string {
  if (!raw) return "";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "ahora mismo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const JSON_TOKEN =
  /("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

export function highlightJson(raw: string): string {
  if (!raw) return "";
  const pretty = prettyPrint(raw);
  if (pretty === raw) return escapeHtml(raw);

  let html = "";
  let last = 0;
  let match: RegExpExecArray | null;
  JSON_TOKEN.lastIndex = 0;

  while ((match = JSON_TOKEN.exec(pretty)) !== null) {
    html += escapeHtml(pretty.slice(last, match.index));
    const token = match[0];

    if (token.endsWith(":")) {
      html += `<span class="text-sky-300">${escapeHtml(token.slice(0, -1))}</span><span class="text-ink-3">:</span>`;
    } else if (token.startsWith('"')) {
      html += `<span class="text-emerald-300">${escapeHtml(token)}</span>`;
    } else if (token === "true" || token === "false") {
      html += `<span class="text-violet-300">${escapeHtml(token)}</span>`;
    } else if (token === "null") {
      html += `<span class="text-ink-3">${escapeHtml(token)}</span>`;
    } else {
      html += `<span class="text-amber-300">${escapeHtml(token)}</span>`;
    }

    last = match.index + token.length;
  }

  html += escapeHtml(pretty.slice(last));
  return html;
}
