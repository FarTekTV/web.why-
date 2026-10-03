/* Point d'entrée : branche les modules et démarre la session. */
(function () {
  const P = window.P;

  function render() {
    const s = P.game.save.get();
    const phase = P.game.click.phaseFor(s.clicks);
    P.ui.hud.setCount(s.clicks);
    P.ui.hud.setPhase(phase);
    P.ui.hud.showMessage(P.game.messages.initial(s));
    P.ui.settings.refresh();
  }

  function boot() {
    P.game.save.load();
    P.game.stats.startSession();
    P.ui.hud.init();
    P.ui.notifications.init();
    P.ui.achievementPopup.init();
    P.ui.overlay.init();
    P.ui.button.init();
    P.ui.settings.init();
    P.game.secrets.init();
    render();
    P.game.save.save();

    document.addEventListener('visibilitychange', () => {
      P.game.stats.tick();
      if (document.hidden) P.game.save.save();
    });
    window.addEventListener('pagehide', () => {
      P.game.stats.tick();
      P.game.save.save();
    });
  }

  function restart() {
    P.game.save.reset();
    P.game.stats.startSession();
    P.game.messages.reset();
    P.game.events.reset();
    P.game.click.reset();
    P.ui.button.reset();
    P.ui.hud.reset();
    render();
    P.game.save.save();
    P.ui.notifications.toast('Progression effacée. Tout recommence.');
  }

  P.main = { boot, restart };
  boot();
})();
