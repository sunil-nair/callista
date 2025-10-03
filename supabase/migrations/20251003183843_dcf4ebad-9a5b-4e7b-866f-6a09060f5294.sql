-- Create callista schema
CREATE SCHEMA IF NOT EXISTS callista;

-- Move existing table to callista schema
ALTER TABLE public.email_templates SET SCHEMA callista;

-- Recreate the update trigger function in public schema if needed
CREATE OR REPLACE FUNCTION public.update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger on the moved table
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON callista.email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON callista.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_template_updated_at();

-- Update RLS policies
DROP POLICY IF EXISTS "Allow all operations on email templates" ON callista.email_templates;
CREATE POLICY "Allow all operations on email templates"
  ON callista.email_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA callista TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA callista TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA callista TO anon, authenticated, service_role;