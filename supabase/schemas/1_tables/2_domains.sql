create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  website_id uuid not null references public.websites(id) on delete cascade,
  is_custom boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_domains_domain on public.domains(domain);
create index if not exists idx_domains_user_id on public.domains(user_id);
