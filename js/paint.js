/* NEON-8 · graffiti wall: paint a 16x16 tag that stays on the wall */
(function () {
  const N = window.NEON, esc = N.esc, t = (k) => N.t(k);
  const PALETTE = ['#ff3ea5', '#ffb3dc', '#29f3ff', '#127a9e', '#ffd93b', '#ff8a3d', '#7dff5a', '#2a9c3f', '#b26bff', '#4d7cff', '#ff4d6d', '#f4ecff', '#9b8ac4', '#0a0618'];
  const S = 16, CELL = 20;
  let grid, color = 0, tool = 'pen', down = false, cv, x;

  function draw() {
    x.fillStyle = '#1a0f2e'; x.fillRect(0, 0, S * CELL, S * CELL);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const v = grid[j * S + i];
      if (v >= 0) { x.fillStyle = PALETTE[v]; x.fillRect(i * CELL, j * CELL, CELL, CELL); }
      else if ((i + j) % 2) { x.fillStyle = '#21133a'; x.fillRect(i * CELL, j * CELL, CELL, CELL); }
    }
    x.fillStyle = 'rgba(255,255,255,0.06)';
    for (let k = 1; k < S; k++) { x.fillRect(k * CELL, 0, 1, S * CELL); x.fillRect(0, k * CELL, S * CELL, 1); }
  }
  function cellAt(e) {
    const r = cv.getBoundingClientRect();
    const i = Math.floor((e.clientX - r.left) / r.width * S), j = Math.floor((e.clientY - r.top) / r.height * S);
    return i >= 0 && j >= 0 && i < S && j < S ? j * S + i : -1;
  }
  function apply(idx) {
    if (idx < 0) return;
    if (tool === 'fill') { flood(idx, grid[idx], color); }
    else { const v = tool === 'erase' ? -1 : color; if (grid[idx] === v) return; grid[idx] = v; }
    if (Math.random() < 0.4) N.Audio.sfx('spray');
    draw();
  }
  function flood(start, from, to) {
    if (from === to) return;
    const st = [start];
    while (st.length) {
      const k = st.pop(); if (grid[k] !== from) continue;
      grid[k] = to;
      const i = k % S, j = (k / S) | 0;
      if (i > 0) st.push(k - 1); if (i < S - 1) st.push(k + 1); if (j > 0) st.push(k - S); if (j < S - 1) st.push(k + S);
    }
  }
  function open() {
    down = false;
    grid = (N.Store.data.paint || []).slice();
    if (grid.length !== S * S) grid = new Array(S * S).fill(-1);
    N.UI.openWindow({
      id: 'paint', cls: 'win--paint', title: t('paint.title'), onClose() { down = false; },
      body: `<p class="paint-sub">${esc(t('paint.sub'))}</p>
        <div class="paint">
          <canvas class="paint-cv" width="${S * CELL}" height="${S * CELL}" aria-label="16 by 16 canvas"></canvas>
          <div class="paint-side">
            <div class="paint-pal" role="radiogroup" aria-label="Colors">${PALETTE.map((c, i) => `<button class="sw ${i === color ? 'is-on' : ''}" role="radio" aria-checked="${i === color}" data-c="${i}" style="--c:${c}" aria-label="Color ${i + 1}"></button>`).join('')}</div>
            <div class="paint-tools">
              <button class="toggle ${tool === 'pen' ? 'is-on' : ''}" data-t="pen">${N.lang === 'zh' ? '画笔' : 'Pen'}</button>
              <button class="toggle" data-t="fill">${N.lang === 'zh' ? '填充' : 'Fill'}</button>
              <button class="toggle" data-t="erase">${esc(t('paint.erase'))}</button>
            </div>
            <div class="paint-actions">
              <button class="btn btn--primary" data-a="save">${esc(t('paint.save'))}</button>
              <button class="btn btn--small" data-a="clear">${esc(t('paint.clear'))}</button>
              <button class="btn btn--small" data-a="png">${esc(t('paint.download'))}</button>
            </div>
          </div>
        </div>`,
      onOpen(api) {
        cv = api.win.querySelector('.paint-cv'); x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
        draw();
        cv.addEventListener('pointerdown', (e) => { down = true; cv.setPointerCapture(e.pointerId); apply(cellAt(e)); });
        cv.addEventListener('pointermove', (e) => { if (down && tool !== 'fill') apply(cellAt(e)); });
        const up = () => { down = false; };
        cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
        api.win.addEventListener('click', (e) => {
          const sw = e.target.closest('[data-c]');
          if (sw) { color = +sw.dataset.c; if (tool === 'erase') tool = 'pen'; api.win.querySelectorAll('.sw').forEach(b => { const on = +b.dataset.c === color; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); }); syncTools(api); N.Audio.sfx('blip'); }
          const tb = e.target.closest('[data-t]');
          if (tb) { tool = tb.dataset.t; syncTools(api); N.Audio.sfx('blip'); }
          const a = e.target.closest('[data-a]');
          if (a) {
            if (a.dataset.a === 'clear') { grid.fill(-1); draw(); N.Audio.sfx('back'); }
            if (a.dataset.a === 'save') {
              N.Store.data.paint = grid.slice(); N.Store.save();
              N.Audio.sfx('spray'); setTimeout(() => N.Audio.sfx('spray'), 120);
              N.Ach.unlock('artist'); N.UI.toast({ title: t('paint.title'), text: t('paint.saved') });
              api.close(true);
            }
            if (a.dataset.a === 'png') {
              const P = N.Pixel, { c, x: px } = P.canvas(S * 16, S * 16);
              grid.forEach((v, k) => { if (v >= 0) { px.fillStyle = PALETTE[v]; px.fillRect((k % S) * 16, ((k / S) | 0) * 16, 16, 16); } });
              const l = document.createElement('a'); l.download = 'neon8-tag.png'; l.href = c.toDataURL(); l.click();
            }
          }
        });
      }
    });
  }
  function syncTools(api) { api.win.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('is-on', b.dataset.t === tool)); }

  N.Paint = { PALETTE, open };
})();
