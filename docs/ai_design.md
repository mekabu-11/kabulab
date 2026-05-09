# AI処理設計

## 基本方針

- AIは医療診断をしない
- 原因を断定しない
- 生活ログから見える「候補」「傾向」「次に試す小さな行動」を返す
- 出力はJSONで受け取り、アプリ側で安全に表示する
- AI推定は必ずユーザーが修正できる
- APIキーはSupabase Edge Functionsに置き、Expoアプリには置かない

## 食事写真解析

### 入力

```json
{
  "meal_id": "uuid",
  "photo_url": "signed-url-or-image-input",
  "text_input": "ご飯、鮭、味噌汁",
  "user_note": "食後に少し胃もたれしやすい"
}
```

写真がない場合は `text_input` のみで解析する。

### 出力JSON

```json
{
  "estimated_menu": "鮭定食",
  "items": [
    {
      "name": "白米",
      "estimated_amount": "茶碗1杯",
      "estimated_kcal": 250
    }
  ],
  "nutrition": {
    "kcal": 620,
    "protein_g": 32,
    "fat_g": 18,
    "carbs_g": 82
  },
  "digestive_load_factors": [
    {
      "factor": "脂質がやや多い可能性",
      "reason": "焼き魚や調理油が含まれる可能性があるため",
      "confidence": 0.45
    }
  ],
  "confidence": 0.68,
  "needs_user_review": [
    "白米の量",
    "調理油の量",
    "汁物の具材"
  ],
  "user_facing_note": "写真だけでは量に幅があります。白米の量と油の使用量を確認すると推定が近づきます。"
}
```

### 胃腸負担候補の分類

- 乳製品
- ホエイ
- 脂質多め
- 揚げ物
- 香辛料
- 食物繊維多め
- カフェイン
- アルコール
- 冷たい飲み物
- 一度の量が多い
- 不明

### プロンプト方針

システム指示:

- あなたは食事記録を支援するAIです
- 医療診断をしない
- 写真から断定できない量は幅を持たせる
- 胃腸負担は「可能性」として表現する
- 必ずJSONで返す
- ユーザー確認が必要な項目を明示する

ユーザー指示:

- 写真またはテキストから食事内容を推定する
- kcalとPFCはざっくりでよい
- 胃腸が弱い人にとって負担がありそうな要素を挙げる
- 断定しない

## 体調傾向分析

### 入力

```json
{
  "period": {
    "start": "2026-05-03",
    "end": "2026-05-09"
  },
  "meals": [],
  "body_conditions": [],
  "weights": [],
  "workouts": [],
  "user_profile": {
    "target_weight_kg": 60,
    "target_daily_kcal": 2400,
    "lactose_sensitive": false,
    "weak_stomach_note": "脂質が多いと胃もたれしやすい"
  }
}
```

### 出力JSON

```json
{
  "summary": "直近7日間では、夕食後から翌朝にかけてお腹の張りの記録がやや多い傾向があります。",
  "suspected_factors": [
    {
      "label": "乳製品またはホエイ",
      "reason": "牛乳やプロテインを摂った日の翌朝に下痢の記録が複数あります。",
      "confidence": 0.52,
      "wording": "影響している可能性があります"
    }
  ],
  "timing_patterns": [
    {
      "label": "朝食後より夕食後の不調が多い",
      "reason": "夕食後6-12時間以内の体調記録に症状が集中しています。"
    }
  ],
  "food_compatibility_candidates": [
    {
      "food": "牛乳",
      "direction": "合わない可能性",
      "next_test": "今週は豆乳または乳糖なし牛乳に置き換えて様子を見る"
    }
  ],
  "weight_gain_comment": "体重は大きく増えていませんが、記録上は摂取カロリーが目標に届かない日が多い傾向があります。",
  "today_addition_ideas": [
    {
      "name": "おにぎり1個",
      "estimated_kcal": 180,
      "reason": "脂質が少なく、胃腸負担を増やしにくい候補です。"
    }
  ],
  "next_small_actions": [
    "夕食の脂質を少し控えめにして、代わりに昼間のおにぎりを追加する",
    "ホエイを飲む日は量を半分にして体調を記録する"
  ],
  "safety_notice": {
    "should_show": false,
    "message": null
  }
}
```

## 注意喚起ロジック

AI任せにせず、アプリ側でもルールベースで検知する。

### 即時注意喚起

`body_conditions.danger_flags` に以下が含まれる場合は表示する。

- bloody_stool
- severe_abdominal_pain
- unable_to_hydrate
- high_fever
- rapid_weight_loss
- prolonged_diarrhea
- persistent_vomiting

### 表示文例

```txt
生活記録だけでは判断が難しい症状が含まれています。
症状が強い、長引く、水分が取れない場合は、早めに医療機関へ相談してください。
```

## AIが使う表現

使ってよい表現:

- 可能性があります
- 傾向があります
- 関係しているかもしれません
- 一度試してみる価値があります
- 今週は置き換えて様子を見るとよさそうです
- 症状が続く場合は医療機関への相談を推奨します

避ける表現:

- 原因です
- 診断できます
- 治ります
- 必ず避けてください
- 病名を断定する表現

## 分析時の考え方

- 食事から体調記録までの時間差を見る
- 同じ食材やカテゴリが出た日の症状頻度を見る
- 摂取カロリーと体重変化を見る
- 筋トレ日と食欲、体調、体重の関係を見る
- 記録数が少ない場合は「まだ判断材料が少ない」と明記する

## JSON検証

Edge FunctionではZodなどでレスポンスを検証する。

- JSON parse失敗時はユーザー向けに「解析に失敗しました。手動で記録できます」と表示
- 必須項目が欠ける場合は再試行する
- それでも失敗する場合は手動入力にフォールバックする

