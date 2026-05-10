import type { DangerFlag } from "@/types/domain";

export const dangerFlagLabels: Record<DangerFlag, string> = {
  bloody_stool: "血便",
  severe_abdominal_pain: "激しい腹痛",
  unable_to_hydrate: "水分が取れない",
  high_fever: "高熱",
  rapid_weight_loss: "急激な体重減少",
  prolonged_diarrhea: "下痢が長期間続く",
  persistent_vomiting: "嘔吐が続く"
};

export const safetyNotice =
  "生活記録だけでは判断が難しい症状が含まれています。症状が強い、長引く、水分が取れない場合は、早めに医療機関へ相談してください。";

export function shouldShowSafetyNotice(flags: DangerFlag[]) {
  return flags.length > 0;
}

