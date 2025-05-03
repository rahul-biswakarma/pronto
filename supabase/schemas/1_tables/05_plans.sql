create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  max_websites int,
  max_routes_per_website int,
  max_llm_requests_per_day int,
  max_storage_mb int,
  created_at timestamp with time zone default now()
);
