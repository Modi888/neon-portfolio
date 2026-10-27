/* NEON-8 · app: screens, layers, power-on, boot, title menu, global keys */
(function () {
  const N = window.NEON;
  const $ = (s) => document.querySelector(s);
  const t = (k) => N.t(k), esc = N.esc;

  const layers = [];
  let screen = 'power', worldReady = false, credits = 0;

  const App = N.App = {
    get screen() { return screen; },
    push(l) { layers.push(l); document.body.classList.add('has-layer'); },
    pop(l) { const i = layers.indexOf(l); if (i >= 0) layers.splice(i, 1); if (!layers.length) document.body.classList.remove('has-layer'); },
    top: () => layers[layers.length - 1],
    blocked: () => layers.length > 0 || screen !== 'world',
    go(name) {
      if (name === screen) return;
      const prev = screen; screen = name;
      document.querySelectorAll('.scr').forEach(s => { s.hidden = s.id !== 'scr-' + name; });
      document.body.dataset.screen = name;
      if (prev === 'world') N.World.stop();
      if (prev === 'title') N.Title.stop();
      N.UI.hideBubbles();
      if (name === 'world') {
        if (!worldReady) { N.World.init($('#city')); worldReady = true; }
        N.UI.renderHUD();
        N.World.start();
        N.Ach.unlock('start');
        if (N.Store.data.settings.music && !N.Audio.music.current) N.Audio.music.play('neon');
        setTimeout(() => $('#city').focus({ preventScroll: true }), 50);
      }
      if (name === 'list') {
        N.List.render();
        $('#scr-list').scrollTop = 0;
        N.Ach.unlock('quick');
        setTimeout(() => { const f = $('#scr-list .doc'); if (f) f.focus({ preventScroll: true }); }, 50);
      }
      if (name === 'title') showTitle();
    }
  };

  /* ---------------- power + boot ---------------- */
  function renderPower() {
    $('#scr-power').innerHTML = `
      <div class="power-burn" aria-hidden="true">${esc((N.DATA.profile.name || 'EDDIE').toUpperCase())}</div>
      <div class="power">
        <button class="power-btn" id="powerBtn" aria-label="${esc(t('power.press'))}"><span class="power-glyph ico i-power" aria-hidden="true"></span></button>
        <p class="power-os">${esc(t('power.title'))}</p>
        <p class="power-press">${esc(t('power.press'))}</p>
        <p class="power-sound">${esc(t('power.sound'))}</p>
        <div class="power-foot">
          <button class="linkish" id="powerQuick">${esc(t('power.hurry'))}</button>
          <button class="linkish" id="powerLang">${N.lang === 'zh' ? 'English' : '中文'}</button>
        </div>
      </div>`;
    $('#powerBtn').addEventListener('click', (e) => { e.stopPropagation(); powerOn(); });
    $('#powerQuick').addEventListener('click', (e) => { e.stopPropagation(); N.Audio.init(); App.go('list'); });
    $('#powerLang').addEventListener('click', (e) => { e.stopPropagation(); N.setLang(N.lang === 'zh' ? 'en' : 'zh'); renderPower(); });
  }
  let booting = false;
  function powerOn() {
    if (booting) return; booting = true;
    N.Audio.init();
    N.Audio.sfx('power');
    document.body.classList.add('crt-on');
    setTimeout(() => document.body.classList.remove('crt-on'), 900);
    if (N.reducedMotion) { App.go('title'); return; }
    App.go('boot');
    runBoot();
  }
  let bootTimer = 0;
  function runBoot() {
    const D = N.DATA, n = D.projects.length;
    const lines = [
      ['EDDIE-OS BIOS v8.0', '(C) 2026 NEON-8 SYSTEMS'],
      ['CPU: CURIOSITY CORE @ 8 MHZ', 'OK'],
      ['MEMORY TEST: 640K', 'OK'],
      ['COFFEE LEVEL: ' + ((D.profile.stats || []).find(s => /caff|咖啡/i.test(N.L(s.key) + JSON.stringify(s.key))) || { value: 61 }).value + '%', 'OK'],
      ['LOADING NEON.DRV', 'OK'],
      [`MOUNTING /PROJECTS (${n} FILES)`, 'OK'],
      ['GENERATING CITY: NEON-8', 'OK'],
      ['COUNTING CATS', '5 FOUND'],
      ['STARTING ' + (D.profile.name || 'EDDIE').toUpperCase() + '.EXE', '']
    ];
    const box = $('#scr-boot');
    box.innerHTML = `<pre class="boot" aria-live="polite"></pre><button class="linkish boot-skip">${esc(t('skip'))}</button>`;
    box.querySelector('.boot-skip').addEventListener('click', endBoot);
    const pre = box.querySelector('.boot');
    let i = 0;
    const step = () => {
      if (screen !== 'boot') return;
      if (i >= lines.length) { bootTimer = setTimeout(endBoot, 380); return; }
      const [a, b] = lines[i];
      const dots = b ? ' ' + '.'.repeat(Math.max(2, 34 - a.length)) + ' ' : '';
      pre.innerHTML += `<span class="${b === 'OK' ? '' : 'hl'}">${esc(a)}${esc(dots)}<b>${esc(b)}</b></span>\n`;
      N.Audio.sfx('type');
      i++;
      bootTimer = setTimeout(step, i === 1 ? 260 : 110 + Math.random() * 90);
    };
    step();
  }
  function endBoot() { clearTimeout(bootTimer); if (screen === 'boot') App.go('title'); }

  /* ---------------- title ---------------- */
  let menuIdx = 0;
  function titleItems() {
    const D = N.Store.data;
    const items = [], played = D.coinsTotal > 0 || N.Ach.count() > 1;
    if (played) items.push({ id: 'continue', label: t('title.continue'), sub: `${D.coins} ◎  ${N.Ach.count()}/${N.Ach.total()} ★` });
    // first visit only: nudge toward the game, and own the boring option
    items.push({ id: 'start', label: t('title.start'), hint: played ? '' : t('title.rec'), hintCls: 'is-rec' });
    items.push({ id: 'quick', label: t('title.quick'), hint: played ? '' : t('title.nofun') });
    items.push({ id: 'settings', label: t('title.settings') });
    return items;
  }
  function showTitle() {
    const box = $('#scr-title');
    box.innerHTML = `
      <div class="title-stage"><canvas id="titleCanvas" aria-hidden="true"></canvas></div>
      <h1 class="sr-only">${esc((N.DATA.profile.name || 'EDDIE').toUpperCase())}: ${esc(N.L(N.DATA.profile.role))}</h1>
      <div class="title-ui" id="titleUi">
        <p class="title-tag">${esc(N.L(N.DATA.profile.tagline))}</p>
        <ul class="title-menu" role="menu"></ul>
        <p class="title-keys"><span><kbd>↑</kbd><kbd>↓</kbd> ${esc(t('title.help'))}</span><span><kbd>Enter</kbd> ${esc(t('title.confirm'))}</span></p>
      </div>
      <div class="title-foot"><span>© 2026 ${esc((N.DATA.profile.name || 'EDDIE').toUpperCase())}</span><button class="title-credit" id="titleCredit">${esc(t('title.credit'))} <b>${String(credits).padStart(2, '0')}</b></button><button class="title-lang" id="titleLang">${N.lang === 'zh' ? 'English' : '中文'}</button></div>`;
    $('#titleLang').addEventListener('click', () => { N.setLang(N.lang === 'zh' ? 'en' : 'zh'); N.Title.stop(); showTitle(); });
    $('#titleCredit').addEventListener('click', insertCoin);
    menuIdx = 0;
    renderMenu();
    $('#titleUi').classList.remove('on');
    N.Title.start(() => { $('#titleUi').classList.add('on'); focusMenu(); });
    if (N.Title.ready) $('#titleUi').classList.add('on');
  }
  function renderMenu() {
    const ul = document.querySelector('.title-menu'); if (!ul) return;
    ul.innerHTML = titleItems().map((it, i) => `<li><button class="title-item ${i === menuIdx ? 'is-cur' : ''}" role="menuitem" data-ti="${it.id}" data-i="${i}"><span class="menu-cur" aria-hidden="true">▶</span><span>${esc(it.label)}</span>${it.hint ? `<em class="title-hint ${it.hintCls || ''}">${esc(it.hint)}</em>` : ''}${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</button></li>`).join('');
    ul.querySelectorAll('.title-item').forEach(b => {
      b.addEventListener('click', () => choose(b.dataset.ti));
      b.addEventListener('mouseenter', () => { if (menuIdx !== +b.dataset.i) { menuIdx = +b.dataset.i; mark(); N.Audio.sfx('blip'); } });
      b.addEventListener('focus', () => { menuIdx = +b.dataset.i; mark(); });
    });
  }
  function mark() { document.querySelectorAll('.title-item').forEach((b, i) => b.classList.toggle('is-cur', i === menuIdx)); }
  function focusMenu() { const b = document.querySelectorAll('.title-item')[menuIdx]; if (b) b.focus({ preventScroll: true }); }
  function choose(id) {
    N.Audio.init(); N.Audio.sfx('select');
    if (id === 'start' || id === 'continue') App.go('world');
    else if (id === 'quick') App.go('list');
    else if (id === 'settings') N.UI.openSettings();
  }
  function insertCoin() {
    credits = Math.min(99, credits + 1);
    N.Audio.sfx('coin');
    const b = $('#titleCredit b'); if (b) b.textContent = String(credits).padStart(2, '0');
  }
  function titleKey(e) {
    if (e.repeat && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return; }
    // a focused footer button (language, credits) keeps its own Enter/Space
    if ((e.key === 'Enter' || e.key === ' ') && onControl(e) && !e.target.closest('.title-item')) return;
    if (!N.Title.ready) { N.Title.skip(); $('#titleUi').classList.add('on'); focusMenu(); e.preventDefault(); return; }
    const n = titleItems().length;
    if (e.key === 'ArrowDown' || e.key === 's') { menuIdx = (menuIdx + 1) % n; mark(); focusMenu(); N.Audio.sfx('blip'); e.preventDefault(); }
    else if (e.key === 'ArrowUp' || e.key === 'w') { menuIdx = (menuIdx - 1 + n) % n; mark(); focusMenu(); N.Audio.sfx('blip'); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === ' ') { choose(titleItems()[menuIdx].id); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') insertCoin();
  }

  /* ---------------- global keys ---------------- */
  function isTyping(e) { const tg = e.target; return tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable); }
  const onControl = (e) => !!(e.target && e.target.closest && e.target.closest('button, a[href], [role="button"]'));
  N.onControl = onControl;
  window.addEventListener('keydown', (e) => {
    N.Audio.init();
    if (screen === 'power') {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.key === 'Tab' || e.key === 'Shift') return;
      if ((e.key === 'Enter' || e.key === ' ') && onControl(e) && e.target.id !== 'powerBtn') return; // let the focused link-button act
      e.preventDefault(); powerOn(); return;
    }
    if (screen === 'boot') { if (!e.repeat) endBoot(); e.preventDefault(); return; }
    const top = App.top();
    if (top) {
      // the layer owns this key: don't let the city (or the eggs) see it too,
      // even if handling it just closed the layer
      e.stopImmediatePropagation();
      if (e.key === 'Escape') { e.preventDefault(); top.close(); return; }
      if (top.onKey && top.onKey(e)) e.preventDefault();
      return;
    }
    if (isTyping(e)) return;
    if (e.key === '`' || e.key === '~' || e.code === 'Backquote') { e.preventDefault(); N.Term.open(); return; }
    if (screen === 'title') { titleKey(e); return; }
    if (screen === 'world') {
      if (e.key === 'Escape') { e.preventDefault(); N.UI.openPause(); }
      else if (e.code === 'KeyM') N.UI.openMap();
      else if (e.code === 'KeyL') App.go('list');
      else if (e.code === 'KeyH') N.UI.openHelp();
      return;
    }
    if (screen === 'list' && e.key === 'Escape') { /* nothing to close */ }
  });
  document.addEventListener('pointerdown', () => N.Audio.init(), { once: true });
  $('#scr-power') && document.getElementById('scr-power').addEventListener('click', () => powerOn());

  /* ---------------- tab visibility ---------------- */
  const baseTitle = `${(N.DATA.profile.name || 'EDDIE').toUpperCase()}.EXE · NEON-8`;
  document.title = baseTitle;
  let cityWasRunning = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.title = N.lang === 'zh' ? '回来继续玩！· INSERT COIN' : 'Come back! · INSERT COIN';
      N.Audio.suspend();
      cityWasRunning = N.World.running;
      if (cityWasRunning) N.World.stop();
    } else {
      document.title = baseTitle;
      N.Audio.resume();
      if (cityWasRunning && screen === 'world') N.World.start();
      cityWasRunning = false;
    }
  });

  /* ---------------- favicon ---------------- */
  function favicon() {
    const P = N.Pixel;
    const { c, x } = P.canvas(32, 32);
    x.fillStyle = '#120936'; x.fillRect(0, 0, 32, 32);
    x.drawImage(N.CityArt.scaleUp(N.Sprites.byte.a, 3), 1, 3);
    const l = document.createElement('link'); l.rel = 'icon'; l.href = c.toDataURL(); document.head.appendChild(l);
  }

  /* ---------------- mobile pad ---------------- */
  function wirePad() {
    document.querySelectorAll('[data-pad]').forEach(b => {
      const k = b.dataset.pad;
      const down = (e) => { e.preventDefault(); N.Audio.init(); N.World.press(k, true); b.classList.add('is-down'); };
      const up = (e) => { e.preventDefault(); N.World.press(k, false); b.classList.remove('is-down'); };
      b.addEventListener('pointerdown', down);
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
      b.addEventListener('contextmenu', e => e.preventDefault());
    });
  }

  function route(first) {
    const h = location.hash;
    const m = h.match(/^#\/p\/([\w-]+)/);
    if (m && N.project(m[1])) {
      const shown = document.querySelector('.ov[data-win="project"]');
      if (shown && shown.dataset.pid === m[1]) return; // already showing it
      if (screen === 'power' || screen === 'boot' || screen === 'title') App.go('list');
      setTimeout(() => N.UI.openProject(m[1]), 60);
    }
    else if (h === '#list' || h === '#quick') { if (screen !== 'list') App.go('list'); }
    else if (h === '#play' && first) App.go('world');
  }

  /* ---------------- boot the app ---------------- */
  function start() {
    N.UI.init();
    N.List.wire();
    favicon();
    wirePad();
    N.on('lang', () => {
      if (screen === 'power') renderPower();
      if (screen === 'title') { N.Title.stop(); showTitle(); }
      document.title = baseTitle;
    });
    renderPower();
    document.querySelectorAll('.scr').forEach(s => { s.hidden = s.id !== 'scr-power'; });
    document.body.dataset.screen = 'power';
    // deep links: #/p/<id> opens a project in the quick view, #list opens the quick view
    route(true);
    window.addEventListener('hashchange', () => route(false));
    if (N.Eggs) N.Eggs.init();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
