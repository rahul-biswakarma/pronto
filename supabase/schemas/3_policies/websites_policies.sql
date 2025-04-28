alter table public.websites enable row level security;

create policy "Users can manage their own websites" on public.websites
  for all
  using (auth.uid() = user_id);
