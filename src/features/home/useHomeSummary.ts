import { useQuery } from "@tanstack/react-query";

import { endOfTodayIso, startOfTodayIso } from "@/lib/date";
import { demoHomeSummary } from "@/lib/demo";
import { supabase } from "@/lib/supabase";

export function useHomeSummary(userId: string | null, isDemo = false) {
  return useQuery({
    queryKey: ["home-summary", userId, isDemo],
    enabled: Boolean(userId) || isDemo,
    queryFn: async () => {
      if (isDemo) return demoHomeSummary;
      if (!userId) throw new Error("Not signed in");

      const todayStart = startOfTodayIso();
      const todayEnd = endOfTodayIso();

      const [profile, meals, conditions, latestSuggestion] = await Promise.all([
        supabase.from("users").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("meals")
          .select("*")
          .eq("user_id", userId)
          .gte("eaten_at", todayStart)
          .lte("eaten_at", todayEnd)
          .order("eaten_at", { ascending: false }),
        supabase
          .from("body_conditions")
          .select("*")
          .eq("user_id", userId)
          .gte("occurred_at", todayStart)
          .lte("occurred_at", todayEnd)
          .order("occurred_at", { ascending: false }),
        supabase
          .from("ai_suggestions")
          .select("*")
          .eq("user_id", userId)
          .eq("suggestion_type", "daily_tip")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      if (profile.error) throw profile.error;
      if (meals.error) throw meals.error;
      if (conditions.error) throw conditions.error;
      if (latestSuggestion.error) throw latestSuggestion.error;

      const targetKcal = profile.data?.target_daily_kcal ?? 2400;
      const consumedKcal = meals.data.reduce(
        (sum, meal) => sum + (meal.confirmed_kcal ?? meal.estimated_kcal ?? 0),
        0
      );
      const remainingKcal = Math.max(targetKcal - consumedKcal, 0);
      const hasIssue = conditions.data.some(
        (condition) => !condition.symptoms.includes("no_issue")
      );

      return {
        profile: profile.data,
        meals: meals.data,
        conditions: conditions.data,
        consumedKcal,
        targetKcal,
        remainingKcal,
        conditionStatus: hasIssue ? "気になる記録あり" : conditions.data.length ? "問題なし" : "未記録",
        suggestion:
          latestSuggestion.data?.summary ??
          "今日はまだAI提案がありません。食事や体調を少し記録すると、傾向に合わせた提案が出せます。"
      };
    }
  });
}
