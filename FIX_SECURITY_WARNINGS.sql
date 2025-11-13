-- ============================================================
-- FIX: Security Warnings beheben
-- ============================================================
-- 
-- ANLEITUNG:
-- 1. Öffnen Sie: https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/sql/new
-- 2. Kopieren Sie diesen gesamten SQL-Code
-- 3. Fügen Sie ihn ein und klicken Sie auf "Run"
-- 
-- ============================================================

-- FIX 1 & 2: Function Search Path Mutable
-- Setze search_path für beide Funktionen um SQL Injection zu verhindern

DROP FUNCTION IF EXISTS generate_contact_slug();
CREATE OR REPLACE FUNCTION generate_contact_slug()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    -- Generiere einen zufälligen 8-stelligen Slug
    new_slug := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Prüfe ob Slug bereits existiert
    SELECT EXISTS(SELECT 1 FROM profiles WHERE contact_form_slug = new_slug) INTO slug_exists;
    
    -- Wenn Slug nicht existiert, beende Schleife
    EXIT WHEN NOT slug_exists;
  END LOOP;
  
  RETURN new_slug;
END;
$$;

DROP FUNCTION IF EXISTS set_contact_slug();
CREATE OR REPLACE FUNCTION set_contact_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.contact_form_slug IS NULL THEN
    NEW.contact_form_slug := generate_contact_slug();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger neu erstellen
DROP TRIGGER IF EXISTS set_contact_slug_trigger ON profiles;
CREATE TRIGGER set_contact_slug_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_contact_slug();

-- ============================================================
-- FERTIG!
-- ============================================================
-- 
-- Die beiden "Function Search Path Mutable" Warnings sind jetzt behoben.
-- 
-- FIX 3 (Leaked Password Protection) muss in der GUI aktiviert werden:
-- https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/auth/policies
-- Unter "Password Requirements" aktiviere "Check for leaked passwords"
-- 
-- ============================================================
