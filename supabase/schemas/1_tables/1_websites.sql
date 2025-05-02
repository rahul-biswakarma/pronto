create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_by uuid not null references auth.users(id) on delete cascade,
  domain text not null unique,
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_first_visit boolean default true
);

create index if not exists idx_websites_created_by on public.websites(created_by);
