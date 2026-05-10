import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const dangerFlags = [
  "bloody_stool",
  "severe_abdominal_pain",
  "unable_to_hydrate",
  "high_fever",
  "rapid_weight_loss",
  "prolonged_diarrhea",
  "persistent_vomiting"
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const periodStart = body.period_start;
    const periodEnd = body.period_end;

    const [profile, meals, conditions, weights, workouts] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("eaten_at", `${periodStart}T00:00:00`)
        .lte("eaten_at", `${periodEnd}T23:59:59`)
        .order("eaten_at", { ascending: true }),
      supabase
        .from("body_conditions")
        .select("*")
        .eq("user_id", user.id)
        .gte("occurred_at", `${periodStart}T00:00:00`)
        .lte("occurred_at", `${periodEnd}T23:59:59`)
        .order("occurred_at", { ascending: true }),
      supabase
        .from("weights")
        .select("*")
        .eq("user_id", user.id)
        .gte("recorded_on", periodStart)
        .lte("recorded_on", periodEnd)
        .order("recorded_on", { ascending: true }),
      supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .gte("performed_on", periodStart)
        .lte("performed_on", periodEnd)
        .order("performed_on", { ascending: true })
    ]);

    for (const result of [profile, meals, conditions, weights, workouts]) {
      if (result.error) throw result.error;
    }

    const hasDangerFlag = (conditions.data ?? []).some((condition) =>
      (condition.danger_flags ?? []).some((flag: string) => dangerFlags.includes(flag))
    );

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_TREND_MODEL") ?? "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "あなたは太れない人向けの生活改善コーチです。医療診断をせず、原因を断定せず、可能性・傾向・小さな実験として提案してください。危険症状がある場合は医療機関への相談を推奨してください。"
          },
          {
            role: "user",
            content: JSON.stringify({
              period: { start: periodStart, end: periodEnd },
              user_profile: profile.data,
              meals: meals.data,
              body_conditions: conditions.data,
              weights: weights.data,
              workouts: workouts.data,
              has_danger_flag: hasDangerFlag
            })
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "trend_analysis",
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "summary",
                "suspected_factors",
                "timing_patterns",
                "food_compatibility_candidates",
                "weight_gain_comment",
                "today_addition_ideas",
                "next_small_actions",
                "safety_notice"
              ],
              properties: {
                summary: { type: "string" },
                suspected_factors: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["label", "reason", "confidence", "wording"],
                    properties: {
                      label: { type: "string" },
                      reason: { type: "string" },
                      confidence: { type: "number" },
                      wording: { type: "string" }
                    }
                  }
                },
                timing_patterns: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["label", "reason"],
                    properties: {
                      label: { type: "string" },
                      reason: { type: "string" }
                    }
                  }
                },
                food_compatibility_candidates: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["food", "direction", "next_test"],
                    properties: {
                      food: { type: "string" },
                      direction: { type: "string" },
                      next_test: { type: "string" }
                    }
                  }
                },
                weight_gain_comment: { type: "string" },
                today_addition_ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["name", "estimated_kcal", "reason"],
                    properties: {
                      name: { type: "string" },
                      estimated_kcal: { type: "number" },
                      reason: { type: "string" }
                    }
                  }
                },
                next_small_actions: {
                  type: "array",
                  items: { type: "string" }
                },
                safety_notice: {
                  type: "object",
                  additionalProperties: false,
                  required: ["should_show", "message"],
                  properties: {
                    should_show: { type: "boolean" },
                    message: { type: ["string", "null"] }
                  }
                }
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

    if (hasDangerFlag) {
      parsed.safety_notice = {
        should_show: true,
        message:
          "生活記録だけでは判断が難しい症状が含まれています。症状が強い、長引く、水分が取れない場合は、早めに医療機関へ相談してください。"
      };
    }

    await supabase.from("ai_suggestions").insert({
      user_id: user.id,
      suggestion_type: "trend_analysis",
      period_start: periodStart,
      period_end: periodEnd,
      title: "直近7日間の分析",
      summary: parsed.summary,
      content: parsed,
      model: Deno.env.get("OPENAI_TREND_MODEL") ?? "gpt-4.1-mini",
      prompt_version: "trend-v1"
    });

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

