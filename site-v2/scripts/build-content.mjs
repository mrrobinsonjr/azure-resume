import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = process.cwd();
const rolesDir = path.join(ROOT, "content", "roles");
const outFile = path.join(ROOT, "src", "data", "roles.json");

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function monthValue(value) {
  if (!value || value === "Present") return Number.MAX_SAFE_INTEGER;
  const [year, month = "01"] = String(value).split("-");
  return Number(year) * 100 + Number(month);
}

async function build() {
  const files = (await fs.readdir(rolesDir))
    .filter((name) => name.endsWith(".md"))
    .sort();

  const roles = [];

  for (const file of files) {
    const fullPath = path.join(rolesDir, file);
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, content } = matter(raw);

    roles.push({
      id: data.id,
      company: data.company,
      title: data.title,
      location: data.location,
      start: data.start,
      end: data.end,
      clearance: data.clearance || "",
      il_levels: normalizeArray(data.il_levels),
      tags: normalizeArray(data.tags),
      tech: normalizeArray(data.tech),
      highlights: normalizeArray(data.highlights),
      bodyHtml: marked.parse(content.trim()),
    });
  }

  roles.sort((a, b) => monthValue(b.start) - monthValue(a.start));
  await fs.writeFile(outFile, JSON.stringify(roles, null, 2) + "\n", "utf8");
  console.log(`Built ${roles.length} roles -> ${path.relative(ROOT, outFile)}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
