-- ============================================================
-- MIGRATION: Multi-User Support mit eigenen Kontaktformularen
-- ============================================================
-- 
-- ANLEITUNG:
-- 1. Öffnen Sie: https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/sql/new
-- 2. Kopieren Sie diesen gesamten SQL-Code
-- 3. Fügen Sie ihn ein und klicken Sie auf "Run"
-- 
-- ============================================================

-- 1. Erweitere profiles Tabelle um Kontaktformular-Slug
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS contact_form_slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS contact_form_title TEXT DEFAULT 'Kontaktformular',
ADD COLUMN IF NOT EXISTS contact_form_description TEXT;

-- 2. Funktion zum Generieren eines eindeutigen Slugs
CREATE OR REPLACE FUNCTION generate_contact_slug()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- 3. Trigger zum automatischen Generieren eines Slugs für neue Profile
CREATE OR REPLACE FUNCTION set_contact_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_form_slug IS NULL THEN
    NEW.contact_form_slug := generate_contact_slug();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_contact_slug_trigger ON profiles;
CREATE TRIGGER set_contact_slug_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_contact_slug();

-- 4. Füge user_id zu inquiries hinzu
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 5. Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_contact_slug ON profiles(contact_form_slug);

-- 6. Aktualisiere Row Level Security Policies für inquiries
DROP POLICY IF EXISTS "Anyone can create inquiries" ON inquiries;
DROP POLICY IF EXISTS "Anyone can view inquiries" ON inquiries;
DROP POLICY IF EXISTS "Anyone can update inquiries" ON inquiries;

-- Jeder kann Anfragen über das Kontaktformular erstellen (ohne Login)
CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- User sehen nur ihre eigenen Anfragen
CREATE POLICY "Users can view their own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

-- User können ihre eigenen Anfragen aktualisieren
CREATE POLICY "Users can update their own inquiries"
  ON inquiries FOR UPDATE
  USING (auth.uid() = user_id);

-- 7. Aktualisiere ai_responses Policies
DROP POLICY IF EXISTS "Anyone can view ai_responses" ON ai_responses;
DROP POLICY IF EXISTS "Anyone can create ai_responses" ON ai_responses;
DROP POLICY IF EXISTS "Anyone can update ai_responses" ON ai_responses;

-- User sehen nur AI-Antworten zu ihren eigenen Anfragen
CREATE POLICY "Users can view ai_responses for their inquiries"
  ON ai_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inquiries 
      WHERE inquiries.id = ai_responses.inquiry_id 
      AND inquiries.user_id = auth.uid()
    )
  );

-- Jeder kann AI-Antworten erstellen (für Webhook/Edge Function)
CREATE POLICY "Service can create ai_responses"
  ON ai_responses FOR INSERT
  WITH CHECK (true);

-- User können AI-Antworten zu ihren Anfragen aktualisieren (approve/reject)
CREATE POLICY "Users can update ai_responses for their inquiries"
  ON ai_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM inquiries 
      WHERE inquiries.id = ai_responses.inquiry_id 
      AND inquiries.user_id = auth.uid()
    )
  );

-- 8. Füge Feld für gesendete Antworten hinzu
ALTER TABLE ai_responses
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sent_by UUID REFERENCES profiles(id);

-- 9. Aktualisiere profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Jeder kann Profil-Slug sehen (für Kontaktformular-Lookup)
CREATE POLICY "Anyone can view profile by slug"
  ON profiles FOR SELECT
  USING (contact_form_slug IS NOT NULL);

-- 10. Lösche alte Testdaten
TRUNCATE TABLE inquiry_queue CASCADE;
TRUNCATE TABLE ai_responses CASCADE;
TRUNCATE TABLE inquiries CASCADE;
TRUNCATE TABLE activity_logs CASCADE;

-- 11. Generiere Slugs für bestehende Profile
UPDATE profiles 
SET contact_form_slug = generate_contact_slug()
WHERE contact_form_slug IS NULL;

-- 12. Kommentar für Dokumentation
COMMENT ON COLUMN profiles.contact_form_slug IS 'Eindeutiger Slug für das Kontaktformular eines Users (z.B. /contact/a1b2c3d4)';
COMMENT ON COLUMN inquiries.user_id IS 'Referenz zum User, dem diese Anfrage gehört';
COMMENT ON COLUMN ai_responses.sent_at IS 'Zeitpunkt, wann die KI-Antwort versendet wurde';
COMMENT ON COLUMN ai_responses.sent_by IS 'User der die Antwort versendet hat';

-- ============================================================
-- MIGRATION ABGESCHLOSSEN!
-- ============================================================
-- 
-- Was wurde gemacht:
-- ✅ Jeder User hat jetzt einen eindeutigen Kontaktformular-Link
-- ✅ Users sehen nur ihre eigenen Anfragen
-- ✅ AI-Antwortvorschläge können angezeigt und versendet werden
-- ✅ Alte Testdaten wurden gelöscht
-- 
-- Nächster Schritt:
-- - Frontend anpassen um die neuen Features zu nutzen
-- 
-- ============================================================
