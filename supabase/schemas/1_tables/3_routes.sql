create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  path text not null,
  html_file_path text not null,
  created_at timestamp with time zone default now(),

  unique (website_id, path)
);

create index if not exists idx_routes_website_id on public.routes(website_id);
