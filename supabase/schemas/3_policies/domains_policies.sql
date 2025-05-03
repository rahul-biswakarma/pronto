alter table public.domains enable row level security;

create policy "Users can manage their own domains" on public.domains
  for all
  using (auth.uid() = created_by);
