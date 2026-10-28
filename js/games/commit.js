/* NEON-8 arcade · COMMIT HERO: a rhythm game charted from the radio's own songs */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const W = 256, H = 212;
  const LANES = [
    { key: '←', name: 'ADD', col: C.magenta, glyph: '+' },
    { key: '↓', name: 'COMMIT', col: C.cyan, glyph: 'O' },
    { key: '↑', name: 'PUSH', col: C.yellow, glyph: '^' },
    { key: '→', name: 'MERGE', col: C.lime, glyph: 'Y' }
  ];
  const LW = 34, GAP = 4, X0 = ((W - (LW * 4 + GAP * 3)) / 2) | 0, HIT = 172, SPEED = 118, LEAD = 2.2;
  const SONGS = [
    { id: 'lofi', branch: 'chill', diff: 1, label: 'EASY', loops: 2 },
    { id: 'neon', branch: 'main', diff: 2, label: 'NORMAL', loops: 2 },
    { id: 'arcade', branch: 'hotfix', diff: 3, label: 'HARD', loops: 3 }
  ];
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const midi = (n) => { const m = /^([A-G]#?)(\d)$/.exec(n); return m ? NAMES.indexOf(m[1]) + (+m[2] + 1) * 12 : 60; };
  const laneX = (i) => X0 + i * (LW + GAP);

  function chart(song) {
    const tr = N.Audio.music.tracks[song.id], sd = N.Audio.music.stepDur(song.id);
    const raw = [];
    for (let loop = 0; loop < song.loops; loop++) tr.leadEv.forEach((bar, b) => bar.forEach(e => raw.push({ t: (loop * 128 + b * 16 + e.step) * sd, m: midi(e.note) })));
    const lo = Math.min(...raw.map(r => r.m)), hi = Math.max(...raw.map(r => r.m));
    return raw.map(r => ({ t: r.t, lane: Math.min(3, Math.floor((r.m - lo) / (hi - lo + 1) * 4)), done: false }));
  }

  function create(api) {
    const g = { score: 0, over: false, label: '' };
    let state = 'select', pick = 1, song = null, notes = [], health = 100, combo = 0, best = 0, hits = 0, perfects = 0, judged = 0, misses = 0;
    let fx = [], flash = [0, 0, 0, 0], judge = null, t0 = 0, endAt = 0, frame = 0;
    // follow the song when audio is actually running; if the phone hasn't let sound start, fall back to the wall clock so notes still fall
    let audioClock = false;
    const clock = () => (audioClock && song && N.Audio.music.current === song.id) ? N.Audio.music.position : (performance.now() - t0) / 1000 - LEAD;

    function start() {
      song = SONGS[pick];
      notes = chart(song);
      endAt = notes[notes.length - 1].t + 1.4;
      t0 = performance.now();
      N.Audio.init();
      audioClock = N.Audio.running;
      N.Audio.forceMusic(true);
      N.Audio.music.play(song.id, { restart: true, delay: LEAD });
      state = 'play'; api.sfx('select');
      g.label = song.branch.toUpperCase();
    }
    function finish(won) {
      g.won = won;
      const acc = judged ? (perfects + hits * 0.6) / Math.max(1, notes.length) : 0;
      const grade = acc > 0.95 ? 'S' : acc > 0.85 ? 'A' : acc > 0.7 ? 'B' : 'C';
      if (won) { g.overTitle = 'DEPLOYED ' + grade; if (!misses) g.score += Math.round(g.score * 0.1); N.Ach.unlock('deployed'); if (!misses) N.Ach.unlock('fullcombo'); }
      else g.overTitle = 'BUILD FAILED';
      N.Audio.music.stop();
      g.over = true;
    }
    function hit(lane, pos) {
      flash[lane] = 8;
      let bestN = null, bd = 0.15;
      for (const n of notes) { if (n.done || n.lane !== lane) continue; const d = Math.abs(n.t - pos); if (d <= bd) { bd = d; bestN = n; } if (n.t - pos > 0.2) break; }
      if (!bestN) return;
      bestN.done = true; judged++;
      let base, word, col;
      if (bd <= 0.045) { base = 300; word = 'PERFECT'; col = C.cyanL; perfects++; health = Math.min(100, health + 1.5); api.sfx('perfect'); }
      else if (bd <= 0.09) { base = 200; word = 'GREAT'; col = C.lime; hits++; health = Math.min(100, health + 1); }
      else { base = 100; word = 'GOOD'; col = C.yellow; hits++; }
      combo++; best = Math.max(best, combo);
      g.score += Math.round(base * (1 + Math.min(combo, 50) / 50));
      judge = { word, col, t: 30 };
      for (let k = 0; k < 6; k++) fx.push({ x: laneX(lane) + LW / 2, y: HIT, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2.5, l: 18, c: LANES[lane].col });
    }

    g.update = (inp, pr) => {
      frame++;
      for (let i = 0; i < 4; i++) if (flash[i]) flash[i]--;
      fx.forEach(f => { f.x += f.vx; f.y += f.vy; f.vy += 0.15; f.l--; }); fx = fx.filter(f => f.l > 0);
      if (judge && --judge.t <= 0) judge = null;
      if (state === 'select') {
        if (pr.left || pr.up) { pick = (pick + 2) % 3; api.sfx('blip'); }
        if (pr.right || pr.down) { pick = (pick + 1) % 3; api.sfx('blip'); }
        if (pr.a || pr.start) start();
        return;
      }
      const pos = clock();
      if (pr.left) hit(0, pos); if (pr.down) hit(1, pos); if (pr.up) hit(2, pos); if (pr.right) hit(3, pos);
      for (const n of notes) {
        if (n.done) continue;
        if (pos - n.t > 0.15) { n.done = true; judged++; misses++; combo = 0; health -= 7; judge = { word: 'CONFLICT', col: C.red, t: 30 }; api.sfx('miss'); }
        else if (n.t > pos) break;
      }
      if (health <= 0) { health = 0; finish(false); return; }
      if (pos > endAt) finish(true);
    };

    g.draw = (x) => {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, W, H);
      if (state === 'select') return drawSelect(x);
      const pos = clock();
      // a git graph scrolling down each side
      const sd = N.Audio.music.stepDur(song.id);
      for (const side of [12, W - 22]) {
        x.fillStyle = '#1a0d45'; x.fillRect(side + 4, 0, 2, H);
        for (let k = -2; k < 14; k++) {
          const beat = Math.floor(pos / (sd * 4)) + k, y = HIT - (beat * sd * 4 - pos) * SPEED;
          if (y < -6 || y > H) continue;
          x.fillStyle = beat % 4 === 0 ? C.magenta : '#3a2a6a'; x.fillRect(side + 2, y | 0, 6, 4);
          if (beat % 8 === 3) { x.fillStyle = '#3a2a6a'; P.line(x, side + 5, y | 0, side + (side < W / 2 ? 12 : -2), (y + 14) | 0, '#3a2a6a'); }
        }
      }
      // lanes
      LANES.forEach((ln, i) => {
        const lx = laneX(i);
        x.fillStyle = '#0d0726'; x.fillRect(lx, 0, LW, H);
        x.fillStyle = P.rgba(ln.col, 0.08); x.fillRect(lx, 0, 1, H); x.fillRect(lx + LW - 1, 0, 1, H);
        if (flash[i]) { x.fillStyle = P.rgba(ln.col, flash[i] / 40); x.fillRect(lx, 0, LW, HIT); }
        // receptor
        x.fillStyle = flash[i] ? ln.col : P.mix(ln.col, C.ink, 0.6);
        x.fillRect(lx + 1, HIT - 1, LW - 2, 2); x.fillRect(lx + 1, HIT + 7, LW - 2, 2); x.fillRect(lx + 1, HIT - 1, 2, 10); x.fillRect(lx + LW - 3, HIT - 1, 2, 10);
        P.drawText(x, ln.key, lx + LW / 2, HIT + 13, P.mix(ln.col, '#ffffff', 0.3), { font: 3, align: 'center' });
        P.drawText(x, ln.name, lx + LW / 2, HIT + 21, P.mix(ln.col, C.ink, 0.25), { font: 3, align: 'center' });
      });
      // notes
      for (const n of notes) {
        if (n.done) continue;
        const y = HIT - (n.t - pos) * SPEED;
        if (y < -10) break;
        if (y > H) continue;
        const ln = LANES[n.lane], lx = laneX(n.lane);
        x.fillStyle = C.ink; x.fillRect(lx + 2, (y - 1) | 0, LW - 4, 10);
        x.fillStyle = ln.col; x.fillRect(lx + 3, y | 0, LW - 6, 8);
        x.fillStyle = P.mix(ln.col, '#ffffff', 0.55); x.fillRect(lx + 3, y | 0, LW - 6, 1);
        P.drawText(x, ln.glyph, lx + LW / 2, (y + 2) | 0, C.ink, { font: 3, align: 'center' });
      }
      fx.forEach(f => { x.fillStyle = f.c; x.fillRect(f.x | 0, f.y | 0, 2, 2); });
      // build health
      x.fillStyle = '#1a0d45'; x.fillRect(W - 14, 20, 4, 140);
      const hh = Math.round(140 * health / 100);
      x.fillStyle = health > 40 ? C.lime : C.red; x.fillRect(W - 14, 160 - hh, 4, hh);
      P.drawText(x, 'BUILD', W - 12, 164, C.grey, { font: 3, align: 'center' });
      if (combo >= 5) { P.drawText(x, String(combo), 34, 70, C.yellow, { scale: 2, align: 'center' }); P.drawText(x, 'COMBO', 34, 88, C.grey, { font: 3, align: 'center' }); }
      if (judge) P.drawText(x, judge.word, W / 2, 120, judge.col, { align: 'center' });
      if (pos < 0) {
        const n = Math.ceil(-pos);
        P.drawText(x, n > 2 ? 'READY' : String(n), W / 2, 70, '#ffffff', { scale: 2, align: 'center' });
        P.drawText(x, 'BRANCH ' + song.branch.toUpperCase() + '  ' + N.Audio.music.tracks[song.id].name, W / 2, 94, C.grey, { font: 3, align: 'center' });
      }
    };
    function drawSelect(x) {
      P.drawText(x, 'PICK A BRANCH', W / 2, 18, C.yellow, { align: 'center' });
      SONGS.forEach((s, i) => {
        const y = 44 + i * 44, on = i === pick, tr = N.Audio.music.tracks[s.id];
        x.fillStyle = on ? '#24124f' : '#120936'; x.fillRect(28, y, W - 56, 36);
        if (on) { x.fillStyle = C.yellow; x.fillRect(28, y, 2, 36); P.drawText(x, '▶', 36, y + 14, C.yellow, { font: 3 }); }
        P.drawText(x, 'git checkout ' + s.branch, 46, y + 6, on ? '#ffffff' : C.grey, { font: 3 });
        P.drawText(x, tr.name, 46, y + 15, on ? C.cyan : '#5a4a8a');
        P.drawText(x, `${tr.bpm} BPM  ${s.label}`, 46, y + 26, on ? C.lilac : '#4a3a7a', { font: 3 });
        for (let k = 0; k < 3; k++) P.drawText(x, '★', W - 56 + k * 8, y + 14, k < s.diff ? C.yellow : '#3a2a6a', { font: 3 });
      });
      P.drawText(x, '▲▼ CHOOSE   ' + N.padA() + ' START', W / 2, 186, C.grey, { font: 3, align: 'center' });
      P.drawText(x, '← ↓ ↑ → HIT THE NOTES ON THE LINE', W / 2, 198, C.grey, { font: 3, align: 'center' });
    }
    g.destroy = () => {
      N.Audio.forceMusic(false);
      if (N.Store.data.settings.music) N.Audio.music.play('arcade', { restart: true }); else N.Audio.music.stop();
    };
    return g;
  }

  N.Games.register({
    id: 'commit', name: 'COMMIT HERO', color: 'violet', devScore: 30000,
    blurb: { en: 'The radio songs are your charts. Hit add, commit, push and merge on the beat. Miss too many and the build fails.', zh: '电台的歌就是谱面。踩着节拍按下 add、commit、push、merge，错太多构建就会失败。' },
    help: { en: '← ↓ ↑ → hit notes as they cross the line. Pick a song with ▲▼, F to start. Turn sound on!', zh: '← ↓ ↑ → 在音符经过线时按下。▲▼ 选歌，F 开始。记得开声音！' },
    create,
    attract(x, f) {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, 256, 224);
      for (let i = 0; i < 4; i++) {
        const lx = laneX(i); x.fillStyle = '#0d0726'; x.fillRect(lx, 0, LW, 224);
        for (let k = 0; k < 4; k++) { const y = ((f * 1.6 + k * 61 + i * 37) % 260) - 20; x.fillStyle = LANES[i].col; x.fillRect(lx + 3, y | 0, LW - 6, 8); }
      }
    }
  });
})();
