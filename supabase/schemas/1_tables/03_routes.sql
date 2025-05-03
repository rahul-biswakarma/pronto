create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  path text not null,
  published_variant_id uuid, -- Remove the foreign key constraint temporarily
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_by uuid not null references auth.users(id) on delete cascade,

  unique (website_id, path)
);
