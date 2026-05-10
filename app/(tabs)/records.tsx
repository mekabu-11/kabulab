import { router } from "expo-router";
import { Apple, Dumbbell, HeartPulse, Scale } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { spacing } from "@/styles/theme";

export default function RecordsScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">記録</AppText>
        <AppText muted>写真でもテキストでも、体調が悪い日は最低限だけで大丈夫です。</AppText>
      </View>

      <Card>
        <AppText variant="subtitle">食事</AppText>
        <AppText muted>写真やメモから、ざっくりkcalとPFCを推定します。</AppText>
        <Button icon={Apple} label="食事を記録" onPress={() => router.push("/meal/new")} />
      </Card>

      <Card>
        <AppText variant="subtitle">体調</AppText>
        <AppText muted>症状をワンタップで残して、食事との関係を見ます。</AppText>
        <Button icon={HeartPulse} label="体調を記録" onPress={() => router.push("/condition/new")} variant="secondary" />
      </Card>

      <Card>
        <AppText variant="subtitle">体重</AppText>
        <AppText muted>日ごとの体重を記録します。短期の上下より傾向を見ます。</AppText>
        <Button icon={Scale} label="体重を記録" onPress={() => router.push("/weight/new")} variant="secondary" />
      </Card>

      <Card>
        <AppText variant="subtitle">筋トレ</AppText>
        <AppText muted>まずは種目、時間、強度だけの簡易記録です。</AppText>
        <Button icon={Dumbbell} label="筋トレを記録" onPress={() => router.push("/workout/new")} variant="secondary" />
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

