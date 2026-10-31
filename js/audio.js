/* NEON-8 · audio: synthesized chiptune SFX + a tiny tracker */
(function () {
  const N = window.NEON;
  const S = N.Store.data.settings;
  let ctx = null, master, comp, musicBus, sfxBus, noiseBuf, waves = {};

  const NOTE = {};
  (() => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    for (let o = 0; o < 9; o++) names.forEach((n, i) => { NOTE[n + o] = 440 * Math.pow(2, (o * 12 + i - 57) / 12); });
    // flats
    Object.assign(NOTE, { Bb1: NOTE['A#1'], Bb2: NOTE['A#2'], Bb3: NOTE['A#3'], Bb4: NOTE['A#4'], Bb5: NOTE['A#5'], Eb4: NOTE['D#4'], Eb5: NOTE['D#5'] });
  })();
  const f = (n) => (typeof n === 'number' ? n : NOTE[n] || 440);

  function pulseWave(duty) {
    const n = 48, real = new Float32Array(n), imag = new Float32Array(n);
    for (let i = 1; i < n; i++) real[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
    return ctx.createPeriodicWave(real, imag);
  }

  // iOS only lets sound start inside a tap's touchend/click (the pads cancel those), and it can leave
  // the context 'interrupted' rather than 'suspended'; a silent one-sample blip inside the gesture unlocks it
  let unlocked = false;
  function unlock() {
    if (!ctx || document.hidden) return;
    if (ctx.state !== 'running') ctx.resume();
    if (!unlocked) { unlocked = true; const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0); }
  }
  ['touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => { init(); unlock(); }, true));
  function init() {
    if (ctx) { if (ctx.state !== 'running' && !document.hidden) ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    // iPhones route Web Audio through the "ambient" channel, which the ring/silent switch mutes;
    // ask for "playback" the way a game does, so sound plays like a video would (Safari 16.4+)
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = S.volume;
    musicBus = ctx.createGain(); musicBus.gain.value = S.music ? 0.55 : 0;
    sfxBus = ctx.createGain(); sfxBus.gain.value = S.sfx ? 0.9 : 0;
    musicBus.connect(master); sfxBus.connect(master); master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    waves.p12 = pulseWave(0.125); waves.p25 = pulseWave(0.25); waves.p50 = pulseWave(0.5);
    if (pendingTrack) { const t = pendingTrack; pendingTrack = null; Music.play(t); }
  }

  /* ---------- voices ---------- */
  function tone(bus, { wave = 'p25', freq = 440, to = null, t = 0, dur = 0.1, vol = 0.3, attack = 0.004, release = 0.04, vib = 0, curve = 'exp', filter = 0 }) {
    if (!ctx) return;
    const t0 = ctx.currentTime + t;
    const o = ctx.createOscillator();
    if (waves[wave]) o.setPeriodicWave(waves[wave]); else o.type = wave;
    o.frequency.setValueAtTime(f(freq), t0);
    if (to != null) {
      if (curve === 'exp') o.frequency.exponentialRampToValueAtTime(Math.max(20, f(to)), t0 + dur);
      else o.frequency.linearRampToValueAtTime(f(to), t0 + dur);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.setValueAtTime(vol, t0 + Math.max(attack, dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let last = o;
    if (vib) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 6; lg.gain.value = vib; lfo.connect(lg); lg.connect(o.detune);
      lfo.start(t0); lfo.stop(t0 + dur + 0.05);
    }
    if (filter) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filter; last.connect(lp); last = lp; }
    last.connect(g); g.connect(bus);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  function noise(bus, { t = 0, dur = 0.1, vol = 0.3, type = 'highpass', freq = 1000, to = null, q = 0.8, attack = 0.002 }) {
    if (!ctx) return;
    const t0 = ctx.currentTime + t;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(freq, t0); fl.Q.value = q;
    if (to != null) fl.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(fl); fl.connect(g); g.connect(bus);
    src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.05);
  }

  /* ---------- sound effects ---------- */
  const SFX = {
    blip: () => tone(sfxBus, { wave: 'p12', freq: 660, dur: 0.045, vol: 0.18 }),
    select: () => { tone(sfxBus, { wave: 'p25', freq: 880, dur: 0.05, vol: 0.2 }); tone(sfxBus, { wave: 'p25', freq: 1320, t: 0.05, dur: 0.08, vol: 0.2 }); },
    back: () => { tone(sfxBus, { wave: 'p25', freq: 660, dur: 0.05, vol: 0.18 }); tone(sfxBus, { wave: 'p25', freq: 440, t: 0.05, dur: 0.08, vol: 0.18 }); },
    jump: () => tone(sfxBus, { wave: 'p50', freq: 220, to: 620, dur: 0.14, vol: 0.14 }),
    djump: () => tone(sfxBus, { wave: 'p25', freq: 400, to: 1100, dur: 0.12, vol: 0.13 }),
    land: () => noise(sfxBus, { dur: 0.05, vol: 0.08, type: 'lowpass', freq: 600 }),
    coin: () => { tone(sfxBus, { wave: 'p25', freq: 'B5', dur: 0.07, vol: 0.2 }); tone(sfxBus, { wave: 'p25', freq: 'E6', t: 0.07, dur: 0.28, vol: 0.2, release: 0.2 }); },
    open: () => ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => tone(sfxBus, { wave: 'p25', freq: n, t: i * 0.04, dur: 0.06, vol: 0.16 })),
    close: () => ['C6', 'G5', 'E5', 'C5'].forEach((n, i) => tone(sfxBus, { wave: 'p25', freq: n, t: i * 0.035, dur: 0.05, vol: 0.13 })),
    error: () => tone(sfxBus, { wave: 'p50', freq: 110, dur: 0.25, vol: 0.18, vib: 40 }),
    ach: () => {
      ['G5', 'C6', 'E6', 'G6'].forEach((n, i) => tone(sfxBus, { wave: 'p25', freq: n, t: i * 0.08, dur: 0.09, vol: 0.18 }));
      ['C6', 'E6', 'G6'].forEach((n) => tone(sfxBus, { wave: 'p12', freq: n, t: 0.34, dur: 0.6, vol: 0.12, vib: 18, release: 0.4 }));
    },
    meow: () => {
      tone(sfxBus, { wave: 'triangle', freq: 620, to: 1050, dur: 0.12, vol: 0.3, curve: 'lin' });
      tone(sfxBus, { wave: 'triangle', freq: 1050, to: 560, t: 0.12, dur: 0.28, vol: 0.3, vib: 30, curve: 'lin' });
    },
    door: () => { noise(sfxBus, { dur: 0.16, vol: 0.2, type: 'lowpass', freq: 900, to: 200 }); tone(sfxBus, { wave: 'sine', freq: 90, to: 50, dur: 0.15, vol: 0.3 }); },
    type: () => noise(sfxBus, { dur: 0.025, vol: 0.06 + Math.random() * 0.04, freq: 3000 + Math.random() * 3000 }),
    talk: () => tone(sfxBus, { wave: 'p25', freq: 420 + Math.random() * 260, dur: 0.035, vol: 0.07 }),
    hit: () => noise(sfxBus, { dur: 0.09, vol: 0.22, type: 'bandpass', freq: 1400 }),
    bounce: () => tone(sfxBus, { wave: 'triangle', freq: 520, dur: 0.05, vol: 0.25 }),
    brick: () => { tone(sfxBus, { wave: 'p25', freq: 700 + Math.random() * 400, dur: 0.05, vol: 0.14 }); noise(sfxBus, { dur: 0.05, vol: 0.08, freq: 2500 }); },
    laser: () => tone(sfxBus, { wave: 'p12', freq: 1400, to: 300, dur: 0.11, vol: 0.12 }),
    explode: () => noise(sfxBus, { dur: 0.45, vol: 0.35, type: 'lowpass', freq: 2200, to: 80 }),
    power: () => { tone(sfxBus, { wave: 'p50', freq: 80, to: 1200, dur: 0.5, vol: 0.12 }); noise(sfxBus, { t: 0.45, dur: 0.3, vol: 0.12, freq: 4000 }); },
    powerup: () => ['C5', 'G5', 'C6', 'E6', 'G6', 'C7'].forEach((n, i) => tone(sfxBus, { wave: 'p25', freq: n, t: i * 0.05, dur: 0.06, vol: 0.14 })),
    gameover: () => ['G4', 'E4', 'C4', 'G3'].forEach((n, i) => tone(sfxBus, { wave: 'p50', freq: n, t: i * 0.16, dur: 0.18, vol: 0.16, vib: i === 3 ? 30 : 0 })),
    whoosh: () => noise(sfxBus, { dur: 1.4, vol: 0.22, type: 'bandpass', freq: 300, to: 2400, q: 1.4, attack: 0.5 }),
    buzz: () => { tone(sfxBus, { wave: 'sawtooth', freq: 120, dur: 0.08 + Math.random() * 0.08, vol: 0.05, filter: 900 }); noise(sfxBus, { dur: 0.05, vol: 0.05, freq: 5000 }); },
    thunder: () => { noise(sfxBus, { dur: 2.2, vol: 0.32, type: 'lowpass', freq: 380, to: 60, attack: 0.05 }); noise(sfxBus, { dur: 0.25, vol: 0.18, type: 'lowpass', freq: 1800 }); },
    can: () => { tone(sfxBus, { wave: 'sine', freq: 140, to: 60, dur: 0.18, vol: 0.4 }); noise(sfxBus, { t: 0.05, dur: 0.12, vol: 0.15, type: 'bandpass', freq: 2200 }); tone(sfxBus, { wave: 'triangle', freq: 1800, t: 0.18, dur: 0.06, vol: 0.08 }); },
    glitch: () => { for (let i = 0; i < 6; i++) tone(sfxBus, { wave: N.pick(['p12', 'p50', 'sawtooth']), freq: 80 + Math.random() * 2000, t: i * 0.04, dur: 0.04, vol: 0.12 }); },
    pipe: () => [0, 1, 2].forEach(i => tone(sfxBus, { wave: 'p50', freq: 400 - i * 90, to: 300 - i * 80, t: i * 0.1, dur: 0.1, vol: 0.15 })),
    bump: () => tone(sfxBus, { wave: 'triangle', freq: 180, to: 90, dur: 0.08, vol: 0.3 }),
    step: () => noise(sfxBus, { dur: 0.03, vol: 0.025, type: 'lowpass', freq: 900 }),
    spray: () => noise(sfxBus, { dur: 0.12, vol: 0.06, type: 'highpass', freq: 5000 }),
    tick: () => tone(sfxBus, { wave: 'p12', freq: 1760, dur: 0.02, vol: 0.06 }),
    crank: () => { for (let i = 0; i < 4; i++) { noise(sfxBus, { t: i * 0.11, dur: 0.05, vol: 0.12, type: 'bandpass', freq: 900 + i * 150 }); tone(sfxBus, { wave: 'triangle', freq: 220 + i * 40, t: i * 0.11, dur: 0.04, vol: 0.12 }); } },
    pop: () => { tone(sfxBus, { wave: 'sine', freq: 300, to: 900, dur: 0.08, vol: 0.3 }); noise(sfxBus, { dur: 0.06, vol: 0.12, freq: 3000 }); },
    zap: () => { tone(sfxBus, { wave: 'sawtooth', freq: 1800, to: 120, dur: 0.18, vol: 0.09 }); noise(sfxBus, { dur: 0.12, vol: 0.1, freq: 6000 }); },
    rotate: () => tone(sfxBus, { wave: 'p25', freq: 520, to: 640, dur: 0.04, vol: 0.12 }),
    ding: () => { tone(sfxBus, { wave: 'triangle', freq: 'E6', dur: 0.25, vol: 0.25, release: 0.2 }); tone(sfxBus, { wave: 'triangle', freq: 'B6', t: 0.1, dur: 0.35, vol: 0.2, release: 0.3 }); },
    perfect: () => tone(sfxBus, { wave: 'p12', freq: 'C7', dur: 0.04, vol: 0.06 }),
    miss: () => noise(sfxBus, { dur: 0.08, vol: 0.12, type: 'lowpass', freq: 400 }),
    lock: () => { tone(sfxBus, { wave: 'p50', freq: 330, dur: 0.06, vol: 0.14 }); tone(sfxBus, { wave: 'p50', freq: 495, t: 0.06, dur: 0.1, vol: 0.14 }); },
    count: () => tone(sfxBus, { wave: 'p25', freq: 880, dur: 0.09, vol: 0.18 }),
    go: () => tone(sfxBus, { wave: 'p25', freq: 1760, dur: 0.3, vol: 0.18, release: 0.15 }),
    ignite: () => { noise(sfxBus, { dur: 2.8, vol: 0.34, type: 'lowpass', freq: 1100, to: 160, attack: 0.04 }); tone(sfxBus, { wave: 'sine', freq: 70, to: 40, dur: 1.4, vol: 0.32 }); },
    boom: () => { noise(sfxBus, { dur: 0.9, vol: 0.4, type: 'lowpass', freq: 1800, to: 60 }); tone(sfxBus, { wave: 'sine', freq: 90, to: 35, dur: 0.5, vol: 0.35 }); },
    crackle: () => { for (let i = 0; i < 14; i++) noise(sfxBus, { t: i * 0.045 + Math.random() * 0.03, dur: 0.02, vol: 0.07 + Math.random() * 0.05, type: 'highpass', freq: 3500 }); },
    fanfare: () => ['C5', 'E5', 'G5', 'C6', 'G5', 'C6', 'E6'].forEach((n, i) => tone(sfxBus, { wave: 'p25', freq: n, t: i * 0.09, dur: i === 6 ? 0.5 : 0.1, vol: 0.16, release: i === 6 ? 0.35 : 0.04 }))
  };

  /* ---------- tracker ---------- */
  // chord tables used to generate arps / bass lines
  const CH = {
    Am: ['A3', 'C4', 'E4', 'A4'], F: ['F3', 'A3', 'C4', 'F4'], C: ['C4', 'E4', 'G4', 'C5'], G: ['G3', 'B3', 'D4', 'G4'],
    Em: ['E4', 'G4', 'B4', 'E5'], D: ['D4', 'F#4', 'A4', 'D5'], B: ['B3', 'D#4', 'F#4', 'B4'], Cx: ['C4', 'E4', 'G4', 'C5'],
    Dm7: ['D4', 'F4', 'A4', 'C5'], G7: ['G3', 'B3', 'D4', 'F4'], Cmaj7: ['C4', 'E4', 'G4', 'B4'], Am7: ['A3', 'C4', 'E4', 'G4']
  };
  const ROOT = { Am: 'A', F: 'F', C: 'C', G: 'G', Em: 'E', D: 'D', B: 'B', Cx: 'C', Dm7: 'D', G7: 'G', Cmaj7: 'C', Am7: 'A' };
  const FIFTH = { Am: 'E', F: 'C', C: 'G', G: 'D', Em: 'B', D: 'A', B: 'F#', Cx: 'G', Dm7: 'A', G7: 'D', Cmaj7: 'G', Am7: 'E' };

  const TRACKS = {
    neon: {
      name: 'NEON-8 NIGHTS', bpm: 104, swing: 0,
      chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'],
      lead: [
        'E5 - - D5 C5 - - - A4 - - - C5 - D5 -',
        'E5 - - - F5 - E5 - D5 - - - C5 - - -',
        'G5 - - - E5 - - - C5 - D5 - E5 - - -',
        'D5 - - - - - - - B4 - C5 - D5 - - -',
        'E5 - - D5 C5 - - - A4 - - - C5 - E5 -',
        'A5 - - - G5 - F5 - E5 - - - C5 - - -',
        'G5 - E5 - C5 - E5 - G5 - - - A5 - G5 -',
        'B5 - - - - - - - A5 - G5 - D5 - - -'
      ],
      arp: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 1],
      bass: 'r - r - R - r - r - r - R - f -',
      kick: 'x.......x.x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.xo',
      leadVol: 0.085, arpVol: 0.035, bassVol: 0.2, leadWave: 'p25', leadFilter: 0
    },
    lofi: {
      name: 'RAIN.LOFI', bpm: 76, swing: 0.2,
      chords: ['Dm7', 'G7', 'Cmaj7', 'Am7', 'Dm7', 'G7', 'Cmaj7', 'Am7'],
      lead: [
        'A4 - - - - - C5 - D5 - - - - - - -',
        'B4 - - - G4 - - - F4 - - - G4 - - -',
        'E4 - - - G4 - B4 - C5 - - - - - - -',
        'A4 - - - G4 - E4 - - - - - . . . .',
        'F5 - - - E5 - D5 - C5 - - - A4 - - -',
        'B4 - - - D5 - F5 - E5 - D5 - - - - -',
        'E5 - - - D5 - C5 - B4 - - - G4 - - -',
        'A4 - - - - - - - . . . . . . . .'
      ],
      pad: true,
      bass: 'r - - - - - f - r - - - R - f -',
      kick: 'x.........x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
      leadVol: 0.07, arpVol: 0, bassVol: 0.22, leadWave: 'p50', leadFilter: 1400, crackle: true
    },
    arcade: {
      name: 'PIXEL PALACE', bpm: 148, swing: 0,
      chords: ['Em', 'Cx', 'D', 'B', 'Em', 'Cx', 'D', 'B'],
      lead: [
        'E5 . G5 . B5 . G5 . E5 . G5 . B5 . E6 .',
        'C6 . B5 . G5 . E5 . G5 . A5 . B5 . G5 .',
        'F#5 . A5 . D6 . A5 . F#5 . A5 . D6 . F#6 .',
        'D#6 . B5 . F#5 . D#5 . F#5 . B5 . D#6 . B5 .',
        'B5 - - - G5 - E5 - G5 - B5 - E6 - - -',
        'E6 - D6 - C6 - B5 - C6 - B5 - G5 - - -',
        'A5 - - - F#5 - D5 - F#5 - A5 - D6 - - -',
        'D#6 - - - - - - - F#6 - - - D#6 - B5 -'
      ],
      arp: [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3],
      bass: 'r R r R r R r R r R r R r R f R',
      kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...xx',
      leadVol: 0.075, arpVol: 0.028, bassVol: 0.18, leadWave: 'p12', leadFilter: 0
    }
  };
  const ORDER = ['neon', 'lofi', 'arcade'];

  function parseBar(str) {
    const tok = str.trim().split(/\s+/);
    const ev = [];
    tok.forEach((t, i) => {
      if (t === '-') { if (ev.length && ev[ev.length - 1].open) ev[ev.length - 1].len++; return; }
      if (ev.length) ev[ev.length - 1].open = false;
      if (t === '.') return;
      ev.push({ step: i, note: t, len: 1, open: true });
    });
    return ev;
  }
  Object.values(TRACKS).forEach(tr => { tr.leadEv = tr.lead.map(parseBar); tr.bassTok = tr.bass.split(/\s+/); });

  let pendingTrack = null, timer = 0, cur = null, step = 0, nextTime = 0, forced = false;
  const Music = {
    tracks: TRACKS, order: ORDER,
    get current() { return cur ? cur.id : null; },
    get name() { return cur ? TRACKS[cur.id].name : ''; },
    // opts.restart: start over even if this track is playing; opts.delay: seconds until step 0
    play(id, opts = {}) {
      if (!ctx) { pendingTrack = id; return; }
      if (cur && cur.id === id && !opts.restart) return;
      clearInterval(timer); timer = 0; cur = null;
      const startAt = ctx.currentTime + (opts.delay || 0.08);
      cur = { id, startAt };
      step = 0; nextTime = startAt;
      timer = setInterval(schedule, 25);
      N.emit('music', id);
    },
    stop() { clearInterval(timer); timer = 0; cur = null; pendingTrack = null; N.emit('music', null); },
    // song clock for rhythm games: seconds since step 0 of the current track (negative during a lead-in)
    get position() { return cur && ctx ? ctx.currentTime - cur.startAt : 0; },
    stepDur: (id) => 60 / TRACKS[id].bpm / 4,
    next() {
      const i = cur ? ORDER.indexOf(cur.id) : -1;
      if (i === ORDER.length - 1) { this.stop(); return null; }
      const id = ORDER[i + 1]; this.play(id); return id;
    }
  };

  function schedule() {
    if (!cur || !ctx) return;
    const tr = TRACKS[cur.id];
    const sd = 60 / tr.bpm / 4;
    while (nextTime < ctx.currentTime + 0.12) {
      playStep(tr, step, nextTime - ctx.currentTime + ((step % 2) ? tr.swing * sd : 0), sd);
      step = (step + 1) % (16 * tr.chords.length);
      nextTime += sd;
    }
  }

  function playStep(tr, s, t, sd) {
    if (t < 0) t = 0;
    const bar = (s / 16) | 0, i = s % 16, chord = tr.chords[bar];
    // lead
    tr.leadEv[bar].forEach(e => {
      if (e.step === i) tone(musicBus, { wave: tr.leadWave, freq: e.note, t, dur: e.len * sd * 0.95, vol: tr.leadVol, vib: e.len > 3 ? 14 : 0, release: 0.06, filter: tr.leadFilter });
    });
    // arp
    if (tr.arpVol && tr.arp) tone(musicBus, { wave: 'p12', freq: CH[chord][tr.arp[i]], t, dur: sd * 0.7, vol: tr.arpVol });
    // pad
    if (tr.pad && i === 0) CH[chord].slice(0, 4).forEach(n => tone(musicBus, { wave: 'triangle', freq: n, t, dur: sd * 16, vol: 0.035, attack: 0.25, release: 0.4 }));
    // bass
    const b = tr.bassTok[i];
    if (b && b !== '-' && b !== '.') {
      let len = 1; for (let k = i + 1; k < 16 && tr.bassTok[k] === '-'; k++) len++;
      const name = b === 'f' ? FIFTH[chord] + '2' : ROOT[chord] + (b === 'R' ? '3' : '2');
      tone(musicBus, { wave: 'triangle', freq: name, t, dur: len * sd * 0.9, vol: tr.bassVol });
    }
    // drums
    if (tr.kick[i] === 'x') { tone(musicBus, { wave: 'sine', freq: 150, to: 42, t, dur: 0.14, vol: 0.5 }); }
    if (tr.snare[i] === 'x') { noise(musicBus, { t, dur: 0.13, vol: 0.12, type: 'highpass', freq: 1200 }); tone(musicBus, { wave: 'triangle', freq: 190, to: 120, t, dur: 0.06, vol: 0.1 }); }
    if (tr.hat[i] === 'x') noise(musicBus, { t, dur: 0.03, vol: 0.035, freq: 7500 });
    if (tr.hat[i] === 'o') noise(musicBus, { t, dur: 0.16, vol: 0.035, freq: 6500 });
    if (tr.crackle && Math.random() < 0.35) noise(musicBus, { t: t + Math.random() * sd, dur: 0.01, vol: 0.02 + Math.random() * 0.03, freq: 2500 });
  }

  N.Audio = {
    init,
    get ready() { return !!ctx; },
    get running() { return !!ctx && ctx.state === 'running'; },
    get context() { return ctx; },
    get output() { return master; },
    sfx(name) { if (!ctx || !S.sfx) return; const fn = SFX[name]; if (fn) fn(); },
    music: Music,
    setMusic(on) { S.music = on; N.Store.save(); if (musicBus) musicBus.gain.setTargetAtTime(on || forced ? 0.55 : 0, ctx.currentTime, 0.05); N.emit('settings'); },
    // a rhythm game needs its song even if background music is off (as long as sound effects are on)
    forceMusic(on) { forced = on && S.sfx; if (musicBus) musicBus.gain.setTargetAtTime(S.music || forced ? 0.55 : 0, ctx.currentTime, 0.03); },
    setSfx(on) { S.sfx = on; N.Store.save(); if (sfxBus) sfxBus.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.02); N.emit('settings'); },
    setVolume(v) { S.volume = v; N.Store.save(); if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05); },
    // pause music when the tab is hidden
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  };
})();
