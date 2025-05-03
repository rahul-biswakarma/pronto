alter table public.canvas_workspaces enable row level security;

-- Users can view workspaces for websites they have access to
create policy "Users can view canvas workspaces" on public.canvas_workspaces
  for select
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.website_id = canvas_workspaces.website_id
      and collaborators.created_by = auth.uid()
    )
  );

-- Users with editor or owner role can manage workspaces
create policy "Editors and owners can manage canvas workspaces" on public.canvas_workspaces
  for all
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.website_id = canvas_workspaces.website_id
      and collaborators.created_by = auth.uid()
      and collaborators.role in ('editor', 'owner')
    )
  );
