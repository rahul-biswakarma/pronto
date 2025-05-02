-- Create enum type for canvas entities
CREATE TYPE public.canvas_entity_type AS ENUM (
  'html',
  'text',
  'url',
  'scribble',
  'image'
);
