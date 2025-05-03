CREATE TYPE canvas_entity_type AS ENUM (
  'html',
  'text',
  'url',
  'scribble',
  'image'
);


create table if not exists public.canvas_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type canvas_entity_type not null,
  content text, -- used for text, url, scribble JSON, etc.
  html_variant_id uuid references public.website_variants(id) on delete set null, -- only for type='html'
  x float not null,
  y float not null,
  width float,
  height float,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
