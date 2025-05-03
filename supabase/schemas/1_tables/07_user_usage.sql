create table if not exists public.user_usage (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  daily_llm_requests int default 0,
  total_llm_requests int default 0,
  asset_storage_used_mb int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
