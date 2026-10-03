/* Boucle de clic. Ordre : compteur, sauvegarde, message, animation, succès, événements, stats, sauvegarde. */
(function () {
  const P = window.P;
  const U = P.util;
  const save = P.game.save;

  const phaseFor = (n) => (n < 10 ? 1 : n < 40 ? 2 : n < 150 ? 3 : 4);

  let recent = [];
  let lastWasStop = false;

  function onClick() {
    if (P.ui.overlay.isOpen()) return;

    const s = save.get();
    s.clicks++;
    P.game.stats.recordClick();
    save.save();

    const now = Date.now();
    recent.push(now);
    recent = recent.filter((t) => now - t < 2000);

    const total = s.clicks;
    const phase = phaseFor(total);
    const ctx = { total, phase, session: P.game.stats.sessionClicks(), afterStop: lastWasStop };

    const msg = P.game.messages.pick(ctx);
    lastWasStop = !!msg.stop;

    P.ui.hud.setCount(total);
    P.ui.hud.setPhase(phase);
    P.ui.hud.showMessage(msg.text, { typewriter: phase >= 4 });

    P.ui.button.press();
    P.ui.button.evolve(phase);
    P.game.sound.play('click', phase);

    P.game.achievements.check(ctx);
    P.game.events.maybeTrigger(ctx);
    P.game.secrets.onClick({ recent, total });

    save.save();
  }

  function reset() {
    recent = [];
    lastWasStop = false;
  }

  P.game.click = { onClick, phaseFor, reset };
})();
