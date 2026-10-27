/* NEON-8 · quick view: the whole portfolio as one scrollable page */
(function () {
  const N = window.NEON;
  const t = (k) => N.t(k), L = (v) => N.L(v), esc = N.esc;
  const ico = (k) => N.UI.ico(k);

  const STAGES = [
    { type: 'web', world: '1-2', name: { en: 'Websites and apps', zh: '网站与应用' }, nav: { en: 'Sites + apps', zh: '网站与应用' }, sub: { en: 'Shipped and live. Every one of these is a shop on Web Street.', zh: '已经上线的网站和应用。每一个都是网站街上的一家店。' }, shelf: 'cart' },
    { type: 'intern', world: '1-3', name: { en: 'Internships', zh: '实习经历' }, sub: { en: 'Where I have worked. Each badge opens the personnel file.', zh: '我工作过的地方。点开工牌就是人事档案。' }, shelf: 'badge' },
    { type: 'soon-web', world: '1-5', name: { en: 'Under construction', zh: '施工中' }, nav: { en: 'Building', zh: '施工中' }, sub: { en: 'Websites I am building right now.', zh: '正在建设中的网站。' }, shelf: 'blue' },
    { type: 'soon-game', world: '1-6', name: { en: 'Coming soon', zh: '即将推出' }, sub: { en: 'Games in development.', zh: '正在开发的游戏。' }, shelf: 'box' },
    { type: 'experiment', world: '1-7', name: { en: 'Experiments', zh: '实验' }, sub: { en: 'Things I built to see what would happen. Not all of them survived.', zh: '为了看看会发生什么而做的东西，不是每个都活了下来。' }, shelf: 'cart' },
    { type: 'graveyard', world: '-1', name: { en: 'Graveyard', zh: '墓地' }, sub: { en: 'Projects that did not make it. You found the secret level, so you get to see them.', zh: '没能活下来的项目。你找到了隐藏关卡，所以能看到它们。' }, shelf: 'tomb', secret: true }
  ];

  function card(p, shelf) {
    const acc = N.colorOf(p.color);
    const tags = (p.tags || []).slice(0, 3).map(x => `<li>${esc(L(x))}</li>`).join('');
    if (shelf === 'cart') return `<li><button class="cart" style="--accent:${acc}" data-open="${esc(p.id)}">
        <span class="cart-top" aria-hidden="true"></span>
        <span class="cart-label"><canvas data-thumb="${esc(p.id)}" data-w="160" data-h="90" aria-hidden="true"></canvas></span>
        <span class="cart-title">${esc(L(p.title))}</span>
        <span class="cart-sum">${esc(L(p.summary))}</span>
        <span class="cart-meta">${N.Thumbs.statusChip(p.status)}<span>${esc(p.year || '')}</span></span>
        <ul class="tags">${tags}</ul>
        <span class="cart-ridges" aria-hidden="true"></span></button></li>`;
    if (shelf === 'badge') return `<li><button class="badge" style="--accent:${acc}" data-open="${esc(p.id)}">
        <span class="badge-clip" aria-hidden="true"></span>
        <span class="badge-co">${esc(p.company || '')}</span>
        <span class="badge-body">
          <img class="badge-photo" src="${N.UI.avatarURL(3)}" alt="" width="39" height="60">
          <span class="badge-txt"><span class="badge-role">${esc(L(p.role))}</span><span class="badge-period">${esc(L(p.period))}</span><span class="badge-team">${esc(L(p.team))}</span></span>
        </span>
        <span class="badge-sum">${esc(L(p.summary))}</span>
        <span class="badge-code" aria-hidden="true"></span></button></li>`;
    if (shelf === 'blue') return `<li><button class="blue" style="--accent:${acc}" data-open="${esc(p.id)}">
        <span class="blue-title">${esc(L(p.title))}</span>
        <span class="blue-sum">${esc(L(p.summary))}</span>
        <span class="progress"><span class="progress-bar" style="--v:${N.clamp(p.progress || 0, 0, 100)}"><i></i></span><span class="progress-n">${p.progress || 0}%</span></span>
        <span class="blue-eta">${esc(t('modal.eta'))}: ${esc(L(p.eta))}</span>
        <ul class="tags">${tags}</ul></button></li>`;
    if (shelf === 'tomb') return `<li><button class="tomb" data-open="${esc(p.id)}">
        <span class="tomb-rip">R.I.P.</span>
        <span class="tomb-name">${esc((p.sign || p.id).toUpperCase())}</span>
        <span class="tomb-years">${esc(p.years || p.year || '')}</span>
        <span class="tomb-epi">${esc(L(p.epitaph))}</span>
        <span class="tomb-sum">${esc(L(p.summary))}</span></button></li>`;
    return `<li><button class="box" style="--accent:${acc}" data-open="${esc(p.id)}">
        <span class="box-art"><canvas data-thumb="${esc(p.id)}" data-w="160" data-h="90" aria-hidden="true"></canvas><span class="box-ribbon">${esc(t('modal.coming'))}</span></span>
        <span class="box-title">${esc(L(p.title))}</span>
        <span class="box-sum">${esc(L(p.summary))}</span>
        <span class="box-meta"><span class="rating-mini">E</span>${esc(L(p.genre))}</span></button></li>`;
  }

  function render() {
    const root = document.getElementById('scr-list');
    const p = N.DATA.profile, zh = N.lang === 'zh';
    const stats = (p.stats || []).map(s => `<li class="statbar"><span class="statbar-k">${esc(L(s.key))}</span><span class="statbar-v" style="--v:${N.clamp(s.value, 0, 100)}"><i></i></span><span class="statbar-n">${s.value}</span></li>`).join('');
    const inv = (p.skills || []).map(s => `<li class="slot"><img src="${N.UI.itemIcon(s.icon)}" alt="" width="36" height="36"><span class="slot-name">${esc(L(s.name))}</span><span class="slot-lv" aria-label="level ${s.level} of 5">${'■'.repeat(s.level)}<span>${'■'.repeat(5 - s.level)}</span></span></li>`).join('');
    const quest = (p.timeline || []).map(q => `<li><span class="q-year">${esc(L(q.year))}</span><span class="q-body"><b>${esc(L(q.title))}</b><span>${esc(L(q.text))}</span></span></li>`).join('');
    const bio = [].concat(L(p.bio) || []).map(par => `<p>${N.md(par).replace(/^<p>|<\/p>$/g, '')}</p>`).join('');
    const stages = STAGES.map(s => {
      const ps = N.projectsOf(s.type);
      if (!ps.length || (s.secret && !N.Store.data.minus)) return '';
      return `<section class="doc-sec lv lv--${s.shelf}" id="sec-${s.type}" aria-labelledby="h-${s.type}">
        <header class="stage-head"><span class="stage-no">WORLD ${s.world}</span><h2 id="h-${s.type}">${esc(L(s.name))}</h2><p>${esc(L(s.sub))}</p></header>
        <ul class="shelf shelf--${s.shelf}">${ps.map(pp => card(pp, s.shelf)).join('')}</ul></section>`;
    }).join('');
    const nav = [['sec-about', t('list.about')], ...STAGES.filter(s => N.projectsOf(s.type).length && (!s.secret || N.Store.data.minus)).map(s => ['sec-' + s.type, L(s.nav || s.name)]), ['sec-contact', zh ? '联系' : 'Contact']];

    root.innerHTML = `
      <nav class="doc-nav" aria-label="Sections">
        <a class="doc-logo" href="#top" data-top>${esc((p.name || 'EDDIE').toUpperCase())}<span>.EXE</span></a>
        <ul class="doc-links">${nav.map(([id, l]) => `<li><a href="#${id}" data-jump="${id}">${esc(l)}</a></li>`).join('')}</ul>
        <div class="doc-tools">
          <button class="btn btn--small" data-lang>${ico('lang')}<span>${esc(t('hud.lang'))}</span></button>
          <button class="btn btn--primary btn--small" data-play>${ico('play')}<span>${esc(t('list.play'))}</span></button>
        </div>
      </nav>
      <main class="doc" id="top" tabindex="-1">
        <header class="hero">
          <div class="hero-av" aria-hidden="true"><img src="${N.UI.avatarURL(8)}" alt="" width="104" height="160"><span class="hero-shadow"></span></div>
          <div class="hero-txt">
            <p class="hero-p1">PLAYER 1</p>
            <h1 class="hero-name">${esc((p.name || 'EDDIE').toUpperCase())}</h1>
            <p class="hero-role">${esc(L(p.role))}</p>
            <p class="hero-tag">${esc(L(p.tagline))}</p>
            <p class="status-line"><i class="led ${p.available ? 'led--on' : ''}"></i>${esc(L(p.status))}</p>
            <div class="hero-cta">
              <button class="btn btn--primary" data-play>${ico('play')}<span>${esc(t('list.play'))}</span></button>
              <a class="btn" href="mailto:${esc(p.email)}">${ico('mail')}<span>${esc(t('list.send'))}</span></a>
            </div>
          </div>
          <canvas class="hero-city" id="heroCity" aria-hidden="true"></canvas>
        </header>

        <section class="doc-sec about" id="sec-about" aria-labelledby="h-about">
          <header class="stage-head"><span class="stage-no">WORLD 1-1</span><h2 id="h-about">${esc(t('list.about'))}</h2></header>
          <div class="about-grid">
            <div class="md about-bio">${bio}<p class="about-loc">${esc(L(p.location))}</p></div>
            <div><h3>${esc(t('list.stats'))}</h3><ul class="stats">${stats}</ul></div>
          </div>
          <h3>${esc(t('list.inventory'))}</h3><ul class="inv">${inv}</ul>
        </section>

        ${stages}

        <section class="doc-sec" id="sec-quest" aria-labelledby="h-quest">
          <header class="stage-head"><span class="stage-no">LOG</span><h2 id="h-quest">${esc(t('list.quest'))}</h2></header>
          <ol class="quest">${quest}</ol>
        </section>

        <section class="doc-sec" id="sec-trophies" aria-labelledby="h-tro">
          <header class="stage-head"><span class="stage-no">${N.Ach.count()}/${N.Ach.total()}</span><h2 id="h-tro">${esc(t('list.trophies'))}</h2></header>
          ${N.UI.trophiesHTML()}
        </section>

        <section class="doc-sec contact" id="sec-contact" aria-labelledby="h-contact">
          <div class="continue"><h2 id="h-contact">${esc(t('list.contact'))}</h2><span class="continue-n" aria-hidden="true">9</span></div>
          <p class="contact-sub">${esc(t('list.contactSub'))}</p>
          <div class="mail-addr mail-addr--big"><code>${esc(p.email)}</code><button class="btn btn--small" data-copy>${ico('copy')}<span>${esc(t('list.copy'))}</span></button></div>
          <div class="sheet-links">${N.UI.linksHTML(p.links)}</div>
        </section>
        <footer class="doc-foot"><p>${esc(t('list.thanks'))}</p><button class="linkish" data-top>${esc(t('list.top'))}</button></footer>
      </main>`;
    N.Thumbs.drawThumbs(root);
    heroCity(root.querySelector('#heroCity'));
    countdown(root);
  }

  // a static strip of skyline where every project is a lit sign on a rooftop
  function heroCity(cv) {
    if (!cv) return;
    const P = N.Pixel, C = P.PAL, A = N.CityArt;
    const ps = N.mainProjects(), H = 96;
    const W = Math.max(480, ps.length * 50);
    cv.width = W; cv.height = H; cv.style.aspectRatio = `${W} / ${H}`;
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
    const far = A.skyline('hero-far', W, 70, { minW: 10, maxW: 26, minH: 20, maxH: 64, gap: 3, color: '#1a0c3f', color2: '#1f1048', win: '#3a2470', win2: '#4a2a80', win3: '#5a3a90', lit: 0.2, wx: 3, wy: 4, ww: 1, wh: 1 });
    x.drawImage(far.canvas, 0, H - 70);
    const rnd = N.seeded('hero-city');
    const slot = W / ps.length;
    ps.forEach((p, i) => {
      const [main, dark] = P.NEONS[p.color] || P.NEONS.magenta;
      const label = (p.sign || p.id).toUpperCase().replace(/\s+/g, '').slice(0, 10);
      const bw = Math.min(slot - 4, Math.max(30, P.measure(label, { font: 3 }) + 8)), bh = 30 + ((rnd() * 30) | 0), bx = Math.round(i * slot + (slot - bw) / 2), by = H - bh;
      x.fillStyle = P.mix('#24124f', dark, 0.25); x.fillRect(bx, by, bw, bh);
      x.fillStyle = P.mix('#24124f', '#ffffff', 0.1); x.fillRect(bx, by, bw, 1);
      for (let wy = by + 10; wy < H - 3; wy += 5) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) if (rnd() < 0.3) { x.fillStyle = rnd() < 0.8 ? C.warm : C.cool; x.fillRect(wx, wy, 2, 2); }
      const sg = A.neonBox(label, p.color, { font: 3, padIn: 1 });
      x.drawImage(sg.on, Math.round(bx + bw / 2 - sg.w / 2 - sg.pad), by - sg.h - 2 - sg.pad + 1);
      x.fillStyle = '#3d3366'; x.fillRect(bx + 3, by - 3, 1, 3); x.fillRect(bx + bw - 4, by - 3, 1, 3);
    });
    x.fillStyle = '#120936'; x.fillRect(0, H - 2, W, 2);
  }

  let cdTimer = 0, cdObs = null;
  function countdown(root) {
    const n = root.querySelector('.continue-n'); if (!n) return;
    clearInterval(cdTimer); if (cdObs) cdObs.disconnect();
    cdObs = new IntersectionObserver((ents) => {
      ents.forEach(en => {
        clearInterval(cdTimer);
        if (!en.isIntersecting) return;
        let v = 9; n.textContent = v; n.classList.remove('is-over');
        cdTimer = setInterval(() => {
          v--;
          if (v < 0) { clearInterval(cdTimer); n.textContent = N.lang === 'zh' ? '还没结束' : 'NOT OVER'; n.classList.add('is-over'); return; }
          n.textContent = v; if (N.Audio.ready) N.Audio.sfx('tick');
        }, 1000);
      });
    }, { threshold: 0.6 });
    cdObs.observe(n);
  }

  function wire() {
    const root = document.getElementById('scr-list');
    root.addEventListener('click', async (e) => {
      const o = e.target.closest('[data-open]'); if (o) { N.Audio.init(); N.UI.openProject(o.dataset.open); return; }
      if (e.target.closest('[data-play]')) { N.Audio.init(); N.App.go('world'); return; }
      if (e.target.closest('[data-lang]')) { N.setLang(N.lang === 'zh' ? 'en' : 'zh'); return; }
      const j = e.target.closest('[data-jump]');
      if (j) { e.preventDefault(); const s = document.getElementById(j.dataset.jump); if (s) s.scrollIntoView({ behavior: N.reducedMotion ? 'auto' : 'smooth', block: 'start' }); return; }
      if (e.target.closest('[data-top]')) { e.preventDefault(); root.scrollTo({ top: 0, behavior: N.reducedMotion ? 'auto' : 'smooth' }); return; }
      if (e.target.closest('[data-copy]')) { const ok = await N.copy(N.DATA.profile.email); N.UI.toast({ title: ok ? t('list.copied') : N.DATA.profile.email }); N.Audio.sfx('coin'); }
    });
    N.on('lang', () => { if (N.App.screen === 'list') render(); });
    N.on('ach', () => { if (N.App.screen === 'list') { const tro = root.querySelector('#sec-trophies'); if (tro) { const fresh = document.createElement('div'); fresh.innerHTML = N.UI.trophiesHTML(); tro.querySelector('.trophies').replaceWith(fresh.firstElementChild); tro.querySelector('.stage-no').textContent = `${N.Ach.count()}/${N.Ach.total()}`; } } });
  }

  N.List = { render, wire };
})();
