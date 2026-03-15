import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { FilterState, SortKey } from "../types/roles";

const DEFAULT_STATE: FilterState = {
  q: "",
  tech: new Set(),
  tags: new Set(),
  il: new Set(),
  clr: new Set(),
  sort: "newest",
};

function parseList(value: string | null): Set<string> {
  if (!value) return new Set();
  return new Set(value.split(",").map((item) => item.trim()).filter(Boolean));
}

function parseSort(value: string | null): SortKey {
  if (value === "oldest" || value === "company_az" || value === "title_az") {
    return value;
  }
  return "newest";
}

function parseQuery(): FilterState {
  const params = new URLSearchParams(window.location.search);

  return {
    q: params.get("q") ?? "",
    tech: parseList(params.get("tech")),
    tags: parseList(params.get("tags")),
    il: parseList(params.get("il")),
    clr: parseList(params.get("clr")),
    sort: parseSort(params.get("sort")),
  };
}

function serializeList(values: Set<string>): string | null {
  return values.size > 0 ? [...values].join(",") : null;
}

function serializeState(state: FilterState): string {
  const params = new URLSearchParams();

  if (state.q) params.set("q", state.q);

  const mappings: Array<[string, Set<string>]> = [
    ["tech", state.tech],
    ["tags", state.tags],
    ["il", state.il],
    ["clr", state.clr],
  ];

  mappings.forEach(([key, values]) => {
    const serialized = serializeList(values);
    if (serialized) params.set(key, serialized);
  });

  if (state.sort !== "newest") params.set("sort", state.sort);

  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}

export function useQueryState(): [FilterState, Dispatch<SetStateAction<FilterState>>] {
  const [state, setState] = useState<FilterState>(() => parseQuery());

  useEffect(() => {
    const next = serializeState(state);
    window.history.replaceState({}, "", next);
  }, [state]);

  return [state, setState];
}
