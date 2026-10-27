/* NEON-8 arcade · DEADLINE INVADERS: meetings, bugs, emails and todos descend */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const W = 256, H = 212;
  // 11x8 enemies, two frames each
  const ART = {
    meeting: [['kkkkkkkkkkk', 'kwkwwwwwkwk', 'kkkkkkkkkkk', 'kwwwwwwwwwk', 'kwmwwmwwmwk', 'kwwwwwwwwwk', 'kwmwwmwwwwk', 'kkkkkkkkkkk'], ['kwk.....kwk', 'kkkkkkkkkkk', 'kwwwwwwwwwk', 'kwmwwmwwmwk', 'kwwwwwwwwwk', 'kwmwwmwwwwk', 'kkkkkkkkkkk', '.k.......k.']],
    bug: [['..k.....k..', '...k...k...', '..kkkkkkk..', '.kkgkkkgkk.', 'kkkkkkkkkkk', 'k.kkkkkkk.k', 'k.k.....k.k', '...kk.kk...'], ['..k.....k..', 'k..k...k..k', 'k.kkkkkkk.k', 'kkkgkkkgkkk', 'kkkkkkkkkkk', '.kkkkkkkkk.', '..k.....k..', '.k.......k.']],
    email: [['kkkkkkkkkkk', 'kk.......kk', 'k.k.....k.k', 'k..k...k..k', 'k...kkk...k', 'k.........k', 'kkkkkkkkkkk', '...........'], ['...........', 'kkkkkkkkkkk', 'kk.......kk', 'k.k.....k.k', 'k..k...k..k', 'k...kkk...k', 'k.........k', 'kkkkkkkkkkk']],
    todo: [['kkkkkkk....', 'k.....k....', 'k.....k...k', 'k.....k..k.', 'k.k...k.k..', 'k..k..kk...', 'k...kkk....', 'kkkkkkk....'], ['kkkkkkk....', 'k.....k....', 'k.....k....', 'k.....k....', 'k.....k....', 'k.....k....', 'k.....k....', 'kkkkkkk....']]
  };
  const ROWS = [['meeting', C.magenta, 40], ['bug', C.lime, 30], ['email', C.cyan, 20], ['todo', C.yellow, 10]];
  const spr = {};
  for (const k in ART) spr[k] = ROWS.map(r => r[1]).map(col => ART[k].map(rows => P.sprite(rows, { k: col, w: '#1a0d45', g: C.ink, m: col })));
  const ship = P.sprite(['....kkkkk....', '....kcccck...', '....kcwwck...', '....kcccck...', 'kkkkkkkkkkkkk', 'kgggggggggggk', 'kgkgkgkgkgkgk', 'kkkkkkkkkkkkk'], { k: C.ink, c: C.cyan, w: '#ffffff', g: '#8f86b3' });
  const ufoSpr = P.sprite(['.....kkkkk.....', '...kkmmmmmkk...', '.kkmmwmwmwmmkk.', 'kmmmmmmmmmmmmmk', '.kkk.kk.kk.kkk.', '..k...k.k...k..'], { k: C.ink, m: C.orange, w: '#ffffff' });

  function create(api) {
    const g = { score: 0, over: false, lives: 3, label: 'WAVE 1' };
    let wave = 0, enemies = [], dir = 1, stepT = 0, frame = 0, shots = [], bombs = [], shields = [], parts = [], ufo = null, px = W / 2 - 6, cool = 0, hitT = 0, banner = 80;
    function build() {
      enemies = [];
      for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) enemies.push({ x: 26 + i * 24, y: 20 + j * 16, row: j, alive: true });
      dir = 1; stepT = 0; banner = 80;
      g.label = 'WAVE ' + (wave + 1);
      if (wave === 0 || wave % 2 === 0) {
        shields = [];
        // three coffee-cup bunkers made of blocks
        [44, 122, 200].forEach(sx => {
          const cup = ['.######.', '########', '##....##', '##....##.', '########'];
          cup.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') shields.push({ x: sx - 12 + i * 3, y: H - 42 + j * 3, hp: 2 }); }));
          shields.push({ x: sx + 12, y: H - 39, hp: 2 }, { x: sx + 12, y: H - 36, hp: 2 });
        });
      }
    }
    build();
    g.update = (inp, pr) => {
      frame++;
      if (banner > 0) banner--;
      if (hitT > 0) { hitT--; if (hitT === 0 && g.lives <= 0) g.over = true; parts.forEach(stepPart); return; }
      px = N.clamp(px + (inp.left ? -2.4 : 0) + (inp.right ? 2.4 : 0), 2, W - 15);
      if (cool > 0) cool--;
      if ((pr.a || pr.up || (inp.a && cool === 0)) && shots.length < 2 && cool === 0) { shots.push({ x: px + 6, y: H - 20 }); cool = 16; api.sfx('laser'); }
      // formation
      const alive = enemies.filter(e => e.alive);
      if (!alive.length) { wave++; g.score += 200; api.sfx('powerup'); build(); return; }
      const interval = Math.max(4, 40 - (32 - alive.length) - wave * 4);
      if (++stepT >= interval) {
        stepT = 0;
        const minX = Math.min(...alive.map(e => e.x)), maxX = Math.max(...alive.map(e => e.x));
        if ((dir > 0 && maxX + 13 > W - 4) || (dir < 0 && minX - 2 < 4)) { dir = -dir; alive.forEach(e => e.y += 6); }
        else alive.forEach(e => e.x += dir * 4);
        api.sfx('tick');
      }
      if (alive.some(e => e.y > H - 52)) { g.lives = 0; hitT = 60; explode(px + 6, H - 14, C.cyan); return; }
      // bombs
      if (Math.random() < 0.012 + wave * 0.004 && bombs.length < 3 + wave) {
        const shooter = N.pick(alive);
        bombs.push({ x: shooter.x + 5, y: shooter.y + 8, v: 1.2 + wave * 0.15 });
      }
      // ufo: scope creep
      if (!ufo && Math.random() < 0.0025) ufo = { x: -16, dir: 1 };
      if (ufo) { ufo.x += 1.1 * ufo.dir; if (ufo.x > W + 20) ufo = null; }
      // move shots
      for (const s of shots) {
        s.y -= 4.2;
        for (const e of alive) if (s.y > -10 && s.x >= e.x && s.x <= e.x + 11 && s.y >= e.y && s.y <= e.y + 8) { e.alive = false; s.y = -99; g.score += ROWS[e.row][2]; explode(e.x + 5, e.y + 4, ROWS[e.row][1]); api.sfx('hit'); break; }
        if (ufo && s.y > 0 && s.y < 12 && s.x >= ufo.x && s.x <= ufo.x + 15) { const pts = N.pick([100, 150, 300]); g.score += pts; explode(ufo.x + 7, 6, C.orange); parts.push({ x: ufo.x + 7, y: 10, vx: 0, vy: -0.3, l: 60, text: String(pts) }); ufo = null; s.y = -99; api.sfx('explode'); }
        for (const b of shields) if (b.hp > 0 && s.x >= b.x && s.x <= b.x + 3 && s.y >= b.y && s.y <= b.y + 3) { b.hp--; s.y = -99; break; }
      }
      shots = shots.filter(s => s.y > -6);
      for (const b of bombs) {
        b.y += b.v;
        for (const sh of shields) if (sh.hp > 0 && b.x >= sh.x - 1 && b.x <= sh.x + 3 && b.y + 4 >= sh.y && b.y <= sh.y + 3) { sh.hp--; b.y = H + 99; break; }
        if (b.y + 4 >= H - 14 && b.y <= H - 6 && b.x >= px && b.x <= px + 13) { b.y = H + 99; g.lives--; hitT = g.lives > 0 ? 50 : 70; explode(px + 6, H - 10, C.cyan); api.sfx('explode'); bombs = []; break; }
      }
      bombs = bombs.filter(b => b.y < H);
      parts.forEach(stepPart); parts = parts.filter(p => p.l > 0);
    };
    function stepPart(p) { p.x += p.vx; p.y += p.vy; p.l--; }
    function explode(x, y, col) { for (let k = 0; k < 12; k++) { const a = Math.random() * 6.28; parts.push({ x, y, vx: Math.cos(a) * 1.6, vy: Math.sin(a) * 1.6, l: 22, c: col }); } }
    g.draw = (x) => {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, W, H);
      for (let k = 0; k < 40; k++) { x.fillStyle = k % 5 ? '#2a1a5a' : '#5a4a9a'; x.fillRect((k * 53) % W, (k * 37 + frame * (k % 3 + 1) * 0.1) % H | 0, 1, 1); }
      const fr = (frame >> 4) % 2;
      for (const e of enemies) if (e.alive) x.drawImage(spr[ROWS[e.row][0]][e.row][fr], e.x, e.y);
      for (const b of shields) if (b.hp > 0) { x.fillStyle = b.hp > 1 ? '#8a5a3a' : '#5a3a2a'; x.fillRect(b.x, b.y, 3, 3); }
      if (ufo) { x.drawImage(ufoSpr, ufo.x | 0, 2); P.drawText(x, 'SCOPE CREEP', ufo.x + 7, 0, C.orange, { font: 3, align: 'center' }); }
      x.fillStyle = C.cyanL; for (const s of shots) x.fillRect(s.x | 0, s.y | 0, 1, 4);
      for (const b of bombs) P.drawText(x, '!', b.x | 0, b.y | 0, C.red, { font: 3 });
      if (!(hitT > 0 && frame % 6 < 3)) x.drawImage(ship, px | 0, H - 14);
      x.fillStyle = '#3a2a6a'; x.fillRect(0, H - 4, W, 1);
      parts.forEach(p => { if (p.text) P.drawText(x, p.text, p.x | 0, p.y | 0, C.orange, { font: 3, align: 'center' }); else { x.fillStyle = p.c; x.fillRect(p.x | 0, p.y | 0, 2, 2); } });
      if (banner > 0) P.drawText(x, 'WAVE ' + (wave + 1), W / 2, H / 2, C.yellow, { align: 'center', scale: 2 });
    };
    return g;
  }

  N.Games.register({
    id: 'invaders', name: 'DEADLINE INVADERS', color: 'magenta', devScore: 2600,
    blurb: { en: 'Meetings, bugs, emails and todos are descending on your calendar. Hold the line behind your coffee cups.', zh: '会议、bug、邮件和待办正在压向你的日程表。躲在咖啡杯后面守住防线！' },
    help: { en: '← → move. F fires. Shoot the SCOPE CREEP saucer for bonus points.', zh: '← → 移动，F 发射。打掉"需求蔓延"飞碟可以得高分。' },
    create,
    attract(x, f) {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, 256, 224);
      const fr = (f >> 4) % 2;
      ROWS.forEach((r, j) => { for (let i = 0; i < 8; i++) x.drawImage(spr[r[0]][j][fr], 26 + i * 24 + Math.sin(f * 0.02) * 10, 120 + j * 16); });
    }
  });
})();
