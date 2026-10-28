/* NEON-8 · core: language, storage, events, helpers */
(function () {
  const N = (window.NEON = window.NEON || {});

  /* ---------------- events ---------------- */
  const handlers = {};
  N.on = (evt, fn) => { (handlers[evt] = handlers[evt] || []).push(fn); return fn; };
  N.off = (evt, fn) => { handlers[evt] = (handlers[evt] || []).filter(f => f !== fn); };
  N.emit = (evt, data) => { (handlers[evt] || []).slice().forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); };

  /* ---------------- storage ---------------- */
  const KEY = 'neon8.save.v1';
  const defaults = () => ({
    settings: { lang: null, music: true, sfx: true, crt: true, rain: true, volume: 0.6 },
    ach: {},
    viewed: {},
    coins: 0,
    coinsTotal: 0,
    cats: {},
    scores: {},
    played: {},
    paint: null,
    visits: 0,
    firstVisit: Date.now(),
    minus: false,
    counters: {}
  });
  let data;
  try {
    data = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}'));
    data.settings = Object.assign(defaults().settings, data.settings || {});
  } catch (e) { data = defaults(); }
  let saveTimer = 0, resetting = false;
  N.Store = {
    data,
    save() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { if (resetting) return; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode */ } }, 120);
    },
    reset() { clearTimeout(saveTimer); resetting = true; try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); },
    bump(name, by = 1) { data.counters[name] = (data.counters[name] || 0) + by; N.Store.save(); return data.counters[name]; }
  };
  data.visits++;
  N.Store.save();
  // another tab saved: fold its progress into ours instead of overwriting it on our next save
  window.addEventListener('storage', (ev) => {
    if (ev.key !== KEY || !ev.newValue || resetting) return;
    let o; try { o = JSON.parse(ev.newValue); } catch (e) { return; }
    ['ach', 'viewed', 'cats', 'played', 'counters'].forEach(k => { data[k] = Object.assign({}, o[k] || {}, data[k] || {}); });
    Object.keys(o.counters || {}).forEach(k => { data.counters[k] = Math.max(data.counters[k] || 0, o.counters[k]); });
    data.coins = Math.max(data.coins, o.coins || 0); data.coinsTotal = Math.max(data.coinsTotal, o.coinsTotal || 0);
    data.minus = data.minus || !!o.minus;
    if (o.paint && !data.paint) data.paint = o.paint;
    Object.keys(o.scores || {}).forEach(g => {
      const all = (data.scores[g] || []).concat(o.scores[g]);
      const seen = new Set();
      data.scores[g] = all.sort((a, b) => b.s - a.s).filter(r => { const k = r.n + r.s; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5);
    });
    N.emit('coins', data.coins); N.emit('cats'); N.emit('ach');
  });

  /* ---------------- language ---------------- */
  const browserZh = (navigator.language || '').toLowerCase().startsWith('zh');
  N.lang = data.settings.lang || (browserZh ? 'zh' : 'en');
  N.setLang = (l) => {
    N.lang = l; data.settings.lang = l; N.Store.save();
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
    N.emit('lang', l);
  };
  document.documentElement.lang = N.lang === 'zh' ? 'zh-CN' : 'en';

  // resolve a bilingual value: 'text' | {en, zh} | [..]
  N.L = (v) => {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    if (Array.isArray(v)) return v;
    return v[N.lang] != null ? v[N.lang] : (v.en != null ? v.en : (v.zh != null ? v.zh : ''));
  };

  // UI strings
  N.STR = {
    en: {
      'power.title': 'EDDIE-OS',
      'power.press': 'Press any key or click to power on',
      'power.hurry': 'In a hurry? Open the quick view',
      'power.sound': 'Best with sound on',
      'title.start': 'Start game',
      'title.continue': 'Continue',
      'title.quick': 'Quick view',
      'title.rec': 'Recommended!',
      'title.nofun': "(If you don't like fun...)",
      'title.settings': 'Settings',
      'title.help': 'select',
      'title.confirm': 'confirm',
      'title.credit': 'CREDIT',
      'hud.map': 'Map',
      'hud.list': 'Quick view',
      'hud.trophies': 'Trophies',
      'hud.sound': 'Sound',
      'hud.crt': 'CRT',
      'hud.lang': '中文',
      'hud.help': 'Help',
      'hud.terminal': 'Terminal',
      'hud.menu': 'Menu',
      'hud.coins': 'Coins',
      'hud.cats': 'Cats found',
      'prompt.enter': 'Press F to enter',
      'prompt.talk': 'Press F to talk',
      'prompt.use': 'Press F to use',
      'prompt.read': 'Press F to read',
      'prompt.pet': 'Press F to pet the cat',
      'prompt.board': 'Press F to board the train',
      'prompt.play': 'Press F to play',
      'prompt.paint': 'Press F to paint',
      'prompt.tune': 'Press F to change the station',
      'prompt.fix': 'Press F to fix the sign',
      'prompt.order': 'Press F to take an order',
      'prompt.launch': 'Press F to launch',
      'prompt.deliver': 'Press F to deliver the noodles to',
      'prompt.spin': 'Press F to spin',
      'fuse.title': 'Fuse box',
      'fuse.letters': 'Letters',
      'fuse.board': 'Wiring board',
      'fuse.status': 'Letter {i} of {n}. Rotate the wires so power reaches all {b} bulbs.',
      'fuse.help': 'Click a tile to turn it, right-click to turn it back. Keyboard: arrows move, Space turns.',
      'fuse.solved': 'That letter is back on. On to the next one.',
      'fuse.done': 'The whole sign is lit again. It hangs on the front of the house at the start of the street.',
      'fuse.shuffle': 'Shuffle',
      'fuse.next': 'Next letter',
      'fuse.see': 'Go home and look',
      'fuse.moves': 'Moves',
      'gacha.sub': 'Three coins a spin. Every sticker is something from this city or this portfolio.',
      'gacha.spin': 'Spin',
      'gacha.broke': 'You need 3 coins. Jump around the city, or deliver some noodles.',
      'gacha.new': 'New sticker for your book.',
      'gacha.dupe': 'Duplicate. You get 1 coin back.',
      'gacha.book': 'Sticker book',
      'gacha.common': 'Common',
      'gacha.rare': 'Rare',
      'gacha.legend': 'Legendary',
      'hud.job': 'Delivery',
      'prompt.tap': 'Tap B',
      'modal.close': 'Close',
      'modal.prev': 'Previous',
      'modal.next': 'Next',
      'modal.role': 'Role',
      'modal.stack': 'Stack',
      'modal.year': 'Year',
      'modal.period': 'Period',
      'modal.team': 'Team',
      'modal.where': 'Location',
      'modal.eta': 'ETA',
      'modal.progress': 'Progress',
      'modal.genre': 'Genre',
      'modal.platform': 'Platform',
      'modal.results': 'Loot',
      'modal.gallery': 'Gallery',
      'modal.demo': 'Demo',
      'modal.links': 'Links',
      'modal.addShot': 'Add a screenshot in data.js',
      'modal.confidential': 'Personnel file',
      'modal.blueprint': 'Blueprint',
      'modal.coming': 'Coming soon',
      'modal.rated': 'Rated E for Eddie',
      'cat.web': 'Website',
      'cat.app': 'App',
      'cat.experiment': 'Experiment',
      'cat.graveyard': 'Graveyard',
      'modal.years': 'Lived',
      'modal.cause': 'Cause of death',
      'modal.epitaph': 'Epitaph',
      'modal.zoom': 'Enlarge image',
      'modal.missionlog': 'Mission log',
      'cat.intern': 'Internship',
      'cat.soon-web': 'Upcoming site',
      'cat.soon-game': 'Upcoming game',
      'district.enter': 'Now entering',
      'map.title': 'Neon Line 8',
      'map.sub': 'Pick a station to travel there.',
      'map.here': 'You are here',
      'map.secret': 'Station -1',
      'toast.ach': 'Achievement unlocked',
      'toast.coin': 'coin',
      'trophies.title': 'Trophy room',
      'trophies.sub': 'unlocked',
      'trophies.hidden': 'Hidden achievement',
      'help.title': 'How to play',
      'help.move': 'Walk',
      'help.run': 'Run',
      'help.jump': 'Jump (press twice to double jump)',
      'help.enter': 'Enter doors, talk, use things',
      'help.map': 'Map and fast travel',
      'help.term': 'Terminal',
      'help.esc': 'Close windows',
      'help.click': 'Or just click a building to walk there.',
      'help.secrets': 'The city has secrets. Some are hidden in plain sight, some are typed, some are found by walking where you should not.',
      'settings.title': 'Settings',
      'settings.music': 'Music',
      'settings.sfx': 'Sound effects',
      'settings.volume': 'Volume',
      'settings.crt': 'CRT filter',
      'settings.rain': 'Rain',
      'settings.lang': 'Language',
      'settings.reset': 'Erase save data',
      'settings.resetConfirm': 'Erase coins, trophies and high scores?',
      'on': 'On',
      'off': 'Off',
      'list.play': 'Enter the city',
      'list.about': 'Player 1',
      'list.stats': 'Stats',
      'list.inventory': 'Inventory',
      'list.quest': 'Quest log',
      'list.contact': 'Continue?',
      'list.contactSub': 'Insert coin to start a conversation.',
      'list.copy': 'Copy email',
      'list.copied': 'Email copied',
      'list.send': 'Send an email',
      'list.trophies': 'Trophies',
      'list.thanks': 'Thanks for playing',
      'list.worlds': 'Select stage',
      'list.view': 'Open',
      'list.top': 'Back to top',
      'contact.title': 'Mailbox',
      'contact.sub': 'Drop a message in the box. It goes straight to my inbox.',
      'about.title': 'Character sheet',
      'vending.title': 'Vending machine',
      'vending.paid': 'You paid 1 coin.',
      'vending.free': 'Out of coins? This one is on the house.',
      'vending.fact': 'Fun fact',
      'radio.now': 'Now playing',
      'radio.off': 'Radio off',
      'arcade.title': 'Pixel Palace',
      'arcade.insert': 'Insert coin',
      'arcade.free': 'Free play',
      'arcade.select': 'Choose a cabinet',
      'arcade.hiscore': 'High score',
      'arcade.play': 'Play',
      'arcade.exit': 'Leave arcade',
      'arcade.controls': 'Controls',
      'arcade.broke': 'No coins left. Free play is on, don\'t tell anyone.',
      'arcade.newHigh': 'New high score! Enter your initials.',
      'arcade.gameover': 'Game over',
      'arcade.again': 'Play again',
      'arcade.back': 'Back to cabinets',
      'paint.title': 'Graffiti wall',
      'paint.sub': 'Paint a 16×16 tag. It stays on the wall in this browser.',
      'paint.save': 'Spray it on the wall',
      'paint.clear': 'Clear',
      'paint.erase': 'Eraser',
      'paint.download': 'Download PNG',
      'paint.saved': 'Your tag is on the wall.',
      'credits.board': 'All aboard',
      'credits.replay': 'Ride again',
      'credits.back': 'Back to the city',
      'credits.mail': 'Email me',
      'byte.name': 'BYTE',
      'minus.title': 'WORLD -1',
      'minus.sub': 'You found the place where unfinished projects go.',
      'minus.exit': 'Press F at the pipe to go back',
      'term.title': 'EDDIE-OS terminal',
      'term.hint': 'Type help and press Enter.',
      'skip': 'Skip'
    },
    zh: {
      'power.title': 'EDDIE-OS',
      'power.press': '按任意键或点击屏幕开机',
      'power.hurry': '赶时间？直接看作品列表',
      'power.sound': '建议打开声音',
      'title.start': '开始游戏',
      'title.continue': '继续游戏',
      'title.quick': '快速浏览',
      'title.rec': '推荐！',
      'title.nofun': '（如果你不喜欢好玩的……）',
      'title.settings': '设置',
      'title.help': '选择',
      'title.confirm': '确认',
      'title.credit': 'CREDIT',
      'hud.map': '地图',
      'hud.list': '快速浏览',
      'hud.trophies': '成就',
      'hud.sound': '声音',
      'hud.crt': 'CRT',
      'hud.lang': 'EN',
      'hud.help': '帮助',
      'hud.terminal': '终端',
      'hud.menu': '菜单',
      'hud.coins': '金币',
      'hud.cats': '找到的猫',
      'prompt.enter': '按 F 进入',
      'prompt.talk': '按 F 对话',
      'prompt.use': '按 F 使用',
      'prompt.read': '按 F 查看',
      'prompt.pet': '按 F 撸猫',
      'prompt.board': '按 F 上车',
      'prompt.play': '按 F 开玩',
      'prompt.paint': '按 F 涂鸦',
      'prompt.tune': '按 F 换台',
      'prompt.fix': '按 F 修招牌',
      'prompt.order': '按 F 接单',
      'prompt.launch': '按 F 发射',
      'prompt.deliver': '按 F 把面送给',
      'prompt.spin': '按 F 扭蛋',
      'fuse.title': '配电箱',
      'fuse.letters': '字母',
      'fuse.board': '线路板',
      'fuse.status': '第 {i}/{n} 个字母：旋转电线，让电流点亮全部 {b} 个灯泡。',
      'fuse.help': '点击方块旋转，右键转回去。键盘：方向键移动，空格旋转。',
      'fuse.solved': '这个字母亮了！继续下一个。',
      'fuse.done': '整块招牌都亮了！它挂在街道起点那栋房子的正面。',
      'fuse.shuffle': '重新打乱',
      'fuse.next': '下一个字母',
      'fuse.see': '回家看看',
      'fuse.moves': '步数',
      'gacha.sub': '三枚金币扭一次。每张贴纸都来自这座城市或这份作品集。',
      'gacha.spin': '扭一个',
      'gacha.broke': '需要 3 枚金币。去城里跳一跳，或者送几单外卖。',
      'gacha.new': '新贴纸，已收进图鉴。',
      'gacha.dupe': '重复了，退你 1 枚金币。',
      'gacha.book': '贴纸图鉴',
      'gacha.common': '普通',
      'gacha.rare': '稀有',
      'gacha.legend': '传说',
      'hud.job': '外卖',
      'prompt.tap': '点 B',
      'modal.close': '关闭',
      'modal.prev': '上一个',
      'modal.next': '下一个',
      'modal.role': '角色',
      'modal.stack': '技术栈',
      'modal.year': '年份',
      'modal.period': '时间',
      'modal.team': '团队',
      'modal.where': '地点',
      'modal.eta': '预计上线',
      'modal.progress': '进度',
      'modal.genre': '类型',
      'modal.platform': '平台',
      'modal.results': '战利品',
      'modal.gallery': '截图',
      'modal.demo': '演示视频',
      'modal.links': '链接',
      'modal.addShot': '在 data.js 里加一张截图',
      'modal.confidential': '人事档案',
      'modal.blueprint': '施工图纸',
      'modal.coming': '即将推出',
      'modal.rated': 'E 级：Eddie 出品',
      'cat.web': '网站',
      'cat.app': '应用',
      'cat.experiment': '实验',
      'cat.graveyard': '墓地',
      'modal.years': '生卒',
      'modal.cause': '死因',
      'modal.epitaph': '墓志铭',
      'modal.zoom': '放大图片',
      'modal.missionlog': '任务日志',
      'cat.intern': '实习',
      'cat.soon-web': '即将上线',
      'cat.soon-game': '游戏预告',
      'district.enter': '进入',
      'map.title': '霓虹 8 号线',
      'map.sub': '选一个车站，马上过去。',
      'map.here': '你在这里',
      'map.secret': '-1 站',
      'toast.ach': '解锁成就',
      'toast.coin': '金币',
      'trophies.title': '奖杯室',
      'trophies.sub': '已解锁',
      'trophies.hidden': '隐藏成就',
      'help.title': '操作说明',
      'help.move': '行走',
      'help.run': '奔跑',
      'help.jump': '跳跃（连按两次二段跳）',
      'help.enter': '进门、对话、使用物品',
      'help.map': '地图与快速传送',
      'help.term': '终端',
      'help.esc': '关闭窗口',
      'help.click': '也可以直接点击建筑，角色会自己走过去。',
      'help.secrets': '这座城市藏着秘密。有的就在眼前，有的要靠键盘打出来，有的要走到不该去的地方才能找到。',
      'settings.title': '设置',
      'settings.music': '音乐',
      'settings.sfx': '音效',
      'settings.volume': '音量',
      'settings.crt': 'CRT 滤镜',
      'settings.rain': '下雨',
      'settings.lang': '语言',
      'settings.reset': '清除存档',
      'settings.resetConfirm': '确定清除金币、成就和最高分吗？',
      'on': '开',
      'off': '关',
      'list.play': '进入城市',
      'list.about': '玩家 1',
      'list.stats': '属性',
      'list.inventory': '背包',
      'list.quest': '冒险日志',
      'list.contact': '继续游戏？',
      'list.contactSub': '投一枚硬币，开始一段对话。',
      'list.copy': '复制邮箱',
      'list.copied': '邮箱已复制',
      'list.send': '发邮件给我',
      'list.trophies': '成就',
      'list.thanks': '感谢游玩',
      'list.worlds': '选择关卡',
      'list.view': '查看',
      'list.top': '回到顶部',
      'contact.title': '信箱',
      'contact.sub': '把信投进信箱，它会直接送到我的邮箱。',
      'about.title': '角色面板',
      'vending.title': '自动贩卖机',
      'vending.paid': '你投了 1 枚金币。',
      'vending.free': '没钱了？这瓶请你。',
      'vending.fact': '冷知识',
      'radio.now': '正在播放',
      'radio.off': '电台已关闭',
      'arcade.title': '像素游戏厅',
      'arcade.insert': '投币',
      'arcade.free': '免费畅玩',
      'arcade.select': '选一台机器',
      'arcade.hiscore': '最高分',
      'arcade.play': '开始',
      'arcade.exit': '离开游戏厅',
      'arcade.controls': '操作',
      'arcade.broke': '金币用完了。偷偷给你开了免费模式。',
      'arcade.newHigh': '新纪录！输入你的名字缩写。',
      'arcade.gameover': '游戏结束',
      'arcade.again': '再来一局',
      'arcade.back': '回到机台',
      'paint.title': '涂鸦墙',
      'paint.sub': '画一个 16×16 的涂鸦，它会一直留在这面墙上（仅限这台浏览器）。',
      'paint.save': '喷到墙上',
      'paint.clear': '清空',
      'paint.erase': '橡皮',
      'paint.download': '下载 PNG',
      'paint.saved': '你的涂鸦已经上墙。',
      'credits.board': '列车出发',
      'credits.replay': '再坐一次',
      'credits.back': '回到城市',
      'credits.mail': '给我发邮件',
      'byte.name': 'BYTE',
      'minus.title': 'WORLD -1',
      'minus.sub': '你找到了未完成项目的归宿。',
      'minus.exit': '在水管前按 F 返回',
      'term.title': 'EDDIE-OS 终端',
      'term.hint': '输入 help 然后回车。',
      'skip': '跳过'
    }
  };
  // names shown in the prompt bar / speech bubbles (the in-world canvas labels stay ASCII)
  N.LABELS = {
    HOME: { en: 'Home', zh: '家' }, LAUNCH: { en: 'the rocket', zh: '火箭' }, LOG: { en: 'Mission log', zh: '任务日志' }, NOTE: { en: 'Sticky note', zh: '便签' }, MAIL: { en: 'Mailbox', zh: '信箱' }, HELP: { en: 'Notice board', zh: '告示板' },
    POP: { en: 'Vending machine', zh: '自动贩卖机' }, NEWS: { en: 'NEON-8 Times', zh: '霓虹八号日报' }, CALL: { en: 'Phone booth', zh: '电话亭' },
    ARCADE: { en: 'Pixel Palace', zh: '像素游戏厅' }, RADIO: { en: 'Jukebox', zh: '点唱机' }, PAINT: { en: 'Graffiti wall', zh: '涂鸦墙' },
    TRAIN: { en: 'Neon Express', zh: '霓虹快线' }, FUSE: { en: 'Fuse box', zh: '配电箱' }, GACHA: { en: 'CAPSULE-8', zh: '扭蛋机' }, NOODLE: { en: 'Neon Eats', zh: '霓虹外卖' }, CAT: { en: 'Cat', zh: '猫' }, RIP: { en: 'Tombstone', zh: '墓碑' }, PIPE: { en: 'Warp pipe', zh: '传送水管' },
    GRANNY: { en: 'Neighbor', zh: '邻居奶奶' }, GUARD: { en: 'Security', zh: '保安' }, KID: { en: 'Arcade kid', zh: '游戏厅小孩' },
    VENDOR: { en: 'Noodle bot', zh: '拉面机器人' }, ROBOT: { en: 'Site bot', zh: '施工机器人' }, DEV: { en: 'Indie dev', zh: '独立开发者' }, MASTER: { en: 'Station master', zh: '站长' }
  };
  N.label = (k) => (N.LABELS[k] ? N.L(N.LABELS[k]) : k);
  // the action key is F on a keyboard and the B button on the touch pad; copy is written with F
  N.touch = () => !!(window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  N.actKey = () => N.touch() ? 'B' : 'F';
  N.keyify = (s) => typeof s === 'string' && N.touch() ? s.replace(/\b(Press|PRESS) F\b/g, '$1 B').replace(/按 F/g, '按 B').replace(/\[F\]/g, '[B]') : s;
  N.t = (k) => N.keyify(N.STR[N.lang] && N.STR[N.lang][k] != null ? N.STR[N.lang][k] : (N.STR.en[k] != null ? N.STR.en[k] : k));

  /* ---------------- helpers ---------------- */
  N.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  N.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  N.lerp = (a, b, t) => a + (b - a) * t;
  N.rand = (a, b) => a + Math.random() * (b - a);
  N.pick = (arr) => arr[(Math.random() * arr.length) | 0];
  // deterministic PRNG so the city looks the same every visit
  N.seeded = (seed) => {
    let s = typeof seed === 'string' ? [...seed].reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0), 2166136261) : seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  N.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // tiny markdown: paragraphs, "- " lists, "- [x]" checklists, **bold**
  N.md = (src) => {
    const text = N.L(src) || '';
    const inline = (s) => N.esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/【待填写】|\[TODO\]/g, m => `<mark class="todo">${m}</mark>`);
    return text.split(/\n\s*\n/).map(block => {
      const lines = block.split('\n');
      if (lines.every(l => /^\s*-\s+/.test(l))) {
        return '<ul>' + lines.map(l => {
          const m = l.replace(/^\s*-\s+/, '');
          const chk = m.match(/^\[( |x)\]\s*(.*)$/i);
          if (chk) return `<li class="chk ${chk[1].toLowerCase() === 'x' ? 'done' : ''}"><span class="box" aria-hidden="true">${chk[1].toLowerCase() === 'x' ? '■' : '□'}</span>${inline(chk[2])}</li>`;
          return `<li>${inline(m)}</li>`;
        }).join('') + '</ul>';
      }
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    }).join('');
  };

  N.project = (id) => N.DATA.projects.find(p => p.id === id);
  N.projectsOf = (type) => N.DATA.projects.filter(p => p.type === type);
  // graveyard projects live in WORLD -1: they stay out of counts, stickers and the skyline,
  // and only show up in lists once the player has found the minus world
  N.mainProjects = () => N.DATA.projects.filter(p => p.type !== 'graveyard');
  N.visibleProjects = () => N.DATA.projects.filter(p => p.type !== 'graveyard' || N.Store.data.minus);

  N.COLORS = {
    magenta: '#ff3ea5', cyan: '#29f3ff', yellow: '#ffd93b', lime: '#7dff5a',
    orange: '#ff8a3d', violet: '#b26bff', blue: '#4d7cff', red: '#ff4d6d'
  };
  N.colorOf = (key) => N.COLORS[key] || key || N.COLORS.magenta;

  N.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove(); return ok;
    }
  };
})();
