#!/bin/bash
# Development script - starts all services

echo "🚀 Starting CampusLocal development environment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  npm install
fi

if [ ! -d "packages/backend/venv" ]; then
  echo "🐍 Setting up Python virtual environment..."
  cd packages/backend
  python -m venv venv
  source venv/Scripts/activate
  pip install -r requirements.txt
  cd ../..
fi

# Install frontend dependencies if needed
if [ ! -d "packages/frontend-official/node_modules" ]; then
  echo "📦 Installing frontend-official dependencies..."
  npm install -w packages/frontend-official
fi

if [ ! -d "packages/frontend-demo/node_modules" ]; then
  echo "📦 Installing frontend-demo dependencies..."
  npm install -w packages/frontend-demo
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ All services starting..."
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🔗 Backend (FastAPI):        http://localhost:8000"
echo "   📚 API Docs:              http://localhost:8000/docs"
echo ""
echo "📱 Frontend Official:        http://localhost:5173"
echo "📱 Frontend Demo:            http://localhost:5174"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Start services in parallel
npm run dev
