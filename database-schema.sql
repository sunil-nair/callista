-- ============================================
-- Email Template Designer - Database Schema
-- ============================================
-- This script creates a fresh database schema
-- WARNING: Running this will DROP existing tables
-- ============================================

-- Drop existing objects (if any)
-- Drop triggers first
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_email_template_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- Drop tables
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop types
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_shortcode TEXT NOT NULL UNIQUE,
  html TEXT NOT NULL,
  json_template JSONB NOT NULL DEFAULT '{"elements": [], "canvasSize": {"width": 375, "height": 667}}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on api_shortcode for faster lookups
CREATE INDEX idx_email_templates_api_shortcode ON public.email_templates(api_shortcode);

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (no authentication required)
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_email_template_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.email_templates TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_email_template_updated_at() TO anon, authenticated;

-- ============================================
-- Schema creation complete
-- ============================================
