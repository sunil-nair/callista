-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table to store user roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop existing overly permissive policies on email_templates
DROP POLICY IF EXISTS "Allow public delete" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public insert" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public update" ON public.email_templates;
DROP POLICY IF EXISTS "Allow all operations on email templates" ON public.email_templates;

-- Keep public read access (needed for API endpoint)
-- Policy "Allow public read access" already exists, so we keep it

-- Create secure policies for write operations (admin only)
CREATE POLICY "Only admins can insert templates"
ON public.email_templates
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update templates"
ON public.email_templates
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete templates"
ON public.email_templates
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for user_roles table (users can view their own roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can assign roles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));