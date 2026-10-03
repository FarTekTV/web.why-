/* Compteur, message principal et ambiance visuelle qui dérive avec la phase. */
(function () {
  const P = window.P;
  const U = P.util;
  let countEl, msgEl, centerEl, appEl;
  let flashTimer = null;
  let typeTimer = null;
  let current = 0;

  const formatCount = (n) => n.toLocaleString('fr-FR') + (n > 1 ? ' clics' : ' clic');
  const CURSORS = ['help', 'not-allowed', 'wait', 'crosshair', 'zoom-in', 'grab'];

  function init() {
    countEl = document.getElementById('count');
    msgEl = document.getElementById('message');
    centerEl = document.getElementById('center');
    appEl = document.getElementById('app');
  }

  function setCount(n) {
    current = n;
    clearTimeout(flashTimer);
    countEl.textContent = formatCount(n);
  }

  /* Affiche un faux compteur un instant, puis revient à la vraie valeur. */
  function flashCount(text, ms) {
    clearTimeout(flashTimer);
    countEl.textContent = text;
    flashTimer = setTimeout(() => { countEl.textContent = formatCount(current); }, ms || 1500);
  }

  function showMessage(text, opts) {
    clearInterval(typeTimer);
    msgEl.classList.remove('swap');
    void msgEl.offsetWidth;
    msgEl.classList.add('swap');
    if (opts && opts.typewriter && !U.reducedMotion() && text.length > 0) {
      const perChar = Math.min(34, 900 / text.length);
      let i = 0;
      msgEl.textContent = '';
      typeTimer = setInterval(() => {
        i++;
        msgEl.textContent = text.slice(0, i);
        if (i >= text.length) clearInterval(typeTimer);
      }, perChar);
    } else {
      msgEl.textContent = text;
    }
  }

  function setPhase(phase) {
    document.documentElement.dataset.phase = String(phase);
    if (phase >= 2) {
      const range = phase === 2 ? 25 : phase === 3 ? 90 : 160;
      centerEl.style.setProperty('--hue', Math.round(U.rand(-range, range)) + 'deg');
    } else {
      centerEl.style.setProperty('--hue', '0deg');
    }
    centerEl.style.cursor = phase >= 3 ? U.pick(CURSORS) : '';
  }

  function pulse(cls, ms) {
    appEl.classList.add(cls);
    setTimeout(() => appEl.classList.remove(cls), ms);
  }

  const glitch = (ms) => pulse('glitch', ms || 1200);
  const shake = (ms) => pulse('shake', ms || 500);

  function reset() {
    clearTimeout(flashTimer);
    clearInterval(typeTimer);
    setPhase(1);
    document.documentElement.dataset.phase = '1';
  }

  P.ui.hud = { init, setCount, flashCount, showMessage, setPhase, glitch, shake, reset };
})();
