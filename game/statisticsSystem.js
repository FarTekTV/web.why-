/* Statistiques : temps de jeu, sessions, événements, esquives, record de session. */
(function () {
  const P = window.P;
  const save = P.game.save;
  let sessionClicks = 0;
  let lastTick = Date.now();

  function startSession() {
    save.get().sessions++;
    sessionClicks = 0;
    lastTick = Date.now();
  }

  function tick() {
    const now = Date.now();
    const delta = Math.min(now - lastTick, 10000);
    lastTick = now;
    if (!document.hidden) save.get().timeMs += delta;
  }

  function recordClick() {
    sessionClicks++;
    const s = save.get();
    if (sessionClicks > s.bestSession) s.bestSession = sessionClicks;
  }
  const recordEvent = () => { save.get().events++; };
  const recordDodge = () => { save.get().dodges++; };

  function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h) return h + ' h ' + String(m).padStart(2, '0') + ' min';
    if (m) return m + ' min ' + String(s).padStart(2, '0') + ' s';
    return s + ' s';
  }

  function summary() {
    tick();
    const s = save.get();
    const a = P.game.achievements;
    return [
      ['Clics au total', s.clicks.toLocaleString('fr-FR')],
      ['Sessions', s.sessions.toLocaleString('fr-FR')],
      ['Succès débloqués', a.unlockedCount() + ' / ' + a.total()],
      ['Événements déclenchés', s.events.toLocaleString('fr-FR')],
      ['Esquives du bouton', s.dodges.toLocaleString('fr-FR')],
      ['Temps passé à ne rien faire', formatTime(s.timeMs)],
      ['Record en une session', s.bestSession.toLocaleString('fr-FR') + ' clics'],
      ['Secrets trouvés', P.game.secrets.foundCount() + ' / ' + P.game.secrets.total()],
    ];
  }

  setInterval(() => {
    tick();
    save.save();
  }, 5000);

  P.game.stats = {
    startSession, tick, recordClick, recordEvent, recordDodge,
    sessionClicks: () => sessionClicks, formatTime, summary,
  };
})();
