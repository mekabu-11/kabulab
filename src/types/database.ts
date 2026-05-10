export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string | null;
          target_weight_kg: number | null;
          target_daily_kcal: number | null;
          lactose_sensitive: boolean;
          weak_stomach_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          target_weight_kg?: number | null;
          target_daily_kcal?: number | null;
          lactose_sensitive?: boolean;
          weak_stomach_note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          eaten_at: string;
          meal_name: string | null;
          input_text: string | null;
          photo_path: string | null;
          estimated_kcal: number | null;
          estimated_protein_g: number | null;
          estimated_fat_g: number | null;
          estimated_carbs_g: number | null;
          confirmed_kcal: number | null;
          confirmed_protein_g: number | null;
          confirmed_fat_g: number | null;
          confirmed_carbs_g: number | null;
          digestive_load_factors: Json | null;
          ai_confidence: number | null;
          needs_user_review: Json | null;
          memo: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          eaten_at: string;
          meal_name?: string | null;
          input_text?: string | null;
          photo_path?: string | null;
          estimated_kcal?: number | null;
          estimated_protein_g?: number | null;
          estimated_fat_g?: number | null;
          estimated_carbs_g?: number | null;
          confirmed_kcal?: number | null;
          confirmed_protein_g?: number | null;
          confirmed_fat_g?: number | null;
          confirmed_carbs_g?: number | null;
          digestive_load_factors?: Json | null;
          ai_confidence?: number | null;
          needs_user_review?: Json | null;
          memo?: string | null;
          source: string;
        };
        Update: Partial<Database["public"]["Tables"]["meals"]["Insert"]>;
        Relationships: [];
      };
      body_conditions: {
        Row: {
          id: string;
          user_id: string;
          occurred_at: string;
          symptoms: string[];
          severity: number | null;
          danger_flags: string[] | null;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          occurred_at: string;
          symptoms: string[];
          severity?: number | null;
          danger_flags?: string[] | null;
          memo?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["body_conditions"]["Insert"]>;
        Relationships: [];
      };
      weights: {
        Row: {
          id: string;
          user_id: string;
          recorded_on: string;
          weight_kg: number;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recorded_on: string;
          weight_kg: number;
          memo?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["weights"]["Insert"]>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          performed_on: string;
          exercise_name: string;
          duration_minutes: number | null;
          intensity: string | null;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          performed_on: string;
          exercise_name: string;
          duration_minutes?: number | null;
          intensity?: string | null;
          memo?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
        Relationships: [];
      };
      ai_suggestions: {
        Row: {
          id: string;
          user_id: string;
          suggestion_type: string;
          period_start: string | null;
          period_end: string | null;
          title: string | null;
          summary: string;
          content: Json;
          model: string | null;
          prompt_version: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          suggestion_type: string;
          period_start?: string | null;
          period_end?: string | null;
          title?: string | null;
          summary: string;
          content: Json;
          model?: string | null;
          prompt_version?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ai_suggestions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
