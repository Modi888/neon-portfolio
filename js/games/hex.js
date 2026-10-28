/* NEON-8 arcade · HEX APPEAL: match a color by eye, scored by perceptual distance (CIE ΔE) */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const W = 256, H = 212, ROUNDS = 5, TIME = 20;
  const hex = (c) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  function lab(c) {
    const lin = c.map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    const X = (lin[0] * 0.4124 + lin[1] * 0.3576 + lin[2] * 0.1805) / 0.95047, Y = lin[0] * 0.2126 + lin[1] * 0.7152 + lin[2] * 0.0722, Z = (lin[0] * 0.0193 + lin[1] * 0.1192 + lin[2] * 0.9505) / 1.08883;
    const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  }
  const deltaE = (a, b) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
  function randColor() {
    const h = Math.random() * 6, s = 0.35 + Math.random() * 0.65, v = 0.45 + Math.random() * 0.55;
    const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
    const rgb = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
    return rgb.map(x => Math.round(x * 255));
  }

  function create(api) {
    const g = { score: 0, over: false, label: '1/5' };
    let round = 0, target, mine, ch = 0, state, timer, held = 0, result = null, frame = 0, peek = 0;
    function next() {
      target = randColor(); mine = [128, 128, 128]; ch = 0; timer = TIME * 60; state = 'pick'; result = null;
      peek = round >= 3 ? 60 * 3 : 0;  // the last two rounds are from memory
      g.label = `${round + 1}/${ROUNDS}`;
    }
    next();
    function lock() {
      const d = deltaE(target, mine);
      const pts = Math.round(Math.max(0, 100 - d * 2.2));
      g.score += pts;
      const word = d < 3 ? 'PIXEL PERFECT' : d < 8 ? 'SO CLOSE' : d < 15 ? 'NICE EYE' : d < 30 ? 'NOT BAD' : 'COLORBLIND MODE?';
      result = { d, pts, word };
      state = 'reveal';
      api.sfx(d < 8 ? 'powerup' : 'lock');
      if (d < 3) N.Ach.unlock('hexpert');
    }
    g.update = (inp, pr) => {
      frame++;
      if (state === 'reveal') {
        if (pr.a || pr.start) { round++; if (round >= ROUNDS) { g.won = true; g.overTitle = g.score >= 400 ? 'DESIGNER EYES' : g.score >= 250 ? 'NICE PALETTE' : 'TRY AGAIN'; g.over = true; return; } next(); api.sfx('select'); }
        return;
      }
      if (peek > 0) peek--;
      if (--timer <= 0) { lock(); return; }
      if (pr.up) { ch = (ch + 2) % 3; api.sfx('blip'); }
      if (pr.down) { ch = (ch + 1) % 3; api.sfx('blip'); }
      const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      if (dir) {
        held++;
        if (pr.left || pr.right) mine[ch] = N.clamp(mine[ch] + dir * 4, 0, 255);
        else if (held > 14) mine[ch] = N.clamp(mine[ch] + dir * 3, 0, 255);
        if (held % 6 === 0) api.sfx('tick');
      } else held = 0;
      if (pr.a || pr.start) lock();
    };
    g.draw = (x) => {
      x.fillStyle = '#07031a'; x.fillRect(0, 0, W, H);
      // timer
      const tw = Math.round((W - 32) * Math.max(0, timer) / (TIME * 60));
      x.fillStyle = '#1a0d45'; x.fillRect(16, 4, W - 32, 3);
      x.fillStyle = timer < 5 * 60 ? C.red : C.cyan; x.fillRect(16, 4, tw, 3);
      swatch(x, 16, 16, target, peek > 0 || round < 3 || state === 'reveal', round >= 3 ? 'MEMORY' : 'TARGET');
      swatch(x, 136, 16, mine, true, 'YOU');
      if (state === 'reveal') {
        P.drawText(x, hex(target), 68, 98, '#ffffff', { align: 'center' });
        P.drawText(x, hex(mine), 188, 98, '#ffffff', { align: 'center' });
        P.drawText(x, result.word, W / 2, 124, result.d < 8 ? C.lime : result.d < 20 ? C.yellow : C.red, { align: 'center', scale: result.word.length > 10 ? 1 : 2 });
        P.drawText(x, `DELTA E ${result.d.toFixed(1)}   +${result.pts}`, W / 2, 148, C.lilac, { align: 'center' });
        P.drawText(x, 'PRESS ' + N.padA() + (round + 1 >= ROUNDS ? ' FOR RESULTS' : ' FOR NEXT ROUND'), W / 2, 176, (frame >> 4) % 2 ? C.yellow : C.grey, { font: 3, align: 'center' });
        return;
      }
      ['R', 'G', 'B'].forEach((name, i) => {
        const y = 110 + i * 22, on = i === ch;
        P.drawText(x, on ? '▶' : ' ', 10, y + 2, C.yellow, { font: 3 });
        P.drawText(x, name, 20, y + 1, on ? '#ffffff' : C.grey);
        // the bar shows what this channel does with the other two held where they are
        for (let k = 0; k < 160; k++) { const c = mine.slice(); c[i] = Math.round(k / 159 * 255); x.fillStyle = css(c); x.fillRect(34 + k, y, 1, 9); }
        x.fillStyle = on ? C.yellow : '#3a2a6a'; x.fillRect(33, y - 1, 162, 1); x.fillRect(33, y + 9, 162, 1);
        const hx = 34 + Math.round(mine[i] / 255 * 159);
        x.fillStyle = C.ink; x.fillRect(hx - 2, y - 3, 5, 15); x.fillStyle = '#ffffff'; x.fillRect(hx - 1, y - 2, 3, 13);
        P.drawText(x, String(mine[i]).padStart(3, ' '), 214, y + 1, on ? '#ffffff' : C.grey, { mono: true });
      });
      P.drawText(x, hex(mine), W / 2, 180, C.cyan, { align: 'center' });
      P.drawText(x, '▲▼ CHANNEL  ◀▶ ADJUST  F LOCK IN', W / 2, 196, C.grey, { font: 3, align: 'center' });
      if (peek > 0) P.drawText(x, 'MEMORIZE IT ' + Math.ceil(peek / 60), 68, 98, C.yellow, { font: 3, align: 'center' });
    };
    function swatch(x, sx, sy, col, visible, label) {
      x.fillStyle = C.ink; x.fillRect(sx - 2, sy - 2, 108, 74);
      x.fillStyle = '#3a2a6a'; x.fillRect(sx - 1, sy - 1, 106, 72);
      if (visible) { x.fillStyle = css(col); x.fillRect(sx, sy, 104, 70); }
      else { for (let j = 0; j < 70; j += 4) for (let i = 0; i < 104; i += 4) { x.fillStyle = ((i + j) / 4) % 2 ? '#1a0d45' : '#24124f'; x.fillRect(sx + i, sy + j, 4, 4); } P.drawText(x, '?', sx + 52, sy + 28, C.grey, { scale: 2, align: 'center' }); }
      P.drawText(x, label, sx + 52, sy + 74, C.grey, { font: 3, align: 'center' });
    }
    return g;
  }

  N.Games.register({
    id: 'hex', name: 'HEX APPEAL', color: 'yellow', devScore: 380,
    blurb: { en: 'Five colors. Rebuild each one with three sliders. The last two you only see for three seconds.', zh: '五种颜色，用三个滑块把它们调出来。最后两种只给你看三秒。' },
    help: { en: '▲▼ pick R, G or B. ◀▶ adjust (hold to go fast). F locks it in. Scored by perceptual color difference.', zh: '▲▼ 选择 R/G/B，◀▶ 调整（按住加速），F 确定。按人眼感知的色差打分。' },
    create,
    attract(x, f) {
      for (let i = 0; i < 16; i++) for (let j = 0; j < 14; j++) {
        const h = ((i * 22 + j * 9 + f) % 360);
        x.fillStyle = `hsl(${h},80%,${35 + ((i + j) % 3) * 10}%)`; x.fillRect(i * 16, j * 16, 16, 16);
      }
    }
  });
})();
