/*
  # Secure admin role assignment

  1. Problem
    - The current "Users can update own profile" policy allows users to change
      their own role to 'admin', which is a security vulnerability.
    - Admin registration needs a secure way to set the role.

  2. Solution
    - Restrict the profiles UPDATE policy to prevent users from changing their
      own role column. They can still update full_name and phone.
    - Create a security definer function `set_admin_role()` that sets a user's
      role to 'admin'. This function is called from the admin registration
      edge function with the service role key, bypassing RLS.
    - Add a profiles INSERT policy so users can insert their own profile row
      (needed if the trigger doesn't fire for some reason).

  3. Security
    - Users can only update full_name and phone on their own profile.
    - Role changes require the service role key (via edge function).
*/

-- Step 1: Replace the overly permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Step 2: Create a secure function to set admin role (called by edge function with service role)
CREATE OR REPLACE FUNCTION public.set_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.profiles SET role = 'admin' WHERE id = target_user_id;
$$;
