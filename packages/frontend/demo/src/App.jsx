import { useState, useCallback } from 'react'

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id:'1', firstname:'Léa',    lastname:'Martin',  promo:'BTS NDRC 1ère année', campus:'Groupe Homneo', bio:'Passionnée de marketing digital & tennis 🎾\nParis, Île-de-France', tags:['Révision','Réseautage','Vérifié'] },
  { id:'2', firstname:'Thomas', lastname:'Khelil',  promo:'Licence Pro Marketing', campus:'Groupe Homneo', bio:'Gaming & sorties 🎮' },
  { id:'3', firstname:'Sara',   lastname:'Benali',  promo:'BTS NDRC 1A', campus:'Groupe Homneo', bio:'Café & révisions ☕' },
  { id:'4', firstname:'Axel',   lastname:'Remy',    promo:'BTS COM 2A', campus:'Groupe Homneo', bio:'Sport & musique 🎵' },
  { id:'5', firstname:'Nina',   lastname:'Dupont',  promo:'LP Management', campus:'Groupe Homneo', bio:'Voyages & photo 📸' },
  { id:'cc', firstname:'Camille', lastname:'Chen',  promo:'BTS NDRC 1A', campus:'Groupe Homneo', bio:'Design & café ✨' },
]

const MOCK_POSTS = [
  { id:'p1', user_id:'1', author:MOCK_USERS[0], content:'Quelqu\'un a les annales de droit commercial 2023 ? Partiel le 8 juin et je suis à la ramasse 😭 #BTS #NDRC', likes_count:24, comments_count:8, created_at: new Date(Date.now()-7200000).toISOString(), location:'Bibliothèque Homneo' },
  { id:'p2', user_id:'2', author:MOCK_USERS[1], content:'Session BU ce soir 18h-22h si des gens veulent réviser marketing ensemble 📚 On réserve une salle de groupe ?', likes_count:17, comments_count:5, created_at: new Date(Date.now()-14400000).toISOString() },
  { id:'p3', user_id:'3', author:MOCK_USERS[2], content:'Je viens de finir mes fiches mémo pour l\'exam de mercredi. Qui veut que je les partage ? 150 pages de bonheur 🙏', likes_count:42, comments_count:12, created_at: new Date(Date.now()-18000000).toISOString() },
  { id:'p4', user_id:'4', author:MOCK_USERS[3], content:'Afterwork NDRC × Com\' confirmé pour lundi soir ! Bar Le Voltaire à 18h30 🍻 Venez nombreux, on a réservé pour 30 personnes.', likes_count:38, comments_count:15, created_at: new Date(Date.now()-86400000).toISOString() },
  { id:'p5', user_id:'5', author:MOCK_USERS[4], content:'Le prof de droit vient de reporter le partiel au 12 juin !! 🎉🎉 La vie est belle les amis', likes_count:89, comments_count:31, created_at: new Date(Date.now()-172800000).toISOString() },
  { id:'p6', user_id:'cc', author:MOCK_USERS[5], content:'Rappel : assemblée générale du BDE demain 12h30 amphi B. On vote le budget soirée de fin d\'année et les thèmes 🎊', likes_count:11, comments_count:4, created_at: new Date(Date.now()-259200000).toISOString() },
]

const MOCK_MESSAGES = [
  { id:'m1', user: MOCK_USERS[0], last:'T\'as vu pour le partiel de droit ? 😱', time:'À l\'instant', unread:3 },
  { id:'m2', user: MOCK_USERS[1], last:'On se retrouve à la BU à 14h ?', time:'12 min', unread:1 },
  { id:'m3', user:{ firstname:'Groupe', lastname:'NDRC 1A 🔥', id:'g1' }, last:'Thomas: N\'oubliez pas les annales !', time:'47 min', unread:0 },
  { id:'m4', user: MOCK_USERS[2], last:'Merci pour les fiches 🙏', time:'2h', unread:0 },
  { id:'m5', user: MOCK_USERS[3], last:'Tu joues à quoi ce soir ?', time:'Hier', unread:0 },
  { id:'m6', user: MOCK_USERS[4], last:'Super soirée 🎉', time:'Hier', unread:0 },
]

const MOCK_REVISIONS = [
  { id:'r1', title:'Droit commercial — Synthèse complète', author:MOCK_USERS[0], promo:'BTS NDRC 1A', ago:'il y a 2h', tags:['Droit','Partiel 8 juin'], format:'PDF · 12 pages', downloads:34, likes:12, color:'#1a3a2a' },
  { id:'r2', title:'Mercatique — Fiches mémo + QCM', author:MOCK_USERS[1], promo:'BTS NDRC 1A', ago:'il y a 5h', tags:['Marketing','Examen 12 juin'], format:'PDF · 8 pages', downloads:58, likes:27, color:'#2a1a3a' },
  { id:'r3', title:'Anglais commercial — Vocabulaire B2', author:MOCK_USERS[2], promo:'BTS NDRC 1A', ago:'hier', tags:['Anglais'], format:'Word · 6 pages', downloads:41, likes:0, color:'#1a2a3a' },
  { id:'r4', title:'Management — Cas pratiques corrigés', author:MOCK_USERS[3], promo:'BTS NDRC 1A', ago:'il y a 2j', tags:['Management','Examen 15 juin'], format:'PDF · 24 pages', downloads:72, likes:35, color:'#3a2a1a' },
]

const MOCK_EVENTS = [
  { id:'e1', title:'Gala de fin d\'année', date:'14 juin', location:'Salle Pleyel', attendees:87, featured:true, emoji:'🎭', gradient:'linear-gradient(135deg,#4a0030,#c2185b,#ff6090)', badge:'À la une' },
  { id:'e2', title:'Afterwork NDRC × Com\'', date:'Lun. 2 juin · 18h30', location:'Bar Le Voltaire', attendees:23, emoji:'☕', gradient:'linear-gradient(135deg,#1a3a1a,#2d7a2d,#8bc34a)', badge:'Mon établ.', rsvp:'Participe ✓', interested:'Intéressé(e)' },
  { id:'e3', title:'BDE Soirée Rooftop', date:'Ven. 6 juin · 21h', location:'Le Perchoir, Ménilmontant', attendees:64, emoji:'🌃', gradient:'linear-gradient(135deg,#001a40,#0d47a1,#42a5f5)', badge:null },
  { id:'e4', title:'Session révisions collectives', date:'Mar. 3 juin · 14h', location:'BU Campus Homneo', attendees:18, emoji:'📚', gradient:'linear-gradient(135deg,#1a1a2a,#4527a0,#7c4dff)', badge:null },
]

const DEMO_USER = MOCK_USERS[0]

// ── Helpers ──────────────────────────────────────────────────────────────────
const avatarColors = [
  ['#a8ff78','#78ffd6'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],
  ['#f7971e','#ffd200'],['#a18cd1','#fbc2eb'],['#84fab0','#8fd3f4'],
]
function getGradient(str='') {
  let h=0; for(let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h)
  const [a,b]=avatarColors[Math.abs(h)%avatarColors.length]
  return `linear-gradient(135deg,${a},${b})`
}
function initials(f='',l='') { return `${f[0]||''}${l[0]||''}`.toUpperCase() }
function timeAgo(d) {
  const s=Math.floor((Date.now()-new Date(d))/1000)
  if(s<60) return 'À l\'instant'; if(s<3600) return `${Math.floor(s/60)} min`
  if(s<86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}j`
}

// ── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false)

  const quickLogin = async (u) => {
    setLoading(true)
    await new Promise(r=>setTimeout(r,600))
    onLogin(u)
    setLoading(false)
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

        <div style={{background:'#111',border:'1px solid #222',borderRadius:14,padding:'1.25rem',marginBottom:'1.25rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
            <span style={{fontSize:'0.75rem',fontWeight:600,color:'#c8f135',background:'rgba(200,241,53,0.1)',padding:'0.2rem 0.6rem',borderRadius:20}}>MODE DÉMO</span>
            <span style={{fontSize:'0.8rem',color:'#555'}}>Connexion rapide</span>
          </div>
          {MOCK_USERS.slice(0,3).map(u=>(
            <button key={u.id} onClick={()=>quickLogin(u)} disabled={loading}
              style={{width:'100%',display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background:'#1a1a1a',border:'1px solid #222',borderRadius:10,cursor:'pointer',marginBottom:'0.5rem',transition:'all .15s'}}>
              <div style={{width:38,height:38,borderRadius:'50%',background:getGradient(u.firstname+u.lastname),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',color:'#000',flexShrink:0}}>
                {initials(u.firstname,u.lastname)}
              </div>
              <div style={{textAlign:'left'}}>
                <div style={{color:'#fff',fontWeight:600,fontSize:'0.9rem'}}>{u.firstname} {u.lastname}</div>
                <div style={{color:'#555',fontSize:'0.78rem'}}>{u.promo}</div>
              </div>
              <span style={{marginLeft:'auto',color:'#c8f135',fontSize:'0.8rem'}}>→</span>
            </button>
          ))}
        </div>

        {loading && <div style={{textAlign:'center',color:'#555',fontSize:'0.9rem'}}>Connexion…</div>}
      </div>
    </div>
  )
}

// ── Stories ──────────────────────────────────────────────────────────────────
function Stories({ user }) {
  const stories = [
    { id:'me', name:'Ma story', first:user.firstname, last:user.lastname, isMe:true },
    ...MOCK_USERS.filter(u=>u.id!==user.id).slice(0,5).map(u=>({ id:u.id, name:u.firstname, first:u.firstname, last:u.lastname }))
  ]
  return (
    <div style={{display:'flex',gap:'1rem',padding:'1rem',overflowX:'auto',scrollbarWidth:'none'}}>
      {stories.map(s=>(
        <div key={s.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.4rem',cursor:'pointer',flexShrink:0}}>
          <div style={{position:'relative'}}>
            <div style={{width:68,height:68,borderRadius:'50%',background:getGradient(s.first+s.last),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',fontWeight:700,color:'#000',border:s.isMe?'2px solid #333':'none',outline:s.isMe?'none':'2.5px solid #444',outlineOffset:2}}>
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
function PostCard({ post }) {
  const [liked,  setLiked]  = useState(false)
  const [count,  setCount]  = useState(post.likes_count)
  const [showCm, setShowCm] = useState(false)
  const { author, location } = post

  return (
    <div style={{borderBottom:'1px solid #111'}}>
      <div style={{padding:'1rem 1rem 0.75rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:getGradient(author.firstname+author.lastname),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',color:'#000',flexShrink:0}}>
              {initials(author.firstname,author.lastname)}
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:'0.9rem'}}>{author.firstname.toLowerCase()}.{author.lastname.toLowerCase()}</div>
              {location && <div style={{fontSize:'0.72rem',color:'#888',display:'flex',alignItems:'center',gap:'0.25rem'}}>📍 {location}</div>}
            </div>
          </div>
          <button style={{background:'transparent',border:'none',color:'#444',cursor:'pointer',fontSize:'1.3rem',lineHeight:1}}>⋯</button>
        </div>
        <p style={{fontSize:'0.92rem',lineHeight:1.65,color:'#ddd',marginBottom:'0.75rem'}}>{post.content}</p>
        <div style={{display:'flex',gap:'1.5rem',paddingTop:'0.25rem'}}>
          <button onClick={()=>{setLiked(!liked);setCount(c=>liked?c-1:c+1)}}
            style={{background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',color:liked?'#ff4d6d':'#555',fontSize:'0.85rem',fontWeight:500,padding:0}}>
            {liked?'❤️':'🤍'} {count}
          </button>
          <button onClick={()=>setShowCm(!showCm)} style={{background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',color:'#555',fontSize:'0.85rem',padding:0}}>
            💬 {post.comments_count}
          </button>
          <button style={{background:'transparent',border:'none',cursor:'pointer',color:'#555',fontSize:'0.85rem',padding:0}}>↗ Partager</button>
        </div>
      </div>
      {showCm && (
        <div style={{padding:'0 1rem 1rem',borderTop:'1px solid #0d0d0d'}}>
          <div style={{color:'#444',fontSize:'0.82rem',paddingTop:'0.75rem'}}>Sois le premier à commenter…</div>
        </div>
      )}
    </div>
  )
}

// ── Composer ─────────────────────────────────────────────────────────────────
function Composer({ user, onPost }) {
  const [open,setOpen]=useState(false); const [txt,setTxt]=useState('')
  if (!open) return (
    <div onClick={()=>setOpen(true)} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'1rem',borderBottom:'1px solid #111',cursor:'pointer'}}>
      <div style={{width:40,height:40,borderRadius:'50%',background:getGradient(user.firstname+user.lastname),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',color:'#000',flexShrink:0}}>
        {initials(user.firstname,user.lastname)}
      </div>
      <div style={{flex:1,padding:'0.6rem 1rem',background:'#111',borderRadius:20,color:'#555',fontSize:'0.9rem'}}>Quoi de neuf sur le campus ?</div>
    </div>
  )
  return (
    <div style={{padding:'1rem',borderBottom:'1px solid #111',background:'#0a0a0a'}}>
      <textarea value={txt} onChange={e=>setTxt(e.target.value)} autoFocus placeholder="Quoi de neuf ?" rows={4}
        style={{width:'100%',background:'transparent',border:'none',color:'#fff',fontSize:'0.95rem',fontFamily:'Inter,sans-serif',resize:'none',outline:'none',lineHeight:1.6}} />
      <div style={{display:'flex',justifyContent:'flex-end',gap:'0.75rem',marginTop:'0.5rem'}}>
        <button onClick={()=>setOpen(false)} style={{padding:'0.5rem 1rem',background:'transparent',border:'1px solid #333',borderRadius:20,color:'#aaa',cursor:'pointer',fontSize:'0.85rem'}}>Annuler</button>
        <button onClick={()=>{if(txt.trim()){onPost(txt);setTxt('');setOpen(false)}}} disabled={!txt.trim()}
          style={{padding:'0.5rem 1.25rem',background:txt.trim()?'#c8f135':'#222',border:'none',borderRadius:20,color:txt.trim()?'#000':'#555',fontWeight:700,cursor:txt.trim()?'pointer':'not-allowed',fontSize:'0.85rem',transition:'all .2s'}}>
          Publier
        </button>
      </div>
    </div>
  )
}

// ── Feed ─────────────────────────────────────────────────────────────────────
function FeedTab({ user }) {
  const [posts, setPosts] = useState(MOCK_POSTS)
  const addPost = useCallback((content) => {
    setPosts(prev => [{
      id: `p${Date.now()}`, user_id:user.id, author:user,
      content, likes_count:0, comments_count:0,
      created_at:new Date().toISOString(), location:null
    }, ...prev])
  }, [user])

  return (
    <div>
      <Stories user={user} />
      <div style={{height:'1px',background:'#111'}} />
      <Composer user={user} onPost={addPost} />
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  )
}

// ── Messages ─────────────────────────────────────────────────────────────────
function MessagesTab() {
  return (
    <div>
      <div style={{padding:'0.75rem 1rem'}}>
        <div style={{display:'flex',alignItems:'center',background:'#111',borderRadius:12,padding:'0.6rem 1rem',gap:'0.5rem'}}>
          <span style={{color:'#555',fontSize:'0.9rem'}}>🔍</span>
          <span style={{color:'#555',fontSize:'0.9rem'}}>Rechercher...</span>
        </div>
      </div>
      {MOCK_MESSAGES.map(m=>(
        <div key={m.id} style={{display:'flex',alignItems:'center',gap:'0.875rem',padding:'0.875rem 1rem',borderBottom:'1px solid #0d0d0d',cursor:'pointer',transition:'background .15s'}}>
          <div style={{position:'relative',flexShrink:0}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:getGradient(m.user.firstname+m.user.lastname),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1rem',color:'#000'}}>
              {initials(m.user.firstname,m.user.lastname)}
            </div>
            <div style={{position:'absolute',bottom:1,right:1,width:12,height:12,borderRadius:'50%',background:m.unread?'#c8f135':'#333',border:'2px solid #000'}} />
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:'0.9rem',marginBottom:'0.2rem'}}>{m.user.firstname} {m.user.lastname}</div>
            <div style={{fontSize:'0.82rem',color:'#555',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.last}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.4rem',flexShrink:0}}>
            <span style={{fontSize:'0.75rem',color:'#444'}}>{m.time}</span>
            {m.unread>0 && <span style={{width:20,height:20,borderRadius:'50%',background:'#c8f135',color:'#000',fontSize:'0.72rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{m.unread}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Révisions ─────────────────────────────────────────────────────────────────
function RevisionsTab() {
  const [filter,setFilter]=useState('Tous')
  const filters=['Tous','Ma section','Mon établ.','Paris','France']
  return (
    <div>
      <div style={{padding:'0.75rem 1rem',background:'#111',margin:'0.75rem 1rem',borderRadius:12,display:'flex',alignItems:'center',gap:'0.75rem',cursor:'pointer'}}>
        <span style={{fontSize:'0.9rem'}}>📍</span>
        <div>
          <div style={{fontSize:'0.85rem',fontWeight:600}}>BTS NDRC 1A · Groupe Homneo</div>
          <div style={{fontSize:'0.75rem',color:'#888'}}>📍 Paris · Île-de-France · France</div>
        </div>
        <span style={{marginLeft:'auto',color:'#555'}}>›</span>
      </div>
      <div style={{display:'flex',gap:'0.5rem',padding:'0 1rem 0.75rem',overflowX:'auto',scrollbarWidth:'none'}}>
        {filters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{padding:'0.4rem 1rem',borderRadius:20,border:'none',background:filter===f?'#c8f135':'#111',color:filter===f?'#000':'#aaa',fontWeight:filter===f?700:400,fontSize:'0.82rem',cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
            {f}
          </button>
        ))}
      </div>
      <div style={{padding:'0 1rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <span>📁</span>
            <span style={{fontWeight:700,fontSize:'0.85rem',letterSpacing:'0.05em',color:'#c8f135'}}>COURS PARTAGÉS</span>
          </div>
          <button style={{background:'transparent',border:'none',color:'#c8f135',fontSize:'0.82rem',cursor:'pointer',fontWeight:600}}>+ Partager</button>
        </div>
        {MOCK_REVISIONS.map(r=>(
          <div key={r.id} style={{background:'#0d0d0d',border:'1px solid #1a1a1a',borderLeft:`3px solid ${r.color==='#1a3a2a'?'#4caf50':r.color==='#2a1a3a'?'#9c27b0':r.color==='#1a2a3a'?'#2196f3':'#ff9800'}`,borderRadius:12,padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem'}}>
              <div style={{width:42,height:42,borderRadius:10,background:r.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0}}>
                {r.color==='#1a3a2a'?'⚖️':r.color==='#2a1a3a'?'📊':r.color==='#1a2a3a'?'🌍':'📋'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:'0.9rem',marginBottom:'0.25rem'}}>{r.title}</div>
                <div style={{fontSize:'0.78rem',color:'#666',marginBottom:'0.5rem'}}>{r.author.firstname} {r.author.lastname} · {r.promo} · {r.ago}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginBottom:'0.5rem'}}>
                  {r.tags.map(t=>(
                    <span key={t} style={{fontSize:'0.72rem',padding:'0.2rem 0.6rem',borderRadius:20,background:t.includes('juin')||t.includes('Exam')||t.includes('Partiel')?'rgba(200,241,53,0.15)':'rgba(255,255,255,0.08)',color:t.includes('juin')||t.includes('Exam')||t.includes('Partiel')?'#c8f135':'#aaa',border:t.includes('juin')||t.includes('Exam')||t.includes('Partiel')?'1px solid rgba(200,241,53,0.3)':'none'}}>
                      {t}
                    </span>
                  ))}
                  <span style={{fontSize:'0.72rem',color:'#555',padding:'0.2rem 0.6rem',background:'#1a1a1a',borderRadius:20}}>{r.format}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',gap:'1rem'}}>
                    <span style={{fontSize:'0.8rem',color:'#555'}}>⬇ {r.downloads} téléch.</span>
                    {r.likes>0 && <span style={{fontSize:'0.8rem',color:'#555'}}>🤍 {r.likes}</span>}
                  </div>
                  <button style={{padding:'0.35rem 1rem',background:'#c8f135',border:'none',borderRadius:20,color:'#000',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>Télécharger</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Événements ────────────────────────────────────────────────────────────────
function EventsTab() {
  const [filter,setFilter]=useState('Global')
  const [rsvp,setRsvp]=useState({'e2':'Participe ✓'})
  const filters=[{l:'🌐 Global',v:'Global'},{l:'🏛 Mon établ.',v:'Mon établ.'},{l:'📍 Paris',v:'Paris'},{l:'🎉 Soirées',v:'Soirées'},{l:'🚶 Sorties',v:'Sorties'},{l:'⚽ Sport',v:'Sport'}]

  return (
    <div>
      <div style={{display:'flex',gap:'0.5rem',padding:'0.75rem 1rem',overflowX:'auto',scrollbarWidth:'none'}}>
        {filters.map(f=>(
          <button key={f.v} onClick={()=>setFilter(f.v)}
            style={{padding:'0.4rem 1rem',borderRadius:20,border:'none',background:filter===f.v?'#c8f135':'#111',color:filter===f.v?'#000':'#aaa',fontWeight:filter===f.v?700:400,fontSize:'0.82rem',cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
            {f.l}
          </button>
        ))}
      </div>
      <div style={{padding:'0 1rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {MOCK_EVENTS.map(ev=>(
          <div key={ev.id} style={{borderRadius:16,overflow:'hidden',border:'1px solid #1a1a1a'}}>
            <div style={{height:ev.featured?160:110,background:ev.gradient,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              <span style={{fontSize:ev.featured?'3rem':'2.5rem'}}>{ev.emoji}</span>
              {ev.badge && <span style={{position:'absolute',top:10,left:10,padding:'0.25rem 0.6rem',borderRadius:20,background:ev.badge==='À la une'?'rgba(200,241,53,0.9)':'rgba(255,255,255,0.15)',color:ev.badge==='À la une'?'#000':'#fff',fontSize:'0.72rem',fontWeight:700}}>⭐ {ev.badge}</span>}
            </div>
            <div style={{padding:'0.875rem',background:'#0d0d0d'}}>
              <div style={{fontWeight:700,fontSize:'0.95rem',marginBottom:'0.3rem'}}>{ev.title}</div>
              <div style={{fontSize:'0.8rem',color:'#666',display:'flex',gap:'0.75rem',marginBottom:'0.75rem'}}>
                <span>📅 {ev.date}</span>
                <span>📍 {ev.location}</span>
                <span>👥 {ev.attendees} inscrits</span>
              </div>
              {ev.rsvp && (
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button style={{flex:1,padding:'0.6rem',background:'#c8f135',border:'none',borderRadius:10,color:'#000',fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>{ev.rsvp}</button>
                  <button style={{flex:1,padding:'0.6rem',background:'#1a1a1a',border:'1px solid #333',borderRadius:10,color:'#aaa',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>{ev.interested}</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{height:'1rem'}} />
    </div>
  )
}

// ── Rencontres ────────────────────────────────────────────────────────────────
function RencontresTab() {
  const [idx,setIdx]=useState(0)
  const cards=MOCK_USERS.filter(u=>u.id!=='1')
  if (idx>=cards.length) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#333',gap:'1rem'}}>
      <div style={{fontSize:'3rem'}}>🎉</div>
      <div style={{fontWeight:600,color:'#555'}}>Tu as tout vu !</div>
      <button onClick={()=>setIdx(0)} style={{padding:'0.6rem 1.5rem',background:'#c8f135',border:'none',borderRadius:20,color:'#000',fontWeight:700,cursor:'pointer',fontSize:'0.9rem'}}>Recommencer</button>
    </div>
  )
  const u=cards[idx]
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'1.5rem 1rem',gap:'1.25rem'}}>
      <div style={{width:'100%',maxWidth:360,background:'#0d0d0d',border:'1px solid #1a1a1a',borderRadius:20,overflow:'hidden'}}>
        <div style={{height:220,background:getGradient(u.firstname+u.lastname),display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:'5rem',fontWeight:900,color:'rgba(0,0,0,0.4)'}}>{initials(u.firstname,u.lastname)}</span>
        </div>
        <div style={{padding:'1.25rem'}}>
          <div style={{fontWeight:700,fontSize:'1.15rem'}}>{u.firstname} {u.lastname}</div>
          <div style={{fontSize:'0.82rem',color:'#888',marginTop:'0.25rem'}}>{u.promo} · {u.campus}</div>
          {u.bio && <div style={{fontSize:'0.88rem',color:'#bbb',marginTop:'0.75rem',lineHeight:1.5}}>{u.bio}</div>}
        </div>
      </div>
      <div style={{display:'flex',gap:'1.5rem'}}>
        <button onClick={()=>setIdx(i=>i+1)} style={{width:56,height:56,borderRadius:'50%',background:'#1a1a1a',border:'1px solid #333',fontSize:'1.5rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        <button onClick={()=>setIdx(i=>i+1)} style={{width:56,height:56,borderRadius:'50%',background:'rgba(200,241,53,0.15)',border:'1px solid rgba(200,241,53,0.4)',fontSize:'1.5rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>💚</button>
      </div>
      <div style={{fontSize:'0.78rem',color:'#333'}}>{idx+1} / {cards.length}</div>
    </div>
  )
}

// ── Profil ────────────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  const [activeTab,setActiveTab]=useState(0)
  const userPosts=MOCK_POSTS.filter(p=>p.user_id===user.id)
  return (
    <div>
      <div style={{padding:'1.25rem 1rem 0'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:'1rem',marginBottom:'1rem'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:getGradient(user.firstname+user.lastname),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.3rem',color:'#000',flexShrink:0,border:'2px solid #333'}}>
            {initials(user.firstname,user.lastname)}
          </div>
          <div style={{flex:1,display:'flex',justifyContent:'space-around',paddingTop:'0.5rem'}}>
            {[[userPosts.length,'Posts'],['284','Followers'],['147','Suivis']].map(([n,l])=>(
              <div key={l} style={{textAlign:'center'}}>
                <div style={{fontWeight:700,fontSize:'1.2rem'}}>{n}</div>
                <div style={{fontSize:'0.75rem',color:'#666'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:'0.75rem'}}>
          <div style={{fontWeight:700,fontSize:'1rem'}}>{user.firstname} {user.lastname}</div>
          <div style={{fontSize:'0.82rem',color:'#888',marginTop:'0.2rem'}}>{user.promo} · {user.campus}</div>
          {user.bio && <div style={{fontSize:'0.85rem',color:'#ccc',marginTop:'0.4rem',lineHeight:1.5,whiteSpace:'pre-line'}}>{user.bio}</div>}
          {user.tags && (
            <div style={{display:'flex',gap:'0.5rem',marginTop:'0.75rem',flexWrap:'wrap'}}>
              {user.tags.map(t=>(
                <span key={t} style={{fontSize:'0.75rem',padding:'0.25rem 0.75rem',borderRadius:20,background:t==='Révision'?'rgba(76,175,80,0.2)':t==='Réseautage'?'rgba(255,193,7,0.2)':'rgba(33,150,243,0.2)',color:t==='Révision'?'#81c784':t==='Réseautage'?'#ffd54f':'#64b5f6',border:`1px solid ${t==='Révision'?'rgba(76,175,80,0.4)':t==='Réseautage'?'rgba(255,193,7,0.4)':'rgba(33,150,243,0.4)'}`}}>
                  {t==='Révision'?'🟢':t==='Réseautage'?'🟡':'✅'} {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
          <button style={{flex:1,padding:'0.6rem',background:'#111',border:'1px solid #222',borderRadius:10,color:'#fff',fontWeight:600,fontSize:'0.83rem',cursor:'pointer'}}>Modifier le profil</button>
          <button style={{flex:1,padding:'0.6rem',background:'#111',border:'1px solid #222',borderRadius:10,color:'#fff',fontWeight:600,fontSize:'0.83rem',cursor:'pointer'}}>Profil rencontre</button>
          <button style={{width:38,padding:'0.6rem',background:'#111',border:'1px solid #222',borderRadius:10,color:'#aaa',cursor:'pointer',fontSize:'0.9rem'}}>↗</button>
        </div>
      </div>
      <div style={{display:'flex',borderTop:'1px solid #111'}}>
        {['⊞','🔖','🤍'].map((ic,i)=>(
          <button key={i} onClick={()=>setActiveTab(i)}
            style={{flex:1,padding:'0.85rem',background:'transparent',border:'none',borderBottom:activeTab===i?'2px solid #fff':'2px solid transparent',color:activeTab===i?'#fff':'#444',cursor:'pointer',fontSize:'1.1rem'}}>
            {ic}
          </button>
        ))}
      </div>
      {activeTab===0 && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:2,padding:2}}>
          {MOCK_EVENTS.map((ev,i)=>(
            <div key={i} style={{aspectRatio:'1',background:ev.gradient,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',cursor:'pointer'}}>
              {ev.emoji}
            </div>
          ))}
        </div>
      )}
      {activeTab!==0 && (
        <div style={{padding:'3rem',textAlign:'center',color:'#333'}}>
          <div style={{fontSize:'1.5rem'}}>🔖</div>
          <div style={{marginTop:'0.5rem',fontSize:'0.85rem'}}>Aucun contenu sauvegardé</div>
        </div>
      )}
    </div>
  )
}

// ── Nav ──────────────────────────────────────────────────────────────────────
const NAV=[
  {id:'feed',       label:'Feed',        icon:({active})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active?'#c8f135':'none'} stroke={active?'none':'#555'} strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  {id:'messages',   label:'Messages',    icon:({active,badge})=>(
    <div style={{position:'relative'}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?'#c8f135':'#555'} strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      {badge && <div style={{position:'absolute',top:-4,right:-4,width:8,height:8,borderRadius:'50%',background:'#f43f5e',border:'2px solid #000'}} />}
    </div>
  )},
  {id:'revisions',  label:'Révisions',   icon:({active})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?'#c8f135':'#555'} strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  )},
  {id:'events',     label:'Événements',  icon:({active})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?'#c8f135':'#555'} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  {id:'rencontres', label:'Rencontres',  icon:({active})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active?'#c8f135':'none'} stroke={active?'none':'#555'} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  )},
  {id:'profil',     label:'Profil',      icon:({active})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?'#c8f135':'#555'} strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
]

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [tab,  setTab]  = useState('feed')

  if (!user) return <LoginPage onLogin={setUser} />

  const TITLES = { feed:<><span>Campus</span><span style={{color:'#c8f135'}}>.</span></>, messages:'Messages', revisions:'Révisions', events:'Événements', rencontres:'Rencontres', profil:'Mon profil' }

  return (
    <div style={{maxWidth:680,margin:'0 auto',minHeight:'100vh',background:'#000',position:'relative'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1rem 0.75rem',position:'sticky',top:0,background:'rgba(0,0,0,0.95)',backdropFilter:'blur(12px)',zIndex:10,borderBottom:'1px solid #0d0d0d'}}>
        <h1 style={{fontSize:'1.4rem',fontWeight:800,letterSpacing:'-0.5px'}}>{TITLES[tab]}</h1>
        <div style={{display:'flex',gap:'0.5rem'}}>
          {tab==='feed' && <>
            <HBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>} />
            <HBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} onClick={()=>setTab('messages')} />
          </>}
          {(tab==='messages'||tab==='revisions'||tab==='events') && <HBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>} />}
          {tab==='profil' && <HBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} onClick={()=>setUser(null)} />}
        </div>
      </div>

      {/* Content */}
      <div style={{paddingBottom:80}}>
        {tab==='feed'       && <FeedTab user={user} />}
        {tab==='messages'   && <MessagesTab />}
        {tab==='revisions'  && <RevisionsTab />}
        {tab==='events'     && <EventsTab />}
        {tab==='rencontres' && <RencontresTab />}
        {tab==='profil'     && <ProfileTab user={user} />}
      </div>

      {/* Bottom Nav */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:680,background:'rgba(0,0,0,0.97)',backdropFilter:'blur(16px)',borderTop:'1px solid #111',display:'flex',zIndex:20}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)}
            style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem',padding:'0.7rem 0.25rem',background:'transparent',border:'none',cursor:'pointer',transition:'opacity .15s'}}>
            <n.icon active={tab===n.id} badge={n.id==='messages'} />
            <span style={{fontSize:'0.6rem',color:tab===n.id?'#c8f135':'#444',fontWeight:tab===n.id?600:400}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
function HBtn({icon,onClick}) {
  return <button onClick={onClick} style={{width:36,height:36,borderRadius:'50%',background:'#111',border:'1px solid #1a1a1a',color:'#aaa',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{icon}</button>
}
