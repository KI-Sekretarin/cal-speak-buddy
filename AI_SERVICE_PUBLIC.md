# 🌐 AI-Service öffentlich erreichbar machen mit Cloudflare Tunnel

## Problem
Edge Function läuft in Supabase Cloud und kann nicht auf localhost:9001 zugreifen.

## Lösung: Cloudflare Tunnel (kostenlos & sicher)

### Schritt 1: Cloudflare Tunnel installieren

**Windows:**
1. Download: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
2. Oder mit winget:
   ```powershell
   winget install --id Cloudflare.cloudflared
   ```

### Schritt 2: Login
```powershell
cloudflared tunnel login
```
- Browser öffnet sich
- Wähle deine Domain (oder erstelle kostenlose Cloudflare-Domain)

### Schritt 3: Tunnel erstellen
```powershell
cloudflared tunnel create ai-categorization
```

### Schritt 4: Tunnel konfigurieren

Erstelle `C:\Users\DEIN_USER\.cloudflared\config.yml`:

```yaml
tunnel: ai-categorization
credentials-file: C:\Users\DEIN_USER\.cloudflared\TUNNEL_ID.json

ingress:
  - hostname: ai-categorization.DEINE_DOMAIN.com
    service: http://localhost:9001
  - service: http_status:404
```

### Schritt 5: DNS konfigurieren
```powershell
cloudflared tunnel route dns ai-categorization ai-categorization.DEINE_DOMAIN.com
```

### Schritt 6: Tunnel starten
```powershell
cloudflared tunnel run ai-categorization
```

### Schritt 7: In Supabase Edge Function anpassen

Ändere in deiner Edge Function:
```typescript
const AI_SERVICE_URL = Deno.env.get('AI_SERVICE_URL') || 'https://ai-categorization.DEINE_DOMAIN.com';
```

Oder setze Environment Variable in Supabase:
- Gehe zu Project Settings → Edge Functions
- Füge hinzu: `AI_SERVICE_URL` = `https://ai-categorization.DEINE_DOMAIN.com`

---

## Alternative: ngrok (Schneller Test, nicht für Produktion)

### Schritt 1: ngrok installieren
```powershell
winget install ngrok
```

### Schritt 2: Tunnel starten
```powershell
ngrok http 9001
```

### Schritt 3: URL kopieren
```
Forwarding: https://abc123.ngrok.io -> http://localhost:9001
```

### Schritt 4: In Supabase verwenden
```typescript
const AI_SERVICE_URL = 'https://abc123.ngrok.io';
```

**Nachteil:** URL ändert sich bei jedem Neustart (außer mit bezahltem Account)

---

## Welche Lösung für dich?

**Für Tests:** ngrok (5 Minuten Setup)
**Für Produktion:** Cloudflare Tunnel (einmalig 15 Minuten Setup, dann permanent)
