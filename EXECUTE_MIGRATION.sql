-- ============================================
-- QUICK EXECUTE: Company Profile Extension
-- ============================================
-- Du kannst diese Datei direkt in Supabase SQL Editor ausführen
-- ODER über CLI: npx supabase db push

-- Führe die Migration aus
\i supabase/migrations/20251113_add_company_profile_fields.sql

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- 1. Check if columns were added
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
    AND column_name IN (
        'industry', 
        'company_size', 
        'company_description',
        'services_offered',
        'ai_instructions',
        'auto_response_enabled'
    )
ORDER BY column_name;

-- 2. Check if view was created
SELECT * FROM information_schema.views 
WHERE table_name = 'ai_company_context' 
    AND table_schema = 'public';

-- 3. Check if trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'update_profiles_timestamp';

-- ============================================
-- SAMPLE DATA (Optional - für Testing)
-- ============================================

-- Update dein eigenes Profil mit Beispieldaten
-- WICHTIG: Ersetze 'YOUR_USER_ID' mit deiner tatsächlichen User ID

/*
UPDATE profiles
SET 
    company_name = 'Meine Firma GmbH',
    industry = 'IT & Software',
    company_size = '11-50',
    founded_year = 2020,
    company_description = 'Wir sind ein innovatives Softwareunternehmen mit Fokus auf KI-Lösungen für den Mittelstand.',
    phone = '+43 1 234 5678',
    email = 'office@meinefirma.at',
    website = 'https://www.meinefirma.at',
    street = 'Hauptstraße',
    street_number = '123',
    postal_code = '1010',
    city = 'Wien',
    country = 'Österreich',
    services_offered = '["Webentwicklung", "KI-Beratung", "Cloud Services"]'::jsonb,
    target_audience = 'KMUs in Österreich und Deutschland',
    company_values = '["Innovation", "Qualität", "Kundenzufriedenheit"]'::jsonb,
    unique_selling_points = '["20+ Jahre Erfahrung", "100% Made in Austria", "24/7 Support"]'::jsonb,
    preferred_tone = 'professional',
    preferred_language = 'de',
    inquiry_categories = '["Produktanfrage", "Support", "Vertrieb", "Partnerschaft"]'::jsonb,
    auto_categorization_enabled = true,
    auto_response_enabled = false,
    profile_completed = true,
    business_hours = '{
        "monday": {"open": "09:00", "close": "17:00"},
        "tuesday": {"open": "09:00", "close": "17:00"},
        "wednesday": {"open": "09:00", "close": "17:00"},
        "thursday": {"open": "09:00", "close": "17:00"},
        "friday": {"open": "09:00", "close": "17:00"},
        "saturday": {"closed": true},
        "sunday": {"closed": true}
    }'::jsonb,
    common_faqs = '[
        {
            "question": "Wie lange dauert ein typisches Projekt?",
            "answer": "Die meisten Projekte dauern zwischen 3-6 Monaten, abhängig vom Umfang."
        },
        {
            "question": "Bieten Sie auch Support nach Projektabschluss?",
            "answer": "Ja, wir bieten verschiedene Support-Pakete für die Zeit nach Go-Live an."
        }
    ]'::jsonb
WHERE id = 'YOUR_USER_ID';
*/

-- ============================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- ============================================

-- Get all profile data for current user
-- SELECT * FROM profiles WHERE id = auth.uid();

-- Get AI context for current user
-- SELECT * FROM ai_company_context WHERE id = auth.uid();

-- Get all inquiries with their AI responses
-- SELECT 
--     i.id,
--     i.subject,
--     i.ai_category,
--     ar.suggested_response,
--     ar.is_approved
-- FROM inquiries i
-- LEFT JOIN ai_responses ar ON i.id = ar.inquiry_id
-- ORDER BY i.created_at DESC;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration erfolgreich!';
    RAISE NOTICE '📝 Nächste Schritte:';
    RAISE NOTICE '   1. Gehe zu /settings in der App';
    RAISE NOTICE '   2. Fülle dein Firmenprofil aus';
    RAISE NOTICE '   3. Konfiguriere N8N (siehe N8N_INTEGRATION.md)';
    RAISE NOTICE '   4. Teste die KI-Kategorisierung';
    RAISE NOTICE '';
    RAISE NOTICE '📚 Dokumentation:';
    RAISE NOTICE '   - DB_MIGRATION_GUIDE.md';
    RAISE NOTICE '   - N8N_INTEGRATION.md';
END $$;
