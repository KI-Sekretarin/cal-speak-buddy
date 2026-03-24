# 🏃 Scrum Sprint – Cal-Speak-Buddy

## Sprint 1 – „Stabilisierung & Developer Experience"

**Zeitraum:** 24. Februar 2026 – 14. März 2026 (3 Wochen)  
**Team:** Leo Lobmaier (Developer), KI-Agent (Pair-Programmer)  
**Sprint-Ziel:** Technische Schulden abbauen, den Ollama Worker produktionstauglich machen und die Developer Experience verbessern.

---

## 📋 Sprint Backlog

### Story 1 – Repository-Bereinigung & .gitignore einführen
**ID:** SB-01  
**Typ:** Chore / DevOps  
**Priorität:** Mittel  
**Storypoints:** 2  
**Status:** ✅ Done

**Beschreibung:**  
Das Repository enthielt eine versehentlich eingecheckte Duplikat-Datei (`package-lock 2.json`) sowie fehlende Gitignore-Regeln für machine-spezifische Claude Code Konfigurationsdateien (`.claude/settings.local.json`, `.claude/worktrees/`). Außerdem fehlte eine vollständige `.gitignore` für das gesamte Projekt, was dazu führte, dass sensible Dateien (Credentials, .env) versehentlich eingecheckt werden konnten.

**Akzeptanzkriterien:**
- [x] Duplikat-Lockfile `package-lock 2.json` aus dem Repository entfernt
- [x] `.gitignore` erstellt und enthält Regeln für: `node_modules`, `dist`, `.env`, `credentials.json`, `token.json`, Python-Artefakte (`.venv`, `*.pyc`, `__pycache__`)
- [x] Claude-spezifische lokale Settings (`.claude/settings.local.json`, `.claude/worktrees/`) in `.gitignore` eingetragen
- [x] `CLAUDE.md` mit vollständigen Projekt-Konventionen für AI-Agenten angelegt

**Verlinkter Commit:** `72f8d46` – *chore: Clean up repo – remove duplicate lock file, ignore local Claude settings*

---

### Story 2 – Fix: Ungültige Enum-Werte im Ollama Worker
**ID:** SB-02  
**Typ:** Bug / Backend  
**Priorität:** Hoch  
**Storypoints:** 3  
**Status:** ✅ Done

**Beschreibung:**  
Der Ollama Worker versuchte nach der Verarbeitung einer Inquiry den Status auf `'processed'` oder `'failed'` zu setzen. Diese Werte existieren jedoch **nicht** im Supabase PostgreSQL-Enum für das `status`-Feld der `inquiries`-Tabelle. Das führte zu Datenbankfehlern und dazu, dass alle verarbeiteten Anfragen ohne validen Status im System hingen.

Valide Enum-Werte laut Datenbankschema sind: `open`, `in_progress`, `resolved`.

**Root Cause:**  
Die Worker-Implementierung war auf Basis einer alten Spezifikation geschrieben worden, die zwischenzeitlich entfernte Status-Werte nutzte. Ein separater `retryFailedInquiries()`-Mechanismus versuchte Inquiries mit Status `'failed'` zurückzusetzen – was ebenfalls ins Leere lief, da dieser Status nie valide gesetzt werden konnte.

**Lösung:**
- Status nach erfolgreicher Verarbeitung: `'processed'` → `'in_progress'`
- Status nach fehlgeschlagener Verarbeitung: `'failed'` → `'open'` (ermöglicht automatischen Retry beim nächsten Polling-Zyklus)
- Die separate `retryFailedInquiries()`-Funktion wurde vereinfacht: Da fehlgeschlagene Inquiries jetzt wieder `'open'` gesetzt werden, werden sie automatisch von `claimInquiries()` beim nächsten Lauf erneut aufgegriffen. Kein separater Retry-Mechanismus notwendig.
- Konstante `FAILED_RETRY_AFTER_MS` entfernt (obsolet)

**Akzeptanzkriterien:**
- [x] Ollama Worker setzt Status nach erfolgreicher Analyse auf `'in_progress'`
- [x] Ollama Worker setzt Status nach fehlgeschlagener Analyse auf `'open'` (statt `'failed'`)
- [x] Keine Datenbankfehler mehr durch ungültige Enum-Werte
- [x] Fehlgeschlagene Inquiries werden automatisch beim nächsten Polling-Durchlauf erneut verarbeitet
- [x] Obsolete Retry-Logik aus `retryFailedInquiries()` entfernt

**Verlinkter Commit:** `e4096e4` – *fix: Korrigiere ungültige Enum-Werte im Ollama Worker*

---

## 📊 Sprint Review

**Datum:** 14. März 2026  
**Teilnehmer:** Leo Lobmaier

### Erledigte Arbeit (Done)
| Story | Punkte | Status |
|-------|--------|--------|
| SB-01 – Repository-Bereinigung | 2 SP | ✅ Done |
| SB-02 – Fix Enum-Werte Ollama Worker | 3 SP | ✅ Done |
| **Gesamt** | **5 SP** | ✅ |

### Nicht erledigte Arbeit
Keine offenen Stories – alle Sprint-Ziele wurden erreicht.

### Demo-Highlights
- Der Ollama Worker verarbeitet Inquiries jetzt ohne Datenbankfehler.
- Fehlgeschlagene Inquiries werden automatisch über den bestehenden Polling-Mechanismus retried – kein manueller Eingriff notwendig.
- Das Repository ist bereinigt; neue Entwickler können keine sensitiven Dateien mehr versehentlich einchecken.

---

## 🔄 Sprint Retrospektive

**Datum:** 14. März 2026

### Was lief gut? 👍
- Der Bugfix war gut isolierbar und klar beschreibbar: ein einziger, präziser Fehler mit eindeutiger Lösung.
- Die Kombination aus menschlichem Entwickler und AI-Agent (Pair-Programming mit Claude Sonnet) funktionierte gut für fokussierte Debugging-Sessions.
- Repository-Hygiene wurde endlich nachgeholt – erspart zukünftige Kopfschmerzen.

### Was lief nicht gut? 👎
- Die Enum-Inkonsistenz zwischen Worker-Code und Datenbankschema hätte durch bessere Typen-Generierung (`supabase gen types typescript`) von Anfang an auffallen müssen.
- Es gab keine automatisierten Tests für den Worker, was das Debuggen verlangsamte.

### Verbesserungsmaßnahmen für Sprint 2 🔧
- [ ] Supabase-Typen nach jeder Schema-Änderung automatisch neu generieren und in CI prüfen
- [ ] Unit-Tests für `services/ollama-worker/index.ts` schreiben (besonders für Status-Übergänge)
- [ ] Review-Prozess einführen: Vor dem Merge prüfen, ob Enum-Werte im Code mit dem DB-Schema übereinstimmen

---

## 📈 Velocity & Metriken

| Metrik | Wert |
|--------|------|
| Sprint-Länge | 3 Wochen |
| Committete Story Points | 5 SP |
| Abgeschlossene Story Points | 5 SP |
| Velocity | 5 SP / Sprint |
| Anzahl Commits | 2 |
| Geänderte Dateien | 3 (`services/ollama-worker/index.ts`, `.gitignore`, `CLAUDE.md`) |
| Hinzugefügte Zeilen | +188 |
| Entfernte Zeilen | −38 |

---

## 🗂️ Offenes Backlog (Ausblick Sprint 2)

Folgende Themen wurden im Sprint identifiziert und in das Product Backlog aufgenommen:

- **Unit Tests für Ollama Worker** – Status-Transitions, Error Handling, Retry-Logik abdecken
- **Supabase Typen-Generierung in CI** – Sicherstellen, dass `src/integrations/supabase/types.ts` immer aktuell ist
- **Inquiry-Status-Übergang `in_progress` → `resolved`** – Klären, wer und wann diesen Übergang auslösen soll (manuell im Dashboard oder automatisch durch den Worker)
- **E-Mail Outbox-Integration** – Generierten `response_draft` direkt via Gmail versenden
- **Monitoring für den Ollama Worker** – Health-Check Endpoint und Alert bei Verarbeitungsfehlern
