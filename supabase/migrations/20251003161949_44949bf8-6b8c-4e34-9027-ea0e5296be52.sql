-- Fix search_path security issue - drop trigger first, then recreate function with proper settings
DROP TRIGGER IF EXISTS update_email_template_timestamp ON public.email_templates;
DROP FUNCTION IF EXISTS public.update_email_template_updated_at();

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION public.update_email_template_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_email_template_timestamp
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_template_updated_at();