Write-Host "Stopping KhedutSaathi AI Development Environment..." -ForegroundColor Yellow

Write-Host "Stopping Node.js processes..."
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Write-Host "Stopping Python and Uvicorn processes..."
Stop-Process -Name "uvicorn" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue

Write-Host "All development services stopped!" -ForegroundColor Green
