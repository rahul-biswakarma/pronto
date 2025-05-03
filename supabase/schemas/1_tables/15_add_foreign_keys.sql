-- Add the foreign key constraint that was removed earlier
ALTER TABLE public.routes
  ADD CONSTRAINT fk_routes_published_variant_id
  FOREIGN KEY (published_variant_id)
  REFERENCES public.website_variants(id)
  ON DELETE SET NULL;
