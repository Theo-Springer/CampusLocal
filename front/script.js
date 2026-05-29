// ── NAV ──
function goTo(tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('screen-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'rencontres') initSwipeCards();
}

// ── TOAST ──
let toastT;
function showToast(msg) {
  clearTimeout(toastT);
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  el.classList.add('visible');
  toastT = setTimeout(() => el.classList.remove('visible'), 2600);
}

// ── SHEETS ──
function openSheet(id) {
  document.getElementById(id).classList.add('open');
}
function closeSheet(id) {
  document.getElementById(id).classList.remove('open');
}
function closeSheetOutside(e, el) {
  if (e.target === el) el.classList.remove('open');
}

// ── POST TYPES ──
function selectPostType(btn) {
  const grid = btn.parentElement;
  grid.querySelectorAll('.post-type-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}

// ── LIKE ──
function likePost(post) {
  const btn = post.querySelector ? post.querySelector('.post-action-btn') : null;
  if (!btn) return;
  const wasLiked = btn.classList.contains('liked');
  btn.classList.toggle('liked');
  const countEl = btn.querySelector('span');
  if (countEl) {
    let n = parseInt(countEl.textContent.replace(/\s/g,'')) || 0;
    countEl.textContent = wasLiked ? n - 1 : n + 1;
  }
  if (!wasLiked) showToast('Post liké ❤️');
}

// ── RSVP ──
function rsvp(btn, name) {
  const wasYes = btn.classList.contains('ev-yes');
  btn.classList.toggle('ev-yes');
  if (!wasYes) showToast('Tu participes à : ' + name + ' ✅');
}
function rsvpMaybe(btn, evId) {
  btn.classList.toggle('maybe');
  showToast('Marqué comme intéressé 🌟');
}

// ── FILTER CHIPS ──
function toggleFilter(btn) {
  btn.closest('.filter-row').querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}

// ── STORIES ──
const stories = [
  { name:'Léa Martin', av:'LM', grad:'linear-gradient(135deg,#c8f564,#3dd6c8)', bg:'linear-gradient(135deg,#1a2a3a,#3dd6c8)', emoji:'📚', text:'Révisions droit commercial ⚡', sub:'Partiel dans 3 jours, courage à tous 💪' },
  { name:'Thomas Khelil', av:'TK', grad:'linear-gradient(135deg,#ff6b9d,#9b5de5)', bg:'linear-gradient(135deg,#2a0a1a,#ff6b9d)', emoji:'🎉', text:'Soirée intégration 🔥', sub:'Best night ever !' },
  { name:'Sara Benali', av:'SB', grad:'linear-gradient(135deg,#4d9de0,#3dd6c8)', bg:'linear-gradient(135deg,#0a1a2a,#4d9de0)', emoji:'☀️', text:'Campus life ✨', sub:'Profite de chaque moment' },
  { name:'Axel Remy', av:'AR', grad:'linear-gradient(135deg,#ffb347,#ff6b9d)', bg:'linear-gradient(135deg,#3a1a0a,#ffb347)', emoji:'🏃', text:'Run matinal 🏃', sub:'Trocadéro 6h30 tous les matins !' },
];
let storyTimer, storyIdx = 0, curStory = 0;

function openStory(idx) {
  curStory = idx;
  const sv = document.getElementById('story-viewer');
  sv.classList.add('open');
  renderStory(idx);
  startStoryProgress();
}

function renderStory(idx) {
  const s = stories[idx];
  if (!s) return;
  document.getElementById('sv-av').textContent = s.av;
  document.getElementById('sv-av').style.background = s.grad;
  document.getElementById('sv-name').textContent = s.name;
  document.getElementById('sv-time').textContent = 'il y a ' + (idx * 2 + 1) + 'h';
  const c = document.getElementById('sv-content');
  c.style.background = s.bg;
  c.children[0].textContent = s.emoji;
  c.querySelector('.story-text-overlay').children[0].textContent = s.text;
  c.querySelector('.story-text-overlay').children[1].textContent = s.sub;
  const bars = document.getElementById('story-bars');
  bars.innerHTML = stories.map((_, i) => `<div class="story-progress-bar"><div class="story-progress-fill${i < idx ? ' done' : ''}${i === idx ? ' active' : ''}" id="spf-${i}"></div></div>`).join('');
}

function startStoryProgress() {
  clearInterval(storyTimer);
  const fill = document.getElementById('spf-' + curStory);
  if (!fill) return;
  fill.style.transition = 'width 4s linear';
  fill.style.width = '100%';
  storyTimer = setTimeout(() => {
    if (curStory < stories.length - 1) { curStory++; renderStory(curStory); startStoryProgress(); }
    else closeStory();
  }, 4100);
}

function closeStory() {
  clearInterval(storyTimer);
  document.getElementById('story-viewer').classList.remove('open');
}

// ── MESSAGES ──
let currentChatId = null;

function renderChatThread(profileId) {
  const thread = window.CampusConversationStore ? window.CampusConversationStore.getThread(profileId) : [];
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  msgs.innerHTML = thread.map(message => `<div class="msg ${message.from === 'me' ? 'me' : 'them'}"><div class="msg-bubble">${message.text}</div><div class="msg-time">${message.time}</div></div>`).join('');
  msgs.scrollTop = msgs.scrollHeight;
}

function openChat(profileId) {
  const profile = getProfileData(profileId);
  currentChatId = profile.id;
  document.getElementById('chat-name').textContent = profile.name;
  document.getElementById('chat-av').textContent = profile.initials;
  document.getElementById('chat-av').style.background = profile.grad;
  document.getElementById('chat-screen').classList.add('open');
  renderChatThread(profile.id);
}
function closeChat() {
  currentChatId = null;
  document.getElementById('chat-screen').classList.remove('open');
}
function sendMsg() {
  const inp = document.getElementById('chat-inp');
  const txt = inp.value.trim();
  if (!txt) return;
  const now = new Date();
  const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0');
  const profile = getProfileData(currentChatId);
  if (!window.CampusConversationStore || !profile) return;
  window.CampusConversationStore.appendMessage(profile.id, { from: 'me', text: txt, time });
  inp.value = '';
  renderChatThread(profile.id);
  setTimeout(() => {
    const replies = profile.replyPool || [window.CampusConversationStore.getSeedReply(profile.id)];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    window.CampusConversationStore.appendMessage(profile.id, { from: 'them', text: reply, time });
    renderChatThread(profile.id);
  }, 1200);
}

// ── INTENT ──
function selectIntent(chip, label) {
  document.querySelectorAll('.intent-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  showToast('Intention : ' + label + ' 🎯');
  initSwipeCards();
}

// ── SWIPE ──
const swipeProfiles = [
  { name:'Léa M.', age:20, promo:'BTS Com 2A · Homneo', emoji:'👩', bg:'linear-gradient(160deg,#1a0a2a,#9b5de5)', tags:['📚 Révision','🎾 Tennis','📸 Photo'] },
  { name:'Thomas K.', age:21, promo:'Licence Pro Marketing · Homneo', emoji:'🧑', bg:'linear-gradient(160deg,#0a1a2a,#4d9de0)', tags:['🎮 Gaming','🏃 Sport','🍺 Verre'] },
  { name:'Sara B.', age:19, promo:'BTS NDRC 1A · Homneo', emoji:'👩', bg:'linear-gradient(160deg,#0a2a1a,#3dd6c8)', tags:['☕ Café','📚 Révision','🌆 Sortie'] },
  { name:'Axel R.', age:22, promo:'BTS MHR 2A · Homneo', emoji:'🧑', bg:'linear-gradient(160deg,#2a1a0a,#ffb347)', tags:['🏃 Sport','🎮 Gaming','🍺 Verre'] },
  { name:'Nina D.', age:20, promo:'Licence 1 Droit', emoji:'👩', bg:'linear-gradient(160deg,#1a0a1a,#ff6b9d)', tags:['📚 Révision','☕ Café','🎵 Musique'] },
];
let swipeStack = [];

function initSwipeCards() {
  const area = document.getElementById('swipe-area');
  area.innerHTML = '';
  swipeStack = [...swipeProfiles];
  renderSwipeStack();
}

function renderSwipeStack() {
  const area = document.getElementById('swipe-area');
  area.innerHTML = '';
  const visible = swipeStack.slice(0, 3);
  visible.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'swipe-card' + (i === 0 ? ' top' : '');
    card.innerHTML = `
      <div class="swipe-card-img" style="background:${p.bg};">
        <div style="font-size:100px;">${p.emoji}</div>
        <div class="swipe-card-overlay"></div>
        <div class="swipe-like-label">LIKE</div>
        <div class="swipe-nope-label">NOPE</div>
        <div class="swipe-card-content">
          <div class="swipe-name">${p.name}, ${p.age}</div>
          <div class="swipe-info">${p.promo}</div>
          <div class="swipe-tags">${p.tags.map(t=>`<span class="swipe-tag">${t}</span>`).join('')}</div>
        </div>
      </div>`;
    if (i === 0) addSwipeListeners(card);
    area.appendChild(card);
  });
  if (swipeStack.length === 0) {
    area.innerHTML = '<div style="text-align:center;padding:40px 20px;"><div style="font-size:48px;margin-bottom:14px;">👀</div><div style="font-family:Clash Display,sans-serif;font-size:18px;font-weight:700;color:var(--text);">Plus de profils</div><div style="font-size:13px;color:var(--text2);margin-top:6px;">Reviens plus tard ou change d\'intention</div></div>';
  }
}

function addSwipeListeners(card) {
  let startX = 0, startY = 0, isDragging = false, curX = 0;
  const onStart = e => {
    isDragging = true;
    const pt = e.touches ? e.touches[0] : e;
    startX = pt.clientX; startY = pt.clientY;
    card.style.transition = 'none';
  };
  const onMove = e => {
    if (!isDragging) return;
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    curX = pt.clientX - startX;
    const rot = curX * 0.08;
    card.style.transform = `translateX(${curX}px) rotate(${rot}deg)`;
    const like = card.querySelector('.swipe-like-label');
    const nope = card.querySelector('.swipe-nope-label');
    if (curX > 20) { like.style.opacity = Math.min(curX / 80, 1); nope.style.opacity = 0; }
    else if (curX < -20) { nope.style.opacity = Math.min(-curX / 80, 1); like.style.opacity = 0; }
    else { like.style.opacity = 0; nope.style.opacity = 0; }
  };
  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    if (curX > 80) animateSwipe(card, 'right');
    else if (curX < -80) animateSwipe(card, 'left');
    else { card.style.transition = 'transform 0.4s cubic-bezier(0.36,0.07,0.19,0.97)'; card.style.transform = ''; }
    curX = 0;
  };
  card.addEventListener('mousedown', onStart);
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseup', onEnd);
  card.addEventListener('mouseleave', onEnd);
  card.addEventListener('touchstart', onStart, { passive: true });
  card.addEventListener('touchmove', onMove, { passive: false });
  card.addEventListener('touchend', onEnd);
}

function animateSwipe(card, dir) {
  const x = dir === 'right' ? 500 : dir === 'super' ? 0 : -500;
  const y = dir === 'super' ? -700 : 0;
  card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
  card.style.transform = `translateX(${x}px) translateY(${y}px) rotate(${dir==='right'?30:dir==='left'?-30:0}deg)`;
  card.style.opacity = '0';
  const top = swipeStack[0];
  swipeStack.shift();
  setTimeout(() => renderSwipeStack(), 350);
  if (dir === 'right' && Math.random() > 0.4) {
    setTimeout(() => {
      document.getElementById('match-sub').textContent = `Vous et ${top.name} avez matché ! Envoyez un message.`;
      document.getElementById('match-popup').classList.add('show');
    }, 500);
  } else if (dir === 'right') {
    showToast('Liked ' + (top ? top.name : '') + ' ❤️');
  } else if (dir === 'left') {
    showToast('Passé ➡️');
  } else {
    showToast('Super Like ⭐ envoyé !');
  }
}

function swipeCard(dir) {
  const top = document.querySelector('.swipe-card.top');
  if (!top) return;
  animateSwipe(top, dir);
}

function closeMatch() {
  document.getElementById('match-popup').classList.remove('show');
  if (swipeStack.length === 0) initSwipeCards();
}

// ── CLOCK ──
function updateClock() {
  const n = new Date();
  document.getElementById('clock').textContent = n.getHours() + ':' + String(n.getMinutes()).padStart(2,'0');
}
updateClock();
setInterval(updateClock, 10000);

// Init
initSwipeCards();

// ── ENHANCEMENTS ──
const campusStorageKey = 'campus-user-photo';
const campusMoodKey = 'campus-selected-mood';
const followStorageKey = 'campus-followed-profiles';
const profilePhotoTargets = ['main-profile-avatar', 'edit-profile-preview', 'rencontre-profile-preview'];
var selectedMood = localStorage.getItem(campusMoodKey) || '📚 Révision';
let currentProfileId = null;
let followedProfiles = new Set(JSON.parse(localStorage.getItem(followStorageKey) || '[]'));

const profileDirectory = {
  lea: {
    id: 'lea',
    name: 'Léa Martin',
    initials: 'LM',
    grad: 'linear-gradient(135deg,#c8f564,#3dd6c8)',
    cover: 'linear-gradient(135deg,#1a2a3a,#3dd6c8)',
    promo: 'BTS NDRC 1A · Groupe Homneo',
    location: 'Bibliothèque Homneo · Paris',
    bio: 'Toujours partante pour une session de révision, un café après les cours ou un échange de fiches. Je cherche des profils simples, bosseurs et sympa.',
    replyPool: ['Trop bien, envoie-moi ça 📎', 'Oui carrément, on révise ensemble ?', 'J’ai aussi les annales si tu veux ✍️'],
    posts: 12,
    followers: 284,
    following: 147,
    tags: ['📚 Révision', '🤝 Réseautage', '✅ Vérifié'],
    followable: true,
  },
  thomas: {
    id: 'thomas',
    name: 'Thomas Khelil',
    initials: 'TK',
    grad: 'linear-gradient(135deg,#ff6b9d,#9b5de5)',
    cover: 'linear-gradient(135deg,#2a0a1a,#ff6b9d)',
    promo: 'Licence Pro Marketing · Homneo',
    location: 'La Bellevilloise · Paris',
    bio: 'Toujours chaud pour un afterwork, une sortie ou une session gaming. J’aime les gens spontanés qui ont de l’énergie.',
    replyPool: ['Carrément, ça me chauffe 🔥', 'Oui, on se capte là-bas ?', 'Parfait, j’amène le café ☕'],
    posts: 9,
    followers: 418,
    following: 201,
    tags: ['🎮 Gaming', '🏃 Sport', '🍺 Verre'],
    followable: true,
  },
  sara: {
    id: 'sara',
    name: 'Sara Benali',
    initials: 'SB',
    grad: 'linear-gradient(135deg,#4d9de0,#3dd6c8)',
    cover: 'linear-gradient(135deg,#0a1a2a,#4d9de0)',
    promo: 'BTS NDRC 1A · Homneo',
    location: 'Campus Homneo · Paris',
    bio: 'Entre les cours, les fiches et les cafés improvisés, je suis là pour rencontrer des personnes sérieuses mais cool.',
    replyPool: ['Merciii, tu m’as sauvée 🙏', 'Oui avec plaisir, on se voit demain ?', 'Je te redis ça vite'],
    posts: 15,
    followers: 512,
    following: 180,
    tags: ['☕ Café', '📚 Révision', '🌆 Sortie'],
    followable: true,
  },
  axel: {
    id: 'axel',
    name: 'Axel Remy',
    initials: 'AR',
    grad: 'linear-gradient(135deg,#ffb347,#ff6b9d)',
    cover: 'linear-gradient(135deg,#3a1a0a,#ffb347)',
    promo: 'BTS MHR 2A · Homneo',
    location: 'Trocadéro · Paris',
    bio: 'Sport, sorties, projet d’équipe et gros débriefs après les cours. Je swipe surtout selon l’ambiance du moment.',
    replyPool: ['Oh oui, ça part sur un verre ? 🍺', 'Carrément, on se fait ça ce soir ?', 'Je suis chaud pour le sport aussi'],
    posts: 8,
    followers: 267,
    following: 143,
    tags: ['🏃 Sport', '🎮 Gaming', '🍺 Verre'],
    followable: true,
  },
  nina: {
    id: 'nina',
    name: 'Nina Dupont',
    initials: 'ND',
    grad: 'linear-gradient(135deg,#9b5de5,#4d9de0)',
    cover: 'linear-gradient(135deg,#1a0a1a,#9b5de5)',
    promo: 'Licence 1 Droit',
    location: 'Île-de-France',
    bio: 'Plutôt café et révision, mais je ne dis pas non à une vraie bonne sortie quand le mood change.',
    replyPool: ['Oui, grave bonne idée ✨', 'On peut se caler un café demain ?', 'Je suis partante'],
    posts: 6,
    followers: 193,
    following: 108,
    tags: ['📚 Révision', '☕ Café', '🎵 Musique'],
    followable: true,
  },
  group: {
    id: 'group',
    name: 'Groupe NDRC 1A',
    initials: 'G',
    grad: 'linear-gradient(135deg,#ffb347,#ff6b9d)',
    cover: 'linear-gradient(135deg,#3a1a0a,#ffb347)',
    promo: 'Conversation de groupe',
    location: 'Campus Homneo',
    bio: 'Conversation de groupe pour la promo. Le bouton d’abonnement est désactivé sur les groupes, mais le chat reste accessible.',
    replyPool: ['Merci pour l’info !', 'Top, on se tient au courant ici.', 'Je vous partage ça maintenant.'],
    posts: 0,
    followers: 0,
    following: 0,
    tags: ['💬 Groupe', '📚 Partiels'],
    followable: false,
  },
  self: {
    id: 'self',
    name: 'Lola Martin',
    initials: 'LM',
    grad: 'linear-gradient(135deg,#c8f564,#4d9de0)',
    cover: 'linear-gradient(135deg,#1a2a3a,#4d9de0)',
    promo: 'BTS NDRC 1A · Groupe Homneo',
    location: 'Paris, Île-de-France',
    bio: 'BTS NDRC 1ère année · Passionnée de marketing & tennis 🎾',
    replyPool: ['Ok 👍', 'Merci !', 'Ça marche'],
    posts: 12,
    followers: 284,
    following: 147,
    tags: ['📚 Révision', '🤝 Réseautage', '✅ Vérifié'],
    followable: false,
  },
};

function getProfileData(profileId) {
  return profileDirectory[profileId] || profileDirectory.self;
}

function saveFollowedProfiles() {
  localStorage.setItem(followStorageKey, JSON.stringify([...followedProfiles]));
}

function setAvatarMedia(element, dataUrl, initials) {
  if (!element) return;
  if (dataUrl) {
    element.style.backgroundImage = `url('${dataUrl}')`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    element.textContent = '';
  } else {
    element.style.backgroundImage = '';
    element.textContent = initials;
  }
}

function refreshStoredUserPhoto() {
  const photo = localStorage.getItem(campusStorageKey);
  profilePhotoTargets.forEach(targetId => setAvatarMedia(document.getElementById(targetId), photo, 'LM'));
}

function bindPhotoInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      localStorage.setItem(campusStorageKey, dataUrl);
      refreshStoredUserPhoto();
      showToast('Photo mise à jour 📸');
    };
    reader.readAsDataURL(file);
  });
}

function syncProfileSheet(profileId) {
  const profile = getProfileData(profileId);
  currentProfileId = profileId;
  const cover = document.getElementById('profile-sheet-cover');
  const avatar = document.getElementById('profile-sheet-avatar');
  const name = document.getElementById('profile-sheet-name');
  const meta = document.getElementById('profile-sheet-meta');
  const bio = document.getElementById('profile-sheet-bio');
  const posts = document.getElementById('profile-sheet-posts');
  const followers = document.getElementById('profile-sheet-followers');
  const following = document.getElementById('profile-sheet-following');
  const tags = document.getElementById('profile-sheet-tags');
  const messageBtn = document.getElementById('profile-sheet-message-btn');
  const followBtn = document.getElementById('profile-sheet-follow-btn');

  if (cover) cover.style.background = profile.cover;
  if (avatar) {
    avatar.textContent = profile.initials;
    avatar.style.background = profile.grad;
  }
  if (name) name.textContent = profile.name;
  if (meta) meta.textContent = profile.promo + ' · ' + profile.location;
  if (bio) bio.textContent = profile.bio;
  if (posts) posts.textContent = profile.posts;
  if (followers) followers.textContent = profile.followers + (profile.followable && followedProfiles.has(profileId) ? 1 : 0);
  if (following) following.textContent = profile.following;
  if (tags) tags.innerHTML = profile.tags.map(tag => `<span class="pill pill-accent">${tag}</span>`).join('');
  if (messageBtn) {
    messageBtn.textContent = profile.followable ? 'Envoyer un message' : 'Ouvrir le groupe';
    messageBtn.disabled = false;
  }
  if (followBtn) {
    if (!profile.followable) {
      followBtn.textContent = 'Non applicable';
      followBtn.disabled = true;
      followBtn.className = 'btn-ghost';
    } else if (followedProfiles.has(profileId)) {
      followBtn.textContent = 'Abonné';
      followBtn.disabled = false;
      followBtn.className = 'btn-primary';
    } else {
      followBtn.textContent = "S'abonner";
      followBtn.disabled = false;
      followBtn.className = 'btn-ghost';
    }
  }
}

function openProfile(profileId) {
  syncProfileSheet(profileId);
  openSheet('profile-sheet');
}

function toggleCurrentProfileFollow() {
  const profile = getProfileData(currentProfileId);
  if (!profile.followable) return;
  if (followedProfiles.has(profile.id)) followedProfiles.delete(profile.id);
  else followedProfiles.add(profile.id);
  saveFollowedProfiles();
  syncProfileSheet(profile.id);
  showToast(followedProfiles.has(profile.id) ? 'Abonnement confirmé ✨' : 'Abonnement retiré');
}

function messageCurrentProfile() {
  const profile = getProfileData(currentProfileId);
  goTo('messages');
  closeSheet('profile-sheet');
  openChat(profile.id);
}

function likePost(target) {
  const post = target && target.closest ? (target.closest('.post') || target.closest('.post-img')) : target;
  if (!post) return;
  const btn = post.querySelector('.post-action-btn');
  if (!btn) return;
  const wasLiked = btn.classList.contains('liked');
  btn.classList.toggle('liked');
  const countEl = btn.querySelector('span');
  if (countEl) {
    const nextValue = (parseInt(countEl.textContent.replace(/\s/g, ''), 10) || 0) + (wasLiked ? -1 : 1);
    countEl.textContent = String(nextValue).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  if (!wasLiked) showToast('Post liké ❤️');
}

function selectIntent(chip, label) {
  document.querySelectorAll('.intent-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  selectedMood = label;
  localStorage.setItem(campusMoodKey, label);
  showToast('Intention : ' + label + ' 🎯');
  initSwipeCards();
}

function shuffleProfiles(list) {
  const clone = [...list];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function getProfilesForMood() {
  return swipeProfiles
    .filter(profile => Array.isArray(profile.moods) ? profile.moods.includes(selectedMood) : profile.tags.some(tag => tag === selectedMood))
    .map(profile => ({ ...profile }));
}

function initSwipeCards() {
  const area = document.getElementById('swipe-area');
  if (!area) return;
  area.innerHTML = '';
  swipeStack = shuffleProfiles(getProfilesForMood());
  renderSwipeStack();
}

function renderSwipeStack() {
  const area = document.getElementById('swipe-area');
  if (!area) return;
  area.innerHTML = '';
  const visible = swipeStack.slice(0, 3);
  visible.forEach((profile, index) => {
    const card = document.createElement('div');
    card.className = 'swipe-card' + (index === 0 ? ' top' : '');
    card.innerHTML = `
      <div class="swipe-card-img" style="background:${profile.bg};">
        <div style="font-size:100px;">${profile.emoji}</div>
        <div class="swipe-card-overlay"></div>
        <div class="swipe-like-label">LIKE</div>
        <div class="swipe-nope-label">NOPE</div>
        <div class="swipe-card-content">
          <div class="swipe-name">${profile.name}, ${profile.age}</div>
          <div class="swipe-info">${profile.promo}</div>
          <div class="swipe-tags">${profile.tags.map(tag => `<span class="swipe-tag">${tag}</span>`).join('')}</div>
        </div>
      </div>`;
    if (index === 0) addSwipeListeners(card, profile.id);
    area.appendChild(card);
  });
  if (!visible.length) {
    area.innerHTML = '<div style="text-align:center;padding:40px 20px;"><div style="font-size:48px;margin-bottom:14px;">👀</div><div style="font-family:Clash Display,sans-serif;font-size:18px;font-weight:700;color:var(--text);">Plus de profils</div><div style="font-size:13px;color:var(--text2);margin-top:6px;">Change de mood pour voir une autre catégorie</div></div>';
  }
}

function addSwipeListeners(card, profileId) {
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let curX = 0;
  let movedEnough = false;

  const onStart = event => {
    isDragging = true;
    movedEnough = false;
    const point = event.touches ? event.touches[0] : event;
    startX = point.clientX;
    startY = point.clientY;
    card.style.transition = 'none';
  };

  const onMove = event => {
    if (!isDragging) return;
    event.preventDefault();
    const point = event.touches ? event.touches[0] : event;
    curX = point.clientX - startX;
    const curY = point.clientY - startY;
    if (Math.abs(curX) > 8 || Math.abs(curY) > 8) movedEnough = true;
    const rotation = curX * 0.08;
    card.style.transform = `translateX(${curX}px) rotate(${rotation}deg)`;
    const like = card.querySelector('.swipe-like-label');
    const nope = card.querySelector('.swipe-nope-label');
    if (curX > 20) {
      like.style.opacity = Math.min(curX / 80, 1);
      nope.style.opacity = 0;
    } else if (curX < -20) {
      nope.style.opacity = Math.min(-curX / 80, 1);
      like.style.opacity = 0;
    } else {
      like.style.opacity = 0;
      nope.style.opacity = 0;
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    if (curX > 80) animateSwipe(card, 'right');
    else if (curX < -80) animateSwipe(card, 'left');
    else if (movedEnough) {
      card.style.transition = 'transform 0.4s cubic-bezier(0.36,0.07,0.19,0.97)';
      card.style.transform = '';
    } else {
      openProfile(profileId);
      card.style.transition = 'transform 0.4s cubic-bezier(0.36,0.07,0.19,0.97)';
      card.style.transform = '';
    }
    curX = 0;
  };

  card.addEventListener('mousedown', onStart);
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseup', onEnd);
  card.addEventListener('mouseleave', onEnd);
  card.addEventListener('touchstart', onStart, { passive: true });
  card.addEventListener('touchmove', onMove, { passive: false });
  card.addEventListener('touchend', onEnd);
}

function animateSwipe(card, dir) {
  const x = dir === 'right' ? 500 : dir === 'super' ? 0 : -500;
  const y = dir === 'super' ? -700 : 0;
  card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
  card.style.transform = `translateX(${x}px) translateY(${y}px) rotate(${dir === 'right' ? 30 : dir === 'left' ? -30 : 0}deg)`;
  card.style.opacity = '0';
  const current = swipeStack[0];
  swipeStack.shift();
  setTimeout(() => renderSwipeStack(), 350);
  if (dir === 'right' && current && Math.random() > 0.4) {
    setTimeout(() => {
      document.getElementById('match-sub').textContent = `Vous et ${current.name} avez matché ! Envoyez un message.`;
      document.getElementById('match-popup').classList.add('show');
    }, 500);
  } else if (dir === 'right') {
    showToast('Liked ' + (current ? current.name : '') + ' ❤️');
  } else if (dir === 'left') {
    showToast('Passé ➡️');
  } else {
    showToast('Super Like ⭐ envoyé !');
  }
}

function swipeCard(dir) {
  const top = document.querySelector('.swipe-card.top');
  if (!top) return;
  animateSwipe(top, dir);
}

function closeMatch() {
  document.getElementById('match-popup').classList.remove('show');
  if (swipeStack.length === 0) initSwipeCards();
}

function bootstrapCampusConnect() {
  if (window.CampusConversationStore) {
    window.CampusConversationStore.load();
  }
  swipeProfiles.forEach((profile, index) => {
    if (!profile.id) profile.id = ['lea', 'thomas', 'sara', 'axel', 'nina'][index] || `profile-${index}`;
    profile.moods = profile.tags.filter(tag => ['📚 Révision', '🏃 Sport', '☕ Café', '🎮 Gaming', '🍺 Verre', '🌆 Sortie'].includes(tag));
  });
  if (!document.getElementById('profile-sheet') || !document.getElementById('profile-photo-input')) return;
  bindPhotoInput('profile-photo-input');
  bindPhotoInput('rencontre-photo-input');
  refreshStoredUserPhoto();
  initSwipeCards();
}

bootstrapCampusConnect();