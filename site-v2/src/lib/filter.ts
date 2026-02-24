import type { FilterState, Role, SortKey } from "../types/roles";

type Facets = {
  tech: string[];
  tags: string[];
  il: string[];
  clr: string[];
};

function hasAny(selected: Set<string>, values: string[]): boolean {
  if (selected.size === 0) return true;
  return values.some((value) => selected.has(value));
}

function monthValue(value: string): number {
  if (!value || value === "Present") return Number.MAX_SAFE_INTEGER;
  const [y, m = "01"] = value.split("-");
  return Number(y) * 100 + Number(m);
}

function sortRoles(roles: Role[], sort: SortKey): Role[] {
  return [...roles].sort((a, b) => {
    if (sort === "oldest") return monthValue(a.start) - monthValue(b.start);
    if (sort === "company_az") return a.company.localeCompare(b.company);
    if (sort === "title_az") return a.title.localeCompare(b.title);
    return monthValue(b.start) - monthValue(a.start);
  });
}

export function applyFilters(roles: Role[], state: FilterState): Role[] {
  const filtered = roles.filter((role) => {
    const techOk = hasAny(state.tech, role.tech);
    const tagsOk = hasAny(state.tags, role.tags);
    const ilOk = hasAny(state.il, role.il_levels);
    const clrOk = state.clr.size === 0 || state.clr.has(role.clearance);
    return techOk && tagsOk && ilOk && clrOk;
  });

  return sortRoles(filtered, state.sort);
}

export function computeFacets(roles: Role[]): Facets {
  const tech = new Set<string>();
  const tags = new Set<string>();
  const il = new Set<string>();
  const clr = new Set<string>();

  roles.forEach((role) => {
    role.tech.forEach((item) => tech.add(item));
    role.tags.forEach((item) => tags.add(item));
    role.il_levels.forEach((item) => il.add(item));
    if (role.clearance) clr.add(role.clearance);
  });

  const sort = (a: string, b: string) => a.localeCompare(b);
  return {
    tech: [...tech].sort(sort),
    tags: [...tags].sort(sort),
    il: [...il].sort(sort),
    clr: [...clr].sort(sort),
  };
}
