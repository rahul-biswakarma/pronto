create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  website_id uuid references public.websites(id) on delete set null,
  file_path text not null,
  file_size int not null,
  file_type text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_assets_user_id on public.assets(user_id);
create index if not exists idx_assets_website_id on public.assets(website_id);
