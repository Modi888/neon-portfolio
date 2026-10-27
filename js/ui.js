/* NEON-8 · UI core: icons, windows, HUD, speech bubbles, banners, toasts, small windows */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;
  const t = (k) => N.t(k), L = (v) => N.L(v), esc = N.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

  /* ---------------- pixel icons (CSS masks, tinted with currentColor) ---------------- */
  const ICON_ART = {
    map: ['...#####...', '..#######..', '.###...###.', '.###...###.', '.###...###.', '..#######..', '...#####...', '....###....', '.....#.....', '...........', '.#########.'],
    list: ['...........', '##.#######.', '##.#######.', '...........', '##.#######.', '##.#######.', '...........', '##.#######.', '##.#######.', '...........', '...........'],
    trophy: ['.#########.', '##.#####.##', '#..#####..#', '##.#####.##', '...#####...', '....###....', '.....#.....', '....###....', '...#####...', '...#####...', '...........'],
    sound: ['....#......', '...##...#..', '..###..#.#.', '#####.#..#.', '#####.#..#.', '#####.#..#.', '..###..#.#.', '...##...#..', '....#......', '...........', '...........'],
    mute: ['....#......', '...##......', '..###.#...#', '#####..#.#.', '#####...#..', '#####..#.#.', '..###.#...#', '...##......', '....#......', '...........', '...........'],
    crt: ['..#.....#..', '...#...#...', '....#.#....', '###########', '#.........#', '#.#.#.#.#.#', '#.........#', '#.#.#.#.#.#', '#.........#', '###########', '..#.....#..'],
    lang: ['...#####...', '..#..#..#..', '.#...#...#.', '###########', '.#...#...#.', '###########', '.#...#...#.', '..#..#..#..', '...#####...', '...........', '...........'],
    term: ['###########', '#.........#', '#.#.......#', '#..#......#', '#...#.....#', '#..#..###.#', '#.#.......#', '#.........#', '###########', '...........', '...........'],
    help: ['...#####...', '..##...##..', '..##...##..', '.......##..', '......##...', '.....##....', '.....##....', '...........', '.....##....', '.....##....', '...........'],
    menu: ['...........', '###########', '###########', '...........', '###########', '###########', '...........', '###########', '###########', '...........', '...........'],
    close: ['##.......##', '###.....###', '.###...###.', '..###.###..', '...#####...', '....###....', '...#####...', '..###.###..', '.###...###.', '###.....###', '##.......##'],
    coin: ['...#####...', '..#######..', '.###...###.', '.##.###.##.', '.##.#.#.##.', '.##.#.#.##.', '.##.###.##.', '.###...###.', '..#######..', '...#####...', '...........'],
    cat: ['.#.......#.', '.##.....##.', '.#########.', '.#########.', '.##.###.##.', '.#########.', '.####.####.', '..#######..', '...#####...', '...........', '...........'],
    play: ['.##........', '.####......', '.######....', '.########..', '.#########.', '.########..', '.######....', '.####......', '.##........', '...........', '...........'],
    mail: ['###########', '##.......##', '#.#.....#.#', '#..#...#..#', '#...#.#...#', '#....#....#', '#.........#', '###########', '...........', '...........', '...........'],
    gear: ['....###....', '.#.#####.#.', '.#########.', '..###.###..', '####...####', '####...####', '..###.###..', '.#########.', '.#.#####.#.', '....###....', '...........'],
    star: ['.....#.....', '....###....', '....###....', '###########', '.#########.', '..#######..', '..###.###..', '.###...###.', '.##.....##.', '...........', '...........'],
    arrowL: ['....##.....', '...##......', '..##.......', '.##########', '..##.......', '...##......', '....##.....', '...........', '...........', '...........', '...........'],
    arrowR: ['.....##....', '......##...', '.......##..', '##########.', '.......##..', '......##...', '.....##....', '...........', '...........', '...........', '...........'],
    link: ['....######.', '.......###.', '......####.', '.....###.#.', '....###....', '#..###.....', '#.###......', '#.##.......', '#.....#....', '#######....', '...........'],
    zoom: ['..####.....', '.#....#....', '#..##..#...', '#.####.#...', '#.####.#...', '#..##..#...', '.#....#....', '..####.#...', '.......##..', '........##.', '.........##'],
    copy: ['...#######.', '...#.....#.', '######...#.', '#....#...#.', '#....#...#.', '#....######', '#....#.....', '#....#.....', '######.....', '...........', '...........']
  };
  ICON_ART.bowl = ['....#..#...', '...#..#....', '....#..#...', '...........', '###########', '###########', '.#########.', '..#######..', '...#####...', '...........', '...........'];
  ICON_ART.power = ['.....#.....', '..#..#..#..', '.##..#..##.', '##...#...##', '#....#....#', '#.........#', '#.........#', '##.......##', '.##.....##.', '..#######..', '...........'];
  const iconURL = {};
  function makeIcons() {
    let css = '';
    for (const k in ICON_ART) {
      const rows = ICON_ART[k], s = k === 'power' ? 4 : 2;
      const { c, x } = P.canvas(rows[0].length * s, rows.length * s);
      x.fillStyle = '#fff';
      rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') x.fillRect(i * s, j * s, s, s); }));
      iconURL[k] = c.toDataURL();
      css += `.i-${k}{-webkit-mask-image:url(${iconURL[k]});mask-image:url(${iconURL[k]})}`;
    }
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  }
  const ico = (k, cls = '') => `<i class="ico i-${k} ${cls}" aria-hidden="true"></i>`;

  // colored item icons for the skills inventory
  const ITEM_ART = {
    sword: [['.......kk', '......kwk', '.....kwk.', '....kwk..', 'k..kwk...', '.kkwk....', '..kk.....', '.kyk.....', 'kyk......'], { k: C.ink, w: '#dfe4ff', y: C.yellow }],
    shield: [['kkkkkkkkk', 'kcccwccck', 'kccwwwcck', 'kcccwccck', 'kcccwccck', '.kccwcck.', '..kcwck..', '...kck...', '....k....'], { k: C.ink, c: C.blue, w: C.yellow }],
    potion: [['...kkk...', '...kwk...', '..kkkkk..', '.kmmmmmk.', 'kmmwmmmmk', 'kmwmmmmmk', 'kmmmmmmmk', '.kmmmmmk.', '..kkkkk..'], { k: C.ink, m: C.magenta, w: '#ffffff' }],
    gem: [['..kkkkk..', '.kcwcccck', 'kcwccccck', 'kccccccck', '.kccccck.', '..kccck..', '...kck...', '....k....', '.........'], { k: C.ink, c: C.cyan, w: '#ffffff' }],
    key: [['.kkk.....', 'kyyyk....', 'ky.ykkkkk', 'kyyykyyyk', '.kkk.kyk.', '......k..', '.........', '.........', '.........'], { k: C.ink, y: C.yellow }],
    scroll: [['.kkkkkkk.', 'kwwwwwwwk', '.kwkkkwk.', '.kwwwwwk.', '.kwkkwwk.', '.kwwwwwk.', '.kwkkkwk.', 'kwwwwwwwk', '.kkkkkkk.'], { k: C.ink, w: '#f4e2b8' }],
    map: [['kkkkkkkkk', 'kgggyggk.', 'kggyyggk.', 'kgyggrgk.', 'kgggggrgk', 'kggyggggk', 'kgyggggk.', 'kkkkkkkkk', '.........'], { k: C.ink, g: C.limeD, y: C.yellow, r: C.red }],
    star: [['....k....', '...kyk...', 'kkkkykkkk', 'kyyyyyyyk', '.kyyyyyk.', '..kyyyk..', '.kyykyyk.', '.kk...kk.', '.........'], { k: C.ink, y: C.yellow }],
    heart: [['.kk...kk.', 'kmmk.kmmk', 'kmwmkmmmk', 'kmmmmmmmk', '.kmmmmmk.', '..kmmmk..', '...kmk...', '....k....', '.........'], { k: C.ink, m: C.magenta, w: '#ffffff' }],
    bolt: [['....kkkk.', '...kyyk..', '..kyyk...', '.kyyykkk.', 'kkkkyyk..', '...kyk...', '..kyk....', '.kyk.....', '.kk......'], { k: C.ink, y: C.yellow }]
  };
  const itemURL = {};
  function itemSprite(name) { const [rows, map] = ITEM_ART[name] || ITEM_ART.star; return P.sprite(rows, map); }
  function itemIcon(name) {
    if (itemURL[name]) return itemURL[name];
    const big = N.CityArt.scaleUp(itemSprite(name), 4);
    return (itemURL[name] = big.toDataURL());
  }
  function spriteURL(canvas, s = 4) { return N.CityArt.scaleUp(canvas, s).toDataURL(); }

  /* ---------------- windows ---------------- */
  let layerRoot;
  const open = [];
  function windowHTML(o) {
    return `<div class="ov ${o.ovCls || ''}" data-win="${o.id}">
      <div class="ov-bg" data-close></div>
      <div class="win ${o.cls || ''}" role="dialog" aria-modal="true" aria-labelledby="wt-${o.id}" tabindex="-1" ${o.style ? `style="${o.style}"` : ''}>
        <div class="win-bar">${o.bar || `<span class="win-title" id="wt-${o.id}">${esc(o.title)}</span>`}
          <button class="win-x" data-close aria-label="${esc(t('modal.close'))}">${ico('close')}</button></div>
        <div class="win-body">${o.body}</div>
        ${o.foot ? `<div class="win-foot">${o.foot}</div>` : ''}
      </div></div>`;
  }
  function openWindow(o) {
    // only one window at a time
    while (open.length) open[open.length - 1].close(true);
    const prevFocus = document.activeElement;
    const node = el(windowHTML(o));
    layerRoot.appendChild(node);
    const win = node.querySelector('.win');
    const api = {
      id: o.id, node, win,
      close(silent) {
        if (api.closed) return; api.closed = true;
        const i = open.indexOf(api); if (i >= 0) open.splice(i, 1);
        N.App.pop(layer);
        node.classList.add('out');
        setTimeout(() => node.remove(), 160);
        if (!silent) N.Audio.sfx('close');
        if (o.onClose) o.onClose(silent);
        // focus goes back to the city rather than a HUD button, so a stray Space can't reopen the window
        const city = document.getElementById('city');
        if (N.App.screen === 'world' && !N.App.top() && city && (!prevFocus || prevFocus === document.body || (prevFocus.closest && prevFocus.closest('#hud')))) city.focus({ preventScroll: true });
        else if (prevFocus && prevFocus.focus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true });
      },
      set(body, foot) { win.querySelector('.win-body').innerHTML = body; if (foot != null) { const f = win.querySelector('.win-foot'); if (f) f.innerHTML = foot; } win.querySelector('.win-body').scrollTop = 0; }
    };
    const layer = {
      name: o.id,
      close: () => api.close(),
      onKey: (e) => {
        if (e.key === 'Tab' && o.trapTab !== false) trapTab(e, win);
        if (o.onKey) return o.onKey(e, api);
      }
    };
    node.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) api.close(); });
    open.push(api);
    N.App.push(layer);
    N.Audio.sfx('open');
    requestAnimationFrame(() => { const f = win.querySelector('[autofocus]') || win.querySelector('.win-x'); (f || win).focus({ preventScroll: true }); });
    if (o.onOpen) o.onOpen(api);
    return api;
  }
  function trapTab(e, root) {
    const f = [...root.querySelectorAll('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  const closeWindows = () => { while (open.length) open[open.length - 1].close(true); };

  /* ---------------- toasts ---------------- */
  function toast(o) {
    const box = $('#toasts');
    const n = el(`<div class="toast toast--${o.kind || 'info'}" role="status">
      ${o.kind === 'ach' ? `<span class="toast-ico">${ico('trophy')}</span>` : ''}
      <span class="toast-txt"><span class="toast-title">${esc(o.title || '')}</span><span class="toast-text">${esc(o.text || '')}</span></span></div>`);
    box.appendChild(n);
    setTimeout(() => n.classList.add('out'), o.ms || 3600);
    setTimeout(() => n.remove(), (o.ms || 3600) + 400);
    announce((o.title || '') + ' ' + (o.text || ''));
  }
  function announce(text) { const sr = $('#sr'); if (sr) { sr.textContent = ''; setTimeout(() => { sr.textContent = text; }, 30); } }

  /* ---------------- speech bubbles ---------------- */
  const bubbles = new Map();
  function say(line, who) {
    const text = L(line);
    if (!text) return;
    const key = who === 'byte' ? 'byte' : (who && who.kind) || 'npc';
    let b = bubbles.get(key);
    const host = $('#bubbles');
    if (!host) return;
    if (!b) {
      b = { node: el(`<div class="bubble ${key === 'byte' ? 'bubble--byte' : ''}"><span class="bubble-who"></span><span class="bubble-txt"></span></div>`) };
      host.appendChild(b.node); bubbles.set(key, b);
    }
    b.who = who; b.full = text; b.shown = 0; b.until = performance.now() + Math.max(2800, text.length * 75) + 900;
    b.node.querySelector('.bubble-who').textContent = key === 'byte' ? t('byte.name') : (who && who.kind ? N.label(who.kind.toUpperCase()) : '');
    // size the bubble for the whole line up front so it doesn't grow while typing
    const tx = b.node.querySelector('.bubble-txt');
    b.node.style.width = ''; tx.textContent = text;
    b.node.style.width = Math.ceil(b.node.getBoundingClientRect().width) + 'px';
    tx.textContent = '';
    b.node.classList.add('on');
    announce(text);
    if (!bubbleLoopOn) { bubbleLoopOn = true; requestAnimationFrame(bubbleLoop); }
  }
  let bubbleLoopOn = false, lastTalk = 0;
  function bubbleLoop(now) {
    let any = false;
    const stage = $('#stage');
    const sr = stage ? stage.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth };
    bubbles.forEach((b, key) => {
      if (!b.node.classList.contains('on')) return;
      any = true;
      if (b.shown < b.full.length) {
        b.shown = Math.min(b.full.length, b.shown + (N.lang === 'zh' ? 0.5 : 0.9));
        b.node.querySelector('.bubble-txt').textContent = b.full.slice(0, Math.ceil(b.shown));
        if (now - lastTalk > 70) { N.Audio.sfx(key === 'byte' ? 'tick' : 'talk'); lastTalk = now; }
      }
      if (now > b.until || !N.World.running) { b.node.classList.remove('on'); return; }
      let wx, wy;
      if (key === 'byte') { wx = N.World.byte.x; wy = N.World.byte.y - 8; }
      else if (b.who && b.who.x != null) { wx = b.who.x; wy = N.World.GROUND - 24; }
      else { wx = N.World.player.x; wy = N.World.player.y - 30; }
      const sc = N.World.scale, cam = N.World.cam;
      let px = (wx - cam.x) * sc, py = wy * sc;
      const w = b.node.offsetWidth;
      px = N.clamp(px - w / 2, 8, sr.width - w - 8);
      b.node.style.transform = `translate(${px | 0}px, ${(py - b.node.offsetHeight) | 0}px)`;
    });
    if (any) requestAnimationFrame(bubbleLoop); else bubbleLoopOn = false;
  }
  function hideBubbles() { bubbles.forEach(b => b.node.classList.remove('on')); }

  /* ---------------- banner ---------------- */
  let bannerT = 0;
  function banner(d, colorKey) {
    const bn = $('#banner'); if (!bn) return;
    const col = N.colorOf(colorKey || d.color);
    bn.style.setProperty('--accent', col);
    bn.innerHTML = `<span class="bn-world">WORLD ${esc(d.world)}</span><span class="bn-name">${esc(L(d.name))}</span>${d.sub ? `<span class="bn-sub">${esc(d.sub)}</span>` : ''}`;
    bn.classList.remove('on'); void bn.offsetWidth; bn.classList.add('on');
    clearTimeout(bannerT); bannerT = setTimeout(() => bn.classList.remove('on'), 2600);
    announce(`${t('district.enter')} ${L(d.name)}`);
  }

  /* ---------------- HUD ---------------- */
  const isTouch = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  function hudHTML() {
    const prof = N.DATA.profile;
    const btn = (id, icon, label, kbd) => `<button class="hud-btn" data-hud="${id}" title="${esc(label)}${kbd ? ` (${kbd})` : ''}" aria-label="${esc(label)}">${ico(icon)}<span class="hud-lbl">${esc(label)}</span></button>`;
    return `
      <div class="hud-l">
        <span class="hud-p1">P1</span>
        <span class="hud-name">${esc((prof.name || 'EDDIE').toUpperCase())}</span>
        <span class="hud-loc"><span class="hud-world" id="hudWorld">1-1</span><span class="hud-district" id="hudDistrict">${esc(L({ en: 'Home', zh: '家' }))}</span></span>
      </div>
      <div class="hud-c">
        <span class="stat stat-coin" title="${esc(t('hud.coins'))}">${ico('coin')}<b id="hudCoins">000</b></span>
        <span class="stat stat-cat" title="${esc(t('hud.cats'))}">${ico('cat')}<b id="hudCats">0/5</b></span>
        <button class="stat stat-ach" data-hud="trophies" title="${esc(t('hud.trophies'))}">${ico('trophy')}<b id="hudAch">0</b></button>
      </div>
      <nav class="hud-r" aria-label="Game menu">
        ${btn('map', 'map', t('hud.map'), 'M')}
        ${btn('list', 'list', t('hud.list'), 'L')}
        ${btn('term', 'term', t('hud.terminal'), '`')}
        ${btn('sound', N.Store.data.settings.music || N.Store.data.settings.sfx ? 'sound' : 'mute', t('hud.sound'))}
        ${btn('lang', 'lang', t('hud.lang'))}
        ${btn('menu', 'menu', t('hud.menu'), 'Esc')}
      </nav>`;
  }
  function renderHUD() {
    const h = $('#hud'); if (!h) return;
    h.innerHTML = hudHTML();
    updateHUD();
    setJob(jobState);
    const d = N.World.district; if (d) setDistrict(d);
  }
  function updateHUD() {
    const D = N.Store.data;
    const c = $('#hudCoins'); if (c) c.textContent = String(D.coins).padStart(3, '0');
    const k = $('#hudCats'); if (k) k.textContent = `${Object.keys(D.cats).length}/5`;
    const a = $('#hudAch'); if (a) a.textContent = `${N.Ach.count()}/${N.Ach.total()}`;
  }
  function setDistrict(d) {
    const w = $('#hudWorld'), n = $('#hudDistrict');
    if (w) w.textContent = d.world; if (n) n.textContent = L(d.name);
    const hud = $('#hud'); if (hud) hud.style.setProperty('--accent', N.colorOf(d.color));
  }
  function onHud(id) {
    N.Audio.sfx('select');
    if (id === 'map') openMap();
    else if (id === 'list') N.App.go('list');
    else if (id === 'term') N.Term.open();
    else if (id === 'trophies') openTrophies();
    else if (id === 'menu') openPause();
    else if (id === 'lang') N.setLang(N.lang === 'zh' ? 'en' : 'zh');
    else if (id === 'sound') {
      const s = N.Store.data.settings, on = !(s.music || s.sfx);
      N.Audio.setMusic(on); N.Audio.setSfx(on);
      if (on && !N.Audio.music.current) N.Audio.music.play('neon');
      renderHUD();
    }
  }

  /* ---------------- delivery pill ---------------- */
  let jobState = null;
  function setJob(j) {
    jobState = j;
    const el2 = $('#job'); if (!el2) return;
    if (!j) { el2.hidden = true; return; }
    el2.hidden = false;
    el2.classList.toggle('is-urgent', !!j.urgent);
    const m = Math.floor(j.secs / 60), ss = String(j.secs % 60).padStart(2, '0');
    el2.innerHTML = `${ico('bowl')}<span class="job-k">${esc(t('hud.job'))}</span><b>${esc(j.who)}</b><span class="job-t">${m}:${ss}</span>`;
  }

  /* ---------------- prompt bar ---------------- */
  function setPrompt(p) {
    const el2 = $('#prompt'); if (!el2) return;
    if (!p) { el2.classList.remove('on'); return; }
    const verb = t(p.key).replace(/^(Press F to |按 F )/, '');
    el2.innerHTML = `<kbd>${isTouch() ? 'B' : 'F'}</kbd><span>${esc(verb)}</span>${p.label ? `<b>${esc(p.label)}</b>` : ''}`;
    el2.classList.add('on');
  }

  /* ---------------- small windows ---------------- */
  function linksHTML(links) {
    return (links || []).filter(l => l && l.url).map(l => {
      const dead = !l.url || l.url === '#';
      return `<a class="btn btn--ghost ${dead ? 'is-dead' : ''}" ${dead ? 'aria-disabled="true"' : `href="${esc(l.url)}" target="_blank" rel="noopener"`}>${ico('link')}<span>${esc(L(l.label))}</span></a>`;
    }).join('');
  }
  function avatarURL(s = 8) { return spriteURL(N.Sprites.player.idle.r, s); }

  function openAbout() {
    const p = N.DATA.profile;
    const stats = (p.stats || []).map(s => `<li class="statbar"><span class="statbar-k">${esc(L(s.key))}</span><span class="statbar-v" style="--v:${N.clamp(s.value, 0, 100)}"><i></i></span><span class="statbar-n">${s.value}</span></li>`).join('');
    const inv = (p.skills || []).map(s => `<li class="slot" title="${esc(L(s.name))}"><img src="${itemIcon(s.icon)}" alt="" width="36" height="36"><span class="slot-name">${esc(L(s.name))}</span><span class="slot-lv" aria-label="level ${s.level} of 5">${'■'.repeat(s.level)}<span>${'■'.repeat(5 - s.level)}</span></span></li>`).join('');
    const quest = (p.timeline || []).map((q, i) => `<li><span class="q-year">${esc(L(q.year))}</span><span class="q-body"><b>${esc(L(q.title))}</b><span>${esc(L(q.text))}</span></span></li>`).join('');
    const bio = [].concat(L(p.bio) || []).map(par => `<p>${N.md(par).replace(/^<p>|<\/p>$/g, '')}</p>`).join('');
    openWindow({
      id: 'about', cls: 'win--sheet', title: t('about.title'),
      body: `<div class="sheet">
        <div class="sheet-id">
          <div class="sheet-av"><img src="${avatarURL(8)}" alt="" width="104" height="160"></div>
          <h2 class="sheet-name">${esc((p.name || '').toUpperCase())}</h2>
          <p class="sheet-full">${esc(L(p.fullName))}</p>
          <p class="sheet-role">${esc(L(p.role))}</p>
          <p class="sheet-loc">${esc(L(p.location))}</p>
          <p class="status-line"><i class="led ${p.available ? 'led--on' : ''}"></i>${esc(L(p.status))}</p>
          <div class="sheet-links">${linksHTML(p.links)}<a class="btn btn--ghost btn--small btn--mail" href="mailto:${esc(p.email)}">${ico('mail')}<span>${esc(p.email)}</span></a></div>
        </div>
        <div class="sheet-main">
          <section><h3>${esc(N.lang === 'zh' ? '简介' : 'About')}</h3><div class="md">${bio}</div></section>
          <section><h3>${esc(t('list.stats'))}</h3><ul class="stats">${stats}</ul></section>
          <section><h3>${esc(t('list.inventory'))}</h3><ul class="inv">${inv}</ul></section>
          <section><h3>${esc(t('list.quest'))}</h3><ol class="quest">${quest}</ol></section>
        </div></div>`
    });
  }

  function openContact(phone) {
    const p = N.DATA.profile;
    N.Ach.unlock('mail');
    const intro = phone
      ? `<p class="ring">${N.lang === 'zh' ? '☎ 嘟……嘟……您拨打的用户暂时无法接听。请在提示音后留言。' : '☎ Ring... ring... You reached ' + esc((p.name || '').toUpperCase()) + '. Leave a message after the beep.'}</p>`
      : `<p class="mail-sub">${esc(t('contact.sub'))}</p>`;
    openWindow({
      id: 'contact', cls: 'win--mail', title: phone ? (N.lang === 'zh' ? '电话亭' : 'Phone booth') : t('contact.title'),
      body: `${intro}
        <div class="mail-addr"><code>${esc(p.email)}</code><button class="btn btn--small" data-copy>${ico('copy')}<span>${esc(t('list.copy'))}</span></button></div>
        <form class="mail-form" autocomplete="off">
          <label><span>${N.lang === 'zh' ? '你的名字' : 'Your name'}</span><input name="name" required autofocus></label>
          <label><span>${N.lang === 'zh' ? '主题' : 'Subject'}</span><input name="subject" value="${N.lang === 'zh' ? '你好！' : 'Hello from NEON-8'}"></label>
          <label><span>${N.lang === 'zh' ? '内容' : 'Message'}</span><textarea name="msg" rows="4"></textarea></label>
          <button class="btn btn--primary" type="submit">${ico('mail')}<span>${esc(t('list.send'))}</span></button>
        </form>
        <div class="sheet-links">${linksHTML(p.links)}</div>`,
      onOpen(api) {
        api.win.querySelector('[data-copy]').addEventListener('click', async () => { const ok = await N.copy(p.email); toast({ title: ok ? t('list.copied') : p.email }); N.Audio.sfx('coin'); });
        api.win.querySelector('form').addEventListener('submit', (e) => {
          e.preventDefault();
          const f = e.target;
          const body = `${f.msg.value}\n\n— ${f.name.value}`;
          location.href = `mailto:${p.email}?subject=${encodeURIComponent(f.subject.value)}&body=${encodeURIComponent(body)}`;
          N.Audio.sfx('powerup');
        });
      }
    });
  }

  function openHelp() {
    const row = (keys, label) => `<li><span class="keys">${keys.map(k => `<kbd>${esc(k)}</kbd>`).join('')}</span><span>${esc(label)}</span></li>`;
    openWindow({
      id: 'help', cls: 'win--help', title: t('help.title'),
      body: `<ul class="keymap">
        ${row(['←', '→'], t('help.move'))}${row(['A', 'D'], t('help.move'))}
        ${row(['Shift'], t('help.run'))}${row(['Space', '↑'], t('help.jump'))}
        ${row(['F'], t('help.enter'))}${row(['M'], t('help.map'))}
        ${row(['`'], t('help.term'))}${row(['Esc'], t('help.esc'))}
      </ul>
      <p class="help-note">${esc(t('help.click'))}</p>
      <p class="help-secret">${esc(t('help.secrets'))}</p>`
    });
  }

  function openNote() {
    const zh = N.lang === 'zh';
    openWindow({
      id: 'note', cls: 'win--note', title: zh ? '便签' : 'Sticky note',
      // BYTE wonders out loud once you put it down: the only hint that "backwards" means the street's left edge
      onClose(silent) { if (!silent) setTimeout(() => { if (N.App.screen === 'world' && !N.App.top()) say({ en: 'Backwards... I wonder what that means.', zh: '后退……这到底是什么意思呢？' }, 'byte'); }, 350); },
      body: `<figure class="sticky"><blockquote>${esc(zh ? '“我们为什么就不能后退呢？”' : '“Why can\'t we go backwards?”')}</blockquote><figcaption>${esc(zh ? '——《头号玩家》' : '— Ready Player One')}</figcaption></figure>`
    });
    N.Audio.sfx('blip');
  }

  function openVending() {
    const D = N.Store.data, facts = N.DATA.profile.funFacts || [];
    const paid = D.coins > 0;
    if (paid) { D.coins--; N.Store.save(); N.emit('coins', D.coins); }
    const i = N.Store.bump('vend') - 1;
    const fact = facts.length ? facts[i % facts.length] : { en: '...', zh: '……' };
    N.Ach.unlock('vend');
    N.Audio.sfx('can');
    const drinks = ['NEON COLA', 'BYTE ZERO', 'PIXEL PUNCH', 'GLITCH TEA', 'RAM-UNE'];
    openWindow({
      id: 'vending', cls: 'win--vend', title: t('vending.title'),
      body: `<div class="vend">
        <div class="vend-machine" aria-hidden="true"><div class="vend-slot"><div class="vend-can"></div></div></div>
        <div class="vend-text">
          <p class="vend-paid">${esc(paid ? t('vending.paid') : t('vending.free'))}</p>
          <p class="vend-drink">${esc(drinks[i % drinks.length])}</p>
          <h3>${esc(t('vending.fact'))} #${(i % Math.max(1, facts.length)) + 1}</h3>
          <p class="vend-fact">${N.md(fact).replace(/^<p>|<\/p>$/g, '')}</p>
        </div></div>`
    });
  }

  function openNews() {
    N.Ach.unlock('news');
    const ps = N.mainProjects(), name = (N.DATA.profile.name || 'EDDIE').toUpperCase();
    const d = new Date();
    const date = d.toLocaleDateString(N.lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const web = ps.filter(p => p.type === 'web'), intern = ps.filter(p => p.type === 'intern'), soon = ps.filter(p => p.type.startsWith('soon'));
    const zh = N.lang === 'zh';
    const lead = web[0];
    const hl = [];
    web.slice(1).forEach(p => hl.push({ id: p.id, h: zh ? `${L(p.title)} 上线，居民纷纷点赞` : `${L(p.title)} opens on Web Street`, s: L(p.summary) }));
    intern.forEach(p => hl.push({ id: p.id, h: zh ? `本地开发者在 ${p.company} 实习归来` : `Local dev returns from ${p.company}`, s: L(p.period) }));
    soon.forEach(p => hl.push({ id: p.id, h: zh ? `${L(p.title)} 施工进度 ${p.progress || 0}%` : `${L(p.title)} is ${p.progress || 0}% built, sources say`, s: L(p.eta) }));
    openWindow({
      id: 'news', cls: 'win--news', title: 'NEON-8 TIMES',
      body: `<article class="paper">
        <header class="paper-mast"><span class="paper-name">The NEON-8 Times</span><span class="paper-date">${esc(date)}</span><span class="paper-price">${zh ? '售价：1 金币' : 'Price: 1 coin'}</span></header>
        ${lead ? `<section class="paper-lead"><h2>${esc(zh ? `${name} 的新作 ${L(lead.title)} 引发轰动` : `${name}'s ${L(lead.title)} draws crowds downtown`)}</h2>
          <p>${esc(L(lead.summary))}</p><button class="btn btn--small" data-open="${esc(lead.id)}">${esc(zh ? '阅读全文' : 'Read the full story')}</button></section>` : ''}
        <div class="paper-cols">${hl.map(x => `<section><h3>${esc(x.h)}</h3><p>${esc(x.s || '')}</p><button class="linkish" data-open="${esc(x.id)}">${esc(zh ? '详情' : 'More')}</button></section>`).join('')}
          <section class="paper-ad"><h3>${zh ? '分类广告' : 'Classifieds'}</h3><p>${zh ? `有个好玩的点子？找 ${name} 聊聊。回复快，代码干净，猫咪友好。` : `Got a fun idea? Talk to ${name}. Fast replies, clean code, cat friendly.`}</p><button class="linkish" data-contact>${zh ? '联系' : 'Contact'}</button></section>
          <section class="paper-wx"><h3>${zh ? '天气' : 'Weather'}</h3><p>${zh ? '小雨。霓虹指数 100%。' : 'Light rain. 100% chance of neon.'}</p></section>
        </div></article>`,
      onOpen(api) {
        api.win.addEventListener('click', (e) => {
          const o = e.target.closest('[data-open]'); if (o) N.UI.openProject(o.dataset.open);
          if (e.target.closest('[data-contact]')) openContact();
        });
      }
    });
  }

  function openMap() {
    const ds = N.World.districts;
    const cur = N.World.district;
    const showMinus = N.Store.data.minus;
    const st = ds.map((d) => {
      const ps = N.DATA.projects.filter(p => ({ web: 'web', corp: 'intern', build: 'soon-web', lab: 'soon-game', exp: 'experiment' })[d.id] === p.type);
      const here = cur && cur.id === d.id && N.World.scene === 'main';
      return `<li class="stn ${here ? 'is-here' : ''}" style="--accent:${N.colorOf(d.color)}">
        <button class="stn-btn" data-go="${d.id}"><span class="stn-dot"></span><span class="stn-world">${esc(d.world)}</span><span class="stn-name">${esc(L(d.name))}</span>${here ? `<span class="stn-here">${esc(t('map.here'))}</span>` : ''}</button>
        ${ps.length ? `<ul class="stn-proj">${ps.map(p => `<li><button class="linkish" data-p="${esc(p.id)}">${esc(L(p.title))}</button></li>`).join('')}</ul>` : ''}
      </li>`;
    }).join('');
    openWindow({
      id: 'map', cls: 'win--map', title: t('map.title'),
      body: `<p class="map-sub">${esc(t('map.sub'))}</p>
        <ol class="metro">${showMinus ? `<li class="stn stn--minus" style="--accent:${C.lime}"><button class="stn-btn" data-go="minus"><span class="stn-dot"></span><span class="stn-world">-1</span><span class="stn-name">${esc(t('map.secret'))}</span></button></li>` : ''}${st}</ol>`,
      onOpen(api) {
        api.win.addEventListener('click', (e) => {
          const g = e.target.closest('[data-go]');
          if (g) { api.close(true); N.World.teleport(g.dataset.go); }
          const pj = e.target.closest('[data-p]');
          if (pj) { api.close(true); N.World.walkTo(pj.dataset.p); }
        });
      },
      onKey(e, api) {
        if (/^[1-9]$/.test(e.key)) { const d = ds[+e.key - 1]; if (d) { api.close(true); N.World.teleport(d.id); } return true; }
      }
    });
  }

  function trophiesHTML() {
    return `<ul class="trophies">${N.Ach.list.map(a => {
      const got = N.Ach.has(a.id), secret = a.hidden && !got;
      return `<li class="tro ${got ? 'is-got' : ''} ${secret ? 'is-secret' : ''}">${ico('trophy', 'tro-ico')}<span class="tro-name">${esc(secret ? '???' : L(a.name))}</span><span class="tro-desc">${esc(secret ? t('trophies.hidden') : L(a.desc))}</span></li>`;
    }).join('')}</ul>`;
  }
  function openTrophies() {
    openWindow({ id: 'trophies', cls: 'win--trophies', title: `${t('trophies.title')}  ${N.Ach.count()}/${N.Ach.total()}`, body: trophiesHTML() });
  }

  function openSettings() {
    const s = N.Store.data.settings;
    const tog = (k, label, on) => `<li><span>${esc(label)}</span><button class="toggle ${on ? 'is-on' : ''}" data-set="${k}" aria-pressed="${on}">${esc(on ? t('on') : t('off'))}</button></li>`;
    openWindow({
      id: 'settings', cls: 'win--settings', title: t('settings.title'),
      body: `<ul class="settings">
        ${tog('music', t('settings.music'), s.music)}${tog('sfx', t('settings.sfx'), s.sfx)}
        <li><span>${esc(t('settings.volume'))}</span><input type="range" min="0" max="1" step="0.05" value="${s.volume}" data-vol aria-label="${esc(t('settings.volume'))}"></li>
        ${tog('crt', t('settings.crt'), s.crt)}${tog('rain', t('settings.rain'), s.rain)}
        <li><span>${esc(t('settings.lang'))}</span><button class="toggle is-on" data-set="lang">${N.lang === 'zh' ? '中文' : 'English'}</button></li>
        <li class="danger"><span></span><button class="btn btn--small btn--danger" data-reset>${esc(t('settings.reset'))}</button></li>
      </ul>`,
      onOpen(api) {
        api.win.addEventListener('click', (e) => {
          const b = e.target.closest('[data-set]');
          if (b) {
            const k = b.dataset.set;
            if (k === 'music') { N.Audio.setMusic(!s.music); if (s.music && !N.Audio.music.current) N.Audio.music.play('neon'); }
            else if (k === 'sfx') N.Audio.setSfx(!s.sfx);
            else if (k === 'crt') { s.crt = !s.crt; N.Store.save(); N.emit('settings'); }
            else if (k === 'rain') { N.World.egg('rain'); }
            else if (k === 'lang') { N.setLang(N.lang === 'zh' ? 'en' : 'zh'); return; }
            N.Audio.sfx('blip');
            api.close(true); openSettings();
          }
          if (e.target.closest('[data-reset]') && confirm(t('settings.resetConfirm'))) N.Store.reset();
        });
        api.win.querySelector('[data-vol]').addEventListener('input', (e) => N.Audio.setVolume(+e.target.value));
      }
    });
  }

  function openPause() {
    const items = [
      ['resume', N.lang === 'zh' ? '继续' : 'Resume'], ['map', t('hud.map')], ['list', t('hud.list')], ['trophies', t('hud.trophies')],
      ['term', t('hud.terminal')], ['settings', t('title.settings')], ['help', t('help.title')], ['title', N.lang === 'zh' ? '回到标题画面' : 'Title screen']
    ];
    openWindow({
      id: 'pause', cls: 'win--pause', title: N.lang === 'zh' ? '暂停' : 'Paused',
      body: `<ul class="menu" role="menu">${items.map(([k, l], i) => `<li><button class="menu-item" role="menuitem" data-m="${k}" ${i === 0 ? 'autofocus' : ''}><span class="menu-cur">▶</span>${esc(l)}</button></li>`).join('')}</ul>`,
      onOpen(api) {
        api.win.addEventListener('click', (e) => {
          const m = e.target.closest('[data-m]'); if (!m) return;
          const k = m.dataset.m; api.close(true); N.Audio.sfx('select');
          if (k === 'map') openMap(); else if (k === 'list') N.App.go('list'); else if (k === 'trophies') openTrophies();
          else if (k === 'settings') openSettings(); else if (k === 'help') openHelp(); else if (k === 'title') N.App.go('title');
          else if (k === 'term') N.Term.open();
        });
      },
      onKey(e) { return menuKeys(e); }
    });
  }
  function menuKeys(e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = [...document.querySelectorAll('.ov:last-child .menu-item')];
    const i = items.indexOf(document.activeElement);
    const n = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
    if (n) { n.focus(); N.Audio.sfx('blip'); }
    e.preventDefault(); return true;
  }

  /* ---------------- events ---------------- */
  function init() {
    layerRoot = $('#layer');
    makeIcons();
    // HUD buttons never keep focus from a mouse/touch press (keyboard Tab still reaches them)
    document.addEventListener('mousedown', (e) => { if (e.target.closest('[data-hud]')) e.preventDefault(); });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-hud]'); if (!b) return;
      onHud(b.dataset.hud);
      if (e.detail > 0 && N.App.screen === 'world' && !N.App.top()) { const c = document.getElementById('city'); if (c) c.focus({ preventScroll: true }); }
    });
    N.on('coins', updateHUD); N.on('cats', updateHUD); N.on('ach', updateHUD);
    N.on('job', setJob);
    N.on('district', setDistrict);
    N.on('prompt', setPrompt);
    N.on('lang', () => {
      renderHUD(); hideBubbles();
      const top = open[open.length - 1]; if (!top) return;
      if (top.reopen) { top.reopen(); return; }
      // windows with state the visitor would lose (terminal history, a half-drawn tag, a paid-for drink) stay as they are
      if (top.id === 'term' || top.id === 'paint' || top.id === 'vending') return;
      const again = REOPEN[top.id];
      top.close(true);
      if (again) again();
    });
    N.on('settings', () => { document.body.classList.toggle('no-crt', !N.Store.data.settings.crt); });
    document.body.classList.toggle('no-crt', !N.Store.data.settings.crt);
  }

  const REOPEN = { about: () => openAbout(), contact: () => openContact(), help: () => openHelp(), note: () => openNote(), news: () => openNews(), map: () => openMap(), trophies: () => openTrophies(), settings: () => openSettings(), pause: () => openPause() };

  N.UI = {
    init, el, ico, iconURL, itemIcon, itemSprite, spriteURL, avatarURL, openWindow, closeWindows, toast, announce, say, hideBubbles, banner,
    renderHUD, updateHUD, setPrompt, linksHTML, trophiesHTML, menuKeys,
    openAbout, openContact, openHelp, openNote, openVending, openNews, openMap, openTrophies, openSettings, openPause,
    get openCount() { return open.length; }, isTouch
  };
})();
