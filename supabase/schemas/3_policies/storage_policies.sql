-- Website pages bucket policies
-- Allow users to read their own website pages
CREATE POLICY "Users can read their own website pages"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'website_pages' AND
    (storage.foldername(name))[1]::text = auth.uid()::text
  );

-- Allow users to create/update their own website pages
CREATE POLICY "Users can create and update their own website pages"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'website_pages' AND
    (storage.foldername(name))[1]::text = auth.uid()::text
  );

CREATE POLICY "Users can update their own website pages"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'website_pages' AND
    (storage.foldername(name))[1]::text = auth.uid()::text
  );

-- Website assets bucket policies
-- Allow users to read their own website assets
CREATE POLICY "Users can read their own website assets"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'website_assets' AND
    (storage.foldername(name))[1]::text = auth.uid()::text
  );

-- Allow users to create/update their own website assets
CREATE POLICY "Users can create and update their own website assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'website_assets' AND
    (storage.foldername(name))[1]::text = auth.uid()::text
  );

CREATE POLICY "Users can update their own website assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'website_assets' AND
    (storage.foldername(name))[1]::text = auth.uid()::text
  );

-- Allow public access to published website files (this depends on websites and routes tables)
CREATE POLICY "Public access to published website files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id IN ('website_pages', 'website_assets') AND
    EXISTS (
      SELECT 1 FROM public.websites w
      JOIN public.routes r ON w.id = r.website_id
      WHERE w.is_published = true AND r.html_file_path = name
    )
  );
