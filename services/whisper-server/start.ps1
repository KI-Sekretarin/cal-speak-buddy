# PowerShell Script zum Starten des Whisper Transcription Servers

Write-Host "Starte Whisper Transcription Server" -ForegroundColor Blue
Write-Host ""

# Wechsle ins Whisper-Server Verzeichnis
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

# Setze Umgebungsvariablen fuer optimale Performance
$env:WHISPER_MODEL = "base"  # base ist schneller als small, aber immer noch gut
$env:WHISPER_DEVICE = "cpu"
$env:WHISPER_COMPUTE_TYPE = "int8"

Write-Host ""
Write-Host "Whisper-Server wird gestartet..." -ForegroundColor Green
Write-Host "  Model: $env:WHISPER_MODEL" -ForegroundColor Blue
Write-Host "  Device: $env:WHISPER_DEVICE" -ForegroundColor Blue
Write-Host "  Port: 9000" -ForegroundColor Blue
Write-Host ""
Write-Host "Druecke Ctrl+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

# Starte Server
uvicorn server:app --host 0.0.0.0 --port 9000 --reload
