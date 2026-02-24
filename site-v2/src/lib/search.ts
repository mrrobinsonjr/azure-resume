import type { Role } from "../types/roles";

export function normalizeText(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

export function buildRoleIndex(role: Role): string {
  const chunks = [
    role.company,
    role.title,
    role.location,
    role.clearance,
    role.il_levels.join(" "),
    role.tags.join(" "),
    role.tech.join(" "),
    role.highlights.join(" "),
    stripHtml(role.bodyHtml),
  ];
  return normalizeText(chunks.join(" "));
}

export function roleMatchesQuery(indexText: string, q: string): boolean {
  const normalized = normalizeText(q);
  if (!normalized) return true;
  return indexText.includes(normalized);
}
