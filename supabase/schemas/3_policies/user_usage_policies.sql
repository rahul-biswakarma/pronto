alter table public.user_usage enable row level security;

create policy "Users can view their usage" on public.user_usage
  for select
  using (auth.uid() = user_id);

create policy "System can update usage" on public.user_usage
  for update
  using (auth.role() = 'service_role');
