alter table public.assets enable row level security;

create policy "Users can manage their own assets" on public.assets
  for all
  using (auth.uid() = created_by);
