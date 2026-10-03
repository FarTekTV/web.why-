/* Messages. Pour en ajouter : P.game.messages.add(phase, texte | {t, stop, next} | fonction(ctx)) */
(function () {
  const P = window.P;
  const U = P.util;

  /* Phase 1 : normal. Phase 2 : le site réagit. Phase 3 : le bouton se rebelle. Phase 4 : le jeu devient bizarre. */
  const pools = {
    1: [
      'Pourquoi ?',
      'Tu viens vraiment de cliquer.',
      "C'était pourtant écrit de ne pas cliquer.",
      'Félicitations. Tu as cliqué.',
      'Voilà. Content ?',
      "Rien ne s'est passé.",
      'Absolument rien.',
      'Tu pouvais faire autre chose.',
      'Ton clic a été enregistré. Malheureusement.',
      'Encore ? Sérieusement ?',
      (c) => c.total + (c.total > 1 ? ' clics.' : ' clic.'),
    ],
    2: [
      'Tu sais que tu peux arrêter ?',
      'Le bouton commence à te connaître.',
      { t: 'Arrête de cliquer.', stop: true },
      'Encore ? Sérieusement ?',
      (c) => 'Déjà ' + c.total + ' clics. Personne ne te juge. Enfin si.',
      "Tu cherches quelque chose ? Il n'y a rien.",
      'Le bouton a bougé. Tu as halluciné.',
      'Tu fais ça souvent ?',
      'Continue. Ne rien accomplir demande de la constance.',
      'Ton clic a été enregistré. Malheureusement.',
    ],
    3: [
      'Le bouton te regarde.',
      'Je pense que tu as un problème.',
      (c) => 'Tu as cliqué ' + c.total + ' fois sur un bouton sans raison.',
      'Le bouton refuse désormais de coopérer.',
      'Pourquoi tu continues ?',
      { t: 'Je vais prévenir quelqu’un.', next: 'Trop tard.' },
      'Le bouton a changé d’avis.',
      'Attention : les clics sont dangereux.',
      'Ton clic a été signalé à un comité. Il n’existe pas.',
      'Le bouton a demandé un avocat.',
      'Chaque clic réduit ton espérance de vie de 0,0000 seconde.',
      { t: 'Arrête.', stop: true },
      'Le bouton demande une augmentation.',
      'Ce clic a été classé dangereux. Par moi.',
    ],
    4: [
      'Pourquoi tu joues encore ?',
      () => {
        const d = new Date();
        const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        return 'Il est ' + hm + '. Va dormir.';
      },
      "Tu pensais vraiment que j'allais continuer normalement ?",
      'Ce jeu n’a pas de fin. Ni de début, d’ailleurs.',
      'Un développeur a passé des semaines là-dessus. Pour un bouton.',
      'Tu es toujours là ? Moi aussi, malheureusement.',
      (c) => c.total.toLocaleString('fr-FR') + ' clics au total. Tu comptes ?',
      { t: 'Dernier avertissement. Je plaisante, il n’y en a pas.', stop: true },
      { t: 'Je pourrais te dire pourquoi.', next: 'Mais je ne sais pas.' },
      'Le quatrième mur te salue.',
      'Tu pourrais appeler quelqu’un. Ou dormir. Ou les deux.',
    ],
  };

  /* Messages imposés pour un nombre de clics précis. */
  const scripted = {
    1: 'Pourquoi ?',
    2: 'Tu viens vraiment de cliquer.',
    3: "C'était pourtant écrit de ne pas cliquer.",
    7: '7 clics.',
    10: 'Dix clics. Ça devient une habitude.',
    37: 'Tu as cliqué 37 fois sur un bouton sans raison.',
    50: 'Cinquante. Un demi-centenaire de clics inutiles.',
    69: 'Nice.',
    100: "Cent clics. Un petit pas pour toi, aucun pour l'humanité.",
    150: "Tu pensais vraiment que j'allais continuer normalement ?",
    404: 'Erreur 404 : raison de cliquer introuvable.',
    500: 'Cinq cents. Le bouton prend des notes.',
    1000: 'Mille clics. Mille fois pourquoi.',
    5000: 'Cinq mille. On ne peut plus parler de hasard.',
    10000: 'Dix mille. Le bouton te doit un café.',
  };

  let forced = [];
  let recent = [];

  function normalize(entry, ctx) {
    const v = typeof entry === 'function' ? entry(ctx) : entry;
    return typeof v === 'string' ? { text: v } : { text: v.t, stop: !!v.stop, next: v.next };
  }

  function pick(ctx) {
    if (forced.length) {
      const text = forced.shift();
      recent.push(text);
      return { text };
    }
    let msg;
    if (scripted[ctx.total]) {
      msg = { text: scripted[ctx.total] };
    } else {
      for (let tries = 0; tries < 8; tries++) {
        const phase = Math.random() < 0.25 && ctx.phase > 1 ? U.randInt(1, ctx.phase - 1) : ctx.phase;
        msg = normalize(U.pick(pools[phase]), ctx);
        if (!recent.includes(msg.text)) break;
      }
    }
    if (msg.next) forced.push(msg.next);
    recent.push(msg.text);
    if (recent.length > 8) recent.shift();
    return msg;
  }

  function initial(state) {
    if (!state.clicks) return "Tu n'as aucune raison de cliquer ici.";
    if (state.sessions > 1) return 'Te revoilà. ' + state.clicks.toLocaleString('fr-FR') + ' clics au compteur. Aucun regret ?';
    return 'Tu n’as aucune raison de cliquer ici.';
  }

  function add(phase, entry) {
    (pools[phase] = pools[phase] || []).push(entry);
  }

  P.game.messages = { pick, initial, add, forceNext: (t) => forced.push(t), reset: () => { forced = []; recent = []; } };
})();
