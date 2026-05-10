import { router } from "expo-router";
import { Save, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { FormField } from "@/components/FormField";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth";
import { toDateInputValue } from "@/lib/date";
import { supabase } from "@/lib/supabase";
import { spacing } from "@/styles/theme";
import type { WorkoutIntensity } from "@/types/domain";

const intensityLabels: Record<WorkoutIntensity, string> = {
  light: "軽め",
  moderate: "普通",
  hard: "きつめ"
};

export default function NewWorkoutScreen() {
  const { userId } = useAuth();
  const [performedOn, setPerformedOn] = useState(toDateInputValue());
  const [exerciseName, setExerciseName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [intensity, setIntensity] = useState<WorkoutIntensity>("moderate");
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (!userId) return;
    if (!exerciseName.trim()) {
      Alert.alert("種目名を入力してください");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("workouts").insert({
      user_id: userId,
      performed_on: performedOn,
      exercise_name: exerciseName,
      duration_minutes: durationMinutes ? Number(durationMinutes) : null,
      intensity,
      memo: memo || null
    });
    setIsSaving(false);

    if (error) {
      Alert.alert("保存できませんでした", error.message);
      return;
    }

    router.back();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Button icon={X} label="閉じる" onPress={() => router.back()} variant="ghost" />
        <AppText variant="title">筋トレ記録</AppText>
        <AppText muted>まずは種目、時間、強度だけで軽く残します。</AppText>
      </View>

      <Card>
        <FormField label="実施日" onChangeText={setPerformedOn} value={performedOn} />
        <FormField label="種目名" onChangeText={setExerciseName} placeholder="スクワット" value={exerciseName} />
        <FormField keyboardType="numeric" label="時間 分" onChangeText={setDurationMinutes} placeholder="30" value={durationMinutes} />
        <AppText variant="caption" muted>
          強度
        </AppText>
        <View style={styles.chips}>
          {(Object.entries(intensityLabels) as [WorkoutIntensity, string][]).map(([key, label]) => (
            <Chip key={key} selected={intensity === key} onPress={() => setIntensity(key)}>
              {label}
            </Chip>
          ))}
        </View>
        <FormField label="メモ" multiline onChangeText={setMemo} placeholder="フォーム練習、少しきついなど" value={memo} />
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
  }
});
