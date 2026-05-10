import { router } from "expo-router";
import { Save, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { FormField } from "@/components/FormField";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth";
import { fromLocalInput, toDateTimeInputValue } from "@/lib/date";
import { dangerFlagLabels, safetyNotice, shouldShowSafetyNotice } from "@/lib/safety";
import { supabase } from "@/lib/supabase";
import { colors, spacing } from "@/styles/theme";
import type { DangerFlag, Symptom } from "@/types/domain";

const symptomLabels: Record<Symptom, string> = {
  no_issue: "問題なし",
  diarrhea: "下痢",
  constipation: "便秘",
  bloating: "お腹の張り",
  heavy_stomach: "胃もたれ",
  nausea: "吐き気"
};

export default function NewConditionScreen() {
  const { userId } = useAuth();
  const [occurredAt, setOccurredAt] = useState(toDateTimeInputValue());
  const [symptoms, setSymptoms] = useState<Symptom[]>(["no_issue"]);
  const [dangerFlags, setDangerFlags] = useState<DangerFlag[]>([]);
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const dangerEntries = useMemo(
    () => Object.entries(dangerFlagLabels) as [DangerFlag, string][],
    []
  );

  const toggleSymptom = (symptom: Symptom) => {
    setSymptoms((current) => {
      if (symptom === "no_issue") return ["no_issue"];
      const withoutNoIssue = current.filter((item) => item !== "no_issue");
      return withoutNoIssue.includes(symptom)
        ? withoutNoIssue.filter((item) => item !== symptom)
        : [...withoutNoIssue, symptom];
    });
  };

  const toggleDanger = (flag: DangerFlag) => {
    setDangerFlags((current) =>
      current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]
    );
  };

  const save = async () => {
    if (!userId) return;
    const finalSymptoms = symptoms.length ? symptoms : ["no_issue"];
    setIsSaving(true);

    const { error } = await supabase.from("body_conditions").insert({
      user_id: userId,
      occurred_at: fromLocalInput(occurredAt),
      symptoms: finalSymptoms,
      danger_flags: dangerFlags.length ? dangerFlags : null,
      memo: memo || null
    });

    setIsSaving(false);
    if (error) {
      Alert.alert("保存できませんでした", error.message);
      return;
    }

    if (shouldShowSafetyNotice(dangerFlags)) {
      Alert.alert("注意が必要な症状があります", safetyNotice, [{ text: "確認しました", onPress: () => router.back() }]);
      return;
    }

    router.back();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Button icon={X} label="閉じる" onPress={() => router.back()} variant="ghost" />
        <AppText variant="title">体調記録</AppText>
        <AppText muted>症状は複数選べます。気になることだけ短く残せば十分です。</AppText>
      </View>

      <Card>
        <AppText variant="subtitle">症状</AppText>
        <View style={styles.chips}>
          {(Object.entries(symptomLabels) as [Symptom, string][]).map(([key, label]) => (
            <Chip key={key} selected={symptoms.includes(key)} onPress={() => toggleSymptom(key)}>
              {label}
            </Chip>
          ))}
        </View>
      </Card>

      <Card style={dangerFlags.length ? styles.dangerCard : undefined}>
        <AppText variant="subtitle" style={dangerFlags.length ? styles.dangerText : undefined}>
          注意が必要な症状
        </AppText>
        <View style={styles.chips}>
          {dangerEntries.map(([key, label]) => (
            <Chip key={key} danger selected={dangerFlags.includes(key)} onPress={() => toggleDanger(key)}>
              {label}
            </Chip>
          ))}
        </View>
        {dangerFlags.length ? <AppText>{safetyNotice}</AppText> : null}
      </Card>

      <Card>
        <FormField label="発生時間" onChangeText={setOccurredAt} value={occurredAt} />
        <FormField
          label="メモ"
          multiline
          onChangeText={setMemo}
          placeholder="例: 夕食後2時間くらいでお腹が張った"
          value={memo}
        />
        <Button disabled={isSaving} icon={Save} label={isSaving ? "保存中" : "保存"} onPress={save} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingTop: spacing.md
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  dangerCard: {
    borderColor: colors.danger
  },
  dangerText: {
    color: colors.danger
  }
});
