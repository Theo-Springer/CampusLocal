# CampusLocal Architecture (v2.0.0)

## Overview

CampusLocal est réorganisée en une **architecture moderne, scalable et maintenable** avec 3 composants principaux :

### 1. **Backend API (FastAPI)**
- Framework moderne, lightweight et performant
- Architecture RESTful propre et documentée
- SQLAlchemy ORM pour la gestion de la base de données
- JWT pour l'authentification
- CORS middleware pré-configuré

**Localisation** : `packages/backend/`

### 2. **Frontend Officiel (React + Vite)**
- React 18 avec TypeScript pour la type-safety
- Vite pour le développement ultra-rapide (HMR)
- Tailwind CSS pour le styling moderne
- Zustand pour la gestion d'état légère
- React Router pour la navigation

**Localisation** : `packages/frontend-official/`

### 3. **Frontend Démo (React + Mock API)**
- **Même codebase que le frontend officiel** (réutilisation maximale)
- Mock Service Worker (MSW) pour simuler l'API sans backend
- Données fictives pré-chargées et stockables en localStorage
- **Déployable sur Vercel/Netlify en 1 clic** pour pitcher aux investisseurs

**Localisation** : `packages/frontend-demo/`

---

## Database Schema

### Entités principales

```
Users
├── id (UUID)
├── firstname, lastname
├── email (unique)
├── password_hash + salt
├── bio, photo_url, cover_url
├── campus, promo
├── role (user, moderator, admin)
├── is_verified
├── muted_until (pour les suspensions)
└── timestamps (created_at, updated_at, deleted_at)

↓↓↓ Relations ↓↓↓

Posts
├── id (UUID)
├── user_id (FK → Users)
├── content
├── post_type (text, image, video, event)
├── media_urls (ARRAY)
├── likes_count, comments_count
└── timestamps

Comments
├── id (UUID)
├── post_id (FK → Posts)
├── user_id (FK → Users)
├── content
└── timestamps

Likes
├── id (UUID)
├── user_id (FK → Users)
├── post_id (FK → Posts) OR comment_id (FK → Comments)
└── created_at

Events
├── id (UUID)
├── creator_id (FK → Users)
├── title, description
├── event_date, location
├── category (party, study, sports, casual)
├── is_public
└── timestamps

EventRSVPs
├── id (UUID)
├── event_id (FK → Events)
├── user_id (FK → Users)
├── status (yes, maybe, no)
└── created_at

Follows
├── id (UUID)
├── follower_id (FK → Users)
├── following_id (FK → Users)
└── created_at

Messages
├── id (UUID)
├── sender_id (FK → Users)
├── recipient_id (FK → Users)
├── content
├── is_read
└── timestamps

Notifications
├── id (UUID)
├── user_id (FK → Users)
├── type (like, comment, follow, message, rsvp)
├── related_user_id
├── post_id
├── is_read
└── created_at
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/me` - Infos utilisateur actuel

### Users
- `GET /api/users/{user_id}` - Récupérer profil utilisateur
- `PUT /api/users/me` - Mettre à jour son profil
- `POST /api/users/{user_id}/follow` - S'abonner
- `POST /api/users/{user_id}/unfollow` - Se désabonner
- `GET /api/users/{user_id}/posts` - Posts d'un utilisateur

### Posts
- `POST /api/posts` - Créer un post
- `GET /api/posts` - Feed (paginated)
- `GET /api/posts/{post_id}` - Récupérer un post
- `POST /api/posts/{post_id}/like` - Liker
- `POST /api/posts/{post_id}/unlike` - Unliker
- `POST /api/posts/{post_id}/comments` - Commenter
- `GET /api/posts/{post_id}/comments` - Récupérer comments

### Events
- `POST /api/events` - Créer événement
- `GET /api/events` - Lister événements
- `GET /api/events/{event_id}` - Détails événement
- `POST /api/events/{event_id}/rsvp` - RSVP (yes/maybe/no)

---

## Déploiement

### Backend (Render.com ou Railway)
```bash
cd packages/backend
pip install -r requirements.txt
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

**Env vars** :
- `DATABASE_URL=postgresql://...` (PostgreSQL en prod)
- `SECRET_KEY=your-super-secret-key`
- `CORS_ORIGINS=https://yourfrontend.com`

### Frontend Officiel (Vercel)
```bash
cd packages/frontend-official
npm run build
# Vercel détecte automatiquement et déploie
```

### Frontend Démo (Vercel)
```bash
cd packages/frontend-demo
npm run build
# Vercel détecte automatiquement et déploie
```

---

## Development Workflow

### Local Setup
```bash
# 1. Clone et cd
git clone <repo>
cd CampusLocal

# 2. Install all dependencies
npm install

# 3. Setup Python environment
cd packages/backend
python -m venv venv
source venv/Scripts/activate  # ou venv\Scripts\activate on Windows
pip install -r requirements.txt
cd ../..

# 4. Copy env example
cp packages/backend/.env.example packages/backend/.env

# 5. Start everything
npm run dev
```

### Services running
- Backend: http://localhost:8000 (API + /docs for OpenAPI)
- Frontend Official: http://localhost:5173
- Frontend Demo: http://localhost:5174

### Making changes

**Backend**: Modifiez les fichiers dans `packages/backend/src/` - Uvicorn recharge automatiquement

**Frontend**: Modifiez les fichiers dans `packages/frontend-official/src/` ou `frontend-demo/src/` - Vite HMR recharge instantanément

---

## Testing

### Backend
```bash
cd packages/backend
pytest src/tests/
```

### Frontend
```bash
cd packages/frontend-official
npm run test
```

---

## Project Structure Notes

- **Monorepo** : Facile de partager du code entre packages
- **TypeScript** : Front + types partagées = less bugs
- **Séparation clear** : Backend logic !== Frontend concerns
- **Version Démo** : Marketing autonome sans serveur
- **Docker ready** : Chaque package peut être containerisé

---

## Next Steps

1. ✅ Architecture créée
2. ⏳ Tester backend + frontend
3. ⏳ Intégrer migration données ancien → nouveau
4. ⏳ Déployer en prod
5. ⏳ Supprimer ancienne version
