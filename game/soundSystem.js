/* Sons synthétisés (Web Audio). Aucun fichier audio, volume général bas,
   et rien ne démarre avant un geste du joueur. */
(function () {
  const P = window.P;
  const save = P.game.save;
  let ctx = null;
  let master = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.12;
      master.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  const enabled = () => save.get().sound;

  function tone(freq, dur, type, vol, slide, delay) {
    if (!enabled()) return;
    const c = ensure();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    const t = c.currentTime + (delay || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.5, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  const sounds = {
    click(phase) {
      const base = 420 - (phase || 1) * 40 + Math.random() * 50;
      tone(base, 0.08, 'triangle', 0.6, -140);
    },
    achievement() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.5, 0, i * 0.09));
    },
    secret() {
      [392, 330, 392, 262].forEach((f, i) => tone(f, 0.14, 'square', 0.25, 0, i * 0.1));
    },
    panic() {
      for (let i = 0; i < 8; i++) tone(300 + (i % 2) * 90, 0.06, 'square', 0.25, 0, i * 0.07);
    },
    teleport() {
      tone(240, 0.22, 'sine', 0.5, 700);
    },
    dodge() {
      tone(700, 0.12, 'sawtooth', 0.25, -450);
    },
    no() {
      tone(180, 0.18, 'sawtooth', 0.4, -60);
      tone(150, 0.22, 'sawtooth', 0.4, -50, 0.16);
    },
    god() {
      tone(65, 1.4, 'sine', 0.9, -20);
      tone(98, 1.2, 'sine', 0.4, 0, 0.1);
    },
    glitch() {
      for (let i = 0; i < 6; i++) tone(100 + Math.random() * 900, 0.04, 'square', 0.2, 0, i * 0.045);
    },
    error() {
      tone(220, 0.16, 'square', 0.35, -80);
      tone(165, 0.24, 'square', 0.35, -60, 0.17);
    },
    blip() {
      tone(880, 0.07, 'sine', 0.4);
      tone(1175, 0.09, 'sine', 0.4, 0, 0.08);
    },
    toggle() {
      tone(600, 0.06, 'triangle', 0.4);
    },
  };

  function play(name, arg) {
    const fn = sounds[name];
    if (fn) fn(arg);
  }

  function setEnabled(on) {
    save.get().sound = !!on;
    save.save();
    if (on) play('toggle');
  }

  P.game.sound = { play, setEnabled, isEnabled: enabled };
})();
