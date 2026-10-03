/* Fenêtre de succès débloqué. Les succès simultanés passent l'un après l'autre. */
(function () {
  const P = window.P;
  const h = P.util.h;
  let host;
  let queue = [];
  let showing = false;

  function init() { host = document.getElementById('ach-host'); }

  function next() {
    const def = queue.shift();
    if (!def) { showing = false; return; }
    showing = true;
    const card = h('div', { class: 'ach', role: 'status' },
      h('span', { class: 'ach-icon', 'aria-hidden': 'true', text: def.icon }),
      h('span', { class: 'ach-body' },
        h('span', { class: 'ach-kicker', text: 'Succès débloqué' }),
        h('span', { class: 'ach-name', text: def.name })));
    host.replaceChildren(card);
    setTimeout(() => {
      card.classList.add('out');
      setTimeout(() => { card.remove(); next(); }, 350);
    }, 3400);
  }

  function show(def) {
    queue.push(def);
    if (!showing) next();
  }

  P.ui.achievementPopup = { init, show };
})();
