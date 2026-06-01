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
        Write-Colored "[ERROR] Node.js introuvable !" Red
        exit 1
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
    Write-Section "Starting All Services"
    
    # 1. Lancement Backend
    $backendDir = "$PSScriptRoot\packages\backend"
    if (Test-Path $backendDir) {
        Start-Process powershell -WorkingDirectory $backendDir -ArgumentList "-NoExit", "-Command", "& '.\venv\Scripts\Activate.ps1'; python -m uvicorn src.main:app --reload"
        Start-Sleep -Seconds 2
    }
    
    # 2. Lancement Demo via la puissance de npx (cherche et lance vite automatiquement)
    $demoDir = "$PSScriptRoot\packages\frontend\demo"
    if (Test-Path $demoDir) {
        Start-Process powershell -WorkingDirectory $demoDir -ArgumentList "-NoExit", "-Command", "npx vite --port 5174"
        Start-Sleep -Seconds 1
    }
    
    # 3. Lancement Official via npx
    $officialDir = "$PSScriptRoot\packages\frontend\official"
    if (Test-Path $officialDir) {
        Start-Process powershell -WorkingDirectory $officialDir -ArgumentList "-NoExit", "-Command", "npx vite --port 5173"
    }
    
    Display-Status
}

if ($Backend) {
    $backendDir = "$PSScriptRoot\packages\backend"
    Set-Location $backendDir
    & ".\venv\Scripts\python.exe" -m uvicorn src.main:app --reload
} else {
    Launch-All
}