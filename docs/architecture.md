# アーキテクチャ設計

## 技術スタック

### フロントエンド

- Expo
- React Native
- TypeScript
- Expo Router
- React Hook Form
- Zod
- TanStack Query
- Supabase JavaScript Client

### バックエンド

- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Edge Functions

### AI

- OpenAI API
- Vision対応モデルによる食事写真解析
- テキストモデルによる傾向分析

## 全体構成

```txt
Expo App
  |
  | Supabase Auth / DB / Storage
  v
Supabase
  |-- Auth
  |-- PostgreSQL
  |-- Storage: meal-photos
  |-- Edge Functions
        |-- analyze-meal
        |-- analyze-trends
        |-- generate-daily-suggestion
              |
              v
          OpenAI API
```

## 主要データフロー

### 食事写真解析

1. Expoアプリで写真を選択する
2. Supabase Storage の `meal-photos` バケットにアップロードする
3. `meals` に下書きレコードを作成する
4. Edge Function `analyze-meal` を呼び出す
5. Edge Function が Storage の署名付きURLまたは画像データを使って OpenAI API に送る
6. AI推定結果をアプリに返す
7. ユーザーが修正する
8. 確定内容を `meals` に保存する

### 体調傾向分析

1. アプリが `analyze-trends` を呼び出す
2. Edge Function が直近7日間の `meals`, `body_conditions`, `weights`, `workouts` を取得する
3. OpenAI API に構造化データを渡す
4. AIが断定を避けた分析結果をJSONで返す
5. 結果を `ai_suggestions` に保存する
6. アプリが分析画面に表示する

## Supabase Edge Functions

### analyze-meal

目的:
食事写真またはテキストから、メニュー、kcal、PFC、胃腸負担候補を推定する。

入力:

- `meal_id`
- `photo_path`
- `text_input`
- `user_note`

出力:

- 推定メニュー
- 推定kcal
- 推定PFC
- 胃腸負担候補
- 信頼度
- ユーザー確認が必要な項目

### analyze-trends

目的:
直近ログから、食事と体調の関連候補、増量進捗、次の改善案を出す。

入力:

- `period_start`
- `period_end`

出力:

- 怪しい原因候補
- 食事タイミングの傾向
- 食材相性候補
- 改善提案
- 注意喚起

### generate-daily-suggestion

目的:
ホーム画面用の短い一言提案を生成する。

入力:

- 今日の摂取カロリー
- 今日の目標カロリー
- 直近体調
- 直近食事

出力:

- 一言提案
- 今日足しやすい食事案

## 認証と認可

- Supabase Auth を使用する
- `auth.users.id` と `public.users.id` を1:1で紐づける
- 全テーブルで Row Level Security を有効にする
- ユーザーは `user_id = auth.uid()` のデータのみ参照・更新できる
- Edge Functions は認証済みユーザーのみ実行できる

## Storage 設計

### バケット

- `meal-photos`

### パス例

```txt
meal-photos/{user_id}/{yyyy}/{mm}/{meal_id}.jpg
```

### 権限

- 非公開バケット
- ユーザーは自分のパスのみアップロード可能
- 画像解析時は Edge Function 側で署名付きURLを発行する

## アプリ側ディレクトリ案

```txt
app/
  (auth)/
    login.tsx
    signup.tsx
  (tabs)/
    index.tsx
    meals.tsx
    analysis.tsx
    settings.tsx
  meal/new.tsx
  condition/new.tsx
  weight/new.tsx
  workout/new.tsx
src/
  components/
  features/
    meals/
    conditions/
    weights/
    workouts/
    analysis/
  lib/
    supabase.ts
    api.ts
  schemas/
  types/
supabase/
  functions/
    analyze-meal/
    analyze-trends/
    generate-daily-suggestion/
  migrations/
```

## 環境変数

### Expo

```txt
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### Supabase Edge Functions

```txt
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` はEdge Function側だけで使い、Expoアプリには絶対に含めない。

## エラーハンドリング

- AI解析失敗時も手動入力で保存できる
- 画像アップロード失敗時はテキスト記録に切り替えられる
- 分析失敗時は保存済みの最新 `ai_suggestions` を表示する
- ネットワーク不安定時は送信ボタンを二重送信できないようにする

## ログと監視

MVPでは最低限以下を確認する。

- Edge Function のエラーログ
- AIレスポンスのJSON parse失敗
- Storageアップロード失敗
- DB insert/update失敗

AI入力に個人情報を増やしすぎない。必要な食事・体調ログだけを渡す。

