import { router } from "expo-router";
import { LogIn, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormField } from "@/components/FormField";
import { Screen } from "@/components/Screen";
import { supabase } from "@/lib/supabase";
import { colors, spacing } from "@/styles/theme";

async function ensureProfile(userId: string, email?: string) {
  await supabase.from("users").upsert({
    id: userId,
    display_name: email?.split("@")[0] ?? "ユーザー",
    target_daily_kcal: 2400,
    lactose_sensitive: false
  });
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      Alert.alert("ログインできませんでした", error.message);
      return;
    }

    if (data.user) await ensureProfile(data.user.id, data.user.email ?? undefined);
    router.replace("/(tabs)");
  };

  const signUp = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setIsLoading(false);

    if (error) {
      Alert.alert("登録できませんでした", error.message);
      return;
    }

    if (data.user) await ensureProfile(data.user.id, data.user.email ?? undefined);
    Alert.alert("登録しました", "メール確認が必要な設定の場合は、受信メールを確認してください。");
    router.replace("/(tabs)");
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <AppText variant="title">AI増量コーチ</AppText>
        <AppText muted>
          胃腸に負担をかけすぎず、食事・体調・体重の記録から増量のヒントを見つけます。
        </AppText>
      </View>

      <Card>
        <FormField
          autoCapitalize="none"
          keyboardType="email-address"
          label="メールアドレス"
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
        />
        <FormField
          label="パスワード"
          onChangeText={setPassword}
          placeholder="8文字以上"
          secureTextEntry
          value={password}
        />
        <Button disabled={isLoading} icon={LogIn} label="ログイン" onPress={signIn} />
        <Button disabled={isLoading} icon={UserPlus} label="新規登録" onPress={signUp} variant="secondary" />
      </Card>

      <AppText variant="caption" muted style={styles.notice}>
        このアプリは医療診断ではなく、生活改善と食事記録を支援するためのものです。
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    paddingTop: spacing.xl
  },
  notice: {
    color: colors.muted
  }
});

