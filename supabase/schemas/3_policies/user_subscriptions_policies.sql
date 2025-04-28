alter table public.user_subscriptions enable row level security;

create policy "Users can view and manage their subscriptions" on public.user_subscriptions
  for all
  using (auth.uid() = user_id);
