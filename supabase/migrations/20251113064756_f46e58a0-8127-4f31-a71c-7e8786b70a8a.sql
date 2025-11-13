-- Add phone field to inquiries table
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Fix security warnings: Set search_path for functions
CREATE OR REPLACE FUNCTION public.generate_contact_slug()
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE contact_form_slug = new_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
  END LOOP;
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_contact_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_form_slug IS NULL THEN
    NEW.contact_form_slug := generate_contact_slug();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add comment for documentation
COMMENT ON COLUMN inquiries.phone IS 'Optional phone number from contact form submissions';