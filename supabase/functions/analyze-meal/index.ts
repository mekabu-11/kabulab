import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const photoPath = body.photo_path as string | null | undefined;
    const textInput = body.text_input as string | null | undefined;
    const userNote = body.user_note as string | null | undefined;

    let imageUrl: string | null = null;
    if (photoPath) {
      const { data, error } = await supabase.storage
        .from("meal-photos")
        .createSignedUrl(photoPath, 60);
      if (error) throw error;
      imageUrl = data.signedUrl;
    }

    const content: Array<Record<string, unknown>> = [
      {
        type: "input_text",
        text: [
          "食事写真またはテキストから、食事内容、推定kcal、PFC、胃腸負担候補を推定してください。",
          "医療診断はせず、断定を避けてください。",
          "必ずJSONのみで返してください。",
          `食事テキスト: ${textInput ?? "なし"}`,
          `ユーザーメモ: ${userNote ?? "なし"}`
        ].join("\n")
      }
    ];

    if (imageUrl) {
      content.push({ type: "input_image", image_url: imageUrl });
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MEAL_MODEL") ?? "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "あなたは食事記録を支援するAIです。医療診断をせず、推定には不確実性を含め、胃腸負担候補は可能性として表現してください。"
          },
          {
            role: "user",
            content
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "meal_analysis",
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "estimated_menu",
                "items",
                "nutrition",
                "digestive_load_factors",
                "confidence",
                "needs_user_review",
                "user_facing_note"
              ],
              properties: {
                estimated_menu: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["name", "estimated_amount", "estimated_kcal"],
                    properties: {
                      name: { type: "string" },
                      estimated_amount: { type: "string" },
                      estimated_kcal: { type: "number" }
                    }
                  }
                },
                nutrition: {
                  type: "object",
                  additionalProperties: false,
                  required: ["kcal", "protein_g", "fat_g", "carbs_g"],
                  properties: {
                    kcal: { type: "number" },
                    protein_g: { type: "number" },
                    fat_g: { type: "number" },
                    carbs_g: { type: "number" }
                  }
                },
                digestive_load_factors: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["factor", "reason", "confidence"],
                    properties: {
                      factor: { type: "string" },
                      reason: { type: "string" },
                      confidence: { type: "number" }
                    }
                  }
                },
                confidence: { type: "number" },
                needs_user_review: {
                  type: "array",
                  items: { type: "string" }
                },
                user_facing_note: { type: "string" }
              }
            }
          }
        }
      })
    });

    if (!openAiResponse.ok) {
      throw new Error(await openAiResponse.text());
    }

    const aiPayload = await openAiResponse.json();
    const parsed = JSON.parse(aiPayload.output_text);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

