import type { FilterState, Role, SortKey } from "../types/roles";

type Facets = {
  tech: string[];
  tags: string[];
  il: string[];
  clr: string[];
};

function matchesGroup(values: string[], selected: Set<string>): boolean {
  if (selected.size === 0) return true;
  return values.some((value) => selected.has(value));
}

function compareDates(left: Role, right: Role): number {
  return `${left.end}-${left.start}`.localeCompare(`${right.end}-${right.start}`);
}

function sortRoles(roles: Role[], sort: SortKey): Role[] {
  const next = [...roles];

  switch (sort) {
    case "oldest":
      return next.sort((a, b) => compareDates(a, b));
    case "company_az":
      return next.sort((a, b) => a.company.localeCompare(b.company));
    case "title_az":
      return next.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
    default:
      return next.sort((a, b) => compareDates(b, a));
  }
}

export function applyFilters(roles: Role[], state: FilterState): Role[] {
  const filtered = roles.filter((role) => {
    if (!matchesGroup(role.tech, state.tech)) return false;
    if (!matchesGroup(role.tags, state.tags)) return false;
    if (!matchesGroup(role.il_levels, state.il)) return false;
    if (!matchesGroup(role.clearance ? [role.clearance] : [], state.clr)) return false;
    return true;
  });

  return sortRoles(filtered, state.sort);
}

export function computeFacets(roles: Role[]): Facets {
  const facets = {
    tech: new Set<string>(),
    tags: new Set<string>(),
    il: new Set<string>(),
    clr: new Set<string>(),
  };

  roles.forEach((role) => {
    role.tech.forEach((value) => facets.tech.add(value));
    role.tags.forEach((value) => facets.tags.add(value));
    role.il_levels.forEach((value) => facets.il.add(value));
    if (role.clearance) facets.clr.add(role.clearance);
  });

  return {
    tech: [...facets.tech].sort(),
    tags: [...facets.tags].sort(),
    il: [...facets.il].sort(),
    clr: [...facets.clr].sort(),
  };
}

