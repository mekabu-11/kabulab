import type { MealAnalysisResult, TrendAnalysisResult } from "@/types/domain";

export const demoUserId = "demo-user";

export const demoMealAnalysis: MealAnalysisResult = {
  estimated_menu: "鮭おにぎりと豆乳",
  items: [
    {
      name: "鮭おにぎり",
      estimated_amount: "1個",
      estimated_kcal: 190
    },
    {
      name: "豆乳",
      estimated_amount: "200ml",
      estimated_kcal: 95
    }
  ],
  nutrition: {
    kcal: 285,
    protein_g: 13,
    fat_g: 6,
    carbs_g: 44
  },
  digestive_load_factors: [
    {
      factor: "乳製品を避けた補食",
      reason: "豆乳は牛乳やホエイが気になる日の置き換え候補になります。",
      confidence: 0.72
    }
  ],
  confidence: 0.76,
  needs_user_review: ["おにぎりの大きさ", "豆乳の種類"],
  user_facing_note: "デモ解析です。実際の写真解析では量や材料を確認してから保存します。"
};

export const demoTrendAnalysis: TrendAnalysisResult = {
  summary:
    "直近7日間のデモ記録では、目標カロリーに少し届かない日が多く、夕食後に胃もたれの記録が出やすい傾向があります。",
  suspected_factors: [
    {
      label: "夕食の脂質量",
      reason: "揚げ物や脂質が多めの夕食後に、胃もたれの記録が複数あります。",
      confidence: 0.58,
      wording: "影響している可能性があります"
    },
    {
      label: "牛乳・ホエイ",
      reason: "乳製品を摂った翌朝にお腹を壊す記録がやや多いサンプルです。",
      confidence: 0.46,
      wording: "関係しているかもしれません"
    }
  ],
  timing_patterns: [
    {
      label: "午前より夕方の補食が入りやすい",
      reason: "昼食後から夕食前の間に、体調不良の記録が少ないためです。"
    }
  ],
  food_compatibility_candidates: [
    {
      food: "豆乳",
      direction: "試しやすい候補",
      next_test: "ホエイを飲む日は半量にして、豆乳に置き換えた日と比べる"
    }
  ],
  weight_gain_comment:
    "デモ上では体重は横ばいです。まずは1日あたり200kcalほど、胃腸負担の少ない補食で足す方針がよさそうです。",
  today_addition_ideas: [
    {
      name: "おにぎり1個",
      estimated_kcal: 180,
      reason: "脂質が少なく、胃腸負担を増やしにくい候補です。"
    },
    {
      name: "バナナと豆乳",
      estimated_kcal: 190,
      reason: "液体と柔らかい食材で、量を増やしやすい組み合わせです。"
    }
  ],
  next_small_actions: [
    "夕方におにぎり1個を追加して、夜の胃もたれが増えないか見る",
    "ホエイを飲む日は半量にして、翌朝の体調を記録する"
  ],
  safety_notice: {
    should_show: false,
    message: null
  }
};

export const demoHomeSummary = {
  profile: {
    id: demoUserId,
    display_name: "デモユーザー",
    target_weight_kg: 60,
    target_daily_kcal: 2400,
    lactose_sensitive: false,
    weak_stomach_note: "脂質が多い夕食のあとに胃もたれしやすい",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  meals: [],
  conditions: [],
  consumedKcal: 1740,
  targetKcal: 2400,
  remainingKcal: 660,
  conditionStatus: "胃もたれ少し",
  suggestion:
    "夕方におにぎりかバナナと豆乳を足すと、脂質を増やしすぎずにカロリーを追加しやすそうです。"
};

