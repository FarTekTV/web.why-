/* Petites notifications éphémères. */
(function () {
  const P = window.P;
  const h = P.util.h;
  let host;

  function init() { host = document.getElementById('toasts'); }

  function toast(text, ms) {
    if (!host) return;
    while (host.children.length >= 3) host.firstChild.remove();
    const t = h('div', { class: 'toast', text });
    host.append(t);
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => t.remove(), 350);
    }, ms || 3200);
  }

  P.ui.notifications = { init, toast };
})();
