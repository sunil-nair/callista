-- Drop the conflicting and insecure RLS policies on email_templates
DROP POLICY IF EXISTS "Allow all operations on email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public read access" ON public.email_templates;

-- Add policy for authenticated users to read templates (for the editor UI)
CREATE POLICY "Authenticated users can read templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (true);

-- Note: The get-template edge function uses service role key and bypasses RLS,
-- so templates remain accessible via API shortcode for legitimate email delivery