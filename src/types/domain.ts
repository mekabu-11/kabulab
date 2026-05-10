export type MealSource = "photo" | "text" | "manual";
export type WorkoutIntensity = "light" | "moderate" | "hard";

export type Symptom =
  | "diarrhea"
  | "constipation"
  | "bloating"
  | "heavy_stomach"
  | "nausea"
  | "no_issue";

export type DangerFlag =
  | "bloody_stool"
  | "severe_abdominal_pain"
  | "unable_to_hydrate"
  | "high_fever"
  | "rapid_weight_loss"
  | "prolonged_diarrhea"
  | "persistent_vomiting";

export type MealAnalysisResult = {
  estimated_menu: string;
  items: {
    name: string;
    estimated_amount?: string;
    estimated_kcal?: number;
  }[];
  nutrition: {
    kcal: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };
  digestive_load_factors: {
    factor: string;
    reason: string;
    confidence: number;
  }[];
  confidence: number;
  needs_user_review: string[];
  user_facing_note: string;
};

export type TrendAnalysisResult = {
  summary: string;
  suspected_factors: {
    label: string;
    reason: string;
    confidence: number;
    wording: string;
  }[];
  timing_patterns: {
    label: string;
    reason: string;
  }[];
  food_compatibility_candidates: {
    food: string;
    direction: string;
    next_test: string;
  }[];
  weight_gain_comment: string;
  today_addition_ideas: {
    name: string;
    estimated_kcal: number;
    reason: string;
  }[];
  next_small_actions: string[];
  safety_notice: {
    should_show: boolean;
    message: string | null;
  };
};
