import { createMarketResearchAgent } from "./agent.ts";
import { MARKET_RESEARCH_SYSTEM_PROMPT } from "./prompts.ts";
import { eachValueFrom } from "rxjs-for-await";

const PORT = Number(Deno.env.get("PORT") ?? 8787);

/* -------------------- utils -------------------- */

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function toStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [String(v).trim()].filter(Boolean);
}

/**
 * Strip internal agent instructions from output.
 * Keeps analytical content only.
 */
function stripInternalPreamble(text: string): string {
  const anchors = [
    "## Assumptions",
    "## Market Definition",
    "## Market Definition and Scope",
  ];

  for (const a of anchors) {
    const idx = text.indexOf(a);
    if (idx !== -1) {
      return text.slice(idx).trim();
    }
  }

  return text.trim();
}

/* -------------------- task builder -------------------- */
/**
 * HARD RULE:
 * System prompt MUST be injected into the task itself.
 * Zypher is task-driven, not chat-driven.
 */
function buildTask(input: {
  freeform?: string;
  topic?: string;
  product?: string;
  competitors?: string[] | string;
  focus?: string[] | string;
}) {
  const freeform = input.freeform?.trim();
  const topic = input.topic?.trim();
  const product = input.product?.trim();

  const competitors = toStringArray(input.competitors);
  const focus = toStringArray(input.focus);

  const lines: string[] = [];

  // 🔒 HARD system prompt injection
  lines.push(MARKET_RESEARCH_SYSTEM_PROMPT.trim());
  lines.push("");
  lines.push("TASK:");
  lines.push("");

  if (freeform) {
    lines.push(`Market analysis request: ${freeform}`);
  } else {
    lines.push(`Market analysis request: ${topic || "General market analysis"}`);
  }

  if (product) lines.push(`Product / Company context: ${product}`);
  if (competitors.length) {
    lines.push(`Known competitors (non-exhaustive): ${competitors.join(", ")}`);
  }
  if (focus.length) {
    lines.push(`Priority focus areas: ${focus.join(", ")}`);
  }

  return lines.join("\n");
}

/* -------------------- agent singleton -------------------- */

let agentPromise:
  | Promise<Awaited<ReturnType<typeof createMarketResearchAgent>>>
  | null = null;

async function getAgent() {
  if (!agentPromise) {
    agentPromise = createMarketResearchAgent();
  }
  return agentPromise;
}

/* -------------------- server -------------------- */

Deno.serve({ port: PORT }, async (req) => {
  const url = new URL(req.url);

  /* ---------- frontend ---------- */
  if (
    req.method === "GET" &&
    (url.pathname === "/" || url.pathname === "/index.html")
  ) {
    const html = await Deno.readTextFile("./public/index.html");
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  /* ---------- static assets ---------- */
  if (req.method === "GET" && url.pathname.startsWith("/public/")) {
    try {
      const path = "." + url.pathname;
      const content = await Deno.readFile(path);
      return new Response(content);
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  /* ---------- API: market research ---------- */
  if (req.method === "POST" && url.pathname === "/api/research") {
    try {
      const body = await req.json();
      const task = buildTask(body);

      if (!task.trim()) {
        return json({ error: "Empty request" }, 400);
      }

      const agent = await getAgent();
      const model =
        Deno.env.get("ZYPHER_MODEL") ?? "claude-sonnet-4-20250514";

      const event$ = agent.runTask(task, model);

      let output = "";

      for await (const event of eachValueFrom(event$)) {
        if (event?.type === "message") {
          const content = event.message?.content;
          if (Array.isArray(content)) {
            for (const c of content) {
              if (c.type === "text" && typeof c.text === "string") {
                output += c.text;
              }
            }
          }
        }
      }

      const cleaned = stripInternalPreamble(output);
      return json({ markdown: cleaned });
    } catch (e) {
      return json({ error: String((e as any)?.message ?? e) }, 500);
    }
  }

  return new Response("Not found", { status: 404 });
});

console.log(`✅ Server running: http://localhost:${PORT}`);
