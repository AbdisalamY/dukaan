-- Create the shop_logos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop_logos', 'shop_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the shop_logos bucket
-- Allow authenticated users to upload their own logos
CREATE POLICY "Users can upload their own shop logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'shop_logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own logos
CREATE POLICY "Users can update their own shop logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'shop_logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own logos
CREATE POLICY "Users can delete their own shop logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'shop_logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to all shop logos
CREATE POLICY "Public can view shop logos" ON storage.objects
FOR SELECT USING (bucket_id = 'shop_logos');
