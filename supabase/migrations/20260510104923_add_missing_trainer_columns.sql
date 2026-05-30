/*
  # Add missing columns to trainers table

  1. Changes
    - Add `full_name` column (text, default '')
    - Add `email` column (text, default '')
    - Add `address` column (text, default '')

  2. Important Notes
    1. These columns are referenced by the trainer profile UI and edge functions
    2. The trainers table already has: id, skills, mode_of_training, bio, mobile, profile_image_url, date_of_birth, created_at, updated_at
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'full_name') THEN
    ALTER TABLE trainers ADD COLUMN full_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'email') THEN
    ALTER TABLE trainers ADD COLUMN email text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'address') THEN
    ALTER TABLE trainers ADD COLUMN address text DEFAULT '';
  END IF;
END $$;
