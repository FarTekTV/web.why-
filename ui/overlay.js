/* Fenêtres plein écran : écran noir, faux chargement, fausse erreur, faux plantage.
   Tout est visuel. Un clic ou Échap ferme toujours la fenêtre. */
(function () {
  const P = window.P;
  const h = P.util.h;
  let root;
  let current = null;

  const isOpen = () => !!current;

  function open(content, opts) {
    opts = opts || {};
    if (current) current.close();
    const ov = { timers: [] };
    ov.closed = new Promise((res) => { ov.res = res; });
    ov.close = () => {
      if (current !== ov) return;
      ov.timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
      root.hidden = true;
      root.replaceChildren();
      current = null;
      ov.res();
    };
    ov.later = (fn, ms) => { const t = setTimeout(fn, ms); ov.timers.push(t); return t; };
    ov.every = (fn, ms) => { const t = setInterval(fn, ms); ov.timers.push(t); return t; };
    root.className = 'overlay ' + (opts.cls || '');
    root.replaceChildren(content);
    root.hidden = false;
    current = ov;
    const openedAt = Date.now();
    root.onclick = () => { if (Date.now() - openedAt > 500 && opts.dismissible !== false) ov.close(); };
    if (opts.ms) ov.later(ov.close, opts.ms);
    return ov;
  }

  function black(text, ms) {
    return open(h('p', { class: 'ov-text', text: text || '' }), { cls: 'ov-void', ms });
  }

  function loader(o) {
    const bar = h('span', { class: 'bar-fill' });
    const status = h('p', { class: 'ov-sub', text: '0 %' });
    const box = h('div', { class: 'ov-box' },
      h('p', { class: 'ov-title', text: o.title }),
      h('div', { class: 'bar', role: 'progressbar', 'aria-label': o.title }, bar),
      status);
    const ov = open(box, { cls: 'ov-dim' });
    let pct = 0;
    ov.every(() => {
      pct = Math.min(99, pct + P.util.rand(3, 11));
      bar.style.width = pct + '%';
      status.textContent = Math.floor(pct) + ' %';
      if (pct >= 99) {
        status.textContent = o.stuck || '99 %';
      }
    }, 220);
    ov.later(() => {
      bar.style.width = '100%';
      status.textContent = o.final;
    }, 4200);
    ov.later(ov.close, 6000);
    return ov;
  }

  function popup(o) {
    const ok = h('button', { class: 'win-btn', type: 'button', text: o.button || 'OK' });
    const win = h('div', { class: 'win', role: 'alertdialog', 'aria-label': o.title },
      h('div', { class: 'win-bar', text: o.title }),
      h('div', { class: 'win-body' },
        h('p', { class: 'win-text', text: o.text }),
        o.note ? h('p', { class: 'win-note', text: o.note }) : null,
        ok));
    win.addEventListener('click', (e) => e.stopPropagation());
    const ov = open(win, { cls: 'ov-dim', dismissible: true });
    ok.addEventListener('click', ov.close);
    ok.focus();
    return ov;
  }

  function crash() {
    const box = h('div', { class: 'crash' },
      h('p', { class: 'crash-face', 'aria-hidden': 'true', text: ':(' }),
      h('p', { class: 'ov-title', text: 'Le jeu a rencontré un problème.' }),
      h('p', { class: 'ov-sub', text: 'Code d’arrêt : POURQUOI_PAS' }));
    return open(box, { cls: 'ov-crash', ms: 3600 });
  }

  function init() {
    root = document.getElementById('overlay');
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && current) current.close();
    });
  }

  P.ui.overlay = { init, isOpen, black, loader, popup, crash, close: () => current && current.close() };
})();
