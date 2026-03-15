import type { Role } from "../types/roles";

export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

export function buildRoleIndex(role: Role): string {
  return normalizeText(
    [
      role.company,
      role.title,
      role.location,
      role.clearance,
      role.highlights.join(" "),
      role.tags.join(" "),
      role.tech.join(" "),
      role.il_levels.join(" "),
      stripHtml(role.bodyHtml),
    ].join(" "),
  );
}

export function roleMatchesQuery(index: string, query: string): boolean {
  const normalized = normalizeText(query);
  if (!normalized) return true;
  return index.includes(normalized);
}

