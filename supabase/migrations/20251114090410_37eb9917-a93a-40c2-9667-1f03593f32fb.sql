-- Fix inquiry_queue RLS policy to be service-role only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage inquiry_queue" ON inquiry_queue;

-- Create a policy that blocks all regular user access
-- Edge functions using service role key will bypass RLS
CREATE POLICY "Block all user access to inquiry_queue"
ON inquiry_queue FOR ALL
USING (false);