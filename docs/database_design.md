# データベース設計

Supabase PostgreSQL を前提にする。すべてのユーザー所有データには `user_id` を持たせ、Row Level Security で本人のみアクセス可能にする。

## 共通方針

- 主キーは `uuid`
- `created_at`, `updated_at` を基本的に持つ
- 金額や厳密な栄養計算ではないため、kcal/PFCは推定値として扱う
- AI推定値とユーザー確定値を区別できるようにする
- 医療診断に見えるカラム名は避け、生活記録として扱う

## users

Supabase Auth の `auth.users` と1:1で対応するプロフィールテーブル。

| カラム名 | 型 | nullable | index | relation | 備考 |
|---|---:|---:|---|---|---|
| id | uuid | no | primary | auth.users(id) | AuthユーザーIDと同一 |
| display_name | text | yes | no | - | 表示名 |
| target_weight_kg | numeric(5,2) | yes | no | - | 目標体重 |
| target_daily_kcal | integer | yes | no | - | 1日の目標kcal |
| lactose_sensitive | boolean | no | no | - | 初期値 false |
| weak_stomach_note | text | yes | no | - | 胃腸の傾向メモ |
| created_at | timestamptz | no | no | - | default now() |
| updated_at | timestamptz | no | no | - | triggerで更新 |

## meals

食事記録。写真・テキスト入力の両方に対応する。

| カラム名 | 型 | nullable | index | relation | 備考 |
|---|---:|---:|---|---|---|
| id | uuid | no | primary | - | default gen_random_uuid() |
| user_id | uuid | no | yes | users(id) | RLS対象 |
| eaten_at | timestamptz | no | yes | - | 食事時間 |
| meal_name | text | yes | no | - | ユーザー修正後の名称 |
| input_text | text | yes | no | - | ユーザー入力の食事内容 |
| photo_path | text | yes | no | storage | Supabase Storage path |
| estimated_kcal | integer | yes | no | - | AI推定 |
| estimated_protein_g | numeric(6,2) | yes | no | - | AI推定 |
| estimated_fat_g | numeric(6,2) | yes | no | - | AI推定 |
| estimated_carbs_g | numeric(6,2) | yes | no | - | AI推定 |
| confirmed_kcal | integer | yes | no | - | ユーザー確定値 |
| confirmed_protein_g | numeric(6,2) | yes | no | - | ユーザー確定値 |
| confirmed_fat_g | numeric(6,2) | yes | no | - | ユーザー確定値 |
| confirmed_carbs_g | numeric(6,2) | yes | no | - | ユーザー確定値 |
| digestive_load_factors | jsonb | yes | no | - | 脂質多め、乳製品など |
| ai_confidence | numeric(3,2) | yes | no | - | 0.00-1.00 |
| needs_user_review | jsonb | yes | no | - | 確認が必要な項目 |
| memo | text | yes | no | - | 食事メモ |
| source | text | no | yes | - | `photo`, `text`, `manual` |
| created_at | timestamptz | no | no | - | default now() |
| updated_at | timestamptz | no | no | - | triggerで更新 |

推奨index:

- `idx_meals_user_eaten_at (user_id, eaten_at desc)`
- `idx_meals_source (source)`

## body_conditions

体調記録。複数症状を `symptoms` に保持する。

| カラム名 | 型 | nullable | index | relation | 備考 |
|---|---:|---:|---|---|---|
| id | uuid | no | primary | - | default gen_random_uuid() |
| user_id | uuid | no | yes | users(id) | RLS対象 |
| occurred_at | timestamptz | no | yes | - | 発生時間 |
| symptoms | text[] | no | no | - | `diarrhea`, `constipation`, `bloating`, `heavy_stomach`, `nausea`, `no_issue` |
| severity | smallint | yes | no | - | 1-5。MVPでは任意 |
| danger_flags | text[] | yes | yes | - | 血便、高熱など |
| memo | text | yes | no | - | 体調メモ |
| created_at | timestamptz | no | no | - | default now() |
| updated_at | timestamptz | no | no | - | triggerで更新 |

推奨index:

- `idx_body_conditions_user_occurred_at (user_id, occurred_at desc)`
- `idx_body_conditions_danger_flags using gin (danger_flags)`

## weights

体重記録。

| カラム名 | 型 | nullable | index | relation | 備考 |
|---|---:|---:|---|---|---|
| id | uuid | no | primary | - | default gen_random_uuid() |
| user_id | uuid | no | yes | users(id) | RLS対象 |
| recorded_on | date | no | yes | - | 記録日 |
| weight_kg | numeric(5,2) | no | no | - | 体重 |
| memo | text | yes | no | - | メモ |
| created_at | timestamptz | no | no | - | default now() |
| updated_at | timestamptz | no | no | - | triggerで更新 |

制約:

- `unique (user_id, recorded_on)` を推奨

推奨index:

- `idx_weights_user_recorded_on (user_id, recorded_on desc)`

## workouts

簡易筋トレ記録。

| カラム名 | 型 | nullable | index | relation | 備考 |
|---|---:|---:|---|---|---|
| id | uuid | no | primary | - | default gen_random_uuid() |
| user_id | uuid | no | yes | users(id) | RLS対象 |
| performed_on | date | no | yes | - | 実施日 |
| exercise_name | text | no | no | - | 種目名 |
| duration_minutes | integer | yes | no | - | 実施時間 |
| intensity | text | yes | yes | - | `light`, `moderate`, `hard` |
| memo | text | yes | no | - | メモ |
| created_at | timestamptz | no | no | - | default now() |
| updated_at | timestamptz | no | no | - | triggerで更新 |

推奨index:

- `idx_workouts_user_performed_on (user_id, performed_on desc)`

## ai_suggestions

AI分析やホームの一言提案を保存する。

| カラム名 | 型 | nullable | index | relation | 備考 |
|---|---:|---:|---|---|---|
| id | uuid | no | primary | - | default gen_random_uuid() |
| user_id | uuid | no | yes | users(id) | RLS対象 |
| suggestion_type | text | no | yes | - | `meal_analysis`, `trend_analysis`, `daily_tip`, `safety_notice` |
| period_start | date | yes | yes | - | 分析期間開始 |
| period_end | date | yes | yes | - | 分析期間終了 |
| title | text | yes | no | - | 表示タイトル |
| summary | text | no | no | - | AI要約 |
| content | jsonb | no | no | - | 構造化結果 |
| model | text | yes | no | - | 使用モデル |
| prompt_version | text | yes | no | - | プロンプト管理 |
| created_at | timestamptz | no | yes | - | default now() |

推奨index:

- `idx_ai_suggestions_user_created_at (user_id, created_at desc)`
- `idx_ai_suggestions_user_type (user_id, suggestion_type)`

## 追加推奨テーブル: user_goal_settings

目標変更履歴を残したい場合に使う。MVPでは `users` に直接持たせてもよい。

| カラム名 | 型 | nullable | index | relation | 備考 |
|---|---:|---:|---|---|---|
| id | uuid | no | primary | - | default gen_random_uuid() |
| user_id | uuid | no | yes | users(id) | RLS対象 |
| target_weight_kg | numeric(5,2) | yes | no | - | 目標体重 |
| target_daily_kcal | integer | yes | no | - | 目標kcal |
| effective_from | date | no | yes | - | 適用開始日 |
| created_at | timestamptz | no | no | - | default now() |

## 追加推奨テーブル: meal_analysis_runs

AI推定の履歴や失敗を追跡したい場合に使う。

| カラム名 | 型 | nullable | index | relation | 備考 |
|---|---:|---:|---|---|---|
| id | uuid | no | primary | - | default gen_random_uuid() |
| user_id | uuid | no | yes | users(id) | RLS対象 |
| meal_id | uuid | yes | yes | meals(id) | 対象食事 |
| status | text | no | yes | - | `success`, `failed` |
| request_input | jsonb | yes | no | - | 個人情報を入れすぎない |
| response_output | jsonb | yes | no | - | AI結果 |
| error_message | text | yes | no | - | 失敗理由 |
| model | text | yes | no | - | 使用モデル |
| created_at | timestamptz | no | yes | - | default now() |

## RLS 方針

各テーブルに以下の基本ポリシーを設定する。

```sql
create policy "Users can read own rows"
on public.meals
for select
using (auth.uid() = user_id);

create policy "Users can insert own rows"
on public.meals
for insert
with check (auth.uid() = user_id);

create policy "Users can update own rows"
on public.meals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own rows"
on public.meals
for delete
using (auth.uid() = user_id);
```

同様のポリシーを `body_conditions`, `weights`, `workouts`, `ai_suggestions` に適用する。

## Enum 候補

PostgreSQL enum にしてもよいが、MVPでは `text` と CHECK 制約でも十分。

- `meal_source`: `photo`, `text`, `manual`
- `workout_intensity`: `light`, `moderate`, `hard`
- `suggestion_type`: `meal_analysis`, `trend_analysis`, `daily_tip`, `safety_notice`

