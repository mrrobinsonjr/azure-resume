import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const ROOT = process.cwd();
const srcDir = path.join(ROOT, "src", "data");
const outFile = path.join(srcDir, "architecture.js");
const contentFile = path.join(ROOT, "content", "resume", "architecture.md");

async function build() {
  const raw = await fs.readFile(contentFile, "utf8");
  const html = marked.parse(raw.trim());

  const js = `// Auto-generated from site-v2/content/resume/architecture.md — do not edit manually.\nexport default ${JSON.stringify({ html })};\n`;

  await fs.mkdir(srcDir, { recursive: true });
  await fs.writeFile(outFile, js, "utf8");
  console.log(`Built architecture page -> ${path.relative(ROOT, outFile)}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
