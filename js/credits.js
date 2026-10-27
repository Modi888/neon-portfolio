/* NEON-8 · the last train: rolling credits over a city at speed */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL, A = N.CityArt;
  const t = (k) => N.t(k), L = (v) => N.L(v), esc = N.esc;
  const VH = 240;
  let root = null, cv, ctx, VW = 400, raf = 0, layer = null, T = 0, far, mid, train, sky, endT = 0;

  function lines() {
    const p = N.DATA.profile, D = N.Store.data, zh = N.lang === 'zh';
    const name = (p.name || 'EDDIE').toUpperCase();
    const row = (k, v) => `<p class="cr-row"><span>${esc(k)}</span><i></i><b>${esc(v)}</b></p>`;
    const viewed = N.mainProjects().filter(x => D.viewed[x.id]).length;
    return `
      <h2 class="cr-title">NEON-8</h2>
      <p class="cr-sub">${zh ? '一份 8-bit 作品集' : 'A portfolio in 8 bits'}</p>
      <div class="cr-block">
        ${row(zh ? '设计' : 'Design', name)}${row(zh ? '代码' : 'Code', name)}${row(zh ? '像素美术' : 'Pixel art', name)}
        ${row(zh ? '音乐' : 'Music', 'EDDIE-OS SOUND CHIP')}${row(zh ? '无人机' : 'Drone', 'BYTE')}${row(zh ? '咖啡' : 'Coffee', '∞')}
      </div>
      <h3 class="cr-h">${zh ? '你的这一局' : 'Your run'}</h3>
      <div class="cr-block">
        ${row(zh ? '看过的作品' : 'Projects viewed', `${viewed}/${N.mainProjects().length}`)}
        ${row(zh ? '金币' : 'Coins collected', String(D.coinsTotal))}
        ${row(zh ? '猫' : 'Cats found', `${Object.keys(D.cats).length}/5`)}
        ${row(zh ? '成就' : 'Trophies', `${N.Ach.count()}/${N.Ach.total()}`)}
      </div>
      <h3 class="cr-h">${zh ? '特别感谢' : 'Special thanks'}</h3>
      <p class="cr-big">${zh ? '你，感谢你来玩' : 'You, for playing'}</p>
      <div class="cr-end">
        <div class="cr-btns">
          <a class="btn btn--primary" href="mailto:${esc(p.email)}">${N.UI.ico('mail')}<span>${esc(t('credits.mail'))}</span></a>
          ${N.UI.linksHTML(p.links)}
        </div>
        <div class="cr-btns">
          <button class="btn btn--small" data-cr="again">${esc(t('credits.replay'))}</button>
          <button class="btn btn--small" data-cr="back">${esc(t('credits.back'))}</button>
        </div>
      </div>`;
  }

  function setup() {
    far = A.skyline('cr-far', 900, 120, { minW: 14, maxW: 34, minH: 30, maxH: 110, gap: 4, color: '#1a0c3f', color2: '#1f1048', win: '#3a2470', win2: '#4a2a80', win3: '#5a3a90', lit: 0.2, wx: 4, wy: 5, ww: 1, wh: 1 });
    mid = A.skyline('cr-mid', 1100, 160, { minW: 22, maxW: 52, minH: 50, maxH: 150, gap: 10, color: '#22104d', color2: '#2b1660', win: '#ffcf6b', win2: C.cool, win3: C.pink, lit: 0.14, wx: 5, wy: 6, ww: 2, wh: 2 });
    train = A.train(4, { stripe: C.magenta });
  }
  function resize() {
    const s = innerHeight / VH;
    VW = Math.ceil(innerWidth / s);
    cv.width = VW; cv.height = VH; cv.style.width = VW * s + 'px'; cv.style.height = innerHeight + 'px';
    ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const g = P.canvas(VW, VH); sky = g.c;
    P.ditherGradient(g.x, 0, 0, VW, VH, [[0, '#07031a'], [0.5, '#1d0b4a'], [0.85, '#4d1566'], [1, '#6e1f6e']]);
  }
  function tile(img, off, y) { const w = img.width, o = -((off % w + w) % w); for (let px = o; px < VW; px += w) ctx.drawImage(img, px | 0, y | 0); }
  function frame() {
    raf = requestAnimationFrame(frame);
    T += 1 / 60;
    const x = ctx, sp = Math.min(1, T / 3);
    x.drawImage(sky, 0, 0);
    const sr = N.seeded('cr-stars');
    for (let i = 0; i < 50; i++) { const sx = (sr() * VW - T * 2 * sp) % VW; x.fillStyle = '#fff'; x.fillRect(((sx + VW) % VW) | 0, (sr() * 110) | 0, 1, 1); }
    const mx = VW * 0.78, my = 34;
    P.ditherGlow(x, mx, my, 26, P.rgba(C.magentaL, 0.9), 0.2);
    x.fillStyle = '#fff2d8'; for (let j = -11; j <= 11; j++) for (let i = -11; i <= 11; i++) if (i * i + j * j <= 121 && !((i - 5) * (i - 5) + (j - 3) * (j - 3) < 80)) x.fillRect(mx + i | 0, my + j, 1, 1);
    tile(far.canvas, T * 30 * sp, VH - 70 - far.canvas.height + 20);
    tile(mid.canvas, T * 90 * sp, VH - 40 - mid.canvas.height + 30);
    // track
    const ty = VH - 52;
    x.fillStyle = '#120936'; x.fillRect(0, ty, VW, VH - ty);
    x.fillStyle = '#2f1d66'; x.fillRect(0, ty, VW, 2);
    x.fillStyle = P.rgba(C.magenta, 0.7); x.fillRect(0, ty + 6, VW, 1);
    const po = -((T * 420 * sp) % 120);
    for (let px = po; px < VW; px += 120) { x.fillStyle = '#1a0f3c'; x.fillRect(px | 0, ty + 8, 10, VH - ty); x.fillStyle = '#2a1d5a'; x.fillRect(px | 0, ty + 8, 2, VH - ty); }
    // train, gently swaying
    const tx = ((VW - train.width) / 2) | 0, tyy = ty - train.height + 1 + Math.round(Math.sin(T * 9) * 0.6);
    x.drawImage(train, tx, tyy);
    // the passenger: a tiny face in the third window of the second car
    x.fillStyle = C.hair; x.fillRect(tx + 86 + 32, tyy + 9, 5, 2); x.fillStyle = C.skin; x.fillRect(tx + 86 + 32, tyy + 11, 5, 3); x.fillStyle = C.cyan; x.fillRect(tx + 86 + 33, tyy + 11, 4, 1);
    // light streaks
    for (let k = 0; k < 14; k++) {
      const lx = (VW - ((T * (300 + k * 40) * sp + k * 97) % (VW + 200))) | 0, ly = 20 + ((k * 37) % 120);
      x.fillStyle = P.rgba(k % 3 ? C.cyanL : C.magentaL, 0.35); x.fillRect(lx, ly, 18 + k, 1);
    }
  }

  function play() {
    if (root) return;
    if (!far) setup();
    root = document.createElement('div');
    root.className = 'ov ov--credits';
    root.innerHTML = `<canvas class="cr-cv" aria-hidden="true"></canvas><div class="cr-roll" role="region" aria-label="${esc(t('credits.board'))}"><div class="cr-inner">${lines()}</div></div><button class="btn btn--small cr-skip" data-cr="back">${esc(t('credits.back'))}</button>`;
    document.getElementById('layer').appendChild(root);
    cv = root.querySelector('.cr-cv');
    resize(); window.addEventListener('resize', resize);
    T = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    layer = { name: 'credits', close: () => stop() };
    N.App.push(layer);
    N.World.stop();
    N.Audio.sfx('whoosh');
    N.Ach.unlock('aboard');
    N.UI.hideBubbles();
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cr]'); if (!b) return;
      if (b.dataset.cr === 'again') { stop(true); setTimeout(play, 80); }
      if (b.dataset.cr === 'back') stop();
    });
    const inner = root.querySelector('.cr-inner');
    if (N.reducedMotion) { inner.classList.add('is-static'); root.classList.add('is-static'); }
    clearTimeout(endT);
    endT = setTimeout(() => { if (root) root.querySelector('.cr-end').classList.add('on'); }, N.reducedMotion ? 0 : 1000);
  }
  function stop(silent) {
    if (!root) return;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    N.App.pop(layer);
    root.remove(); root = null;
    if (!silent) N.Audio.sfx('close');
    if (N.App.screen === 'world') N.World.start();
  }

  N.Credits = { play, stop };
})();
