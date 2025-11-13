# 🚀 Quick Start - Firmenprofil Extension

## Schnellstart (3 Schritte)

### 1️⃣ Datenbank migrieren

**Option A - Automatisch (empfohlen):**
```bash
npx supabase db push
```

**Option B - Manuell:**
1. Öffne [Supabase Dashboard](https://app.supabase.com)
2. Gehe zu SQL Editor
3. Kopiere den Inhalt von `supabase/migrations/20251113_add_company_profile_fields.sql`
4. Füge ein und klicke "Run"

**Option C - Remote CLI:**
```bash
npx supabase db remote exec --file supabase/migrations/20251113_add_company_profile_fields.sql
```

### 2️⃣ App testen

```bash
npm run dev
```

Navigiere zu `/settings` und fülle dein Firmenprofil aus.

### 3️⃣ N8N konfigurieren (optional)

Siehe `N8N_INTEGRATION.md` für Workflow-Beispiele.

## ✅ Was ist neu?

- **40+ neue Datenbankfelder** für Firmendaten
- **4 Tab-Einstellungsseite** (Firmendaten, KI, Features, Vorschau)
- **Optimierte View** für N8N Integration
- **Vollständige TypeScript Types**
- **KI-Context-Management** für bessere Antworten

## 📚 Dokumentation

| Datei | Beschreibung |
|-------|--------------|
| `IMPLEMENTATION_SUMMARY.md` | Vollständige Übersicht aller Änderungen |
| `DB_MIGRATION_GUIDE.md` | Detaillierte Migrations-Anleitung |
| `N8N_INTEGRATION.md` | N8N Workflow-Beispiele & Best Practices |
| `EXECUTE_MIGRATION.sql` | Quick-Execute SQL-Befehle |

## 🎯 Hauptfeatures

### Firmenprofil
- Grunddaten (Name, Branche, Größe, etc.)
- Kontaktdaten (Telefon, E-Mail, Website, Social Media)
- Adresse (Vollständig)
- Öffnungszeiten

### KI-Einstellungen
- Leistungen & Produkte
- Zielgruppe & Werte
- Alleinstellungsmerkmale (USPs)
- Kommunikationsstil (Tonalität)
- Benutzerdefinierte Kategorien
- FAQ-Manager
- Spezielle KI-Anweisungen

### Zusatzfeatures
- Unterstützte Sprachen
- Zahlungsmethoden
- Liefergebiete
- Zertifizierungen
- Branding (Logo, Farben)

## 🔍 Überprüfung

Nach der Migration kannst du überprüfen:

```sql
-- Prüfe neue Spalten
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY column_name;

-- Prüfe AI View
SELECT * FROM ai_company_context LIMIT 1;
```

## 🐛 Troubleshooting

**Problem: Migration schlägt fehl**
- Prüfe Supabase-Verbindung: `npx supabase status`
- Stelle sicher, dass du angemeldet bist: `npx supabase login`

**Problem: UI zeigt Fehler**
- Prüfe Browser-Konsole
- Stelle sicher, dass Migration erfolgreich war
- Lade die Seite neu

**Problem: Daten werden nicht gespeichert**
- Prüfe Supabase RLS Policies
- Prüfe Browser Network Tab für Fehler

## 📞 Hilfe benötigt?

1. Lies `IMPLEMENTATION_SUMMARY.md`
2. Schau in die spezifischen Guides
3. Prüfe die TypeScript-Typen in `src/types/profile.ts`
4. Untersuche die Komponenten in `src/components/settings/`

---

**Erstellt am:** 13. November 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Production
