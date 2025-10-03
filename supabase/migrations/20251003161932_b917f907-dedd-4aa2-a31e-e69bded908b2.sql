-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_email_templates_created_at ON public.email_templates(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_template_timestamp
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_template_updated_at();

-- Enable RLS (but create permissive policy for now - you can restrict later)
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can add user-based restrictions later)
CREATE POLICY "Allow all operations on email templates"
  ON public.email_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);