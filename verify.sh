#!/bin/bash
# Verify all components are properly set up

echo "🔍 Verifying CampusLocal v2 structure..."
echo ""

# Check backend
echo "📦 Backend Structure:"
[ -f "packages/backend/src/main.py" ] && echo "  ✅ main.py" || echo "  ❌ main.py MISSING"
[ -f "packages/backend/src/config.py" ] && echo "  ✅ config.py" || echo "  ❌ config.py MISSING"
[ -f "packages/backend/src/models/__init__.py" ] && echo "  ✅ models/" || echo "  ❌ models/ MISSING"
[ -f "packages/backend/src/routes/__init__.py" ] && echo "  ✅ routes/" || echo "  ❌ routes/ MISSING"
[ -f "packages/backend/requirements.txt" ] && echo "  ✅ requirements.txt" || echo "  ❌ requirements.txt MISSING"

echo ""
echo "📱 Frontend Official Structure:"
[ -f "packages/frontend-official/src/main.tsx" ] && echo "  ✅ main.tsx" || echo "  ❌ main.tsx MISSING"
[ -f "packages/frontend-official/src/App.tsx" ] && echo "  ✅ App.tsx" || echo "  ❌ App.tsx MISSING"
[ -f "packages/frontend-official/src/services/api.ts" ] && echo "  ✅ services/api.ts" || echo "  ❌ services/api.ts MISSING"
[ -f "packages/frontend-official/vite.config.ts" ] && echo "  ✅ vite.config.ts" || echo "  ❌ vite.config.ts MISSING"
[ -f "packages/frontend-official/tailwind.config.js" ] && echo "  ✅ tailwind.config.js" || echo "  ❌ tailwind.config.js MISSING"

echo ""
echo "📱 Frontend Demo Structure:"
[ -f "packages/frontend-demo/src/main.tsx" ] && echo "  ✅ main.tsx" || echo "  ❌ main.tsx MISSING"
[ -f "packages/frontend-demo/src/services/mockApi.ts" ] && echo "  ✅ services/mockApi.ts" || echo "  ❌ services/mockApi.ts MISSING"
[ -f "packages/frontend-demo/src/mocks/data.ts" ] && echo "  ✅ mocks/data.ts" || echo "  ❌ mocks/data.ts MISSING"

echo ""
echo "📚 Documentation:"
[ -f "docs/ARCHITECTURE.md" ] && echo "  ✅ ARCHITECTURE.md" || echo "  ❌ ARCHITECTURE.md MISSING"
[ -f "README.md" ] && echo "  ✅ README.md" || echo "  ❌ README.md MISSING"

echo ""
echo "=========================================="
echo "✅ Structure verification complete!"
echo "=========================================="
