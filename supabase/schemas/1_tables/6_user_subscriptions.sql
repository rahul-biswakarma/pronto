create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  subscribed_at timestamp with time zone default now(),
  expires_at timestamp with time zone,

  unique (user_id)
);
