alter table public.canvas_entities enable row level security;

-- Users can view canvas entities for websites they have access to
create policy "Users can view canvas entities" on public.canvas_entities
  for select
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.website_id = (
        select website_id from public.website_variants
        where website_variants.id = canvas_entities.html_variant_id
      )
      and collaborators.created_by = auth.uid()
    )
  );

-- Users can manage canvas entities they created
create policy "Users can manage their own canvas entities" on public.canvas_entities
  for all
  using (created_by = auth.uid());
