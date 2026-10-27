/* NEON-8 · achievements */
(function () {
  const N = window.NEON;
  const D = N.Store.data;

  const LIST = [
    { id: 'start', name: { en: 'Hello world', zh: '你好，世界' }, desc: { en: 'Power on EDDIE-OS.', zh: '启动 EDDIE-OS。' } },
    { id: 'steps', name: { en: 'First steps', zh: '第一步' }, desc: { en: 'Take a walk around the city.', zh: '在城里走一走。' } },
    { id: 'view3', name: { en: 'Window shopper', zh: '橱窗购物者' }, desc: { en: 'Look inside 3 projects.', zh: '查看 3 个作品。' } },
    { id: 'viewall', name: { en: 'Completionist', zh: '全收集' }, desc: { en: 'Look inside every project.', zh: '查看全部作品。' } },
    { id: 'intern', name: { en: 'Corporate ladder', zh: '职场阶梯' }, desc: { en: 'Visit every internship tower.', zh: '参观所有实习大楼。' } },
    { id: 'future', name: { en: 'Time traveler', zh: '时间旅行者' }, desc: { en: 'Peek at every upcoming project.', zh: '偷看所有即将推出的项目。' } },
    { id: 'coins10', name: { en: 'Pocket change', zh: '零花钱' }, desc: { en: 'Collect 10 coins.', zh: '收集 10 枚金币。' } },
    { id: 'coins50', name: { en: 'Coin hoarder', zh: '金币大亨' }, desc: { en: 'Collect 50 coins.', zh: '收集 50 枚金币。' } },
    { id: 'cat1', name: { en: 'Cat person', zh: '猫奴' }, desc: { en: 'Pet a cat.', zh: '撸一只猫。' } },
    { id: 'cat5', name: { en: 'Cat whisperer', zh: '猫语者' }, desc: { en: 'Find all 5 cats. One lives somewhere strange.', zh: '找到全部 5 只猫。有一只住在很奇怪的地方。' } },
    { id: 'arcade1', name: { en: 'Insert coin', zh: '投币' }, desc: { en: 'Play an arcade game.', zh: '玩一局街机。' } },
    { id: 'arcadeAll', name: { en: 'Arcade rat', zh: '街机达人' }, desc: { en: 'Play every cabinet.', zh: '玩遍所有机台。' } },
    { id: 'hiscore', name: { en: 'Beat the dev', zh: '打败开发者' }, desc: { en: "Beat EDD's score on any cabinet.", zh: '在任意机台超过 EDD 的分数。' } },
    { id: 'terminal', name: { en: 'Hacker voice', zh: '黑客上线' }, desc: { en: 'Open the terminal.', zh: '打开终端。' } },
    { id: 'sudo', name: { en: 'Root access', zh: '最高权限' }, desc: { en: 'Run sudo collab in the terminal.', zh: '在终端运行 sudo collab。' }, hidden: true },
    { id: 'konami', name: { en: '↑↑↓↓←→←→BA', zh: '↑↑↓↓←→←→BA' }, desc: { en: 'Enter the code.', zh: '输入那串秘籍。' }, hidden: true },
    { id: 'minus', name: { en: 'Minus world', zh: '负一世界' }, desc: { en: 'Find the world beyond the wall.', zh: '找到墙外的世界。' }, hidden: true },
    { id: 'mushroom', name: { en: 'Super size', zh: '超级变大' }, desc: { en: 'Find what hides inside a ? block.', zh: '看看问号砖里藏着什么。' }, hidden: true },
    { id: 'nightowl', name: { en: 'Night owl', zh: '夜猫子' }, desc: { en: 'Visit between midnight and 5 AM.', zh: '在凌晨 0 点到 5 点之间来访。' }, hidden: true },
    { id: 'dj', name: { en: 'DJ', zh: 'DJ' }, desc: { en: 'Change the radio station.', zh: '切换电台。' } },
    { id: 'artist', name: { en: 'Street artist', zh: '街头艺术家' }, desc: { en: 'Tag the graffiti wall.', zh: '在涂鸦墙上留下作品。' } },
    { id: 'aboard', name: { en: 'All aboard', zh: '列车出发' }, desc: { en: 'Ride the train to the credits.', zh: '坐上列车，看完片尾字幕。' } },
    { id: 'travel', name: { en: 'Commuter', zh: '通勤族' }, desc: { en: 'Fast travel with the map.', zh: '用地图快速传送。' } },
    { id: 'social', name: { en: 'Social butterfly', zh: '社交达人' }, desc: { en: 'Talk to the locals 7 times.', zh: '和居民聊 7 次天。' } },
    { id: 'bunny', name: { en: 'Bunny hop', zh: '兔子跳' }, desc: { en: 'Jump 25 times.', zh: '跳 25 次。' } },
    { id: 'poke', name: { en: 'Stop poking me', zh: '别戳我了' }, desc: { en: 'Poke BYTE 5 times.', zh: '戳 BYTE 5 次。' }, hidden: true },
    { id: 'moon', name: { en: 'Moonstruck', zh: '月亮使者' }, desc: { en: 'Make the moon wink 3 times.', zh: '让月亮眨 3 次眼。' }, hidden: true },
    { id: 'glitch', name: { en: 'Stop that', zh: '别点了' }, desc: { en: 'Click the title logo 10 times.', zh: '点击标题 10 次。' }, hidden: true },
    { id: 'console', name: { en: 'Devtools detective', zh: '控制台侦探' }, desc: { en: 'Find the secret in the browser console.', zh: '在浏览器控制台里找到秘密。' }, hidden: true },
    { id: 'words', name: { en: 'Magic words', zh: '咒语' }, desc: { en: 'Type a secret word while walking.', zh: '走路时打出一个秘密单词。' }, hidden: true },
    { id: 'quick', name: { en: 'Speed reader', zh: '速读者' }, desc: { en: 'Open the quick view.', zh: '打开快速浏览。' } },
    { id: 'mail', name: { en: 'You have mail', zh: '你有新邮件' }, desc: { en: 'Open the mailbox.', zh: '打开信箱。' } },
    { id: 'vend', name: { en: 'Thirsty', zh: '口渴了' }, desc: { en: 'Buy a drink from the vending machine.', zh: '在自动贩卖机买一瓶饮料。' } },
    { id: 'delivery1', name: { en: 'Hot and fresh', zh: '热乎的' }, desc: { en: 'Deliver your first bowl of noodles.', zh: '送出第一碗面。' } },
    { id: 'courier', name: { en: 'Courier of the month', zh: '月度最佳骑手' }, desc: { en: 'Deliver 5 orders for Neon Eats.', zh: '为霓虹外卖送出 5 单。' } },
    { id: 'electrician', name: { en: 'Electrician', zh: '电工' }, desc: { en: 'Relight every letter of the name sign.', zh: '把名字招牌的每个字母都重新点亮。' } },
    { id: 'hexpert', name: { en: 'Hexpert', zh: '色感大师' }, desc: { en: 'Match a color within ΔE 3 in Hex Appeal.', zh: '在 Hex Appeal 里把色差控制在 3 以内。' } },
    { id: 'deployed', name: { en: 'Shipped it', zh: '成功上线' }, desc: { en: 'Finish a song in Commit Hero.', zh: '在 Commit Hero 里打完一首歌。' } },
    { id: 'fullcombo', name: { en: 'Zero conflicts', zh: '零冲突' }, desc: { en: 'Finish a Commit Hero song without a single miss.', zh: '在 Commit Hero 里零失误打完一首歌。' }, hidden: true },
    { id: 'gacha1', name: { en: 'Sticker collector', zh: '贴纸收藏家' }, desc: { en: 'Spin the capsule machine.', zh: '扭一次扭蛋机。' } },
    { id: 'gachaAll', name: { en: 'Complete set', zh: '全图鉴' }, desc: { en: 'Fill the whole sticker book.', zh: '集齐整本贴纸图鉴。' } },
    { id: 'liftoff', name: { en: 'Liftoff', zh: '点火升空' }, desc: { en: 'Launch a rocket from the Launch Site.', zh: '在发射场发射一枚火箭。' } },
    { id: 'fireworks', name: { en: 'Fireworks show', zh: '烟花秀' }, desc: { en: 'Launch 10 rockets.', zh: '发射 10 枚火箭。' } },
    { id: 'rud', name: { en: 'Rapid unscheduled disassembly', zh: '计划外快速解体' }, desc: { en: 'Watch a rocket blow up on the pad.', zh: '看着火箭在发射台上炸掉。' }, hidden: true },
    { id: 'news', name: { en: 'Read all about it', zh: '号外号外' }, desc: { en: 'Read the NEON-8 Times.', zh: '读一份霓虹八号日报。' } }
  ];

  // drop trophies that depend on a project type the portfolio doesn't have
  const has = (pred) => N.DATA.projects.some(pred);
  const NEEDS = { intern: () => has(p => p.type === 'intern'), future: () => has(p => p.type.startsWith('soon')), view3: () => N.mainProjects().length >= 3, viewall: () => N.mainProjects().length > 0 };
  for (let i = LIST.length - 1; i >= 0; i--) if (NEEDS[LIST[i].id] && !NEEDS[LIST[i].id]()) LIST.splice(i, 1);
  const byId = {};
  LIST.forEach(a => { byId[a.id] = a; });

  function unlock(id) {
    if (!byId[id] || D.ach[id]) return false;
    D.ach[id] = Date.now();
    N.Store.save();
    N.Audio.sfx('ach');
    N.emit('ach', byId[id]);
    if (N.UI) N.UI.toast({ kind: 'ach', title: N.t('toast.ach'), text: N.L(byId[id].name) });
    return true;
  }

  function checkViewed() {
    const v = D.viewed, all = N.mainProjects();
    const n = all.filter(p => v[p.id]).length;
    if (n >= 3) unlock('view3');
    if (n >= all.length) unlock('viewall');
    const interns = all.filter(p => p.type === 'intern');
    if (interns.length && interns.every(p => v[p.id])) unlock('intern');
    const soon = all.filter(p => p.type.startsWith('soon'));
    if (soon.length && soon.every(p => v[p.id])) unlock('future');
  }

  N.Ach = {
    list: LIST,
    get: (id) => byId[id],
    has: (id) => !!D.ach[id],
    unlock,
    count: () => LIST.filter(a => D.ach[a.id]).length,
    total: () => LIST.length,
    bump(counter, by = 1, threshold = 0, achId = null) {
      const v = N.Store.bump(counter, by);
      if (threshold && achId && v >= threshold) unlock(achId);
      return v;
    },
    viewed(id) {
      if (!D.viewed[id]) { D.viewed[id] = Date.now(); N.Store.save(); }
      checkViewed();
      N.emit('viewed', id);
    }
  };
})();
