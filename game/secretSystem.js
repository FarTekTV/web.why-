/* Secrets. Pour en ajouter : P.game.secrets.add({id, hint, msg}) puis P.game.secrets.found(id) depuis n'importe où. */
(function () {
  const P = window.P;
  const save = P.game.save;

  const defs = [
    { id: 'speed', hint: 'Clique très vite.', msg: 'Doucement. Le bouton a le vertige.' },
    { id: 'idle', hint: 'Ne fais rien. Longtemps.', msg: 'Bravo. Tu as réussi à ne rien faire. Le jeu est fier de toi.' },
    { id: 'title', hint: 'Le titre n’est pas décoratif.', msg: 'Ne touche pas au titre. Il est sensible.' },
    { id: 'corner', hint: 'Les coins sont intéressants.', msg: 'Un clic dans un coin. Il n’y avait rien. Évidemment.' },
    { id: 'konami', hint: 'Une combinaison de flèches.', msg: 'Code secret activé. Il ne fait rien. Comme le reste.' },
    { id: 'word', hint: 'Tape le titre au clavier.', msg: 'Tu as tapé le titre. Personne ne te l’a demandé.' },
    { id: 'count', hint: 'Un certain nombre de clics.', msg: 'Erreur 404 : raison de cliquer introuvable.' },
  ];

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  const WORD = 'pourquoi';
  const IDLE_MS = 45000;

  let keyBuffer = [];
  let typed = '';
  let titleTaps = 0;
  let lastActivity = Date.now();

  const isFound = (id) => !!save.get().secrets[id];
  const foundCount = () => defs.filter((d) => isFound(d.id)).length;

  function found(id) {
    const def = defs.find((d) => d.id === id);
    if (!def) return;
    const first = !isFound(id);
    if (first) {
      save.get().secrets[id] = Date.now();
      save.save();
      P.game.sound.play('secret');
      P.ui.notifications.toast('Secret découvert (' + foundCount() + ' / ' + defs.length + ')');
      P.game.achievements.unlock('watching');
      if (foundCount() === defs.length) P.game.achievements.unlock('allsecrets');
    }
    P.ui.hud.showMessage(def.msg);
    if (id === 'konami') P.game.events.runById('cheat');
  }

  function touch() { lastActivity = Date.now(); }

  /* Appelé par le système de clic. */
  function onClick(info) {
    touch();
    if (info.recent.length >= 8) found('speed');
    if (info.total === 404) found('count');
  }

  function init() {
    touch();

    const title = document.getElementById('title');
    title.addEventListener('click', () => {
      titleTaps++;
      if (titleTaps >= 3) { titleTaps = 0; found('title'); }
      else P.ui.hud.showMessage(titleTaps === 1 ? 'Hé.' : 'Arrête de me toucher.');
    });

    document.addEventListener('pointerdown', (e) => {
      touch();
      if (e.target.closest('button, a, input, [role="dialog"]')) return;
      const m = 48;
      const nearX = e.clientX < m || e.clientX > window.innerWidth - m;
      const nearY = e.clientY < m || e.clientY > window.innerHeight - m;
      if (nearX && nearY) found('corner');
    });

    document.addEventListener('keydown', (e) => {
      touch();
      keyBuffer.push(e.key);
      if (keyBuffer.length > KONAMI.length) keyBuffer.shift();
      if (KONAMI.every((k, i) => keyBuffer[i] === k)) { keyBuffer = []; found('konami'); }
      if (e.key.length === 1) {
        typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
        if (typed === WORD) { typed = ''; found('word'); }
      }
    });

    setInterval(() => {
      if (document.hidden || P.ui.overlay.isOpen()) return;
      if (!isFound('idle') && Date.now() - lastActivity > IDLE_MS) found('idle');
    }, 1000);
  }

  P.game.secrets = {
    init, onClick, found, add: (d) => defs.push(d),
    list: () => defs, isFound, foundCount, total: () => defs.length,
  };
})();
