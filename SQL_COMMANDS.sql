-- ============================================
-- SQL COMMANDS - Direkt ausführbar
-- ============================================
-- Kopiere diese Befehle in den Supabase SQL Editor
-- und führe sie aus, um die Migration durchzuführen

-- WICHTIG: Ersetze 'YOUR_USER_ID' mit deiner User-ID
-- (findest du in: SELECT id FROM auth.users WHERE email = 'deine@email.at';)

-- 1. MIGRATION AUSFÜHREN
-- ============================================
-- Kopiere den KOMPLETTEN Inhalt aus:
-- supabase/migrations/20251113_add_company_profile_fields.sql
-- Hier einfügen und ausführen


-- 2. VERIFICATION - Prüfe ob alles funktioniert
-- ============================================

-- Zeige alle neuen Spalten
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Prüfe ob View erstellt wurde
SELECT * FROM information_schema.views 
WHERE table_name = 'ai_company_context';

-- Teste die View
SELECT * FROM ai_company_context LIMIT 1;


-- 3. OPTIONAL: Beispieldaten einfügen (für Testing)
-- ============================================
-- WICHTIG: Ersetze 'YOUR_USER_ID' mit deiner echten User ID!

/*
UPDATE profiles
SET 
    -- Grunddaten
    company_name = 'Meine Test-Firma GmbH',
    industry = 'IT & Software',
    company_size = '11-50',
    founded_year = 2020,
    tax_id = 'ATU12345678',
    registration_number = 'FN 123456a',
    
    -- Firmenbeschreibung
    company_description = 'Wir sind ein innovatives IT-Unternehmen mit Fokus auf KI-Lösungen und Digitalisierung für den österreichischen Mittelstand. Unsere Mission ist es, Unternehmen durch intelligente Technologie zukunftsfähig zu machen.',
    
    -- Kontakt
    phone = '+43 1 234 5678',
    mobile = '+43 664 123 4567',
    email = 'office@testfirma.at',
    website = 'https://www.testfirma.at',
    
    -- Adresse
    street = 'Musterstraße',
    street_number = '42',
    postal_code = '1010',
    city = 'Wien',
    state = 'Wien',
    country = 'Österreich',
    
    -- Social Media
    social_media = '{
        "linkedin": "test-firma-gmbh",
        "facebook": "testfirma",
        "instagram": "@testfirma"
    }'::jsonb,
    
    -- KI-Kontext
    services_offered = '["Webentwicklung", "Mobile Apps", "KI-Beratung", "Cloud Services", "IT-Support"]'::jsonb,
    
    target_audience = 'Kleine und mittlere Unternehmen (KMU) in Österreich und Deutschland, die ihre Digitalisierung vorantreiben möchten.',
    
    company_values = '["Innovation", "Qualität", "Kundenzufriedenheit", "Nachhaltigkeit"]'::jsonb,
    
    unique_selling_points = '[
        "20+ Jahre Branchenerfahrung",
        "100% Made in Austria",
        "24/7 Support verfügbar",
        "ISO 9001 zertifiziert"
    ]'::jsonb,
    
    -- Kommunikation
    preferred_tone = 'professional',
    preferred_language = 'de',
    
    response_template_intro = 'Sehr geehrte/r [Name],\n\nvielen Dank für Ihre Anfrage. Gerne helfen wir Ihnen weiter.',
    
    response_template_signature = 'Mit freundlichen Grüßen\nIhr Team von Meine Test-Firma GmbH\n\n📞 +43 1 234 5678\n📧 office@testfirma.at\n🌐 www.testfirma.at',
    
    -- Kategorien
    inquiry_categories = '["Produktanfrage", "Support-Ticket", "Vertriebsanfrage", "Partnerschaft", "Bewerbung"]'::jsonb,
    
    -- FAQs
    common_faqs = '[
        {
            "question": "Wie lange dauert ein typisches Webprojekt?",
            "answer": "Die Dauer hängt vom Umfang ab. Einfache Websites: 4-6 Wochen. Komplexe Web-Apps: 3-6 Monate. Wir erstellen Ihnen gerne ein individuelles Angebot."
        },
        {
            "question": "Bieten Sie auch Support nach Projektabschluss?",
            "answer": "Ja, wir bieten verschiedene Support-Pakete an: Basic (Reaktionszeit 48h), Premium (24h) und Enterprise (4h). Alle Pakete beinhalten Updates und Bug-Fixes."
        },
        {
            "question": "In welchen Regionen sind Sie tätig?",
            "answer": "Hauptsächlich in Österreich und Deutschland. Für spezielle Projekte arbeiten wir auch europaweit."
        },
        {
            "question": "Welche Technologien verwenden Sie?",
            "answer": "Wir setzen auf moderne Technologien: React, Node.js, Python, Cloud (Azure, AWS), KI/ML. Die Technologie wählen wir passend zu Ihren Anforderungen."
        }
    ]'::jsonb,
    
    -- KI-Anweisungen
    ai_instructions = 'Wichtige Regeln:
- Bei Preisanfragen immer auf individuelles Angebot hinweisen, keine konkreten Zahlen nennen
- Support-Anfragen innerhalb von 24h beantworten
- Bei technischen Fragen gerne Details zu verwendeten Technologien geben
- Immer auf unsere kostenlose Erstberatung hinweisen
- Links zu relevanten Referenzprojekten einfügen (www.testfirma.at/referenzen)',
    
    important_notes = 'Beachte:
- Keine Projekte unter 5.000€ Volumen
- Mindestlaufzeit Support-Verträge: 6 Monate
- Keine Rush-Jobs (unter 2 Wochen)
- Bei internationalen Projekten: Mehrwertsteuer-Regelungen beachten',
    
    -- Einstellungen
    auto_categorization_enabled = true,
    auto_response_enabled = false,  -- Erst nach Tests aktivieren!
    
    -- Öffnungszeiten
    business_hours = '{
        "monday":    {"open": "09:00", "close": "17:00"},
        "tuesday":   {"open": "09:00", "close": "17:00"},
        "wednesday": {"open": "09:00", "close": "17:00"},
        "thursday":  {"open": "09:00", "close": "17:00"},
        "friday":    {"open": "09:00", "close": "15:00"},
        "saturday":  {"closed": true},
        "sunday":    {"closed": true}
    }'::jsonb,
    
    -- Features
    languages_supported = '["Deutsch", "Englisch"]'::jsonb,
    payment_methods = '["Rechnung", "Kreditkarte", "PayPal", "Vorkasse"]'::jsonb,
    delivery_areas = '["Österreich", "Deutschland", "Schweiz"]'::jsonb,
    certifications = '["ISO 9001:2015", "ÖCERT"]'::jsonb,
    
    -- Branding
    logo_url = 'https://placehold.co/400x200/1e40af/white?text=Meine+Firma',
    brand_colors = '{
        "primary": "#1e40af",
        "secondary": "#64748b",
        "accent": "#10b981"
    }'::jsonb,
    
    -- Meta
    profile_completed = true

WHERE id = 'YOUR_USER_ID';
*/


-- 4. VERIFY DATA - Prüfe deine Daten
-- ============================================

-- Zeige dein aktuelles Profil
-- SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';

-- Zeige AI-Context
-- SELECT * FROM ai_company_context WHERE id = 'YOUR_USER_ID';

-- Zeige nur wichtige KI-Felder
/*
SELECT 
    company_name,
    industry,
    company_description,
    services_offered,
    preferred_tone,
    auto_categorization_enabled,
    auto_response_enabled,
    jsonb_array_length(common_faqs) as faq_count,
    jsonb_array_length(services_offered) as services_count
FROM profiles 
WHERE id = 'YOUR_USER_ID';
*/


-- 5. TEST QUERIES - Für N8N Testing
-- ============================================

-- Query die N8N verwenden wird
/*
SELECT 
    company_name,
    company_description,
    services_offered,
    target_audience,
    company_values,
    unique_selling_points,
    preferred_tone,
    common_faqs,
    inquiry_categories,
    ai_instructions,
    important_notes,
    business_hours,
    phone,
    email,
    website
FROM ai_company_context
WHERE id = 'YOUR_USER_ID';
*/


-- 6. ANALYTICS - Hilfreich für später
-- ============================================

-- Profil-Vollständigkeit prüfen
/*
SELECT 
    company_name,
    CASE 
        WHEN profile_completed THEN '✅ Vollständig'
        ELSE '⚠️ Unvollständig'
    END as status,
    last_profile_update,
    CASE 
        WHEN company_description IS NOT NULL THEN '✅' 
        ELSE '❌' 
    END as has_description,
    CASE 
        WHEN services_offered IS NOT NULL THEN '✅' 
        ELSE '❌' 
    END as has_services,
    CASE 
        WHEN common_faqs IS NOT NULL THEN '✅' 
        ELSE '❌' 
    END as has_faqs
FROM profiles
WHERE id = 'YOUR_USER_ID';
*/


-- ============================================
-- ERFOLG! 🎉
-- ============================================
-- Wenn alles funktioniert hat, solltest du:
-- ✅ Alle neuen Spalten sehen
-- ✅ Die ai_company_context View nutzen können
-- ✅ (Optional) Beispieldaten haben

-- Nächste Schritte:
-- 1. Öffne die App: http://localhost:5173/settings
-- 2. Fülle dein echtes Firmenprofil aus
-- 3. Teste die KI-Integration (siehe N8N_INTEGRATION.md)
