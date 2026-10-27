/* NEON-8 · title screen: a rooftop neon sign igniting over the skyline */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL, A = N.CityArt;
  let VH = 240;
  let cv, ctx, VW = 400, raf = 0, running = false, t0 = 0, sky, far, mid, letters = [], sub, drops = [], phase = 'ignite', glitch = 0, onReady = null;

  function bind() {
    cv = document.getElementById('titleCanvas');
    if (!cv || cv.dataset.bound) return;
    cv.dataset.bound = '1';
    cv.addEventListener('click', (e) => {
      // clicking the sign: glitch easter egg
      const r = cv.getBoundingClientRect(), s = r.height / VH;
      const y = (e.clientY - r.top) / s;
      if (y > 20 && y < 110) { glitch = 14; N.Audio.sfx('glitch'); N.Ach.bump('logo', 1, 10, 'glitch'); }
    });
  }
  function setup() {
    far = A.skyline('t-far', 900, 120, { minW: 14, maxW: 34, minH: 30, maxH: 100, gap: 4, color: '#1a0c3f', color2: '#1f1048', win: '#3a2470', win2: '#4a2a80', win3: '#5a3a90', lit: 0.18, wx: 4, wy: 5, ww: 1, wh: 1 });
    mid = A.skyline('t-mid', 1000, 150, { minW: 22, maxW: 52, minH: 50, maxH: 140, gap: 10, color: '#22104d', color2: '#2b1660', win: '#ffcf6b', win2: C.cool, win3: C.pink, lit: 0.12, wx: 5, wy: 6, ww: 2, wh: 2 });
    const name = (N.DATA.profile.name || 'EDDIE').toUpperCase().slice(0, 8);
    const sc = name.length > 6 ? 4 : 5;
    letters = [...name].map((ch, i) => ({ ch, on: P.neonText(ch, C.magenta, { scale: sc, blur: 8, pad: 10 }), full: P.neonText(ch, C.magenta, { scale: sc, blur: 12, pad: 10, core: '#ffffff' }), off: P.neonText(ch, C.magenta, { scale: sc, pad: 10, off: true }), state: 0, t: 0, w: P.measure(ch, { scale: sc }) }));
    letters.sc = sc;
    sub = { on: P.neonText('PORTFOLIO.EXE', C.cyan, { scale: 2, blur: 5, pad: 8 }), off: P.neonText('PORTFOLIO.EXE', C.cyan, { scale: 2, pad: 8, off: true }) };
    window.addEventListener('resize', () => { if (running) resize(); });
  }
  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    // fit the sign on narrow (portrait) screens by shrinking the pixel scale and growing the canvas height
    const signW = letters.reduce((acc, l) => acc + l.w + letters.sc * 2, 0) + 40;
    const minW = Math.max(240, signW);
    let s = r.height / 240;
    if (r.width / s < minW) s = r.width / minW;
    VH = Math.max(240, Math.ceil(r.height / s));
    VW = Math.max(minW, Math.ceil(r.width / s));
    cv.width = VW; cv.height = VH;
    cv.style.width = VW * s + 'px'; cv.style.height = VH * s + 'px';
    cv.closest('.scr').style.setProperty('--ts', s);
    ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const g = P.canvas(VW, VH); sky = g.c;
    P.ditherGradient(g.x, 0, 0, VW, VH, [[0, '#07031a'], [0.4, '#140838'], [0.72, '#2c0f55'], [0.9, '#5a1868'], [1, '#7a2070']]);
    drops = Array.from({ length: N.reducedMotion ? 40 : 120 }, () => ({ x: Math.random() * VW, y: Math.random() * VH, v: 3 + Math.random() * 2.5, l: 3 + ((Math.random() * 3) | 0) }));
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const x = ctx;
    x.drawImage(sky, 0, 0);
    // stars
    const sr = N.seeded('title-stars');
    for (let i = 0; i < 60; i++) { const sx = sr() * VW, sy = sr() * 120, ph = sr() * 6; if (Math.sin(t * (0.6 + sr() * 2) + ph) > -0.2) { x.fillStyle = sr() < 0.2 ? C.cyanL : '#ffffff'; x.fillRect(sx | 0, sy | 0, 1, 1); } }
    // moon
    const mx = (VW * 0.82) | 0, my = 34;
    P.ditherGlow(x, mx, my, 28, P.rgba(C.magentaL, 0.9), 0.22);
    x.fillStyle = '#fff2d8';
    for (let j = -12; j <= 12; j++) for (let i = -12; i <= 12; i++) if (i * i + j * j <= 144 && !((i - 5) * (i - 5) + (j - 3) * (j - 3) < 90)) x.fillRect(mx + i, my + j, 1, 1);
    // skylines drifting
    const pan = t * 6;
    tile(x, far.canvas, pan * 0.3, VH - 46 - far.canvas.height + 20);
    tile(x, mid.canvas, pan * 0.7, VH - mid.canvas.height + 10);
    // rooftop + sign frame
    const total = letters.reduce((a, l) => a + l.w + letters.sc * 2, -letters.sc * 2);
    let lx = ((VW - total) / 2) | 0;
    const ly = 34;
    x.fillStyle = '#0d0624'; x.fillRect(0, VH - 34, VW, 34);
    x.fillStyle = '#1a0f3c'; x.fillRect(0, VH - 34, VW, 2);
    x.fillStyle = '#2a1d5a';
    for (let px = lx - 10; px < lx + total + 10; px += 14) x.fillRect(px, ly + 40, 1, VH - 34 - ly - 40);
    x.fillRect(lx - 12, ly + 40, total + 24, 2); x.fillRect(lx - 12, ly + 52, total + 24, 1);
    for (let px = lx - 10; px < lx + total; px += 14) P.line(x, px, ly + 42, px + 14, ly + 52, '#2a1d5a');
    // ignition sequence
    const ignite = Math.min(letters.length, t * 2.2 - 0.6);
    letters.forEach((l, i) => {
      let on = false;
      if (ignite > i + 0.6) on = true;
      else if (ignite > i) { on = Math.random() < 0.55; if (on && Math.random() < 0.3) N.Audio.sfx('buzz'); }
      if (l.state !== 2 && ignite > i + 0.6) { l.state = 2; }
      if (glitch > 0 && Math.random() < 0.4) on = !on;
      // the 2nd letter flickers forever, like every good neon sign, until someone fixes the fuse box
      const full = N.Fuse && N.Fuse.fixed >= N.Fuse.total;
      if (!full && i === 1 && l.state === 2 && Math.random() < 0.006) on = false;
      const gx = glitch > 0 ? ((Math.random() - 0.5) * 6) | 0 : 0;
      x.drawImage(on ? (full && l.state === 2 ? l.full : l.on) : l.off, lx - 10 + gx, ly - 10);
      if (full && l.state === 2 && Math.random() < 0.05) { x.fillStyle = '#ffffff'; x.fillRect(lx - 4 + ((Math.random() * (l.w + 8)) | 0), ly - 6 + ((Math.random() * 46) | 0), 1, 1); }
      lx += l.w + letters.sc * 2;
    });
    // spill onto the rooftop
    if (ignite >= letters.length) { x.globalCompositeOperation = 'lighter'; P.ditherGlow(x, VW / 2, ly + 30, 90, P.rgba(C.magenta, 0.7), 0.16); x.globalCompositeOperation = 'source-over'; }
    // subtitle
    const subOn = t * 2.2 - 0.6 > letters.length + 0.8;
    x.drawImage(subOn ? sub.on : sub.off, ((VW - sub.on.width) / 2) | 0, ly + 60);
    if (subOn && phase === 'ignite') { phase = 'ready'; if (onReady) onReady(); }
    // rain
    x.fillStyle = 'rgba(170,190,255,0.35)';
    for (const d of drops) {
      d.y += d.v; d.x -= d.v * 0.18;
      if (d.y > VH) { d.y = -6; d.x = Math.random() * (VW + 40); }
      for (let k = 0; k < d.l; k++) x.fillRect((d.x + k * 0.2) | 0, (d.y - k) | 0, 1, 1);
    }
    if (glitch > 0) {
      glitch--;
      for (let k = 0; k < 6; k++) { const gy = (Math.random() * VH) | 0, gh = 2 + ((Math.random() * 8) | 0); x.drawImage(cv, 0, gy, VW, gh, ((Math.random() - 0.5) * 20) | 0, gy, VW, gh); }
    }
  }
  function tile(x, img, off, y) { const w = img.width, o = -((off % w + w) % w); for (let px = o; px < VW; px += w) x.drawImage(img, px | 0, y | 0); }

  N.Title = {
    start(ready) {
      if (!far) setup();
      bind();
      onReady = ready; phase = 'ignite';
      running = true; t0 = performance.now();
      if (N.reducedMotion) t0 -= 10000;
      resize();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    },
    skip() { if (phase === 'ignite') t0 -= 10000; },
    stop() { running = false; cancelAnimationFrame(raf); },
    get ready() { return phase === 'ready'; }
  };
})();
