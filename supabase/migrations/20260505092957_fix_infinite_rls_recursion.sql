/*
  # Fix infinite RLS recursion on profiles table

  1. Problem
    - The "Admins can read all profiles" policy on `profiles` queries `profiles` again
      to check if the current user is an admin, creating infinite recursion.
    - All admin policies on other tables (courses, enrollments, certificates, coupons, payments)
      also query `profiles` to check admin role, which triggers the recursive profiles policy.

  2. Solution
    - Create a security definer function `is_admin()` that checks the user's role
      directly from the `profiles` table with elevated privileges (SECURITY DEFINER),
      bypassing RLS and breaking the recursion cycle.
    - Replace all `EXISTS (SELECT 1 FROM profiles WHERE ...)` checks in RLS policies
      with calls to `is_admin()`.
    - Drop the recursive "Admins can read all profiles" policy and replace it with
      a non-recursive version using `is_admin()`.

  3. Security
    - The `is_admin()` function is SECURITY DEFINER, meaning it runs with the function
      owner's privileges, not the caller's. This is safe because it only reads the
      `role` column for the calling user's own profile row.
    - All existing RLS policies remain restrictive.
*/

-- Step 1: Create a security definer function to check admin role
-- This bypasses RLS when checking the role, breaking the recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Step 2: Replace all admin policies that reference profiles with is_admin()

-- Courses: Admins can manage courses
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Enrollments: Admins can manage enrollments
DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;
CREATE POLICY "Admins can manage enrollments"
  ON enrollments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Certificates: Admins can manage certificates
DROP POLICY IF EXISTS "Admins can manage certificates" ON certificates;
CREATE POLICY "Admins can manage certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Coupons: Admins can manage coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Payments: Admins can manage payments
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Profiles: Replace the recursive admin policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());
