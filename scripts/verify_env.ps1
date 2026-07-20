<#
.SYNOPSIS
Verifies the KhedutSaathi AI/ML environment.

.DESCRIPTION
This script checks the Python environment, PyTorch CUDA compatibility, 
ChromaDB installation, API Keys, and the status of the RAG API.
#>

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " KhedutSaathi Environment Verification Tool" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$workspacePath = (Get-Item -Path ".\").FullName

# 1. Check Python Version
Write-Host "`n[1] Checking Python Version..." -ForegroundColor Yellow
if (Test-Path "$workspacePath\.venv\Scripts\python.exe") {
    $pythonCmd = "$workspacePath\.venv\Scripts\python.exe"
    Write-Host "Found .venv Python!" -ForegroundColor Green
} else {
    Write-Host "WARNING: .venv not found. Using global python..." -ForegroundColor DarkYellow
    $pythonCmd = "python"
}

$pythonVersion = & $pythonCmd --version 2>&1
Write-Host "Python Version: $pythonVersion"

# 2. Check PyTorch & CUDA
Write-Host "`n[2] Checking PyTorch & CUDA Availability..." -ForegroundColor Yellow
$torchScript = @"
import sys
try:
    import torch
    print(f'PyTorch Version: {torch.__version__}')
    print(f'CUDA Available: {torch.cuda.is_available()}')
    if torch.cuda.is_available():
        print(f'CUDA Device: {torch.cuda.get_device_name(0)}')
except Exception as e:
    print(f'Error importing PyTorch: {e}')
    sys.exit(1)
"@

$torchResult = & $pythonCmd -c $torchScript
if ($LASTEXITCODE -eq 0) {
    Write-Host $torchResult -ForegroundColor Green
} else {
    Write-Host "PyTorch Check Failed:`n$torchResult" -ForegroundColor Red
}

# 3. Check ChromaDB
Write-Host "`n[3] Checking ChromaDB..." -ForegroundColor Yellow
$chromaScript = @"
import sys
try:
    import chromadb
    print(f'ChromaDB Version: {chromadb.__version__}')
except Exception as e:
    print(f'Error importing ChromaDB: {e}')
    sys.exit(1)
"@

$chromaResult = & $pythonCmd -c $chromaScript
if ($LASTEXITCODE -eq 0) {
    Write-Host $chromaResult -ForegroundColor Green
} else {
    Write-Host "ChromaDB Check Failed:`n$chromaResult" -ForegroundColor Red
}

# 4. Check API Keys in .env
Write-Host "`n[4] Checking Environment Variables..." -ForegroundColor Yellow
$envPath = "$workspacePath\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $groqKey = $envContent | Where-Object { $_ -match "^GROQ_API_KEY=" }
    
    if ($groqKey) {
        $keyVal = $groqKey.Split("=")[1].Trim()
        if ($keyVal -ne "" -and $keyVal -ne "your_groq_api_key_here") {
            Write-Host "GROQ_API_KEY is configured." -ForegroundColor Green
        } else {
            Write-Host "GROQ_API_KEY is empty or uses the default placeholder!" -ForegroundColor Red
        }
    } else {
        Write-Host "GROQ_API_KEY not found in .env!" -ForegroundColor Red
    }
} else {
    Write-Host "No .env file found in root!" -ForegroundColor Red
}

# 5. Check RAG API Health
Write-Host "`n[5] Checking RAG API Health (Port 8001)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
    Write-Host "RAG API is reachable: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "RAG API is NOT reachable on Port 8001. Ensure it is running." -ForegroundColor DarkYellow
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host " Verification Complete" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
