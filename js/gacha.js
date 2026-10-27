/* NEON-8 · CAPSULE-8: spend coins on stickers made from the city and the portfolio itself */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL, SP = N.Sprites;
  const t = (k) => N.t(k), L = (v) => N.L(v), esc = N.esc;
  const COST = 3;
  const TIERS = { common: { w: 60, col: '#8f72d9', bg: '#1a0d45' }, rare: { w: 36, col: C.cyan, bg: '#0d2a5a' }, legend: { w: 4, col: C.yellow, bg: '#4a3a10' } };

  let pool = null;
  function buildPool() {
    if (pool) return pool;
    const NPCN = { granny: { en: 'Neighbor', zh: '邻居奶奶' }, guard: { en: 'Security', zh: '保安' }, kid: { en: 'Arcade kid', zh: '游戏厅小孩' }, vendor: { en: 'Noodle bot', zh: '拉面机器人' }, robot: { en: 'Site bot', zh: '施工机器人' }, dev: { en: 'Indie dev', zh: '独立开发者' }, master: { en: 'Station master', zh: '站长' } };
    const CATN = { black: { en: 'Mailbox cat', zh: '信箱猫' }, orange: { en: 'Awning cat', zh: '雨棚猫' }, white: { en: 'Vending cat', zh: '贩卖机猫' }, grey: { en: 'Scaffold cat', zh: '脚手架猫' }, pink: { en: 'Minus cat', zh: '负一猫' } };
    pool = [{ id: 'byte', tier: 'common', name: { en: 'BYTE', zh: 'BYTE' }, src: () => SP.byte.happy }];
    for (const k in CATN) pool.push({ id: 'cat-' + k, tier: 'common', name: CATN[k], src: () => SP.cats[k].a });
    for (const k in NPCN) pool.push({ id: 'npc-' + k, tier: 'common', name: NPCN[k], src: () => SP.npc[k].r });
    N.mainProjects().forEach(p => pool.push({ id: 'p-' + p.id, tier: 'rare', name: p.title, src: () => N.Thumbs.thumb(p, 40, 30) }));
    (N.DATA.profile.skills || []).forEach((s, i) => pool.push({ id: 's-' + i, tier: 'rare', name: s.name, src: () => N.UI.itemSprite(s.icon) }));
    pool.push({ id: 'gold-eddie', tier: 'legend', name: { en: 'Golden ' + (N.DATA.profile.name || 'Eddie'), zh: '黄金 ' + (N.DATA.profile.name || 'Eddie') }, src: () => SP.player.gold_idle.r });
    pool.push({ id: 'express', tier: 'legend', name: { en: 'Neon Express', zh: '霓虹快线' }, src: () => N.CityArt.train(1) });
    pool.push({ id: 'sign', tier: 'legend', name: { en: 'The name sign', zh: '名字招牌' }, src: () => P.neonText((N.DATA.profile.name || 'EDDIE').toUpperCase().slice(0, 8), C.magenta, { blur: 3, pad: 3 }) });
    return pool;
  }
  const art = {};
  function sticker(s, owned) {
    const key = s.id + (owned ? '1' : '0');
    if (art[key]) return art[key];
    const S = 48, { c, x } = P.canvas(S, S), tier = TIERS[s.tier];
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, S, S);
    x.fillStyle = owned ? tier.bg : '#0d0726'; x.fillRect(2, 2, S - 4, S - 4);
    if (owned && s.tier === 'legend') { for (let k = 0; k < 12; k++) { x.fillStyle = 'rgba(255,217,59,0.25)'; x.fillRect(2 + ((k * 13) % 42), 2 + ((k * 7) % 42), 2, 2); } }
    let src = s.src ? s.src() : null;
    if (src) {
      const sc = Math.max(1, Math.floor(Math.min(40 / src.width, 40 / src.height)));
      let img = sc > 1 ? N.CityArt.scaleUp(src, sc) : src;
      if (img.width > 42) { const f = 42 / img.width; const r = P.canvas(42, Math.max(1, Math.round(img.height * f))); r.x.drawImage(img, 0, 0, r.c.width, r.c.height); img = r.c; }
      if (!owned) img = P.tint(img, '#2a1a5a');
      x.drawImage(img, ((S - img.width) / 2) | 0, ((S - img.height) / 2) | 0);
    }
    art[key] = c.toDataURL();
    return art[key];
  }
  const owned = () => N.Store.data.stickers || (N.Store.data.stickers = {});

  function roll() {
    const ps = buildPool();
    const total = Object.values(TIERS).reduce((a, b) => a + b.w, 0);
    let r = Math.random() * total, tier = 'common';
    for (const k in TIERS) { if (r < TIERS[k].w) { tier = k; break; } r -= TIERS[k].w; }
    const list = ps.filter(s => s.tier === tier);
    return N.pick(list.length ? list : ps);
  }

  function machineHTML() {
    return `<div class="gacha-machine" aria-hidden="true">
      <div class="gm-dome">${Array.from({ length: 14 }, (_, i) => `<i style="--c:${[C.magenta, C.cyan, C.yellow, C.lime, C.orange, C.vio][i % 6]};--x:${(i * 37) % 80}%;--y:${40 + ((i * 53) % 55)}%"></i>`).join('')}</div>
      <div class="gm-body"><span class="gm-label">CAPSULE-8</span><span class="gm-slot"></span><span class="gm-crank"></span><span class="gm-chute"><b class="gm-cap"></b></span></div>
    </div>`;
  }
  function bookHTML() {
    const ps = buildPool(), own = owned();
    const n = ps.filter(s => own[s.id]).length;
    return `<h3>${esc(t('gacha.book'))} <span class="gacha-count">${n}/${ps.length}</span></h3>
      <ul class="stickers">${ps.map(s => { const o = !!own[s.id]; return `<li class="stk stk--${s.tier} ${o ? 'is-own' : ''}" title="${esc(o ? L(s.name) : '???')}"><img src="${s.img && o ? s.img() : sticker(s, o)}" alt="" width="48" height="48" class="${s.img && o ? 'stk-icon' : ''}"><span>${esc(o ? L(s.name) : '???')}</span>${o && own[s.id] > 1 ? `<b>×${own[s.id]}</b>` : ''}</li>`; }).join('')}</ul>`;
  }

  function open() {
    let busy = false;
    N.UI.openWindow({
      id: 'gacha', cls: 'win--gacha', title: 'CAPSULE-8',
      body: `<div class="gacha">
        <div class="gacha-top">${machineHTML()}
          <div class="gacha-side">
            <p class="gacha-sub">${esc(t('gacha.sub'))}</p>
            <p class="gacha-wallet">${N.UI.ico('coin')}<b class="gacha-coins">${N.Store.data.coins}</b></p>
            <button class="btn btn--primary" data-g="spin">${esc(t('gacha.spin'))} <span>${COST} ◎</span></button>
            <div class="gacha-result" aria-live="polite"></div>
          </div>
        </div>
        <div class="gacha-book">${bookHTML()}</div>
      </div>`,
      onOpen(a) {
        a.win.addEventListener('click', (e) => { if (e.target.closest('[data-g="spin"]')) spin(a); });
      }
    });
    function spin(a) {
      if (busy) return;
      const D = N.Store.data, res = a.win.querySelector('.gacha-result');
      if (D.coins < COST) { N.Audio.sfx('error'); res.innerHTML = `<p class="gacha-broke">${esc(t('gacha.broke'))}</p>`; return; }
      busy = true;
      D.coins -= COST; N.Store.save(); N.emit('coins', D.coins);
      a.win.querySelector('.gacha-coins').textContent = D.coins;
      const m = a.win.querySelector('.gacha-machine');
      m.classList.remove('is-drop'); void m.offsetWidth; m.classList.add('is-spin');
      N.Audio.sfx('coin'); setTimeout(() => N.Audio.sfx('crank'), 150);
      res.innerHTML = '';
      const s = roll(), own = owned(), dupe = !!own[s.id];
      setTimeout(() => { m.classList.remove('is-spin'); m.classList.add('is-drop'); N.Audio.sfx('can'); }, 700);
      setTimeout(() => {
        own[s.id] = (own[s.id] || 0) + 1;
        if (dupe) { D.coins += 1; N.emit('coins', D.coins); a.win.querySelector('.gacha-coins').textContent = D.coins; }
        N.Store.save();
        N.Audio.sfx(s.tier === 'legend' ? 'fanfare' : dupe ? 'blip' : 'pop');
        res.innerHTML = `<div class="stk-reveal stk--${s.tier}"><img src="${s.img ? s.img() : sticker(s, true)}" alt="" width="96" height="96" class="${s.img ? 'stk-icon' : ''}"><div><p class="stk-tier">${esc(t('gacha.' + s.tier))}</p><p class="stk-name">${esc(L(s.name))}</p><p class="stk-note">${esc(dupe ? t('gacha.dupe') : t('gacha.new'))}</p></div></div>`;
        a.win.querySelector('.gacha-book').innerHTML = bookHTML();
        N.Ach.unlock('gacha1');
        if (buildPool().every(x => own[x.id])) N.Ach.unlock('gachaAll');
        busy = false;
      }, 1250);
    }
  }

  N.Gacha = { open, COST };
})();
