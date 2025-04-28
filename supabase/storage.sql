
-- Create a bucket for file storage if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'files', 'files', false
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'files'
);

-- Set RLS policies for the files bucket
-- Allow authenticated users to insert files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'files' AND
  (auth.uid() = (storage.foldername(name))[1]::uuid)
);

-- Allow users to read their own files
CREATE POLICY "Allow users to read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'files' AND
  (auth.uid() = (storage.foldername(name))[1]::uuid)
);

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'files' AND
  (auth.uid() = (storage.foldername(name))[1]::uuid)
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'files' AND
  (auth.uid() = (storage.foldername(name))[1]::uuid)
);

-- Allow super_admin to access all files
CREATE POLICY "Allow super_admin to access all files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'files' AND
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);
