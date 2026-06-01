# Migration Plan - De l'ancienne vers la nouvelle version

## État Actuel (Ancienne version)

### Structure
```
back/
  server.py          # Serveur HTTP ad-hoc (ThreadingHTTPServer)
  data/
    app-data.json    # Données en JSON file
    app-data.json.bak

front/
  index.html         # HTML statique
  script.js          # JS vanilla
  styles.css
  app-runtime.js
  conversations.js
```

### Problèmes identifiés
❌ Pas de séparation backend/frontend propre  
❌ Données stockées en JSON file (scalabilité limitée)  
❌ Pas d'authentification JWT  
❌ Frontend monolithique (JS vanilla)  
❌ Pas de gestion d'erreurs centralisée  
❌ Pas de tests  
❌ Pas de versioning API  

---

## Nouvelle Architecture v2.0.0

### Structure
```
packages/
  shared/             # Types partagés
  backend/            # FastAPI REST API
  frontend-official/  # React + API réelle
  frontend-demo/      # React + Mock API (autonome)
```

### Améliorations
✅ Backend robuste avec FastAPI + SQLAlchemy  
✅ Base de données PostgreSQL/SQLite  
✅ Authentification JWT sécurisée  
✅ Frontend moderne React + TypeScript  
✅ Version démo autonome pour pitching  
✅ API REST documentée (OpenAPI/Swagger)  
✅ Tests unitaires  
✅ Versionning API propre  
✅ Middleware CORS pré-configuré  

---

## Étapes de Migration des Données

### 1️⃣ Export des anciennes données
```python
# Script pour lire app-data.json et mapper vers les nouveaux modèles
import json
from pathlib import Path

old_data = json.load(open('back/data/app-data.json'))

# Extraction :
# - Users → seed database
# - Posts (threads/profiles) → Posts table
# - Comments → Comments table
# - Likes → Likes table
```

### 2️⃣ Seed de la nouvelle DB
```bash
cd packages/backend
python -m uvicorn src.main:app --reload

# Les données de démo sont automatiquement seedées via src/database/seed.py
```

### 3️⃣ Vérification intégrité
```bash
# Tester tous les endpoints via OpenAPI docs
http://localhost:8000/docs
```

### 4️⃣ Test des frontends
```bash
# Officiel
http://localhost:5173

# Démo
http://localhost:5174
```

### 5️⃣ Suppression ancienne version
```bash
# Une fois tout validé
rm -rf back/
rm -rf front/
```

---

## Endpoints Migration Checklist

### ✅ Auth
- [x] POST /api/auth/register
- [x] POST /api/auth/login
- [x] GET /api/auth/me

### ✅ Users
- [x] GET /api/users/{id}
- [x] PUT /api/users/me
- [x] POST /api/users/{id}/follow
- [x] POST /api/users/{id}/unfollow

### ✅ Posts
- [x] POST /api/posts (create)
- [x] GET /api/posts (feed)
- [x] POST /api/posts/{id}/like
- [x] POST /api/posts/{id}/unlike
- [x] POST /api/posts/{id}/comments
- [x] GET /api/posts/{id}/comments

### ✅ Events
- [x] POST /api/events
- [x] GET /api/events
- [x] POST /api/events/{id}/rsvp

---

## Testing Checklist

### Backend
- [ ] `pytest packages/backend/src/tests/`
- [ ] Vérifier CORS headers
- [ ] Tester JWT token expiration
- [ ] Tester validation input

### Frontend Officiel
- [ ] Login/Register flow
- [ ] Feed display & refresh
- [ ] Post creation
- [ ] Like/Unlike
- [ ] Comments
- [ ] Follow/Unfollow
- [ ] Events RSVP

### Frontend Démo
- [ ] Fonctionne sans serveur backend
- [ ] Mock API répond correctement
- [ ] Données persistantes en localStorage
- [ ] Tous les tests officiel + démo

---

## Déploiement Progressif

### Phase 1 : Déployer démo (zéro dépendance)
```bash
cd packages/frontend-demo
npm run build
# Deploy à Vercel/Netlify
```
→ **Impact** : Aucun (version complètement autonome)

### Phase 2 : Déployer backend
```bash
cd packages/backend
# Deploy à Render/Railway avec DB PostgreSQL
```
→ **Impact** : Infrastructure backend en place

### Phase 3 : Déployer frontend officiel
```bash
cd packages/frontend-official
npm run build
# Deploy à Vercel/Netlify, pointe sur API backend
```
→ **Impact** : Frontend officiel connecté au backend

### Phase 4 : Supprimer ancienne version
```bash
rm -rf back/ front/
git commit -m "chore: remove legacy v1 codebase"
```
→ **Impact** : Nettoyage complet

---

## Rollback Plan

Si problème critique :
1. Les anciennes données sont exportées → peuvent être re-importées
2. Docker images du backend peuvent être re-déployées
3. Frontend démo reste autonome même si officiel down

---

## Support & Aide

Pour des questions :
- Backend issues → Check `packages/backend/src/routes/`
- Frontend issues → Check `packages/frontend-official/src/`
- Demo issues → Check `packages/frontend-demo/src/mocks/`

Documentation détaillée : voir `docs/ARCHITECTURE.md`
