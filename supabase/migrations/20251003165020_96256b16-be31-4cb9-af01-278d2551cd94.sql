-- Add json_template column to store structured template data
ALTER TABLE email_templates
ADD COLUMN json_template JSONB DEFAULT '{"elements": []}'::jsonb;