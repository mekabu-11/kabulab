import * as FileSystem from "expo-file-system";

import { supabase } from "@/lib/supabase";
import type { MealAnalysisResult } from "@/types/domain";

export type SaveMealInput = {
  userId: string;
  eatenAt: string;
  mealName: string;
  inputText: string;
  photoUri?: string | null;
  photoPath?: string | null;
  kcal?: number | null;
  proteinG?: number | null;
  fatG?: number | null;
  carbsG?: number | null;
  memo?: string | null;
  analysis?: MealAnalysisResult | null;
};

export async function uploadMealPhoto(userId: string, photoUri: string) {
  const fileInfo = await FileSystem.getInfoAsync(photoUri);
  if (!fileInfo.exists) throw new Error("写真ファイルが見つかりませんでした。");

  const response = await fetch(photoUri);
  const arrayBuffer = await response.arrayBuffer();
  const ext = photoUri.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}.${
    ext === "png" ? "png" : "jpg"
  }`;
  const today = new Date();
  const path = `${userId}/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}/${fileName}`;

  const { error } = await supabase.storage.from("meal-photos").upload(path, arrayBuffer, {
    contentType: ext === "png" ? "image/png" : "image/jpeg",
    upsert: false
  });

  if (error) throw error;
  return path;
}

export async function analyzeMeal(input: {
  mealId?: string;
  photoPath?: string | null;
  textInput?: string | null;
  userNote?: string | null;
}) {
  const { data, error } = await supabase.functions.invoke<MealAnalysisResult>("analyze-meal", {
    body: {
      meal_id: input.mealId,
      photo_path: input.photoPath,
      text_input: input.textInput,
      user_note: input.userNote
    }
  });

  if (error) throw error;
  if (!data) throw new Error("AI解析結果が空でした。");
  return data;
}

export async function saveMeal(input: SaveMealInput) {
  const photoPath =
    input.photoPath ?? (input.photoUri ? await uploadMealPhoto(input.userId, input.photoUri) : null);
  const source = photoPath ? "photo" : input.inputText ? "text" : "manual";

  const { error } = await supabase.from("meals").insert({
    user_id: input.userId,
    eaten_at: input.eatenAt,
    meal_name: input.mealName || input.analysis?.estimated_menu || null,
    input_text: input.inputText || null,
    photo_path: photoPath,
    estimated_kcal: input.analysis?.nutrition.kcal ?? null,
    estimated_protein_g: input.analysis?.nutrition.protein_g ?? null,
    estimated_fat_g: input.analysis?.nutrition.fat_g ?? null,
    estimated_carbs_g: input.analysis?.nutrition.carbs_g ?? null,
    confirmed_kcal: input.kcal ?? input.analysis?.nutrition.kcal ?? null,
    confirmed_protein_g: input.proteinG ?? input.analysis?.nutrition.protein_g ?? null,
    confirmed_fat_g: input.fatG ?? input.analysis?.nutrition.fat_g ?? null,
    confirmed_carbs_g: input.carbsG ?? input.analysis?.nutrition.carbs_g ?? null,
    digestive_load_factors: input.analysis?.digestive_load_factors ?? null,
    ai_confidence: input.analysis?.confidence ?? null,
    needs_user_review: input.analysis?.needs_user_review ?? null,
    memo: input.memo || null,
    source
  });

  if (error) throw error;
}
