Write-Host "Starting PulseGrid AI Backend on http://localhost:8000 ..." -ForegroundColor Cyan
python -m uvicorn main:app --reload --port 8000
