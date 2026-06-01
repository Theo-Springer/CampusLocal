# CampusLocal Launch Script for Windows
param(
    [switch]$Demo = $false,
    [switch]$Dev = $false,
    [switch]$Backend = $false
)

function Write-Colored {
    param([string]$Text, [ConsoleColor]$Color = [ConsoleColor]::White)
    Write-Host $Text -ForegroundColor $Color
}

function Write-Section {
    param([string]$Title)
    Write-Colored "`n------------------------------------------------------------" Cyan
    Write-Colored "  $Title" Cyan
    Write-Colored "------------------------------------------------------------`n" Cyan
}

function Check-Prerequisites {
    Write-Section "Checking Prerequisites"
    try {
        $nodeVersion = & node --version
        Write-Colored "[OK] Node.js: $nodeVersion" Green
    } catch {
        Write-Colored "[ERROR] Node.js not found!" Red
        exit 1
    }
    try {
        $npmVersion = & npm --version
        Write-Colored "[OK] npm: $npmVersion" Green
    } catch {
        Write-Colored "[ERROR] npm not found!" Red
        exit 1
    }
    try {
        $pythonVersion = & python --version 2>&1
        Write-Colored "[OK] Python: $pythonVersion" Green
    } catch {
        Write-Colored "[WARN] Python not found" Yellow
    }
}

function Install-Dependencies {
    Write-Section "Installing Dependencies"
    $nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Colored "Installing root dependencies..." Yellow
        & npm install
    }
    
    # Correction Join-Path pour PowerShell 5.1
    $backendDir = Join-Path $PSScriptRoot "packages\backend"
    $venvPath = Join-Path $backendDir "venv"
    
    if (-not (Test-Path $venvPath)) {
        Write-Colored "Creating Python virtual environment..." Yellow
        Set-Location $backendDir
        & python -m venv venv
        $pipExe = Join-Path $venvPath "Scripts\pip.exe"
        & $pipExe install -r requirements.txt
        Set-Location $PSScriptRoot
    }
}

function Display-Status {
    Write-Section "Services Ready!"
    Write-Colored "Backend API: http://localhost:8000" Green
    Write-Colored "Frontend Demo: http://localhost:5174" Green
    Write-Colored "Frontend Official: http://localhost:5173" Yellow
}

function Launch-All {
    Clear-Host
    Check-Prerequisites
    Install-Dependencies
    Write-Section "Starting All Services"
    
    # Correction Join-Path pour PowerShell 5.1
    $backendDir = Join-Path $PSScriptRoot "packages\backend"
    Start-Process powershell -WorkingDirectory $backendDir -ArgumentList "-NoExit", "-Command", "& '.\venv\Scripts\Activate.ps1'; python -m uvicorn src.main:app --reload"
    Start-Sleep -Seconds 2
    
    $demoDir = Join-Path $PSScriptRoot "packages\frontend-demo"
    Start-Process powershell -WorkingDirectory $demoDir -ArgumentList "-NoExit", "-Command", "npm run dev"
    Start-Sleep -Seconds 1
    
    $officialDir = Join-Path $PSScriptRoot "packages\frontend-official"
    Start-Process powershell -WorkingDirectory $officialDir -ArgumentList "-NoExit", "-Command", "npm run dev"
    Display-Status
}

function Launch-Demo {
    Clear-Host
    Check-Prerequisites
    $demoDir = Join-Path $PSScriptRoot "packages\frontend-demo"
    Start-Process powershell -WorkingDirectory $demoDir -ArgumentList "-NoExit", "-Command", "npm run dev"
}

function Launch-Dev {
    Clear-Host
    Check-Prerequisites
    $officialDir = Join-Path $PSScriptRoot "packages\frontend-official"
    Start-Process powershell -WorkingDirectory $officialDir -ArgumentList "-NoExit", "-Command", "npm run dev"
}

function Launch-Backend {
    Clear-Host
    Check-Prerequisites
    Install-Dependencies
    $backendDir = Join-Path $PSScriptRoot "packages\backend"
    $venvExe = Join-Path $backendDir "venv\Scripts\python.exe"
    Set-Location $backendDir
    & $venvExe -m uvicorn src.main:app --reload
}

if ($Demo) { Launch-Demo }
elseif ($Dev) { Launch-Dev }
elseif ($Backend) { Launch-Backend }
else { Launch-All }