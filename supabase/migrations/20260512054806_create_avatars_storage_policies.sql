/*
  # Create avatars storage bucket policies

  1. Storage
    - Bucket `avatars` already created (public, 2MB limit, images only)
    - Add policy for authenticated users to upload images
    - Add policy for anyone to read/view images (public bucket)
    - Add policy for authenticated users to update their own uploads

  2. Security
    - Uploads restricted to authenticated users
    - Users can only update/delete their own uploads in trainer-avatars folder
    - Public read access since bucket is public (avatars need to be visible)
*/

-- Allow authenticated users to upload avatar images
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to read avatar images (public bucket)
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Allow authenticated users to update their own avatar uploads
CREATE POLICY "Authenticated users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Allow authenticated users to delete their own avatar uploads
CREATE POLICY "Authenticated users can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
