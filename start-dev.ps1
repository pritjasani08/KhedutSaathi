$projectRoot = $PSScriptRoot
$venvScripts = "$projectRoot\.venv\Scripts"
$python = "$venvScripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Host "ERROR: Python not found at $venvScripts" -ForegroundColor Red
    Write-Host "Create venv with: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "$projectRoot\frontend\node_modules")) {
    Write-Host "ERROR: Frontend node_modules not found. Run: cd frontend && npm install" -ForegroundColor Yellow
}
if (-not (Test-Path "$projectRoot\backend\node_modules")) {
    Write-Host "ERROR: Backend node_modules not found. Run: cd backend && npm install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting KhedutSaathi AI..." -ForegroundColor Green
Write-Host "Python: $python" -ForegroundColor Cyan

$processes = New-Object System.Collections.ArrayList

function Start-Service {
    param(
        [string]$Name,
        [string]$WorkingDir,
        [string]$Cmd,
        [string]$Color
    )
    Write-Host "  [$Name] starting..." -ForegroundColor $Color
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell"
    $psi.Arguments = "-NoExit -Command `"$Cmd`""
    $psi.WorkingDirectory = $WorkingDir
    $psi.WindowStyle = "Normal"
    $proc = [System.Diagnostics.Process]::Start($psi)
    [void]$processes.Add($proc)
    Start-Sleep -Seconds 2
}

Start-Service -Name "Frontend" -WorkingDir "$projectRoot\frontend" -Cmd "npm run dev" -Color "Blue"
Start-Service -Name "Backend" -WorkingDir "$projectRoot\backend" -Cmd "npm run dev" -Color "Green"
Start-Service -Name "AIEngine" -WorkingDir "$projectRoot\backend\ai_engine" -Cmd "& '$python' -m uvicorn main:app --reload --port 8000" -Color "Magenta"
Start-Service -Name "RAG" -WorkingDir "$projectRoot" -Cmd "& '$python' -m uvicorn rag_system.src.api:app --reload --port 8001" -Color "Yellow"
Start-Service -Name "Yield" -WorkingDir "$projectRoot\ai_models\yield_predictor" -Cmd "& '$python' -m uvicorn app:app --reload --port 8002" -Color "Cyan"
Start-Service -Name "CropRec" -WorkingDir "$projectRoot\ai_models\crop_recommendation" -Cmd "& '$python' -m uvicorn src.app:app --reload --port 8003" -Color "White"
Start-Service -Name "Disease" -WorkingDir "$projectRoot\ai_models\crop_disease" -Cmd "& '$python' -m uvicorn src.main:app --reload --port 8004" -Color "Red"

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:     http://localhost:5000" -ForegroundColor Cyan
Write-Host "  AI Engine:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "  RAG API:     http://localhost:8001" -ForegroundColor Cyan
Write-Host "  Yield Pred:  http://localhost:8002" -ForegroundColor Cyan
Write-Host "  Crop Rec:    http://localhost:8003" -ForegroundColor Cyan
Write-Host "  Disease Det: http://localhost:8004" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop all services." -ForegroundColor Yellow

try {
    Wait-Process -InputObject $processes
} catch {}

Write-Host "`nStopping all services..." -ForegroundColor Yellow
foreach ($proc in $processes) {
    try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
}
Write-Host "All services stopped." -ForegroundColor Green
