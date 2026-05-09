# セットアップガイド

このドキュメントは、今後Expoアプリを実装した後のローカル開発手順を想定する。

## 前提

- Node.js LTS
- npm または pnpm
- Expo CLI
- Supabase CLI
- Supabaseアカウント
- OpenAI APIキー

## 1. Expoアプリ作成

```bash
npx create-expo-app@latest . --template
```

TypeScriptテンプレートを選ぶ。

## 2. 必要パッケージ

```bash
npm install @supabase/supabase-js
npm install expo-router react-native-url-polyfill
npm install @tanstack/react-query
npm install react-hook-form zod
npm install expo-image-picker expo-file-system
```

## 3. 環境変数

`.env` を作成する。

```txt
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

OpenAI APIキーは `.env` に入れず、Supabase Edge Functions のsecretsに設定する。

```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

## 4. Supabase初期化

```bash
supabase init
supabase link --project-ref your-project-ref
```

## 5. DB migration

`supabase/migrations` にSQLを作成し、以下を実行する。

```bash
supabase db push
```

## 6. Storage

Supabase Dashboardまたはmigrationで `meal-photos` バケットを作成する。

推奨:

- public: false
- file size limit: MVPでは5MB程度
- allowed mime types: image/jpeg, image/png, image/webp

## 7. Edge Functions

```bash
supabase functions new analyze-meal
supabase functions new analyze-trends
supabase functions new generate-daily-suggestion
```

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

## 8. Expo起動

```bash
npm run start
```

または

```bash
npx expo start
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

## 10. デプロイ方針

MVPではまず開発ビルドまたはExpo Goで検証する。

次の段階:

- EAS Build
- Supabase本番プロジェクト
- Edge Functions本番デプロイ
- OpenAI API利用量の上限設定

