import {
  ZypherAgent,
  AnthropicModelProvider,
  createZypherContext,
} from "@zypher/agent";

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Create a SINGLE Zypher agent.
 * NOTE:
 * - ZypherAgent has NO run()
 * - ZypherAgent ONLY supports runTask()
 */
export async function createMarketResearchAgent() {
  const context = await createZypherContext(Deno.cwd());

  const model = new AnthropicModelProvider({
    apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
  });

  const agent = new ZypherAgent(context, model, {
    mode: "direct",
    enablePlanning: false,
    enableToolUse: false,
    enableReflection: false,
  });

  return agent;
}
