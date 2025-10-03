-- Create email_templates table in public schema
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_shortcode TEXT NOT NULL UNIQUE,
  html TEXT NOT NULL,
  json_template JSONB NOT NULL DEFAULT '{"elements":[],"canvasSize":{"width":375,"height":667}}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON public.email_templates
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.email_templates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.email_templates
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.email_templates
  FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();