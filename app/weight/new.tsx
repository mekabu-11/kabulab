import { router } from "expo-router";
import { Save, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormField } from "@/components/FormField";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth";
import { toDateInputValue } from "@/lib/date";
import { supabase } from "@/lib/supabase";
import { spacing } from "@/styles/theme";

export default function NewWeightScreen() {
  const { userId } = useAuth();
  const [recordedOn, setRecordedOn] = useState(toDateInputValue());
  const [weight, setWeight] = useState("");
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (!userId) return;
    if (!weight) {
      Alert.alert("体重を入力してください");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("weights")
      .upsert(
        {
          user_id: userId,
          recorded_on: recordedOn,
          weight_kg: Number(weight),
          memo: memo || null
        },
        { onConflict: "user_id,recorded_on" }
      );
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
        <AppText variant="title">体重記録</AppText>
        <AppText muted>日ごとの上下より、数週間の傾向を見るために使います。</AppText>
      </View>

      <Card>
        <FormField keyboardType="decimal-pad" label="体重 kg" onChangeText={setWeight} placeholder="58.4" value={weight} />
        <FormField label="記録日" onChangeText={setRecordedOn} value={recordedOn} />
        <FormField label="メモ" multiline onChangeText={setMemo} placeholder="朝、トイレ後など" value={memo} />
        <Button disabled={isSaving} icon={Save} label={isSaving ? "保存中" : "保存"} onPress={save} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingTop: spacing.md
  }
});
