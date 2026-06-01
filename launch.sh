#!/bin/bash

# 🚀 CampusLocal Launch Script for Mac/Linux
# 
# Usage: ./launch.sh
#        ./launch.sh --demo
#        ./launch.sh --dev
#        ./launch.sh --backend

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function log() {
    echo -e "${2}${1}${NC}"
}

function log_section() {
    echo ""
    log "$(printf '═%.0s' {1..60})" "$CYAN"
    log "  $1" "$CYAN"
    log "$(printf '═%.0s' {1..60})" "$CYAN"
    echo ""
}

function check_prerequisites() {
    log_section "🔍 Checking Prerequisites"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log "✅ Node.js: $NODE_VERSION" "$GREEN"
    else
        log "❌ Node.js not found! Please install Node.js" "$RED"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log "✅ npm: $NPM_VERSION" "$GREEN"
    else
        log "❌ npm not found!" "$RED"
        exit 1
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        log "✅ Python: $PYTHON_VERSION" "$GREEN"
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version)
        log "✅ Python: $PYTHON_VERSION" "$GREEN"
    else
        log "⚠️  Python not found (needed for backend)" "$YELLOW"
    fi
}

function install_dependencies() {
    log_section "📦 Installing Dependencies"
    
    # Root dependencies
    if [ ! -d "node_modules" ]; then
        log "Installing root dependencies..." "$YELLOW"
        npm install
        log "✅ Root dependencies installed" "$GREEN"
    else
        log "✅ Root dependencies already installed" "$GREEN"
    fi
    
    # Backend Python venv
    BACKEND_DIR="packages/backend"
    VENV_PATH="$BACKEND_DIR/venv"
    
    if [ ! -d "$VENV_PATH" ]; then
        log "Creating Python virtual environment..." "$YELLOW"
        python3 -m venv "$VENV_PATH"
        log "✅ Virtual environment created" "$GREEN"
        
        # Install requirements
        log "Installing Python requirements..." "$YELLOW"
        source "$VENV_PATH/bin/activate"
        pip install -r "$BACKEND_DIR/requirements.txt"
        deactivate
        log "✅ Python requirements installed" "$GREEN"
    else
        log "✅ Backend virtual environment exists" "$GREEN"
    fi
}

function display_status() {
    log_section "✨ Services Ready!"
    
    log "📋 Available Services:" "$CYAN"
    echo ""
    log "🔵 Backend API:" "$BLUE"
    log "   http://localhost:8000" "$GREEN"
    log "   API Documentation: http://localhost:8000/docs" "$GREEN"
    echo ""
    log "🟢 Frontend Demo (Autonomous):" "$GREEN"
    log "   http://localhost:5174" "$GREEN"
    log "   👉 Click 'Connexion rapide' to test" "$GREEN"
    echo ""
    log "🟡 Frontend Official:" "$YELLOW"
    log "   http://localhost:5173" "$GREEN"
    echo ""
    log "💡 Tips:" "$CYAN"
    log "   • Demo works WITHOUT backend (try disabling backend)" "$BLUE"
    log "   • Ctrl+C to stop all services" "$BLUE"
    log "   • Changes are live-reloaded (HMR enabled)" "$BLUE"
    echo ""
}

function launch_all() {
    clear
    log_section "🎉 CampusLocal v2.0.0 - Launch Script"
    
    check_prerequisites
    install_dependencies
    
    log_section "🚀 Starting All Services"
    
    # Start backend
    log "Starting Backend (FastAPI)..." "$YELLOW"
    (cd packages/backend && source venv/bin/activate && python -m uvicorn src.main:app --reload) &
    BACKEND_PID=$!
    
    sleep 3
    
    # Start frontend demo
    log "Starting Frontend Demo..." "$YELLOW"
    (cd packages/frontend-demo && npm run dev) &
    DEMO_PID=$!
    
    sleep 2
    
    # Start frontend official
    log "Starting Frontend Official..." "$YELLOW"
    (cd packages/frontend-official && npm run dev) &
    OFFICIAL_PID=$!
    
    sleep 3
    
    display_status
    
    log "📝 Press Ctrl+C to stop all services" "$CYAN"
    echo ""
    
    # Wait for all processes
    wait
}

function launch_demo() {
    clear
    log_section "🎉 CampusLocal v2.0.0 - Demo Only"
    
    check_prerequisites
    
    log "🚀 Starting Frontend Demo..." "$YELLOW"
    log "⚠️  Backend will NOT start (demo is autonomous)" "$YELLOW"
    echo ""
    
    cd packages/frontend-demo
    npm run dev
}

function launch_dev() {
    clear
    log_section "🎉 CampusLocal v2.0.0 - Dev Only"
    
    check_prerequisites
    
    log "🚀 Starting Frontend Official..." "$YELLOW"
    log "⚠️  Backend will NOT start" "$YELLOW"
    log "⚠️  Demo will NOT start" "$YELLOW"
    echo ""
    
    cd packages/frontend-official
    npm run dev
}

function launch_backend() {
    clear
    log_section "🎉 CampusLocal v2.0.0 - Backend Only"
    
    check_prerequisites
    install_dependencies
    
    log "🚀 Starting Backend..." "$YELLOW"
    echo ""
    
    cd packages/backend
    source venv/bin/activate
    python -m uvicorn src.main:app --reload
}

# Parse arguments
case "$1" in
    --demo)
        launch_demo
        ;;
    --dev)
        launch_dev
        ;;
    --backend)
        launch_backend
        ;;
    *)
        launch_all
        ;;
esac
