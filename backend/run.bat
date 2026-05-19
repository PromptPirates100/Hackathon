@echo off
echo Starting PulseGrid AI Backend...
python -m uvicorn main:app --reload --port 8000
pause
