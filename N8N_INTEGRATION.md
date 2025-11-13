# 🤖 N8N Integration - KI-gestützte Antworten & Kategorisierung

## Übersicht

Mit den erweiterten Firmenprofil-Daten kann N8N nun kontextbewusste KI-Antworten generieren und Anfragen automatisch kategorisieren.

## 📊 Verfügbare Daten für N8N

### 1. Optimierte View: `ai_company_context`

Diese View stellt alle relevanten Daten für die KI bereit:

```sql
SELECT * FROM ai_company_context WHERE id = 'user_id';
```

**Enthält:**
- Firmenbeschreibung
- Leistungen/Produkte
- Zielgruppe
- Unternehmenswerte
- Alleinstellungsmerkmale
- Tonalität & Sprache
- Antwortvorlagen
- FAQs
- Benutzerdefinierte Kategorien
- Spezielle KI-Anweisungen
- Öffnungszeiten
- Kontaktdaten

### 2. Vollständiges Profil

```sql
SELECT * FROM profiles WHERE id = 'user_id';
```

## 🔄 N8N Workflow-Beispiele

### Workflow 1: Automatische Kategorisierung

```json
{
  "nodes": [
    {
      "name": "Webhook - Neue Anfrage",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "name": "Supabase - Lade Firmenprofil",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "getAll",
        "table": "ai_company_context",
        "filters": {
          "conditions": [
            {
              "key": "id",
              "value": "={{$json.user_id}}"
            }
          ]
        }
      }
    },
    {
      "name": "OpenAI - Kategorisiere Anfrage",
      "type": "n8n-nodes-base.openai",
      "parameters": {
        "model": "gpt-4",
        "messages": [
          {
            "role": "system",
            "content": "Du bist ein Assistent zur Kategorisierung von Kundenanfragen.\n\nFirmenkontext:\n- Firma: {{$node['Supabase - Lade Firmenprofil'].json.company_name}}\n- Branche: {{$node['Supabase - Lade Firmenprofil'].json.industry}}\n- Leistungen: {{$node['Supabase - Lade Firmenprofil'].json.services_offered}}\n- Benutzerdefinierte Kategorien: {{$node['Supabase - Lade Firmenprofil'].json.inquiry_categories}}\n\nKategorisiere die folgende Anfrage in eine der benutzerdefinierten Kategorien oder eine Standardkategorie (Allgemein, Support, Vertrieb, Beschwerde)."
          },
          {
            "role": "user",
            "content": "Betreff: {{$json.subject}}\nNachricht: {{$json.message}}"
          }
        ],
        "temperature": 0.3
      }
    },
    {
      "name": "Supabase - Update Kategorie",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "update",
        "table": "inquiries",
        "filters": {
          "conditions": [
            {
              "key": "id",
              "value": "={{$json.inquiry_id}}"
            }
          ]
        },
        "fieldsToUpdate": {
          "ai_category": "={{$node['OpenAI - Kategorisiere Anfrage'].json.choices[0].message.content}}"
        }
      }
    }
  ]
}
```

### Workflow 2: KI-Antwortvorschlag generieren

```json
{
  "nodes": [
    {
      "name": "Webhook - Neue Anfrage",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "name": "Supabase - Lade Firmenprofil",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "getAll",
        "table": "ai_company_context",
        "filters": {
          "conditions": [
            {
              "key": "id",
              "value": "={{$json.user_id}}"
            }
          ]
        }
      }
    },
    {
      "name": "Code - Erstelle System Prompt",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const profile = $input.all()[1].json;\n\nconst systemPrompt = `Du bist ein professioneller Kundendienst-Assistent für ${profile.company_name}.\n\nFIRMENINFORMATIONEN:\n- Beschreibung: ${profile.company_description}\n- Leistungen: ${profile.services_offered?.join(', ')}\n- Zielgruppe: ${profile.target_audience}\n- Werte: ${profile.company_values?.join(', ')}\n- Alleinstellungsmerkmale: ${profile.unique_selling_points?.join(', ')}\n\nKOMMUNIKATION:\n- Tonalität: ${profile.preferred_tone}\n- Sprache: ${profile.preferred_language}\n- Begrüßung: ${profile.response_template_intro}\n- Signatur: ${profile.response_template_signature}\n\nÖFFNUNGSZEITEN:\n${JSON.stringify(profile.business_hours, null, 2)}\n\nKONTAKT:\n- Telefon: ${profile.phone}\n- E-Mail: ${profile.email}\n- Website: ${profile.website}\n\nFAQs:\n${profile.common_faqs?.map(faq => `Q: ${faq.question}\\nA: ${faq.answer}`).join('\\n\\n')}\n\nSPEZIELLE ANWEISUNGEN:\n${profile.ai_instructions}\n\nWICHTIGE HINWEISE:\n${profile.important_notes}\n\nErstelle eine passende, hilfreiche Antwort auf die Kundenanfrage unter Berücksichtigung aller oben genannten Informationen.`;\n\nreturn { systemPrompt };"
      }
    },
    {
      "name": "OpenAI - Generiere Antwort",
      "type": "n8n-nodes-base.openai",
      "parameters": {
        "model": "gpt-4o",
        "messages": [
          {
            "role": "system",
            "content": "={{$node['Code - Erstelle System Prompt'].json.systemPrompt}}"
          },
          {
            "role": "user",
            "content": "Name: {{$json.name}}\nE-Mail: {{$json.email}}\nBetreff: {{$json.subject}}\nNachricht: {{$json.message}}"
          }
        ],
        "temperature": 0.7,
        "maxTokens": 500
      }
    },
    {
      "name": "Supabase - Speichere Antwortvorschlag",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "ai_responses",
        "fieldsToSend": {
          "inquiry_id": "={{$json.inquiry_id}}",
          "suggested_response": "={{$node['OpenAI - Generiere Antwort'].json.choices[0].message.content}}"
        }
      }
    }
  ]
}
```

### Workflow 3: Intelligente FAQ-Suche

```javascript
// N8N Code Node - FAQ Matching
const inquiry = $input.first().json;
const profile = $input.all()[1].json;

// Suche nach passenden FAQs
const faqs = profile.common_faqs || [];
const matches = [];

for (const faq of faqs) {
  // Einfache Keyword-Suche (kann mit Embedding/Semantic Search verbessert werden)
  const keywords = faq.question.toLowerCase().split(' ');
  const messageWords = inquiry.message.toLowerCase().split(' ');
  
  const matchScore = keywords.filter(k => 
    messageWords.some(m => m.includes(k) || k.includes(m))
  ).length;
  
  if (matchScore > 0) {
    matches.push({
      question: faq.question,
      answer: faq.answer,
      score: matchScore
    });
  }
}

// Sortiere nach Relevanz
matches.sort((a, b) => b.score - a.score);

return {
  json: {
    hasMatch: matches.length > 0,
    bestMatch: matches[0] || null,
    allMatches: matches.slice(0, 3)
  }
};
```

## 🎯 Beispiel-Prompts für verschiedene Tonalitäten

### Formal
```
Sehr geehrte/r [Name],

vielen Dank für Ihre Anfrage vom [Datum] bezüglich [Thema].

[Inhalt]

Für Rückfragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
[Firma]
```

### Professional
```
Guten Tag [Name],

danke für Ihre Nachricht. Gerne beantworte ich Ihre Frage zu [Thema].

[Inhalt]

Bei weiteren Fragen melden Sie sich gerne.

Beste Grüße
[Firma]
```

### Casual
```
Hallo [Name],

super, dass Sie sich bei uns melden! 

[Inhalt]

Wenn noch etwas unklar ist, einfach zurückschreiben.

Viele Grüße
[Firma]
```

### Friendly
```
Hi [Name],

schön von dir zu hören! 😊

[Inhalt]

Melde dich gerne, falls noch Fragen auftauchen!

Liebe Grüße
[Firma]
```

## 📈 Best Practices

### 1. Kontextoptimierung
- Halte die Firmenbeschreibung präzise (100-500 Wörter)
- Füge relevante FAQs hinzu (Top 10-20)
- Definiere klare Kategorien (5-10 Hauptkategorien)

### 2. Token-Management
- Verwende die `ai_company_context` View für kompakte Daten
- Filtere unnötige Felder
- Nutze kürzere Modelle (gpt-4o-mini) für Kategorisierung

### 3. Qualitätssicherung
- Setze `auto_response_enabled` nur nach Tests auf `true`
- Speichere Antworten zunächst als Vorschläge
- Implementiere ein Review-System

### 4. Performance
- Cache Firmenprofile in N8N (z.B. mit Redis)
- Nutze Webhooks statt Polling
- Implementiere Rate Limiting

## 🔧 Technische Details

### Supabase Connection in N8N

```javascript
// Credentials
{
  "host": "your-project.supabase.co",
  "serviceRole": "your-service-role-key"
}

// Query
SELECT * FROM ai_company_context WHERE id = 'user-id';
```

### Environment Variables

```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-key
```

## 📊 Monitoring & Analytics

Tracke folgende Metriken:
- Kategorisierungs-Genauigkeit
- Antwort-Akzeptanzrate
- Durchschnittliche Antwortzeit
- Token-Verbrauch
- Kosten pro Anfrage

```sql
-- Analytics Query
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_inquiries,
  COUNT(ai_category) as categorized,
  COUNT(ai_response) as auto_responded,
  AVG(CASE WHEN ai_responses.is_approved THEN 1 ELSE 0 END) as approval_rate
FROM inquiries
LEFT JOIN ai_responses ON inquiries.id = ai_responses.inquiry_id
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🚀 Nächste Schritte

1. ✅ Firmenprofil in der App vollständig ausfüllen
2. ✅ N8N Workflows aus den Beispielen oben erstellen
3. ✅ Mit Testdaten testen
4. ✅ `auto_categorization_enabled` aktivieren
5. ✅ Antwortvorschläge reviewen
6. ✅ Bei Zufriedenheit `auto_response_enabled` aktivieren

## 💡 Erweiterte Features (Optional)

- **Semantic Search**: Nutze OpenAI Embeddings für besseres FAQ-Matching
- **Multi-Language**: Automatische Spracherkennung und Übersetzung
- **Sentiment Analysis**: Priorisierung basierend auf Stimmung
- **Auto-Escalation**: Weiterleitung komplexer Anfragen an Menschen
- **Learning Loop**: Feedback zur Verbesserung der Prompts

Viel Erfolg! 🎉
