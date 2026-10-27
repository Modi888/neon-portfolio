/* NEON-8 · project windows + generated pixel thumbnails */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const t = (k) => N.t(k), L = (v) => N.L(v), esc = N.esc;
  const ORDER = ['web', 'intern', 'soon-web', 'soon-game', 'experiment', 'graveyard'];
  // a graveyard project opened directly (from its tomb or a link) brings the graveyard into prev/next
  const ordered = (want) => { const g = N.Store.data.minus || (want && (N.project(want) || {}).type === 'graveyard'); return ORDER.flatMap(k => N.projectsOf(k)).filter(p => p.type !== 'graveyard' || g); };

  const STATUS = { 'LIVE': 'lime', 'SHELVED': 'grey', 'SCRUBBED': 'grey', 'R.I.P.': 'lime', 'COMPLETE': 'cyan', 'SHIPPED': 'cyan', 'ARCHIVED': 'grey', 'IN DEV': 'orange', 'PROTOTYPE': 'yellow', 'CONCEPT': 'violet', 'COMING SOON': 'magenta' };
  const STATUS_ZH = { 'LIVE': '运行中', 'SHELVED': '已下架', 'SCRUBBED': '已终止', 'R.I.P.': '已安息', 'COMPLETE': '已完成', 'SHIPPED': '已发布', 'ARCHIVED': '已归档', 'IN DEV': '开发中', 'PROTOTYPE': '原型', 'CONCEPT': '构思中', 'COMING SOON': '即将推出' };
  const statusChip = (s) => s ? `<span class="status status--${STATUS[s] || 'magenta'}"><i class="led ${STATUS[s] === 'grey' ? '' : 'led--on'}"></i>${esc(N.lang === 'zh' ? (STATUS_ZH[s] || s) : s)}</span>` : '';

  /* ---------------- thumbnails ---------------- */
  const thumbCache = new Map();
  function thumb(p, w = 160, h = 90) {
    const key = p.id + w + 'x' + h;
    if (thumbCache.has(key)) return thumbCache.get(key);
    const { c, x } = P.canvas(w, h);
    const r = N.seeded(p.id + 'thumb');
    const [main, dark, light] = P.NEONS[p.color] || P.NEONS.magenta;
    if (p.type === 'web') {
      P.ditherGradient(x, 0, 0, w, h, [[0, P.mix(dark, C.ink, 0.5)], [1, C.ink]]);
      const bx = 10, by = 8, bw = w - 20, bh = h - 12;
      x.fillStyle = C.ink; x.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      x.fillStyle = '#efe9ff'; x.fillRect(bx, by, bw, bh);
      x.fillStyle = '#c9c0e8'; x.fillRect(bx, by, bw, 6);
      [C.red, C.yellow, C.lime].forEach((cc, i) => { x.fillStyle = cc; x.fillRect(bx + 3 + i * 4, by + 2, 2, 2); });
      x.fillStyle = '#ffffff'; x.fillRect(bx + 18, by + 1, bw - 24, 4);
      // hero
      x.fillStyle = main; x.fillRect(bx + 4, by + 10, bw - 8, 30);
      P.dither(x, bx + 4, by + 30, bw - 8, 10, dark, 0.4);
      const title = (p.sign || p.id).toUpperCase().slice(0, 10);
      P.drawText(x, title, bx + 10, by + 15, C.ink, { scale: title.length > 6 ? 1 : 2 });
      x.fillStyle = '#ffffff'; x.fillRect(bx + 10, by + 33, 30, 3);
      x.fillStyle = C.ink; x.fillRect(bx + bw - 30, by + 32, 20, 5);
      // cards
      for (let i = 0; i < 3; i++) {
        const cx = bx + 4 + i * ((bw - 8) / 3 | 0);
        x.fillStyle = i === 1 ? light : '#d6cff0'; x.fillRect(cx, by + 44, ((bw - 8) / 3 | 0) - 3, 16);
        x.fillStyle = '#8f86b3'; x.fillRect(cx + 2, by + 48, 14 + ((r() * 10) | 0), 1); x.fillRect(cx + 2, by + 51, 10 + ((r() * 10) | 0), 1);
      }
      x.fillStyle = '#8f86b3'; for (let l = 0; l < 3; l++) x.fillRect(bx + 4, by + 64 + l * 3, bw - 20 - ((r() * 30) | 0), 1);
    } else if (p.type === 'intern') {
      P.ditherGradient(x, 0, 0, w, h, [[0, '#07031a'], [0.6, '#1d0b4a'], [1, '#4d1566']]);
      for (let i = 0; i < 26; i++) { x.fillStyle = '#ffffff'; x.fillRect((r() * w) | 0, (r() * 40) | 0, 1, 1); }
      for (let bx = 0; bx < w; bx += 10 + ((r() * 10) | 0)) { const bh = 20 + ((r() * 40) | 0); x.fillStyle = '#22104d'; x.fillRect(bx, h - bh, 12, bh); }
      const tw = 40, th = 74, tx = w / 2 - tw / 2;
      P.ditherGradient(x, tx, h - th, tw, th, [[0, '#24407f'], [1, '#1a1450']]);
      for (let fy = h - th + 12; fy < h - 4; fy += 6) for (let fx = tx + 2; fx < tx + tw - 3; fx += 5) if (r() < 0.35) { x.fillStyle = '#bfe9ff'; x.fillRect(fx, fy, 3, 3); }
      x.fillStyle = main; x.fillRect(tx, h - th, 1, th); x.fillRect(tx + tw - 1, h - th, 1, th);
      const lab = (p.sign || p.company || 'CORP').toUpperCase().slice(0, 12);
      x.shadowColor = main; x.shadowBlur = 4; P.drawText(x, lab, w / 2, h - th - 10, main, { font: 3, align: 'center' }); x.shadowBlur = 0;
      x.fillStyle = C.red; x.fillRect(w / 2, h - th - 14, 1, 1);
    } else if (p.type === 'soon-web') {
      x.fillStyle = '#0d2a5a'; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(41,243,255,0.12)'; for (let i = 0; i < w; i += 8) x.fillRect(i, 0, 1, h); for (let j = 0; j < h; j += 8) x.fillRect(0, j, w, 1);
      x.fillStyle = 'rgba(41,243,255,0.25)'; for (let i = 0; i < w; i += 32) x.fillRect(i, 0, 1, h); for (let j = 0; j < h; j += 32) x.fillRect(0, j, w, 1);
      const dash = (X, Y, W, H) => { x.fillStyle = C.cyanL; for (let i = 0; i < W; i += 3) { x.fillRect(X + i, Y, 2, 1); x.fillRect(X + i, Y + H - 1, 2, 1); } for (let j = 0; j < H; j += 3) { x.fillRect(X, Y + j, 1, 2); x.fillRect(X + W - 1, Y + j, 1, 2); } };
      dash(14, 10, w - 28, 12); dash(14, 28, 70, 34); dash(90, 28, w - 104, 15); dash(90, 47, w - 104, 15);
      P.drawText(x, (p.sign || p.id).toUpperCase().slice(0, 10), 20, 14, C.cyanL, { font: 3 });
      const pw = w - 28, fill = Math.round(pw * (p.progress || 0) / 100);
      x.fillStyle = C.ink; x.fillRect(14, h - 16, pw, 6);
      x.fillStyle = C.orange; x.fillRect(14, h - 16, fill, 6);
      P.drawText(x, (p.progress || 0) + '%', w - 14, h - 26, C.orange, { font: 3, align: 'right' });
      for (let i = 0; i < w; i++) { x.fillStyle = ((i / 5 | 0) % 2) ? C.yellow : C.ink; x.fillRect(i, 0, 1, 3); }
    } else if (p.type === 'experiment') {
      // a night launch: rocket on the pad, gantry, a few sparks overhead
      P.ditherGradient(x, 0, 0, w, h, [[0, '#07031a'], [0.7, '#2a0c3a'], [1, '#5a1a2a']]);
      for (let i = 0; i < 24; i++) { x.fillStyle = '#ffffff'; x.fillRect((r() * w) | 0, (r() * h * 0.6) | 0, 1, 1); }
      for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2, d = 8 + r() * 10; x.fillStyle = k % 2 ? C.magenta : C.yellow; x.fillRect((w * 0.72 + Math.cos(a) * d) | 0, (18 + Math.sin(a) * d * 0.8) | 0, 1, 1); }
      x.fillStyle = '#3a3060'; x.fillRect(w / 2 - 22, h - 70, 2, 64); x.fillRect(w / 2 - 14, h - 70, 2, 64);
      for (let yy = h - 70; yy < h - 6; yy += 8) x.fillRect(w / 2 - 22, yy, 10, 1);
      const rk = N.CityArt.rocket();
      x.drawImage(rk, (w / 2 - rk.width / 2) | 0, h - 8 - rk.height);
      x.fillStyle = '#5d4d7a'; x.fillRect(0, h - 8, w, 8); x.fillStyle = C.yellow; for (let i = 0; i < w; i += 8) x.fillRect(i, h - 8, 4, 1);
    } else {
      // game poster, landscape
      const g = Object.assign({}, p);
      N.CityArt.paintPoster(x, 0, 0, w, h, g, r, { ribbon: false });
    }
    thumbCache.set(key, c);
    return c;
  }

  function drawThumbs(root) {
    root.querySelectorAll('canvas[data-thumb]').forEach(cv => {
      const p = N.project(cv.dataset.thumb); if (!p) return;
      const w = +cv.dataset.w || 160, h = +cv.dataset.h || 90;
      const src = thumb(p, w, h);
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(src, 0, 0);
    });
  }

  /* ---------------- project window ---------------- */
  function facts(p) {
    const f = [];
    const add = (k, v) => { if (v != null && L(v) !== '') f.push(`<div class="fact"><dt>${esc(t(k))}</dt><dd>${esc(L(v))}</dd></div>`); };
    if (p.type === 'intern') { add('modal.role', p.role); add('modal.period', p.period); add('modal.team', p.team); add('modal.where', p.location); }
    else if (p.type === 'soon-game') { add('modal.role', p.role); add('modal.genre', p.genre); add('modal.platform', p.platform); add('modal.eta', p.eta); }
    else if (p.type === 'soon-web') { add('modal.role', p.role); add('modal.eta', p.eta); add('modal.year', p.year); }
    else if (p.type === 'graveyard') { add('modal.years', p.years); add('modal.cause', p.cause); add('modal.epitaph', p.epitaph); add('modal.role', p.role); }
    else { add('modal.role', p.role); add('modal.year', p.year); }
    return `<dl class="facts">${f.join('')}</dl>`;
  }
  function progressBar(p) {
    if (!p.type.startsWith('soon')) return '';
    const v = N.clamp(p.progress || 0, 0, 100);
    return `<div class="progress" role="img" aria-label="${esc(t('modal.progress'))} ${v}%"><span class="progress-k">${esc(t('modal.progress'))}</span><span class="progress-bar" style="--v:${v}"><i></i></span><span class="progress-n">${v}%</span></div>`;
  }
  // every photo gets a magnifier: the window's CRT scanlines make small text hard to read
  const zoomBtn = (src) => `<button type="button" class="zoom-btn" data-zoom="${esc(src)}" aria-label="${esc(t('modal.zoom'))}" title="${esc(t('modal.zoom'))}">${N.UI.ico('zoom')}</button>`;
  function zoom(src) {
    const box = document.createElement('div');
    box.className = 'zoombox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', t('modal.zoom'));
    box.innerHTML = `<img src="${esc(src)}" alt=""><button type="button" class="zoombox-x" aria-label="${esc(t('modal.close'))}">${N.UI.ico('close')}</button>`;
    const layer = { close() { box.remove(); N.App.pop(layer); N.Audio.sfx('blip'); if (back) back.focus({ preventScroll: true }); } };
    const back = document.activeElement;
    box.addEventListener('click', () => layer.close());
    document.body.appendChild(box);
    N.App.push(layer);
    N.Audio.sfx('blip');
    box.querySelector('.zoombox-x').focus({ preventScroll: true });
  }
  function gallery(p) {
    const g = p.gallery || [];
    if (!g.length) return '';
    return `<section class="sec sec--gallery"><h3>${esc(t('modal.gallery'))}</h3><div class="gallery">${g.map(it => it.src
      ? `<figure class="shot"><div class="shot-pic"><img src="${esc(it.src)}" alt="${esc(L(it.caption))}" loading="lazy" data-zoom="${esc(it.src)}">${zoomBtn(it.src)}</div><figcaption>${esc(L(it.caption))}</figcaption></figure>`
      : `<figure class="shot shot--empty"><span class="shot-plus" aria-hidden="true">+</span><figcaption>${esc(L(it.caption))}</figcaption></figure>`).join('')}</div></section>`;
  }
  // demo: { src, poster, caption } — a short screen recording, plays inline
  function demo(p) {
    const d = p.demo; if (!d || !d.src) return '';
    return `<section class="sec sec--demo"><h3>${esc(t('modal.demo'))}</h3><figure class="demo ${d.portrait ? 'demo--tall' : ''}"><video src="${esc(d.src)}"${d.poster ? ` poster="${esc(d.poster)}"` : ''} controls playsinline preload="none"></video>${d.caption ? `<figcaption>${esc(L(d.caption))}</figcaption>` : ''}</figure></section>`;
  }
  function metrics(p) {
    const m = p.metrics || [];
    if (!m.length) return '';
    return `<section class="sec sec--loot"><h3>${esc(t('modal.results'))}</h3><ul class="loot">${m.map(x => `<li><b>${esc(L(x.value)).replace(/\s*([\u3400-\u9fff]+)/g, '<small>$1</small>')}</b><span>${esc(L(x.label))}</span></li>`).join('')}</ul></section>`;
  }
  function cover(p) {
    // cover can be one path or { en, zh } for a screenshot per language
    if (p.cover) return `<figure class="cover"><img src="${esc(L(p.cover))}" alt="" data-zoom="${esc(L(p.cover))}">${zoomBtn(L(p.cover))}</figure>`;
    return `<figure class="cover cover--gen"><canvas data-thumb="${esc(p.id)}" data-w="192" data-h="96" aria-hidden="true"></canvas><figcaption>${esc(t('modal.addShot'))}</figcaption></figure>`;
  }
  function header(p) {
    const cat = `<span class="chip">${esc(t('cat.' + (p.kind || p.type)))}</span>`;
    return `<header class="ph">
      <div class="ph-meta">${cat}${statusChip(p.status)}${p.year ? `<span class="ph-year">${esc(p.year)}</span>` : ''}</div>
      <h2 class="ph-title" id="pt-${esc(p.id)}">${esc(L(p.title))}</h2>
      ${p.summary ? `<p class="ph-sum">${N.md(p.summary).replace(/^<p>|<\/p>$/g, '')}</p>` : ''}
    </header>`;
  }
  function bodyHTML(p) {
    const tags = (p.tags || []).length ? `<ul class="tags" aria-label="${esc(t('modal.stack'))}">${p.tags.map(x => `<li>${esc(L(x))}</li>`).join('')}</ul>` : '';
    // a section can carry one photo: image: { src, caption }
    const secImg = (im) => im && im.src ? `<figure class="sec-img"><div class="sec-pic"><img src="${esc(L(im.src))}" alt="${esc(L(im.caption) || '')}" loading="lazy" data-zoom="${esc(L(im.src))}">${zoomBtn(L(im.src))}</div>${im.caption ? `<figcaption>${esc(L(im.caption))}</figcaption>` : ''}</figure>` : '';
    const secs = (p.sections || []).map(s => `<section class="sec"><h3>${esc(L(s.title))}</h3><div class="md">${N.md(s.body)}</div>${secImg(s.image)}</section>`).join('');
    const links = N.UI.linksHTML(p.links);
    let deco = '';
    if (p.type === 'intern') deco = `<div class="stamp" aria-hidden="true">INTERN</div>`;
    if (p.type === 'soon-web') deco = `<div class="tape" aria-hidden="true"><span>${esc(N.lang === 'zh' ? '施工中 · 请勿靠近 · 施工中 · 请勿靠近 ·' : 'UNDER CONSTRUCTION — KEEP OUT — UNDER CONSTRUCTION — KEEP OUT —')}</span></div>`;
    if (p.type === 'soon-game') deco = `<div class="rating" aria-hidden="true"><b>E</b><span>${esc(t('modal.rated'))}</span></div>`;
    return `${deco}${header(p)}
      <div class="p-grid">
        <div class="p-main">${cover(p)}${progressBar(p)}${secs}${demo(p)}${metrics(p)}${gallery(p)}</div>
        <aside class="p-side">${facts(p)}${tags}${links ? `<div class="p-links">${links}</div>` : ''}</aside>
      </div>`;
  }
  function barHTML(p) {
    if (p.kind === 'app') return `<span class="bar-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="bar-url">${esc(L(p.title))} · ${esc(N.lang === 'zh' ? '安卓 / iOS 应用' : 'Android / iOS app')}</span>`;
    if (p.type === 'web') return `<span class="bar-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="bar-url">${esc(p.url || ('https://' + p.id + '.site'))}</span>`;
    if (p.type === 'intern') return `<span class="win-title">${esc(t('modal.confidential'))}: ${esc(p.company || '')}</span>`;
    if (p.type === 'graveyard') return `<span class="win-title">R.I.P. / ${esc((p.sign || p.id).toUpperCase())} · ${esc(p.years || p.year || '')}</span>`;
    if (p.type === 'experiment') return `<span class="win-title">${esc(t('modal.missionlog'))} / ${esc(L(p.title))}</span>`;
    if (p.type === 'soon-web') return `<span class="win-title">${esc(t('modal.blueprint'))} / ${esc((p.sign || p.id).toUpperCase())}</span>`;
    return `<span class="win-title">${esc(t('modal.coming'))}</span>`;
  }
  function footHTML(i, n) {
    return `<button class="btn btn--small" data-nav="-1">${N.UI.ico('arrowL')}<span>${esc(t('modal.prev'))}</span></button>
      <span class="foot-count">${i + 1} / ${n}</span>
      <button class="btn btn--small" data-nav="1"><span>${esc(t('modal.next'))}</span>${N.UI.ico('arrowR')}</button>`;
  }

  function openProject(id) {
    const list = ordered(id);
    let i = Math.max(0, list.findIndex(p => p.id === id));
    let p = list[i];
    if (!p) return;
    const style = (pp) => `--accent:${N.colorOf(pp.color)}`;
    const api = N.UI.openWindow({
      id: 'project', cls: `win--proj proj--${p.type}`, style: style(p), bar: barHTML(p),
      body: bodyHTML(p), foot: footHTML(i, list.length),
      onOpen(a) { drawThumbs(a.win); wire(a); },
      onClose() { if (location.hash.startsWith('#/p/')) history.replaceState(null, '', location.pathname + location.search); },
      onKey(e, a) {
        if (e.key === 'ArrowRight') { go(a, 1); return true; }
        if (e.key === 'ArrowLeft') { go(a, -1); return true; }
      }
    });
    api.reopen = () => { api.close(true); openProject(p.id); };
    mark(p, api);
    function go(a, d) {
      i = (i + d + list.length) % list.length; p = list[i];
      a.win.className = `win win--proj proj--${p.type}`;
      a.win.setAttribute('style', style(p));
      const bar = a.win.querySelector('.win-bar');
      bar.innerHTML = barHTML(p) + `<button class="win-x" data-close aria-label="${esc(t('modal.close'))}">${N.UI.ico('close')}</button>`;
      a.set(bodyHTML(p), footHTML(i, list.length));
      drawThumbs(a.win);
      N.Audio.sfx('blip');
      mark(p, a);
    }
    function wire(a) {
      a.win.addEventListener('click', (e) => { const nb = e.target.closest('[data-nav]'); if (nb) go(a, +nb.dataset.nav); const z = e.target.closest('[data-zoom]'); if (z) zoom(z.dataset.zoom); });
    }
  }
  function mark(p, a) {
    if (a && a.node) a.node.dataset.pid = p.id;
    N.Ach.viewed(p.id);
    try { history.replaceState(null, '', '#/p/' + p.id); } catch (e) { }
  }

  N.UI.openProject = openProject;
  N.Thumbs = { thumb, drawThumbs, statusChip, ordered, zoom };
})();
