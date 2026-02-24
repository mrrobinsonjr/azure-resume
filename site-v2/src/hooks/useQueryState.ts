import { useEffect, useState } from "react";
import type { FilterState, SortKey } from "../types/roles";

const SORT_VALUES: SortKey[] = ["newest", "oldest", "company_az", "title_az"];

function splitParam(params: URLSearchParams, key: string): Set<string> {
  const raw = params.get(key);
  if (!raw) return new Set();
  return new Set(raw.split(",").map((v) => v.trim()).filter(Boolean));
}

export function parseQuery(search: string): FilterState {
  const params = new URLSearchParams(search);
  const sort = params.get("sort") as SortKey | null;

  return {
    q: params.get("q") ?? "",
    tech: splitParam(params, "tech"),
    tags: splitParam(params, "tags"),
    il: splitParam(params, "il"),
    clr: splitParam(params, "clr"),
    sort: sort && SORT_VALUES.includes(sort) ? sort : "newest",
  };
}

function encodeSet(values: Set<string>): string | null {
  if (values.size === 0) return null;
  return [...values].sort((a, b) => a.localeCompare(b)).join(",");
}

export function serializeState(state: FilterState): string {
  const params = new URLSearchParams();

  if (state.q.trim()) params.set("q", state.q.trim());
  const tech = encodeSet(state.tech);
  const tags = encodeSet(state.tags);
  const il = encodeSet(state.il);
  const clr = encodeSet(state.clr);

  if (tech) params.set("tech", tech);
  if (tags) params.set("tags", tags);
  if (il) params.set("il", il);
  if (clr) params.set("clr", clr);
  if (state.sort !== "newest") params.set("sort", state.sort);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useQueryState() {
  const [state, setState] = useState<FilterState>(() => parseQuery(window.location.search));

  useEffect(() => {
    const next = serializeState(state);
    const nextUrl = `${window.location.pathname}${next}`;
    window.history.replaceState(null, "", nextUrl);
  }, [state]);

  return [state, setState] as const;
}
