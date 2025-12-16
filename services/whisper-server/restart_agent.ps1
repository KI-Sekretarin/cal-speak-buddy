# PowerShell Script zum Neustarten des Whisper-Servers mit Calendar Agent

Write-Host "Starte Whisper Server mit Calendar Agent..." -ForegroundColor Blue
Write-Host ""

# Wechsle ins Whisper-Server Verzeichnis
Set-Location $PSScriptRoot

# Aktiviere Virtual Environment
Write-Host "Aktiviere Virtual Environment..." -ForegroundColor Blue
.\.venv\Scripts\Activate.ps1

# Setze Umgebungsvariablen
$env:WHISPER_MODEL = "base"
$env:WHISPER_DEVICE = "cpu"
$env:WHISPER_COMPUTE_TYPE = "int8"

Write-Host ""
Write-Host "Whisper-Server wird gestartet..." -ForegroundColor Green
Write-Host "  Whisper Model: $env:WHISPER_MODEL" -ForegroundColor Blue
Write-Host "  Port: 9000" -ForegroundColor Blue
Write-Host "  Features:" -ForegroundColor Blue
Write-Host "    - Transkription (Whisper)" -ForegroundColor Cyan
Write-Host "    - Kalenderbefehle (Ollama + Google Calendar)" -ForegroundColor Cyan
Write-Host ""
Write-Host "WICHTIG: Stelle sicher dass Ollama laeuft!" -ForegroundColor Yellow
Write-Host "  Pruefe mit: ollama list" -ForegroundColor Yellow
Write-Host "  Modell laden: ollama pull llama3.2" -ForegroundColor Yellow
Write-Host ""
Write-Host "Druecke Ctrl+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

# Starte Server
uvicorn server:app --host 0.0.0.0 --port 9000 --reload
