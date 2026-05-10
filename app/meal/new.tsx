import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, Save, Sparkles, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormField } from "@/components/FormField";
import { Screen } from "@/components/Screen";
import { analyzeMeal, saveMeal, uploadMealPhoto } from "@/features/meals/api";
import { useAuth } from "@/lib/auth";
import { fromLocalInput, toDateTimeInputValue } from "@/lib/date";
import { demoMealAnalysis } from "@/lib/demo";
import { colors, spacing } from "@/styles/theme";
import type { MealAnalysisResult } from "@/types/domain";

export default function NewMealScreen() {
  const { userId, isDemo } = useAuth();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [eatenAt, setEatenAt] = useState(toDateTimeInputValue());
  const [mealName, setMealName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [memo, setMemo] = useState("");
  const [analysis, setAnalysis] = useState<MealAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setPhotoPath(null);
    }
  };

  const runAnalysis = async () => {
    if (!userId) return;
    if (!photoUri && !inputText.trim()) {
      Alert.alert("入力が必要です", "写真か食事内容のどちらかを入れてください。");
      return;
    }

    setIsAnalyzing(true);
    try {
      if (isDemo) {
        const result = demoMealAnalysis;
        setAnalysis(result);
        setMealName(result.estimated_menu);
        setKcal(String(result.nutrition.kcal));
        setProtein(String(result.nutrition.protein_g));
        setFat(String(result.nutrition.fat_g));
        setCarbs(String(result.nutrition.carbs_g));
        return;
      }

      const uploadedPath = photoUri && !photoPath ? await uploadMealPhoto(userId, photoUri) : photoPath;
      if (uploadedPath) setPhotoPath(uploadedPath);

      const result = await analyzeMeal({
        photoPath: uploadedPath,
        textInput: inputText,
        userNote: memo
      });

      setAnalysis(result);
      setMealName(result.estimated_menu);
      setKcal(String(result.nutrition.kcal));
      setProtein(String(result.nutrition.protein_g));
      setFat(String(result.nutrition.fat_g));
      setCarbs(String(result.nutrition.carbs_g));
    } catch (error) {
      Alert.alert("AI解析に失敗しました", error instanceof Error ? error.message : "手動入力で保存できます。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submit = async () => {
    if (!userId) return;
    if (isDemo) {
      Alert.alert("デモ保存しました", "実データには保存せず、入力の流れだけ確認しました。", [
        { text: "OK", onPress: () => router.back() }
      ]);
      return;
    }

    setIsSaving(true);
    try {
      await saveMeal({
        userId,
        eatenAt: fromLocalInput(eatenAt),
        mealName,
        inputText,
        photoUri,
        photoPath,
        kcal: kcal ? Number(kcal) : null,
        proteinG: protein ? Number(protein) : null,
        fatG: fat ? Number(fat) : null,
        carbsG: carbs ? Number(carbs) : null,
        memo,
        analysis
      });
      router.back();
    } catch (error) {
      Alert.alert("保存できませんでした", error instanceof Error ? error.message : "もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Button icon={X} label="閉じる" onPress={() => router.back()} variant="ghost" />
        <AppText variant="title">食事記録</AppText>
        <AppText muted>
          {isDemo ? "デモ中は写真を送信せず、サンプル解析結果を表示します。" : "写真かテキストから始められます。AI推定は保存前に修正できます。"}
        </AppText>
      </View>

      <Card>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : null}
        <Button icon={Camera} label={photoUri ? "写真を変更" : "写真を選ぶ"} onPress={pickImage} variant="secondary" />
        <FormField
          label="食事内容"
          multiline
          onChangeText={setInputText}
          placeholder="例: ご飯、鮭、味噌汁。プロテインも飲んだ"
          value={inputText}
        />
        <FormField
          label="メモ"
          multiline
          onChangeText={setMemo}
          placeholder="胃もたれしやすい、量は少なめなど"
          value={memo}
        />
        <Button disabled={isAnalyzing} icon={Sparkles} label={isAnalyzing ? "解析中" : "AI解析"} onPress={runAnalysis} />
      </Card>

      <Card>
        <AppText variant="subtitle">確認して保存</AppText>
        <FormField label="食事時間" onChangeText={setEatenAt} value={eatenAt} />
        <FormField label="食事名" onChangeText={setMealName} placeholder="鮭定食" value={mealName} />
        <View style={styles.grid}>
          <FormField keyboardType="numeric" label="kcal" onChangeText={setKcal} value={kcal} />
          <FormField keyboardType="decimal-pad" label="P g" onChangeText={setProtein} value={protein} />
          <FormField keyboardType="decimal-pad" label="F g" onChangeText={setFat} value={fat} />
          <FormField keyboardType="decimal-pad" label="C g" onChangeText={setCarbs} value={carbs} />
        </View>

        {analysis ? (
          <View style={styles.analysisBox}>
            <AppText variant="caption" style={styles.aiLabel}>
              AI推定 信頼度 {Math.round(analysis.confidence * 100)}%
            </AppText>
            <AppText>{analysis.user_facing_note}</AppText>
            {analysis.digestive_load_factors.map((factor) => (
              <AppText key={factor.factor} muted>
                ・{factor.factor}: {factor.reason}
              </AppText>
            ))}
          </View>
        ) : null}

        <Button disabled={isSaving} icon={Save} label={isSaving ? "保存中" : "保存"} onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingTop: spacing.md
  },
  photo: {
    aspectRatio: 4 / 3,
    borderRadius: 8,
    width: "100%"
  },
  grid: {
    gap: spacing.sm
  },
  analysisBox: {
    backgroundColor: colors.spotCoolBg,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.sm
  },
  aiLabel: {
    color: colors.spotCool,
    fontWeight: "800"
  }
});
