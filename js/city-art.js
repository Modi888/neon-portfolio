/* NEON-8 · city painters: every building, prop and backdrop is drawn here, pixel by pixel */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;

  /* ---------------- shared helpers ---------------- */
  function bricks(x, X, Y, W, H, base, mortar, rnd, density = 0.55) {
    x.fillStyle = base; x.fillRect(X, Y, W, H);
    x.fillStyle = mortar;
    for (let j = 0; j < H; j += 4) {
      if (rnd() < density) x.fillRect(X, Y + j, W, 1);
      const off = ((j / 4) % 2) * 4;
      for (let i = off; i < W; i += 8) if (rnd() < density) x.fillRect(X + i, Y + j + 1, 1, 3);
    }
    // grime: darker dither at the base, lighter speckles
    P.dither(x, X, Y + H - 10, W, 10, P.mix(base, C.ink, 0.5), 0.3);
    for (let k = 0; k < W * H / 60; k++) { x.fillStyle = P.mix(base, '#ffffff', 0.08); x.fillRect(X + ((rnd() * W) | 0), Y + ((rnd() * H) | 0), 1, 1); }
  }
  function panels(x, X, Y, W, H, base, seam, rnd, pw = 16, ph = 12) {
    x.fillStyle = base; x.fillRect(X, Y, W, H);
    x.fillStyle = seam;
    for (let j = ph; j < H; j += ph) x.fillRect(X, Y + j, W, 1);
    for (let i = pw; i < W; i += pw) x.fillRect(X + i, Y, 1, H);
    for (let k = 0; k < W * H / 80; k++) { x.fillStyle = P.mix(base, C.ink, 0.3); x.fillRect(X + ((rnd() * W) | 0), Y + ((rnd() * H) | 0), 1, 1); }
  }
  // returns window record for dynamic flicker
  function windowAt(x, wx, wy, ww, wh, rnd, opts = {}) {
    const frameC = opts.frame || C.ink;
    x.fillStyle = frameC; x.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
    const r = rnd();
    let lit = opts.lit != null ? opts.lit : r < (opts.litChance == null ? 0.45 : opts.litChance);
    let col = opts.color || (r < 0.12 ? C.cool : r < 0.2 ? C.pink : r < 0.27 ? C.tv : C.warm);
    if (!lit) {
      x.fillStyle = C.win; x.fillRect(wx, wy, ww, wh);
      P.dither(x, wx, wy, ww, wh, '#1b1240', 0.25);
      x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(wx, wy, 1, wh);
    } else {
      x.fillStyle = P.mix(col, C.ink, 0.25); x.fillRect(wx, wy, ww, wh);
      P.dither(x, wx, wy, ww, (wh * 0.6) | 0, col, 0.7);
      // interior hints
      const kind = rnd();
      if (kind < 0.25 && ww >= 6) { // curtain
        x.fillStyle = P.mix(col, '#ffffff', 0.35); x.fillRect(wx, wy, 2, wh); x.fillRect(wx + ww - 2, wy, 2, wh);
      } else if (kind < 0.4 && ww >= 6 && wh >= 7) { // person silhouette
        x.fillStyle = P.mix(col, C.ink, 0.75); const px = wx + 2 + ((rnd() * (ww - 5)) | 0);
        x.fillRect(px, wy + wh - 6, 3, 6); x.fillRect(px, wy + wh - 8, 3, 2);
      } else if (kind < 0.5 && ww >= 5) { // plant
        x.fillStyle = C.limeD; x.fillRect(wx + 1, wy + wh - 4, 3, 3); x.fillStyle = '#6b3a2a'; x.fillRect(wx + 1, wy + wh - 2, 3, 2);
      }
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(wx, wy, ww, 1);
    }
    // sill
    x.fillStyle = P.mix(frameC, '#ffffff', 0.18); x.fillRect(wx - 1, wy + wh + 1, ww + 2, 1);
    return { x: wx, y: wy, w: ww, h: wh, lit, col, tv: col === C.tv };
  }
  function windowGrid(x, X, Y, cols, rows, ww, wh, gx, gy, rnd, opts) {
    const out = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) out.push(windowAt(x, X + i * (ww + gx), Y + j * (wh + gy), ww, wh, rnd, opts));
    return out;
  }
  function awning(x, X, Y, W, c1, c2) {
    for (let i = 0; i < W; i++) {
      x.fillStyle = ((i / 4) | 0) % 2 ? c1 : c2;
      x.fillRect(X + i, Y, 1, 6);
      const sc = (i % 4 === 1 || i % 4 === 2) ? 2 : 1; // scalloped edge
      x.fillRect(X + i, Y + 6, 1, sc);
    }
    x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(X, Y, W, 1);
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(X, Y + 9, W, 2);
  }
  function ac(x, X, Y) {
    x.fillStyle = C.ink; x.fillRect(X - 1, Y - 1, 10, 7);
    x.fillStyle = '#6d6390'; x.fillRect(X, Y, 8, 5);
    x.fillStyle = '#4a4268'; for (let i = 1; i < 8; i += 2) x.fillRect(X + i, Y + 1, 1, 3);
    x.fillStyle = '#8f86b3'; x.fillRect(X, Y, 8, 1);
  }
  function antenna(x, X, Y, H) {
    x.fillStyle = '#3d3366'; x.fillRect(X, Y - H, 1, H);
    for (let k = 4; k < H; k += 5) x.fillRect(X - 2, Y - H + k, 5, 1);
    return { x: X, y: Y - H - 1 };
  }
  function dish(x, X, Y) {
    x.fillStyle = '#8f86b3'; x.fillRect(X, Y - 6, 6, 1); x.fillRect(X + 1, Y - 5, 5, 1); x.fillRect(X + 2, Y - 4, 3, 1);
    x.fillStyle = '#4a4268'; x.fillRect(X + 3, Y - 3, 1, 3); x.fillRect(X + 4, Y - 8, 1, 2);
  }
  function waterTank(x, X, Y) {
    x.fillStyle = C.ink; x.fillRect(X - 1, Y - 22, 18, 15);
    x.fillStyle = '#6b3a3a'; x.fillRect(X, Y - 21, 16, 13);
    x.fillStyle = '#8a4a40'; for (let i = 1; i < 16; i += 3) x.fillRect(X + i, Y - 21, 1, 13);
    x.fillStyle = '#4a2a2a'; x.fillRect(X, Y - 17, 16, 1); x.fillRect(X, Y - 12, 16, 1);
    x.fillStyle = C.ink; x.fillRect(X + 1, Y - 25, 14, 3); x.fillRect(X + 4, Y - 27, 8, 2);
    x.fillStyle = '#3d3366'; x.fillRect(X + 1, Y - 8, 1, 8); x.fillRect(X + 14, Y - 8, 1, 8); x.fillRect(X + 7, Y - 8, 2, 8);
    x.fillRect(X + 1, Y - 4, 14, 1);
  }
  // glowing neon box sign. returns {on, off, w, h, pad}
  function neonBox(text, key, opts = {}) {
    const [main, dark] = P.NEONS[key] || P.NEONS.magenta;
    const sc = opts.scale || 1, font = opts.font || 5;
    const tw = P.measure(text, { scale: sc, font }), th = (font === 5 ? 7 : 5) * sc;
    const padIn = opts.padIn == null ? 3 : opts.padIn;
    const bw = tw + padIn * 2 + 2, bh = th + padIn * 2 + 2, pad = 6;
    const mk = (on) => {
      const { c, x } = P.canvas(bw + pad * 2, bh + pad * 2);
      // backing plate
      x.fillStyle = opts.plate || P.mix(C.ink, dark, 0.25); x.fillRect(pad + 1, pad + 1, bw - 2, bh - 2);
      if (on) { x.shadowColor = main; x.shadowBlur = 5; }
      const tube = on ? P.mix(main, '#ffffff', 0.25) : P.mix(main, C.ink, 0.65);
      if (opts.frame !== false) {
        x.fillStyle = on ? main : tube;
        x.fillRect(pad + 1, pad, bw - 2, 1); x.fillRect(pad + 1, pad + bh - 1, bw - 2, 1);
        x.fillRect(pad, pad + 1, 1, bh - 2); x.fillRect(pad + bw - 1, pad + 1, 1, bh - 2);
      }
      P.drawText(x, text, pad + padIn + 1, pad + padIn + 1, on ? main : tube, { scale: sc, font });
      x.shadowBlur = 0;
      if (on) P.drawText(x, text, pad + padIn + 1, pad + padIn + 1, P.mix(main, '#ffffff', 0.6), { scale: sc, font });
      return c;
    };
    return { on: mk(true), off: mk(false), w: bw, h: bh, pad, color: main };
  }
  // vertical blade sign with fake glyphs
  function bladeSign(key, n, rnd) {
    const [main] = P.NEONS[key] || P.NEONS.cyan;
    const w = 11, h = n * 9 + 4, pad = 5;
    const mk = (on) => {
      const { c, x } = P.canvas(w + pad * 2, h + pad * 2);
      x.fillStyle = C.ink; x.fillRect(pad, pad, w, h);
      x.fillStyle = on ? main : P.mix(main, C.ink, 0.65); x.fillRect(pad, pad, w, 1); x.fillRect(pad, pad + h - 1, w, 1); x.fillRect(pad, pad, 1, h); x.fillRect(pad + w - 1, pad, 1, h);
      if (on) { x.shadowColor = main; x.shadowBlur = 4; }
      const r2 = N.seeded(key + n);
      for (let k = 0; k < n; k++) P.fakeGlyph(x, pad + 3, pad + 3 + k * 9, 5, on ? P.mix(main, '#ffffff', 0.3) : P.mix(main, C.ink, 0.6), r2);
      x.shadowBlur = 0;
      return c;
    };
    return { on: mk(true), off: mk(false), w, h, pad };
  }
  function lightCone(w, h, color, strength = 0.5) {
    const { c, x } = P.canvas(w, h);
    const [r, g, b] = P.hexToRgb(color);
    const grad = x.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `rgba(${r},${g},${b},${strength * 0.55})`);
    grad.addColorStop(0.7, `rgba(${r},${g},${b},${strength * 0.18})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = grad;
    x.beginPath(); x.moveTo(w / 2 - 2, 0); x.lineTo(w / 2 + 2, 0); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
    return c;
  }

  const A = {};

  /* ---------------- HOME ---------------- */
  A.home = function (b, rnd) {
    const w = b.w, h = b.h, m = 10, top = 34;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, Y = top, G = h + top;
    bricks(x, X, Y, w, h, '#4a1f4f', '#3a173e', rnd);
    // cornice
    x.fillStyle = '#6b2f6b'; x.fillRect(X - 2, Y, w + 4, 3); x.fillStyle = C.ink; x.fillRect(X - 2, Y + 3, w + 4, 1);
    // rim light from the neon sign
    x.fillStyle = P.rgba(C.magenta, 0.35); x.fillRect(X, Y + 4, 1, h - 4);
    // windows: 3 floors x 3
    const wins = [];
    for (let fl = 0; fl < 3; fl++) for (let i = 0; i < 3; i++) {
      const wx = X + 20 + i * 34, wy = Y + 14 + fl * 30;
      if (fl === 1 && i === 1) continue; // eddie's room drawn separately
      wins.push(windowAt(x, wx, wy, 16, 16, rnd, { frame: '#2a0f2e' }));
    }
    // eddie's room: desk lamp, monitor glow, poster, plant
    const ex = X + 54, ey = Y + 44;
    x.fillStyle = '#2a0f2e'; x.fillRect(ex - 2, ey - 2, 20, 20);
    x.fillStyle = '#3a1a5a'; x.fillRect(ex, ey, 16, 16);
    P.dither(x, ex, ey, 16, 16, '#5a2a8a', 0.5);
    x.fillStyle = C.cyan; x.fillRect(ex + 7, ey + 7, 6, 4); x.fillStyle = C.cyanL; x.fillRect(ex + 8, ey + 8, 4, 1);
    x.fillStyle = '#1a0a2a'; x.fillRect(ex + 9, ey + 11, 2, 2); x.fillRect(ex + 3, ey + 13, 13, 1);
    x.fillStyle = C.yellow; x.fillRect(ex + 2, ey + 9, 3, 1); x.fillStyle = '#6b4a2a'; x.fillRect(ex + 3, ey + 10, 1, 3);
    x.fillStyle = C.magenta; x.fillRect(ex + 2, ey + 2, 4, 5); x.fillStyle = C.yellow; x.fillRect(ex + 3, ey + 3, 2, 1);
    x.fillStyle = C.limeD; x.fillRect(ex + 13, ey + 2, 2, 3);
    x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(ex, ey, 16, 1);
    x.fillStyle = '#6b2f6b'; x.fillRect(ex - 2, ey + 17, 20, 1);
    // fire escape on the right
    const fx = X + w - 24;
    x.fillStyle = '#1a0a22';
    for (let fl = 0; fl < 3; fl++) {
      const fy = Y + 32 + fl * 30;
      x.fillRect(fx - 2, fy, 26, 2);
      for (let i = 0; i < 26; i += 3) x.fillRect(fx - 2 + i, fy - 6, 1, 6);
      x.fillRect(fx - 2, fy - 7, 26, 1);
      for (let k = 0; k < 14; k++) x.fillRect(fx + 2 + k, fy + 2 + ((k * 1.9) | 0), 2, 1);
    }
    // door + stoop
    const dx = X + 18, dw = 18, dh = 30;
    x.fillStyle = '#2a0f2e'; x.fillRect(dx - 3, G - dh - 6, dw + 6, dh + 6);
    x.fillStyle = '#ffb060'; x.fillRect(dx, G - dh - 3, dw, dh - 3);
    P.dither(x, dx, G - dh - 3, dw, dh - 3, '#ff7a3a', 0.35);
    x.fillStyle = '#5a2a1a'; x.fillRect(dx + 2, G - dh - 1, dw - 4, dh - 7);
    x.fillStyle = '#7a3a2a'; x.fillRect(dx + 4, G - dh + 1, dw - 8, 10); x.fillRect(dx + 4, G - dh + 13, dw - 8, 10);
    x.fillStyle = C.yellow; x.fillRect(dx + dw - 5, G - dh + 12, 2, 2);
    x.fillStyle = '#5d4d7a'; x.fillRect(dx - 6, G - 3, dw + 12, 3); x.fillStyle = '#7d6d9a'; x.fillRect(dx - 6, G - 3, dw + 12, 1);
    // house number
    P.drawText(x, '8', dx + dw + 4, G - dh - 2, C.yellow, { font: 3 });
    // roof: water tank, antenna, string lights anchor
    waterTank(x, X + w - 40, Y);
    const beacon = antenna(x, X + 20, Y, 22);
    ac(x, X + 40, Y - 5);
    // vertical name sign
    const name = (N.DATA.profile.name || 'EDDIE').toUpperCase().slice(0, 8);
    const sign = verticalSign(name, 'magenta', N.Fuse ? N.Fuse.fixed : name.length);
    return {
      buildSign: (lit) => verticalSign(name, 'magenta', lit),
      canvas: c, m, top, wins, beacons: [beacon], door: { x: dx - m + dw / 2, w: 30 },
      neons: [{ s: sign, x: X - 12, y: Y + 10, flicker: 0.002 }],
      lights: [{ x: X + w - 40, y: Y - 2, w: 50 }],
      eddieWin: { x: ex, y: ey }
    };
  };
  // lit: how many letters (from the top) have working tubes; the rest stay dark
  function verticalSign(text, key, lit = text.length) {
    const [main] = P.NEONS[key];
    const n = text.length, w = 13, h = n * 9 + 5, pad = 6;
    const mk = (on) => {
      const { c, x } = P.canvas(w + pad * 2, h + pad * 2);
      x.fillStyle = C.ink; x.fillRect(pad, pad, w, h);
      // dead tubes are nearly black so a repaired letter is obvious from across the street
      const dim = P.mix(main, C.ink, lit >= n ? 0.65 : 0.84), frameOn = on && lit > 0;
      x.fillStyle = frameOn ? main : dim; x.fillRect(pad, pad, w, 1); x.fillRect(pad, pad + h - 1, w, 1); x.fillRect(pad, pad, 1, h); x.fillRect(pad + w - 1, pad, 1, h);
      [...text].forEach((ch, i) => {
        const glow = on && i < lit;
        if (glow) { x.shadowColor = main; x.shadowBlur = 5; }
        P.drawText(x, ch, pad + 4, pad + 3 + i * 9, glow ? main : dim);
        x.shadowBlur = 0;
        if (glow) P.drawText(x, ch, pad + 4, pad + 3 + i * 9, P.mix(main, '#ffffff', 0.6));
      });
      // bracket
      x.fillStyle = '#3d3366'; x.fillRect(pad + w, pad + 4, 4, 1); x.fillRect(pad + w, pad + h - 5, 4, 1);
      return c;
    };
    return { on: mk(true), off: mk(false), w, h, pad };
  }

  /* ---------------- SHOP (website) ---------------- */
  A.shop = function (b, rnd) {
    const p = b.project, key = p.color || 'magenta';
    const [main, dark] = P.NEONS[key] || P.NEONS.magenta;
    const w = b.w, h = b.h, m = 12, top = 30;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, Y = top, G = h + top;
    const style = (rnd() * 3) | 0;
    const base = P.mix('#2a1658', dark, 0.28);
    if (style === 0) bricks(x, X, Y, w, h - 52, base, P.mix(base, C.ink, 0.35), rnd);
    else panels(x, X, Y, w, h - 52, base, P.mix(base, C.ink, 0.4), rnd, 12 + ((rnd() * 3) | 0) * 4, 10);
    // cornice + rim light
    x.fillStyle = P.mix(base, '#ffffff', 0.15); x.fillRect(X - 2, Y, w + 4, 3);
    x.fillStyle = C.ink; x.fillRect(X - 2, Y + 3, w + 4, 1);
    x.fillStyle = P.rgba(main, 0.3); x.fillRect(X, Y + 4, w, 1);
    // upper windows
    const floors = Math.max(1, Math.floor((h - 52 - 34) / 22));
    const cols = Math.max(2, Math.floor((w - 16) / 26));
    const ww = 12, gx = ((w - 16 - cols * ww) / Math.max(1, cols - 1)) | 0;
    const wins = windowGrid(x, X + 8, Y + 10, cols, floors, ww, 12, gx, 10, rnd);
    // sign
    const text = (p.sign || p.id).toUpperCase().slice(0, 10);
    const sc = text.length <= 5 ? 2 : 1;
    const sign = neonBox(text, key, { scale: sc });
    const signY = G - 52 - sign.h - 6;
    // storefront
    const sfY = G - 52;
    x.fillStyle = C.ink; x.fillRect(X, sfY, w, 52);
    x.fillStyle = P.mix(dark, C.ink, 0.45); x.fillRect(X + 2, sfY + 10, w - 4, 42);
    // display window
    const wx = X + 8, wy = sfY + 14, wW = w - 46, wH = 30;
    x.fillStyle = C.ink; x.fillRect(wx - 2, wy - 2, wW + 4, wH + 4);
    x.fillStyle = P.mix(main, C.ink, 0.6); x.fillRect(wx - 1, wy - 1, wW + 2, wH + 2);
    // door
    const dx = X + w - 30, dw = 18, dh = 34;
    x.fillStyle = C.ink; x.fillRect(dx - 2, G - dh - 2, dw + 4, dh + 2);
    x.fillStyle = P.mix(main, '#ffffff', 0.35); x.fillRect(dx, G - dh, dw, dh);
    P.dither(x, dx, G - dh, dw, dh, P.mix(main, C.ink, 0.2), 0.45);
    x.fillStyle = C.ink; x.fillRect(dx + dw / 2, G - dh, 1, dh);
    x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(dx + 2, G - dh + 2, 1, dh - 6);
    x.fillStyle = C.yellow; x.fillRect(dx + dw / 2 - 3, G - dh / 2, 2, 1); x.fillRect(dx + dw / 2 + 2, G - dh / 2, 2, 1);
    // awning over storefront
    awning(x, X - 2, sfY, w + 4, main, P.mix(main, '#ffffff', 0.7));
    // step + light spill
    x.fillStyle = '#4d3d7a'; x.fillRect(dx - 4, G - 2, dw + 8, 2);
    // building number plate
    P.drawText(x, String(10 + b.index * 4), X + w - 8, sfY + 14, P.mix(main, '#ffffff', 0.5), { font: 3, align: 'right' });
    // roof clutter
    const r = rnd();
    if (r < 0.33) waterTank(x, X + 10 + ((rnd() * (w - 40)) | 0), Y);
    else if (r < 0.66) { ac(x, X + 12, Y - 5); ac(x, X + w - 26, Y - 5); }
    else dish(x, X + w - 20, Y);
    const beacon = antenna(x, X + 6 + ((rnd() * (w - 12)) | 0), Y, 10 + ((rnd() * 16) | 0));
    // blade sign
    const blade = rnd() < 0.6 ? bladeSign(N.pick(['cyan', 'yellow', 'lime', 'magenta', 'violet'].filter(k => k !== key)), 3 + ((rnd() * 2) | 0), rnd) : null;
    const neons = [{ s: sign, x: X + w / 2 - sign.w / 2, y: signY, flicker: 0.003 + rnd() * 0.004 }];
    if (blade) neons.push({ s: blade, x: X - 6, y: Y + 12, flicker: 0.006 });
    // little OPEN sign
    const open = neonBox(p.status === 'ARCHIVED' ? 'CLOSED' : 'OPEN', p.status === 'ARCHIVED' ? 'red' : 'lime', { font: 3, padIn: 1 });
    neons.push({ s: open, x: wx + wW - open.w - 1, y: wy + 1, flicker: 0.01, blinkOpen: true });
    return {
      canvas: c, m, top, wins, beacons: [beacon], neons,
      door: { x: dx - m + dw / 2, w: 26 },
      screen: { x: wx, y: wy, w: wW, h: wH },
      awning: { x: X - 2 - m, y: sfY - G, w: w + 4 }
    };
  };

  /* ---------------- TOWER (internship) ---------------- */
  A.tower = function (b, rnd) {
    const p = b.project, key = p.color || 'cyan';
    const [main, dark] = P.NEONS[key] || P.NEONS.cyan;
    const w = b.w, h = b.h, m = 12, top = 40;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, Y = top, G = h + top;
    // stepped crown
    const crownH = 18;
    // glass body
    P.ditherGradient(x, X, Y + crownH, w, h - crownH, [[0, '#24407f'], [0.5, '#1d2a66'], [1, '#1a1450']]);
    x.fillStyle = '#2b2266'; x.fillRect(X + 10, Y, w - 20, crownH); x.fillRect(X + 4, Y + 8, w - 8, crownH - 8);
    x.fillStyle = C.ink; x.fillRect(X + 10, Y, w - 20, 1);
    // lit office cells
    const wins = [];
    for (let fy = Y + crownH + 4; fy < G - 40; fy += 8) {
      const floorLit = rnd() < 0.18;
      for (let fx = X + 3; fx < X + w - 5; fx += 6) {
        const lit = floorLit ? rnd() < 0.9 : rnd() < 0.16;
        if (lit) {
          const col = rnd() < 0.8 ? '#bfe9ff' : C.warm;
          x.fillStyle = P.mix(col, '#1d2a66', 0.35); x.fillRect(fx, fy, 5, 6);
          x.fillStyle = col; x.fillRect(fx, fy, 5, 2);
          if (rnd() < 0.05) wins.push({ x: fx, y: fy, w: 5, h: 6, lit: true, col, tv: true });
        }
      }
    }
    // mullions
    x.fillStyle = 'rgba(10,6,24,0.6)';
    for (let fx = X; fx < X + w; fx += 6) x.fillRect(fx + 2, Y + crownH, 1, h - crownH - 36);
    for (let fy = Y + crownH; fy < G - 36; fy += 8) x.fillRect(X, fy + 2, w, 1);
    // sheen
    for (let k = 0; k < 3; k++) {
      const sx = X + 10 + k * 46 + ((rnd() * 20) | 0);
      for (let j = Y + crownH; j < G - 40; j++) {
        const xx = sx + ((j - Y) * 0.4) | 0;
        if (xx > X && xx < X + w - 6) { x.fillStyle = 'rgba(200,230,255,0.07)'; x.fillRect(xx, j, 6, 1); }
      }
    }
    // corner light strips
    x.fillStyle = P.rgba(main, 0.55); x.fillRect(X, Y + crownH, 1, h - crownH - 36); x.fillRect(X + w - 1, Y + crownH, 1, h - crownH - 36);
    // logo sign on crown
    const label = (p.sign || p.company || 'CORP').toUpperCase().slice(0, 12);
    const logo = neonBox(label, key, { scale: 1, plate: '#120a2e' });
    // lobby
    const lY = G - 36;
    x.fillStyle = C.ink; x.fillRect(X, lY, w, 36);
    x.fillStyle = '#ffd9a0'; x.fillRect(X + 16, lY + 8, w - 32, 28);
    P.dither(x, X + 16, lY + 8, w - 32, 28, '#ffb060', 0.4);
    // lobby columns & desk
    x.fillStyle = '#2b2266'; for (let i = X + 16; i < X + w - 16; i += 22) x.fillRect(i, lY + 8, 3, 28);
    x.fillStyle = '#4a3a6a'; x.fillRect(X + 26, G - 10, 30, 10); x.fillStyle = '#6a5a8a'; x.fillRect(X + 26, G - 10, 30, 2);
    x.fillStyle = '#2b2266'; x.fillRect(X + w - 50, G - 22, 12, 14);
    // canopy
    x.fillStyle = '#3a3080'; x.fillRect(X + 6, lY, w - 12, 6);
    x.fillStyle = P.rgba(main, 0.8); x.fillRect(X + 6, lY + 5, w - 12, 1);
    P.drawText(x, (p.company || label).toUpperCase().slice(0, 16), X + w / 2, lY + 1, P.mix(main, '#ffffff', 0.5), { font: 3, align: 'center' });
    // door frame (revolving door drawn dynamically)
    const dx = X + w / 2 - 10;
    x.fillStyle = C.ink; x.fillRect(dx - 2, G - 26, 24, 26);
    x.fillStyle = '#9fd8ff'; x.fillRect(dx, G - 24, 20, 24);
    // planters
    [X + 4, X + w - 14].forEach(px => { x.fillStyle = '#3a3060'; x.fillRect(px, G - 8, 10, 8); x.fillStyle = C.limeD; x.fillRect(px + 1, G - 14, 8, 6); x.fillStyle = C.lime; x.fillRect(px + 3, G - 15, 3, 2); });
    // intern banner
    const ban = neonBox('INTERN', 'red', { font: 3, padIn: 2 });
    const beacon = antenna(x, X + w / 2, Y, 30);
    return {
      canvas: c, m, top, wins, beacons: [beacon], door: { x: dx - m + 10, w: 30 },
      neons: [{ s: logo, x: X + w / 2 - logo.w / 2, y: Y + 4, flicker: 0.001 }, { s: ban, x: X + w - ban.w - 6, y: Y + crownH + 14, flicker: 0.004 }],
      revolve: { x: dx, y: G - 24, w: 20, h: 24 }
    };
  };

  /* ---------------- ARCADE ---------------- */
  A.arcade = function (b, rnd) {
    const w = b.w, h = b.h, m = 12, top = 44;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, Y = top, G = h + top;
    panels(x, X, Y, w, h, '#2d1060', '#22094a', rnd, 20, 14);
    // checker trim
    for (let i = 0; i < w; i += 4) { x.fillStyle = ((i / 4) % 2) ? C.yellow : C.ink; x.fillRect(X + i, Y + 34, 4, 2); x.fillStyle = ((i / 4) % 2) ? C.ink : C.yellow; x.fillRect(X + i, Y + 36, 4, 2); }
    // marquee plate
    x.fillStyle = C.ink; x.fillRect(X + 10, Y + 4, w - 20, 28);
    x.fillStyle = '#3a0f5a'; x.fillRect(X + 12, Y + 6, w - 24, 24);
    const marquee = neonBox('ARCADE', 'yellow', { scale: 2, frame: false, plate: '#3a0f5a' });
    // entrance
    const ew = 56, ex = X + w / 2 - ew / 2, eh = 46;
    x.fillStyle = C.ink; x.fillRect(ex - 3, G - eh - 3, ew + 6, eh + 3);
    x.fillStyle = '#150830'; x.fillRect(ex, G - eh, ew, eh);
    // floor checker inside
    for (let i = 0; i < ew; i += 4) for (let j = 0; j < 8; j += 4) { x.fillStyle = ((i + j) / 4) % 2 ? '#3a1a6a' : '#1a0a3a'; x.fillRect(ex + i, G - 8 + j, 4, 4); }
    // cabinet silhouettes (screens animated)
    const cabs = [];
    for (let i = 0; i < 4; i++) {
      const cx = ex + 4 + i * 13;
      x.fillStyle = '#2a1a4a'; x.fillRect(cx, G - 34, 10, 26); x.fillStyle = '#3a2a6a'; x.fillRect(cx, G - 34, 10, 2);
      x.fillStyle = C.ink; x.fillRect(cx + 1, G - 29, 8, 7);
      cabs.push({ x: cx + 2, y: G - 28, w: 6, h: 5 });
      x.fillStyle = C.red; x.fillRect(cx + 3, G - 18, 1, 2); x.fillStyle = C.cyan; x.fillRect(cx + 6, G - 17, 2, 1);
    }
    // side windows with posters
    const poster = (px, kind) => {
      x.fillStyle = C.ink; x.fillRect(px - 2, G - 44, 30, 32);
      x.fillStyle = '#1a0a3a'; x.fillRect(px, G - 42, 26, 28);
      if (kind === 0) { // ghost
        const gm = { k: C.ink, g: C.magenta, w: '#ffffff', b: C.blue };
        x.drawImage(P.sprite(['..gggg..', '.gggggg.', 'gwwggwwg', 'gwbggwbg', 'gggggggg', 'gggggggg', 'g.gg.gg.'], gm), px + 9, G - 36);
      } else if (kind === 1) { // invader
        x.drawImage(P.sprite(['..g.....g..', '...g...g...', '..ggggggg..', '.gg.ggg.gg.', 'ggggggggggg', 'g.ggggggg.g', 'g.g.....g.g', '...gg.gg...'], { g: C.lime }), px + 7, G - 36);
      } else { // joystick
        x.fillStyle = C.red; x.fillRect(px + 11, G - 38, 4, 4); x.fillStyle = '#8a86a8'; x.fillRect(px + 12, G - 34, 2, 8); x.fillStyle = C.ink; x.fillRect(px + 7, G - 26, 12, 4);
      }
      P.drawText(x, kind === 0 ? 'GHOST' : kind === 1 ? '1UP' : 'PLAY', px + 13, G - 22, C.white, { font: 3, align: 'center' });
    };
    poster(X + 12, 0); poster(X + w - 40, 1);
    // a sticky note on the wall, between the poster and the door (it opens in the city)
    const nX = X + 58, nY = G - 40;
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(nX + 1, nY + 1, 12, 12);
    x.fillStyle = '#ffe45c'; x.fillRect(nX, nY, 12, 12);
    x.fillStyle = '#d9b52e'; x.fillRect(nX + 9, nY + 9, 3, 3); x.fillStyle = '#fff3a8'; x.fillRect(nX, nY, 12, 1);
    x.fillStyle = '#6a5520'; x.fillRect(nX + 2, nY + 4, 7, 1); x.fillRect(nX + 2, nY + 6, 8, 1); x.fillRect(nX + 2, nY + 8, 5, 1);
    x.fillStyle = C.red; x.fillRect(nX + 5, nY - 1, 2, 2);
    // roof: invader neon (animated two frames)
    const invA = P.sprite(['..k.....k..', '...k...k...', '..kkkkkkk..', '.kk.kkk.kk.', 'kkkkkkkkkkk', 'k.kkkkkkk.k', 'k.k.....k.k', '...kk.kk...'], { k: C.lime });
    const invB = P.sprite(['..k.....k..', 'k..k...k..k', 'k.kkkkkkk.k', 'kkk.kkk.kkk', 'kkkkkkkkkkk', '.kkkkkkkkk.', '..k.....k..', '.k.......k.'], { k: C.lime });
    const roofA = P.glow(scaleUp(invA, 2), C.lime, 4), roofB = P.glow(scaleUp(invB, 2), C.lime, 4);
    // support frame for roof sign
    x.fillStyle = '#3d3366'; x.fillRect(X + w / 2 - 14, Y - 6, 1, 6); x.fillRect(X + w / 2 + 13, Y - 6, 1, 6);
    const coinSign = neonBox('INSERT COIN', 'magenta', { font: 3, padIn: 2 });
    const tf = neonBox('24/7', 'cyan', { font: 3, padIn: 1 });
    return {
      canvas: c, m, top, wins: [], beacons: [], door: { x: ex - m + ew / 2, w: 50 }, note: { x: nX - m + 6 },
      neons: [
        { s: marquee, x: X + w / 2 - marquee.w / 2, y: Y + 18 - marquee.h / 2, flicker: 0.001 },
        { s: coinSign, x: X + 12, y: G - eh - 12, flicker: 0, blink: 0.9 },
        { s: tf, x: X + w - 34, y: G - eh - 10, flicker: 0.004 }
      ],
      marquee: { x: X + 10, y: Y + 4, w: w - 20, h: 28 },
      cabs, roof: { a: roofA, b: roofB, x: X + w / 2 - 11 - roofA.pad, y: Y - 22 - roofA.pad }
    };
  };
  function scaleUp(src, s) {
    const { c, x } = P.canvas(src.width * s, src.height * s);
    x.drawImage(src, 0, 0, src.width * s, src.height * s); return c;
  }

  /* ---------------- CONSTRUCTION SITE (upcoming site) ---------------- */
  A.site = function (b, rnd) {
    const p = b.project, key = p.color || 'orange';
    const w = b.w, h = b.h, m = 12, top = 20;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, Y = top, G = h + top;
    const floorH = 24, built = Math.max(1, Math.round((p.progress || 0) / 100 * Math.floor(h / floorH)));
    const floors = Math.floor(h / floorH);
    // concrete for built floors, steel skeleton for the rest
    for (let f = 0; f < floors; f++) {
      const fy = G - (f + 1) * floorH;
      if (f < built) {
        panels(x, X + 4, fy, w - 8, floorH, '#3d3560', '#2d2550', rnd, 16, floorH);
        windowGrid(x, X + 12, fy + 6, Math.floor((w - 24) / 20), 1, 10, 10, 10, 0, rnd, { litChance: 0.15, color: C.warm });
      } else {
        x.fillStyle = '#c2401a';
        for (let i = 0; i <= w - 8; i += 32) x.fillRect(X + 4 + Math.min(i, w - 11), fy, 3, floorH);
        x.fillRect(X + 4, fy, w - 8, 3);
        // cross bracing
        for (let i = 0; i < w - 40; i += 32) P.line(x, X + 6 + i, fy + 3, X + 36 + i, fy + floorH - 1, '#8a2a12');
      }
      x.fillStyle = '#5d5580'; x.fillRect(X, fy + floorH - 2, w, 2); // slab
    }
    // scaffold on the left side
    const scW = 60;
    x.fillStyle = '#9a96b8';
    for (let i = 0; i <= scW; i += 20) x.fillRect(X - 6 + i, G - built * floorH - 10, 1, built * floorH + 10);
    const planks = [];
    for (let f = 1; f <= built; f++) {
      const py = G - f * floorH;
      x.fillStyle = '#8a5a2a'; x.fillRect(X - 6, py, scW + 1, 2);
      x.fillStyle = '#9a96b8'; P.line(x, X - 6, py, X + 14, py + floorH, '#6a668a');
      planks.push({ x: X - 6 - m, y: py - G, w: scW + 1 });
    }
    // safety net
    P.dither(x, X + scW, G - built * floorH, 40, built * floorH - 26, P.rgba('#40c0a0', 0.5), 0.25);
    // banner tarp
    const tW = Math.min(w - 70, 90), tX = X + w - tW - 10, tY = G - floorH * Math.min(built, 2) - 4;
    x.fillStyle = '#e8e2f4'; x.fillRect(tX, tY, tW, 18);
    x.fillStyle = '#c8c2d4'; x.fillRect(tX, tY + 17, tW, 1);
    P.drawText(x, 'COMING SOON', tX + tW / 2, tY + 3, C.ink, { font: 3, align: 'center' });
    P.drawText(x, (p.sign || p.id).toUpperCase().slice(0, 10), tX + tW / 2, tY + 10, P.NEONS[key][1], { font: 3, align: 'center' });
    // fence along the front with stripes
    for (let i = 0; i < w + 8; i++) { x.fillStyle = ((i / 4 | 0) % 2) ? C.yellow : C.ink; x.fillRect(X - 4 + i, G - 12, 1, 3); }
    x.fillStyle = '#5d5580'; for (let i = 0; i < w + 8; i += 12) x.fillRect(X - 4 + i, G - 12, 1, 12);
    // site office (door)
    const oX = X + w - 54, oW = 44, oH = 24;
    x.fillStyle = C.ink; x.fillRect(oX - 1, G - oH - 1, oW + 2, oH + 1);
    x.fillStyle = '#d8d2e8'; x.fillRect(oX, G - oH, oW, oH);
    x.fillStyle = '#b8b2c8'; for (let i = 2; i < oW; i += 4) x.fillRect(oX + i, G - oH, 1, oH);
    x.fillStyle = '#3a6a9a'; x.fillRect(oX + 4, G - oH + 5, 12, 8); x.fillStyle = C.warm; x.fillRect(oX + 5, G - oH + 6, 10, 6);
    const dx = oX + oW - 16;
    x.fillStyle = '#4a4268'; x.fillRect(dx, G - 20, 11, 20); x.fillStyle = C.yellow; x.fillRect(dx + 8, G - 10, 1, 2);
    P.drawText(x, 'SITE', oX + 10, G - oH + 15, C.ink, { font: 3, align: 'center' });
    // cones
    [X + 4, X + 16].forEach(cx0 => { x.fillStyle = C.orange; x.fillRect(cx0 + 1, G - 6, 3, 5); x.fillRect(cx0, G - 2, 5, 2); x.fillStyle = '#ffffff'; x.fillRect(cx0 + 1, G - 4, 3, 1); });
    // progress board
    const board = { x: X + 20, y: G - 40, w: 56, h: 22 };
    x.fillStyle = '#3d3366'; x.fillRect(board.x + 6, board.y + board.h, 2, 18); x.fillRect(board.x + board.w - 8, board.y + board.h, 2, 18);
    x.fillStyle = C.ink; x.fillRect(board.x - 1, board.y - 1, board.w + 2, board.h + 2);
    x.fillStyle = '#1a1040'; x.fillRect(board.x, board.y, board.w, board.h);
    P.drawText(x, (p.sign || p.id).toUpperCase().slice(0, 9), board.x + 3, board.y + 3, P.NEONS[key][0], { font: 3 });
    return {
      canvas: c, m, top, wins: [], beacons: [], door: { x: dx - m + 5, w: 26 },
      neons: [], board, planks, progress: p.progress || 0, color: P.NEONS[key][0],
      lamps: [{ x: X - 4, y: G - 14 }, { x: X + w + 2, y: G - 14 }]
    };
  };

  /* ---------------- INDIE LAB (upcoming games) ---------------- */
  A.lab = function (b, rnd) {
    const games = b.projects;
    const w = b.w, h = b.h, m = 12, top = 30;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, Y = top, G = h + top;
    bricks(x, X, Y, w, h, '#173a4a', '#10303c', rnd);
    x.fillStyle = '#245a6a'; x.fillRect(X - 2, Y, w + 4, 3); x.fillStyle = C.ink; x.fillRect(X - 2, Y + 3, w + 4, 1);
    // big studio window with a dev at work
    const sw = { x: X + 16, y: Y + 12, w: Math.min(70, w - 32), h: 26 };
    x.fillStyle = C.ink; x.fillRect(sw.x - 2, sw.y - 2, sw.w + 4, sw.h + 4);
    x.fillStyle = '#20304a'; x.fillRect(sw.x, sw.y, sw.w, sw.h);
    P.dither(x, sw.x, sw.y, sw.w, sw.h, '#2a4a6a', 0.4);
    // posters for each game
    const posters = [];
    games.forEach((g, i) => {
      const px = X + 18 + i * 90, py = G - 86, pw = 58, ph = 74;
      x.fillStyle = C.ink; x.fillRect(px - 3, py - 3, pw + 6, ph + 6);
      x.fillStyle = '#d8d2e8'; x.fillRect(px - 2, py - 2, pw + 4, ph + 4);
      paintPoster(x, px, py, pw, ph, g, N.seeded(g.id));
      posters.push({ x: px - m + pw / 2, project: g, px, py, pw, ph });
    });
    // lab door at far right
    const dx = X + w - 26;
    x.fillStyle = C.ink; x.fillRect(dx - 2, G - 32, 20, 32);
    x.fillStyle = '#2a5a4a'; x.fillRect(dx, G - 30, 16, 30); x.fillStyle = C.lime; x.fillRect(dx + 12, G - 15, 2, 2);
    const sign = neonBox('INDIE LAB', 'lime', { scale: 1 });
    const pad = neonBox('PRESS ' + N.actKey(), 'magenta', { font: 3, padIn: 1 });
    dish(x, X + w - 30, Y); ac(x, X + 16, Y - 5);
    const beacon = antenna(x, X + w - 50, Y, 18);
    return {
      canvas: c, m, top, wins: [], beacons: [beacon], posters, studio: sw,
      neons: [{ s: sign, x: X + w - sign.w - 10, y: Y + 14, flicker: 0.003 }, { s: pad, x: X + w - pad.w - 18, y: Y + 36, flicker: 0, blink: 1.4 }],
      door: null
    };
  };
  function paintPoster(x, px, py, pw, ph, g, rnd, opts = {}) {
    const kind = g.poster || 'space';
    if (kind === 'space') {
      P.ditherGradient(x, px, py, pw, ph, [[0, '#0a0628'], [0.6, '#2a0f5a'], [1, '#5a1a6a']]);
      for (let k = 0; k < 30; k++) { x.fillStyle = rnd() < 0.2 ? C.cyan : '#ffffff'; x.fillRect(px + ((rnd() * pw) | 0), py + ((rnd() * ph * 0.7) | 0), 1, 1); }
      // planet
      for (let j = -9; j <= 9; j++) for (let i = -9; i <= 9; i++) if (i * i + j * j < 81) { x.fillStyle = (i + j > 4) ? '#8a2a8a' : C.magenta; x.fillRect(px + pw - 16 + i, py + 22 + j, 1, 1); }
      x.fillStyle = C.magentaL; x.fillRect(px + pw - 30, py + 22, 28, 1);
      // ship
      const ship = P.sprite(['....c....', '...ccc...', '..cwcwc..', '.ccccccc.', 'cc.ccc.cc', 'c...m...c', '....m....'], { c: C.cyan, w: '#ffffff', m: C.orange });
      x.drawImage(ship, px + 12, py + 36);
    } else {
      P.ditherGradient(x, px, py, pw, ph, [[0, '#120a30'], [0.7, '#3a1050'], [1, '#6a1a4a']]);
      for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) if (i * i + j * j < 64 && !((i - 4) * (i - 4) + (j + 2) * (j + 2) < 40)) { x.fillStyle = C.yellowL; x.fillRect(px + 18 + i, py + 18 + j, 1, 1); }
      for (let i = 0; i < pw; i += 6) { const bh = 8 + ((rnd() * 20) | 0); x.fillStyle = '#0a0618'; x.fillRect(px + i, py + ph - 18 - bh, 6, bh); if (rnd() < 0.6) { x.fillStyle = C.magenta; x.fillRect(px + i + 2, py + ph - 16 - bh, 1, 1); } }
      x.fillStyle = '#0a0618'; x.fillRect(px + pw - 20, py + ph - 30, 3, 8); x.fillRect(px + pw - 21, py + ph - 32, 5, 2);
    }
    // title band + ribbon
    x.fillStyle = 'rgba(10,6,24,0.85)'; x.fillRect(px, py + ph - 16, pw, 16);
    P.drawText(x, (g.sign || g.id).toUpperCase().slice(0, 12), px + pw / 2, py + ph - 13, '#ffffff', { font: 3, align: 'center' });
    P.drawText(x, 'COMING ' + (N.L(g.eta) || 'SOON').toString().toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 6), px + pw / 2, py + ph - 6, C.yellow, { font: 3, align: 'center' });
    // corner ribbon
    if (opts.ribbon !== false) for (let k = 0; k < 12; k++) { x.fillStyle = C.red; x.fillRect(px + pw - 12 + k, py + k - 1, 3, 1); }
  }
  A.paintPoster = paintPoster;

  /* ---------------- RADIO TOWER ---------------- */
  A.radio = function (b, rnd) {
    const w = b.w, h = b.h, m = 20, top = 10;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, G = h + top, cx = X + w / 2;
    // lattice
    const tH = h - 30;
    for (let j = 0; j < tH; j++) {
      const half = 4 + (j / tH) * 18;
      const yy = G - 30 - j;
      x.fillStyle = '#5d4d96';
      x.fillRect((cx - half) | 0, yy, 1, 1); x.fillRect((cx + half) | 0, yy, 1, 1);
      if (j % 10 === 0) x.fillRect((cx - half) | 0, yy, (half * 2) | 0, 1);
      if (j % 10 < 10) { const t = (j % 10) / 10; x.fillRect((cx - half + t * half * 2) | 0, yy, 1, 1); }
    }
    // hut
    x.fillStyle = C.ink; x.fillRect(X + 4, G - 32, w - 8, 32);
    x.fillStyle = '#2a1a5a'; x.fillRect(X + 6, G - 30, w - 12, 30);
    x.fillStyle = '#3a2a7a'; x.fillRect(X + 6, G - 30, w - 12, 2);
    // jukebox inside door
    const jx = X + w / 2 - 9;
    x.fillStyle = C.ink; x.fillRect(jx - 1, G - 25, 20, 25);
    x.fillStyle = '#ff6a3a'; x.fillRect(jx, G - 24, 18, 24);
    x.fillStyle = C.yellow; x.fillRect(jx + 2, G - 22, 14, 6);
    x.fillStyle = '#ffd0a0'; x.fillRect(jx + 3, G - 14, 12, 8);
    x.fillStyle = C.ink; for (let i = 0; i < 5; i++) x.fillRect(jx + 4 + i * 2, G - 13, 1, 6);
    const sign = neonBox('RADIO-8', 'violet', { font: 5 });
    return {
      canvas: c, m, top, wins: [], beacons: [{ x: cx, y: G - 30 - tH - 2 }], door: { x: X + w / 2 - m, w: 30 },
      neons: [{ s: sign, x: X + w / 2 - sign.w / 2, y: G - 50, flicker: 0.003 }],
      waves: { x: cx, y: G - 30 - tH }, jukebox: { x: jx, y: G - 24 }
    };
  };

  /* ---------------- GRAFFITI WALL ---------------- */
  A.wall = function (b, rnd) {
    const w = b.w, h = b.h, m = 6, top = 4;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, Y = top, G = h + top;
    bricks(x, X, Y, w, h, '#3a2a4a', '#2a1a3a', rnd, 0.8);
    x.fillStyle = '#5a4a6a'; x.fillRect(X, Y, w, 2);
    // tags
    const tag = (t, tx, ty, col, sc) => { P.drawText(x, t, tx + 1, ty + 1, C.ink, { scale: sc }); P.drawText(x, t, tx, ty, col, { scale: sc }); };
    tag('8BIT', X + 6, Y + 8, C.lime, 1);
    tag('NEON', X + w - 34, Y + 40, C.cyan, 1);
    tag('♥', X + 10, Y + 34, C.magenta, 2);
    P.drawText(x, 'BYTE WAS HERE', X + 6, Y + h - 10, C.yellow, { font: 3 });
    // drips
    for (let k = 0; k < 8; k++) { x.fillStyle = N.pick([C.magenta, C.cyan, C.lime]); const dx = X + ((rnd() * w) | 0); x.fillRect(dx, Y + 16 + ((rnd() * 20) | 0), 1, 3 + ((rnd() * 5) | 0)); }
    // frame for the player's tag
    const fx = X + w / 2 - 19, fy = Y + 10;
    x.fillStyle = C.ink; x.fillRect(fx - 1, fy - 1, 38, 38);
    x.fillStyle = '#2a1a3a'; x.fillRect(fx, fy, 36, 36);
    // paint cans on the floor
    [X + w - 16, X + w - 10].forEach((cx0, i) => { x.drawImage(N.Sprites.icon.can, cx0, G - 7 - i); });
    return { canvas: c, m, top, wins: [], beacons: [], neons: [], door: { x: w / 2, w: 40 }, paint: { x: fx + 2, y: fy + 2 } };
  };

  /* ---------------- STATION ---------------- */
  A.station = function (b, rnd) {
    const w = b.w, h = b.h, m = 14, top = 12;
    const { c, x } = P.canvas(w + m * 2, h + top);
    const X = m, Y = top, G = h + top;
    const platY = G - 58;
    // pillars
    x.fillStyle = '#2a2060';
    for (let i = 40; i < w; i += 60) { x.fillRect(X + i, platY, 8, 58); x.fillStyle = '#3a3080'; x.fillRect(X + i, platY, 2, 58); x.fillStyle = '#2a2060'; }
    // platform slab
    x.fillStyle = C.ink; x.fillRect(X, platY - 2, w, 10);
    x.fillStyle = '#4d3d8a'; x.fillRect(X, platY - 2, w, 6); x.fillStyle = C.yellow; for (let i = 0; i < w; i += 6) x.fillRect(X + i, platY - 2, 3, 1);
    // canopy
    const cY = Y + 14;
    x.fillStyle = '#2a1a5a'; x.fillRect(X + 20, cY, w - 40, 8);
    x.fillStyle = '#3a2a7a'; x.fillRect(X + 20, cY, w - 40, 2);
    x.fillStyle = '#1a1040'; for (let i = 30; i < w - 30; i += 60) x.fillRect(X + i, cY + 8, 3, platY - cY - 10);
    // stairs from the street
    const stX = X + 4;
    for (let s = 0; s < 14; s++) { x.fillStyle = s % 2 ? '#3a2a7a' : '#4d3d8a'; x.fillRect(stX + s * 3, G - 4 - s * 4, 20, 4); }
    x.fillStyle = '#5d4d96'; P.line(x, stX, G - 8, stX + 40, platY - 12, '#8f72d9');
    // departure board
    const board = { x: X + w / 2 - 50, y: cY + 12, w: 100, h: 18 };
    x.fillStyle = C.ink; x.fillRect(board.x - 2, board.y - 2, board.w + 4, board.h + 4);
    x.fillStyle = '#0a0a14'; x.fillRect(board.x, board.y, board.w, board.h);
    // ticket gate at street level
    const gx = X + 52;
    x.fillStyle = '#3a3080'; x.fillRect(gx, G - 18, 6, 18); x.fillRect(gx + 22, G - 18, 6, 18);
    x.fillStyle = C.lime; x.fillRect(gx + 1, G - 16, 4, 2); x.fillStyle = C.red; x.fillRect(gx + 23, G - 16, 4, 2);
    x.fillStyle = C.magenta; x.fillRect(gx + 6, G - 12, 16, 2);
    const sign = neonBox('NEON STATION', 'cyan', { scale: 1 });
    const line8 = neonBox('LINE 8', 'magenta', { font: 3, padIn: 2 });
    return {
      canvas: c, m, top, wins: [], beacons: [], door: { x: gx - m + 14, w: 40 },
      neons: [{ s: sign, x: X + w / 2 - sign.w / 2, y: Y - 2, flicker: 0.002 }, { s: line8, x: X + 28, y: cY + 12, flicker: 0.003 }],
      board, platY: platY - G, trainX: X + 60 - m
    };
  };

  /* ---------------- train sprite (used by station, track and credits) ---------------- */
  A.train = function (cars = 3, opts = {}) {
    const carW = 86, h = 26, nose = 22;
    const W = carW * cars + nose + 4;
    const { c, x } = P.canvas(W, h + 4);
    const body = '#e8e4f8', shade = '#a9a2c8', stripe = opts.stripe || C.magenta, win = '#1a1040';
    for (let k = 0; k < cars; k++) {
      const cx = k * carW;
      x.fillStyle = C.ink; x.fillRect(cx, 2, carW - 2, h);
      x.fillStyle = body; x.fillRect(cx + 1, 3, carW - 4, h - 2);
      x.fillStyle = shade; x.fillRect(cx + 1, h - 4, carW - 4, 3);
      x.fillStyle = stripe; x.fillRect(cx + 1, h - 9, carW - 4, 2);
      x.fillStyle = P.mix(stripe, '#ffffff', 0.4); x.fillRect(cx + 1, h - 9, carW - 4, 1);
      // windows
      for (let i = 0; i < 6; i++) {
        const wx = cx + 6 + i * 13;
        x.fillStyle = win; x.fillRect(wx, 7, 9, 8);
        x.fillStyle = C.warm; x.fillRect(wx + 1, 8, 7, 6); P.dither(x, wx + 1, 8, 7, 6, '#ffb060', 0.4);
        if ((i + k) % 3 === 1) { x.fillStyle = '#5a3a2a'; x.fillRect(wx + 3, 10, 3, 4); x.fillRect(wx + 3, 9, 3, 1); }
      }
      x.fillStyle = shade; x.fillRect(cx + 1, 5, carW - 4, 1);
      // door
      x.fillStyle = shade; x.fillRect(cx + 3, 6, 1, h - 11);
    }
    // nose (front, pointing right): a wedge, one straight slope from the roof down to a low tip.
    // rows line up with the cars: roof ink at y=2, stripe at h-9, skirt shade h-4..h-2, floor ink h+1
    const nx = cars * carW - 2, top = 3, low = h - 5;
    const lenAt = (y) => y <= low ? Math.max(1, Math.round(nose * (y - top + 1) / (low - top + 1))) : nose - Math.max(0, y - (h - 2)) * 2;
    x.fillStyle = C.ink; x.fillRect(nx, 2, 2, 1);
    for (let y = top; y <= h + 1; y++) {
      const len = lenAt(y);
      x.fillStyle = C.ink; x.fillRect(nx, y, len + 1, 1);
      if (y === h + 1) continue;
      x.fillStyle = y === h - 9 ? P.mix(stripe, '#ffffff', 0.4) : y === h - 8 ? stripe : (y >= h - 4 && y <= h - 2 ? shade : body);
      x.fillRect(nx, y, len, 1);
    }
    // raked windshield, parallel to the slope
    for (let y = 9; y <= 13; y++) { x.fillStyle = C.cyan; x.fillRect(nx + lenAt(y) - 7, y, 5, 1); }
    x.fillStyle = C.cyanL; x.fillRect(nx + lenAt(9) - 7, 9, 2, 1);
    x.fillStyle = C.yellow; x.fillRect(nx + nose - 5, h - 6, 3, 2);
    if (opts.flip) { const { c: f, x: fx } = P.canvas(W, h + 4); fx.translate(W, 0); fx.scale(-1, 1); fx.drawImage(c, 0, 0); return f; }
    return c;
  };

  /* ---------------- props ---------------- */
  A.lamp = function (color = C.warm) {
    const { c, x } = P.canvas(20, 70);
    x.fillStyle = '#2a2050'; x.fillRect(9, 6, 2, 64); x.fillRect(8, 64, 4, 6);
    x.fillStyle = '#3a3070'; x.fillRect(9, 6, 1, 58);
    x.fillStyle = '#2a2050'; x.fillRect(10, 4, 8, 2); x.fillRect(15, 6, 4, 2);
    x.fillStyle = P.mix(color, '#ffffff', 0.5); x.fillRect(15, 8, 4, 1);
    return { canvas: c, cone: lightCone(44, 62, color, 0.45), head: { x: 17, y: 8 } };
  };
  // a street-side breaker box on a pole, with the sign's cable running off it
  A.fusebox = function () {
    const box = ['kkkkkkkkkk', 'kggggggggk', 'kgkkkkkkgk', 'kgkyykkkgk', 'kgkkyykkgk', 'kgkyyyykgk', 'kgkkkyykgk', 'kgkkkykkgk', 'kgkkkkkkgk', 'kggggggggk', 'kkkkkkkkkk'];
    const pole = Array.from({ length: 22 }, (_, i) => i % 7 === 3 ? '...kppk...' : '...kpgk...');
    return P.sprite(box.concat(pole, ['..kkkkkk..', '.kggggggk.']), { k: C.ink, g: '#6d6390', p: '#4a4068', y: C.yellow });
  };
  // the rocket from the Launch Site: 3D-printed ogive nose, PVC body, red fins and a flowerpot for a nozzle
  A.rocket = function () {
    const W = 14, H = 46, { c, x } = P.canvas(W, H), cx = 7;
    for (let j = 0; j < 14; j++) { // ogive nose cone, mirrored around the centre line so both sides match
      const hw = Math.max(1, Math.round(Math.sqrt(1 - Math.pow(1 - j / 13, 2)) * 4));
      x.fillStyle = C.ink; x.fillRect(cx - hw - 1, j, hw * 2 + 2, 1);
      x.fillStyle = '#e8e4f2'; x.fillRect(cx - hw, j, hw * 2, 1);
      if (hw > 1) { x.fillStyle = '#f8f6fc'; x.fillRect(cx - hw, j, 1, 1); x.fillStyle = '#b9b2cf'; x.fillRect(cx + hw - 1, j, 1, 1); }
    }
    x.fillStyle = C.ink; x.fillRect(cx - 1, 0, 2, 1); // a clean two-pixel tip
    x.fillStyle = C.ink; x.fillRect(2, 14, 10, 24);
    x.fillStyle = '#d9d6e6'; x.fillRect(3, 14, 8, 24); // PVC pipe
    x.fillStyle = '#f4f2fa'; x.fillRect(4, 14, 2, 24);
    x.fillStyle = '#a8a2c0'; x.fillRect(9, 14, 2, 24);
    x.fillStyle = '#8f88aa'; x.fillRect(3, 17, 8, 1); x.fillRect(3, 34, 8, 1); // pipe couplers
    x.fillStyle = C.red; x.fillRect(4, 22, 6, 1); P.drawText(x, 'E', 5, 24, C.redD, { font: 3 });
    x.fillStyle = C.ink; x.fillRect(0, 30, 3, 9); x.fillRect(11, 30, 3, 9); // fins
    x.fillStyle = C.red; x.fillRect(1, 31, 2, 7); x.fillRect(11, 31, 2, 7); x.fillStyle = C.redD; x.fillRect(1, 36, 2, 2); x.fillRect(11, 36, 2, 2);
    x.fillStyle = C.ink; x.fillRect(3, 38, 8, 8); // the flowerpot
    x.fillStyle = '#c8673a'; x.fillRect(4, 38, 6, 2); x.fillRect(4, 40, 6, 5);
    x.fillStyle = '#e08a55'; x.fillRect(4, 38, 6, 1); x.fillStyle = '#8a3f22'; x.fillRect(8, 40, 2, 5);
    return c;
  };
  A.extinguisher = function () {
    return P.sprite(['..kk..', '.kkkk.', 'kkrrk.', 'krrrrk', 'krwwrk', 'krrrrk', 'krrrrk', 'krrrrk', 'krrrrk', 'krrrrk', 'kddddk', '.kkkk.'], { k: C.ink, r: C.red, w: '#ffffff', d: C.redD });
  };
  A.gacha = function () {
    const { c, x } = P.canvas(24, 40);
    // glass dome full of capsules
    for (let j = 0; j < 18; j++) { const half = Math.sqrt(Math.max(0, 1 - Math.pow((j - 9) / 9, 2))) * 11; x.fillStyle = C.ink; x.fillRect((12 - half - 1) | 0, j, (half * 2 + 2) | 0, 1); x.fillStyle = '#2a4a6a'; x.fillRect((12 - half) | 0, j, (half * 2) | 0, 1); }
    const caps = [C.magenta, C.cyan, C.yellow, C.lime, C.orange, C.vio];
    for (let k = 0; k < 16; k++) { const cx = 4 + ((k * 7) % 15), cy = 6 + ((k * 5) % 10); x.fillStyle = caps[k % 6]; x.fillRect(cx, cy, 3, 3); x.fillStyle = '#ffffff'; x.fillRect(cx, cy, 1, 1); }
    x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(5, 3, 2, 6);
    // body
    x.fillStyle = C.ink; x.fillRect(1, 17, 22, 23);
    x.fillStyle = C.red; x.fillRect(2, 18, 20, 21); x.fillStyle = '#ff7a8f'; x.fillRect(2, 18, 20, 2);
    x.fillStyle = C.ink; x.fillRect(4, 22, 4, 6); x.fillStyle = C.yellow; x.fillRect(5, 23, 2, 4);
    x.fillStyle = '#e8e2f4'; x.fillRect(12, 22, 7, 7); x.fillStyle = C.ink; x.fillRect(15, 22, 1, 7); x.fillRect(12, 25, 7, 1);
    x.fillStyle = C.ink; x.fillRect(8, 31, 8, 6); x.fillStyle = '#5a1a2a'; x.fillRect(9, 32, 6, 4);
    return c;
  };
  A.bench = function () {
    const { c, x } = P.canvas(26, 10);
    x.fillStyle = '#3a2a6a'; x.fillRect(0, 0, 26, 2); x.fillRect(0, 4, 26, 2);
    x.fillStyle = '#1a1040'; x.fillRect(2, 6, 2, 4); x.fillRect(22, 6, 2, 4); x.fillRect(2, 2, 1, 2); x.fillRect(23, 2, 1, 2);
    x.fillStyle = '#5a4a8a'; x.fillRect(0, 4, 26, 1);
    return c;
  };
  A.vending = function () {
    const { c, x } = P.canvas(22, 40);
    x.fillStyle = C.ink; x.fillRect(0, 0, 22, 40);
    x.fillStyle = '#b02a5a'; x.fillRect(1, 1, 20, 38);
    x.fillStyle = '#d04a7a'; x.fillRect(1, 1, 20, 2);
    x.fillStyle = '#1a0a2a'; x.fillRect(3, 5, 12, 22);
    const cols = [C.cyan, C.yellow, C.lime, C.orange];
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) { x.fillStyle = cols[(i + j) % 4]; x.fillRect(4 + i * 4, 6 + j * 5, 2, 4); x.fillStyle = '#ffffff'; x.fillRect(4 + i * 4, 6 + j * 5, 1, 1); }
    x.fillStyle = 'rgba(200,240,255,0.25)'; x.fillRect(3, 5, 12, 1); x.fillRect(3, 5, 1, 22);
    x.fillStyle = '#2a0a1a'; x.fillRect(16, 6, 3, 10);
    x.fillStyle = C.yellow; x.fillRect(17, 8, 1, 3);
    x.fillStyle = '#2a0a1a'; x.fillRect(4, 30, 14, 5);
    P.drawText(x, 'POP', 11, 0 + 30 - 1 - 2, '#ffffff', { font: 3, align: 'center' });
    return c;
  };
  A.phone = function () {
    const { c, x } = P.canvas(18, 46);
    x.fillStyle = C.ink; x.fillRect(0, 0, 18, 46);
    x.fillStyle = '#2a6a9a'; x.fillRect(1, 1, 16, 45);
    x.fillStyle = '#9fd8ff'; x.fillRect(3, 9, 12, 26); P.dither(x, 3, 9, 12, 26, '#5aa8d8', 0.4);
    x.fillStyle = '#1a1040'; x.fillRect(6, 16, 6, 8); x.fillStyle = C.yellow; x.fillRect(7, 17, 4, 2);
    P.drawText(x, 'CALL', 9, 2, '#ffffff', { font: 3, align: 'center' });
    return c;
  };
  A.newsbox = function () {
    const { c, x } = P.canvas(16, 22);
    x.fillStyle = C.ink; x.fillRect(0, 0, 16, 18);
    x.fillStyle = C.red; x.fillRect(1, 1, 14, 16);
    x.fillStyle = '#e8e2f4'; x.fillRect(3, 4, 10, 7); x.fillStyle = C.ink; x.fillRect(4, 5, 8, 1); x.fillRect(4, 7, 6, 1); x.fillRect(4, 9, 7, 1);
    x.fillStyle = '#5a1a2a'; x.fillRect(4, 13, 8, 2);
    x.fillStyle = '#3a3060'; x.fillRect(3, 18, 2, 4); x.fillRect(11, 18, 2, 4);
    return c;
  };
  A.mailbox = function () {
    const { c, x } = P.canvas(14, 26);
    x.fillStyle = C.ink; x.fillRect(1, 0, 12, 16);
    x.fillStyle = '#3d5cff'; x.fillRect(2, 1, 10, 14); x.fillStyle = '#6d8cff'; x.fillRect(2, 1, 10, 2);
    x.fillStyle = C.ink; x.fillRect(4, 5, 6, 1);
    x.fillStyle = C.red; x.fillRect(12, 2, 2, 5);
    x.fillStyle = '#ffffff'; x.fillRect(4, 9, 6, 3); x.fillStyle = C.magenta; x.fillRect(6, 10, 2, 1);
    x.fillStyle = '#3a3060'; x.fillRect(6, 16, 2, 10);
    return c;
  };
  A.board = function () {
    const { c, x } = P.canvas(30, 30);
    x.fillStyle = '#3a3060'; x.fillRect(3, 18, 2, 12); x.fillRect(25, 18, 2, 12);
    x.fillStyle = C.ink; x.fillRect(0, 0, 30, 20);
    x.fillStyle = '#8a5a3a'; x.fillRect(1, 1, 28, 18);
    x.fillStyle = '#fff2a8'; x.fillRect(3, 3, 9, 7); x.fillStyle = C.cyanL; x.fillRect(14, 3, 12, 6); x.fillStyle = C.magentaL; x.fillRect(5, 11, 10, 6); x.fillStyle = '#ffffff'; x.fillRect(17, 11, 9, 6);
    x.fillStyle = C.red; x.fillRect(7, 3, 1, 1); x.fillRect(19, 3, 1, 1); x.fillRect(9, 11, 1, 1);
    x.fillStyle = C.ink; x.fillRect(4, 5, 6, 1); x.fillRect(4, 7, 5, 1); x.fillRect(15, 5, 9, 1); x.fillRect(6, 13, 8, 1); x.fillRect(18, 13, 6, 1);
    return c;
  };
  A.crate = function (w = 14, h = 12) {
    const { c, x } = P.canvas(w, h);
    x.fillStyle = C.ink; x.fillRect(0, 0, w, h);
    x.fillStyle = '#7a4a2a'; x.fillRect(1, 1, w - 2, h - 2);
    x.fillStyle = '#9a6a3a'; x.fillRect(1, 1, w - 2, 1);
    x.fillStyle = '#5a3a1a'; P.line(x, 1, 1, w - 2, h - 2, '#5a3a1a'); x.fillRect(1, (h / 2) | 0, w - 2, 1);
    return c;
  };
  A.dumpster = function () {
    const { c, x } = P.canvas(34, 20);
    x.fillStyle = C.ink; x.fillRect(0, 2, 34, 18);
    x.fillStyle = '#2a5a4a'; x.fillRect(1, 4, 32, 14);
    x.fillStyle = '#1a3a30'; for (let i = 4; i < 32; i += 6) x.fillRect(1 + i, 6, 1, 10);
    x.fillStyle = '#3a7a6a'; x.fillRect(0, 2, 34, 2);
    x.fillStyle = '#1a1a1a'; x.fillRect(3, 18, 3, 2); x.fillRect(28, 18, 3, 2);
    return c;
  };
  A.hydrant = function () {
    return P.sprite(['..kkk..', '.krrrk.', 'kkrrrkk', 'krrwrrk', '.krrrk.', '.krrrk.', 'kkkkkkk'], { k: C.ink, r: C.red, w: '#ffffff' });
  };
  A.trash = function () {
    return P.sprite(['.kkkkkk.', 'kgggggggk', '.kgkgkgk.', '.kgkgkgk.', '.kgkgkgk.', '.kgkgkgk.', '.kkkkkkk.'], { k: C.ink, g: '#4a4a6a' });
  };
  A.noodle = function () {
    const { c, x } = P.canvas(40, 40);
    x.fillStyle = C.ink; x.fillRect(0, 22, 40, 14);
    x.fillStyle = '#b8402a'; x.fillRect(1, 23, 38, 12);
    x.fillStyle = '#d8603a'; x.fillRect(1, 23, 38, 2);
    // roof
    for (let i = 0; i < 44; i++) { x.fillStyle = ((i / 4 | 0) % 2) ? '#ffffff' : C.red; x.fillRect(i - 2, 6, 1, 5); }
    x.fillStyle = '#3a3060'; x.fillRect(2, 11, 2, 12); x.fillRect(36, 11, 2, 12);
    // lantern
    x.fillStyle = C.red; x.fillRect(18, 12, 5, 7); x.fillStyle = C.yellow; x.fillRect(19, 13, 3, 5);
    // wheels
    x.fillStyle = C.ink; x.fillRect(5, 35, 6, 5); x.fillRect(29, 35, 6, 5);
    x.fillStyle = '#ffffff'; P.drawText(x, 'RAMEN', 20, 27, '#fff2a8', { font: 3, align: 'center' });
    return c;
  };
  A.billboard = function (lines, key = 'yellow') {
    const [main, dark] = P.NEONS[key];
    const w = 96, h = 40;
    const { c, x } = P.canvas(w, h + 30);
    x.fillStyle = '#2a2060'; x.fillRect(20, h, 3, 30); x.fillRect(w - 23, h, 3, 30);
    x.fillStyle = C.ink; x.fillRect(0, 0, w, h);
    x.fillStyle = P.mix(dark, C.ink, 0.5); x.fillRect(2, 2, w - 4, h - 4);
    lines.forEach((l, i) => P.drawText(x, l, w / 2, 6 + i * 10, i === 0 ? main : '#ffffff', { align: 'center', font: i === 0 ? 5 : 3 }));
    return c;
  };
  A.crane = function (height, jib) {
    const { c, x } = P.canvas(jib + 40, height);
    const mx = 30;
    for (let j = 0; j < height - 20; j += 6) {
      x.fillStyle = C.yellowD; x.fillRect(mx, 20 + j, 1, 6); x.fillRect(mx + 8, 20 + j, 1, 6);
      P.line(x, mx, 20 + j, mx + 8, 26 + j, C.yellowD);
    }
    x.fillStyle = C.yellow; x.fillRect(0, 16, jib + 40, 2); x.fillRect(0, 21, jib + 40, 1);
    for (let i = 0; i < jib + 40; i += 6) P.line(x, i, 18, i + 6, 21, C.yellowD);
    x.fillStyle = '#3a3060'; x.fillRect(0, 12, 22, 9);
    x.fillStyle = C.yellow; x.fillRect(mx - 2, 8, 12, 9); x.fillStyle = C.cyan; x.fillRect(mx, 10, 8, 4);
    P.line(x, mx + 4, 0, 4, 16, '#8a86a8'); P.line(x, mx + 4, 0, jib + 36, 16, '#8a86a8');
    x.fillStyle = C.red; x.fillRect(mx + 3, 0, 3, 2);
    return { canvas: c, mast: mx, hookX: jib + 20 };
  };

  /* ---------------- backdrop skylines ---------------- */
  A.skyline = function (seed, w, h, opts) {
    const rnd = N.seeded(seed);
    const { c, x } = P.canvas(w, h);
    const beacons = [], strips = [];
    let bx = 0;
    while (bx < w) {
      const bw = opts.minW + ((rnd() * (opts.maxW - opts.minW)) | 0);
      const bh = opts.minH + ((rnd() * (opts.maxH - opts.minH)) | 0);
      const y0 = h - bh;
      const col = P.mix(opts.color, opts.color2, rnd());
      x.fillStyle = col; x.fillRect(bx, y0, bw, bh);
      // rooftop variety
      const r = rnd();
      if (r < 0.2) { x.fillRect(bx + bw / 2 - 1, y0 - 10, 2, 10); beacons.push({ x: bx + bw / 2, y: y0 - 11 }); }
      else if (r < 0.35) { x.fillRect(bx + 3, y0 - 4, bw - 6, 4); x.fillRect(bx + 6, y0 - 8, bw - 12, 4); }
      else if (r < 0.45) { for (let k = 0; k < bw / 2; k++) x.fillRect(bx + k, y0 - Math.floor(k / 2), bw - k * 2, 1); }
      // windows
      for (let wy = y0 + 4; wy < h - 2; wy += opts.wy) for (let wx = bx + 2; wx < bx + bw - 2; wx += opts.wx) {
        const q = rnd();
        if (q < opts.lit) { x.fillStyle = rnd() < 0.75 ? opts.win : (rnd() < 0.5 ? opts.win2 : opts.win3); x.fillRect(wx, wy, opts.ww, opts.wh); }
        else if (q < opts.lit + 0.2) { x.fillStyle = P.mix(col, '#ffffff', 0.05); x.fillRect(wx, wy, opts.ww, opts.wh); }
      }
      // neon strips (mid layer only)
      if (opts.strips && rnd() < 0.3 && bw > 14) {
        const key = N.pick(['magenta', 'cyan', 'yellow', 'lime', 'violet']);
        const sx = bx + 2 + ((rnd() * (bw - 10)) | 0), sy = y0 + 6 + ((rnd() * 20) | 0), n = 3 + ((rnd() * 4) | 0);
        strips.push({ x: sx, y: sy, n, key, phase: rnd() * 10 });
      }
      bx += bw + ((rnd() * opts.gap) | 0);
    }
    return { canvas: c, beacons, strips };
  };

  A.koi = function () {
    return P.sprite([
      '.........cc...........',
      '.......cccCcc.........',
      '..c..cccccccccc.......',
      '.ccccccCcccccccccc..cc',
      'cccccccccccwkcccccccc.',
      '.ccccccCccccccccccc..c',
      '..c..cccccccccc.......',
      '.......cccccc.........',
      '.........cc...........'
    ], { c: C.cyan, C: C.magenta, w: '#ffffff', k: C.ink });
  };
  A.blimp = function () {
    const { c, x } = P.canvas(84, 30);
    for (let j = 0; j < 22; j++) {
      const t = (j - 11) / 11, half = Math.sqrt(Math.max(0, 1 - t * t)) * 40;
      x.fillStyle = j < 4 ? '#4a3a7a' : j > 17 ? '#241a4a' : '#352a62';
      x.fillRect((42 - half) | 0, j, (half * 2) | 0, 1);
    }
    x.fillStyle = '#241a4a'; x.fillRect(4, 6, 6, 10); x.fillRect(0, 4, 4, 14);
    x.fillStyle = C.ink; x.fillRect(30, 22, 22, 6); x.fillStyle = C.warm; for (let i = 0; i < 4; i++) x.fillRect(32 + i * 5, 24, 3, 2);
    // marquee window
    x.fillStyle = C.ink; x.fillRect(16, 7, 56, 9);
    return { canvas: c, screen: { x: 17, y: 8, w: 54, h: 7 } };
  };

  A.ground = function (w = 64) {
    const { c, x } = P.canvas(w, 48);
    // sidewalk 0..12
    x.fillStyle = '#2c1f5c'; x.fillRect(0, 0, w, 12);
    x.fillStyle = '#3d2d78'; x.fillRect(0, 0, w, 1);
    x.fillStyle = '#231849'; for (let i = 0; i < w; i += 16) x.fillRect(i, 1, 1, 11);
    x.fillStyle = '#231849'; x.fillRect(0, 6, w, 1);
    P.dither(x, 0, 1, w, 11, '#35266a', 0.12);
    // curb 12..14
    x.fillStyle = '#5d4d96'; x.fillRect(0, 12, w, 1); x.fillStyle = '#1a1040'; x.fillRect(0, 13, w, 1);
    // road
    x.fillStyle = '#100a28'; x.fillRect(0, 14, w, 34);
    P.dither(x, 0, 14, w, 34, '#160e34', 0.2);
    // lane dashes
    x.fillStyle = '#5a4a2a'; x.fillRect(4, 30, 14, 1); x.fillRect(36, 30, 14, 1);
    return c;
  };

  N.CityArt = A;
  N.CityArt.neonBox = neonBox;
  N.CityArt.lightCone = lightCone;
  N.CityArt.scaleUp = scaleUp;
})();
