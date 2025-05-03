create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  email text not null,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  unique (website_id, email)
);
