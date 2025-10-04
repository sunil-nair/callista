-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow all operations on email templates" ON public.email_templates;

-- Create public access policies (no authentication required)
CREATE POLICY "Public can read templates"
ON public.email_templates
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert templates"
ON public.email_templates
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can update templates"
ON public.email_templates
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete templates"
ON public.email_templates
FOR DELETE
TO anon, authenticated
USING (true);