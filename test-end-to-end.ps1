# Test-Script für End-to-End Kategorisierung
# Simuliert: Inquiry erstellen → Edge Function aufrufen → AI kategorisiert

Write-Host "=== End-to-End Test: AI-Kategorisierung ===" -ForegroundColor Blue
Write-Host ""

# Schritt 1: Prüfe AI-Service
Write-Host "Schritt 1: Prüfe AI-Service..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:9001/healthz"
    if ($health.ollama_available) {
        Write-Host "  ✓ AI-Service läuft (Model: $($health.model))" -ForegroundColor Green
    }
    else {
        Write-Host "  ✗ Ollama nicht verfügbar!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "  ✗ AI-Service nicht erreichbar auf Port 9001" -ForegroundColor Red
    Write-Host "    Starte mit: cd services\ai-categorization; .\start.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Schritt 2: Simuliere Inquiry-Daten
Write-Host "Schritt 2: Erstelle Test-Inquiry..." -ForegroundColor Cyan
$testInquiries = @(
    @{
        id                = "test-001"
        subject           = "App stürzt ab"
        message           = "Die App friert ein wenn ich auf Speichern klicke"
        expected_category = "technical"
    },
    @{
        id                = "test-002"
        subject           = "Rechnung nicht erhalten"
        message           = "Ich habe meine Rechnung vom letzten Monat noch nicht bekommen"
        expected_category = "billing"
    },
    @{
        id                = "test-003"
        subject           = "Verbesserungsvorschlag"
        message           = "Es wäre toll wenn man die Farben anpassen könnte"
        expected_category = "feedback"
    }
)

Write-Host "  ✓ $($testInquiries.Count) Test-Inquiries erstellt" -ForegroundColor Green
Write-Host ""

# Schritt 3: Kategorisiere jede Inquiry
Write-Host "Schritt 3: Kategorisiere Inquiries..." -ForegroundColor Cyan
$results = @()

foreach ($inquiry in $testInquiries) {
    Write-Host ""
    Write-Host "  Testing: $($inquiry.subject)" -ForegroundColor White
    Write-Host "  Message: $($inquiry.message)" -ForegroundColor Gray
    
    # Rufe AI-Service auf
    $body = @{
        subject = $inquiry.subject
        message = $inquiry.message
    } | ConvertTo-Json
    
    try {
        $categorization = Invoke-RestMethod -Uri "http://localhost:9001/categorize" -Method Post -ContentType "application/json" -Body $body
        
        $success = $categorization.category -eq $inquiry.expected_category
        
        if ($success) {
            Write-Host "  ✓ Kategorie: $($categorization.category) (Confidence: $($categorization.confidence))" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠ Kategorie: $($categorization.category) (Erwartet: $($inquiry.expected_category))" -ForegroundColor Yellow
        }
        
        $results += @{
            id         = $inquiry.id
            subject    = $inquiry.subject
            category   = $categorization.category
            confidence = $categorization.confidence
            expected   = $inquiry.expected_category
            success    = $success
        }
        
    }
    catch {
        Write-Host "  ✗ Fehler bei Kategorisierung: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            id      = $inquiry.id
            subject = $inquiry.subject
            error   = $_.Exception.Message
            success = $false
        }
    }
}

Write-Host ""
Write-Host "=== Zusammenfassung ===" -ForegroundColor Blue
Write-Host ""

$successCount = ($results | Where-Object { $_.success -eq $true }).Count
$totalCount = $results.Count

Write-Host "Erfolgreiche Kategorisierungen: $successCount / $totalCount" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host ""

# Zeige Ergebnisse als Tabelle
Write-Host "Detaillierte Ergebnisse:" -ForegroundColor Cyan
$results | ForEach-Object {
    if ($_.error) {
        Write-Host "  [$($_.id)] $($_.subject) → ERROR: $($_.error)" -ForegroundColor Red
    }
    else {
        $status = if ($_.success) { "✓" } else { "⚠" }
        $color = if ($_.success) { "Green" } else { "Yellow" }
        Write-Host "  [$status] $($_.subject) → $($_.category) (Confidence: $($_.confidence))" -ForegroundColor $color
    }
}

Write-Host ""
if ($successCount -eq $totalCount) {
    Write-Host "🎉 Alle Tests erfolgreich!" -ForegroundColor Green
}
else {
    Write-Host "⚠ Einige Tests fehlgeschlagen oder unerwartete Kategorien" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Hinweis: Dies ist ein vereinfachter Test ohne Supabase." -ForegroundColor Gray
Write-Host "Fuer vollstaendigen Test mit DB-Integration siehe: NEUE_FEATURES_SETUP.md" -ForegroundColor Gray

