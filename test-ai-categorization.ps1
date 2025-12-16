$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    subject = "App stürzt ab"
    message = "Die App friert ein wenn ich auf Speichern klicke"
} | ConvertTo-Json -Depth 10

Write-Host "Sende Request an AI-Service..." -ForegroundColor Blue
Write-Host "Body: $body" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9001/categorize" -Method Post -Headers $headers -Body $body
    Write-Host "`nErfolgreich!" -ForegroundColor Green
    Write-Host "Kategorie: $($response.category)" -ForegroundColor Cyan
    Write-Host "Confidence: $($response.confidence)" -ForegroundColor Cyan
    Write-Host "Reasoning: $($response.reasoning)" -ForegroundColor Gray
}
catch {
    Write-Host "`nFehler:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
