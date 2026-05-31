(() => {
  const apiBase = '';
  const authOverlayId = 'auth-overlay';
  let sessionUser = null;

  async function request(path, options = {}) {
    const response = await fetch(apiBase + path, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'request_failed');
      error.data = data;
      throw error;
    }
    return data;
  }

  function showAuth() {
    hideRegisterFields();
    clearAuthError();
    document.getElementById(authOverlayId)?.classList.add('open');
  }

  function hideAuth() {
    document.getElementById(authOverlayId)?.classList.remove('open');
  }

  function setUserHeader(user) {
    const title = document.querySelector('#screen-feed .t-h2.t-display');
    if (title && user) {
      title.innerHTML = `${user.name.split(' ')[0] || 'Campus'}<span style="color:var(--accent);">.</span>`;
    }
  }

  function updateProfilePhoto(photo) {
    if (!photo) return;
    const ids = ['main-profile-avatar', 'edit-profile-preview', 'rencontre-profile-preview'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.backgroundImage = `url('${photo}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    });
  }

  function isDemoAccount(user = sessionUser) {
    return !!(user && (user.id === 'u-demo' || user.email === 'demo@campus.local'));
  }

  function getPostVisual(post) {
    const id = String(post?.id || '');
    if (id === 'p1') return { emoji: '📚', bg: 'linear-gradient(135deg,#1a2a3a,#3dd6c8)' };
    if (id === 'p2') return { emoji: '🎉', bg: 'linear-gradient(135deg,#2a0a1a,#ff6b9d)' };
    if (id === 'p3') return { emoji: '☀️', bg: 'linear-gradient(135deg,#1a3a0a,#c8f564)' };
    const content = String(post?.content || '').trim();
    return { emoji: content.slice(0, 2) || '📝', bg: post?.bg || 'linear-gradient(135deg,#1a1a2a,#4d9de0)' };
  }

  function renderFeedPosts(posts) {
    const host = document.getElementById('feed-user-posts');
    if (!host) return;
    const list = Array.isArray(posts) ? posts : [];
    if (!list.length) {
      host.innerHTML = '';
      return;
    }
    host.innerHTML = list.map(post => {
      const visual = getPostVisual(post);
      const name = post?.authorName || sessionUser?.name || 'Moi';
      const initials = ((post?.authorName || sessionUser?.firstname || sessionUser?.name || 'M').split(' ')[0]?.[0] || 'M').toUpperCase();
      const caption = String(post?.content || '').trim();
      return `
        <div class="post user-post">
          <div class="post-header">
            <div class="avatar av-sm" style="background:linear-gradient(135deg,#c8f564,#3dd6c8);">${initials}</div>
            <div>
              <div class="post-username">${name}</div>
              <div class="post-location">📍 ${post?.authorId === 'u-demo' ? 'Compte démo' : 'Commun'}</div>
            </div>
            <div class="post-more icon-btn" style="margin-left:auto;">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </div>
          </div>
          <div class="post-img" style="background:${visual.bg};min-height:220px;" onclick="showToast('Post ouvert 🖼')">
            <div class="post-img-inner" style="font-size:88px;">${visual.emoji}</div>
          </div>
          <div class="post-actions">
            <button class="post-action-btn" onclick="likePost(this.closest('.post'))">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              <span>0</span>
            </button>
            <button class="post-action-btn" onclick="goTo('messages')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <span>0</span>
            </button>
            <button class="post-action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
            <button class="post-action-btn post-save-btn" onclick="showToast('Post sauvegardé ✨')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            </button>
          </div>
          <div class="post-likes">0 j'aime</div>
          <div class="post-caption"><span>${name}</span> ${caption || 'Nouveau post'}</div>
          <div class="post-time">À l'instant</div>
        </div>
      `;
    }).join('');
  }

  function updateAdminStatus(message) {
    const status = document.getElementById('admin-status');
    if (status) {
      status.textContent = message || '';
    }
  }

  function updateProfileFromSession() {
    const nameEl = document.getElementById('profile-name');
      const profilePosts = data.posts || [];
      const feedPosts = data.feedPosts || data.posts || [];
      renderFeedPosts(feedPosts);
    const postsEl = document.getElementById('profile-posts');
    const followersEl = document.getElementById('profile-followers');
      if (!profilePosts.length) {
    const avatar = document.getElementById('main-profile-avatar');

    if (!sessionUser) {
      grid.innerHTML = profilePosts.map(p => {
      if (bioEl) bioEl.innerHTML = '';
      if (tagsEl) tagsEl.innerHTML = '';
      if (postsEl) postsEl.textContent = '0';
      if (followersEl) followersEl.textContent = '0';
      if (followingEl) followingEl.textContent = '0';
      if (avatar) { avatar.textContent = '??'; avatar.style.background = 'linear-gradient(135deg,#555,#333)'; }
      return;
    }

    // Fill profile values from sessionUser (use fallbacks)
    const displayName = sessionUser.name || `${sessionUser.firstname || ''} ${sessionUser.lastname || ''}`.trim() || sessionUser.email || 'Profil';
    if (nameEl) nameEl.textContent = displayName;
    if (bioEl) bioEl.textContent = sessionUser.bio || '';
    if (postsEl) postsEl.textContent = String(sessionUser.posts || 0);
    if (followersEl) followersEl.textContent = String(sessionUser.followers || 0);
    if (followingEl) followingEl.textContent = String(sessionUser.following || 0);
    if (tagsEl) tagsEl.innerHTML = (sessionUser.tags || []).map(t => `<span class="pill pill-accent">${t}</span>`).join('');

    // Avatar: initials or photo
    if (avatar) {
      if (sessionUser.photo) {
        avatar.style.backgroundImage = `url('${sessionUser.photo}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
      } else {
        const n = (sessionUser.firstname || sessionUser.name || '').split(' ');
        const initials = (n[0] ? n[0][0] : '') + (n[1] ? n[1][0] : '');
        avatar.textContent = (initials || (sessionUser.email || 'U').slice(0,2)).toUpperCase();
        avatar.style.backgroundImage = '';
        avatar.style.background = 'linear-gradient(135deg,#c8f564,#3dd6c8)';
      }
    }
  }

  async function fetchUserPosts() {
    try {
      // Prefer bootstrap (contains posts) to avoid 404s on some setups; fallback to /api/posts
      let data;
      try {
        data = await request('/api/bootstrap', { method: 'GET' });
      } catch (e) {
        data = await request('/api/posts', { method: 'GET' });
      }
      const posts = data.posts || [];
      renderFeedPosts(posts);
      const grid = document.querySelector('.profil-grid');
      if (!grid) return;
      if (!posts.length) {
        grid.innerHTML = '<div style="padding:20px;color:var(--text3);">Aucun post pour le moment.</div>';
        return;
      }
      grid.innerHTML = posts.map(p => {
        const bg = p.bg ? `background:${p.bg};` : '';
        const content = p.content || '';
        return `<div class="profil-post-thumb" style="${bg}" onclick="showToast('Post ouvert 🖼')">${content}</div>`;
      }).join('');
    } catch (e) {
      // keep existing static grid if request fails
      console.warn('fetchUserPosts error', e);
    }
  }

  async function refreshAdminUsers() {
    if (sessionUser?.role !== 'admin') return;
    const data = await request('/api/admin/users', { method: 'GET' });
    const select = document.getElementById('admin-user-select');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = (data.users || [])
      .map(user => `<option value="${user.id}">${user.name} (${user.email})${user.role === 'admin' ? ' · admin' : ''}${user.mutedUntil ? ' · muté' : ''}</option>`)
      .join('');
    if (currentValue && Array.from(select.options).some(option => option.value === currentValue)) {
      select.value = currentValue;
    } else if (sessionUser?.id && Array.from(select.options).some(option => option.value === sessionUser.id)) {
      select.value = sessionUser.id;
    }
    updateAdminStatus(`Comptes chargés: ${(data.users || []).length}`);
  }

  function setAdminPanelVisibility() {
    const panel = document.getElementById('admin-panel');
    if (!panel) return;
    const visible = sessionUser?.role === 'admin';
    panel.style.display = visible ? 'block' : 'none';
    if (visible) {
      refreshAdminUsers().catch(() => updateAdminStatus('Impossible de charger les comptes admin'));
    }
  }

  async function syncSession() {
    const session = await request('/api/session', { method: 'GET' });
    sessionUser = session.user;
    if (!sessionUser) {
      showAuth();
      setAdminPanelVisibility();
      updateDemoOverlays();
      return;
    }
    hideAuth();
    setUserHeader(sessionUser);
    if (sessionUser.photo) updateProfilePhoto(sessionUser.photo);
    setAdminPanelVisibility();
    updateDemoOverlays();
    updateDemoBadge();
    updateProfileFromSession();
    await fetchUserPosts();
  }

  async function login() {
    const emailEl = document.getElementById('auth-email');
    const pwdEl = document.getElementById('auth-password');
    const email = emailEl?.value.trim();
    const password = pwdEl?.value;
    if (!email || !password) {
      setAuthError('Renseigne email et mot de passe');
      return;
    }
    // Validate email format client-side
    if (emailEl && typeof emailEl.checkValidity === 'function') {
      emailEl.value = email;
      if (!emailEl.checkValidity()) {
        setAuthError('Adresse e‑mail invalide');
        return;
      }
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) {
        setAuthError('Adresse e‑mail invalide');
        return;
      }
    }
    try {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      sessionUser = data.user;
      clearAuthError();
      hideAuth();
      setUserHeader(sessionUser);
      if (sessionUser.photo) updateProfilePhoto(sessionUser.photo);
      setAdminPanelVisibility();
      updateDemoOverlays();
      updateDemoBadge();
      updateProfileFromSession();
      showToast('Connecté ✅');
      await fetchUserPosts();
    } catch (err) {
      let msg = 'Erreur de connexion';
      try {
        if (err && err.data && err.data.error === 'invalid_credentials') {
          msg = 'Email ou mot de passe incorrect';
        } else if (err && err.data && err.data.error) {
          msg = String(err.data.error);
        } else if (err && err.message) {
          const m = String(err.message || '');
          // Network / fetch errors — give a clearer hint to start the backend
          if (m.includes('Failed to fetch') || m.toLowerCase().includes('networkerror') || m.toLowerCase().includes('request_failed') || m.toLowerCase().includes('request failed')) {
            msg = 'Impossible de joindre le serveur local — vérifie que le backend est démarré (start.bat / python back/server.py) et réessaie.';
          } else {
            msg = m || msg;
          }
        } else {
          msg = 'Impossible de se connecter — vérifie ta connexion réseau ou le serveur local.';
        }
      } catch (e) {}
      setAuthError(msg);
      return;
    }
  }

  function setAuthError(message) {
    const el = document.getElementById('auth-error');
    if (!el) {
      showToast(message);
      return;
    }
    el.textContent = message;
    el.classList.add('show');
    // mark inputs with error styling
    try {
      const email = document.getElementById('auth-email');
      const pwd = document.getElementById('auth-password');
      if (email) email.classList.add('input-error');
      if (pwd) pwd.classList.add('input-error');
    } catch (e) {}
  }

  function clearAuthError() {
    const el = document.getElementById('auth-error');
    if (!el) return;
    el.textContent = '';
    el.classList.remove('show');
    try {
      const email = document.getElementById('auth-email');
      const pwd = document.getElementById('auth-password');
      if (email) email.classList.remove('input-error');
      if (pwd) pwd.classList.remove('input-error');
    } catch (e) {}
  }

  function bindAuthInputs() {
    ['auth-email', 'auth-password', 'auth-firstname', 'auth-lastname', 'auth-birth'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => clearAuthError());
    });
  }

  async function register() {
    const regGroup = document.getElementById('auth-register-fields');
    // If register fields are not visible yet, reveal them first
    if (!regGroup || !regGroup.classList.contains('show')) {
      showRegisterFields();
      return;
    }

    const lastnameEl = document.getElementById('auth-lastname');
    const firstnameEl = document.getElementById('auth-firstname');
    const birthEl = document.getElementById('auth-birth');
    const emailEl = document.getElementById('auth-email');
    const passEl = document.getElementById('auth-password');
    const lastname = lastnameEl?.value.trim();
    const firstname = firstnameEl?.value.trim();
    const birth = birthEl?.value || '';
    const email = emailEl?.value.trim();
    const password = passEl?.value;
    if (!lastname || !firstname || !birth || !email || !password) {
      setAuthError('Renseigne nom, prénom, date de naissance, email et mot de passe');
      return;
    }
    // Validate email format client-side. Prefer native validity when available.
    if (emailEl && typeof emailEl.checkValidity === 'function') {
      emailEl.value = email; // update trimmed value
      if (!emailEl.checkValidity()) {
        showToast('Adresse e‑mail invalide');
        return;
      }
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) {
        showToast('Adresse e‑mail invalide');
        return;
      }
    }
    const fullName = `${firstname} ${lastname}`;
    try {
      const data = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: fullName, firstname, lastname, email, password, birth }),
      });
      sessionUser = data.user;
      hideAuth();
      setUserHeader(sessionUser);
      setAdminPanelVisibility();
      updateDemoOverlays();
      updateDemoBadge();
      updateProfileFromSession();
      showToast('Compte créé ✨');
      await fetchUserPosts();
    } catch (err) {
      // Prefer a clear message when registration fails (email already used / backend unreachable)
      let msg = 'Erreur lors de la création du compte';
      try {
        if (err && err.data && err.data.error === 'email_in_use') msg = 'Cette adresse e‑mail est déjà utilisée';
        else if (err && err.data && err.data.error) msg = String(err.data.error);
        else if (err && err.message) {
          const m = String(err.message || '');
          if (m.includes('Failed to fetch') || m.toLowerCase().includes('networkerror') || m.toLowerCase().includes('request_failed')) {
            msg = 'Impossible de joindre le serveur local — vérifie que le backend est démarré (start.bat / python back/server.py) et réessaie.';
          } else {
            msg = m || msg;
          }
        }
      } catch (e) {}
      setAuthError(msg);
      return;
    }
  }

  async function demoLogin() {
    document.getElementById('auth-email').value = 'demo@campus.local';
    document.getElementById('auth-password').value = 'demo123';
    const names = 'Lola Martin'.split(' ');
    document.getElementById('auth-firstname').value = names[0] || '';
    document.getElementById('auth-lastname').value = names.slice(1).join(' ') || '';
    document.getElementById('auth-birth').value = '2004-01-01';
    await login();
    updateDemoOverlays();
    updateDemoBadge();
    await fetchUserPosts();
  }

  async function createPost() {
    const caption = document.getElementById('new-post-caption')?.value.trim() || '';
    const location = document.getElementById('new-post-location')?.value.trim() || '';
    const visibility = document.getElementById('new-post-visibility')?.value || 'Tout le monde';
    const selectedType = document.querySelector('#new-post-sheet .post-type-btn.sel .post-type-label')?.textContent?.trim() || 'Texte';
    const typeVisual = {
      Photo: { emoji: '📸', bg: 'linear-gradient(135deg,#1a2a3a,#3dd6c8)' },
      Vidéo: { emoji: '🎥', bg: 'linear-gradient(135deg,#2a0a1a,#ff6b9d)' },
      Story: { emoji: '📖', bg: 'linear-gradient(135deg,#1a1a3a,#9b5de5)' },
      Texte: { emoji: '📝', bg: 'linear-gradient(135deg,#0a1a2a,#4d9de0)' },
    }[selectedType] || { emoji: '📝', bg: 'linear-gradient(135deg,#0a1a2a,#4d9de0)' };
    if (!caption && !location) {
      showToast('Ajoute une légende ou un lieu');
      return;
    }
    const content = [typeVisual.emoji, caption || selectedType, location ? `📍 ${location}` : '', `🌍 ${visibility}`].filter(Boolean).join(' · ');
    try {
      const data = await request('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content, bg: typeVisual.bg }),
      });
      const posts = data.posts || [];
      renderFeedPosts(posts);
      await fetchUserPosts();
      closeSheet('new-post-sheet');
      showToast('Post publié ! 🎉');
      const captionInput = document.getElementById('new-post-caption');
      const locationInput = document.getElementById('new-post-location');
      if (captionInput) captionInput.value = '';
      if (locationInput) locationInput.value = '';
    } catch (e) {
      console.warn('createPost error', e);
      showToast('Impossible de publier le post');
    }
  }

  function showRegisterFields() {
    const reg = document.getElementById('auth-register-fields');
    if (!reg) return;
    reg.classList.add('show');
    clearAuthError();
    const first = document.getElementById('auth-lastname') || document.getElementById('auth-firstname');
    if (first) first.focus();
  }

  function hideRegisterFields() {
    const reg = document.getElementById('auth-register-fields');
    if (!reg) return;
    reg.classList.remove('show');
  }

  async function logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      sessionUser = null;
      showAuth();
      setAdminPanelVisibility();
      updateDemoOverlays();
      updateDemoBadge();
      updateProfileFromSession();
      showToast('Déconnecté');
    }
  }

  function updateDemoOverlays() {
    // Show or hide demo-only UI pieces depending on whether the current session
    // user is the dedicated demo account.
    const isDemoAccount = !!(sessionUser && (sessionUser.id === 'u-demo' || sessionUser.email === 'demo@campus.local'));
    const demoOverlays = [];
    const demoBadge = document.getElementById('demo-badge');
    const setAreaVisibility = (areaSelector, visible, emptyText) => {
      const area = document.querySelector(areaSelector);
      if (!area) return;
      Array.from(area.children).forEach(child => {
        if (child.classList && child.classList.contains('demo-overlay')) return;
        child.style.display = visible ? '' : 'none';
      });
      if (visible) {
        const existing = area.querySelector('.empty-hint-demo');
        if (existing) existing.remove();
      } else if (!area.querySelector('.empty-hint-demo')) {
        const hint = document.createElement('div');
        hint.className = 'empty-hint-demo';
        hint.style.padding = '28px 18px';
        hint.style.color = 'var(--text3)';
        hint.style.display = '';
        hint.textContent = emptyText || 'Aucun contenu pour le moment.';
        area.insertBefore(hint, area.firstChild);
      }
    };

    if (isDemoAccount) {
      document.body.classList.add('demo-active');
      demoOverlays.forEach(o => o.style.display = 'none');
      if (demoBadge) demoBadge.classList.add('show');

      const convoItems = Array.from(document.querySelectorAll('#screen-messages .convo-item'));
      convoItems.forEach(c => c.style.display = 'flex');
      const chatMsgs = document.getElementById('chat-msgs');
      if (chatMsgs) chatMsgs.style.display = '';

      const storyItems = Array.from(document.querySelectorAll('#screen-feed .stories-row .story-item'));
      storyItems.forEach(s => s.style.display = '');
      const storyViewer = document.getElementById('story-viewer');
      if (storyViewer) storyViewer.style.display = '';

      setAreaVisibility('#screen-rencontres .swipe-area', true);
    } else {
      document.body.classList.remove('demo-active');
      demoOverlays.forEach(o => o.style.display = 'none');
      if (demoBadge) demoBadge.classList.remove('show');

      const convoItems = Array.from(document.querySelectorAll('#screen-messages .convo-item'));
      convoItems.forEach(c => c.style.display = 'none');
      const chatMsgs = document.getElementById('chat-msgs');
      if (chatMsgs) chatMsgs.innerHTML = '';

      const storyItems = Array.from(document.querySelectorAll('#screen-feed .stories-row .story-item'));
      storyItems.forEach(s => s.style.display = 'none');
      const storyViewer = document.getElementById('story-viewer');
      if (storyViewer) {
        try { if (typeof closeStory === 'function') closeStory(); } catch (e) {}
        storyViewer.style.display = 'none';
      }

      const msgArea = document.querySelector('#screen-messages .scroll-area');
      if (msgArea && !msgArea.querySelector('.messages-empty-hint')) {
        const hint = document.createElement('div');
        hint.className = 'messages-empty-hint';
        hint.style.padding = '28px 18px';
        hint.style.color = 'var(--text3)';
        hint.style.display = '';
        hint.textContent = 'Aucune conversation pour le moment.';
        msgArea.insertBefore(hint, msgArea.firstChild);
      }

      setAreaVisibility('#screen-rencontres .swipe-area', false, 'Aucune rencontre disponible pour le moment.');
    }
  }

  // Position demo overlays so they're centered relative to the main header title
  function alignDemoOverlay() {
    try {
      const title = document.querySelector('#screen-feed .t-h2.t-display');
      if (!title) return;
      const rect = title.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const overlays = [];
      overlays.forEach(o => {
        o.style.left = `${centerX}px`;
        o.style.transform = 'translateX(-50%)';
      });
    } catch (e) {
      // ignore
    }
  }

  // Expose for debugging/tests
  window.updateDemoOverlays = updateDemoOverlays;
  function updateDemoBadge() {
    const badge = document.getElementById('demo-badge');
    if (!badge) return;
    const isDemoAccount = !!(sessionUser && (sessionUser.id === 'u-demo' || sessionUser.email === 'demo@campus.local'));
    if (isDemoAccount) badge.classList.add('show'); else badge.classList.remove('show');
  }

  function renderConversationMessages(messages) {
    const msgs = document.getElementById('chat-msgs');
    if (!msgs) return;
    msgs.innerHTML = messages.map(message => `<div class="msg ${message.from === 'me' ? 'me' : 'them'}"><div class="msg-bubble">${message.text}</div><div class="msg-time">${message.time}</div></div>`).join('');
    msgs.scrollTop = msgs.scrollHeight;
  }

  const legacySyncProfileSheet = window.syncProfileSheet;
  const legacyGoTo = window.goTo;

  window.openChat = async function(profileId) {
    const profile = getProfileData(profileId);
    currentChatId = profile.id;
    document.getElementById('chat-name').textContent = profile.name;
    document.getElementById('chat-av').textContent = profile.initials;
    document.getElementById('chat-av').style.background = profile.grad;
    document.getElementById('chat-screen').classList.add('open');
    try {
      const data = await request(`/api/conversations/${encodeURIComponent(profile.id)}`);
      renderConversationMessages(data.messages || []);
    } catch {
      renderConversationMessages([]);
      showToast('Messages indisponibles hors connexion');
    }
  };

  window.sendMsg = async function() {
    const inp = document.getElementById('chat-inp');
    const text = inp?.value.trim();
    if (!text || !currentChatId) return;
    const profile = getProfileData(currentChatId);
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    inp.value = '';
    try {
      const data = await request(`/api/conversations/${encodeURIComponent(profile.id)}`, {
        method: 'POST',
        body: JSON.stringify({ from: 'me', text, time }),
      });
      renderConversationMessages(data.messages || []);
      setTimeout(async () => {
        const replyPool = profile.replyPool || ['Trop bien 😊'];
        const reply = replyPool[Math.floor(Math.random() * replyPool.length)];
        const replyTime = new Date(Date.now() + 1000).toTimeString().slice(0, 5);
        const nextData = await request(`/api/conversations/${encodeURIComponent(profile.id)}`, {
          method: 'POST',
          body: JSON.stringify({ from: 'them', text: reply, time: replyTime }),
        });
        renderConversationMessages(nextData.messages || []);
      }, 700);
    } catch {
      showToast("Impossible d'envoyer le message");
    }
  };

  window.toggleCurrentProfileFollow = async function() {
    const profile = getProfileData(currentProfileId);
    if (!profile.followable) return;
    try {
      const data = await request(`/api/profiles/${encodeURIComponent(profile.id)}/follow`, { method: 'POST' });
      if (legacySyncProfileSheet) {
        legacySyncProfileSheet(profile.id);
      }
      const button = document.getElementById('profile-sheet-follow-btn');
      if (button) {
        button.textContent = data.following ? 'Abonné' : "S'abonner";
      }
      showToast(data.following ? 'Abonnement confirmé ✨' : 'Abonnement retiré');
    } catch {
      showToast('Impossible de mettre à jour l’abonnement');
    }
  };

  window.messageCurrentProfile = function() {
    const profile = getProfileData(currentProfileId);
    legacyGoTo?.('messages');
    closeSheet('profile-sheet');
    window.openChat(profile.id);
  };

  window.openProfile = async function(profileId) {
    const profile = getProfileData(profileId);
    currentProfileId = profileId;
    if (legacySyncProfileSheet) legacySyncProfileSheet(profileId);
    try {
      const data = await request(`/api/profiles/${encodeURIComponent(profileId)}`);
      const serverProfile = data.profile || profile;
      const cover = document.getElementById('profile-sheet-cover');
      const avatar = document.getElementById('profile-sheet-avatar');
      const name = document.getElementById('profile-sheet-name');
      const meta = document.getElementById('profile-sheet-meta');
      const bio = document.getElementById('profile-sheet-bio');
      const posts = document.getElementById('profile-sheet-posts');
      const followers = document.getElementById('profile-sheet-followers');
      const following = document.getElementById('profile-sheet-following');
      const tags = document.getElementById('profile-sheet-tags');
      const followBtn = document.getElementById('profile-sheet-follow-btn');
      if (cover) cover.style.background = serverProfile.cover;
      if (avatar) {
        avatar.textContent = serverProfile.initials;
        avatar.style.background = serverProfile.grad;
      }
      if (name) name.textContent = serverProfile.name;
      if (meta) meta.textContent = `${serverProfile.promo} · ${serverProfile.location}`;
      if (bio) bio.textContent = serverProfile.bio;
      if (posts) posts.textContent = serverProfile.posts;
      if (followers) followers.textContent = serverProfile.followers;
      if (following) following.textContent = serverProfile.following;
      if (tags) tags.innerHTML = (serverProfile.tags || []).map(tag => `<span class="pill pill-accent">${tag}</span>`).join('');
      if (followBtn) {
        followBtn.disabled = !serverProfile.followable;
        followBtn.textContent = serverProfile.followable ? (data.following ? 'Abonné' : "S'abonner") : 'Non applicable';
        followBtn.className = serverProfile.followable && data.following ? 'btn-primary' : 'btn-ghost';
      }
    } catch {
      showToast('Profil hors ligne');
    }
    openSheet('profile-sheet');
  };

  window.submitReportFromSheet = async function() {
    const type = document.getElementById('report-type')?.value || 'Autre';
    const note = document.getElementById('report-note')?.value.trim() || '';
    try {
      await request('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ type, note, targetId: currentProfileId || '' }),
      });
      closeSheet('report-sheet');
      showToast('Signalement envoyé');
    } catch {
      showToast('Impossible d’envoyer le signalement');
    }
  };

  window.deleteAdminMessage = async function() {
    if (sessionUser?.role !== 'admin') {
      showToast('Accès admin requis');
      return;
    }
    const userId = document.getElementById('admin-user-select')?.value;
    const profileId = document.getElementById('admin-profile-id')?.value.trim();
    const index = Number(document.getElementById('admin-message-index')?.value || 0);
    if (!userId || !profileId || Number.isNaN(index)) {
      showToast('Renseigne les champs admin');
      return;
    }
    try {
      await request(`/api/admin/conversations/${encodeURIComponent(userId)}/${encodeURIComponent(profileId)}/${index}`, { method: 'DELETE' });
      updateAdminStatus(`Message supprimé pour ${userId}/${profileId} à l'index ${index}`);
      if (currentChatId === profileId) {
        await window.openChat(profileId);
      }
      showToast('Message supprimé');
    } catch {
      showToast('Suppression impossible');
    }
  };

  window.muteAdminUser = async function() {
    if (sessionUser?.role !== 'admin') {
      showToast('Accès admin requis');
      return;
    }
    const userId = document.getElementById('admin-user-select')?.value;
    const minutes = Number(document.getElementById('admin-mute-minutes')?.value || 60);
    if (!userId || Number.isNaN(minutes)) {
      showToast('Renseigne les champs admin');
      return;
    }
    try {
      const data = await request(`/api/admin/users/${encodeURIComponent(userId)}/mute`, {
        method: 'POST',
        body: JSON.stringify({ minutes }),
      });
      updateAdminStatus(data.user?.mutedUntil ? `Compte muté jusqu'au ${data.user.mutedUntil}` : 'Mute retiré');
      await refreshAdminUsers();
      showToast(data.user?.mutedUntil ? 'Compte muté' : 'Mute retiré');
    } catch {
      showToast('Mute impossible');
    }
  };

  window.deleteAdminAccount = async function() {
    if (sessionUser?.role !== 'admin') {
      showToast('Accès admin requis');
      return;
    }
    const userId = document.getElementById('admin-user-select')?.value;
    if (!userId) {
      showToast('Choisis un compte');
      return;
    }
    if (!confirm(`Supprimer le compte ${userId} ?`)) return;
    try {
      await request(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
      updateAdminStatus(`Compte supprimé: ${userId}`);
      await refreshAdminUsers();
      if (sessionUser?.id === userId) {
        sessionUser = null;
        showAuth();
      }
      showToast('Compte supprimé');
    } catch {
      showToast('Suppression impossible');
    }
  };

  async function uploadPhotoFromInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      try {
        await request('/api/uploads/profile-photo', {
          method: 'POST',
          body: JSON.stringify({ photo: dataUrl }),
        });
        updateProfilePhoto(dataUrl);
        showToast('Photo mise à jour 📸');
      } catch {
        showToast('Upload impossible');
      }
    };
    reader.readAsDataURL(file);
  }

  function bindUploadInputs() {
    ['profile-photo-input', 'rencontre-photo-input'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('change', () => uploadPhotoFromInput(id));
    });
  }

  function patchSettingsLogout() {
    const settingsSheet = document.getElementById('settings-sheet');
    if (!settingsSheet) return;
    // Prefer a dedicated logout button (inserted in HTML) with id 'settings-logout-btn'.
    const btn = document.getElementById('settings-logout-btn');
    if (btn) {
      if (btn.dataset && btn.dataset.logoutBound) return;
      if (btn.dataset) btn.dataset.logoutBound = '1';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { showToast('À bientôt 👋'); } catch (er) {}
        try { if (typeof closeSheet === 'function') closeSheet('settings-sheet'); } catch (er) {}
        logout();
      });
      return;
    }
    // Backwards-compatible fallback: install a delegated listener on the document
    // so clicks are handled even if the sheet is rendered after boot.
    if (!window._logoutDelegatedBound) {
      window._logoutDelegatedBound = true;
      document.addEventListener('click', (ev) => {
        try {
          const t = ev.target;
          if (!t) return;
          // match by id, or by exact text for legacy cases
          if (t.id === 'settings-logout-btn' || (t.textContent && t.textContent.trim() === 'Se déconnecter')) {
            ev.stopPropagation();
            ev.preventDefault();
            try { showToast('À bientôt 👋'); } catch (er) {}
            try { if (typeof closeSheet === 'function') closeSheet('settings-sheet'); } catch (er) {}
            // Call logout via CampusRuntime if available, otherwise call local function
            try { (window.CampusRuntime && typeof window.CampusRuntime.logout === 'function') ? window.CampusRuntime.logout() : logout(); } catch (er) { try { logout(); } catch(e) {} }
          }
        } catch (e) {}
      }, true);
    }
  }

  async function saveProfile() {
    const first = document.getElementById('edit-firstname')?.value.trim() || '';
    const last = document.getElementById('edit-lastname')?.value.trim() || '';
    const pseudo = document.getElementById('edit-pseudo')?.value.trim() || '';
    const bio = document.getElementById('edit-bio')?.value || '';
    const fullName = `${first} ${last}`.trim() || pseudo || sessionUser?.name || '';
    try {
      const data = await request('/api/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: fullName, bio }),
      });
      sessionUser = data.user;
      updateProfileFromSession();
      if (sessionUser.photo) updateProfilePhoto(sessionUser.photo);
      closeSheet('edit-profil-sheet');
      showToast('Profil mis à jour ✅');
    } catch (e) {
      showToast('Impossible de sauvegarder le profil');
      console.warn('saveProfile error', e);
    }
  }

  async function boot() {
    bindUploadInputs();
    bindAuthInputs();
    patchSettingsLogout();
    // bind profile save button
    const saveBtn = document.getElementById('edit-profil-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', (e) => { e.preventDefault(); saveProfile(); });
    const postBtn = document.getElementById('new-post-publish-btn');
    if (postBtn) postBtn.addEventListener('click', (e) => { e.preventDefault(); createPost(); });
    try {
      await syncSession();
      if (sessionUser) {
        hideAuth();
      }
    } catch {
      showAuth();
    }
  }

  window.CampusRuntime = { login, register, demoLogin, logout, request, boot, refreshAdminUsers, deleteAdminMessage: window.deleteAdminMessage, muteAdminUser: window.muteAdminUser, deleteAdminAccount: window.deleteAdminAccount, saveProfile, createPost, renderFeedPosts };
  window.addEventListener('DOMContentLoaded', boot);
})();
