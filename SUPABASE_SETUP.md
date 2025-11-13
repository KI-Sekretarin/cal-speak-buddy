# Supabase Konfiguration - Setup Anleitung

## 🔧 Erforderliche Schritte

### 1. Authentication URLs konfigurieren

**Problem:** E-Mail-Bestätigungslinks führen zu localhost:3000 statt localhost:8080

**Lösung:**
1. Gehe zu: https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/auth/url-configuration
2. Setze folgende Werte:

**Site URL:**
```
http://localhost:8080
```

**Redirect URLs:** (alle hinzufügen)
```
http://localhost:8080
http://localhost:8080/**
https://yourdomain.lovable.app
https://yourdomain.lovable.app/**
```

### 2. E-Mail-Bestätigung deaktivieren (für Testing)

**Empfohlen für schnelleres Testing:**

1. Gehe zu: https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/auth/providers
2. Scrolle zu "Email Provider Settings"
3. **Deaktiviere** "Confirm email"
4. Klicke "Save"

**Hinweis:** Für Production sollte dies wieder aktiviert werden!

### 3. Leaked Password Protection aktivieren (Security)

**Aktuell:** Diese Sicherheitsfunktion ist deaktiviert

**Aktivierung:**
1. Gehe zu: https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/auth/providers
2. Scrolle zu "Password Security"
3. **Aktiviere** "Enable Leaked Password Protection"
4. Klicke "Save"

**Was macht das?**
- Verhindert, dass Nutzer bekannte, geleakte Passwörter verwenden
- Verbessert die Account-Sicherheit erheblich
- Empfohlen für alle Production-Apps

## ✅ Edge Functions Status

Folgende Edge Functions sind deployed:

- ✅ `speech-to-text` - Voice-to-Text Konvertierung
- ✅ `voice-commands` - Sprachbefehl-Verarbeitung
- ✅ `inquiries` - Anfragen-Management
- ✅ `ai-responses` - KI-Antwortvorschläge
- ✅ `send-inquiry-response` - E-Mail-Versand (NEU)

Alle Functions sind öffentlich (verify_jwt = false) für einfachen Testing-Zugriff.

## 🔑 Erforderliche Secrets

Bereits konfiguriert:
- ✅ `RESEND_API_KEY` - Für E-Mail-Versand
- ✅ `OPENAI_API_KEY` - Für KI-Features
- ✅ `SUPABASE_URL` - Automatisch gesetzt
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Automatisch gesetzt

## 📊 Datenbank-Status

Kürzlich hinzugefügt:
- ✅ `phone` Feld zu `inquiries` Tabelle
- ✅ Security Warnings behoben (search_path)
- ✅ `profiles` Tabelle mit `contact_form_slug`

## 🧪 Testing Checklist

- [ ] Registrierung funktioniert (ohne E-Mail-Bestätigung)
- [ ] Login funktioniert
- [ ] Öffentliches Kontaktformular speichert alle Felder
- [ ] Antworten können bearbeitet werden
- [ ] E-Mail-Versand funktioniert (über "Versenden"-Button)
- [ ] Voice Commands funktionieren

## 🚀 Production Checklist

Vor dem Live-Gang:

1. [ ] E-Mail-Bestätigung wieder **aktivieren**
2. [ ] Leaked Password Protection **aktivieren**
3. [ ] Site URL auf Production-Domain ändern
4. [ ] Redirect URLs auf Production-Domain anpassen
5. [ ] Edge Functions auf JWT-Authentifizierung umstellen (verify_jwt = true)
6. [ ] Resend Domain verifizieren (statt onboarding@resend.dev)
7. [ ] RLS Policies überprüfen

## 📝 Nächste Schritte

1. ✅ Datenbank-Migration wurde ausgeführt
2. ✅ Edge Function für E-Mail-Versand wurde erstellt
3. ⏳ Supabase URLs konfigurieren (siehe oben)
4. ⏳ Testing durchführen
5. ⏳ Security Settings aktivieren

## 🔗 Wichtige Links

- **Project Dashboard:** https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk
- **Authentication:** https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/auth/users
- **Edge Functions:** https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/functions
- **Database:** https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/editor
- **SQL Editor:** https://supabase.com/dashboard/project/bqwfcixtbnodxuoixxkk/sql/new
