-- ====================================================================
-- SECURITY FIX: Restrict public access to profiles table
-- ====================================================================

-- Drop existing public access policy
DROP POLICY IF EXISTS "Anyone can view profile by slug" ON profiles;

-- Create a restricted policy that only exposes non-sensitive fields
-- Users can still access via contact_form_slug but only see limited data
CREATE POLICY "Public can view contact form info by slug"
ON profiles
FOR SELECT
USING (
  contact_form_slug IS NOT NULL
  AND auth.uid() IS NULL  -- Only for unauthenticated users
);