/* Panneau Statistiques / Succès / Réglages, bouton de son et remise à zéro (avec confirmation dans la page). */
(function () {
  const P = window.P;
  const h = P.util.h;
  let host;
  let soundBtn;
  let lastFocus = null;

  const TABS = [
    { id: 'stats', label: 'Statistiques' },
    { id: 'achievements', label: 'Succès' },
    { id: 'settings', label: 'Réglages' },
  ];

  function updateSoundButton() {
    soundBtn.textContent = P.game.sound.isEnabled() ? '🔊 Son : ON' : '🔇 Son : OFF';
    soundBtn.setAttribute('aria-pressed', String(P.game.sound.isEnabled()));
  }

  function updateAchievementCount() {
    const el = document.getElementById('btn-ach-count');
    if (el) el.textContent = P.game.achievements.unlockedCount() + '/' + P.game.achievements.total();
  }

  function statsView() {
    const dl = h('dl', { class: 'stats' });
    P.game.stats.summary().forEach(([k, v]) => dl.append(h('div', { class: 'stat' }, h('dt', { text: k }), h('dd', { text: v }))));
    return dl;
  }

  function achievementsView() {
    const A = P.game.achievements;
    const ul = h('ul', { class: 'ach-list' });
    A.list().forEach((d) => {
      const got = A.isUnlocked(d.id);
      const hidden = !got && d.secret;
      ul.append(h('li', { class: 'ach-row' + (got ? '' : ' locked') },
        h('span', { class: 'ach-icon', 'aria-hidden': 'true', text: got ? d.icon : '🔒' }),
        h('span', { class: 'ach-body' },
          h('span', { class: 'ach-name', text: hidden ? '???' : d.name }),
          h('span', { class: 'ach-desc', text: hidden ? 'Succès secret.' : d.desc }))));
    });
    const S = P.game.secrets;
    const hints = h('div', { class: 'hints' },
      h('p', { class: 'hints-title', text: 'Secrets : ' + S.foundCount() + ' / ' + S.total() }),
      h('ul', null, S.list().map((d) => h('li', { class: S.isFound(d.id) ? 'got' : '', text: S.isFound(d.id) ? d.hint + ' (trouvé)' : d.hint }))));
    return h('div', null, ul, hints);
  }

  function settingsView(rerender) {
    const wrap = h('div', { class: 'settings' });
    const soundRow = h('button', { class: 'row-btn', type: 'button', onclick: () => {
      P.game.sound.setEnabled(!P.game.sound.isEnabled());
      updateSoundButton();
      rerender();
    } }, 'Son : ', h('strong', { text: P.game.sound.isEnabled() ? 'activé' : 'désactivé' }));
    const resetBox = h('div', { class: 'reset' });
    const askBtn = h('button', { class: 'row-btn danger', type: 'button', text: 'Réinitialiser ma progression' });
    askBtn.addEventListener('click', () => {
      resetBox.replaceChildren(
        h('p', { class: 'reset-q', text: 'Effacer tous tes clics, succès et secrets ? Le bouton s’en souviendra quand même.' }),
        h('div', { class: 'reset-actions' },
          h('button', { class: 'row-btn danger', type: 'button', text: 'Oui, tout effacer', onclick: () => { close(); P.main.restart(); } }),
          h('button', { class: 'row-btn', type: 'button', text: 'Annuler', onclick: () => rerender() })));
    });
    resetBox.append(askBtn);
    const note = P.game.save.isMemoryOnly()
      ? h('p', { class: 'muted', text: 'Le stockage du navigateur est indisponible : la progression ne sera pas conservée.' })
      : h('p', { class: 'muted', text: 'La progression est enregistrée dans ce navigateur.' });
    wrap.append(soundRow, resetBox, note);
    return wrap;
  }

  function open(tabId) {
    lastFocus = document.activeElement;
    P.game.stats.tick();
    const body = h('div', { class: 'sheet-body' });
    const tabs = h('div', { class: 'tabs', role: 'tablist' });

    function render(id) {
      tabs.replaceChildren(...TABS.map((t) => h('button', {
        class: 'tab', role: 'tab', type: 'button', id: 'tab-' + t.id,
        'aria-selected': String(t.id === id), text: t.label,
        onclick: () => render(t.id),
      })));
      const view = id === 'stats' ? statsView() : id === 'achievements' ? achievementsView() : settingsView(() => render('settings'));
      body.replaceChildren(view);
      body.setAttribute('aria-labelledby', 'tab-' + id);
    }

    const closeBtn = h('button', { class: 'close', type: 'button', 'aria-label': 'Fermer', text: '×', onclick: close });
    const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Panneau du jeu' }, closeBtn, tabs, body);
    sheet.addEventListener('click', (e) => e.stopPropagation());
    host.replaceChildren(sheet);
    host.hidden = false;
    render(tabId || 'stats');
    closeBtn.focus();
  }

  function close() {
    host.hidden = true;
    host.replaceChildren();
    updateAchievementCount();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    host = document.getElementById('panel');
    soundBtn = document.getElementById('btn-sound');
    host.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !host.hidden) close();
    });
    document.getElementById('btn-stats').addEventListener('click', () => open('stats'));
    document.getElementById('btn-ach').addEventListener('click', () => open('achievements'));
    document.getElementById('btn-settings').addEventListener('click', () => open('settings'));
    soundBtn.addEventListener('click', () => {
      P.game.sound.setEnabled(!P.game.sound.isEnabled());
      updateSoundButton();
    });
    updateSoundButton();
    updateAchievementCount();
  }

  P.ui.settings = { init, open, close, refresh: () => { updateSoundButton(); updateAchievementCount(); } };
})();
