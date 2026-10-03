/* Succès. Pour en ajouter : P.game.achievements.add({id, icon, name, desc, secret?, test?(ctx)}) */
(function () {
  const P = window.P;
  const save = P.game.save;

  const defs = [
    { id: 'first', icon: '🖱️', name: 'Premier clic', desc: 'Tu as cliqué.', test: (c) => c.total >= 1 },
    { id: 'ten', icon: '🤨', name: 'Mauvaise idée', desc: '10 clics.', test: (c) => c.total >= 10 },
    { id: 'hundred', icon: '🤦', name: 'Pourquoi ?', desc: '100 clics.', test: (c) => c.total >= 100 },
    { id: 'thousand', icon: '💀', name: "Tu n'as vraiment rien d'autre à faire ?", desc: '1 000 clics.', test: (c) => c.total >= 1000 },
    { id: 'tenk', icon: '🧠', name: 'Détermination', desc: '10 000 clics.', test: (c) => c.total >= 10000 },
    { id: 'sixtynine', icon: '🗿', name: 'Le bouton', desc: 'Cliquer exactement 69 fois.', test: (c) => c.total === 69 },
    { id: 'stop', icon: '🚫', name: 'Il fallait arrêter', desc: 'Cliquer après que le jeu demande de s’arrêter.', test: (c) => c.afterStop },
    { id: 'watching', icon: '👁️', name: 'Il te regarde', desc: 'Déclencher un événement secret.', secret: true },
    { id: 'allsecrets', icon: '❓', name: 'Pourquoi ?', desc: 'Découvrir tous les secrets.', secret: true },
    { id: 'dodged', icon: '💨', name: 'Trop lent', desc: 'Se faire esquiver par le bouton.' },
    { id: 'night', icon: '🌙', name: 'Insomniaque', desc: 'Cliquer entre minuit et 5 h.', test: () => new Date().getHours() < 5 },
    { id: 'chaos', icon: '🎲', name: 'Pas de chance', desc: 'Déclencher 10 événements.', test: () => save.get().events >= 10 },
  ];

  const isUnlocked = (id) => !!save.get().achievements[id];
  const unlockedCount = () => defs.filter((d) => isUnlocked(d.id)).length;

  function unlock(id) {
    const def = defs.find((d) => d.id === id);
    if (!def || isUnlocked(id)) return false;
    save.get().achievements[id] = Date.now();
    save.save();
    P.game.sound.play('achievement');
    P.ui.achievementPopup.show(def);
    return true;
  }

  function check(ctx) {
    for (const d of defs) {
      if (d.test && !isUnlocked(d.id) && d.test(ctx)) unlock(d.id);
    }
  }

  P.game.achievements = {
    list: () => defs,
    add: (def) => defs.push(def),
    isUnlocked, unlockedCount, total: () => defs.length, unlock, check,
  };
})();
