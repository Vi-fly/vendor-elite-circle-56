
-- Create a storage bucket for supplier documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-docs', 'supplier-docs', true);

-- Set up security policies for the bucket
-- Allow public read access to uploaded files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'supplier-docs');

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'supplier-docs');

-- Allow unauthenticated users to upload files to the bucket
CREATE POLICY "Unauthenticated users can upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'supplier-docs');
