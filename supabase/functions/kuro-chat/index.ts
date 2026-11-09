
import { corsHeaders } from "./cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, sessionId } = await req.json();
    // Abuse guard: this endpoint is public and spends OpenAI credit per call
    if (typeof message !== 'string' || message.trim().length === 0 || message.length > 1000) {
      return new Response(JSON.stringify({ response: "Please send a shorter question (up to 1000 characters).", sources: [], chunks_found: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAiKey || openAiKey.includes('sk-proj-placeholder')) {
       return new Response(JSON.stringify({ 
        response: "I'm currently unable to connect to my brain (OpenAI API Key is missing or invalid). Please contact the administrator to configure the system secrets.",
        sources: [],
        chunks_found: false
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 1. Generate Embedding for Query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: message,
        model: 'text-embedding-3-small'
      })
    });
    
    const embeddingJson = await embeddingResponse.json();
    if (embeddingJson.error) {
        console.error("OpenAI Embedding Error:", embeddingJson.error);
        throw new Error("OpenAI Error: " + embeddingJson.error.message);
    }
    const queryEmbedding = embeddingJson.data[0].embedding;

    // 2. Search for similar chunks
    const { data: chunks, error: matchError } = await supabaseClient.rpc('match_kb_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Sensitivity
      match_count: 5
    });

    if (matchError) throw matchError;

    // 3. Construct System Prompt
    let promptContext = "You are Kuro, a helpful assistant for Kuro Educational Consultancy in Zimbabwe. ";
    let sources = [];
    
    if (chunks && chunks.length > 0) {
      promptContext += "Answer the user's question based ONLY on the following context. If the answer is not in the context, politely refuse to speculate and offer to connect them with a human agent. Do not make up information.\n\nContext:\n";
      chunks.forEach((chunk, idx) => {
        promptContext += `[${idx + 1}] ${chunk.chunk_text}\n`;
        if (!sources.includes(chunk.page_title)) sources.push(chunk.page_title);
      });
    } else {
      promptContext += "You do not have specific information about this query in your knowledge base. Politely inform the user that you can't answer this specific question but they can use the 'Talk to Human' button or book a consultation.";
    }

    // 4. Call OpenAI Chat Completion
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: promptContext },
          { role: 'user', content: message }
        ],
        temperature: 0.3
      })
    });

    const chatData = await chatResponse.json();
    
    if (chatData.error) {
        console.error("OpenAI Chat Error:", chatData.error);
        throw new Error("OpenAI Chat Error: " + chatData.error.message);
    }

    const assistantMessage = chatData.choices[0].message.content;

    // 5. Store Interaction
    if (sessionId) {
      await supabaseClient.from('chat_messages').insert([
        { session_id: sessionId, role: 'user', content: message },
        { session_id: sessionId, role: 'assistant', content: assistantMessage, sources: sources }
      ]);
    }

    return new Response(JSON.stringify({ 
      response: assistantMessage, 
      sources: sources,
      chunks_found: chunks.length > 0
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ 
 response: "I'm having trouble processing your request right now. Please try again later or contact support." 
    }), { 
      status: 200, // Return 200 so frontend doesn't crash, but include error message in body
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
