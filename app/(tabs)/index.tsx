import { router } from "expo-router";
import { Apple, HeartPulse, Plus, Scale } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useHomeSummary } from "@/features/home/useHomeSummary";
import { useAuth } from "@/lib/auth";
import { colors, spacing } from "@/styles/theme";

export default function HomeScreen() {
  const { userId, isDemo } = useAuth();
  const summary = useHomeSummary(userId, isDemo);
  const data = summary.data;

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">今日の増量</AppText>
        <AppText muted>
          {isDemo ? "デモデータで表示中です。Supabase設定なしで画面を確認できます。" : "食べられる量を少しずつ増やして、体調との相性を見ます。"}
        </AppText>
      </View>

      <Card style={styles.calorieCard}>
        <AppText variant="caption" muted>
          今日の摂取カロリー
        </AppText>
        <View style={styles.metricRow}>
          <AppText variant="metric">{data?.consumedKcal ?? 0}</AppText>
          <AppText muted>/ {data?.targetKcal ?? 2400} kcal</AppText>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  ((data?.consumedKcal ?? 0) / (data?.targetKcal ?? 2400)) * 100,
                  100
                )}%`
              }
            ]}
          />
        </View>
        <AppText>
          あと <AppText style={styles.strong}>{data?.remainingKcal ?? 2400} kcal</AppText> 足すと目標です。
        </AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">今日の体調</AppText>
        <AppText>{data?.conditionStatus ?? "読み込み中"}</AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">AIからの一言</AppText>
        <AppText>{data?.suggestion ?? "記録をもとに提案を準備します。"}</AppText>
      </Card>

      <View style={styles.actions}>
        <Button icon={Apple} label="食事記録" onPress={() => router.push("/meal/new")} />
        <Button icon={HeartPulse} label="体調記録" onPress={() => router.push("/condition/new")} variant="secondary" />
        <Button icon={Scale} label="体重記録" onPress={() => router.push("/weight/new")} variant="secondary" />
        <Button icon={Plus} label="筋トレ記録" onPress={() => router.push("/workout/new")} variant="secondary" />
      </View>

      {summary.isError ? (
        <Card>
          <AppText variant="subtitle">接続設定が必要です</AppText>
          <AppText muted>
            Supabaseの環境変数とDB migrationを設定すると、記録と集計が動きます。
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingTop: spacing.md
  },
  calorieCard: {
    gap: spacing.md
  },
  metricRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: spacing.xs
  },
  progressTrack: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: 999,
    height: 12,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: colors.spotCool,
    borderRadius: 999,
    height: 12
  },
  strong: {
    fontWeight: "800"
  },
  actions: {
    gap: spacing.sm
  }
});
