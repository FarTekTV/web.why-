/* Sauvegarde dans localStorage. Si le stockage est indisponible, le jeu
   continue de fonctionner en mémoire (la progression ne survit pas au rechargement). */
(function () {
  const P = window.P;
  const KEY = 'pourquoi.save.v1';
  let memoryOnly = false;

  const defaults = () => ({
    clicks: 0,
    sessions: 0,
    bestSession: 0,
    events: 0,
    dodges: 0,
    timeMs: 0,
    achievements: {},
    secrets: {},
    eventsSeen: {},
    sound: true,
    firstSeen: Date.now(),
  });

  let state = defaults();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = Object.assign(defaults(), JSON.parse(raw));
    } catch (e) {
      memoryOnly = true;
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      memoryOnly = true;
    }
  }

  function reset() {
    state = defaults();
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      memoryOnly = true;
    }
    return state;
  }

  P.game.save = { load, save, reset, get: () => state, isMemoryOnly: () => memoryOnly };
})();
