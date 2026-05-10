import { useMutation, useQuery } from "@tanstack/react-query";
import { Brain, RefreshCw } from "lucide-react-native";
import { Alert, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { runTrendAnalysis } from "@/features/analysis/api";
import { useAuth } from "@/lib/auth";
import { demoTrendAnalysis } from "@/lib/demo";
import { supabase } from "@/lib/supabase";
import { colors, spacing } from "@/styles/theme";
import type { TrendAnalysisResult } from "@/types/domain";

export default function AnalysisScreen() {
  const { userId, isDemo } = useAuth();

  const latest = useQuery({
    queryKey: ["latest-analysis", userId, isDemo],
    enabled: Boolean(userId) && !isDemo,
    queryFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("ai_suggestions")
        .select("*")
        .eq("user_id", userId)
        .eq("suggestion_type", "trend_analysis")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.content as TrendAnalysisResult | null;
    }
  });

  const analysis = useMutation({
    mutationFn: isDemo ? async () => demoTrendAnalysis : runTrendAnalysis,
    onSuccess: () => {
      if (!isDemo) latest.refetch();
    },
    onError: (error) => Alert.alert("分析できませんでした", error.message)
  });

  const content = isDemo ? analysis.data ?? demoTrendAnalysis : analysis.data ?? latest.data;

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">分析</AppText>
        <AppText muted>
          {isDemo ? "デモ分析を表示中です。実データはSupabase設定後に使えます。" : "直近7日間の食事・体調・体重・筋トレから、次に試す小さな改善案を出します。"}
        </AppText>
      </View>

      <Button
        disabled={analysis.isPending}
        icon={analysis.isPending ? RefreshCw : Brain}
        label={analysis.isPending ? "分析中" : isDemo ? "デモ分析を更新" : "AI分析を更新"}
        onPress={() => analysis.mutate()}
      />

      {!content ? (
        <Card>
          <AppText variant="subtitle">まだ分析がありません</AppText>
          <AppText muted>数日分の記録がたまったら、AI分析を更新してください。</AppText>
        </Card>
      ) : (
        <>
          <Card>
            <AppText variant="subtitle">直近7日間の傾向</AppText>
            <AppText>{content.summary}</AppText>
          </Card>

          <Card>
            <AppText variant="subtitle">怪しい原因候補</AppText>
            {content.suspected_factors.length ? (
              content.suspected_factors.map((factor) => (
                <View key={factor.label} style={styles.item}>
                  <AppText style={styles.itemTitle}>{factor.label}</AppText>
                  <AppText muted>{factor.reason}</AppText>
                </View>
              ))
            ) : (
              <AppText muted>まだ判断材料が少ないようです。</AppText>
            )}
          </Card>

          <Card>
            <AppText variant="subtitle">今週試す改善案</AppText>
            {content.next_small_actions.map((action) => (
              <AppText key={action}>・{action}</AppText>
            ))}
          </Card>

          <Card>
            <AppText variant="subtitle">増量ペース</AppText>
            <AppText>{content.weight_gain_comment}</AppText>
          </Card>

          {content.safety_notice.should_show ? (
            <Card style={styles.dangerCard}>
              <AppText variant="subtitle" style={styles.dangerText}>
                注意
              </AppText>
              <AppText>{content.safety_notice.message}</AppText>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingTop: spacing.md
  },
  item: {
    gap: spacing.xs
  },
  itemTitle: {
    fontWeight: "800"
  },
  dangerCard: {
    backgroundColor: colors.spotWarmBg,
    borderColor: colors.spotWarm
  },
  dangerText: {
    color: colors.spotWarm
  }
});
