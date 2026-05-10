import { router } from "expo-router";
import { LogOut, Save } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormField } from "@/components/FormField";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { spacing } from "@/styles/theme";

export default function SettingsScreen() {
  const { userId } = useAuth();
  const [targetKcal, setTargetKcal] = useState("2400");
  const [targetWeight, setTargetWeight] = useState("");
  const [weakStomachNote, setWeakStomachNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setTargetKcal(String(data.target_daily_kcal ?? 2400));
        setTargetWeight(data.target_weight_kg ? String(data.target_weight_kg) : "");
        setWeakStomachNote(data.weak_stomach_note ?? "");
      });
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    setIsSaving(true);
    const { error } = await supabase.from("users").upsert({
      id: userId,
      target_daily_kcal: Number(targetKcal) || 2400,
      target_weight_kg: targetWeight ? Number(targetWeight) : null,
      weak_stomach_note: weakStomachNote || null
    });
    setIsSaving(false);

    if (error) {
      Alert.alert("保存できませんでした", error.message);
      return;
    }

    Alert.alert("保存しました", "目標設定を更新しました。");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">設定</AppText>
        <AppText muted>目標カロリーや体質メモを、AI提案の参考にします。</AppText>
      </View>

      <Card>
        <FormField
          keyboardType="numeric"
          label="1日の目標カロリー"
          onChangeText={setTargetKcal}
          placeholder="2400"
          value={targetKcal}
        />
        <FormField
          keyboardType="decimal-pad"
          label="目標体重 kg"
          onChangeText={setTargetWeight}
          placeholder="60.0"
          value={targetWeight}
        />
        <FormField
          label="胃腸の傾向メモ"
          multiline
          onChangeText={setWeakStomachNote}
          placeholder="脂質が多いと胃もたれしやすい"
          value={weakStomachNote}
        />
        <Button disabled={isSaving} icon={Save} label="保存" onPress={save} />
      </Card>

      <Button icon={LogOut} label="ログアウト" onPress={signOut} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingTop: spacing.md
  }
});

