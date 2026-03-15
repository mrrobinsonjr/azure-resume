import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const SITE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(SITE_ROOT, "..");
const ROLES_DIR = path.join(SITE_ROOT, "content", "roles");
const SUMMARY_PATH = path.join(SITE_ROOT, "content", "resume", "summary.md");
const API_DATA_DIR = path.join(REPO_ROOT, "api", "data");
const CHUNKS_PATH = path.join(API_DATA_DIR, "rag_chunks.json");
const EMBEDDINGS_PATH = path.join(API_DATA_DIR, "rag_embeddings.json");
const MAX_WORDS = 900;
const MIN_WORDS = 400;

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function stripMarkdown(value) {
  return value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wordCount(value) {
  return value.split(/\s+/).filter(Boolean).length;
}

function parseSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let currentHeading = "Overview";
  let currentLines = [];

  function flush() {
    const text = stripMarkdown(currentLines.join("\n").trim());
    if (text) {
      sections.push({ heading: currentHeading, text });
    }
  }

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      flush();
      currentHeading = match[1].trim();
      currentLines = [];
      continue;
    }
    currentLines.push(line);
  }

  flush();
  return sections;
}

function splitOversizedSection(section) {
  const text = section.text.trim();
  if (!text) return [];
  if (wordCount(text) <= MAX_WORDS) return [section];

  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = [];
  let currentWords = 0;

  function flush(index) {
    const chunkText = current.join("\n\n").trim();
    if (!chunkText) return;
    chunks.push({
      heading: chunks.length === 0 ? section.heading : `${section.heading} (${index})`,
      text: chunkText,
    });
  }

  paragraphs.forEach((paragraph) => {
    const count = wordCount(paragraph);
    if (count > MAX_WORDS) {
      const words = paragraph.split(/\s+/);
      for (let index = 0; index < words.length; index += MAX_WORDS) {
        const slice = words.slice(index, index + MAX_WORDS).join(" ");
        if (current.length && currentWords >= MIN_WORDS) {
          flush(chunks.length + 1);
          current = [];
          currentWords = 0;
        }
        chunks.push({
          heading: `${section.heading} (${chunks.length + 1})`,
          text: slice,
        });
      }
      return;
    }

    if (currentWords + count > MAX_WORDS && current.length) {
      flush(chunks.length + 1);
      current = [];
      currentWords = 0;
    }

    current.push(paragraph);
    currentWords += count;
  });

  if (current.length) {
    flush(chunks.length + 1);
  }

  return chunks;
}

function createChunk(base, section, index) {
  return {
    id: `${base.id}-${slugify(section.heading)}-${String(index + 1).padStart(3, "0")}`,
    source_type: base.source_type,
    role_id: base.role_id ?? null,
    title: base.title,
    company: base.company ?? "",
    section: section.heading,
    text: section.text,
  };
}

async function buildSummaryChunks() {
  const summary = stripMarkdown(await fs.readFile(SUMMARY_PATH, "utf8"));
  return [
    {
      id: "resume-summary-001",
      source_type: "resume_summary",
      role_id: null,
      title: "Resume Summary",
      company: "",
      section: "Summary",
      text: summary,
    },
  ];
}

async function buildRoleChunks() {
  const files = (await fs.readdir(ROLES_DIR))
    .filter((name) => name.endsWith(".md"))
    .sort();

  const chunks = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(ROLES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const base = {
      id: data.id,
      source_type: "role",
      role_id: data.id,
      title: data.title,
      company: data.company,
    };

    const metadataText = [
      `${data.title} at ${data.company}.`,
      data.location ? `Location: ${data.location}.` : "",
      data.start ? `Dates: ${data.start} to ${data.end || "Present"}.` : "",
      data.clearance ? `Clearance: ${data.clearance}.` : "",
      normalizeArray(data.il_levels).length ? `IL levels: ${normalizeArray(data.il_levels).join(", ")}.` : "",
      normalizeArray(data.tags).length ? `Tags: ${normalizeArray(data.tags).join(", ")}.` : "",
      normalizeArray(data.tech).length ? `Technologies: ${normalizeArray(data.tech).join(", ")}.` : "",
      normalizeArray(data.highlights).length ? `Highlights: ${normalizeArray(data.highlights).join(" ")}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    chunks.push(
      createChunk(base, { heading: "Highlights", text: metadataText }, 0),
    );

    parseSections(content)
      .flatMap(splitOversizedSection)
      .forEach((section, index) => {
        chunks.push(createChunk(base, section, index + 1));
      });
  }

  return chunks;
}

function embeddingEnvPresent() {
  return Boolean(
    process.env.AZURE_OPENAI_ENDPOINT &&
      process.env.AZURE_OPENAI_API_KEY &&
      process.env.AZURE_OPENAI_API_VERSION &&
      process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
  );
}

async function generateEmbeddings(chunks) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "");
  const deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  const response = await fetch(
    `${endpoint}/openai/deployments/${deployment}/embeddings?api-version=${apiVersion}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        input: chunks.map((chunk) => chunk.text),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Embedding request failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  return {
    generated_at: new Date().toISOString(),
    deployment,
    count: chunks.length,
    embeddings: payload.data.map((item, index) => ({
      id: chunks[index].id,
      vector: item.embedding,
    })),
  };
}

async function main() {
  const chunks = [...(await buildSummaryChunks()), ...(await buildRoleChunks())];

  await fs.mkdir(API_DATA_DIR, { recursive: true });
  await fs.writeFile(
    CHUNKS_PATH,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        count: chunks.length,
        chunks,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(`Built ${chunks.length} RAG chunks -> ${path.relative(REPO_ROOT, CHUNKS_PATH)}`);

  if (!embeddingEnvPresent()) {
    await fs.rm(EMBEDDINGS_PATH, { force: true });
    console.log("Skipped embeddings generation: Azure OpenAI embedding env vars are not configured.");
    return;
  }

  const embeddingsPayload = await generateEmbeddings(chunks);
  await fs.writeFile(EMBEDDINGS_PATH, JSON.stringify(embeddingsPayload, null, 2) + "\n", "utf8");
  console.log(`Built ${chunks.length} embeddings -> ${path.relative(REPO_ROOT, EMBEDDINGS_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
