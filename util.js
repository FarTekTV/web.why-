/* Utilitaires partagés. Tout le jeu vit dans le namespace window.P */
(function () {
  const P = (window.P = window.P || {});
  P.game = P.game || {};
  P.ui = P.ui || {};

  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function pickWeighted(list) {
    const total = list.reduce((n, d) => n + (d.weight || 1), 0);
    let r = Math.random() * total;
    for (const d of list) {
      r -= d.weight || 1;
      if (r <= 0) return d;
    }
    return list[list.length - 1];
  }

  /* Création de DOM minimale : h('div', {class:'x', onclick: fn}, 'texte', enfant) */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  const reducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  P.util = { rand, randInt, pick, clamp, pickWeighted, h, reducedMotion };
})();
