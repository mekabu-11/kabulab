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
    const consumedKcal = Number(body.consumed_kcal ?? 0);
    const targetKcal = Number(body.target_kcal ?? 2400);
    const remainingKcal = Math.max(targetKcal - consumedKcal, 0);

    const summary =
      remainingKcal > 500
        ? `今日はあと${remainingKcal}kcalほど足せる余地があります。脂質を増やしすぎず、おにぎり・バナナ・小さめの補食から試すと胃腸負担を抑えやすそうです。`
        : "今日は目標にかなり近づいています。体調メモを残して、明日の食べやすさにつなげましょう。";

    const content = {
      summary,
      remaining_kcal: remainingKcal,
      ideas: remainingKcal > 500 ? ["おにぎり1個", "バナナと豆乳", "小さめのうどん"] : ["水分補給", "体調メモ"]
    };

    await supabase.from("ai_suggestions").insert({
      user_id: user.id,
      suggestion_type: "daily_tip",
      title: "今日の一言",
      summary,
      content,
      prompt_version: "daily-rule-v1"
    });

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

