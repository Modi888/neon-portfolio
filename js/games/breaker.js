/* NEON-8 arcade · BUG BREAKER: squash the bugs with a bouncing semicolon */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const W = 256, H = 212;
  const ROW_COLORS = [C.magenta, C.orange, C.yellow, C.lime, C.cyan, C.vio];
  const LEVELS = [
    ['..........', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXXXXXXX', '..........'],
    ['A........A', 'XXAXXXXAXX', '.XXXXXXXX.', '..XXXXXX..', '.XXXXXXXX.', 'XXAXXXXAXX'],
    ['XXXXXXXXXX', 'X.X.X.X.X.', '.X.X.X.X.X', 'AAAAAAAAAA', 'X.X.X.X.X.', 'XXXXXXXXXX'],
    ['....AA....', '...XXXX...', '..XXXXXX..', '.XXAXXAXX.', 'XXXXXXXXXX', 'X.X....X.X']
  ];
  // little beetle sprites, two leg frames
  const bugA = ['.k.....k.', '..kkkkk..', '.kbbbbbk.', 'kbwbbbwbk', 'kbbbbbbbk', '.kbbbbbk.', 'k.k...k.k'];
  const bugB = ['k.......k', '.kkkkkkk.', '.kbbbbbk.', 'kbwbbbwbk', 'kbbbbbbbk', '.kbbbbbk.', '.k.k.k.k.'];
  const cache = {};
  function bugSprite(col, frame, armored) {
    const key = col + frame + armored;
    if (!cache[key]) cache[key] = P.sprite(frame ? bugB : bugA, { k: armored ? '#ffffff' : C.ink, b: col, w: '#ffffff' });
    return cache[key];
  }

  function create(api) {
    const g = { score: 0, over: false, lives: 3, label: 'LV 1' };
    let level = 0, bricks = [], balls = [], paddle = { x: W / 2 - 18, w: 36, y: H - 14 }, caps = [], parts = [], wide = 0, slow = 0, stuck = true, msg = 0;
    function build() {
      bricks = [];
      const lv = LEVELS[level % LEVELS.length];
      lv.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === '.') return;
        bricks.push({ x: 8 + i * 24, y: 22 + j * 13, w: 22, h: 10, hp: ch === 'A' ? 2 : 1, col: ROW_COLORS[j % ROW_COLORS.length], armored: ch === 'A', ph: Math.random() * 6 });
      }));
      balls = [{ x: paddle.x + paddle.w / 2, y: paddle.y - 4, vx: 0, vy: 0 }];
      stuck = true; msg = 90;
      g.label = 'LV ' + (level + 1);
    }
    build();
    const speed = () => (2.3 + level * 0.25) * (slow > 0 ? 0.65 : 1);
    function launch() { stuck = false; const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.8; balls[0].vx = Math.cos(a) * speed(); balls[0].vy = Math.sin(a) * speed(); api.sfx('laser'); }
    g.update = (inp, pr) => {
      const pw = wide > 0 ? 56 : 36;
      paddle.x += ((inp.left ? -4 : 0) + (inp.right ? 4 : 0));
      paddle.w += (pw - paddle.w) * 0.3;
      paddle.x = N.clamp(paddle.x, 2, W - paddle.w - 2);
      if (wide > 0) wide--; if (slow > 0) slow--;
      if (msg > 0) msg--;
      if (stuck) { balls[0].x = paddle.x + paddle.w / 2; balls[0].y = paddle.y - 4; if (pr.a || pr.up) launch(); }
      else for (const b of balls) {
        // keep speed constant-ish
        const sp = Math.hypot(b.vx, b.vy) || 1, want = speed();
        b.vx *= want / sp; b.vy *= want / sp;
        b.x += b.vx; b.y += b.vy;
        if (b.x < 2) { b.x = 2; b.vx = Math.abs(b.vx); api.sfx('bounce'); }
        if (b.x > W - 5) { b.x = W - 5; b.vx = -Math.abs(b.vx); api.sfx('bounce'); }
        if (b.y < 14) { b.y = 14; b.vy = Math.abs(b.vy); api.sfx('bounce'); }
        if (b.vy > 0 && b.y + 3 >= paddle.y && b.y + 3 <= paddle.y + 5 && b.x + 3 >= paddle.x && b.x <= paddle.x + paddle.w) {
          const hit = (b.x + 1.5 - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
          const ang = -Math.PI / 2 + hit * 1.05;
          b.vx = Math.cos(ang) * want; b.vy = Math.sin(ang) * want; b.y = paddle.y - 4;
          api.sfx('bounce');
        }
        for (const br of bricks) {
          if (br.hp <= 0) continue;
          if (b.x + 3 > br.x && b.x < br.x + br.w && b.y + 3 > br.y && b.y < br.y + br.h) {
            const ox = Math.min(b.x + 3 - br.x, br.x + br.w - b.x), oy = Math.min(b.y + 3 - br.y, br.y + br.h - b.y);
            if (ox < oy) b.vx = -b.vx; else b.vy = -b.vy;
            br.hp--;
            if (br.hp <= 0) {
              g.score += br.armored ? 25 : 10; api.sfx('brick');
              for (let k = 0; k < 8; k++) parts.push({ x: br.x + br.w / 2, y: br.y + 5, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.8) * 2, l: 24, c: br.col });
              if (Math.random() < 0.12) caps.push({ x: br.x + br.w / 2 - 6, y: br.y, kind: N.pick(['C', 'M', 'S']) });
            } else api.sfx('hit');
            break;
          }
        }
      }
      balls = balls.filter(b => b.y < H + 6);
      if (!balls.length) {
        g.lives--; api.sfx('explode');
        if (g.lives <= 0) { g.over = true; return; }
        balls = [{ x: paddle.x + paddle.w / 2, y: paddle.y - 4, vx: 0, vy: 0 }]; stuck = true;
      }
      for (const c of caps) {
        c.y += 1.1;
        if (c.y + 7 >= paddle.y && c.y <= paddle.y + 5 && c.x + 12 >= paddle.x && c.x <= paddle.x + paddle.w) {
          c.y = H + 20; api.sfx('powerup');
          if (c.kind === 'C') wide = 60 * 12;
          if (c.kind === 'S') slow = 60 * 10;
          if (c.kind === 'M' && balls.length) { const b = balls[0]; for (let k = 0; k < 2; k++) balls.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 3, vy: -2 }); }
        }
      }
      caps = caps.filter(c => c.y < H + 10);
      parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.l--; }); parts = parts.filter(p => p.l > 0);
      if (bricks.every(b => b.hp <= 0)) { g.score += 100; level++; api.sfx('powerup'); build(); }
    };
    g.draw = (x) => {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, W, H);
      // faint code lines in the background
      x.fillStyle = '#120936';
      for (let j = 18; j < H; j += 8) x.fillRect(6 + (j * 7) % 40, j, 40 + (j * 13) % 120, 2);
      const f = (Date.now() / 220 | 0) % 2;
      for (const br of bricks) {
        if (br.hp <= 0) continue;
        const spr = bugSprite(br.col, (f + (br.x / 24 | 0)) % 2, br.armored && br.hp > 1);
        x.fillStyle = P.mix(br.col, C.ink, 0.78); x.fillRect(br.x, br.y, br.w, br.h);
        x.drawImage(spr, br.x + 6, br.y + 1);
      }
      // paddle: the IDE
      x.fillStyle = C.ink; x.fillRect(paddle.x - 1, paddle.y - 1, paddle.w + 2, 7);
      x.fillStyle = C.cyan; x.fillRect(paddle.x, paddle.y, paddle.w, 5);
      x.fillStyle = C.cyanL; x.fillRect(paddle.x, paddle.y, paddle.w, 1);
      x.fillStyle = C.ink; x.fillRect(paddle.x + 3, paddle.y + 2, 2, 1); x.fillRect(paddle.x + 7, paddle.y + 2, 6, 1);
      // balls: semicolons
      for (const b of balls) { x.fillStyle = '#ffffff'; x.fillRect(b.x | 0, b.y | 0, 3, 3); P.ditherGlow(x, b.x + 1.5, b.y + 1.5, 6, P.rgba(C.white, 1), 0.3); }
      for (const c of caps) {
        const col = c.kind === 'C' ? C.orange : c.kind === 'M' ? C.magenta : C.blue;
        x.fillStyle = C.ink; x.fillRect(c.x - 1, c.y - 1, 14, 9); x.fillStyle = col; x.fillRect(c.x, c.y, 12, 7);
        P.drawText(x, c.kind, c.x + 5, c.y + 1, '#ffffff', { font: 3 });
      }
      parts.forEach(p => { x.fillStyle = p.c; x.fillRect(p.x | 0, p.y | 0, 2, 2); });
      if (stuck) P.drawText(x, msg > 0 ? 'LEVEL ' + (level + 1) : 'PRESS F TO LAUNCH', W / 2, H / 2 + 20, C.yellow, { align: 'center', font: msg > 0 ? 5 : 3 });
      if (wide > 0) P.drawText(x, 'COFFEE!', 4, H - 7, C.orange, { font: 3 });
      if (slow > 0) P.drawText(x, 'SLOW-MO', W - 4, H - 7, C.blue, { font: 3, align: 'right' });
    };
    return g;
  }

  N.Games.register({
    id: 'breaker', name: 'BUG BREAKER', color: 'orange', devScore: 1200,
    blurb: { en: 'Production is full of bugs. Bounce a semicolon off your IDE and squash them all. Catch C for coffee.', zh: '线上全是 bug。用你的 IDE 把分号弹出去，把它们全部消灭。接住 C 喝咖啡。' },
    help: { en: '← → move the paddle. F launches. C = wider paddle, M = multi-ball, S = slow motion.', zh: '← → 移动挡板，F 发球。C = 加宽，M = 多球，S = 慢动作。' },
    create,
    attract(x, f) {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, 256, 224);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 10; i++) { x.fillStyle = P.mix(ROW_COLORS[j], C.ink, 0.6); x.fillRect(8 + i * 24, 130 + j * 13, 22, 10); }
      const bx = 128 + Math.sin(f * 0.04) * 100, by = 200 - Math.abs(Math.sin(f * 0.05)) * 80;
      x.fillStyle = '#ffffff'; x.fillRect(bx | 0, by | 0, 3, 3);
    }
  });
})();
