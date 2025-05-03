alter table public.invites enable row level security;

create policy "Users can manage their own invites" on public.invites
  for all
  using (auth.uid() = created_by);
