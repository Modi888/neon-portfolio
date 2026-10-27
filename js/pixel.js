/* NEON-8 · pixel toolkit: palette, bitmap fonts, sprite + dither helpers */
(function () {
  const N = window.NEON;

  const PAL = {
    ink: '#0a0618', night: '#120936', night2: '#1a0d45', dusk: '#241257', plum: '#311a6e', violet: '#45278f',
    lav: '#8f72d9', lilac: '#c3b2f2', white: '#f4ecff', pure: '#ffffff', grey: '#9b8ac4',
    magenta: '#ff3ea5', magentaD: '#a3196b', magentaL: '#ffb3dc',
    cyan: '#29f3ff', cyanD: '#127a9e', cyanL: '#c4fbff',
    yellow: '#ffd93b', yellowD: '#b8860b', yellowL: '#fff2a8',
    lime: '#7dff5a', limeD: '#2a9c3f', limeL: '#d4ffc4',
    orange: '#ff8a3d', orangeD: '#b34a12', orangeL: '#ffd0a8',
    red: '#ff4d6d', redD: '#a3162f', blue: '#4d7cff', blueD: '#22307a',
    vio: '#b26bff', vioD: '#5d2a99', vioL: '#e2c4ff',
    skin: '#f4b993', skinD: '#c97f5f', hair: '#26123d', hairL: '#4b2a70',
    win: '#0d0722', warm: '#ffc96b', warm2: '#ff9f4a', cool: '#8be9ff', tv: '#7f8cff', pink: '#ff8fd0'
  };
  // neon key -> [main, dark, light]
  const NEONS = {
    magenta: [PAL.magenta, PAL.magentaD, PAL.magentaL],
    cyan: [PAL.cyan, PAL.cyanD, PAL.cyanL],
    yellow: [PAL.yellow, PAL.yellowD, PAL.yellowL],
    lime: [PAL.lime, PAL.limeD, PAL.limeL],
    orange: [PAL.orange, PAL.orangeD, PAL.orangeL],
    violet: [PAL.vio, PAL.vioD, PAL.vioL],
    blue: [PAL.blue, PAL.blueD, '#c2d1ff'],
    red: [PAL.red, PAL.redD, '#ffc2cd']
  };

  /* ---------------- color math ---------------- */
  const hexToRgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  const rgba = (h, a) => { const [r, g, b] = hexToRgb(h); return `rgba(${r},${g},${b},${a})`; };

  /* ---------------- canvases ---------------- */
  function canvas(w, h) {
    const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    return { c, x };
  }
  function flipped(src) {
    const { c, x } = canvas(src.width, src.height);
    x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0); return c;
  }

  /* ---------------- 5x7 font ---------------- */
  const G5 = {
    'A': '.###.|#...#|#...#|#####|#...#|#...#|#...#', 'B': '####.|#...#|#...#|####.|#...#|#...#|####.',
    'C': '.###.|#...#|#....|#....|#....|#...#|.###.', 'D': '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
    'E': '#####|#....|#....|####.|#....|#....|#####', 'F': '#####|#....|#....|####.|#....|#....|#....',
    'G': '.###.|#...#|#....|#.###|#...#|#...#|.####', 'H': '#...#|#...#|#...#|#####|#...#|#...#|#...#',
    'I': '###|.#.|.#.|.#.|.#.|.#.|###', 'J': '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
    'K': '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', 'L': '#....|#....|#....|#....|#....|#....|#####',
    'M': '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', 'N': '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
    'O': '.###.|#...#|#...#|#...#|#...#|#...#|.###.', 'P': '####.|#...#|#...#|####.|#....|#....|#....',
    'Q': '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', 'R': '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    'S': '.####|#....|#....|.###.|....#|....#|####.', 'T': '#####|..#..|..#..|..#..|..#..|..#..|..#..',
    'U': '#...#|#...#|#...#|#...#|#...#|#...#|.###.', 'V': '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
    'W': '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', 'X': '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    'Y': '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', 'Z': '#####|....#|...#.|..#..|.#...|#....|#####',
    '0': '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', '1': '.#.|##.|.#.|.#.|.#.|.#.|###',
    '2': '.###.|#...#|....#|...#.|..#..|.#...|#####', '3': '#####|...#.|..#..|...#.|....#|#...#|.###.',
    '4': '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', '5': '#####|#....|####.|....#|....#|#...#|.###.',
    '6': '..##.|.#...|#....|####.|#...#|#...#|.###.', '7': '#####|....#|...#.|..#..|.#...|.#...|.#...',
    '8': '.###.|#...#|#...#|.###.|#...#|#...#|.###.', '9': '.###.|#...#|#...#|.####|....#|...#.|.##..',
    ' ': '..|..|..|..|..|..|..', '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|.#|#.', ':': '.|.|#|.|#|.|.',
    ';': '..|..|.#|..|.#|.#|#.', '!': '#|#|#|#|#|.|#', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
    '-': '...|...|...|###|...|...|...', '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '=': '....|....|####|....|####|....|....',
    '/': '....#|....#|...#.|..#..|.#...|#....|#....', '\\': '#....|#....|.#...|..#..|...#.|....#|....#',
    "'": '#|#|.|.|.|.|.', '"': '#.#|#.#|...|...|...|...|...', '(': '..#|.#.|#..|#..|#..|.#.|..#', ')': '#..|.#.|..#|..#|..#|.#.|#..',
    '[': '##|#.|#.|#.|#.|#.|##', ']': '##|.#|.#|.#|.#|.#|##', '_': '.....|.....|.....|.....|.....|.....|#####',
    '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.', '%': '##...|##..#|...#.|..#..|.#...|#..##|...##',
    '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#', '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
    '<': '...#|..#.|.#..|#...|.#..|..#.|...#', '>': '#...|.#..|..#.|...#|..#.|.#..|#...',
    '@': '.###.|#...#|#.###|#.#.#|#.###|#....|.###.', '$': '..#..|.####|#.#..|.###.|..#.#|####.|..#..',
    '^': '..#..|.###.|#####|.....|.....|.....|.....', '~': '.....|.....|.#..#|#.##.|.....|.....|.....',
    '♥': '.....|.#.#.|#####|#####|.###.|..#..|.....', '★': '..#..|..#..|#####|.###.|.#.#.|#...#|.....',
    '♪': '..##.|..#.#|..#..|..#..|###..|###..|.....', '▲': '.....|.....|..#..|.###.|#####|.....|.....',
    '▼': '.....|.....|#####|.###.|..#..|.....|.....', '▶': '#...|##..|###.|####|###.|##..|#...', '◀': '...#|..##|.###|####|.###|..##|...#',
    '·': '.|.|.|#|.|.|.', '×': '.....|#...#|.#.#.|..#..|.#.#.|#...#|.....', '█': '#####|#####|#####|#####|#####|#####|#####',
    '░': '#.#.#|.#.#.|#.#.#|.#.#.|#.#.#|.#.#.|#.#.#', '◎': '.###.|#...#|#.#.#|#.#.#|#.#.#|#...#|.###.',
    '|': '#|#|#|#|#|#|#', '`': '#.|.#|..|..|..|..|..', '{': '..#|.#.|.#.|#..|.#.|.#.|..#', '}': '#..|.#.|.#.|..#|.#.|.#.|#..',
    '↑': '..#..|.###.|#.#.#|..#..|..#..|..#..|..#..', '→': '.....|...#.|....#|#####|....#|...#.|.....', '←': '.....|.#...|#....|#####|#....|.#...|.....', '↓': '..#..|..#..|..#..|..#..|#.#.#|.###.|..#..'
  };
  /* ---------------- 3x5 font ---------------- */
  const G3 = {
    'A': '.#.|#.#|###|#.#|#.#', 'B': '##.|#.#|##.|#.#|##.', 'C': '.##|#..|#..|#..|.##', 'D': '##.|#.#|#.#|#.#|##.',
    'E': '###|#..|##.|#..|###', 'F': '###|#..|##.|#..|#..', 'G': '.##|#..|#.#|#.#|.##', 'H': '#.#|#.#|###|#.#|#.#',
    'I': '###|.#.|.#.|.#.|###', 'J': '..#|..#|..#|#.#|.#.', 'K': '#.#|#.#|##.|#.#|#.#', 'L': '#..|#..|#..|#..|###',
    'M': '#.#|###|###|#.#|#.#', 'N': '##.|#.#|#.#|#.#|#.#', 'O': '.#.|#.#|#.#|#.#|.#.', 'P': '##.|#.#|##.|#..|#..',
    'Q': '.#.|#.#|#.#|##.|.##', 'R': '##.|#.#|##.|#.#|#.#', 'S': '.##|#..|.#.|..#|##.', 'T': '###|.#.|.#.|.#.|.#.',
    'U': '#.#|#.#|#.#|#.#|###', 'V': '#.#|#.#|#.#|#.#|.#.', 'W': '#.#|#.#|###|###|#.#', 'X': '#.#|#.#|.#.|#.#|#.#',
    'Y': '#.#|#.#|.#.|.#.|.#.', 'Z': '###|..#|.#.|#..|###',
    '0': '###|#.#|#.#|#.#|###', '1': '.#.|##.|.#.|.#.|###', '2': '##.|..#|.#.|#..|###', '3': '##.|..#|.#.|..#|##.',
    '4': '#.#|#.#|###|..#|..#', '5': '###|#..|##.|..#|##.', '6': '.##|#..|###|#.#|###', '7': '###|..#|.#.|.#.|.#.',
    '8': '###|#.#|###|#.#|###', '9': '###|#.#|###|..#|##.',
    ' ': '..|..|..|..|..', '.': '.|.|.|.|#', ':': '.|#|.|#|.', '-': '...|...|###|...|...', '!': '#|#|#|.|#',
    '?': '##.|..#|.#.|...|.#.', '/': '..#|..#|.#.|#..|#..', '%': '#.#|..#|.#.|#..|#.#', '+': '...|.#.|###|.#.|...',
    '<': '..#|.#.|#..|.#.|..#', '>': '#..|.#.|..#|.#.|#..', "'": '#|#|.|.|.', '_': '...|...|...|...|###',
    '#': '#.#|###|#.#|###|#.#', '=': '...|###|...|###|...', '♥': '#.#|###|###|.#.|...', '★': '.#.|###|.#.|#.#|...',
    '(': '.#|#.|#.|#.|.#', ')': '#.|.#|.#|.#|#.', '&': '.#.|#.#|.#.|#.#|.##', '@': '###|#.#|#.#|#..|###',
    '▲': '...|.#.|###|...|...', '▶': '#..|##.|###|##.|#..', '◀': '..#|.##|###|.##|..#', ',': '.|.|.|#|#', '·': '.|.|#|.|.',
    '◎': '###|#.#|#.#|#.#|###', '×': '...|#.#|.#.|#.#|...', '[': '##|#.|#.|#.|##', ']': '##|.#|.#|.#|##',
    '▼': '...|###|.#.|...|...', '^': '.#.|#.#|...|...|...', '*': '#.#|.#.|#.#|...|...', '"': '#.#|#.#|...|...|...', ';': '.|#|.|#|#',
    '$': '.##|##.|.#.|.##|##.', '|': '#|#|#|#|#', '~': '....|.#.#|#.#.|....|....', '`': '#.|.#|..|..|..', '{': '.#|#.|##|#.|.#', '}': '#.|.#|##|.#|#.', '↑': '.#.|###|.#.|.#.|.#.', '↓': '.#.|.#.|.#.|###|.#.', '←': '...|#..|###|#..|...', '→': '...|..#|###|..#|...'
  };
  function compile(set) {
    const out = {};
    for (const k in set) {
      const rows = set[k].split('|');
      out[k] = { w: rows[0].length, h: rows.length, rows };
    }
    return out;
  }
  const FONTS = { 5: { g: compile(G5), h: 7 }, 3: { g: compile(G3), h: 5 } };

  // typographic look-alikes; anything still unknown renders as a blank instead of a stray "?"
  const ALIAS = { '—': '-', '–': '-', '“': '"', '”': '"', '‘': "'", '’': "'", '…': '.', '•': '·', '™': ' ', '©': '@' };
  function glyph(font, ch) {
    return font.g[ch] || font.g[ch.toUpperCase()] || (ALIAS[ch] && font.g[ALIAS[ch]]) || font.g[' '];
  }
  function measure(text, opts = {}) {
    const font = FONTS[opts.font || 5], sc = opts.scale || 1, sp = opts.spacing == null ? 1 : opts.spacing;
    let w = 0;
    for (const ch of String(text)) w += (opts.mono ? (opts.font === 3 ? 3 : 5) : glyph(font, ch).w) + sp;
    return Math.max(0, (w - sp) * sc);
  }
  function drawText(ctx, text, x, y, color, opts = {}) {
    const font = FONTS[opts.font || 5], sc = opts.scale || 1, sp = opts.spacing == null ? 1 : opts.spacing;
    const total = measure(text, opts);
    if (opts.align === 'center') x -= (total / 2) | 0; else if (opts.align === 'right') x -= total;
    ctx.fillStyle = color;
    let cx = x | 0; y = y | 0;
    for (const ch of String(text)) {
      const g = glyph(font, ch);
      const cw = opts.mono ? (opts.font === 3 ? 3 : 5) : g.w;
      const off = opts.mono ? ((cw - g.w) / 2) | 0 : 0;
      for (let r = 0; r < g.h; r++) {
        const row = g.rows[r];
        for (let c = 0; c < row.length; c++) if (row[c] === '#') ctx.fillRect(cx + (c + off) * sc, y + r * sc, sc, sc);
      }
      cx += (cw + sp) * sc;
    }
    return total;
  }
  const textCache = new Map();
  function textCanvas(text, color, opts = {}) {
    const key = text + '|' + color + '|' + JSON.stringify(opts);
    if (textCache.has(key)) return textCache.get(key);
    const font = FONTS[opts.font || 5], sc = opts.scale || 1;
    const w = measure(text, opts), h = font.h * sc;
    const { c, x } = canvas(w + 2, h + 2);
    if (opts.shadow) drawText(x, text, 1, 1, opts.shadow, Object.assign({}, opts, { align: 'left' }));
    drawText(x, text, 0, 0, color, Object.assign({}, opts, { align: 'left' }));
    textCache.set(key, c);
    return c;
  }
  // neon tube text: soft glow + hot core, baked into a canvas
  function neonText(text, color, opts = {}) {
    const key = 'neon|' + text + '|' + color + '|' + JSON.stringify(opts);
    if (textCache.has(key)) return textCache.get(key);
    const font = FONTS[opts.font || 5], sc = opts.scale || 1, pad = opts.pad == null ? 6 : opts.pad;
    const w = measure(text, opts), h = font.h * sc;
    const { c, x } = canvas(w + pad * 2, h + pad * 2);
    const o = Object.assign({}, opts, { align: 'left' });
    if (!opts.off) {
      x.shadowColor = color; x.shadowBlur = opts.blur || 5;
      drawText(x, text, pad, pad, color, o);
      drawText(x, text, pad, pad, color, o);
      x.shadowBlur = 0;
      drawText(x, text, pad, pad, opts.core || mix(color, '#ffffff', 0.55), o);
    } else {
      drawText(x, text, pad, pad, opts.offColor || mix(color, PAL.night, 0.72), o);
    }
    textCache.set(key, c);
    return c;
  }

  /* ---------------- sprites ---------------- */
  // rows: array of strings; map: char -> color ('.' = transparent)
  function sprite(rows, map) {
    const h = rows.length, w = Math.max(...rows.map(r => r.length));
    const { c, x } = canvas(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i]; if (ch === '.' || ch === ' ') continue;
      const col = map[ch]; if (!col) continue;
      x.fillStyle = col; x.fillRect(i, j, 1, 1);
    }
    return c;
  }
  function tint(src, color) {
    const { c, x } = canvas(src.width, src.height);
    x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function glow(src, color, blur = 4) {
    const pad = blur * 2;
    const { c, x } = canvas(src.width + pad * 2, src.height + pad * 2);
    x.shadowColor = color; x.shadowBlur = blur; x.drawImage(src, pad, pad); x.shadowBlur = 0; x.drawImage(src, pad, pad);
    c.pad = pad;
    return c;
  }

  /* ---------------- dithering ---------------- */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
  function dither(ctx, x, y, w, h, color, density, ox = 0, oy = 0) {
    if (density <= 0) return;
    ctx.fillStyle = color;
    if (density >= 1) { ctx.fillRect(x, y, w, h); return; }
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (BAYER[((j + oy) & 3) * 4 + ((i + ox) & 3)] < density) ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
  // vertical banded gradient with dithered transitions between stops: [[pos 0..1, color], ...]
  function ditherGradient(ctx, x, y, w, h, stops) {
    for (let j = 0; j < h; j++) {
      const t = j / Math.max(1, h - 1);
      let k = 0; while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
      const [p0, c0] = stops[k], [p1, c1] = stops[k + 1];
      const lt = N.clamp((t - p0) / Math.max(0.0001, p1 - p0), 0, 1);
      ctx.fillStyle = c0; ctx.fillRect(x, y + j, w, 1);
      ctx.fillStyle = c1;
      for (let i = 0; i < w; i++) if (BAYER[(j & 3) * 4 + (i & 3)] < lt) ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
  // soft radial glow (smooth falloff; the low-res canvas keeps it chunky when upscaled)
  function ditherGlow(ctx, cx, cy, r, color, strength = 0.6) {
    const m = /rgba?\(([^)]+)\)/.exec(color);
    let rgb;
    if (m) rgb = m[1].split(',').slice(0, 3).map(Number);
    else rgb = hexToRgb(color);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.min(1, strength * 0.9)})`);
    g.addColorStop(0.45, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.min(1, strength * 0.35)})`);
    g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  function line(ctx, x0, y0, x1, y1, color) {
    ctx.fillStyle = color;
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let n = 0; n < 4000; n++) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  function rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function frame(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h); }

  // random "glyph" blocks that read like signage in an unknown script
  function fakeGlyph(ctx, x, y, size, color, rnd) {
    ctx.fillStyle = color;
    const s = size;
    const strokes = 2 + ((rnd() * 3) | 0);
    for (let k = 0; k < strokes; k++) {
      if (rnd() < 0.5) { const yy = y + ((rnd() * s) | 0); const x0 = x + ((rnd() * s * 0.4) | 0); ctx.fillRect(x0, yy, Math.max(2, (s - (x0 - x)) * (0.5 + rnd() * 0.5)) | 0, 1); }
      else { const xx = x + ((rnd() * s) | 0); const y0 = y + ((rnd() * s * 0.4) | 0); ctx.fillRect(xx, y0, 1, Math.max(2, (s - (y0 - y)) * (0.5 + rnd() * 0.5)) | 0); }
    }
    if (rnd() < 0.5) ctx.fillRect(x, y, s, 1);
  }

  N.Pixel = { PAL, NEONS, hexToRgb, rgbToHex, mix, rgba, canvas, flipped, drawText, measure, textCanvas, neonText, sprite, tint, glow, dither, ditherGradient, ditherGlow, line, rect, frame, fakeGlyph, BAYER, FONTS };
})();
