# セットアップガイド

このドキュメントは、現在のExpoアプリ実装をローカルで動かすための手順です。

## 前提

- Node.js LTS
- npm または pnpm
- Expo CLI
- Supabase CLI
- Supabaseアカウント
- OpenAI APIキー

## 1. 依存関係のインストール

```bash
npm install --legacy-peer-deps
```

## 2. 環境変数

`.env` を作成する。

```txt
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

OpenAI APIキーは `.env` に入れず、Supabase Edge Functions のsecretsに設定する。

```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

任意でモデル名を変えたい場合:

```bash
supabase secrets set OPENAI_MEAL_MODEL=gpt-4.1-mini
supabase secrets set OPENAI_TREND_MODEL=gpt-4.1-mini
```

## 3. Supabase初期化

```bash
supabase init
supabase link --project-ref your-project-ref
```

## 4. DB migration

以下を実行すると、テーブル、RLS、Storage bucket、Storage policyが作成されます。

```bash
supabase db push
```

作成される主なテーブル:

- `users`
- `meals`
- `body_conditions`
- `weights`
- `workouts`
- `ai_suggestions`

## 5. Storage

`meal-photos` バケットはmigrationで作成されます。

推奨:

- public: false
- file size limit: MVPでは5MB程度
- allowed mime types: image/jpeg, image/png, image/webp

## 6. Edge Functions

ローカル実行:

```bash
supabase functions serve
```

デプロイ:

```bash
supabase functions deploy analyze-meal
supabase functions deploy analyze-trends
supabase functions deploy generate-daily-suggestion
```

## 7. Expo起動

```bash
npm run start
```

または

```bash
npx expo start
```

Webで確認する場合:

```bash
npm run web
```

## 8. 検証コマンド

```bash
npm run typecheck
npm run lint
```

## 9. 動作確認

- ログインできる
- 食事を手動保存できる
- 体調を保存できる
- 体重を保存できる
- 筋トレを保存できる
- 写真をアップロードできる
- AI解析が返る
- 分析画面が表示される

## 10. 実装済みの画面

- ログイン / 新規登録
- ホーム
- 記録
- 分析
- 設定
- 食事記録
- 体調記録
- 体重記録
- 筋トレ記録

## 11. デプロイ方針

MVPではまず開発ビルドまたはExpo Goで検証する。

次の段階:

- EAS Build
- Supabase本番プロジェクト
- Edge Functions本番デプロイ
- OpenAI API利用量の上限設定
