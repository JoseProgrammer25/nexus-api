import type { RequestParam } from "../types";
import { uid } from "./format";

function rawParam(key: string, value: string): RequestParam {
  return { uid: uid(), key, value, active: true };
}

export function buildUrl(base: string, params: RequestParam[]): string {
  const active = params.filter((p) => p.active && p.key.trim() !== "");
  if (active.length === 0) return base;
  const search = new URLSearchParams();
  for (const p of active) search.append(p.key.trim(), p.value);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${search.toString()}`;
}

export function parseUrl(
  raw: string,
): { base: string; params: RequestParam[] } {
  const questionIndex = raw.indexOf("?");
  if (questionIndex === -1) {
    return { base: raw, params: [rawParam("", "")] };
  }
  const base = raw.slice(0, questionIndex);
  const query = raw.slice(questionIndex + 1);
  const search = new URLSearchParams(query);
  const params: RequestParam[] = [];
  search.forEach((value, key) => params.push(rawParam(key, value)));
  return { base, params: params.length > 0 ? params : [rawParam("", "")] };
}
