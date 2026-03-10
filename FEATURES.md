# 🌟 Cal-Speak-Buddy: Feature-Übersicht

Dies ist eine detaillierte Zusammenstellung aller Features, die das Cal-Speak-Buddy System aktuell bietet.

## 🧠 AI & Automatisierung

### 1. Intelligente Anfrage-Kategorisierung
- **Automatische Analyse**: Jede eingehende Anfrage (E-Mail, Chat, Formular) wird automatisch von einer lokalen Llama-3.2-AI analysiert.
- **Kategorisierung**: Anfragen werden intelligent in Kategorien wie *Termin*, *Allgemein*, *Dringend*, *Spam*, *Support*, *Verkauf*, *Rechnung* oder *Feedback* einsortiert.
- **Dynamische Anpassung**: Kategorien basieren auf dem Unternehmensprofil und können erweitert werden.

### 2. Automatische Antwort-Generierung
- **Kontext-Awareness**: Die AI generiert Antwortvorschläge basierend auf hinterlegten Unternehmensdaten (Preise, Öffnungszeiten, Tone-of-Voice).
- **Mehrsprachigkeit**: Antworten werden automatisch in der Sprache der Anfrage (Deutsch oder Englisch) verfasst.
- **Entwurfs-Modus**: Die AI erstellt den *Body* der E-Mail, der vom Benutzer vor dem Absenden geprüft und angepasst werden kann.

### 3. Smart Chatbot (Widget)
- **Echtzeit-Support**: Ein integrierbarer Chat-Widget für die Webseite.
- **Unternehmenswissen**: Der Bot beantwortet Fragen zu Produkten, Preisen und Öffnungszeiten basierend auf der Knowledge Base.
- **Automatisierte Ticket-Erstellung**: Der Bot kann den Nutzer interaktiv nach seiner E-Mail-Adresse sowie seinem Anliegen fragen und daraus eigenständig direkt ein Support-Ticket im Dashboard anlegen. Ein interaktives, animiertes Bestätigungs-Kärtchen signalisiert dem Nutzer den Erfolg.
- **Eskalations-Management**: Erkennt der Bot komplexe oder emotionale Anfragen, markiert er diese zur menschlichen Übernahme („Escalate to Human“).

### 4. Sprachsteuerung (Cal-Speak-Buddy)
- **Voice-to-Text**: Integration eines lokalen Whisper-Modells zur hochpräzisen Transkription von gesprochenen Befehlen oder Diktaten.
- **Sprachausgabe**: (Optional/Geplant) Visuelles Feedback durch den Avatar.

## 🖥️ Dashboard & Verwaltung

### 1. Zentrales Ticket-System
- **Kanban/Listen-Ansicht**: Übersicht aller offenen, bearbeiteten und erledigten Anfragen.
- **Status-Tracking**: Verfolgung des Bearbeitungsstatus (`Open`, `In Progress`, `Resolved`).
- **Filter & Suche**: Schnelles Auffinden von Anfragen nach Kategorie oder Inhalt.

### 2. Kunden- & Unternehmensprofil
- **Detaillierte Konfiguration**: Hinterlegen tiefgreifender Unternehmensdaten für die AI:
  - Produkte & Dienstleistungen (inkl. Preise)
  - Unternehmenswerte & USPs
  - Öffnungszeiten & Kontaktwege
  - Bevorzugter Sprachstil (Tone of Voice)
- **Individuelle Regeln**: Definition von "No-Gos" und spezifischen Anweisungen für die AI.

### 3. Benutzer-Management & Sicherheit
- **Authentifizierung**: Sicherer Login und Registrierung über Supabase Auth.
- **Rollenbasiert**: Trennung zwischen Admin- und User-Funktionen.

## 🔌 Integrationen

### 1. Google Calendar
- **Sync**: Verknüpfung mit Google Calendar zur Terminübersicht.
- **Verfügbarkeit**: Die AI kann (perspektivisch) Verfügbarkeiten prüfen.

### 2. E-Mail & Kommunikation
- **Outbox-Integration**: Generierte Antworten können direkt versendet werden (Integration vorbereitet).

## 🎨 User Interface (UX/UI)

### 1. Modernes Design
- **Glassmorphism**: Ästhetische, moderne Oberfläche mit Transparenz-Effekten.
- **Responsive**: Optimiert für Desktop und Tablets.
- **Dark/Light Mode**: Automatische Anpassung oder manuelle Wahl des Farbschemas.

### 2. Onboarding & Hilfe
- **Interaktives Walkthrough**: Geführte Tour durch die App für neue Nutzer.
- **Umfassende Hilfeseite**: Detaillierte Anleitungen und FAQs direkt in der App.

## 🛠️ Technische Highlights
- **Lokale AI-Verarbeitung**: Volle Datenhoheit durch lokale Ausführung von Ollama (Llama 3) und Whisper – keine Daten verlassen den Server zu OpenAI/Anthropic.
- **Echtzeit-Updates**: Dank Supabase Realtime sehen Benutzer neue Anfragen sofort ohne Neuladen.
