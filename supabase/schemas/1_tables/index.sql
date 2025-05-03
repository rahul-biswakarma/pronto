-- Consolidated index file for all tables

-- websites indexes
create index if not exists idx_websites_created_by on public.websites(created_by);

-- routes indexes
create index if not exists idx_routes_website_id on public.routes(website_id);

-- user_usage indexes
create index if not exists idx_user_usage_created_by on public.user_usage(created_by);

-- website_variants indexes
create index if not exists idx_website_variants_route_id on public.website_variants(route_id);
create index if not exists idx_website_variants_website_id on public.website_variants(website_id);

-- invites indexes
create index if not exists idx_invites_website_id on public.invites(website_id);
create index if not exists idx_invites_email on public.invites(email);

-- assets indexes
create index if not exists idx_assets_created_by on public.assets(created_by);
create index if not exists idx_assets_website_id on public.assets(website_id);

-- canvas_entities indexes
create index if not exists idx_canvas_entities_variant_id on public.canvas_entities(html_variant_id);

-- domains indexes
create index if not exists idx_domains_domain on public.domains(domain);
create index if not exists idx_domains_created_by on public.domains(created_by);

-- canvas_workspaces indexes
create index if not exists idx_canvas_workspaces_website_id on public.canvas_workspaces(website_id);

-- collaborators indexes
create index if not exists idx_collaborators_website_id on public.collaborators(website_id);
create index if not exists idx_collaborators_created_by on public.collaborators(created_by);
