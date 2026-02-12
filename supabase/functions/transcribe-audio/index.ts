import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const extractNames = formData.get("extract") === "true";
    
    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Step 1: Transcribe with Whisper
    const apiFormData = new FormData();
    apiFormData.append("file", audioFile, audioFile.name);
    apiFormData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Transcription failed: ${errorText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcription = await response.json();
    const text = transcription.text || '';

    if (!text) {
      return new Response(JSON.stringify({ text: "", entries: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: If extract flag is set, extract names in the same call (saves a round trip)
    if (extractNames) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        // Fallback: return just the text
        return new Response(JSON.stringify({ text, entries: [{ name: "", location: "", notes: text }] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `Extract people from transcribed speech. For each person: name, location, notes. IMPORTANT: If a field is NOT mentioned, leave it as an empty string "". Never use placeholder text like "unknown", "not specified", "N/A", or similar. Only include actual information that was spoken. Skip unnamed people unless they have notable details.`
            },
            { role: "user", content: text }
          ],
          tools: [{
            type: "function",
            function: {
              name: "extract_entries",
              description: "Extract people mentioned",
              parameters: {
                type: "object",
                properties: {
                  entries: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        location: { type: "string" },
                        notes: { type: "string" }
                      },
                      required: ["name", "location", "notes"]
                    }
                  }
                },
                required: ["entries"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "extract_entries" } }
        }),
      });

      if (extractResponse.ok) {
        const data = await extractResponse.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          const result = JSON.parse(toolCall.function.arguments);
          if (result.entries && Array.isArray(result.entries)) {
            return new Response(JSON.stringify({ text, ...result }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }

      // Fallback
      return new Response(JSON.stringify({ text, entries: [{ name: "", location: "", notes: text }] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No extraction requested - just return transcription
    return new Response(JSON.stringify(transcription), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Transcription error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});