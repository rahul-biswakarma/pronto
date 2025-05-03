alter table public.website_variants enable row level security;

-- Users can view variants for websites they have access to
create policy "Users can view website variants" on public.website_variants
  for select
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.website_id = website_variants.website_id
      and collaborators.created_by = auth.uid()
    )
  );

-- Users with editor or owner role can manage variants
create policy "Editors and owners can manage website variants" on public.website_variants
  for all
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.website_id = website_variants.website_id
      and collaborators.created_by = auth.uid()
      and collaborators.role in ('editor', 'owner')
    )
  );
