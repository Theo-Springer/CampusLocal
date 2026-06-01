# 🚀 CampusLocal Launch Script for Windows
# 
# Usage: .\launch.ps1
#        .\launch.ps1 -Demo
#        .\launch.ps1 -Dev
#        .\launch.ps1 -Backend

param(
    [switch]$Demo = $false,
    [switch]$Dev = $false,
    [switch]$Backend = $false
)

# Colors
$colors = @{
    Green = [ConsoleColor]::Green
    Yellow = [ConsoleColor]::Yellow
    Blue = [ConsoleColor]::Blue
    Red = [ConsoleColor]::Red
    Cyan = [ConsoleColor]::Cyan
}

function Write-Colored {
    param(
        [string]$Text,
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    Write-Host $Text -ForegroundColor $Color
}

function Write-Section {
    param([string]$Title)
    Write-Colored "`n$('═' * 60)" Cyan
    Write-Colored "  $Title" Cyan
    Write-Colored "$('═' * 60)`n" Cyan
}

function Check-Prerequisites {
    Write-Section "🔍 Checking Prerequisites"
    
    # Check Node.js
    try {
        $nodeVersion = & node --version
        Write-Colored "✅ Node.js: $nodeVersion" Green
    }
    catch {
        Write-Colored "❌ Node.js not found! Please install Node.js" Red
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = & npm --version
        Write-Colored "✅ npm: $npmVersion" Green
    }
    catch {
        Write-Colored "❌ npm not found!" Red
        exit 1
    }
    
    # Check Python
    try {
        $pythonVersion = & python --version 2>&1
        Write-Colored "✅ Python: $pythonVersion" Green
    }
    catch {
        Write-Colored "⚠️  Python not found (needed for backend)" Yellow
    }
}

function Install-Dependencies {
    Write-Section "📦 Installing Dependencies"
    
    # Root dependencies
    $nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Colored "Installing root dependencies..." Yellow
        & npm install
        Write-Colored "✅ Root dependencies installed" Green
    }
    else {
        Write-Colored "✅ Root dependencies already installed" Green
    }
    
    # Backend Python venv
    $backendDir = Join-Path $PSScriptRoot "packages" "backend"
    $venvPath = Join-Path $backendDir "venv"
    
    if (-not (Test-Path $venvPath)) {
        Write-Colored "Creating Python virtual environment..." Yellow
        Set-Location $backendDir
        & python -m venv venv
        Write-Colored "✅ Virtual environment created" Green
        
        # Install requirements
        Write-Colored "Installing Python requirements..." Yellow
        $pipExe = Join-Path $venvPath "Scripts" "pip.exe"
        & $pipExe install -r requirements.txt
        Write-Colored "✅ Python requirements installed" Green
        
        Set-Location $PSScriptRoot
    }
    else {
        Write-Colored "✅ Backend virtual environment exists" Green
    }
}

function Display-Status {
    Write-Section "✨ Services Ready!"
    
    Write-Colored "📋 Available Services:" Cyan
    Write-Host ""
    Write-Colored "🔵 Backend API:" Blue
    Write-Colored "   http://localhost:8000" Green
    Write-Colored "   API Documentation: http://localhost:8000/docs" Green
    Write-Host ""
    Write-Colored "🟢 Frontend Demo (Autonomous):" Green
    Write-Colored "   http://localhost:5174" Green
    Write-Colored "   👉 Click 'Connexion rapide' to test" Green
    Write-Host ""
    Write-Colored "🟡 Frontend Official:" Yellow
    Write-Colored "   http://localhost:5173" Green
    Write-Host ""
    Write-Colored "💡 Tips:" Cyan
    Write-Colored "   • Demo works WITHOUT backend (try disabling backend)" Blue
    Write-Colored "   • Ctrl+C to stop all services" Blue
    Write-Colored "   • Changes are live-reloaded (HMR enabled)" Blue
    Write-Host ""
}

function Launch-All {
    Clear-Host
    Write-Section "🎉 CampusLocal v2.0.0 - Launch Script"
    
    Check-Prerequisites
    Install-Dependencies
    
    Write-Section "🚀 Starting All Services"
    
    Write-Colored "Starting Backend (FastAPI)..." Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\packages\backend'; `$venv = '.\venv\Scripts\Activate.ps1'; & `$venv; python -m uvicorn src.main:app --reload"
    
    Start-Sleep -Seconds 3
    
    Write-Colored "Starting Frontend Demo..." Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\packages\frontend-demo'; npm run dev"
    
    Start-Sleep -Seconds 2
    
    Write-Colored "Starting Frontend Official..." Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\packages\frontend-official'; npm run dev"
    
    Start-Sleep -Seconds 3
    
    Display-Status
    Write-Colored "📝 New terminal windows opened for each service" Cyan
    Write-Host ""
}

function Launch-Demo {
    Clear-Host
    Write-Section "🎉 CampusLocal v2.0.0 - Demo Only"
    
    Check-Prerequisites
    
    Write-Colored "🚀 Starting Frontend Demo..." Yellow
    Write-Colored "⚠️  Backend will NOT start (demo is autonomous)" Yellow
    Write-Host ""
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\packages\frontend-demo'; npm run dev"
    
    Start-Sleep -Seconds 3
    
    Write-Section "✨ Demo Ready!"
    Write-Colored "🟢 Frontend Demo:" Green
    Write-Colored "   http://localhost:5174" Green
    Write-Host ""
    Write-Colored "👉 Click 'Connexion rapide' to test`n" Yellow
}

function Launch-Dev {
    Clear-Host
    Write-Section "🎉 CampusLocal v2.0.0 - Dev Only"
    
    Check-Prerequisites
    
    Write-Colored "🚀 Starting Frontend Official..." Yellow
    Write-Colored "⚠️  Backend will NOT start" Yellow
    Write-Colored "⚠️  Demo will NOT start" Yellow
    Write-Host ""
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\packages\frontend-official'; npm run dev"
    
    Start-Sleep -Seconds 3
    
    Write-Section "✨ Dev Ready!"
    Write-Colored "🟡 Frontend Official:" Yellow
    Write-Colored "   http://localhost:5173" Green
    Write-Host ""
    Write-Colored "⚠️  Make sure backend is running on port 8000`n" Yellow
}

function Launch-Backend {
    Clear-Host
    Write-Section "🎉 CampusLocal v2.0.0 - Backend Only"
    
    Check-Prerequisites
    Install-Dependencies
    
    Write-Colored "🚀 Starting Backend..." Yellow
    
    $backendDir = Join-Path $PSScriptRoot "packages" "backend"
    $venvExe = Join-Path $backendDir "venv" "Scripts" "python.exe"
    
    Set-Location $backendDir
    & $venvExe -m uvicorn src.main:app --reload
}

# Main execution
if ($Demo) {
    Launch-Demo
}
elseif ($Dev) {
    Launch-Dev
}
elseif ($Backend) {
    Launch-Backend
}
else {
    Launch-All
}
