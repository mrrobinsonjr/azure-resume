import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const SITE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(SITE_ROOT, "..");
const ROLES_DIR = path.join(SITE_ROOT, "content", "roles");
const SUMMARY_PATH = path.join(SITE_ROOT, "content", "resume", "summary.md");
// Education section — rendered on the site and indexed into the RAG knowledge base.
const EDUCATION_PATH = path.join(SITE_ROOT, "content", "resume", "education.md");
// Certifications section — indexed into the RAG knowledge base.
const CERTIFICATIONS_PATH = path.join(SITE_ROOT, "content", "resume", "certifications.md");
// Architecture page — explains the Azure infrastructure decisions behind this site.
const ARCHITECTURE_PATH = path.join(SITE_ROOT, "content", "resume", "architecture.md");
// Additional per-position detail, ingested into the chat knowledge base only
// (not rendered on the site). Associated to a role by matching company + title.
const STARBANK_DIR = path.join(REPO_ROOT, "content", "starBank");
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

async function buildEducationChunks() {
  let raw;
  try {
    raw = await fs.readFile(EDUCATION_PATH, "utf8");
  } catch {
    return []; // education file not yet added — skip silently
  }
  const sections = parseSections(raw);
  if (!sections.length) return [];

  const text = sections[0].text.trim();
  return [
    {
      id: "resume-education-001",
      source_type: "resume_education",
      role_id: null,
      title: "Education",
      company: "",
      section: "Education",
      text,
    },
  ];
}

async function buildCertificationsChunks() {
  let raw;
  try {
    raw = await fs.readFile(CERTIFICATIONS_PATH, "utf8");
  } catch {
    return []; // certifications file not yet added — skip silently
  }
  const sections = parseSections(raw);
  if (!sections.length) return [];

  const text = sections[0].text.trim();

  // Primary chunk with full title
  const primary = {
    id: "resume-certifications-001",
    source_type: "resume_certification",
    role_id: null,
    title: "Certifications & Credentials",
    company: "",
    section: "Certifications",
    text,
  };

  // Alias variants for different query patterns (certificates/credentials/cloud/security)
  const aliases = [
    { id: "resume-certifications-alias-certs", title: "Certificates & Credentials" },
    { id: "resume-certifications-alias-cloud", title: "Cloud Platform Certifications" },
    { id: "resume-certifications-alias-security", title: "Security & Compliance Certifications" },
  ];

  return [primary, ...aliases.map(alias => ({ ...primary, id: alias.id, title: alias.title }))];
}

async function buildQuotaChunks() {
  const chunks = [
    {
      id: "resume-architecture-015",
      source_type: "resume_architecture",
      role_id: null,
      title: "Infrastructure Architecture",
      company: "",
      section: "Rate Limiting & Quota Management",
      text: stripMarkdown(`\
The chat assistant enforces per-IP rate limiting at two layers to protect the OpenAI backend from accidental abuse during heavy recruiter traffic. The first layer is in-memory, tracked per request timestamp with a 10-minute sliding window (configurable via CHAT_RATE_LIMIT_WINDOW_SECONDS and CHAT_RATE_LIMIT_MAX_REQUESTS environment variables — defaults are 600 seconds and 20 requests respectively). When that limit is hit the API returns HTTP 429.

The second layer is durable across Function instances, backed by Azure Table Storage using a fixed-window counter partitioned by sanitized IP hash. It handles cold starts and concurrent workers where in-memory state would otherwise diverge. Both layers fail open on storage errors so chat remains available during outages — availability takes precedence over strict quota enforcement for a public-facing recruiter tool.

Azure OpenAI itself applies its own RPM/TPM limits per deployment, managed via the Azure Portal or ARM templates. The site's Functions API consumes those quotas through managed identity, not shared secrets.`),
    },
  ];

  // Alias variants so queries about "rate limit", "quota", "API cap" still match.
  const aliases = [
    { id: "resume-architecture-015-alias-rate", section: "Rate Limiting Strategy" },
    { id: "resume-architecture-015-alias-quota", section: "OpenAI Quota Handling" },
    { id: "resume-architecture-015-alias-durable", section: "Durable Rate Limiting" },
  ];
  for (const a of aliases) {
    chunks.push({ ...chunks[0], id: a.id, section: a.section });
  }

  return chunks;
}

async function buildArchitectureChunks() {
  let raw;
  try {
    raw = await fs.readFile(ARCHITECTURE_PATH, "utf8");
  } catch {
    return []; // architecture file not yet added — skip silently
  }
  const sections = parseSections(raw);
  if (!sections.length) return [];

  // Each ## section becomes its own RAG chunk for better granularity.
  return sections.map((section, index) => ({
    id: `resume-architecture-${String(index + 1).padStart(3, "0")}`,
    source_type: "resume_architecture",
    role_id: null,
    title: "Infrastructure Architecture",
    company: "",
    section: section.heading,
    text: section.text,
  }));
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

function normKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// Parse a STAR-bank file: a 4-line header (title, company, location, dates)
// followed by "Label:" sections (Role Summary, Responsibilities, ...).
function parseStarBank(raw) {
  const lines = raw.replace(/\r/g, "").split("\n");
  const header = [];
  const sections = [];
  let current = null;
  let sawSection = false;
  const labelRe = /^([A-Z][A-Za-z /&]+):\s*(.*)$/;

  for (const line of lines) {
    const match = line.match(labelRe);
    if (match && match[1].trim().split(/\s+/).length <= 4) {
      if (current) sections.push(current);
      current = { heading: match[1].trim(), lines: [] };
      if (match[2].trim()) current.lines.push(match[2].trim());
      sawSection = true;
      continue;
    }
    if (!sawSection) {
      if (line.trim()) header.push(line.trim());
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);

  return {
    title: header[0] || "",
    company: header[1] || "",
    sections: sections
      .map((section) => ({ heading: section.heading, text: stripMarkdown(section.lines.join("\n").trim()) }))
      .filter((section) => section.text),
  };
}

async function buildDetailChunks() {
  let starFiles;
  try {
    starFiles = (await fs.readdir(STARBANK_DIR)).filter((name) => name.endsWith(".md")).sort();
  } catch {
    return []; // no STAR bank directory present
  }

  const roleFiles = (await fs.readdir(ROLES_DIR)).filter((name) => name.endsWith(".md"));
  const lookup = new Map();
  for (const file of roleFiles) {
    const { data } = matter(await fs.readFile(path.join(ROLES_DIR, file), "utf8"));
    lookup.set(`${normKey(data.company)}||${normKey(data.title)}`, {
      id: data.id,
      title: data.title,
      company: data.company,
    });
  }

  const chunks = [];
  const unmatched = [];
  let matchedFiles = 0;

  for (const file of starFiles) {
    const parsed = parseStarBank(await fs.readFile(path.join(STARBANK_DIR, file), "utf8"));
    const role = lookup.get(`${normKey(parsed.company)}||${normKey(parsed.title)}`);
    if (!role) {
      unmatched.push(file);
      continue;
    }
    matchedFiles += 1;
    const base = {
      id: role.id,
      source_type: "role_detail",
      role_id: role.id,
      title: role.title,
      company: role.company,
    };
    parsed.sections
      .map((section) => ({ heading: `Detail: ${section.heading}`, text: section.text }))
      .flatMap(splitOversizedSection)
      .forEach((section, index) => {
        chunks.push(createChunk(base, section, index));
      });
  }

  if (unmatched.length) {
    console.warn(
      `STAR bank files not matched to a role (skipped): ${unmatched.join(", ")}`,
    );
  }
  console.log(
    `Built ${chunks.length} detail chunks from ${matchedFiles}/${starFiles.length} STAR bank files`,
  );
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
  const chunks = [
    ...(await buildSummaryChunks()),
    ...(await buildEducationChunks()),
    ...(await buildCertificationsChunks()),
    ...(await buildQuotaChunks()),
    ...(await buildArchitectureChunks()),
    ...(await buildRoleChunks()),
    ...(await buildDetailChunks()),
  ];

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
    let existingArtifact = false;
    try {
      await fs.access(EMBEDDINGS_PATH);
      existingArtifact = true;
    } catch {
      existingArtifact = false;
    }

    if (existingArtifact) {
      console.log(
        `Skipped embeddings generation: Azure OpenAI embedding env vars are not configured. Keeping existing artifact at ${path.relative(REPO_ROOT, EMBEDDINGS_PATH)}.`,
      );
    } else {
      console.log("Skipped embeddings generation: Azure OpenAI embedding env vars are not configured.");
    }
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
