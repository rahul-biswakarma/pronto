alter table public.collaborators enable row level security;

-- Users can view collaborators for websites they have access to
create policy "Users can view collaborators" on public.collaborators
  for select
  using (
    exists (
      select 1 from public.collaborators as c
      where c.website_id = collaborators.website_id
      and c.created_by = auth.uid()
    )
  );

-- Only owners can manage collaborators
create policy "Owners can manage collaborators" on public.collaborators
  for all
  using (
    exists (
      select 1 from public.collaborators as c
      where c.website_id = collaborators.website_id
      and c.created_by = auth.uid()
      and c.role = 'owner'
    )
  );
