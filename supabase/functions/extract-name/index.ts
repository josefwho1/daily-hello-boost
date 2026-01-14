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
    const { text } = await req.json();
    
    if (!text) {
      return new Response(JSON.stringify({ name: "", notes: "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that extracts person names from transcribed speech about social interactions.

Given a transcription of someone describing meeting or greeting another person, extract:
1. The name of the person they met (if mentioned)
2. The remaining notes/description

Rules:
- Only extract actual person names, not pronouns or generic references like "the barista", "some guy", "a woman"
- If no specific name is mentioned, return an empty string for name
- Keep the notes natural and include all relevant details
- Don't modify the content, just separate the name from the description`
          },
          {
            role: "user",
            content: `Extract the person's name and notes from this transcription: "${text}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_name_and_notes",
              description: "Extract a person's name and remaining notes from transcribed text",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The person's name if explicitly mentioned, or empty string if not"
                  },
                  notes: {
                    type: "string",
                    description: "The remaining description/notes about the interaction"
                  }
                },
                required: ["name", "notes"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_name_and_notes" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      // Fallback: return text as notes
      return new Response(JSON.stringify({ name: "", notes: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    return new Response(JSON.stringify({ name: "", notes: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Extract name error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
