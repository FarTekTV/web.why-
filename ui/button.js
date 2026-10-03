/* Le gros bouton : libellé, position, taille, rotation, esquive, tremblement. */
(function () {
  const P = window.P;
  const U = P.util;
  let el, label, arena;
  let phase = 1;
  let st = { x: 0, y: 0, rot: 0, sc: 1 };
  let dodgeStreak = 0;
  let labelToken = 0;
  let baseLabel = 'CLIQUER';

  const LABELS = {
    3: ['NE PAS CLIQUER', 'CLIQUE ICI', 'DERNIÈRE CHANCE', 'VRAIMENT ?', 'NON', '...', '???', 'ARRÊTE'],
    4: ['POURQUOI ?', 'OK', 'ALLEZ', 'ENCORE', '???', '...', 'NON', 'CLIQUER (ENCORE)', 'ARRÊTE'],
  };

  function apply() {
    el.style.setProperty('--bx', st.x.toFixed(1) + 'px');
    el.style.setProperty('--by', st.y.toFixed(1) + 'px');
    el.style.setProperty('--rot', st.rot.toFixed(1) + 'deg');
    el.style.setProperty('--sc', st.sc.toFixed(2));
  }

  function bounds() {
    const a = arena.getBoundingClientRect();
    const bw = el.offsetWidth * st.sc;
    const bh = el.offsetHeight * st.sc;
    return { mx: Math.max(0, (a.width - bw) / 2 - 6), my: Math.max(0, (a.height - bh) / 2 - 6) };
  }

  function teleport() {
    const b = bounds();
    st.x = U.rand(-b.mx, b.mx);
    st.y = U.rand(-b.my, b.my);
    apply();
    el.classList.add('snap');
    setTimeout(() => el.classList.remove('snap'), 350);
  }

  function setLabel(text, ms) {
    const token = ++labelToken;
    label.textContent = text;
    if (ms) {
      setTimeout(() => {
        if (token === labelToken) label.textContent = baseLabel;
      }, ms);
    } else {
      baseLabel = text;
    }
  }

  /* Fait évoluer l'apparence du bouton à chaque clic selon la phase. */
  function evolve(p) {
    phase = p;
    const b = bounds();
    if (p === 1) {
      st = { x: 0, y: 0, rot: 0, sc: 1 };
    } else if (p === 2) {
      st.x = U.clamp(st.x + U.rand(-26, 26), -b.mx, b.mx);
      st.y = U.clamp(st.y + U.rand(-14, 14), -b.my, b.my);
      st.rot = U.rand(-2.5, 2.5);
      st.sc = 1;
    } else {
      st.sc = U.rand(p === 3 ? 0.6 : 0.5, 1.3);
      const b2 = bounds();
      st.x = U.rand(-b2.mx, b2.mx);
      st.y = U.rand(-b2.my, b2.my);
      st.rot = U.rand(p === 3 ? -9 : -26, p === 3 ? 9 : 26);
    }
    apply();
    if (p >= 3 && Math.random() < 0.6) setLabel(U.pick(LABELS[p]));
    else if (p < 3) setLabel('CLIQUER');
  }

  function press() {
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    dodgeStreak = 0;
  }

  function tremble(ms) {
    el.classList.add('tremble');
    setTimeout(() => el.classList.remove('tremble'), ms);
  }

  function hide(ms) {
    el.classList.add('gone');
    setTimeout(() => el.classList.remove('gone'), ms);
  }

  /* Esquive à la souris (jamais deux fois de suite) pour que le jeu reste jouable. */
  function onEnter(e) {
    if (e.pointerType !== 'mouse' || phase < 3 || el.classList.contains('gone')) return;
    if (dodgeStreak >= 2 || Math.random() > 0.3) { dodgeStreak = 0; return; }
    dodgeStreak++;
    teleport();
    P.game.stats.recordDodge();
    P.game.sound.play('dodge');
    P.game.achievements.unlock('dodged');
    P.ui.hud.showMessage(U.pick(['Raté.', 'Trop lent.', 'Non, par là.', 'Ici.']));
  }

  function init() {
    el = document.getElementById('big');
    label = document.getElementById('big-label');
    arena = document.getElementById('arena');
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('animationend', (e) => {
      if (e.animationName === 'ripple') el.classList.remove('pop');
    });
    el.addEventListener('click', () => P.game.click.onClick());
    apply();
  }

  function reset() {
    st = { x: 0, y: 0, rot: 0, sc: 1 };
    phase = 1;
    baseLabel = 'CLIQUER';
    labelToken++;
    label.textContent = 'CLIQUER';
    el.classList.remove('tremble', 'gone', 'pop');
    apply();
  }

  P.ui.button = { init, reset, press, evolve, setLabel, tremble, teleport, hide, el: () => el };
})();
