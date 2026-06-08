import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:8000/api'

// ── Helpers ─────────────────────────────────────────────────────────────────
const avatarColors = [
  ['#a8ff78','#78ffd6'], ['#f093fb','#f5576c'], ['#4facfe','#00f2fe'],
  ['#f7971e','#ffd200'], ['#a18cd1','#fbc2eb'], ['#84fab0','#8fd3f4'],
]
function getGradient(str) {
  let h = 0; for (let i = 0; i < (str||'').length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  const [a, b] = avatarColors[Math.abs(h) % avatarColors.length]
  return `linear-gradient(135deg, ${a}, ${b})`
}
function initials(first='', last='') { return `${first[0]||''}${last[0]||''}`.toUpperCase() }
function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'À l\'instant'
  if (s < 3600) return `${Math.floor(s/60)} min`
  if (s < 86400) return `${Math.floor(s/3600)}h`
  return `${Math.floor(s/86400)}j`
}

// ── Auth ────────────────────────────────────────────────────────────────────
function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('cl_token'))
  const [user, setUser]   = useState(() => { try { return JSON.parse(localStorage.getItem('cl_user')) } catch { return null } })

  const fetchMe = useCallback(async (t) => {
    try {
      const r = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      if (!r.ok) throw new Error()
      const u = await r.json()
      setUser(u); localStorage.setItem('cl_user', JSON.stringify(u))
    } catch { logout() }
  }, [])

  useEffect(() => { if (token && !user) fetchMe(token) }, [])

  const login = async (email, password) => {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!r.ok) { const e = await r.json().catch(()=>{}); throw new Error(typeof e?.detail === 'string' ? e.detail : 'Identifiants invalides') }
    const data = await r.json()
    localStorage.setItem('cl_token', data.access_token)
    localStorage.setItem('cl_user', JSON.stringify(data.user))
    setToken(data.access_token); setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('cl_token'); localStorage.removeItem('cl_user')
    setToken(null); setUser(null)
  }

  return { token, user, login, logout }
}

// ── Login ───────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onLogin(email, password) }
    catch (err) {
      if (err.message === 'Failed to fetch') setError('Impossible de contacter le serveur. Vérifiez que le backend est lancé sur le port 8000.')
      else setError(err.message)
    }
    finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🎓</div>
          <h1 style={{fontSize:'1.75rem',fontWeight:700,letterSpacing:'-0.5px'}}>
            Campus<span style={{color:'#c8f135'}}>.</span>
          </h1>
          <p style={{color:'#666',marginTop:'0.5rem',fontSize:'0.9rem'}}>Ton réseau, ton campus</p>
        </div>

        <form onSubmit={submit}>
          <div style={{marginBottom:'1rem'}}>
            <input
              style={iStyle} type="email" placeholder="Email" value={email}
              onChange={e=>setEmail(e.target.value)} required autoFocus
            />
          </div>
          <div style={{marginBottom:'1.25rem'}}>
            <input
              style={iStyle} type="password" placeholder="Mot de passe" value={password}
              onChange={e=>setPassword(e.target.value)} required
            />
          </div>
          {error && (
            <div style={{background:'#1a0a0a',border:'1px solid #5a1a1a',borderRadius:10,padding:'0.75rem 1rem',marginBottom:'1rem',color:'#ff6b6b',fontSize:'0.85rem',lineHeight:1.5}}>
              ⚠️ {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'0.875rem',background:loading?'#222':'#c8f135',border:'none',borderRadius:12,color:'#000',fontWeight:700,fontSize:'1rem',cursor:loading?'not-allowed':'pointer',transition:'all .2s'}}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div style={{marginTop:'1.5rem',padding:'1rem',background:'#111',borderRadius:10,border:'1px solid #222'}}>
          <p style={{color:'#666',fontSize:'0.8rem',marginBottom:'0.5rem'}}>Comptes de démo :</p>
          {[['lea@campus.local','password123'],['thomas@campus.local','password123'],['sara@campus.local','password123']].map(([e,p])=>(
            <button key={e} onClick={()=>{setEmail(e);setPassword(p)}}
              style={{display:'block',background:'transparent',border:'none',color:'#c8f135',fontSize:'0.82rem',cursor:'pointer',padding:'0.15rem 0'}}>
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
const iStyle = {width:'100%',padding:'0.875rem 1rem',background:'#111',border:'1px solid #222',borderRadius:12,color:'#fff',fontSize:'1rem',outline:'none',fontFamily:'Inter,sans-serif'}

// ── Stories ─────────────────────────────────────────────────────────────────
function Stories({ user }) {
  const stories = [
    { id:'me', name:'Ma story', first: user?.firstname||'M', last: user?.lastname||'e', isMe:true },
    { id:'1', name:'Léa', first:'Léa', last:'M' },
    { id:'2', name:'Thomas', first:'T', last:'K' },
    { id:'3', name:'Sara', first:'S', last:'B' },
    { id:'4', name:'Axel', first:'A', last:'R' },
    { id:'5', name:'Nina', first:'N', last:'D' },
  ]
  return (
    <div style={{display:'flex',gap:'1rem',padding:'1rem',overflowX:'auto',scrollbarWidth:'none'}}>
      {stories.map(s => (
        <div key={s.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.4rem',cursor:'pointer',flexShrink:0}}>
          <div style={{position:'relative'}}>
            <div style={{width:68,height:68,borderRadius:'50%',background:getGradient(s.first+s.last),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',fontWeight:700,color:'#000',border: s.isMe?'2px solid #333':'2px solid transparent',outline:s.isMe?'none':'2.5px solid #444',outlineOffset:2}}>
              {initials(s.first,s.last)}
            </div>
            {s.isMe && <div style={{position:'absolute',bottom:2,right:2,width:20,height:20,borderRadius:'50%',background:'#c8f135',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:900,color:'#000',border:'2px solid #000'}}>+</div>}
          </div>
          <span style={{fontSize:'0.72rem',color:s.isMe?'#fff':'#aaa',maxWidth:68,textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</span>
        </div>
      ))}
    </div>
  )
}

// ── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post, token }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(post.likes_count || 0)

  const toggleLike = async () => {
    const ep = liked ? 'unlike' : 'like'
    await fetch(`${API}/posts/${post.id}/${ep}`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
    setLiked(!liked); setCount(c => liked ? c-1 : c+1)
  }

  const first = post.author?.firstname || post.author_name?.split(' ')[0] || 'U'
  const last  = post.author?.lastname  || post.author_name?.split(' ')[1] || ''
  const name  = post.author ? `${post.author.firstname} ${post.author.lastname}` : (post.author_name || 'Étudiant')

  return (
    <div style={{borderBottom:'1px solid #111',padding:'1rem',paddingBottom:'0.75rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:getGradient(first+last),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',color:'#000',flexShrink:0}}>
            {initials(first,last)}
          </div>
          <div>
            <div style={{fontWeight:600,fontSize:'0.9rem'}}>{name}</div>
            <div style={{fontSize:'0.75rem',color:'#666'}}>{timeAgo(post.created_at)}</div>
          </div>
        </div>
        <button style={{background:'transparent',border:'none',color:'#555',cursor:'pointer',fontSize:'1.2rem',padding:'0.25rem'}}>⋯</button>
      </div>
      <p style={{fontSize:'0.95rem',lineHeight:1.6,color:'#e0e0e0',marginBottom:'0.75rem'}}>{post.content}</p>
      <div style={{display:'flex',gap:'1.5rem',paddingTop:'0.5rem'}}>
        <button onClick={toggleLike} style={{background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',color:liked?'#ff4d6d':'#666',fontSize:'0.85rem',fontWeight:500,padding:0}}>
          {liked ? '❤️' : '🤍'} {count}
        </button>
        <button style={{background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',color:'#666',fontSize:'0.85rem',padding:0}}>
          💬 {post.comments_count||0}
        </button>
        <button style={{background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',color:'#666',fontSize:'0.85rem',padding:0}}>
          ↗ Partager
        </button>
      </div>
    </div>
  )
}

// ── Composer ─────────────────────────────────────────────────────────────────
function Composer({ token, user, onPost }) {
  const [open, setOpen]       = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const first = user?.firstname||'M'; const last = user?.lastname||'e'

  const submit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const r = await fetch(`${API}/posts`, {
        method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body: JSON.stringify({ content, post_type:'text' })
      })
      if (r.ok) { setContent(''); setOpen(false); onPost() }
    } finally { setLoading(false) }
  }

  if (!open) return (
    <div onClick={()=>setOpen(true)} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'1rem',borderBottom:'1px solid #111',cursor:'pointer'}}>
      <div style={{width:40,height:40,borderRadius:'50%',background:getGradient(first+last),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',color:'#000',flexShrink:0}}>
        {initials(first,last)}
      </div>
      <div style={{flex:1,padding:'0.6rem 1rem',background:'#111',borderRadius:20,color:'#555',fontSize:'0.9rem'}}>
        Quoi de neuf sur le campus ?
      </div>
    </div>
  )

  return (
    <div style={{padding:'1rem',borderBottom:'1px solid #111',background:'#0a0a0a'}}>
      <textarea value={content} onChange={e=>setContent(e.target.value)} autoFocus
        placeholder="Quoi de neuf sur le campus ?" rows={4}
        style={{width:'100%',background:'transparent',border:'none',color:'#fff',fontSize:'0.95rem',fontFamily:'Inter,sans-serif',resize:'none',outline:'none',lineHeight:1.6}}
      />
      <div style={{display:'flex',justifyContent:'flex-end',gap:'0.75rem',marginTop:'0.5rem'}}>
        <button onClick={()=>setOpen(false)} style={{padding:'0.5rem 1rem',background:'transparent',border:'1px solid #333',borderRadius:20,color:'#aaa',cursor:'pointer',fontSize:'0.85rem'}}>Annuler</button>
        <button onClick={submit} disabled={loading||!content.trim()} style={{padding:'0.5rem 1.25rem',background:content.trim()?'#c8f135':'#222',border:'none',borderRadius:20,color:content.trim()?'#000':'#555',fontWeight:700,cursor:content.trim()?'pointer':'not-allowed',fontSize:'0.85rem',transition:'all .2s'}}>
          {loading?'…':'Publier'}
        </button>
      </div>
    </div>
  )
}

// ── Feed Tab ─────────────────────────────────────────────────────────────────
function FeedTab({ token, user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API}/posts`, { headers:{ Authorization:`Bearer ${token}` } })
      const d = await r.json(); setPosts(Array.isArray(d)?d:[])
    } catch { setPosts([]) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <Stories user={user} />
      <div style={{height:'1px',background:'#111'}} />
      <Composer token={token} user={user} onPost={load} />
      {loading ? (
        <div style={{padding:'3rem',textAlign:'center',color:'#444'}}>Chargement…</div>
      ) : posts.length === 0 ? (
        <div style={{padding:'3rem',textAlign:'center',color:'#444'}}>
          <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📭</div>
          <div>Aucun post pour l'instant</div>
          <div style={{fontSize:'0.85rem',marginTop:'0.25rem',color:'#333'}}>Sois le premier à publier !</div>
        </div>
      ) : posts.map(p => <PostCard key={p.id} post={p} token={token} />)}
    </div>
  )
}

// ── Empty placeholder ─────────────────────────────────────────────────────────
function EmptyTab({ icon, label, sublabel }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#333',gap:'0.75rem'}}>
      <div style={{fontSize:'3rem'}}>{icon}</div>
      <div style={{fontWeight:600,color:'#555'}}>{label}</div>
      {sublabel && <div style={{fontSize:'0.85rem',color:'#333',textAlign:'center',maxWidth:260}}>{sublabel}</div>}
    </div>
  )
}

// ── Nav ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id:'feed',       icon:'⊞',  label:'Feed' },
  { id:'messages',   icon:'💬', label:'Messages' },
  { id:'revisions',  icon:'📖', label:'Révisions' },
  { id:'events',     icon:'🗓', label:'Événements' },
  { id:'rencontres', icon:'🤍', label:'Rencontres' },
  { id:'profil',     icon:'👤', label:'Profil' },
]

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { token, user, login, logout } = useAuth()
  const [tab, setTab] = useState('feed')

  if (!token || !user) return <LoginPage onLogin={login} />

  const first = user.firstname||'M'; const last = user.lastname||'e'

  return (
    <div style={{maxWidth:680,margin:'0 auto',minHeight:'100vh',position:'relative',background:'#000'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1rem 0.75rem',position:'sticky',top:0,background:'rgba(0,0,0,0.95)',backdropFilter:'blur(12px)',zIndex:10,borderBottom:'1px solid #0d0d0d'}}>
        <h1 style={{fontSize:'1.4rem',fontWeight:800,letterSpacing:'-0.5px'}}>
          {tab === 'feed'       ? <><span style={{color:'#fff'}}>Campus</span><span style={{color:'#c8f135'}}>.</span></> :
           tab === 'messages'   ? 'Messages' :
           tab === 'revisions'  ? 'Révisions' :
           tab === 'events'     ? 'Événements' :
           tab === 'rencontres' ? 'Rencontres' : 'Mon profil'}
        </h1>
        <div style={{display:'flex',gap:'0.5rem'}}>
          {tab==='feed' && <>
            <HeaderBtn onClick={()=>{}} icon="＋" />
            <HeaderBtn onClick={()=>setTab('messages')} icon="💬" />
          </>}
          {tab==='profil' && <HeaderBtn onClick={logout} icon="⚙" />}
        </div>
      </div>

      {/* Content */}
      <div style={{paddingBottom:80}}>
        {tab==='feed'       && <FeedTab token={token} user={user} />}
        {tab==='messages'   && <EmptyTab icon="💬" label="Messagerie" sublabel="Tes conversations apparaîtront ici" />}
        {tab==='revisions'  && <EmptyTab icon="📖" label="Révisions" sublabel="Partage et trouve des cours ici" />}
        {tab==='events'     && <EmptyTab icon="🗓" label="Événements" sublabel="Découvre les événements sur ton campus" />}
        {tab==='rencontres' && <EmptyTab icon="🤍" label="Rencontres" sublabel="Connecte-toi avec tes camarades" />}
        {tab==='profil'     && <ProfileTab user={user} token={token} />}
      </div>

      {/* Bottom Nav */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:680,background:'rgba(0,0,0,0.97)',backdropFilter:'blur(12px)',borderTop:'1px solid #111',display:'flex',zIndex:20}}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>setTab(n.id)}
            style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'0.2rem',padding:'0.65rem 0.25rem',background:'transparent',border:'none',cursor:'pointer',color:tab===n.id?'#c8f135':'#555',transition:'color .2s'}}>
            <span style={{fontSize:'1.25rem',lineHeight:1}}>{n.icon}</span>
            <span style={{fontSize:'0.62rem',fontWeight:tab===n.id?600:400}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function HeaderBtn({ onClick, icon }) {
  return (
    <button onClick={onClick} style={{width:36,height:36,borderRadius:'50%',background:'#111',border:'1px solid #222',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>
      {icon}
    </button>
  )
}

function ProfileTab({ user, token }) {
  const first = user.firstname||''; const last = user.lastname||''
  return (
    <div>
      <div style={{padding:'1.25rem 1rem 0'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:'1.25rem',marginBottom:'1rem'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:getGradient(first+last),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.3rem',color:'#000',flexShrink:0,border:'2px solid #222'}}>
            {initials(first,last)}
          </div>
          <div style={{flex:1,display:'flex',justifyContent:'space-around',paddingTop:'0.5rem'}}>
            {[['0','Posts'],['0','Followers'],['0','Suivis']].map(([n,l])=>(
              <div key={l} style={{textAlign:'center'}}>
                <div style={{fontWeight:700,fontSize:'1.2rem'}}>{n}</div>
                <div style={{fontSize:'0.75rem',color:'#666'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:'0.5rem'}}>
          <div style={{fontWeight:700,fontSize:'1rem'}}>{first} {last}</div>
          {user.promo && <div style={{fontSize:'0.82rem',color:'#888',marginTop:'0.2rem'}}>{user.promo} · {user.campus||'Campus Homneo'}</div>}
          {user.bio   && <div style={{fontSize:'0.85rem',color:'#ccc',marginTop:'0.35rem'}}>{user.bio}</div>}
        </div>
        <div style={{display:'flex',gap:'0.75rem',marginTop:'1rem'}}>
          <button style={{flex:1,padding:'0.6rem',background:'#111',border:'1px solid #222',borderRadius:10,color:'#fff',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>Modifier le profil</button>
          <button style={{flex:1,padding:'0.6rem',background:'#111',border:'1px solid #222',borderRadius:10,color:'#fff',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>Profil rencontre</button>
        </div>
      </div>
      <div style={{display:'flex',borderTop:'1px solid #111',marginTop:'1rem'}}>
        {['⊞','🔖','🤍'].map((ic,i)=>(
          <button key={i} style={{flex:1,padding:'0.85rem',background:'transparent',border:'none',borderBottom:i===0?'2px solid #fff':'2px solid transparent',color:i===0?'#fff':'#555',cursor:'pointer',fontSize:'1.1rem'}}>
            {ic}
          </button>
        ))}
      </div>
      <div style={{padding:'3rem',textAlign:'center',color:'#333'}}>
        <div style={{fontSize:'2rem'}}>📷</div>
        <div style={{marginTop:'0.5rem',fontSize:'0.85rem'}}>Aucun post pour l'instant</div>
      </div>
    </div>
  )
}
