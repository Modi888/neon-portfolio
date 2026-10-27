/* NEON-8 · Pixel Palace: arcade cabinet host (attract mode, coins, high scores) */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const t = (k) => N.t(k), L = (v) => N.L(v), esc = N.esc;
  const W = 256, H = 224;
  const games = [];
  const Games = N.Games = { register(g) { games.push(g); }, list: games };

  const DEFAULT_SCORES = (dev) => [
    { n: 'EDD', s: dev }, { n: 'BYT', s: Math.round(dev * 0.7 / 10) * 10 }, { n: 'CAT', s: Math.round(dev * 0.45 / 10) * 10 },
    { n: 'AAA', s: Math.round(dev * 0.25 / 10) * 10 }, { n: 'ZZZ', s: Math.round(dev * 0.1 / 10) * 10 }
  ];
  const scores = (g) => {
    const d = N.Store.data.scores;
    if (!d[g.id]) d[g.id] = DEFAULT_SCORES(g.devScore || 1000);
    return d[g.id];
  };

  let root = null, cv, ctx, sel = 0, state = 'attract', game = null, raf = 0, last = 0, acc = 0, frame = 0, layer = null, prevTrack = null;
  let entry = null, lastScore = 0, rank = -1, flashT = 0, overTitle = '';
  const dispose = () => { if (game && game.destroy) { try { game.destroy(); } catch (e) { console.error(e); } } };
  const input = { left: 0, right: 0, up: 0, down: 0, a: 0, b: 0 };
  const pressed = {};
  const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'a', KeyF: 'a', KeyZ: 'a', KeyK: 'a', KeyX: 'b', KeyJ: 'b', Enter: 'start' };

  function api() {
    return {
      W, H, P, C, N,
      sfx: (n) => N.Audio.sfx(n),
      text: (s, x, y, col, o) => P.drawText(ctx, s, x, y, col, o),
      rnd: Math.random
    };
  }

  function html() {
    const g = games[sel];
    return `<div class="arc" style="--accent:${N.colorOf(g.color)}">
      <header class="arc-top">
        <span class="arc-name">${esc(t('arcade.title'))}</span>
        <span class="arc-coins" title="${esc(t('hud.coins'))}">${N.UI.ico('coin')}<b id="arcCoins">${String(N.Store.data.coins).padStart(3, '0')}</b></span>
        <button class="btn btn--small arc-exit" data-arc="exit" aria-label="${esc(t('arcade.exit'))}">${N.UI.ico('close')}<span>${esc(t('arcade.exit'))}</span> <kbd>Esc</kbd></button>
      </header>
      <div class="arc-floor">
        <button class="arc-nav" data-arc="prev" aria-label="Previous cabinet">${N.UI.ico('arrowL')}</button>
        <div class="cab">
          <div class="cab-marquee"><span id="arcMarquee">${esc(g.name)}</span></div>
          <div class="cab-bezel"><canvas id="arcScreen" width="${W}" height="${H}" aria-label="${esc(g.name)}"></canvas></div>
          <div class="cab-panel">
            <div class="cab-stick" aria-hidden="true"><i></i></div>
            <p class="cab-help" id="arcHelp">${esc(L(g.help))}</p>
            <div class="cab-btns" aria-hidden="true"><i></i><i></i></div>
          </div>
          <div class="cab-touch">
            <div class="cab-dpad"><button data-k="up" aria-label="Up">▲</button><button data-k="left" aria-label="Left">◀</button><button data-k="right" aria-label="Right">▶</button><button data-k="down" aria-label="Down">▼</button></div>
            <div class="cab-ab"><button data-k="start" aria-label="Start">START</button><button data-k="b" aria-label="B">B</button><button data-k="a" aria-label="F">F</button></div>
          </div>
        </div>
        <button class="arc-nav" data-arc="next" aria-label="Next cabinet">${N.UI.ico('arrowR')}</button>
      </div>
      <ul class="arc-pick" role="tablist">${games.map((gg, i) => `<li><button class="arc-tab ${i === sel ? 'is-on' : ''}" role="tab" aria-selected="${i === sel}" data-pick="${i}" style="--accent:${N.colorOf(gg.color)}"><b>${esc(gg.name)}</b><span>${esc(t('arcade.hiscore'))} ${scores(gg)[0].s}</span></button></li>`).join('')}</ul>
    </div>`;
  }

  function open(id) {
    if (root) return;
    resetInput();
    if (id) { const i = games.findIndex(g => g.id === id); if (i >= 0) sel = i; }
    root = document.createElement('div');
    root.className = 'ov ov--arcade';
    root.innerHTML = html();
    document.getElementById('layer').appendChild(root);
    cv = root.querySelector('#arcScreen'); ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    root.addEventListener('click', onClick);
    wireTouch();
    layer = { name: 'arcade', close, onKey: onKey, onKeyUp };
    N.App.push(layer);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', resetInput);
    prevTrack = N.Audio.music.current;
    if (N.Store.data.settings.music) N.Audio.music.play('arcade');
    N.Audio.sfx('door');
    state = 'attract'; game = null; frame = 0;
    last = 0; acc = 0; raf = requestAnimationFrame(loop);
    if (N.World.running) N.World.stop();
    root.querySelector('.cab-bezel').focus && root.querySelector('[data-arc="exit"]').focus({ preventScroll: true });
  }
  function close() {
    if (!root) return;
    cancelAnimationFrame(raf);
    window.removeEventListener('keyup', keyup);
    window.removeEventListener('blur', resetInput);
    resetInput();
    N.App.pop(layer);
    dispose();
    root.remove(); root = null; game = null;
    N.Audio.sfx('close');
    if (N.Store.data.settings.music) { if (prevTrack) N.Audio.music.play(prevTrack); else N.Audio.music.stop(); }
    if (N.App.screen === 'world') N.World.start();
  }
  function refreshChrome() {
    const g = games[sel];
    root.querySelector('.arc').style.setProperty('--accent', N.colorOf(g.color));
    root.querySelector('#arcMarquee').textContent = g.name;
    root.querySelector('#arcHelp').textContent = L(g.help);
    root.querySelectorAll('.arc-tab').forEach((b, i) => { b.classList.toggle('is-on', i === sel); b.setAttribute('aria-selected', i === sel); b.querySelector('span').textContent = `${t('arcade.hiscore')} ${scores(games[i])[0].s}`; });
    const c = root.querySelector('#arcCoins'); if (c) c.textContent = String(N.Store.data.coins).padStart(3, '0');
  }
  function pick(i) {
    if (state === 'play' || state === 'entry') return;
    sel = (i + games.length) % games.length; state = 'attract'; frame = 0;
    N.Audio.sfx('blip');
    refreshChrome();
  }
  function onClick(e) {
    const a = e.target.closest('[data-arc]');
    if (a) { if (a.dataset.arc === 'exit') close(); if (a.dataset.arc === 'prev') pick(sel - 1); if (a.dataset.arc === 'next') pick(sel + 1); return; }
    const p = e.target.closest('[data-pick]'); if (p) { pick(+p.dataset.pick); return; }
    if (e.target === cv && state !== 'play') press('start');
  }
  function wireTouch() {
    root.querySelectorAll('[data-k]').forEach(b => {
      const k = b.dataset.k;
      const dn = (e) => { e.preventDefault(); press(k); b.classList.add('is-down'); };
      const up = (e) => { e.preventDefault(); release(k); b.classList.remove('is-down'); };
      b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
    });
  }
  // START (and clicking the screen) is a tap: it never holds A down
  function press(k) { if (k === 'start') { pressed.start = 1; pressed.a = 1; return; } if (!input[k]) pressed[k] = 1; input[k] = 1; }
  function release(k) { if (k === 'start') return; input[k] = 0; }
  function resetInput() { for (const k in input) input[k] = 0; for (const k in pressed) pressed[k] = 0; }
  function onKey(e) {
    if (e.key === 'Tab') return false;
    const k = KEYS[e.code];
    if (!k) return false;
    if (state !== 'play' && state !== 'entry') {
      if (k === 'left') { pick(sel - 1); return true; }
      if (k === 'right') { pick(sel + 1); return true; }
    }
    if (!e.repeat) press(k);
    return true;
  }
  function onKeyUp() { }
  function keyup(e) { const k = KEYS[e.code]; if (k) release(k); }

  /* ---------------- loop ---------------- */
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!last) last = now;
    acc += Math.min(0.1, (now - last) / 1000); last = now;
    let n = 0;
    while (acc >= 1 / 60 && n < 4) { step(); acc -= 1 / 60; n++; for (const k in pressed) pressed[k] = 0; }
    if (n) draw();
  }

  function startGame() {
    const g = games[sel];
    const D = N.Store.data;
    let free = false;
    if (D.coins > 0) { D.coins--; N.Store.save(); N.emit('coins', D.coins); N.Audio.sfx('coin'); }
    else { free = true; N.UI.toast({ title: t('arcade.free'), text: t('arcade.broke') }); }
    refreshChrome();
    dispose();
    game = g.create(api());
    state = 'play'; frame = 0;
    D.played[g.id] = true; N.Store.save();
    N.Ach.unlock('arcade1');
    if (games.every(x => D.played[x.id])) N.Ach.unlock('arcadeAll');
    return free;
  }
  function endGame() {
    const g = games[sel];
    lastScore = game.score | 0;
    overTitle = game.overTitle || 'GAME OVER';
    dispose();
    N.Audio.sfx(game.won ? 'fanfare' : 'gameover');
    const list = scores(g);
    if (lastScore > (g.devScore || 1000)) N.Ach.unlock('hiscore');
    rank = list.findIndex(r => lastScore > r.s);
    if (rank === -1 && list.length < 5) rank = list.length;
    flashT = 40;
    if (rank >= 0 && lastScore > 0) { state = 'entry'; entry = { letters: [0, 0, 0], pos: 0, lock: 50 }; }
    else { state = 'over'; frame = 0; }
  }
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789★♥';

  function step() {
    frame++;
    if (state === 'attract') { if (pressed.start || pressed.a) startGame(); return; }
    if (state === 'play') {
      game.update(input, pressed);
      if (game.over) endGame();
      return;
    }
    if (state === 'entry') {
      const e = entry;
      if (e.lock > 0) { e.lock--; return; }
      if (pressed.up) { e.letters[e.pos] = (e.letters[e.pos] + 1) % ABC.length; N.Audio.sfx('blip'); }
      if (pressed.down) { e.letters[e.pos] = (e.letters[e.pos] - 1 + ABC.length) % ABC.length; N.Audio.sfx('blip'); }
      if (pressed.left && e.pos > 0) { e.pos--; N.Audio.sfx('blip'); }
      if (pressed.right && e.pos < 2) { e.pos++; N.Audio.sfx('blip'); }
      if (pressed.a || pressed.start || pressed.b) {
        if (e.pos < 2) { e.pos++; N.Audio.sfx('select'); }
        else {
          const name = e.letters.map(i => ABC[i]).join('');
          const list = scores(games[sel]);
          list.splice(rank, 0, { n: name, s: lastScore }); list.length = Math.min(list.length, 5);
          N.Store.save(); N.Audio.sfx('ach');
          state = 'over'; frame = 0; refreshChrome();
        }
      }
      return;
    }
    if (state === 'over') { if (frame > 50 && (pressed.a || pressed.start)) { startGame(); } if (frame > 60 * 12) { state = 'attract'; frame = 0; } }
  }

  /* ---------------- drawing ---------------- */
  function text(s, x, y, col, o = {}) { return P.drawText(ctx, s, x, y, col, o); }
  function drawAttract() {
    const g = games[sel];
    const [main] = P.NEONS[g.color] || P.NEONS.magenta;
    ctx.fillStyle = '#05020f'; ctx.fillRect(0, 0, W, H);
    // animated preview from the game itself
    if (g.attract) g.attract(ctx, frame, api());
    ctx.fillStyle = 'rgba(5,2,15,0.55)'; ctx.fillRect(0, 0, W, H);
    const title = P.neonText(g.name, main, { scale: 2, blur: 6 });
    ctx.drawImage(title, ((W - title.width) / 2) | 0, 22);
    const cyc = ((frame / 240) | 0) % 2;
    if (cyc === 0) {
      text(N.lang === 'zh' ? 'HIGH SCORES' : 'HIGH SCORES', W / 2, 70, C.yellow, { align: 'center' });
      scores(g).forEach((r, i) => {
        const y = 88 + i * 14, col = i === 0 ? C.cyan : '#ffffff';
        text(`${i + 1}.`, 64, y, C.grey, { mono: true });
        text(r.n, 86, y, col, { mono: true });
        text(String(r.s).padStart(6, ' '), 192, y, col, { mono: true, align: 'right' });
      });
    } else {
      const lines = String(L(g.blurb) || '').toUpperCase().replace(/[^A-Z0-9 .,!?'\-:/]/g, '').match(/.{1,34}(\s|$)/g) || [];
      lines.slice(0, 6).forEach((ln, i) => text(ln.trim(), W / 2, 76 + i * 12, '#ffffff', { align: 'center', font: 3 }));
      if (N.lang === 'zh') text('SEE INSTRUCTIONS BELOW', W / 2, 160, C.grey, { align: 'center', font: 3 });
    }
    if ((frame >> 5) % 2 === 0) text(N.Store.data.coins > 0 ? 'PRESS START  1 COIN' : 'PRESS START  FREE PLAY', W / 2, 176, C.yellow, { align: 'center' });
    text('◀ ▶ CHANGE GAME', W / 2, 196, C.grey, { align: 'center', font: 3 });
    text(`CREDITS ${String(N.Store.data.coins).padStart(2, '0')}`, W - 6, H - 10, C.grey, { align: 'right', font: 3 });
    text('(C)2026 NEON-8', 6, H - 10, C.grey, { font: 3 });
  }
  function drawHUD() {
    const g = games[sel];
    ctx.fillStyle = '#05020f'; ctx.fillRect(0, 0, W, 12);
    text('SCORE', 4, 3, C.grey, { font: 3 });
    text(String(game.score | 0).padStart(6, '0'), 28, 3, '#ffffff', { font: 3, mono: true });
    text('HI', 120, 3, C.grey, { font: 3 });
    text(String(Math.max(scores(g)[0].s, game.score | 0)).padStart(6, '0'), 132, 3, C.yellow, { font: 3, mono: true });
    if (game.lives != null) for (let i = 0; i < game.lives; i++) ctx.drawImage(N.Sprites.icon.heart, W - 10 - i * 9, 2);
    if (game.label) text(game.label, W - 40, 3, C.cyan, { font: 3, align: 'right' });
  }
  function drawEntry() {
    ctx.fillStyle = 'rgba(5,2,15,0.88)'; ctx.fillRect(0, 0, W, H);
    text('NEW HIGH SCORE!', W / 2, 40, (frame >> 3) % 2 ? C.yellow : C.magenta, { align: 'center', scale: 1 });
    text(String(lastScore), W / 2, 60, '#ffffff', { align: 'center', scale: 2 });
    text('ENTER YOUR INITIALS', W / 2, 96, C.cyan, { align: 'center' });
    for (let i = 0; i < 3; i++) {
      const x = W / 2 - 36 + i * 28, ch = ABC[entry.letters[i]];
      ctx.fillStyle = i === entry.pos ? C.yellow : '#3a2a6a'; ctx.fillRect(x - 2, 136, 20, 2);
      text(ch, x, 114, i === entry.pos ? C.yellow : '#ffffff', { scale: 3 });
      if (i === entry.pos && (frame >> 4) % 2) { text('▲', x + 5, 104, C.grey, { font: 3 }); text('▼', x + 5, 142, C.grey, { font: 3 }); }
    }
    text('▲▼ LETTER  ◀▶ MOVE  F OK', W / 2, 168, C.grey, { align: 'center', font: 3 });
  }
  function drawOver() {
    ctx.fillStyle = 'rgba(5,2,15,0.8)'; ctx.fillRect(0, 0, W, H);
    text(overTitle, W / 2, 46, game && game.won ? C.lime : C.magenta, { align: 'center', scale: 2 });
    text(`SCORE ${lastScore}`, W / 2, 76, '#ffffff', { align: 'center' });
    scores(games[sel]).forEach((r, i) => {
      const y = 98 + i * 13, mine = r.s === lastScore && r.n && i === rank;
      text(`${i + 1}. ${r.n}`, 72, y, mine ? C.yellow : '#ffffff', { mono: true });
      text(String(r.s), 184, y, mine ? C.yellow : '#ffffff', { mono: true, align: 'right' });
    });
    if (frame > 50 && (frame >> 5) % 2 === 0) text('PRESS START TO PLAY AGAIN', W / 2, 176, C.yellow, { align: 'center', font: 3 });
    text('ESC TO LEAVE', W / 2, 192, C.grey, { align: 'center', font: 3 });
  }
  function draw() {
    if (state === 'attract') { drawAttract(); return; }
    if (game) { ctx.save(); ctx.translate(0, 12); ctx.beginPath(); ctx.rect(0, 0, W, H - 12); ctx.clip(); game.draw(ctx); ctx.restore(); drawHUD(); }
    if (state === 'entry') drawEntry();
    if (state === 'over') drawOver();
    if (flashT > 0) { flashT--; if (flashT % 8 < 4) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, 0, W, H); } }
  }

  N.Arcade = { open, close, get open_() { return !!root; }, PLAY_H: H - 12, W };
})();
