from __future__ import annotations

import base64
import hashlib
import hmac
import json
import mimetypes
import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse
import re

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent
FRONT_DIR = REPO_ROOT / 'front'
DATA_PATH = ROOT / 'data' / 'app-data.json'
PORT = int(os.environ.get('PORT', '3000'))

SEED_PROFILES = {
    'lea': {
        'id': 'lea', 'name': 'Léa Martin', 'initials': 'LM', 'grad': 'linear-gradient(135deg,#c8f564,#3dd6c8)', 'cover': 'linear-gradient(135deg,#1a2a3a,#3dd6c8)', 'promo': 'BTS NDRC 1A · Groupe Homneo', 'location': 'Bibliothèque Homneo · Paris', 'bio': 'Toujours partante pour une session de révision, un café après les cours ou un échange de fiches.', 'posts': 12, 'followers': 284, 'following': 147, 'tags': ['📚 Révision', '🤝 Réseautage', '✅ Vérifié'], 'followable': True,
    },
    'thomas': {
        'id': 'thomas', 'name': 'Thomas Khelil', 'initials': 'TK', 'grad': 'linear-gradient(135deg,#ff6b9d,#9b5de5)', 'cover': 'linear-gradient(135deg,#2a0a1a,#ff6b9d)', 'promo': 'Licence Pro Marketing · Homneo', 'location': 'La Bellevilloise · Paris', 'bio': 'Toujours chaud pour un afterwork, une sortie ou une session gaming.', 'posts': 9, 'followers': 418, 'following': 201, 'tags': ['🎮 Gaming', '🏃 Sport', '🍺 Verre'], 'followable': True,
    },
    'sara': {
        'id': 'sara', 'name': 'Sara Benali', 'initials': 'SB', 'grad': 'linear-gradient(135deg,#4d9de0,#3dd6c8)', 'cover': 'linear-gradient(135deg,#0a1a2a,#4d9de0)', 'promo': 'BTS NDRC 1A · Homneo', 'location': 'Campus Homneo · Paris', 'bio': 'Entre les cours, les fiches et les cafés improvisés, je suis là pour rencontrer des personnes sérieuses mais cool.', 'posts': 15, 'followers': 512, 'following': 180, 'tags': ['☕ Café', '📚 Révision', '🌆 Sortie'], 'followable': True,
    },
    'axel': {
        'id': 'axel', 'name': 'Axel Remy', 'initials': 'AR', 'grad': 'linear-gradient(135deg,#ffb347,#ff6b9d)', 'cover': 'linear-gradient(135deg,#3a1a0a,#ffb347)', 'promo': 'BTS MHR 2A · Homneo', 'location': 'Trocadéro · Paris', 'bio': 'Sport, sorties, projet d’équipe et gros débriefs après les cours.', 'posts': 8, 'followers': 267, 'following': 143, 'tags': ['🏃 Sport', '🎮 Gaming', '🍺 Verre'], 'followable': True,
    },
    'nina': {
        'id': 'nina', 'name': 'Nina Dupont', 'initials': 'ND', 'grad': 'linear-gradient(135deg,#9b5de5,#4d9de0)', 'cover': 'linear-gradient(135deg,#1a0a1a,#9b5de5)', 'promo': 'Licence 1 Droit', 'location': 'Île-de-France', 'bio': 'Plutôt café et révision, mais je ne dis pas non à une vraie bonne sortie quand le mood change.', 'posts': 6, 'followers': 193, 'following': 108, 'tags': ['📚 Révision', '☕ Café', '🎵 Musique'], 'followable': True,
    },
    'group': {
        'id': 'group', 'name': 'Groupe NDRC 1A', 'initials': 'G', 'grad': 'linear-gradient(135deg,#ffb347,#ff6b9d)', 'cover': 'linear-gradient(135deg,#3a1a0a,#ffb347)', 'promo': 'Conversation de groupe', 'location': 'Campus Homneo', 'bio': 'Conversation de groupe pour la promo. Le bouton d’abonnement est désactivé sur les groupes.', 'posts': 0, 'followers': 0, 'following': 0, 'tags': ['💬 Groupe', '📚 Partiels'], 'followable': False,
    },
}

SEED_THREADS = {
    'lea': [
        {'from': 'them', 'text': "T'as vu pour le partiel de droit ?", 'time': '08:14'},
        {'from': 'me', 'text': 'Oui, je révise toute la matinée 😅', 'time': '08:16'},
        {'from': 'them', 'text': "J'ai partagé les annales sur le groupe, regarde", 'time': '08:17'},
    ],
    'thomas': [
        {'from': 'them', 'text': 'On se retrouve à la BU à 14h ?', 'time': '12:01'},
        {'from': 'me', 'text': "Oui, j'arrive avec mes fiches.", 'time': '12:04'},
        {'from': 'them', 'text': 'Parfait, je prends le café ☕', 'time': '12:05'},
    ],
    'group': [
        {'from': 'them', 'text': "Thomas: N'oubliez pas les annales !", 'time': '09:10'},
        {'from': 'me', 'text': 'Je les ai déjà imprimées, je vous les envoie.', 'time': '09:12'},
        {'from': 'them', 'text': "Léa: Merci, t'assures 🙌", 'time': '09:13'},
    ],
    'sara': [
        {'from': 'them', 'text': 'Merci pour les fiches 🙏', 'time': '17:25'},
        {'from': 'me', 'text': 'Avec plaisir, si tu veux on révise ensemble.', 'time': '17:28'},
        {'from': 'them', 'text': 'Carrément, demain après-midi ?', 'time': '17:30'},
    ],
    'axel': [
        {'from': 'them', 'text': 'Tu joues à quoi ce soir ?', 'time': '18:40'},
        {'from': 'me', 'text': 'Un peu de tout, mais plutôt chill.', 'time': '18:43'},
        {'from': 'them', 'text': 'On peut se faire un verre après le sport ?', 'time': '18:45'},
    ],
    'nina': [
        {'from': 'them', 'text': 'Super soirée 🎉', 'time': '23:08'},
        {'from': 'me', 'text': "Oui, c'était trop bien !", 'time': '23:11'},
        {'from': 'them', 'text': 'On remet ça bientôt ?', 'time': '23:12'},
    ],
}

DEMO_USER = {
    'id': 'u-demo',
    'name': 'Lola Martin',
    'email': 'demo@campus.local',
    'passwordHash': None,
    'salt': 'seed',
    'photo': '',
    'bio': 'BTS NDRC 1ère année · Passionnée de marketing & tennis 🎾',
    'role': 'user',
    'mutedUntil': '',
}

ADMIN_USER = {
    'id': 'u-admin',
    'name': 'Admin Campus',
    'email': 'admin@campus.local',
    'passwordHash': None,
    'salt': 'seed',
    'photo': '',
    'bio': 'Compte de modération pour tester la suppression de messages, comptes et les mutes.',
    'role': 'admin',
    'mutedUntil': '',
}


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100_000).hex()
    return f'{salt}:{digest}'


def verify_password(password: str, stored: str) -> bool:
    if not stored or ':' not in stored:
        return False
    salt, digest = stored.split(':', 1)
    candidate = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100_000).hex()
    return hmac.compare_digest(digest, candidate)


def load_data() -> dict[str, Any]:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_PATH.exists():
        data = {
            'users': [
                dict(DEMO_USER, passwordHash=hash_password('demo123', 'seed')),
                dict(ADMIN_USER, passwordHash=hash_password('admin123', 'seed')),
            ],
            'sessions': {},
            'follows': {'u-demo': ['lea', 'sara'], 'u-admin': []},
            'conversations': {
                'u-demo': {k: [dict(message) for message in v] for k, v in SEED_THREADS.items()},
                'u-admin': {},
            },
            'feedPosts': [
                {'id': 'p1', 'authorId': 'u-demo', 'authorName': 'Lola Martin', 'content': '📚', 'bg': 'linear-gradient(135deg,#1a2a3a,#3dd6c8)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                {'id': 'p2', 'authorId': 'u-demo', 'authorName': 'Lola Martin', 'content': '🎉', 'bg': 'linear-gradient(135deg,#2a0a1a,#ff6b9d)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                {'id': 'p3', 'authorId': 'u-demo', 'authorName': 'Lola Martin', 'content': '☀️', 'bg': 'linear-gradient(135deg,#1a3a0a,#c8f564)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
            ],
            'posts': {
                # demo user gets seeded posts for the profile view
                'u-demo': [
                    {'id': 'p1', 'content': '📚', 'bg': 'linear-gradient(135deg,#1a2a3a,#3dd6c8)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                    {'id': 'p2', 'content': '🎉', 'bg': 'linear-gradient(135deg,#2a0a1a,#ff6b9d)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                    {'id': 'p3', 'content': '☀️', 'bg': 'linear-gradient(135deg,#1a3a0a,#c8f564)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                ],
                'u-admin': [],
            },
            'reports': [],
        }
        save_data(data)
        return data
    data = json.loads(DATA_PATH.read_text(encoding='utf-8'))
    # Remove any persisted sessions that point to the demo account so that
    # users are not automatically signed in as the demo user on first visit.
    sessions = data.setdefault('sessions', {})
    demo_sids = [sid for sid, uid in list(sessions.items()) if uid == 'u-demo']
    if demo_sids:
        for sid in demo_sids:
            del sessions[sid]
        save_data(data)
    if ensure_seed_accounts(data):
        save_data(data)
    return data


def ensure_seed_accounts(data: dict[str, Any]) -> bool:
    changed = False
    users = data.setdefault('users', [])
    follows = data.setdefault('follows', {})
    conversations = data.setdefault('conversations', {})

    for user in users:
        if 'role' not in user:
            user['role'] = 'user'
            changed = True
        if 'mutedUntil' not in user:
            user['mutedUntil'] = ''
            changed = True

    for seed_user, password, follows_seed, conversations_seed in (
        (DEMO_USER, 'demo123', ['lea', 'sara'], {k: [dict(message) for message in v] for k, v in SEED_THREADS.items()}),
        (ADMIN_USER, 'admin123', [], {}),
    ):
        existing = next((user for user in users if user['id'] == seed_user['id'] or user['email'].lower() == seed_user['email'].lower()), None)
        if existing:
            if 'role' not in existing:
                existing['role'] = seed_user.get('role', 'user')
                changed = True
            if 'mutedUntil' not in existing:
                existing['mutedUntil'] = ''
                changed = True
            if not existing.get('passwordHash'):
                existing['passwordHash'] = hash_password(password, 'seed')
                changed = True
        else:
            users.append(dict(seed_user, passwordHash=hash_password(password, 'seed')))
            changed = True

        if seed_user['id'] not in follows:
            follows[seed_user['id']] = list(follows_seed)
            changed = True
        if seed_user['id'] not in conversations:
            conversations[seed_user['id']] = conversations_seed
            changed = True
        # ensure posts buckets exist for seeded accounts
        feed_posts = data.setdefault('feedPosts', [])
        posts = data.setdefault('posts', {})
        if seed_user['id'] not in posts:
            # for demo account, seed some demo posts for the profile grid
            if seed_user['id'] == 'u-demo':
                posts[seed_user['id']] = [
                    {'id': 'p1', 'content': '📚', 'bg': 'linear-gradient(135deg,#1a2a3a,#3dd6c8)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                    {'id': 'p2', 'content': '🎉', 'bg': 'linear-gradient(135deg,#2a0a1a,#ff6b9d)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                    {'id': 'p3', 'content': '☀️', 'bg': 'linear-gradient(135deg,#1a3a0a,#c8f564)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                ]
            else:
                posts[seed_user['id']] = []
            changed = True

        if seed_user['id'] == 'u-demo' and not feed_posts:
            feed_posts.extend([
                {'id': 'p1', 'authorId': 'u-demo', 'authorName': 'Lola Martin', 'content': '📚', 'bg': 'linear-gradient(135deg,#1a2a3a,#3dd6c8)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                {'id': 'p2', 'authorId': 'u-demo', 'authorName': 'Lola Martin', 'content': '🎉', 'bg': 'linear-gradient(135deg,#2a0a1a,#ff6b9d)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
                {'id': 'p3', 'authorId': 'u-demo', 'authorName': 'Lola Martin', 'content': '☀️', 'bg': 'linear-gradient(135deg,#1a3a0a,#c8f564)', 'createdAt': datetime.utcnow().isoformat() + 'Z'},
            ])
            changed = True

    return changed


def save_data(data: dict[str, Any]) -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


def json_response(handler: BaseHTTPRequestHandler, status: int, payload: Any, extra_headers: dict[str, str] | None = None) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type')
    handler.send_header('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
    if extra_headers:
        for key, value in extra_headers.items():
            handler.send_header(key, value)
    handler.end_headers()
    handler.wfile.write(body)


def text_response(handler: BaseHTTPRequestHandler, path: Path) -> None:
    if not path.exists():
        json_response(handler, 404, {'error': 'not_found'})
        return
    mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    body = path.read_bytes()
    handler.send_response(200)
    handler.send_header('Content-Type', mime if mime.startswith('text/') or mime.endswith('xml') else mime)
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Cache-Control', 'no-store')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.end_headers()
    handler.wfile.write(body)


def parse_json(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    length = int(handler.headers.get('Content-Length', '0') or '0')
    raw = handler.rfile.read(length) if length else b''
    if not raw:
        return {}
    try:
        return json.loads(raw.decode('utf-8'))
    except json.JSONDecodeError:
        return {}


def cookies(handler: BaseHTTPRequestHandler) -> SimpleCookie:
    cookie = SimpleCookie()
    raw = handler.headers.get('Cookie')
    if raw:
        cookie.load(raw)
    return cookie


def get_session_user(data: dict[str, Any], handler: BaseHTTPRequestHandler) -> dict[str, Any] | None:
    sid = cookies(handler).get('sid')
    if not sid:
        return None
    user_id = data['sessions'].get(sid.value)
    if not user_id:
        return None
    return next((user for user in data['users'] if user['id'] == user_id), None)


def public_user(user: dict[str, Any] | None) -> dict[str, Any] | None:
    if not user:
        return None
    return {
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'firstname': user.get('firstname', ''),
        'lastname': user.get('lastname', ''),
        'photo': user.get('photo', ''),
        'bio': user.get('bio', ''),
        'role': user.get('role', 'user'),
        'mutedUntil': user.get('mutedUntil', ''),
    }


def is_admin(user: dict[str, Any] | None) -> bool:
    return bool(user and user.get('role') == 'admin')


def is_muted(user: dict[str, Any] | None) -> bool:
    if not user:
        return False
    muted_until = str(user.get('mutedUntil', '') or '').strip()
    if not muted_until:
        return False
    try:
        parsed = datetime.fromisoformat(muted_until.replace('Z', '+00:00'))
    except ValueError:
        return False
    now = datetime.now(parsed.tzinfo) if parsed.tzinfo else datetime.utcnow()
    return parsed > now


def deny_if_not_admin(data: dict[str, Any], handler: BaseHTTPRequestHandler) -> dict[str, Any] | None:
    user = get_session_user(data, handler)
    if not is_admin(user):
        json_response(handler, 403, {'error': 'forbidden'})
        return None
    return user


def deny_if_muted(user: dict[str, Any] | None, handler: BaseHTTPRequestHandler) -> bool:
    if user and user.get('role') == 'admin':
        return False
    if is_muted(user):
        json_response(handler, 403, {'error': 'user_muted', 'mutedUntil': user.get('mutedUntil', '') if user else ''})
        return True
    return False


def ensure_bucket(data: dict[str, Any], user_id: str) -> dict[str, list[dict[str, Any]]]:
    bucket = data['conversations'].setdefault(user_id, {})
    return bucket


def get_thread(data: dict[str, Any], user_id: str, profile_id: str) -> list[dict[str, Any]]:
    bucket = ensure_bucket(data, user_id)
    bucket.setdefault(profile_id, [dict(message) for message in SEED_THREADS.get(profile_id, [])])
    return bucket[profile_id]


def profile_count(data: dict[str, Any], user_id: str, profile_id: str) -> int:
    return SEED_PROFILES[profile_id]['followers'] + (1 if profile_id in data['follows'].get(user_id, []) else 0)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:
        return

    def do_OPTIONS(self) -> None:
        json_response(self, 204, {})

    def do_GET(self) -> None:
        data = load_data()
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path == '/api/health':
            json_response(self, 200, {'ok': True})
            return

        if path == '/api/session':
            json_response(self, 200, {'user': public_user(get_session_user(data, self))})
            return

        if path == '/api/admin/users':
            admin_user = deny_if_not_admin(data, self)
            if not admin_user:
                return
            json_response(self, 200, {'users': [public_user(user) for user in data['users']]})
            return

        if path == '/api/bootstrap':
            user = get_session_user(data, self)
            follows = data['follows'].get(user['id'], []) if user else []
            conversations = data['conversations'].get(user['id'], {}) if user else {}
            posts = data.get('posts', {}).get(user['id'], []) if user else []
            feed_posts = data.get('feedPosts', [])
            json_response(self, 200, {'user': public_user(user), 'profiles': SEED_PROFILES, 'follows': follows, 'conversations': conversations, 'posts': posts, 'feedPosts': feed_posts})
            return

        if path == '/api/me':
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            json_response(self, 200, {'user': public_user(user), 'follows': data['follows'].get(user['id'], [])})
            return

        convo_prefix = '/api/conversations/'
        if path.startswith(convo_prefix):
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            profile_id = path[len(convo_prefix):]
            messages = get_thread(data, user['id'], profile_id)
            json_response(self, 200, {'messages': messages})
            return

        posts_prefix = '/api/posts'
        if path == posts_prefix and self.command == 'GET':
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            feed_posts = data.get('feedPosts', [])
            json_response(self, 200, {'posts': feed_posts})
            return

        profile_prefix = '/api/profiles/'
        if path.startswith(profile_prefix) and path.endswith('/follow'):
            # handled in POST
            json_response(self, 405, {'error': 'method_not_allowed'})
            return

        if path.startswith(profile_prefix):
            profile_id = path[len(profile_prefix):]
            profile = SEED_PROFILES.get(profile_id)
            if not profile:
                json_response(self, 404, {'error': 'not_found'})
                return
            user = get_session_user(data, self)
            following = profile_id in data['follows'].get(user['id'], []) if user else False
            profile_payload = dict(profile)
            if user:
                profile_payload['followers'] = profile_count(data, user['id'], profile_id)
            json_response(self, 200, {'profile': profile_payload, 'following': following})
            return

        if path in ('/', '/index.html'):
            text_response(self, FRONT_DIR / 'index.html')
            return

        static_path = FRONT_DIR / path.lstrip('/')
        if static_path.exists() and static_path.is_file():
            text_response(self, static_path)
            return

        json_response(self, 404, {'error': 'not_found'})

    def do_POST(self) -> None:
        data = load_data()
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        body = parse_json(self)

        def is_valid_email(email: str) -> bool:
            # simple validation: one @ and at least one dot after
            if not isinstance(email, str):
                return False
            email = email.strip()
            return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email))

        if path.startswith('/api/admin/users/') and path.endswith('/mute'):
            admin_user = deny_if_not_admin(data, self)
            if not admin_user:
                return
            target_id = path[len('/api/admin/users/'):-len('/mute')]
            target = next((user for user in data['users'] if user['id'] == target_id), None)
            if not target:
                json_response(self, 404, {'error': 'user_not_found'})
                return
            minutes_raw = body.get('minutes', 60)
            try:
                minutes = int(minutes_raw)
            except (TypeError, ValueError):
                json_response(self, 400, {'error': 'invalid_minutes'})
                return
            if minutes <= 0:
                target['mutedUntil'] = ''
            else:
                target['mutedUntil'] = (datetime.utcnow() + timedelta(minutes=minutes)).isoformat(timespec='seconds') + 'Z'
            save_data(data)
            json_response(self, 200, {'ok': True, 'user': public_user(target)})
            return

        if path == '/api/auth/register':
            firstname = str(body.get('firstname', '')).strip()
            lastname = str(body.get('lastname', '')).strip()
            name_from_body = str(body.get('name', '')).strip()
            email = str(body.get('email', '')).strip().lower()
            password = str(body.get('password', ''))
            # If firstname/lastname not provided, try to split `name`
            if not firstname and name_from_body:
                parts = name_from_body.split()
                firstname = parts[0] if parts else ''
                lastname = ' '.join(parts[1:]) if len(parts) > 1 else ''
            if not firstname or not lastname or not email or len(password) < 4:
                json_response(self, 400, {'error': 'invalid_input'})
                return
            if not is_valid_email(email):
                json_response(self, 400, {'error': 'invalid_email'})
                return
            if any(user['email'].lower() == email for user in data['users']):
                json_response(self, 409, {'error': 'email_exists'})
                return
            user_id = f"u-{secrets.token_hex(6)}"
            full_name = f"{firstname} {lastname}".strip()
            birth = str(body.get('birth', '')).strip()
            user = {
                'id': user_id,
                'name': full_name,
                'firstname': firstname,
                'lastname': lastname,
                'birth': birth,
                'email': email,
                'passwordHash': hash_password(password),
                'photo': '',
                'bio': 'BTS NDRC 1ère année · Nouveau membre',
                'role': 'user',
                'mutedUntil': ''
            }
            data['users'].append(user)
            data['follows'][user_id] = []
            # Do not seed demo threads into every new user - keep conversations empty for real users
            data['conversations'][user_id] = {}
            sid = secrets.token_hex(18)
            data['sessions'][sid] = user_id
            save_data(data)
            json_response(self, 200, {'user': public_user(user)}, {'Set-Cookie': f'sid={sid}; Path=/; HttpOnly; SameSite=Lax'})
            return

        if path == '/api/auth/login':
            email = str(body.get('email', '')).strip().lower()
            password = str(body.get('password', ''))
            if not is_valid_email(email):
                json_response(self, 400, {'error': 'invalid_email'})
                return
            user = next((u for u in data['users'] if u['email'].lower() == email), None)
            if not user or not verify_password(password, user.get('passwordHash', '')):
                json_response(self, 401, {'error': 'invalid_credentials'})
                return
            sid = secrets.token_hex(18)
            data['sessions'][sid] = user['id']
            save_data(data)
            json_response(self, 200, {'user': public_user(user)}, {'Set-Cookie': f'sid={sid}; Path=/; HttpOnly; SameSite=Lax'})
            return

        if path == '/api/auth/logout':
            sid = cookies(self).get('sid')
            if sid and sid.value in data['sessions']:
                del data['sessions'][sid.value]
                save_data(data)
            json_response(self, 200, {'ok': True}, {'Set-Cookie': 'sid=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'})
            return

        if path == '/api/uploads/profile-photo':
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            if deny_if_muted(user, self):
                return
            photo = str(body.get('photo', ''))
            if not photo.startswith('data:image/'):
                json_response(self, 400, {'error': 'invalid_photo'})
                return
            user['photo'] = photo
            save_data(data)
            json_response(self, 200, {'photo': photo})
            return

        if path == '/api/reports':
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            if deny_if_muted(user, self):
                return
            report = {
                'id': f"r-{secrets.token_hex(6)}",
                'userId': user['id'],
                'type': str(body.get('type', 'Autre')),
                'note': str(body.get('note', '')).strip(),
                'targetId': str(body.get('targetId', '')).strip(),
                'createdAt': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
            }
            data['reports'].append(report)
            save_data(data)
            json_response(self, 200, {'ok': True, 'report': report})
            return

        if path == '/api/posts':
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            if deny_if_muted(user, self):
                return
            content = str(body.get('content', '')).strip()
            bg = str(body.get('bg', '')).strip() or ''
            if not content:
                json_response(self, 400, {'error': 'empty_content'})
                return
            post_id = f"p-{secrets.token_hex(6)}"
            post = {'id': post_id, 'authorId': user['id'], 'authorName': user['name'], 'content': content, 'bg': bg, 'createdAt': datetime.utcnow().isoformat() + 'Z'}
            feed_posts = data.setdefault('feedPosts', [])
            feed_posts.insert(0, post)
            posts_bucket = data.setdefault('posts', {})
            posts_bucket.setdefault(user['id'], []).insert(0, post)
            save_data(data)
            json_response(self, 200, {'post': post, 'posts': feed_posts, 'profilePosts': posts_bucket[user['id']]})
            return

        if path.startswith('/api/conversations/'):
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            profile_id = path[len('/api/conversations/'):]
            messages = get_thread(data, user['id'], profile_id)
            text = str(body.get('text', '')).strip()
            if not text:
                json_response(self, 400, {'error': 'empty_message'})
                return
            if deny_if_muted(user, self):
                return
            message = {
                'from': str(body.get('from', 'me')),
                'text': text,
                'time': str(body.get('time', '') or __import__('datetime').datetime.now().strftime('%H:%M')),
            }
            messages.append(message)
            save_data(data)
            json_response(self, 200, {'messages': messages})
            return

        if path.startswith('/api/profiles/') and path.endswith('/follow'):
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            if deny_if_muted(user, self):
                return
            profile_id = path[len('/api/profiles/'): -len('/follow')]
            follows = data['follows'].setdefault(user['id'], [])
            following = profile_id not in follows
            if following:
                follows.append(profile_id)
            else:
                follows.remove(profile_id)
            save_data(data)
            json_response(self, 200, {'following': following, 'followers': profile_count(data, user['id'], profile_id)})
            return

        json_response(self, 404, {'error': 'not_found'})

    def do_DELETE(self) -> None:
        data = load_data()
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        admin_conversation_prefix = '/api/admin/conversations/'
        if path.startswith(admin_conversation_prefix):
            admin_user = deny_if_not_admin(data, self)
            if not admin_user:
                return
            raw = path[len(admin_conversation_prefix):]
            parts = raw.split('/')
            if len(parts) != 3:
                json_response(self, 400, {'error': 'invalid_path'})
                return
            user_id, profile_id, index_raw = parts
            try:
                index = int(index_raw)
            except ValueError:
                json_response(self, 400, {'error': 'invalid_index'})
                return
            thread = get_thread(data, user_id, profile_id)
            if index < 0 or index >= len(thread):
                json_response(self, 404, {'error': 'message_not_found'})
                return
            removed = thread.pop(index)
            save_data(data)
            json_response(self, 200, {'ok': True, 'removed': removed, 'messages': thread})
            return

        admin_user_prefix = '/api/admin/users/'
        if path.startswith(admin_user_prefix):
            admin_user = deny_if_not_admin(data, self)
            if not admin_user:
                return
            target_id = path[len(admin_user_prefix):]
            target = next((user for user in data['users'] if user['id'] == target_id), None)
            if not target:
                json_response(self, 404, {'error': 'user_not_found'})
                return
            data['users'] = [user for user in data['users'] if user['id'] != target_id]
            data['follows'].pop(target_id, None)
            data['conversations'].pop(target_id, None)
            data['reports'] = [report for report in data['reports'] if report.get('userId') != target_id and report.get('targetId') != target_id]
            removed_sessions = [sid for sid, user_id in data['sessions'].items() if user_id == target_id]
            for sid in removed_sessions:
                del data['sessions'][sid]
            save_data(data)
            extra_headers = {}
            if admin_user['id'] == target_id:
                extra_headers['Set-Cookie'] = 'sid=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
            json_response(self, 200, {'ok': True, 'deletedUser': public_user(target)}, extra_headers)
            return

        json_response(self, 404, {'error': 'not_found'})

    def do_PATCH(self) -> None:
        data = load_data()
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        body = parse_json(self)

        if path == '/api/me/profile':
            user = get_session_user(data, self)
            if not user:
                json_response(self, 401, {'error': 'not_authenticated'})
                return
            if deny_if_muted(user, self):
                return
            if isinstance(body.get('name'), str) and body['name'].strip():
                user['name'] = body['name'].strip()
            if isinstance(body.get('bio'), str):
                user['bio'] = body['bio'].strip()
            if isinstance(body.get('photo'), str):
                user['photo'] = body['photo']
            save_data(data)
            json_response(self, 200, {'user': public_user(user)})
            return

        json_response(self, 404, {'error': 'not_found'})


def main() -> None:
    server = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    print(f'Campus Connect server running on http://127.0.0.1:{PORT}')
    server.serve_forever()


if __name__ == '__main__':
    main()
