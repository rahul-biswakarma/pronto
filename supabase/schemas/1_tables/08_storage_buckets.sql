-- Add storage bucket configurations for websites and assets
-- Create website_pages bucket for HTML files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website_pages',
  'website_pages',
  true,
  '5242880', -- 5MB limit
  ARRAY['text/html', 'application/json']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create website_assets bucket for images and other media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website_assets',
  'website_assets',
  true,
  '52428800', -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'video/mp4', 'audio/mpeg', 'application/pdf', 'font/woff', 'font/woff2', 'font/ttf']::text[]
)
ON CONFLICT (id) DO NOTHING;
