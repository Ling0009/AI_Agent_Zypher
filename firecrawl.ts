// firecrawl.ts
export async function firecrawlScrape(url: string) {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY not set");
  }

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firecrawl error: ${text}`);
  }

  const data = await res.json();

  return {
    url,
    markdown: data?.data?.markdown ?? "",
  };
}
