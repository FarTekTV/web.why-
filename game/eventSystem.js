/* Événements aléatoires. Pour en ajouter : P.game.events.add({id, weight, minPhase, run(ctx)}) */
(function () {
  const P = window.P;
  const U = P.util;
  const save = P.game.save;
  const defs = [];
  let clicksSince = 0;
  let lastCtx = { total: 0, phase: 1 };

  const ui = () => P.ui;
  const snd = () => P.game.sound;

  function add(def) { defs.push(def); }

  function run(def, ctx) {
    clicksSince = 0;
    const s = save.get();
    P.game.stats.recordEvent();
    s.eventsSeen[def.id] = (s.eventsSeen[def.id] || 0) + 1;
    save.save();
    def.run(ctx || lastCtx);
  }

  function runById(id) {
    const def = defs.find((d) => d.id === id);
    if (def) run(def);
  }

  function maybeTrigger(ctx) {
    lastCtx = ctx;
    clicksSince++;
    if (ui().overlay.isOpen() || clicksSince < 4) return;
    const chance = Math.min(0.28, 0.06 + ctx.phase * 0.04);
    if (Math.random() > chance) return;
    const pool = defs.filter((d) => (d.weight || 0) > 0 && ctx.phase >= (d.minPhase || 1));
    if (pool.length) run(U.pickWeighted(pool), ctx);
  }

  /* --- Phase 2 --- */
  add({ id: 'rien', weight: 3, minPhase: 2, run() {
    ui().notifications.toast('Événement aléatoire : rien.');
  } });
  add({ id: 'panique', weight: 3, minPhase: 2, run() {
    ui().button.tremble(3000);
    snd().play('panic');
    ui().hud.showMessage('Le bouton panique.');
  } });
  add({ id: 'teleportation', weight: 3, minPhase: 2, run() {
    ui().button.teleport();
    snd().play('teleport');
    ui().hud.showMessage('Pouf.');
  } });

  /* --- Phase 3 --- */
  add({ id: 'mensonge', weight: 2, minPhase: 3, run(ctx) {
    ui().hud.flashCount('Clics : ' + (ctx.total + 1), 4500);
    ui().hud.showMessage('Clics : ' + (ctx.total + 1) + '. Alors qu’il n’y en a eu que ' + ctx.total + '.');
  } });
  add({ id: 'rebellion', weight: 2, minPhase: 3, run() {
    ui().button.setLabel('CLIQUE-MOI', 4000);
    ui().hud.showMessage('Non.');
    snd().play('no');
  } });
  add({ id: 'dieu', weight: 1, minPhase: 3, run() {
    snd().play('god');
    ui().overlay.black('Pourquoi m’as-tu réveillé ?', 3800);
  } });
  add({ id: 'glitch', weight: 2, minPhase: 3, run() {
    ui().hud.glitch(1400);
    snd().play('glitch');
  } });
  add({ id: 'absurde', weight: 2, minPhase: 3, run(ctx) {
    ui().hud.flashCount(U.pick(['∞ clics', 'NaN clics', '-3 clics', (ctx.total * 1000).toLocaleString('fr-FR') + ' clics (environ)', '♥ clics', 'beaucoup de clics']), 2000);
    snd().play('blip');
  } });

  /* --- Phase 4 : faux bugs, purement visuels --- */
  add({ id: 'recul', weight: 2, minPhase: 4, run(ctx) {
    const step = Math.max(1, Math.ceil(ctx.total * 0.04));
    for (let i = 1; i <= 6; i++) {
      setTimeout(() => ui().hud.flashCount(Math.max(0, ctx.total - i * step) + ' clics', 380), i * 260);
    }
    setTimeout(() => ui().hud.showMessage('Je plaisantais.'), 2000);
  } });
  add({ id: 'disparition', weight: 2, minPhase: 4, run() {
    ui().button.hide(2600);
    ui().hud.showMessage('Où est le bouton ?');
    setTimeout(() => ui().hud.showMessage('Ah, le voilà.'), 2700);
  } });
  add({ id: 'noir', weight: 1, minPhase: 4, run() {
    ui().overlay.black('', 2500).closed.then(() => ui().hud.showMessage('Tu as eu peur ?'));
  } });
  add({ id: 'chargement', weight: 2, minPhase: 4, run() {
    ui().overlay.loader({ title: 'Chargement du bouton…', stuck: 'Presque terminé…', final: 'Chargement terminé. Il n’y avait rien à charger.' })
      .closed.then(() => ui().hud.showMessage('Voilà. Ça valait le coup.'));
  } });
  add({ id: 'maj', weight: 2, minPhase: 4, run() {
    ui().overlay.loader({ title: 'Mise à jour du bouton vers la version 2.0…', stuck: 'Installation de 0 nouveauté…', final: 'Mise à jour terminée. Rien n’a changé.' })
      .closed.then(() => ui().hud.showMessage('Le bouton te remercie de ta patience.'));
  } });
  add({ id: 'erreur', weight: 2, minPhase: 4, run() {
    snd().play('error');
    ui().overlay.popup({ title: 'Erreur 418', text: 'Le bouton est une théière.', note: '(Fausse erreur. Rien n’est cassé.)', button: 'OK' })
      .closed.then(() => ui().hud.showMessage('Tout va bien. Probablement.'));
  } });
  add({ id: 'crash', weight: 1, minPhase: 4, run() {
    snd().play('error');
    ui().overlay.crash().closed.then(() => ui().hud.showMessage('Je plaisante. Le jeu va très bien.'));
  } });

  /* --- Déclenché par un secret (poids 0 : jamais tiré au hasard) --- */
  add({ id: 'cheat', weight: 0, minPhase: 1, run() {
    snd().play('secret');
    ui().overlay.black('CHEAT CODE ACTIVÉ', 2200).closed.then(() => ui().hud.showMessage('Effet obtenu : aucun.'));
  } });

  P.game.events = { add, maybeTrigger, runById, list: () => defs, reset: () => { clicksSince = 0; } };
})();
