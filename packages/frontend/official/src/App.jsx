import { useState, useEffect } from 'react'

const API = 'http://localhost:8000/api'

// ─── AUTH ────────────────────────────────────────────────────────────────────
function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => u ? setUser(u) : logout())
      .catch(() => logout())
  }, [token])

  const login = async (email, password) => {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!r.ok) throw new Error('Identifiants invalides')
    const data = await r.json()
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return { token, user, login, logout }
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('lea@campus.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onLogin(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🎓</span>
          <span style={styles.logoText}>CampusLocal</span>
        </div>
        <p style={styles.loginSub}>Ton réseau, ton campus.</p>

        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="toi@campus.local"
          />
          <label style={styles.label}>Mot de passe</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.hint}>
          Comptes de démo : <strong>lea@campus.local</strong> / password123
        </p>
      </div>
    </div>
  )
}

// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, token, onLike }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(post.likes_count || 0)

  const toggle = async () => {
    const endpoint = liked ? 'unlike' : 'like'
    await fetch(`${API}/posts/${post.id}/${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    setLiked(!liked)
    setCount(c => liked ? c - 1 : c + 1)
  }

  const initials = (post.author_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const date = new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.avatar}>{initials}</div>
        <div>
          <div style={styles.authorName}>{post.author_name || 'Étudiant'}</div>
          <div style={styles.cardDate}>{date}</div>
        </div>
      </div>
      <p style={styles.cardContent}>{post.content}</p>
      <div style={styles.cardActions}>
        <button
          onClick={toggle}
          style={{ ...styles.actionBtn, color: liked ? '#ff6b35' : '#a7a9be' }}
        >
          {liked ? '❤️' : '🤍'} {count}
        </button>
        <button style={{ ...styles.actionBtn, color: '#a7a9be' }}>
          💬 {post.comments_count || 0}
        </button>
      </div>
    </div>
  )
}

// ─── FEED ─────────────────────────────────────────────────────────────────────
function Feed({ token, user, logout }) {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const fetchPosts = async () => {
    try {
      const r = await fetch(`${API}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await r.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const submitPost = async e => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    try {
      const r = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content, post_type: 'text' })
      })
      if (r.ok) {
        setContent('')
        fetchPosts()
      }
    } finally {
      setPosting(false)
    }
  }

  const initials = `${user?.firstname?.[0] || ''}${user?.lastname?.[0] || ''}`.toUpperCase()

  return (
    <div style={styles.feedWrap}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <span style={styles.navLogo}>🎓 CampusLocal</span>
        <div style={styles.navRight}>
          <div style={styles.navAvatar}>{initials}</div>
          <span style={styles.navName}>{user?.firstname}</span>
          <button onClick={logout} style={styles.logoutBtn}>Déco</button>
        </div>
      </nav>

      <div style={styles.feedInner}>
        {/* Composer */}
        <form onSubmit={submitPost} style={styles.composer}>
          <textarea
            style={styles.textarea}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Quoi de neuf sur le campus ? 👋"
            rows={3}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={styles.btn} type="submit" disabled={posting || !content.trim()}>
              {posting ? 'Publication…' : 'Publier'}
            </button>
          </div>
        </form>

        {/* Posts */}
        {loading ? (
          <div style={styles.empty}>Chargement du feed…</div>
        ) : posts.length === 0 ? (
          <div style={styles.empty}>Aucun post pour l'instant. Sois le premier !</div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} token={token} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { token, user, login, logout } = useAuth()

  if (!token || !user) return <LoginPage onLogin={login} />
  return <Feed token={token} user={user} logout={logout} />
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  loginWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '1rem',
  },
  loginCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  logoIcon: { fontSize: '2rem' },
  logoText: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '1.75rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #ff6b35, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  loginSub: { color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.5rem' },
  input: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'var(--text)',
    fontSize: '1rem',
    outline: 'none',
  },
  error: { color: '#ff6b35', fontSize: '0.875rem', marginTop: '0.25rem' },
  btn: {
    marginTop: '1rem',
    background: 'linear-gradient(135deg, #ff6b35, #a855f7)',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    color: '#fff',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  hint: { color: 'var(--muted)', fontSize: '0.8rem', marginTop: '1.5rem', textAlign: 'center' },

  feedWrap: { minHeight: '100vh', background: 'var(--bg)' },
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: 'rgba(15,14,23,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
  },
  navLogo: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 800,
    fontSize: '1.25rem',
    background: 'linear-gradient(135deg, #ff6b35, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  navAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b35, #a855f7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  navName: { color: 'var(--text)', fontWeight: 500 },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--muted)',
    padding: '0.3rem 0.75rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  feedInner: { maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' },
  composer: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
  },
  textarea: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'var(--text)',
    fontSize: '1rem',
    fontFamily: 'DM Sans, sans-serif',
    resize: 'none',
    outline: 'none',
    marginBottom: '0.75rem',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1rem',
    transition: 'border-color 0.2s',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7, #ff6b35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  authorName: { fontWeight: 600, fontSize: '0.95rem' },
  cardDate: { color: 'var(--muted)', fontSize: '0.8rem' },
  cardContent: { color: 'var(--text)', lineHeight: 1.6, marginBottom: '1rem' },
  cardActions: { display: 'flex', gap: '1rem' },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.25rem 0',
    transition: 'color 0.2s',
  },
  empty: { color: 'var(--muted)', textAlign: 'center', padding: '3rem 0' },
}
