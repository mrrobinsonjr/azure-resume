import fs from "node:fs/promises";
import path from "path";
import os from "os";
import { exec } from "node:child_process";

const API_DATA_DIR = path.join(process.cwd(), "..", "api", "data");
const CHUNKS_PATH = path.join(API_DATA_DIR, "rag_chunks.json");
const EMBEDDINGS_PATH = path.join(API_DATA_DIR, "rag_embeddings.json");
const BATCH_SIZE = 20; // Azure OpenAI rate limit

function embeddingEnvPresent() {
  return Boolean(
    process.env.AZURE_OPENAI_ENDPOINT &&
      process.env.AZURE_OPENAI_API_KEY &&
      process.env.AZURE_OPENAI_API_VERSION &&
      process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolveIP(host) {
  const output = await new Promise((resolve, reject) => {
    exec(`nslookup ${host}`, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
  // Find the last Address: line (the resolved IP), not the server
  const lines = output.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(/Address:\s+([^\s]+)/);
    if (match && !lines[i].includes("Server:")) {
      return match[1].replace(/^.*#/, "");
    }
  }
  return null;
}

async function generateEmbeddingsBatch(chunks) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "");
  const deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  // Resolve IP upfront for --resolve flag (DNS workaround)
  const host = endpoint.replace(/^https?:\/\//, "");
  const ip = await resolveIP(host);
  const useResolve = Boolean(ip);

  console.log(`Generating embeddings for ${chunks.length} chunks in batches of ${BATCH_SIZE}...`);
  if (useResolve) {
    console.log(`  Using IP ${ip} via --resolve to bypass DNS CNAME issues\n`);
  }

  const allEmbeddings = [];
  let batchNum = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    batchNum++;
    const batch = chunks.slice(i, i + BATCH_SIZE);

    console.log(`  Batch ${batchNum}: processing ${batch.length} chunks...`);

    try {
      // Write JSON body to temp file to avoid shell quoting issues
      const tmpFile = path.join(os.tmpdir(), `embeddings-batch-${Date.now()}-${i}.json`);
      await fs.writeFile(tmpFile, JSON.stringify({ input: batch.map((chunk) => chunk.text) }));

      // Build curl command with --resolve if available (format: hostname:port:IP)
      const resolveArg = useResolve ? `--resolve "${host}:443:${ip}" ` : "";
      const cmd = [
        `curl -s ${resolveArg}`,
        `-X POST '${endpoint}/openai/deployments/${deployment}/embeddings?api-version=${apiVersion}'`,
        '-H "Content-Type: application/json"',
        `-H 'api-key: ${apiKey}'`,
        `--data-binary @${tmpFile}`,
      ].join(" ");

      const output = await new Promise((resolve, reject) => {
        exec(cmd, { timeout: 120000 }, (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout);
        });
      });

      // Clean up temp file
      try { await fs.unlink(tmpFile); } catch {}

      const payload = JSON.parse(output);

      batch.forEach((chunk, index) => {
        allEmbeddings.push({
          id: chunk.id,
          vector: payload.data[index].embedding,
        });
      });

      console.log(`    ✓ Processed ${batch.length} chunks`);

      // Wait between batches to avoid rate limits
      if (i + BATCH_SIZE < chunks.length) {
        console.log("  Waiting 65 seconds for rate limit reset...");
        await sleep(65000);
      }
    } catch (error) {
      throw new Error(`Batch ${batchNum} failed: ${error.message}`);
    }
  }

  return {
    generated_at: new Date().toISOString(),
    deployment,
    count: allEmbeddings.length,
    embeddings: allEmbeddings,
  };
}

async function main() {
  if (!embeddingEnvPresent()) {
    console.error("ERROR: Azure OpenAI embedding env vars are not configured.");
    process.exit(1);
  }

  const chunks = JSON.parse(await fs.readFile(CHUNKS_PATH, "utf8")).chunks;
  console.log(`Loaded ${chunks.length} chunks from ${CHUNKS_PATH}`);

  const embeddingsPayload = await generateEmbeddingsBatch(chunks);

  await fs.writeFile(EMBEDDINGS_PATH, JSON.stringify(embeddingsPayload, null, 2) + "\n", "utf8");
  console.log(`\n✓ Generated ${embeddingsPayload.count} embeddings -> ${EMBEDDINGS_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
