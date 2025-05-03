create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  website_id uuid not null references public.websites(id) on delete cascade,
  is_custom boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
