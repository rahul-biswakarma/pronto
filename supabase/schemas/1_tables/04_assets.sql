create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  website_id uuid references public.websites(id) on delete set null,
  file_path text not null,
  file_size int not null,
  file_type text,
  created_at timestamp with time zone default now()
);
