create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  target_weight_kg numeric(5,2),
  target_daily_kcal integer,
  lactose_sensitive boolean not null default false,
  weak_stomach_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  eaten_at timestamptz not null,
  meal_name text,
  input_text text,
  photo_path text,
  estimated_kcal integer,
  estimated_protein_g numeric(6,2),
  estimated_fat_g numeric(6,2),
  estimated_carbs_g numeric(6,2),
  confirmed_kcal integer,
  confirmed_protein_g numeric(6,2),
  confirmed_fat_g numeric(6,2),
  confirmed_carbs_g numeric(6,2),
  digestive_load_factors jsonb,
  ai_confidence numeric(3,2),
  needs_user_review jsonb,
  memo text,
  source text not null check (source in ('photo', 'text', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.body_conditions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  occurred_at timestamptz not null,
  symptoms text[] not null,
  severity smallint check (severity between 1 and 5),
  danger_flags text[],
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  recorded_on date not null,
  weight_kg numeric(5,2) not null,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recorded_on)
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  performed_on date not null,
  exercise_name text not null,
  duration_minutes integer,
  intensity text check (intensity in ('light', 'moderate', 'hard')),
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  suggestion_type text not null check (
    suggestion_type in ('meal_analysis', 'trend_analysis', 'daily_tip', 'safety_notice')
  ),
  period_start date,
  period_end date,
  title text,
  summary text not null,
  content jsonb not null,
  model text,
  prompt_version text,
  created_at timestamptz not null default now()
);

create index if not exists idx_meals_user_eaten_at on public.meals(user_id, eaten_at desc);
create index if not exists idx_meals_source on public.meals(source);
create index if not exists idx_body_conditions_user_occurred_at on public.body_conditions(user_id, occurred_at desc);
create index if not exists idx_body_conditions_danger_flags on public.body_conditions using gin(danger_flags);
create index if not exists idx_weights_user_recorded_on on public.weights(user_id, recorded_on desc);
create index if not exists idx_workouts_user_performed_on on public.workouts(user_id, performed_on desc);
create index if not exists idx_ai_suggestions_user_created_at on public.ai_suggestions(user_id, created_at desc);
create index if not exists idx_ai_suggestions_user_type on public.ai_suggestions(user_id, suggestion_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_meals_updated_at on public.meals;
create trigger set_meals_updated_at
before update on public.meals
for each row execute function public.set_updated_at();

drop trigger if exists set_body_conditions_updated_at on public.body_conditions;
create trigger set_body_conditions_updated_at
before update on public.body_conditions
for each row execute function public.set_updated_at();

drop trigger if exists set_weights_updated_at on public.weights;
create trigger set_weights_updated_at
before update on public.weights
for each row execute function public.set_updated_at();

drop trigger if exists set_workouts_updated_at on public.workouts;
create trigger set_workouts_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.meals enable row level security;
alter table public.body_conditions enable row level security;
alter table public.weights enable row level security;
alter table public.workouts enable row level security;
alter table public.ai_suggestions enable row level security;

create policy "Users can read own profile" on public.users
for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.users
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can read own meals" on public.meals
for select using (auth.uid() = user_id);

create policy "Users can insert own meals" on public.meals
for insert with check (auth.uid() = user_id);

create policy "Users can update own meals" on public.meals
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own meals" on public.meals
for delete using (auth.uid() = user_id);

create policy "Users can read own conditions" on public.body_conditions
for select using (auth.uid() = user_id);

create policy "Users can insert own conditions" on public.body_conditions
for insert with check (auth.uid() = user_id);

create policy "Users can update own conditions" on public.body_conditions
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own conditions" on public.body_conditions
for delete using (auth.uid() = user_id);

create policy "Users can read own weights" on public.weights
for select using (auth.uid() = user_id);

create policy "Users can insert own weights" on public.weights
for insert with check (auth.uid() = user_id);

create policy "Users can update own weights" on public.weights
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own weights" on public.weights
for delete using (auth.uid() = user_id);

create policy "Users can read own workouts" on public.workouts
for select using (auth.uid() = user_id);

create policy "Users can insert own workouts" on public.workouts
for insert with check (auth.uid() = user_id);

create policy "Users can update own workouts" on public.workouts
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own workouts" on public.workouts
for delete using (auth.uid() = user_id);

create policy "Users can read own suggestions" on public.ai_suggestions
for select using (auth.uid() = user_id);

create policy "Users can insert own suggestions" on public.ai_suggestions
for insert with check (auth.uid() = user_id);

create policy "Users can delete own suggestions" on public.ai_suggestions
for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meal-photos', 'meal-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Users can upload own meal photos" on storage.objects
for insert with check (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can read own meal photos" on storage.objects
for select using (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update own meal photos" on storage.objects
for update using (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own meal photos" on storage.objects
for delete using (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

