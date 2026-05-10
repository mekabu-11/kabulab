import { daysAgoDate, toDateInputValue } from "@/lib/date";
import { supabase } from "@/lib/supabase";
import type { TrendAnalysisResult } from "@/types/domain";

export async function runTrendAnalysis() {
  const { data, error } = await supabase.functions.invoke<TrendAnalysisResult>("analyze-trends", {
    body: {
      period_start: daysAgoDate(6),
      period_end: toDateInputValue()
    }
  });

  if (error) throw error;
  if (!data) throw new Error("分析結果が空でした。");
  return data;
}

