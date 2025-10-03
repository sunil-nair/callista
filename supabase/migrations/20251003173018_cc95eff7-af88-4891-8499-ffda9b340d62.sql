-- Add api_shortcode column to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN api_shortcode TEXT NOT NULL DEFAULT '' UNIQUE;

-- Add constraint to ensure api_shortcode is not empty
ALTER TABLE public.email_templates 
ADD CONSTRAINT api_shortcode_not_empty CHECK (length(api_shortcode) > 0);

-- Create index for faster lookups
CREATE INDEX idx_email_templates_api_shortcode ON public.email_templates(api_shortcode);