# 🚀 Datenbank-Migration für erweitertes Firmenprofil

## Ausführen der Migration

### Option 1: Über Supabase CLI (Empfohlen)
```bash
npx supabase db push
```

Dies führt automatisch alle neuen Migrations-Dateien aus.

### Option 2: Manuell über Supabase Dashboard
1. Gehe zu deinem Supabase Dashboard
2. Navigiere zu "SQL Editor"
3. Kopiere den Inhalt der Datei `supabase/migrations/20251113_add_company_profile_fields.sql`
4. Füge ihn in den SQL Editor ein
5. Klicke auf "Run"

### Option 3: Remote Execution via CLI
```bash
npx supabase db remote exec --file supabase/migrations/20251113_add_company_profile_fields.sql
```

## Was wird hinzugefügt?

### Neue Spalten in `profiles` Tabelle:

#### 📋 Grundlegende Firmendaten
- `industry` - Branche
- `company_size` - Unternehmensgröße (1-10, 11-50, etc.)
- `founded_year` - Gründungsjahr
- `tax_id` - USt-IdNr / UID
- `registration_number` - Firmenbuchnummer

#### 📞 Kontaktdaten
- `phone`, `mobile`, `fax` - Telefonnummern
- `email` - E-Mail
- `website` - Website URL
- `social_media` - Social Media Links (JSON)

#### 📍 Adressdaten
- `street`, `street_number` - Straße und Hausnummer
- `postal_code`, `city` - PLZ und Stadt
- `state`, `country` - Bundesland und Land

#### 🕐 Öffnungszeiten
- `business_hours` - Öffnungszeiten als JSON

#### 🤖 KI-Kontext (WICHTIG für N8N)
- `company_description` - Firmenbeschreibung
- `services_offered` - Angebotene Leistungen (JSON Array)
- `target_audience` - Zielgruppe
- `company_values` - Unternehmenswerte (JSON Array)
- `unique_selling_points` - Alleinstellungsmerkmale (JSON Array)

#### 💬 Kommunikationspräferenzen
- `preferred_tone` - Tonalität (formal, professional, casual, friendly)
- `preferred_language` - Bevorzugte Sprache
- `response_template_intro` - Begrüßungsvorlage
- `response_template_signature` - Signaturvorlage

#### ❓ FAQ & Kategorien
- `common_faqs` - Häufige Fragen (JSON Array)
- `inquiry_categories` - Benutzerdefinierte Kategorien (JSON Array)

#### ⚙️ KI-Anweisungen
- `ai_instructions` - Spezielle Anweisungen für KI
- `auto_response_enabled` - Auto-Antworten aktiviert
- `auto_categorization_enabled` - Auto-Kategorisierung aktiviert

#### 🎯 Zusätzliche Features
- `certifications` - Zertifikate (JSON Array)
- `languages_supported` - Unterstützte Sprachen (JSON Array)
- `payment_methods` - Zahlungsmethoden (JSON Array)
- `delivery_areas` - Liefergebiete (JSON Array)
- `important_notes` - Wichtige Hinweise

#### 🎨 Branding
- `logo_url` - Logo URL
- `brand_colors` - Markenfarben (JSON)

#### 📊 Meta
- `profile_completed` - Profil vollständig
- `last_profile_update` - Letztes Profil-Update

### Neue View: `ai_company_context`

Eine optimierte View speziell für N8N AI-Integration mit allen relevanten Kontextdaten.

## Überprüfung

Nach der Migration kannst du überprüfen, ob alles funktioniert hat:

```sql
-- Alle neuen Spalten anzeigen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- AI Context View testen
SELECT * FROM ai_company_context LIMIT 1;
```

## Nächste Schritte

1. ✅ Migration ausführen
2. ✅ In der App die Einstellungen öffnen
3. ✅ Firmenprofil ausfüllen
4. ✅ N8N Workflow konfigurieren (siehe N8N_INTEGRATION.md)

## Rollback (Falls nötig)

Falls etwas schief geht, kannst du die Änderungen rückgängig machen:

```sql
-- VORSICHT: Dies entfernt alle hinzugefügten Spalten!
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS industry,
DROP COLUMN IF EXISTS company_size,
DROP COLUMN IF EXISTS founded_year,
-- ... (alle neuen Spalten)
;

DROP VIEW IF EXISTS ai_company_context;
DROP FUNCTION IF EXISTS update_profile_timestamp();
```

**Hinweis:** Erstelle vor dem Rollback ein Backup!
