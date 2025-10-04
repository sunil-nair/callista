-- Drop the restrictive admin-only policies
DROP POLICY IF EXISTS "Only admins can insert templates" ON public.email_templates;
DROP POLICY IF EXISTS "Only admins can update templates" ON public.email_templates;
DROP POLICY IF EXISTS "Only admins can delete templates" ON public.email_templates;

-- Keep the permissive "Allow all operations" policy that's already in place
-- This allows all authenticated users to perform any operation on email_templates