# 🚀 Edge Function Deployment - Schritt für Schritt

## Problem
Die Edge Function `process-inquiries-kategorien` existiert lokal, ist aber nicht auf Supabase deployed.

## Lösung: Manuelles Deployment über Supabase Dashboard

### Schritt 1: Supabase Dashboard öffnen

1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Navigiere zu **Edge Functions** (linkes Menü)

### Schritt 2: Neue Edge Function erstellen

1. Klicke auf **"New Edge Function"**
2. Name: `process-inquiries-kategorien`
3. Klicke **"Create Function"**

### Schritt 3: Code einfügen

Kopiere den kompletten Code aus:
`supabase/functions/process-inquiries-kategorien/index.ts`

Und füge ihn in den Editor ein.

**WICHTIG:** Ändere diese Zeile:
```typescript
const AI_SERVICE_URL = Deno.env.get('AI_SERVICE_URL') || 'http://localhost:9001';
```

Zu (für Produktion):
```typescript
const AI_SERVICE_URL = Deno.env.get('AI_SERVICE_URL') || 'http://YOUR_PUBLIC_IP:9001';
```

> **Hinweis:** Für lokale Tests kannst du `localhost:9001` lassen, aber in Produktion 
> muss der AI-Service öffentlich erreichbar sein (z.B. via Cloudflare Tunnel, ngrok).

### Schritt 4: Environment Variables setzen

1. Gehe zu **Project Settings** → **Edge Functions**
2. Füge hinzu:
   - `AI_SERVICE_URL` = `http://YOUR_PUBLIC_IP:9001` (oder Tunnel-URL)

### Schritt 5: Function deployen

1. Klicke **"Deploy"**
2. Warte bis Deployment abgeschlossen ist

### Schritt 6: Trigger erstellen (falls noch nicht vorhanden)

Gehe zu **SQL Editor** und führe aus:

```sql
-- Prüfe ob Trigger existiert
SELECT * FROM pg_trigger WHERE tgname = 'trigger_enqueue_inquiry';

-- Falls nicht, erstelle ihn:
CREATE TRIGGER trigger_enqueue_inquiry
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION enqueue_inquiry();
```

### Schritt 7: Testen

1. Erstelle einen Test-Inquiry:
```sql
INSERT INTO inquiries (name, email, subject, message, user_id)
VALUES (
  'Test User',
  'test@example.com',
  'App stürzt ab',
  'Die App friert ein',
  (SELECT id FROM auth.users LIMIT 1)
);
```

2. Prüfe inquiry_queue:
```sql
SELECT * FROM inquiry_queue ORDER BY created_at DESC LIMIT 5;
```

3. Rufe Edge Function manuell auf:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-inquiries-kategorien \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

4. Prüfe ob ai_category gesetzt wurde:
```sql
SELECT id, subject, ai_category, status 
FROM inquiries 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Alternative: Supabase CLI (Fortgeschritten)

Falls du Supabase CLI installieren möchtest:

### Installation
```powershell
npm install -g supabase
```

### Login
```powershell
supabase login
```

### Link Project
```powershell
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy Function
```powershell
supabase functions deploy process-inquiries-kategorien
```

### Set Environment Variables
```powershell
supabase secrets set AI_SERVICE_URL=http://YOUR_PUBLIC_IP:9001
```

---

## 🔧 Für lokale Entwicklung

Wenn du nur lokal testen willst (ohne Cloud-Deployment):

### 1. Supabase CLI installieren
```powershell
npm install -g supabase
```

### 2. Lokale Supabase starten
```powershell
cd c:\Daten\Schule-Analog\5CHIT\ITP\Projekt\cal-speak-buddy
supabase start
```

### 3. Edge Function lokal deployen
```powershell
supabase functions serve process-inquiries-kategorien --env-file supabase/.env.local
```

### 4. .env.local erstellen
Erstelle `supabase/.env.local`:
```
AI_SERVICE_URL=http://host.docker.internal:9001
```

### 5. Testen
```powershell
# Inquiry erstellen (in lokalem Supabase)
# Dann Edge Function aufrufen:
curl -X POST http://localhost:54321/functions/v1/process-inquiries-kategorien
```

---

## ⚠️ Wichtiger Hinweis für Produktion

**Problem:** Supabase Edge Functions in der Cloud können nicht auf `localhost:9001` zugreifen!

**Lösungen:**
1. **Cloudflare Tunnel** - AI-Service öffentlich machen (empfohlen)
2. **ngrok** - Temporärer Tunnel für Tests
3. **VPS/Server** - AI-Service auf Server deployen
4. **Alternative Architektur** - AI-Logik direkt in Edge Function (komplexer)

---

## 📝 Zusammenfassung

**Für lokale Tests:**
- Supabase CLI installieren
- Lokal mit `supabase start` testen

**Für Produktion:**
- Edge Function über Dashboard deployen
- AI-Service öffentlich erreichbar machen
- Environment Variables setzen

Welchen Weg möchtest du gehen?
