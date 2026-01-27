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
      return new Response(JSON.stringify({ entries: [{ name: "", location: "", notes: "" }] }), {
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
            content: `You are a helpful assistant that extracts structured information from transcribed speech about social interactions.

Given a transcription of someone describing meeting or greeting people, extract information about EACH person mentioned separately.

For EACH person mentioned, extract:
1. The name of the person they met (if mentioned)
2. The location/place where they met that specific person (if mentioned)
3. Any notes/description specific to that person

Rules:
- If multiple people are mentioned, create a separate entry for each person
- Only extract actual person names, not pronouns or generic references like "the barista", "some guy", "a woman"
- If no specific name is mentioned for a person, return an empty string for name
- For location, extract places like "coffee shop", "gym", "work", "park", "on the train", etc.
- If no location is mentioned, return an empty string for location
- Keep the notes natural and include all relevant details not captured by name or location
- Don't duplicate information - if something is captured in name or location, don't repeat it in notes
- If only one person is mentioned, return an array with one entry
- Associate the correct details with the correct person when multiple people are mentioned

Examples:
- "I met Sarah at the gym, she was really friendly" → one entry for Sarah
- "I said hi to John at work and then met Emma at the coffee shop later" → two entries, one for John (at work) and one for Emma (at coffee shop)
- "Met three people today - Mike from accounting, Lisa at lunch, and some guy on the bus" → two entries (Mike and Lisa), skip the unnamed person unless there are notable details`
          },
          {
            role: "user",
            content: `Extract information about each person from this transcription: "${text}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_interaction_details",
              description: "Extract details about one or more people from transcribed text",
              parameters: {
                type: "object",
                properties: {
                  entries: {
                    type: "array",
                    description: "Array of entries, one for each person mentioned",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          description: "The person's name if explicitly mentioned, or empty string if not"
                        },
                        location: {
                          type: "string",
                          description: "Where they met this specific person (e.g., 'coffee shop', 'gym', 'work'), or empty string if not mentioned"
                        },
                        notes: {
                          type: "string",
                          description: "The description/notes about the interaction with this person"
                        }
                      },
                      required: ["name", "location", "notes"]
                    }
                  }
                },
                required: ["entries"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_interaction_details" } }
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
      // Fallback: return text as notes in single entry
      return new Response(JSON.stringify({ entries: [{ name: "", location: "", notes: text }] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      // Ensure we always have an entries array
      if (result.entries && Array.isArray(result.entries)) {
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Legacy single-entry fallback
      if (result.name !== undefined || result.location !== undefined || result.notes !== undefined) {
        return new Response(JSON.stringify({ entries: [result] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback
    return new Response(JSON.stringify({ entries: [{ name: "", location: "", notes: text }] }), {
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
