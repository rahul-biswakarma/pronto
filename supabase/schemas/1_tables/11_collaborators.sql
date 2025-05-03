create table if not exists public.collaborators (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  invited_by uuid not null references auth.users(id),
  role text check (role in ('viewer', 'editor', 'owner')) not null default 'editor',
  status text check (status in ('invited', 'accepted', 'declined')) default 'invited',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  unique (website_id, user_id)
);

create index if not exists idx_collaborators_website_id on public.collaborators(website_id);
create index if not exists idx_collaborators_created_by on public.collaborators(created_by);
