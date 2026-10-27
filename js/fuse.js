/* NEON-8 · fuse box: rotate the wiring to relight the name sign, one letter per board */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const t = (k) => N.t(k), esc = N.esc;
  const NB = 1, EB = 2, SB = 4, WB = 8, DIRS = [[NB, 0, -1, SB], [EB, 1, 0, WB], [SB, 0, 1, NB], [WB, -1, 0, EB]];
  const SIZES = [4, 5, 5, 6, 6, 7, 7, 7];
  const CELL = 16, MX = 10, MY = 4;
  const rotBits = (b, r) => { for (let i = 0; i < r; i++) b = ((b << 1) | (b >> 3)) & 15; return b; };
  const name = () => (N.DATA.profile.name || 'EDDIE').toUpperCase().replace(/\s+/g, '').slice(0, 8);
  const fixed = () => Math.min(N.Store.data.sign || 0, name().length);

  /* ---------------- level generation ---------------- */
  function gen(level) {
    const n = SIZES[level] || 7, r = N.seeded('fuse:' + name() + ':' + level);
    const base = new Array(n * n).fill(0), seen = new Array(n * n).fill(false);
    const src = Math.floor(n / 2) * n;
    // randomized Prim: grow a spanning tree from the power source so every board is solvable
    seen[src] = true;
    const frontier = [];
    const addEdges = (c) => DIRS.forEach(([bit, dx, dy, opp]) => { const x = c % n + dx, y = ((c / n) | 0) + dy; if (x >= 0 && y >= 0 && x < n && y < n && !seen[y * n + x]) frontier.push([c, y * n + x, bit, opp]); });
    addEdges(src);
    while (frontier.length) {
      const [a, b, bit, opp] = frontier.splice((r() * frontier.length) | 0, 1)[0];
      if (seen[b]) continue;
      seen[b] = true; base[a] |= bit; base[b] |= opp; addEdges(b);
    }
    base[src] |= WB; // the plug comes in from the left edge
    const leaves = base.map((b, i) => ({ i, deg: [1, 2, 4, 8].filter(k => b & k).length })).filter(o => o.deg === 1 && o.i !== src).map(o => o.i);
    for (let i = leaves.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [leaves[i], leaves[j]] = [leaves[j], leaves[i]]; }
    const bulbs = leaves.slice(0, Math.max(1, Math.min(leaves.length, 2 + level)));
    const rot = base.map((_, i) => (i === src ? 0 : (r() * 4) | 0));
    const lv = { n, base, rot, src, bulbs, moves: 0 };
    if (solved(lv)) lv.rot[bulbs[0]] = (lv.rot[bulbs[0]] + 1) % 4;
    return lv;
  }
  const tile = (lv, i) => rotBits(lv.base[i], lv.rot[i]);
  function powered(lv) {
    const on = new Array(lv.n * lv.n).fill(false), q = [lv.src];
    on[lv.src] = true;
    while (q.length) {
      const c = q.shift(), b = tile(lv, c);
      DIRS.forEach(([bit, dx, dy, opp]) => {
        if (!(b & bit)) return;
        const x = c % lv.n + dx, y = ((c / lv.n) | 0) + dy;
        if (x < 0 || y < 0 || x >= lv.n || y >= lv.n) return;
        const j = y * lv.n + x;
        if (!on[j] && (tile(lv, j) & opp)) { on[j] = true; q.push(j); }
      });
    }
    return on;
  }
  const solved = (lv) => { const on = powered(lv); return lv.bulbs.every(b => on[b]); };

  /* ---------------- drawing ---------------- */
  function drawBoard(cv, lv, cur, done) {
    const n = lv.n, w = n * CELL + MX + 4, h = n * CELL + MY * 2;
    if (cv.width !== w) { cv.width = w; cv.height = h; }
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#0a0618'; x.fillRect(0, 0, w, h);
    const on = powered(lv);
    // battery + cable into the source tile
    const sy = MY + Math.floor(n / 2) * CELL;
    x.fillStyle = C.ink; x.fillRect(0, sy + 3, 8, 10); x.fillStyle = C.lime; x.fillRect(1, sy + 4, 6, 8); x.fillStyle = C.limeL; x.fillRect(2, sy + 5, 2, 2);
    x.fillStyle = C.cyan; x.fillRect(8, sy + 6, MX - 8, 4);
    for (let i = 0; i < n * n; i++) {
      const cx = MX + (i % n) * CELL, cy = MY + ((i / n) | 0) * CELL, b = tile(lv, i), lit = on[i];
      x.fillStyle = (i + ((i / n) | 0)) % 2 ? '#120936' : '#160b3d'; x.fillRect(cx, cy, CELL, CELL);
      const wire = lit ? C.cyan : '#4a3a7a';
      if (lit) { x.shadowColor = C.cyan; x.shadowBlur = 4; }
      x.fillStyle = wire;
      if (b & NB) x.fillRect(cx + 6, cy, 4, 10);
      if (b & SB) x.fillRect(cx + 6, cy + 6, 4, 10);
      if (b & WB) x.fillRect(cx, cy + 6, 10, 4);
      if (b & EB) x.fillRect(cx + 6, cy + 6, 10, 4);
      x.shadowBlur = 0;
      if (lit) { x.fillStyle = C.cyanL; if (b & NB) x.fillRect(cx + 7, cy, 2, 9); if (b & SB) x.fillRect(cx + 7, cy + 7, 2, 9); if (b & WB) x.fillRect(cx, cy + 7, 9, 2); if (b & EB) x.fillRect(cx + 7, cy + 7, 9, 2); }
      if (lv.bulbs.includes(i)) {
        if (lit) { P.ditherGlow(x, cx + 8, cy + 8, 9, P.rgba(C.yellow, 1), 0.7); }
        x.fillStyle = C.ink; x.fillRect(cx + 3, cy + 3, 10, 10);
        x.fillStyle = lit ? C.yellow : '#3a3050'; x.fillRect(cx + 4, cy + 4, 8, 8);
        x.fillStyle = lit ? C.yellowL : '#4a4068'; x.fillRect(cx + 5, cy + 5, 3, 2);
      } else if (i === lv.src) {
        x.fillStyle = C.ink; x.fillRect(cx + 4, cy + 4, 8, 8); x.fillStyle = C.lime; x.fillRect(cx + 5, cy + 5, 6, 6);
      } else { x.fillStyle = lit ? C.cyanL : '#5a4a8a'; x.fillRect(cx + 6, cy + 6, 4, 4); }
    }
    if (cur != null && !done) { const cx = MX + (cur % n) * CELL, cy = MY + ((cur / n) | 0) * CELL; x.fillStyle = C.yellow; x.fillRect(cx, cy, CELL, 1); x.fillRect(cx, cy + CELL - 1, CELL, 1); x.fillRect(cx, cy, 1, CELL); x.fillRect(cx + CELL - 1, cy, 1, CELL); }
  }
  function drawSign(cv, lit, pulse) {
    const nm = name(), sc = 3;
    const parts = [...nm].map((ch, i) => P.neonText(ch, C.magenta, { scale: sc, blur: 6, pad: 6, off: i >= lit }));
    const w = parts.reduce((a, c) => a + c.width - 6, 6), h = parts[0].height;
    cv.width = w; cv.height = h;
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
    let px = 0;
    parts.forEach((c, i) => { x.globalAlpha = i === pulse ? 0.6 + Math.random() * 0.4 : 1; x.drawImage(c, px, 0); px += c.width - 6; });
    x.globalAlpha = 1;
  }

  /* ---------------- window ---------------- */
  function open(startAt) {
    const nm = name();
    let level = startAt != null ? startAt : Math.min(fixed(), nm.length - 1);
    let lv = gen(level), cur = lv.src + 1, done = false;
    const zh = N.lang === 'zh';
    const api = N.UI.openWindow({
      id: 'fuse', cls: 'win--fuse', title: t('fuse.title'),
      body: `<div class="fuse">
        <canvas class="fuse-sign" aria-hidden="true"></canvas>
        <div class="fuse-letters" role="tablist" aria-label="${esc(t('fuse.letters'))}"></div>
        <p class="fuse-status" aria-live="polite"></p>
        <div class="fuse-board"><canvas class="fuse-cv" tabindex="0" aria-label="${esc(t('fuse.board'))}"></canvas></div>
        <p class="fuse-help">${esc(t('fuse.help'))}</p>
        <div class="fuse-bar"><span class="fuse-moves"></span><button class="btn btn--small" data-f="shuffle">${esc(t('fuse.shuffle'))}</button><button class="btn btn--primary btn--small" data-f="next" hidden>${esc(t('fuse.next'))}</button><button class="btn btn--primary btn--small" data-f="see" hidden>${esc(t('fuse.see'))}</button></div>
      </div>`,
      onOpen(a) {
        const cv = a.win.querySelector('.fuse-cv');
        render(a);
        cv.addEventListener('pointerdown', (e) => {
          if (done) return;
          const r = cv.getBoundingClientRect(), s = r.width / cv.width;
          const gx = Math.floor(((e.clientX - r.left) / s - MX) / CELL), gy = Math.floor(((e.clientY - r.top) / s - MY) / CELL);
          if (gx < 0 || gy < 0 || gx >= lv.n || gy >= lv.n) return;
          cur = gy * lv.n + gx;
          turn(a, e.button === 2 ? 3 : 1);
        });
        cv.addEventListener('contextmenu', (e) => e.preventDefault());
        a.win.addEventListener('click', (e) => {
          const b = e.target.closest('[data-f]'); if (b) { if (b.dataset.f === 'shuffle') { lv = gen(level); lv.rot = lv.rot.map((r0, i) => i === lv.src ? 0 : (Math.random() * 4) | 0); if (solved(lv)) lv.rot[lv.bulbs[0]] ^= 1; done = false; N.Audio.sfx('rotate'); render(a); } if (b.dataset.f === 'next') go(a, level + 1); if (b.dataset.f === 'see') { N.UI.closeWindows(); if (N.World && N.World.teleport) N.World.teleport('home'); } return; }
          const l = e.target.closest('[data-lv]'); if (l) go(a, +l.dataset.lv);
        });
        setTimeout(() => cv.focus({ preventScroll: true }), 30);
      },
      onKey(e, a) {
        if (N.onControl(e) && (e.key === 'Enter' || e.key === ' ')) return false;
        const n = lv.n, k = e.key;
        if (k === 'ArrowLeft' && cur % n > 0) cur--; else if (k === 'ArrowRight' && cur % n < n - 1) cur++;
        else if (k === 'ArrowUp' && cur >= n) cur -= n; else if (k === 'ArrowDown' && cur < n * n - n) cur += n;
        else if ((k === ' ' || k === 'f' || k === 'F' || k === 'Enter') && !done) { turn(a, 1); return true; }
        else if (k === 'r' || k === 'R') { turn(a, 3); return true; }
        else return false;
        render(a); return true;
      }
    });
    function go(a, l) { if (l < 0 || l >= nm.length || l > fixed()) return; level = l; lv = gen(level); cur = lv.src + 1; done = false; N.Audio.sfx('select'); render(a); }
    function turn(a, by) {
      if (cur === lv.src) { N.Audio.sfx('bump'); return; }
      lv.rot[cur] = (lv.rot[cur] + by) % 4; lv.moves++;
      N.Audio.sfx('rotate');
      if (solved(lv)) {
        done = true;
        N.Audio.sfx('zap'); setTimeout(() => N.Audio.sfx('ach'), 200);
        const before = fixed();
        N.Store.data.sign = Math.max(before, level + 1); N.Store.save();
        N.emit('sign', fixed());
        if (fixed() >= nm.length && before < nm.length) { N.Ach.unlock('electrician'); N.UI.toast({ kind: 'ach', title: t('fuse.title'), text: t('fuse.done') }); }
      }
      render(a);
    }
    function render(a) {
      drawBoard(a.win.querySelector('.fuse-cv'), lv, cur, done);
      drawSign(a.win.querySelector('.fuse-sign'), fixed(), done ? -1 : level);
      a.win.querySelector('.fuse-letters').innerHTML = [...nm].map((ch, i) => `<button class="fuse-l ${i < fixed() ? 'is-lit' : ''} ${i === level ? 'is-cur' : ''}" role="tab" aria-selected="${i === level}" data-lv="${i}" ${i > fixed() ? 'disabled' : ''}>${esc(ch)}</button>`).join('');
      const st = done
        ? (fixed() >= nm.length && level === nm.length - 1 ? t('fuse.done') : t('fuse.solved'))
        : t('fuse.status').replace('{i}', level + 1).replace('{n}', nm.length).replace('{b}', lv.bulbs.length);
      a.win.querySelector('.fuse-status').textContent = st;
      a.win.querySelector('.fuse-moves').textContent = `${t('fuse.moves')} ${lv.moves}`;
      a.win.querySelector('[data-f="next"]').hidden = !(done && level < nm.length - 1);
      a.win.querySelector('[data-f="see"]').hidden = !(done && fixed() >= nm.length);
    }
  }

  N.Fuse = { open, get fixed() { return fixed(); }, get total() { return name().length; }, _test: { gen, solved, tile } };
})();
