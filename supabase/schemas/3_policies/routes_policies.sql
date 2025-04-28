ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- 1. Public can SELECT (read) any route
CREATE POLICY "Public can read routes"
  ON public.routes
  FOR SELECT
  TO public -- this includes 'anon' and 'authenticated' roles
  USING (true);

-- 2. Users can manage (INSERT, UPDATE, DELETE) their own routes
CREATE POLICY "Users can manage their own routes"
  ON public.routes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.websites
      WHERE websites.id = routes.website_id
        AND websites.user_id = auth.uid()
    )
  );
