import { useMemo } from "react";
import ActiveFilters from "../components/ActiveFilters";
import FilterPanel from "../components/FilterPanel";
import RolesGrid from "../components/RolesGrid";
import SearchBar from "../components/SearchBar";
import SortSelect from "../components/SortSelect";
import { useQueryState } from "../hooks/useQueryState";
import { applyFilters, computeFacets } from "../lib/filter";
import { buildRoleIndex, roleMatchesQuery } from "../lib/search";
import roles from "../data/roles.json";
import type { FilterState, Role } from "../types/roles";

const roleData = roles as Role[];

function toggleSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function Home() {
  const [state, setState] = useQueryState();

  const roleIndex = useMemo(() => {
    const map = new Map<string, string>();
    roleData.forEach((role) => map.set(role.id, buildRoleIndex(role)));
    return map;
  }, []);

  const facets = useMemo(() => computeFacets(roleData), []);

  const displayedRoles = useMemo(() => {
    const queryFiltered = roleData.filter((role) => roleMatchesQuery(roleIndex.get(role.id) ?? "", state.q));
    return applyFilters(queryFiltered, state);
  }, [roleIndex, state]);

  const update = (patch: Partial<FilterState>) => setState((prev) => ({ ...prev, ...patch }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <header className="mb-10 border-b border-slate-800 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Resume Site v2</p>
          <h1 className="mt-2 text-4xl font-bold">Robin Robinson</h1>
          <p className="mt-2 text-slate-300">Cloud Architect · Cybersecurity Engineer · DevSecOps</p>
        </header>

        <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Roles</h2>
              <p className="mt-1 text-sm text-slate-300">Showing {displayedRoles.length} of {roleData.length} roles</p>
            </div>
            <SortSelect value={state.sort} onChange={(sort) => update({ sort })} />
          </div>

          <div className="mt-4">
            <SearchBar value={state.q} onChange={(q) => update({ q })} />
            <ActiveFilters
              selected={state}
              onRemove={(group, value) => update({ [group]: toggleSet(state[group], value) } as Partial<FilterState>)}
            />
            <FilterPanel
              facets={facets}
              selected={state}
              onToggle={(group, value) => update({ [group]: toggleSet(state[group], value) } as Partial<FilterState>)}
              onClearAll={() =>
                setState({
                  q: "",
                  tech: new Set(),
                  tags: new Set(),
                  il: new Set(),
                  clr: new Set(),
                  sort: "newest",
                })
              }
            />
          </div>

          {displayedRoles.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-6 text-slate-300">
              <p>No roles match your current search and filters.</p>
              <button
                type="button"
                onClick={() =>
                  setState({
                    q: "",
                    tech: new Set(),
                    tags: new Set(),
                    il: new Set(),
                    clr: new Set(),
                    sort: "newest",
                  })
                }
                className="mt-3 text-sm font-semibold text-brand-500 hover:text-brand-600"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <RolesGrid roles={displayedRoles} />
          )}
        </section>

        <footer className="mt-auto border-t border-slate-800 pt-6 text-sm text-slate-300">
          <p className="mb-2 font-medium">Downloads</p>
          <div className="flex gap-4">
            <a className="text-brand-500 hover:text-brand-600" href="/downloads/resume.pdf">
              Resume (PDF)
            </a>
            <a className="text-brand-500 hover:text-brand-600" href="/downloads/resume.docx">
              Resume (DOCX)
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Home;
