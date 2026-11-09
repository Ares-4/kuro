// process-kb: (re)indexes a knowledge-base page into embeddings for the Kuro chat.
//
// Security (2026-11-09): this ran with the service-role key and no auth check, so
// anyone could delete/overwrite knowledge-base pages and burn OpenAI credit.
// Admin-only now.
import { corsHeaders, json, serviceClient, isPrivileged } from "../_shared/security.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await isPrivileged(req))) return json({ error: "Admin only" }, 403);

  try {
    const { pageId, title, content, action } = await req.json();
    const supabaseClient = serviceClient();
    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    if (action === "delete") {
      await supabaseClient.from("kb_pages").delete().eq("id", pageId);
      return json({ success: true });
    }

    if (!openAiKey || openAiKey.includes("sk-proj-placeholder")) {
      return json({ error: "OpenAI API key is not configured" }, 503);
    }
    if (typeof content !== "string" || content.length > 200_000) {
      return json({ error: "Content missing or too large" }, 400);
    }

    const { data: pageData, error: pageError } = await supabaseClient
      .from("kb_pages")
      .upsert({ id: pageId, title, content, updated_at: new Date() })
      .select()
      .single();
    if (pageError) throw pageError;

    await supabaseClient.from("kb_chunks").delete().eq("page_id", pageData.id);

    const chunks = content.split(/\n\s*\n/).filter((c: string) => c.trim().length >= 10);
    for (const chunk of chunks) {
      const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input: chunk, model: "text-embedding-3-small" }),
      });
      const embeddingData = await embeddingResponse.json();
      if (embeddingData.error) throw new Error("OpenAI Error: " + embeddingData.error.message);

      await supabaseClient.from("kb_chunks").insert({
        page_id: pageData.id,
        chunk_text: chunk,
        embedding: embeddingData.data[0].embedding,
      });
    }

    return json({ success: true });
  } catch (error) {
    console.error("process-kb error:", error);
    return json({ error: "Indexing failed" }, 500);
  }
});
