window.CampusConversationStore = (() => {
  const storageKey = 'campus-conversations-v1';
  const seed = {
    lea: [
      { from: 'them', text: "T'as vu pour le partiel de droit ?", time: '08:14' },
      { from: 'me', text: 'Oui, je révise toute la matinée 😅', time: '08:16' },
      { from: 'them', text: "J'ai partagé les annales sur le groupe, regarde", time: '08:17' },
    ],
    thomas: [
      { from: 'them', text: 'On se retrouve à la BU à 14h ?', time: '12:01' },
      { from: 'me', text: "Oui, j'arrive avec mes fiches.", time: '12:04' },
      { from: 'them', text: 'Parfait, je prends le café ☕', time: '12:05' },
    ],
    group: [
      { from: 'them', text: "Thomas: N'oubliez pas les annales !", time: '09:10' },
      { from: 'me', text: 'Je les ai déjà imprimées, je vous les envoie.', time: '09:12' },
      { from: 'them', text: "Léa: Merci, t'assures 🙌", time: '09:13' },
    ],
    sara: [
      { from: 'them', text: 'Merci pour les fiches 🙏', time: '17:25' },
      { from: 'me', text: 'Avec plaisir, si tu veux on révise ensemble.', time: '17:28' },
      { from: 'them', text: 'Carrément, demain après-midi ?', time: '17:30' },
    ],
    axel: [
      { from: 'them', text: 'Tu joues à quoi ce soir ?', time: '18:40' },
      { from: 'me', text: 'Un peu de tout, mais plutôt chill.', time: '18:43' },
      { from: 'them', text: 'On peut se faire un verre après le sport ?', time: '18:45' },
    ],
    nina: [
      { from: 'them', text: 'Super soirée 🎉', time: '23:08' },
      { from: 'me', text: "Oui, c'était trop bien !", time: '23:11' },
      { from: 'them', text: 'On remet ça bientôt ?', time: '23:12' },
    ],
  };

  let state = null;

  function cloneThread(thread) {
    return thread.map(message => ({ ...message }));
  }

  function load() {
    if (state) return state;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored && typeof stored === 'object') {
        state = stored;
      }
    } catch (error) {
      state = null;
    }
    if (!state) {
      state = cloneSeed();
    } else {
      state = { ...cloneSeed(), ...state };
    }
    return state;
  }

  function cloneSeed() {
    const next = {};
    Object.keys(seed).forEach(profileId => {
      next[profileId] = cloneThread(seed[profileId]);
    });
    return next;
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function ensureThread(profileId) {
    load();
    if (!state[profileId]) {
      state[profileId] = [];
      save();
    }
    return state[profileId];
  }

  function getThread(profileId) {
    return cloneThread(ensureThread(profileId));
  }

  function setThread(profileId, messages) {
    load();
    state[profileId] = cloneThread(messages);
    save();
  }

  function appendMessage(profileId, message) {
    const thread = ensureThread(profileId);
    thread.push({ ...message });
    save();
    return cloneThread(thread);
  }

  function getSeedReply(profileId) {
    const thread = seed[profileId] || [];
    const reply = thread.slice().reverse().find(message => message.from === 'them');
    return reply ? reply.text : 'Trop bien 😊';
  }

  return {
    load,
    getThread,
    setThread,
    appendMessage,
    getSeedReply,
  };
})();
