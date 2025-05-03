create table if not exists public.website_variants (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  website_id uuid not null references public.websites(id) on delete cascade,
  html_path text not null,
  is_selected boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_by uuid not null references auth.users(id) on delete cascade,

  CONSTRAINT "html_path_format" CHECK (html_path LIKE 'website_pages/%')
);
