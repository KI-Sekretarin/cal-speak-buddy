# PowerShell Script zum Starten des AI Categorization Service

Write-Host "Starte AI Categorization Service" -ForegroundColor Blue
Write-Host ""

# Wechsle ins AI-Service Verzeichnis
Set-Location $PSScriptRoot

# Pruefe ob Virtual Environment existiert
if (-not (Test-Path ".venv")) {
    Write-Host "Virtual Environment nicht gefunden. Erstelle..." -ForegroundColor Yellow
    py -m venv .venv
    Write-Host "Virtual Environment erstellt" -ForegroundColor Green
}

# Aktiviere Virtual Environment
Write-Host "Aktiviere Virtual Environment..." -ForegroundColor Blue
.\.venv\Scripts\Activate.ps1

# Installiere Dependencies falls noetig
try {
    py -c "import fastapi" 2>$null
    $installed = $?
}
catch {
    $installed = $false
}

if (-not $installed) {
    Write-Host "Dependencies nicht gefunden. Installiere..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "Dependencies installiert" -ForegroundColor Green
}

# Setze Umgebungsvariablen
$env:OLLAMA_MODEL = "llama3.2:3b"  # Kleines, schnelles Modell
$env:AI_SERVICE_PORT = "9001"

Write-Host ""
Write-Host "AI-Service wird gestartet..." -ForegroundColor Green
Write-Host "  Model: $env:OLLAMA_MODEL" -ForegroundColor Blue
Write-Host "  Port: $env:AI_SERVICE_PORT" -ForegroundColor Blue
Write-Host ""
Write-Host "WICHTIG: Stelle sicher dass Ollama laeuft!" -ForegroundColor Yellow
Write-Host "  Pruefe mit: ollama list" -ForegroundColor Yellow
Write-Host ""
Write-Host "Druecke Ctrl+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

# Starte Server
uvicorn server:app --host 0.0.0.0 --port 9001 --reload
