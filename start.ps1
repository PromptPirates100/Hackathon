# PulseGrid AI — Start Both Servers
# Run from: c:\Users\rebec\OneDrive\Desktop\pulsegrid-ai\Hackathon\
# Usage:  .\start.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PulseGrid AI — Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Backend ────────────────────────────────────────────────────────────
$backendPath = Join-Path $root "backend"
Write-Host "[1/2] Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendPath'; python -m uvicorn main:app --reload --port 8000"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# ── Frontend ───────────────────────────────────────────────────────────
$frontendPath = Join-Path $root "frontend-react"
Write-Host "[2/2] Starting React frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendPath'; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Both servers starting in new windows!" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
