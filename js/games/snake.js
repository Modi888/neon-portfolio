/* NEON-8 arcade · NEON SNAKE: eat data bytes, don't bite your own tail */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const CELL = 8, COLS = 32, ROWS = 26;

  function create(api) {
    const g = { score: 0, over: false, label: '' };
    let snake = [{ x: 10, y: 13 }, { x: 9, y: 13 }, { x: 8, y: 13 }, { x: 7, y: 13 }];
    let dir = { x: 1, y: 0 }, queue = [], tick = 0, speed = 8, food = null, bonus = null, eaten = 0, dying = 0, parts = [], grow = 0;
    const occupied = (x, y) => snake.some(s => s.x === x && s.y === y);
    function place() {
      let x, y, n = 0;
      do { x = 1 + ((Math.random() * (COLS - 2)) | 0); y = 1 + ((Math.random() * (ROWS - 2)) | 0); n++; } while ((occupied(x, y) || (bonus && bonus.x === x && bonus.y === y)) && n < 500);
      return { x, y };
    }
    food = place();
    g.update = (input, pressed) => {
      if (dying) { dying--; parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.l--; }); if (dying === 0) g.over = true; return; }
      const want = pressed.up ? { x: 0, y: -1 } : pressed.down ? { x: 0, y: 1 } : pressed.left ? { x: -1, y: 0 } : pressed.right ? { x: 1, y: 0 } : null;
      if (want) {
        const lastD = queue.length ? queue[queue.length - 1] : dir;
        if (want.x !== -lastD.x || want.y !== -lastD.y) if (queue.length < 3) queue.push(want);
      }
      if (bonus && --bonus.t <= 0) bonus = null;
      if (++tick < speed) return;
      tick = 0;
      if (queue.length) dir = queue.shift();
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || occupied(head.x, head.y)) { die(); return; }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        g.score += 10; eaten++; grow += 1; api.sfx('coin');
        food = place();
        speed = Math.max(3, 8 - Math.floor(eaten / 5));
        if (!bonus && Math.random() < 0.22) { const b = place(); bonus = { x: b.x, y: b.y, t: 60 * 6 }; }
        burst(head.x, head.y, C.yellow);
      } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
        g.score += 50; grow += 3; bonus = null; api.sfx('powerup'); burst(head.x, head.y, C.magenta);
      }
      if (grow > 0) grow--; else snake.pop();
      g.label = 'LEN ' + snake.length;
    };
    function burst(cx, cy, col) { for (let k = 0; k < 10; k++) { const a = Math.random() * 6.28; parts.push({ x: cx * CELL + 4, y: cy * CELL + 4, vx: Math.cos(a) * 1.5, vy: Math.sin(a) * 1.5, l: 20, c: col }); } }
    function die() {
      api.sfx('explode'); dying = 50;
      snake.forEach((s, i) => { if (i % 2 === 0) parts.push({ x: s.x * CELL + 4, y: s.y * CELL + 4, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3, l: 50, c: i === 0 ? C.cyan : C.magenta }); });
    }
    g.draw = (x) => {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, 256, 212);
      x.fillStyle = '#120936';
      for (let i = 0; i <= COLS; i++) x.fillRect(i * CELL, 0, 1, ROWS * CELL);
      for (let j = 0; j <= ROWS; j++) x.fillRect(0, j * CELL, COLS * CELL, 1);
      x.fillStyle = C.violet; x.fillRect(0, 0, 256, 1); x.fillRect(0, ROWS * CELL - 1, 256, 1); x.fillRect(0, 0, 1, ROWS * CELL); x.fillRect(255, 0, 1, ROWS * CELL);
      // food
      const blink = (Date.now() / 200 | 0) % 2;
      x.fillStyle = C.yellow; x.fillRect(food.x * CELL + 1, food.y * CELL + 1, 6, 6);
      x.fillStyle = blink ? C.yellowL : C.yellowD; x.fillRect(food.x * CELL + 2, food.y * CELL + 2, 2, 2);
      P.ditherGlow(x, food.x * CELL + 4, food.y * CELL + 4, 10, P.rgba(C.yellow, 1), 0.25);
      if (bonus && (bonus.t > 90 || blink)) { x.fillStyle = C.magenta; x.fillRect(bonus.x * CELL, bonus.y * CELL, 8, 8); x.fillStyle = '#ffffff'; x.fillRect(bonus.x * CELL + 2, bonus.y * CELL + 2, 4, 4); P.ditherGlow(x, bonus.x * CELL + 4, bonus.y * CELL + 4, 14, P.rgba(C.magenta, 1), 0.3); }
      // snake
      if (!dying) snake.forEach((s, i) => {
        const tt = i / Math.max(1, snake.length - 1);
        x.fillStyle = P.mix(C.cyan, C.magenta, tt);
        x.fillRect(s.x * CELL + 1, s.y * CELL + 1, 6, 6);
        if (i === 0) {
          x.fillStyle = C.ink;
          const ex = dir.x === 0 ? [2, 5] : [dir.x > 0 ? 5 : 2, dir.x > 0 ? 5 : 2], ey = dir.y === 0 ? [2, 5] : [dir.y > 0 ? 5 : 2, dir.y > 0 ? 5 : 2];
          x.fillRect(s.x * CELL + ex[0], s.y * CELL + ey[0], 1, 1); x.fillRect(s.x * CELL + ex[1], s.y * CELL + ey[1], 1, 1);
        }
      });
      parts.forEach(p => { if (p.l > 0) { x.fillStyle = p.c; x.fillRect(p.x | 0, p.y | 0, 2, 2); } });
      parts = parts.filter(p => p.l > 0);
    };
    return g;
  }

  N.Games.register({
    id: 'snake', name: 'NEON SNAKE', color: 'lime', devScore: 420,
    blurb: { en: 'Eat data bytes, grow, go faster. Pink bytes are worth more but they vanish.', zh: '吃数据块，变长，变快。粉色数据块分更高，但会消失。' },
    help: { en: 'Arrows steer. Don\'t hit the walls or yourself.', zh: '方向键转向。别撞墙，也别咬到自己。' },
    create,
    attract(x, f) {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, 256, 224);
      for (let k = 0; k < 18; k++) {
        const tt = ((f * 0.6 + k * 8) % 300) / 300;
        const px = 20 + Math.sin(tt * 12.56) * 100 + 108, py = 120 + Math.cos(tt * 6.28) * 60;
        x.fillStyle = P.mix(C.cyan, C.magenta, k / 18); x.fillRect(px | 0, py | 0, 6, 6);
      }
    }
  });
})();
