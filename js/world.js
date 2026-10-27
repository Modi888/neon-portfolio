/* NEON-8 · the city: layout, physics, rendering, interactions */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL, SP = N.Sprites, A = N.CityArt;
  const VH = 240, GROUND = 194, ROAD_Y = GROUND + 14;
  const L = (v) => N.L(v);

  let canvas, ctx, VW = 400, scale = 4, running = false, raf = 0, acc = 0, last = 0;
  let reflC, reflX, pudC, pudX, pudMask, skyC, groundTile;
  const keys = { left: false, right: false, up: false, run: false, jump: false };
  const pressed = { jump: false, act: false };

  const W = { scene: 'main', t: 0, frame: 0, particles: [], flash: 0, shake: 0, mode: {}, weather: 'rain' };
  let S = null;             // current scene lists
  const scenes = {};
  const cam = { x: 0 };
  const player = { x: 70, y: GROUND, vx: 0, vy: 0, dir: 1, onGround: true, jumps: 0, anim: 0, idle: 0, blinkT: 0, big: 0, god: false, edge: 0, walked: 0 };
  const byte = { x: 50, y: GROUND - 34, t: 0, mood: 'a', moodT: 0 };
  let autoTarget = null, activeTrig = null, activeKey = null, curDistrict = null, hoverClick = null;
  const seenDistricts = {};

  /* ======================= layout ======================= */
  function newScene(name) {
    return { name, width: 0, buildings: [], props: [], npcs: [], walkers: [], cats: [], coins: [], blocks: [], platforms: [], triggers: [], districts: [], clicks: [], deco: [] };
  }

  const NPC_LINES = {
    granny: [
      { en: 'Back in my day, websites had visitor counters, and we liked it.', zh: '我们那个年代，网站都有访客计数器，大家可喜欢了。' },
      { en: 'That Eddie kid is always up late typing. I hear the clacking through the wall.', zh: '那个叫 Eddie 的孩子天天熬夜打字，隔着墙都能听见键盘声。' },
      { en: 'Try walking left from here and keep going. No reason. Just a feeling.', zh: '试试从这儿一直往左走，别停。没什么原因，就是一种感觉。' }
    ],
    guard: [
      { en: "Badge, please. ...Oh, you're visiting Eddie. Go on in.", zh: '请出示工牌。……哦，来找 Eddie 的？请进。' },
      { en: 'Eddie interned in these towers. Each lobby has the full story.', zh: 'Eddie 在这几栋楼里实习过，每个大厅里都有完整的故事。' },
      { en: "No, the elevator doesn't go to the roof. Yes, people ask.", zh: '不，电梯到不了楼顶。是的，经常有人问。' }
    ],
    kid: [
      { en: "My high score in Snake is 420. Bet you can't beat it.", zh: '我贪吃蛇最高 420 分，你肯定打不过我。' },
      { en: 'Psst. The cabinets take coins. Jump around, coins are everywhere.', zh: '嘘——机台要投币。到处跳一跳，金币到处都是。' },
      { en: 'They say if you type up, up, down, down... on a keyboard, something happens.', zh: '听说在键盘上按 上上下下左右左右 B A，会发生点什么。' }
    ],
    vendor: [
      { en: "Ramen? It's 3 AM. Perfect time to ship to production.", zh: '来碗拉面？凌晨三点，最适合上线了。' },
      { en: "Today's special: spaghetti code with a side of callbacks.", zh: '今日特价：意大利面条代码，配一份回调地狱。' },
      { en: 'Extra noodles cost one coin. Just kidding. I only accept compliments.', zh: '加面一枚金币。开玩笑的，我只收夸奖。' }
    ],
    robot: [
      { en: 'PARDON THE DUST. THESE PROJECTS ARE STILL COMPILING.', zh: '施工中，请见谅。这些项目还在编译。' },
      { en: 'ESTIMATED COMPLETION: SOON. DEFINITION OF SOON: UNKNOWN.', zh: '预计完工：快了。"快了"的定义：未知。' },
      { en: 'BEEP. I HAVE BEEN HOLDING THIS CONE FOR THREE YEARS.', zh: '哔。这个路锥我已经扶了三年。' }
    ],
    dev: [
      { en: 'Games are just websites that refuse to stop being fun.', zh: '游戏，就是坚持要好玩的网站。' },
      { en: "Those posters? Eddie's next games. Walk up to one to read the pitch.", zh: '那些海报？是 Eddie 接下来要做的游戏。走到海报前就能看介绍。' },
      { en: "I've been 'almost done' for two years. It's a lifestyle.", zh: '我"马上就做完了"已经两年了。这是一种生活方式。' }
    ],
    master: [
      { en: "Next train leaves whenever you're ready. Destination: the credits.", zh: '下一班车，你准备好就出发。终点站：片尾字幕。' },
      { en: 'Step through the gate to roll the credits.', zh: '走进闸机，就能看到片尾字幕。' },
      { en: 'Ticket price: one email. Very reasonable.', zh: '车票价格：一封邮件。非常划算。' }
    ]
  };
  const BYTE_LINES = {
    intro: { en: "Hi, I'm BYTE! Walk with ← →. Press F at any door to look inside.", zh: '嗨，我是 BYTE！用 ← → 走路，在门口按 F 就能进去看看。' },
    jump: { en: 'Space jumps. Press it again in the air to double jump.', zh: '空格键跳跃，在空中再按一次可以二段跳。' },
    web: { en: 'Web Street! Every shop here is a website or app Eddie built.', zh: '网站街到了！这里每家店都是 Eddie 做的网站或应用。' },
    corp: { en: "Megacorp Plaza. This is where Eddie's internships live.", zh: '巨企广场。Eddie 的实习经历都在这儿。' },
    arcade: { en: 'The arcade! Real games inside. Bring coins.', zh: '游戏厅！里面的游戏都能玩，记得带金币。' },
    build: { en: 'Hard hats on. Everything here is still under construction.', zh: '戴好安全帽，这里的东西还在施工。' },
    lab: { en: "Indie Lab. Eddie's upcoming games are on the posters.", zh: '独立游戏实验室。海报上是 Eddie 即将推出的游戏。' },
    exp: { en: 'The Experiments district. Eddie really did build a rocket once. The kitchen has opinions about it.', zh: '实验区。Eddie 真的造过一枚火箭。厨房对此颇有意见。' },
    rud: { en: '...That reminds me of the kitchen.', zh: '……这让我想起了那个厨房。' },
    radio: { en: 'Radio Hill. Change the music at the jukebox, or tag the wall.', zh: '电台坡。去点唱机换首歌，或者在墙上涂个鸦。' },
    station: { en: 'End of the line. The train takes you to the credits.', zh: '终点站。坐上列车就能看到片尾字幕。' },
    idle: [
      { en: 'Press M for the map. It has fast travel.', zh: '按 M 打开地图，可以快速传送。' },
      { en: 'You can also click a building and walk there automatically.', zh: '也可以直接点击建筑，自动走过去。' },
      { en: 'Five cats live in this city. Have you met them?', zh: '这座城市住着五只猫，你都见过了吗？' },
      { en: 'Press ` to open the terminal. Type help.', zh: '按 ` 键打开终端，输入 help 试试。' }
    ],
    sign: { en: "My building's name sign is dead. Its fuse box is way out on Radio Hill. City wiring, don't ask.", zh: '我们楼的名字招牌坏了。配电箱在老远的电台坡，城市布线就是这么离谱。' },
    signOn: { en: 'Look up! Your name is shining again. Best repair job in the whole city.', zh: '抬头看！你的名字又亮起来了，全城最好的维修活儿。' },
    fuse: { en: "That's the breaker box for the name sign back home. Sparks mean it's still broken.", zh: '这就是家里那块名字招牌的配电箱。还在冒火花，说明还没修好。' },
    gacha: { en: 'Got spare coins? The capsule machine next to the arcade sells stickers.', zh: '有多余的金币吗？游戏厅旁边的扭蛋机能扭贴纸。' },
    eats: { en: 'The noodle cart needs a courier. Deliveries pay in coins.', zh: '拉面车在招外卖员，送一单能赚金币。' },
    edge: { en: 'Uh... where are you going? There is nothing over there. Probably.', zh: '呃……你要去哪？那边什么都没有。大概吧。' },
    cat: { en: 'A cat! {n} of 5 found.', zh: '一只猫！已找到 {n}/5。' },
    big: { en: 'Whoa. You ate a mushroom. Classic.', zh: '哇，你吃了蘑菇。经典。' },
    night: { en: "It's late. Eddie is probably still awake too.", zh: '这么晚了，Eddie 估计也还没睡。' },
    back: { en: 'Welcome back. Your coins are where you left them.', zh: '欢迎回来，你的金币一个没少。' },
    poke: [
      { en: 'Hey! That tickles.', zh: '喂！好痒。' },
      { en: 'I run on 8 bits and pure optimism.', zh: '我靠 8 个比特和纯粹的乐观运行。' },
      { en: "Fun fact: I'm the only drone in this city with a portfolio.", zh: '冷知识：我是这座城市里唯一有作品集的无人机。' },
      { en: 'Beep boop. That is all.', zh: '哔哔啵啵。说完了。' }
    ]
  };

  const EATS = {
    order: { en: 'Order up! Deliver to {who} in {s} seconds. Run with Shift!', zh: '来单了！{s} 秒内送到 {who}。按住 Shift 跑！' },
    busy: { en: 'Finish your current delivery first.', zh: '先把手上这单送完。' },
    late: { en: 'Too slow. The noodles went cold and the order was cancelled.', zh: '太慢了，面坨了，订单被取消。' },
    teleport: { en: "No teleporting with hot noodles. Soup everywhere.", zh: '端着热汤面可不能传送，会洒一地。' },
    thanks: [
      { en: 'Finally! I was about to eat my keyboard.', zh: '终于来了！我差点把键盘啃了。' },
      { en: 'Five stars. Would order again.', zh: '五星好评，下次还点。' },
      { en: 'You ran here? Respect.', zh: '你是跑过来的？佩服。' },
      { en: 'Extra spicy. Perfect for debugging.', zh: '特辣，最适合 debug。' },
      { en: 'Still hot. You are a legend.', zh: '还是热的，你是传奇。' }
    ],
    who: {
      granny: { en: 'In my day, delivery took three days and a horse.', zh: '我们那会儿送个外卖要三天，还得骑马。' },
      guard: { en: "Noodles on duty. Don't tell my manager.", zh: '值班吃面，别告诉我经理。' },
      kid: { en: 'Ramen plus arcade equals best night ever.', zh: '拉面加游戏厅，完美的夜晚。' },
      robot: { en: 'INGESTING NOODLES. JUST KIDDING. I RUN ON SOLAR.', zh: '正在摄入面条。开玩笑的，我靠太阳能运行。' },
      dev: { en: "Fuel for one more 'last' commit.", zh: '再来一次"最后一次"提交的燃料。' },
      master: { en: 'The train can wait. Noodles cannot.', zh: '火车可以等，面不能等。' }
    }
  };
  let job = null, jobStreak = 0, signCheer = false;

  function buildMain() {
    const s = newScene('main');
    const rnd = N.seeded('neon-8-city');
    let x = 0;
    const district = (id, world, name, color) => s.districts.push({ id, world, name, color, x0: x, spawn: x + 40 });
    const addB = (kind, bx, w, h, extra = {}) => {
      const b = Object.assign({ kind, x: bx, w, h, index: s.buildings.length }, extra);
      b.art = A[kind](b, N.seeded(kind + bx));
      b.neonState = (b.art.neons || []).map(() => ({ off: 0 }));
      s.buildings.push(b);
      return b;
    };
    const trig = (cx, half, prompt, label, act, extra = {}) => { const t = Object.assign({ x0: cx - half, x1: cx + half, cx, prompt, label, act, py: GROUND - 40 }, extra); s.triggers.push(t); return t; };
    const click = (x0, y0, x1, y1, t) => s.clicks.push({ x0, y0, x1, y1, t });
    const prop = (kind, px, canvasOrArt, extra = {}) => { const p = Object.assign({ kind, x: px, y: GROUND }, extra); if (canvasOrArt) { if (canvasOrArt.canvas) Object.assign(p, canvasOrArt); else p.canvas = canvasOrArt; } s.props.push(p); return p; };
    const plat = (px, py, w) => s.platforms.push({ x: px, y: py, w });
    const npc = (kind, nx, dir = -1) => { const n = { kind, x: nx, y: GROUND, dir, i: 0 }; s.npcs.push(n); const t = trig(nx, 12, 'prompt.talk', kind.toUpperCase(), () => talk(n), { npc: n, py: GROUND - 30 }); click(nx - 7, GROUND - 20, nx + 7, GROUND, t); return n; };
    const lamp = (lx) => prop('lamp', lx, A.lamp(N.pick([C.warm, C.warm, C.cool, C.pink])));

    /* ---- HOME ---- */
    district('home', '1-1', { en: 'Home', zh: '家' }, 'magenta');
    s.districts[0].spawn = 70;
    prop('endwall', 0, null);
    x = 24;
    const home = addB('home', x, 150, 150);
    { const t = trig(home.x + home.art.door.x, 16, 'prompt.enter', 'HOME', () => N.UI.openAbout()); click(home.x, GROUND - 150, home.x + 150, GROUND, t); }
    s.homeSign = home;
    s.cats.push({ id: 'cat-black', kind: 'black', x: x + 162, y: GROUND - 26 }); // sitting on top of the mailbox
    x += 158;
    { const mb = prop('mailbox', x + 2, A.mailbox()); const t = trig(x + 9, 10, 'prompt.use', 'MAIL', () => N.UI.openContact()); click(x + 2, GROUND - 26, x + 16, GROUND, t); plat(x + 2, GROUND - 26, 12); mb.w = 14; }
    { prop('board', x + 26, A.board()); const t = trig(x + 41, 13, 'prompt.read', 'HELP', () => N.UI.openHelp()); click(x + 26, GROUND - 30, x + 56, GROUND, t); }
    npc('granny', x + 78, -1);
    s.blocks.push({ x: x + 100, y: GROUND - 46, w: 10, h: 10, content: 'coins', used: false, bump: 0 });
    lamp(x + 120);
    x += 150;

    /* ---- WEB STREET ---- */
    district('web', '1-2', { en: 'Web Street', zh: '网站街' }, 'cyan');
    prop('arch', x + 4, null, { label: 'WEB ST.' });
    x += 34;
    N.projectsOf('web').forEach((p, i) => {
      const w = 142 + ((rnd() * 4) | 0) * 10, h = 108 + ((rnd() * 4) | 0) * 8;
      const b = addB('shop', x, w, h, { project: p, index: i });
      const t = trig(b.x + b.art.door.x, 16, 'prompt.enter', p.sign || p.id, () => N.UI.openProject(p.id), { project: p });
      click(b.x, GROUND - h, b.x + w, GROUND, t);
      // awning is a platform (jump on it)
      plat(b.x + b.art.awning.x + b.art.m, GROUND - 52, b.art.awning.w);
      if (i === 1) s.cats.push({ id: 'cat-orange', kind: 'orange', x: b.x + 30, y: GROUND - 52 });
      x += w;
      const gap = 18 + ((rnd() * 3) | 0) * 6;
      if (i % 2 === 0) lamp(x + gap / 2 - 10);
      else { prop('trash', x + gap / 2 - 4, A.trash()); }
      x += gap;
    });
    // plaza
    x += 10;
    { prop('vending', x, A.vending()); plat(x, GROUND - 40, 22); const t = trig(x + 11, 12, 'prompt.use', 'POP', () => N.UI.openVending()); click(x, GROUND - 40, x + 22, GROUND, t); }
    s.cats.push({ id: 'cat-white', kind: 'white', x: x + 6, y: GROUND - 40 });
    prop('crate', x + 30, A.crate(16, 14)); plat(x + 30, GROUND - 14, 16);
    prop('crate', x + 46, A.crate(14, 12)); plat(x + 46, GROUND - 12, 14);
    prop('crate', x + 34, A.crate(12, 12), { y: GROUND - 14 }); plat(x + 34, GROUND - 26, 12);
    s.blocks.push({ x: x + 70, y: GROUND - 48, w: 10, h: 10, content: 'mushroom', used: false, bump: 0 });
    { prop('newsbox', x + 92, A.newsbox()); const t = trig(x + 100, 10, 'prompt.read', 'NEWS', () => N.UI.openNews()); click(x + 92, GROUND - 22, x + 108, GROUND, t); }
    prop('bench', x + 116, A.bench()); plat(x + 116, GROUND - 6, 26);
    const benchSpot = { x: x + 122, y: GROUND - 6 };
    lamp(x + 150);
    x += 180;

    /* ---- MEGACORP ---- */
    district('corp', '1-3', { en: 'Megacorp Plaza', zh: '巨企广场' }, 'blue');
    prop('billboard', x + 6, A.billboard(['MEGACORP', 'PLEASE REMAIN', 'PRODUCTIVE'], 'yellow'), { y: GROUND - 2 });
    x += 110;
    npc('guard', x - 6, 1);
    N.projectsOf('intern').forEach((p, i) => {
      const w = 160 + ((rnd() * 3) | 0) * 10, h = 150 + ((rnd() * 4) | 0) * 8;
      const b = addB('tower', x, w, h, { project: p, index: i });
      const t = trig(b.x + b.art.door.x, 18, 'prompt.enter', p.sign || p.company, () => N.UI.openProject(p.id), { project: p });
      click(b.x, GROUND - h, b.x + w, GROUND, t);
      x += w + 22;
      if (i === 0) { prop('phone', x - 18, A.phone()); const t2 = trig(x - 9, 9, 'prompt.use', 'CALL', () => N.UI.openContact(true)); click(x - 18, GROUND - 46, x, GROUND, t2); x += 10; }
      else lamp(x - 18);
    });
    s.blocks.push({ x: x - 12, y: GROUND - 46, w: 10, h: 10, content: 'fact', used: false, bump: 0 });
    x += 30;

    /* ---- ARCADE ---- */
    district('arcade', '1-4', { en: 'Pixel Palace', zh: '像素游戏厅' }, 'yellow');
    {
      const b = addB('arcade', x, 240, 112);
      const t = trig(b.x + b.art.door.x, 24, 'prompt.play', 'ARCADE', () => N.Arcade.open());
      click(b.x, GROUND - 112, b.x + 240, GROUND, t);
      // the sticky note: a hint that the street goes further left than it looks
      const nt = trig(b.x + b.art.note.x, 8, 'prompt.read', 'NOTE', () => N.UI.openNote());
      s.clicks.unshift({ x0: b.x + b.art.note.x - 7, y0: GROUND - 42, x1: b.x + b.art.note.x + 7, y1: GROUND - 26, t: nt });
      x += 240;
    }
    npc('kid', x + 14, -1);
    x += 34;
    { prop('gacha', x, A.gacha()); const t = trig(x + 12, 11, 'prompt.spin', 'GACHA', () => N.Gacha.open()); click(x, GROUND - 40, x + 24, GROUND, t); }
    x += 44;
    { prop('noodle', x, A.noodle()); npc('vendor', x + 50, -1); plat(x, GROUND - 32, 40); const t = trig(x + 20, 14, 'prompt.order', 'NOODLE', () => takeOrder(), { py: GROUND - 48 }); click(x, GROUND - 40, x + 40, GROUND, t); s.noodleX = x + 20; }
    const cartSpot = { x: x + 14, y: GROUND - 32 };
    x += 90;
    lamp(x);
    x += 30;

    /* ---- BUILD ZONE ---- */
    district('build', '1-5', { en: 'Build Zone', zh: '施工区' }, 'orange');
    const buildStart = x;
    N.projectsOf('soon-web').forEach((p, i) => {
      const w = 196, h = 96 + Math.round((p.progress || 30) / 100 * 4) * 24;
      const b = addB('site', x, w, h, { project: p, index: i });
      const t = trig(b.x + b.art.door.x, 16, 'prompt.enter', p.sign || p.id, () => N.UI.openProject(p.id), { project: p });
      click(b.x, GROUND - h, b.x + w, GROUND, t);
      b.art.planks.forEach(pl => plat(b.x + pl.x + b.art.m, GROUND + pl.y, pl.w));
      if (i === 0 && b.art.planks.length) { const top = b.art.planks[b.art.planks.length - 1]; s.cats.push({ id: 'cat-grey', kind: 'grey', x: b.x + top.x + b.art.m + 20, y: GROUND + top.y }); }
      x += w + 30;
    });
    npc('robot', x - 18, -1);
    s.blocks.push({ x: x - 50, y: GROUND - 48, w: 10, h: 10, content: '1up', used: false, bump: 0 });
    prop('crane', buildStart + 40, A.crane(170, Math.max(120, x - buildStart - 120)), { y: GROUND, swing: true });
    x += 20;

    /* ---- INDIE LAB ---- */
    district('lab', '1-6', { en: 'Indie Lab', zh: '独立游戏实验室' }, 'lime');
    {
      const games = N.projectsOf('soon-game');
      const w = Math.max(200, 50 + games.length * 90), h = 124;
      const b = addB('lab', x, w, h, { projects: games });
      b.art.posters.forEach(po => {
        const t = trig(b.x + po.x, 22, 'prompt.read', po.project.sign || po.project.id, () => N.UI.openProject(po.project.id), { project: po.project });
        click(b.x + po.x - 30, GROUND - 90, b.x + po.x + 30, GROUND - 10, t);
      });
      x += w;
    }
    npc('dev', x + 16, -1);
    x += 46;
    lamp(x);
    x += 30;

    /* ---- EXPERIMENTS ---- */
    district('exp', '1-7', { en: 'Experiments', zh: '实验' }, 'red');
    {
      const exp = N.projectsOf('experiment')[0];
      x += 16;
      if (exp) { prop('board', x, A.board()); const t = trig(x + 15, 13, 'prompt.read', 'LOG', () => N.UI.openProject(exp.id), { project: exp }); click(x, GROUND - 30, x + 30, GROUND, t); }
      x += 64;
      const padX = x + 26;
      const L0 = s.launch = { x: padX, base: GROUND - 6, y: GROUND - 6, vy: 0, state: 'idle', t: 0, armT: 0, scorch: [], sign: A.neonBox('LAUNCH SITE', 'red', { font: 3, padIn: 2 }) };
      prop('launch', padX, null, { pad: L0 });
      L0.trig = trig(padX + 44, 10, 'prompt.launch', 'LAUNCH', () => pressLaunch(), { py: GROUND - 40, quiet: true });
      click(padX + 38, GROUND - 20, padX + 50, GROUND, L0.trig);
      prop('extinguisher', padX + 56, A.extinguisher());
      x = padX + 84;
      lamp(x);
      x += 60;
    }

    /* ---- RADIO HILL ---- */
    district('radio', '1-8', { en: 'Radio Hill', zh: '电台坡' }, 'violet');
    {
      const b = addB('radio', x, 60, 200);
      const t = trig(b.x + 30, 14, 'prompt.tune', 'RADIO', () => tuneRadio());
      click(b.x, GROUND - 40, b.x + 60, GROUND, t);
      x += 76;
      const wb = addB('wall', x, 130, 64);
      const t2 = trig(wb.x + 65, 30, 'prompt.paint', 'PAINT', () => N.Paint.open());
      click(wb.x, GROUND - 64, wb.x + 130, GROUND, t2);
      x += 150;
      // the breaker box for the name sign back home lives out here, past all the projects
      const fx = x - 12; prop('fuse', fx, A.fusebox());
      const t3 = trig(fx + 5, 9, 'prompt.fix', 'FUSE', () => N.Fuse.open(), { py: GROUND - 52 });
      s.clicks.unshift({ x0: fx - 2, y0: GROUND - 38, x1: fx + 12, y1: GROUND, t: t3 });
      x += 10;
    }
    lamp(x);
    x += 26;

    /* ---- STATION ---- */
    district('station', '1-9', { en: 'Neon Station', zh: '霓虹车站' }, 'magenta');
    {
      const b = addB('station', x, 330, 120);
      b.trainCanvas = A.train(3);
      const t = trig(b.x + b.art.door.x, 20, 'prompt.board', 'TRAIN', () => N.Credits.play());
      click(b.x, GROUND - 120, b.x + 330, GROUND, t);
      npc('master', x + 112, -1);
      x += 330;
    }
    x += 24;
    prop('endwall', x, null, { right: true });
    x += 16;
    s.width = x;

    // if a cat's building was removed from data.js, park it somewhere else so 5/5 stays possible
    const fallback = { 'cat-orange': benchSpot, 'cat-grey': cartSpot };
    ['cat-orange', 'cat-grey'].forEach(id => { if (!s.cats.find(c => c.id === id) && fallback[id]) s.cats.push(Object.assign({ id, kind: id === 'cat-orange' ? 'orange' : 'grey' }, fallback[id])); });

    // coins every ~150px, skipping the very start: a flat row you walk through, or an arc up in the air you jump for
    const crnd = N.seeded('coins');
    for (let cx = 120; cx < s.width - 80; cx += 130 + ((crnd() * 60) | 0)) {
      const n = 3 + ((crnd() * 2) | 0), air = crnd() < 0.45, hy = air ? N.pick([30, 34]) : 8;
      for (let k = 0; k < n; k++) s.coins.push({ x: cx + k * 11, y: GROUND - hy - (air ? Math.round(Math.sin((k / (n - 1)) * Math.PI) * 10) : 0), taken: false, ph: crnd() * 6 });
    }
    // coins on top of every platform
    s.platforms.forEach(pl => { if (pl.y < GROUND - 20) s.coins.push({ x: pl.x + pl.w / 2, y: pl.y - 10, taken: false, ph: crnd() * 6 }); });
    // block tops are platforms too
    s.blocks.forEach(bl => plat(bl.x, bl.y, bl.w));

    // pedestrians
    for (let i = 0; i < 9; i++) s.walkers.push({ x: crnd() * s.width, dir: crnd() < 0.5 ? -1 : 1, spd: 0.25 + crnd() * 0.35, kind: (crnd() * SP.walkers.length) | 0, umb: crnd() < 0.7 ? N.pick(['magenta', 'cyan', 'yellow', 'lime', 'violet']) : null, t: crnd() * 10 });
    return s;
  }

  function buildMinus() {
    const s = newScene('minus');
    s.districts.push({ id: 'minus', world: '-1', name: { en: 'World -1', zh: 'WORLD -1' }, color: 'lime', x0: 0, spawn: 40 });
    let x = 120;
    N.projectsOf('graveyard').forEach((p) => {
      s.deco.push({ kind: 'tomb', x, data: { name: (p.sign || p.id).toUpperCase(), years: p.years || p.year || '' } });
      s.triggers.push({ x0: x - 10, x1: x + 18, cx: x + 4, prompt: 'prompt.read', label: 'RIP', py: GROUND - 34, project: p, act: () => N.UI.openProject(p.id) });
      x += 90;
    });
    s.cats.push({ id: 'cat-pink', kind: 'pink', x: x + 30, y: GROUND - 30 });
    s.platforms.push({ x: x + 20, y: GROUND - 30, w: 24 });
    s.deco.push({ kind: 'ledge', x: x + 20, y: GROUND - 30, w: 24 });
    x += 110;
    s.deco.push({ kind: 'pipe', x });
    s.triggers.push({ x0: x - 4, x1: x + 22, cx: x + 9, prompt: 'prompt.enter', label: 'PIPE', py: GROUND - 40, act: () => exitMinus() });
    s.width = x + 60;
    for (let k = 0; k < 8; k++) s.coins.push({ x: 60 + k * 70, y: GROUND - 24 - (k % 3) * 10, taken: false, ph: k });
    return s;
  }

  /* ======================= sizing ======================= */
  function resize() {
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const cw = wrap.clientWidth, ch = wrap.clientHeight;
    scale = ch / VH;
    VW = Math.max(200, Math.ceil(cw / scale));
    canvas.width = VW; canvas.height = VH;
    canvas.style.width = (VW * scale) + 'px'; canvas.style.height = (VH * scale) + 'px';
    ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    ({ c: reflC, x: reflX } = P.canvas(VW, VH - ROAD_Y));
    ({ c: pudC, x: pudX } = P.canvas(VW, VH - ROAD_Y));
    buildSky();
  }
  function buildSky() {
    const r = P.canvas(VW, GROUND); skyC = r.c;
    P.ditherGradient(r.x, 0, 0, VW, GROUND, [[0, '#07031a'], [0.35, '#140838'], [0.7, '#2c0f55'], [0.9, '#4d1566'], [1, '#6e1f6e']]);
  }

  /* ======================= backdrop ======================= */
  let far, mid, koi, blimp, stars = [], cars = [], train = { x: 0, wait: 6, canvas: null, on: false }, rain = [], splashes = [], stripCache = new Map();
  function buildBackdrop() {
    far = A.skyline('far', 1024, 130, { minW: 14, maxW: 34, minH: 34, maxH: 110, gap: 4, color: '#1a0c3f', color2: '#1f1048', win: '#3a2470', win2: '#4a2a80', win3: '#5a3a90', lit: 0.18, wx: 4, wy: 5, ww: 1, wh: 1 });
    mid = A.skyline('mid', 1200, 170, { minW: 22, maxW: 52, minH: 60, maxH: 160, gap: 10, color: '#22104d', color2: '#2b1660', win: '#ffcf6b', win2: C.cool, win3: C.pink, lit: 0.12, wx: 5, wy: 6, ww: 2, wh: 2, strips: true });
    mid.strips.forEach(st => {
      const [main] = P.NEONS[st.key];
      const mk = (on) => {
        const { c, x } = P.canvas(13, st.n * 8 + 8);
        if (on) { x.shadowColor = main; x.shadowBlur = 3; }
        const r2 = N.seeded(st.key + st.x);
        for (let k = 0; k < st.n; k++) P.fakeGlyph(x, 4, 4 + k * 8, 5, on ? main : P.mix(main, C.ink, 0.7), r2);
        return c;
      };
      st.on = mk(true); st.off = mk(false);
    });
    koi = P.glow(A.koi(), C.cyan, 3);
    blimp = A.blimp();
    const sr = N.seeded('stars');
    stars = Array.from({ length: 70 }, () => ({ x: sr() * 1400, y: sr() * 120, ph: sr() * 6, sp: 0.5 + sr() * 2, c: sr() < 0.15 ? C.cyanL : sr() < 0.3 ? C.magentaL : '#ffffff' }));
    const lanes = [{ y: 52, f: 0.35, d: 1 }, { y: 62, f: 0.4, d: -1 }, { y: 100, f: 0.55, d: 1 }, { y: 108, f: 0.6, d: -1 }];
    cars = Array.from({ length: 10 }, (_, i) => { const ln = lanes[i % lanes.length]; return { lane: ln, x: Math.random() * 1600, spd: 0.4 + Math.random() * 0.9, col: N.pick(['#5a4a9a', '#3a6a9a', '#9a3a6a', '#2a2a4a']) }; });
    train.canvas = A.train(4, { flip: true }); // it runs right to left, so it faces left
    groundTile = A.ground(64);
    pudMask = buildPuddles();
    rain = Array.from({ length: N.reducedMotion ? 60 : 170 }, () => newDrop(true));
  }
  function buildPuddles() {
    // long strip of puddle shapes; scrolls with the camera
    const w = 1024, h = VH - ROAD_Y;
    const { c, x } = P.canvas(w, h);
    const r = N.seeded('puddles');
    x.fillStyle = '#fff';
    for (let k = 0; k < 18; k++) {
      const px = r() * w, py = 3 + r() * (h - 8), pw = 18 + r() * 60, ph = 2 + r() * 5;
      for (let j = 0; j < ph; j++) { const t = (j + 0.5) / ph * 2 - 1; const half = Math.sqrt(1 - t * t) * pw / 2; x.fillRect((px - half) | 0, (py + j) | 0, (half * 2) | 0, 1); }
    }
    return c;
  }
  function newDrop(any) {
    return { x: Math.random() * (VW + 60), y: any ? Math.random() * VH : -10 - Math.random() * 40, v: 3.2 + Math.random() * 2.4, l: 3 + ((Math.random() * 3) | 0) };
  }

  /* ======================= interactions ======================= */
  const isDrop = (t) => !!(job && t && t === job.target && W.scene === 'main');
  let lastPromptTrig = null;
  function jobName(t) { return t.project ? L(t.project.title) : t.npc ? N.label(t.npc.kind.toUpperCase()) : N.label(t.label); }
  function takeOrder() {
    if (job) { N.UI.say(EATS.busy, S.npcs.find(n => n.kind === 'vendor') || 'byte'); return; }
    const from = S.noodleX;
    const spots = S.triggers.filter(t => (t.npc && t.npc.kind !== 'vendor') || t.project || ['HOME', 'TRAIN', 'RADIO', 'MAIL'].includes(t.label)).filter(t => Math.abs(t.cx - from) > 380);
    if (!spots.length) return;
    const target = N.pick(spots), dist = Math.abs(target.cx - from);
    const secs = Math.round(7 + dist / 140);
    job = { target, left: secs * 60, total: secs * 60, who: jobName(target) };
    N.Audio.sfx('ding');
    const line = { en: EATS.order.en.replace('{who}', job.who).replace('{s}', secs), zh: EATS.order.zh.replace('{who}', job.who).replace('{s}', secs) };
    N.UI.say(line, S.npcs.find(n => n.kind === 'vendor') || 'byte');
    emitJob(true);
  }
  let jobSec = -1;
  function emitJob(force) {
    const sec = job ? Math.ceil(job.left / 60) : -1;
    if (force || sec !== jobSec) { jobSec = sec; N.emit('job', job ? { who: job.who, secs: sec, urgent: job.left < 10 * 60 } : null); }
  }
  function deliver() {
    const D = N.Store.data, t = job.target, left = Math.ceil(job.left / 60);
    const pay = 2 + Math.ceil(left / 4);
    job = null; jobStreak++;
    D.deliveries = (D.deliveries || 0) + 1; D.bestStreak = Math.max(D.bestStreak || 0, jobStreak); N.Store.save();
    addCoins(pay);
    floatText('+' + pay, player.x, player.y - 30, C.yellow);
    spark(player.x, player.y - 24, C.orange, 14);
    N.Audio.sfx('ding');
    const special = t.npc && EATS.who[t.npc.kind];
    N.UI.say(special || N.pick(EATS.thanks), t.npc || 'byte');
    N.Ach.unlock('delivery1');
    if (D.deliveries >= 5) N.Ach.unlock('courier');
    emitJob(true);
  }
  function failJob() { job = null; jobStreak = 0; N.Audio.sfx('error'); N.UI.say(EATS.late, 'byte'); emitJob(true); }

  function talk(n) {
    const lines = NPC_LINES[n.kind] || [];
    if (!lines.length) return;
    n.dir = player.x < n.x ? -1 : 1;
    N.UI.say(lines[n.i % lines.length], n);
    n.i++;
    N.Audio.sfx('talk');
    N.Ach.bump('talks', 1, 7, 'social');
  }
  /* ---- Launch Site: safety cover, countdown, liftoff, fireworks (and the odd kitchen flashback) ---- */
  const FIRE = () => [C.magenta, C.cyan, C.yellow, C.lime, C.orange, C.vio];
  function pressLaunch() {
    const L0 = S.launch; if (!L0) return;
    if (L0.state === 'idle') { L0.state = 'count'; L0.t = 0; L0.trig.off = true; N.Audio.sfx('lock'); }
  }
  function puffSmoke(x0, y0, n, spread) {
    for (let k = 0; k < n; k++) W.particles.push({ x: x0 + (Math.random() - 0.5) * spread, y: y0 - Math.random() * 3, vx: (Math.random() - 0.5) * 0.9, vy: -0.15 - Math.random() * 0.4, g: -0.004, life: 40 + Math.random() * 30, c: N.pick(['#9b8ac4', '#7a6e9e', '#c3b2f2']), a: 0.45, size: 3 });
  }
  function burst(x0, y0, n, power, cols) {
    for (let k = 0; k < n; k++) {
      const ang = k / n * Math.PI * 2 + Math.random() * 0.08, sp = power * (0.55 + Math.random() * 0.45);
      W.particles.push({ x: x0, y: y0, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 0.018, drag: 0.95, life: 60 + Math.random() * 40, c: cols[k % cols.length], size: 2, spark: true });
    }
  }
  // the name, written in sparks
  function nameBurst(cx, cy) {
    const name = (N.DATA.profile.name || 'EDDIE').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8), font = P.FONTS[5].g, sc = 3;
    const width = (P.measure(name) + 0) * sc;
    let ox = cx - width / 2;
    const cols = [C.magentaL, C.yellowL, C.cyanL];
    [...name].forEach((ch, i) => {
      const g = font[ch] || font['?'];
      g.rows.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] === '#') W.particles.push({ x: ox + rx * sc, y: cy + ry * sc, vx: (Math.random() - 0.5) * 0.012, vy: 0.012, g: 0.0012, life: 120 + Math.random() * 30, c: cols[i % cols.length], size: 2, spark: true }); });
      ox += (g.w + 1) * sc;
    });
    N.Audio.sfx('crackle');
  }
  function updateLaunch() {
    const L0 = S.launch; if (!L0 || W.scene !== 'main') return;
    L0.t++;
    if (L0.state === 'count') {
      if (L0.t % 60 === 1) N.Audio.sfx(L0.t > 170 ? 'go' : 'count');
      if (L0.t % 6 === 0) puffSmoke(L0.x, L0.base, 1 + ((L0.t / 60) | 0), 14);
      if (L0.t >= 180) {
        const D = N.Store.data;
        if ((D.launches || 0) > 0 && Math.random() < 1 / 20) return padBoom();
        D.launches = (D.launches || 0) + 1; N.Store.save();
        N.Ach.unlock('liftoff'); if (D.launches >= 10) N.Ach.unlock('fireworks');
        L0.state = 'flight'; L0.vy = 0; L0.t = 0; W.shake = Math.max(W.shake, 6);
        N.Audio.sfx('ignite'); puffSmoke(L0.x, L0.base, 18, 30);
      }
    } else if (L0.state === 'flight') {
      L0.vy = Math.max(L0.vy - 0.085, -5.2); L0.y += L0.vy;
      for (let k = 0; k < 3; k++) W.particles.push({ x: L0.x + (Math.random() - 0.5) * 4, y: L0.y + 2, vx: (Math.random() - 0.5) * 0.6, vy: 1 + Math.random() * 1.6, life: 8 + Math.random() * 10, c: N.pick([C.yellowL, C.yellow, C.orange, C.orange]), size: 2 });
      if (L0.t % 3 === 0) puffSmoke(L0.x, L0.y + 6, 1, 4);
      if (L0.y > L0.base - 60) W.shake = Math.max(W.shake, 2);
      if (L0.y < 44) {
        const cols = FIRE(), a = N.pick(cols), b = N.pick(cols);
        burst(L0.x, L0.y, 130, 3.4, [a, b, '#ffffff']);
        W.flash = Math.max(W.flash, 0.22); N.Audio.sfx('boom');
        setTimeout(() => { burst(L0.x - 70, 76, 60, 2.2, [N.pick(cols), '#ffffff']); N.Audio.sfx('crackle'); }, 380);
        setTimeout(() => { burst(L0.x + 74, 64, 60, 2.2, [N.pick(cols), '#ffffff']); N.Audio.sfx('crackle'); }, 640);
        setTimeout(() => nameBurst(L0.x, 34), 900);
        L0.state = 'wait'; L0.t = 0;
      }
    } else if (L0.state === 'wait' && L0.t > 170) { L0.state = 'reload'; L0.y = -40; L0.t = 0; }
    else if (L0.state === 'reload') {
      L0.y += (L0.base - L0.y) * 0.05 + 0.4;
      if (L0.y >= L0.base) { L0.y = L0.base; L0.state = 'idle'; L0.trig.off = false; N.Audio.sfx('land'); }
    }
  }
  // 1 in 20: the rocket never leaves the pad
  function padBoom() {
    const L0 = S.launch;
    burst(L0.x, L0.base - 20, 80, 2.4, [C.orange, C.yellow, C.red, '#ffffff']);
    puffSmoke(L0.x, L0.base, 30, 40);
    W.shake = 14; W.flash = 0.7;
    N.Audio.sfx('explode'); N.Audio.sfx('thunder');
    L0.scorch.push({ dx: (Math.random() - 0.5) * 10, r: 13 + Math.random() * 6 }); if (L0.scorch.length > 4) L0.scorch.shift();
    N.Store.data.rud = (N.Store.data.rud || 0) + 1; N.Store.save();
    N.Ach.unlock('rud');
    setTimeout(() => N.UI.say(BYTE_LINES.rud, 'byte'), 900);
    L0.state = 'wait'; L0.t = 0;
  }
  function tuneRadio() {
    const id = N.Audio.music.next();
    N.UI.say(id ? { en: `♪ Now playing: ${N.Audio.music.tracks[id].name}`, zh: `♪ 正在播放：${N.Audio.music.tracks[id].name}` } : { en: 'Radio off. Enjoy the rain.', zh: '电台已关闭，听听雨声吧。' }, 'byte');
    N.Audio.sfx('select');
    N.Ach.unlock('dj');
  }
  function hitBlock(b) {
    b.bump = 8;
    if (b.used) { N.Audio.sfx('bump'); return; }
    b.used = true;
    if (b.content === 'coins') { for (let k = 0; k < 5; k++) setTimeout(() => { addCoins(1); spark(b.x + 5, b.y - 6, C.yellow, 6); popCoin(b.x + 5, b.y); }, k * 90); }
    else if (b.content === 'mushroom') { N.Audio.sfx('powerup'); player.big = 60 * 20; N.UI.say(BYTE_LINES.big, 'byte'); N.Ach.unlock('mushroom'); spark(b.x + 5, b.y - 6, C.magenta, 14); }
    else if (b.content === 'fact') { N.Audio.sfx('select'); const f = N.pick(N.DATA.profile.funFacts || []); if (f) N.UI.say(f, 'byte'); spark(b.x + 5, b.y - 6, C.cyan, 10); }
    else if (b.content === '1up') { N.Audio.sfx('powerup'); addCoins(10); floatText('1UP', b.x + 5, b.y - 8, C.lime); spark(b.x + 5, b.y - 6, C.lime, 14); }
  }
  function popCoin(x, y) { W.particles.push({ x, y, vx: 0, vy: -3.5, g: 0.25, life: 22, coin: true }); }
  function addCoins(n) {
    const d = N.Store.data;
    const mult = player.god ? 2 : 1;
    d.coins += n * mult; d.coinsTotal += n * mult; N.Store.save();
    N.Audio.sfx('coin');
    N.emit('coins', d.coins);
    if (d.coinsTotal >= 10) N.Ach.unlock('coins10');
    if (d.coinsTotal >= 50) N.Ach.unlock('coins50');
  }
  function petCat(cat) {
    const d = N.Store.data;
    N.Audio.sfx('meow');
    cat.hearts = 60;
    spark(cat.x + 5, cat.y - 10, C.magenta, 8);
    if (!d.cats[cat.id]) {
      d.cats[cat.id] = Date.now(); N.Store.save();
      const n = Object.keys(d.cats).length;
      N.UI.say({ en: BYTE_LINES.cat.en.replace('{n}', n), zh: BYTE_LINES.cat.zh.replace('{n}', n) }, 'byte');
      N.emit('cats', n);
      N.Ach.unlock('cat1');
      if (n >= 5) N.Ach.unlock('cat5');
    }
  }
  function spark(x, y, color, n = 8) {
    for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 1.8; W.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.6, g: 0.06, life: 24 + Math.random() * 16, c: color }); }
  }
  function puff(x, y) { for (let k = 0; k < 6; k++) W.particles.push({ x: x + (Math.random() - 0.5) * 6, y, vx: (Math.random() - 0.5) * 1.2, vy: -Math.random() * 0.6, g: -0.01, life: 16 + Math.random() * 10, c: '#c3b2f2', a: 0.7 }); }
  function floatText(text, x, y, color) { W.particles.push({ x, y, vx: 0, vy: -0.6, g: 0, life: 50, text, c: color }); }

  let warping = false;
  function enterMinus() {
    if (warping || W.scene === 'minus') return;
    warping = true;
    N.Audio.sfx('glitch'); N.Audio.sfx('pipe');
    W.flash = 1; W.shake = 20;
    setTimeout(() => {
      warping = false;
      W.scene = 'minus'; S = scenes.minus; autoTarget = null;
      player.x = 40; player.y = GROUND; player.vx = 0; player.vy = 0; cam.x = 0; byte.x = 20;
      player.edge = 0;
      N.Store.data.minus = true; N.Store.save();
      N.Ach.unlock('minus');
      N.emit('district', S.districts[0]);
      N.UI.banner({ world: '-1', name: { en: 'World -1', zh: 'WORLD -1' }, sub: N.t('minus.sub') }, 'lime');
      N.UI.say({ en: 'Where are we? This is where unfinished projects go to rest.', zh: '这是哪？……这里是未完成项目的长眠之地。' }, 'byte');
    }, 300);
  }
  function exitMinus() {
    if (warping) return;
    warping = true;
    N.Audio.sfx('pipe');
    W.flash = 1;
    setTimeout(() => {
      warping = false;
      W.scene = 'main'; S = scenes.main; autoTarget = null;
      player.x = 70; player.y = GROUND - 60; player.vy = 0; cam.x = 0; byte.x = 50;
      curDistrict = null;
    }, 250);
  }

  /* ======================= update ======================= */
  function update() {
    W.t += 1 / 60; W.frame++;
    const p = player;
    const blocked = N.App && N.App.blocked();
    let move = 0;
    if (!blocked) {
      if (autoTarget) {
        const dx = autoTarget.x - p.x;
        if (Math.abs(dx) < 3) { const t = autoTarget; autoTarget = null; p.vx = 0; if (t.trig) { p.dir = t.trig.cx > p.x ? 1 : (t.trig.npc ? (t.trig.cx < p.x ? -1 : 1) : p.dir); t.trig.act(); } }
        else move = Math.sign(dx);
      }
      if (keys.left) { move = -1; autoTarget = null; }
      if (keys.right) { move = 1; autoTarget = null; }
    }
    const spd = keys.run ? 3.3 : autoTarget ? 2.8 : 2.0;
    p.vx += (move * spd - p.vx) * (p.onGround ? 0.3 : 0.14);
    if (Math.abs(p.vx) < 0.05) p.vx = 0;
    if (move) p.dir = move;

    // jumping
    if (pressed.jump && !blocked) {
      if (p.onGround) { p.vy = -5.1; p.onGround = false; p.jumps = 1; N.Audio.sfx('jump'); N.Ach.bump('jumps', 1, 25, 'bunny'); hintJump = true; }
      else if (p.jumps < 2 || p.god) { p.vy = -4.6; p.jumps = 2; N.Audio.sfx('djump'); puff(p.x, p.y); }
    }
    pressed.jump = false;
    if (!keys.jump && p.vy < -2.4) p.vy += 0.35; // short hop when released
    p.vy = Math.min(6, p.vy + 0.27);

    // horizontal
    p.x += p.vx;
    if (p.x < 8) {
      p.x = 8;
      if (W.scene === 'main' && keys.left && !blocked) {
        p.edge += 1 / 60;
        if (p.edge > 0.9 && p.edge < 0.92) N.UI.say(BYTE_LINES.edge, 'byte');
        W.shake = Math.max(W.shake, p.edge * 3);
        if (p.edge > 2.6) enterMinus();
      }
    } else p.edge = Math.max(0, p.edge - 0.05);
    if (p.x > S.width - 8) p.x = S.width - 8;
    p.walked += Math.abs(p.vx);
    if (p.walked > 600) N.Ach.unlock('steps');

    // vertical + collisions
    const prevY = p.y, wasGround = p.onGround;
    p.y += p.vy;
    p.onGround = false;
    if (p.vy >= 0) {
      if (p.y >= GROUND) { p.y = GROUND; land(wasGround); }
      else for (const pl of S.platforms) {
        if (p.x > pl.x - 3 && p.x < pl.x + pl.w + 3 && prevY <= pl.y + 0.5 && p.y >= pl.y) { p.y = pl.y; land(wasGround); break; }
      }
    } else {
      const head = (p.big ? 40 : 20);
      for (const b of S.blocks) {
        if (p.x > b.x - 4 && p.x < b.x + b.w + 4 && prevY - head >= b.y + b.h - 1 && p.y - head < b.y + b.h) { p.y = b.y + b.h + head; p.vy = 1.2; hitBlock(b); break; }
      }
    }
    function land(was) { if (!was && p.vy > 3) { puff(p.x, p.y); N.Audio.sfx('land'); } p.vy = 0; p.onGround = true; p.jumps = 0; }

    // animation & idle
    if (Math.abs(p.vx) > 0.3) { p.anim += Math.abs(p.vx); p.idle = 0; } else if (p.onGround) p.idle += 1 / 60;
    if (!p.onGround) p.idle = 0;
    if (p.big > 0) p.big--;
    if (S.homeSign && N.Fuse && S.homeSign.lit !== N.Fuse.fixed) {
      const hs = S.homeSign, sn = hs.art.neons[0];
      hs.lit = N.Fuse.fixed; sn.s = hs.art.buildSign(hs.lit);
      sn.halo = hs.lit / N.Fuse.total; sn.flicker = hs.lit >= N.Fuse.total ? 0 : 0.002;
    }
    if (signCheer && W.scene === 'main' && !blocked && curDistrict && curDistrict.id === 'home') {
      signCheer = false;
      const hs = scenes.main.homeSign, sn = hs.art.neons[0], gx = hs.x - hs.art.m + sn.x + 6, gy = GROUND - hs.art.canvas.height + sn.y;
      for (let k = 0; k < 24; k++) W.particles.push({ x: gx + Math.random() * 14, y: gy + Math.random() * sn.s.h, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.6, g: 0.06, life: 30 + Math.random() * 20, c: N.pick([C.magenta, C.magentaL, C.yellow]) });
      N.Audio.sfx('zap'); W.flash = 0.6;
      setTimeout(() => N.UI.say(BYTE_LINES.signOn, 'byte'), 500);
    }
    if (p.idle > 24 && p.idle < 24.02) N.UI.say(N.pick(BYTE_LINES.idle), 'byte');
    if (p.god && W.frame % 3 === 0) W.particles.push({ x: p.x + (Math.random() - 0.5) * 8, y: p.y - Math.random() * 18, vx: 0, vy: -0.3, g: 0, life: 20, c: N.pick([C.yellow, C.magenta, C.cyan]) });

    // camera
    const look = p.dir * 26;
    const target = N.clamp(p.x - VW * 0.45 + look, 0, Math.max(0, S.width - VW));
    cam.x += (target - cam.x) * 0.1;
    if (Math.abs(target - cam.x) < 0.1) cam.x = target;

    // BYTE follows
    byte.t += 1 / 60;
    const bx = p.x - p.dir * 16, by = p.y - (p.big ? 50 : 34) + Math.sin(byte.t * 2.4) * 2;
    byte.x += (bx - byte.x) * 0.06; byte.y += (by - byte.y) * 0.08;
    if (byte.moodT > 0) byte.moodT--; else byte.mood = 'a';

    // coins
    for (const c of S.coins) {
      if (c.taken) continue;
      if (Math.abs(c.x - p.x) < 8 && c.y > p.y - (p.big ? 44 : 24) && c.y < p.y + 2) { c.taken = true; addCoins(1); spark(c.x, c.y, C.yellow, 5); }
    }
    for (const b of S.blocks) if (b.bump > 0) b.bump--;

    // cats blink, hearts (a cat is in reach from up to 28px below, so the one on the mailbox can be petted from the street)
    for (const c of S.cats) { if (c.hearts > 0) { c.hearts--; if (c.hearts % 12 === 0) W.particles.push({ x: c.x + 5, y: c.y - 10, vx: 0, vy: -0.4, g: 0, life: 30, heart: true }); } }

    // triggers
    let best = null, bd = 1e9;
    for (const t of S.triggers) { if (!t.off && p.x >= t.x0 && p.x <= t.x1) { const d = Math.abs(p.x - t.cx); if (d < bd) { bd = d; best = t; } } }
    // nearby cat (same level)
    for (const c of S.cats) {
      if (Math.abs(c.x + 5 - p.x) < 12 && c.y - p.y < 14 && p.y - c.y < 28) { best = { cat: c, prompt: 'prompt.pet', label: 'CAT', cx: c.x + 5, py: c.y - 18, act: () => petCat(c) }; break; }
    }
    if (best !== activeTrig && !(best && activeTrig && best.cat && activeTrig.cat === best.cat)) activeTrig = best;
    // the delivery target swaps its usual prompt ("enter", "talk") for "deliver"
    const pk = activeTrig ? (isDrop(activeTrig) ? 'prompt.deliver' : activeTrig.prompt) : null;
    if (activeTrig !== lastPromptTrig || pk !== activeKey) { lastPromptTrig = activeTrig; activeKey = pk; N.emit('prompt', activeTrig ? { key: pk, label: activeTrig.project ? L(activeTrig.project.title) : N.label(activeTrig.label) } : null); }
    if (job && !blocked && W.scene === 'main') { if (--job.left <= 0) failJob(); else emitJob(); }
    if (pressed.act && !blocked) {
      if (activeTrig && isDrop(activeTrig)) deliver();
      else if (activeTrig) { activeTrig.act(); if (!activeTrig.quiet) N.Audio.sfx(activeTrig.npc || activeTrig.cat ? 'blip' : 'door'); }
    }
    pressed.act = false;

    // district change
    let d = S.districts[0];
    for (const di of S.districts) if (p.x >= di.x0) d = di;
    if (d !== curDistrict) {
      curDistrict = d; N.emit('district', d);
      if (W.scene === 'main' && !seenDistricts[d.id]) {
        seenDistricts[d.id] = true;
        if (d.id !== 'home') { N.UI.banner(d); if (BYTE_LINES[d.id]) setTimeout(() => N.UI.say(BYTE_LINES[d.id], 'byte'), 900); }
        if (d.id === 'arcade') setTimeout(() => N.UI.say(BYTE_LINES.eats, 'byte'), 7000);
        if (d.id === 'radio') setTimeout(() => { if (N.Fuse && N.Fuse.fixed < N.Fuse.total && curDistrict === d) N.UI.say(BYTE_LINES.fuse, 'byte'); }, 7000);
      }
    }

    // ambient systems
    updateAmbient();
    updateLaunch();
    for (const pt of W.particles) { if (pt.drag) { pt.vx *= pt.drag; pt.vy *= pt.drag; } pt.x += pt.vx; pt.y += pt.vy; pt.vy += pt.g || 0; pt.life--; }
    W.particles = W.particles.filter(pt => pt.life > 0);
    if (W.flash > 0) W.flash = Math.max(0, W.flash - 0.06);
    if (W.shake > 0) W.shake = Math.max(0, W.shake - 0.6);
  }
  let hintJump = false;

  let thunderT = 30 + Math.random() * 30, bolt = null;
  function updateAmbient() {
    // walkers
    for (const w of S.walkers) {
      w.x += w.dir * w.spd; w.t += w.spd * 0.08;
      if (w.x < -20) w.x = S.width + 10; if (w.x > S.width + 20) w.x = -10;
      // step aside near the player
      if (Math.abs(w.x - player.x) < 10 && Math.random() < 0.02) w.dir *= -1;
    }
    // flying cars
    for (const c of cars) {
      c.x += c.lane.d * c.spd;
      const base = cam.x * c.lane.f;
      if (c.lane.d > 0 && c.x > base + VW + 60) c.x = base - 40 - Math.random() * 200;
      if (c.lane.d < 0 && c.x < base - 60) c.x = base + VW + 40 + Math.random() * 200;
    }
    // train on the elevated line
    const tf = 0.5;
    if (!train.on) { train.wait -= 1 / 60; if (train.wait <= 0) { train.on = true; train.x = cam.x * tf + VW + 20; N.Audio.sfx('whoosh'); } }
    else { train.x -= 4.2; if (train.x < cam.x * tf - train.canvas.width - 40) { train.on = false; train.wait = 18 + Math.random() * 16; } }
    // weather
    const wet = N.Store.data.settings.rain;
    if (wet || W.weather === 'snow') for (const r of rain) {
      if (W.weather === 'snow') { r.y += r.v * 0.18; r.x += Math.sin(W.t + r.l) * 0.3 - 0.1; }
      else { r.y += r.v; r.x -= r.v * 0.18; }
      if (r.y > GROUND + 4 + (r.l * 7) % 40) {
        if (W.weather !== 'snow' && splashes.length < 60) splashes.push({ x: r.x, y: r.y, life: 8 });
        Object.assign(r, newDrop(false));
      }
    }
    for (const s of splashes) s.life--;
    splashes = splashes.filter(s => s.life > 0);
    // lightning
    thunderT -= 1 / 60;
    if (thunderT < 0 && wet && W.scene === 'main') {
      thunderT = 28 + Math.random() * 40;
      W.flash = N.reducedMotion ? 0.3 : 0.9;
      bolt = { x: 40 + Math.random() * (VW - 80), life: 10, seed: Math.random() };
      setTimeout(() => N.Audio.sfx('thunder'), 400 + Math.random() * 800);
    }
    if (bolt && --bolt.life <= 0) bolt = null;
  }

  /* ======================= render ======================= */
  function render() {
    const x = ctx;
    x.save();
    if (W.shake > 0 && !N.reducedMotion) x.translate(((Math.random() - 0.5) * W.shake) | 0, ((Math.random() - 0.5) * W.shake * 0.5) | 0);
    if (W.scene === 'minus') renderMinus(x);
    else renderMain(x);
    x.restore();
    if (W.flash > 0) { x.fillStyle = `rgba(230,220,255,${W.flash * 0.55})`; x.fillRect(0, 0, VW, VH); }
  }

  function renderMain(x) {
    const t = W.t, cx = cam.x;
    x.drawImage(skyC, 0, 0);
    // stars
    for (const s of stars) {
      const sx = ((s.x - cx * 0.02) % (VW + 40) + VW + 40) % (VW + 40) - 20;
      const b = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
      if (b > 0.25) { x.fillStyle = s.c; x.globalAlpha = b; x.fillRect(sx | 0, s.y | 0, 1, 1); }
    }
    x.globalAlpha = 1;
    drawMoon(x, t);
    if (bolt) drawBolt(x);
    // far skyline
    tileLayer(x, far.canvas, cx * 0.12, GROUND - 52 - far.canvas.height + 30);
    // hologram koi
    const kx = ((t * 9) % (VW + 260)) - 130, ky = 58 + Math.sin(t * 0.7) * 8;
    if (!(W.frame % 47 < 2)) { x.globalAlpha = 0.32 + Math.sin(t * 3) * 0.06; x.drawImage(koi, kx | 0, ky | 0); x.globalAlpha = 1; }
    // blimp with marquee
    drawBlimp(x, t);
    // mid skyline + neon strips + beacons
    const midY = GROUND - mid.canvas.height + 6;
    const mo = tileLayer(x, mid.canvas, cx * 0.3, midY);
    for (const st of mid.strips) for (const ox of mo) {
      const sx = ox + st.x, on = Math.sin(t * 2 + st.phase) > -0.9 && !(((W.frame + st.phase * 10) | 0) % 211 < 4);
      if (sx > -14 && sx < VW) x.drawImage(on ? st.on : st.off, sx | 0, (midY + st.y) | 0);
    }
    for (const b of mid.beacons) for (const ox of mo) {
      if ((t * 0.7 + b.x * 0.01) % 1.5 < 0.2) { const sx = ox + b.x; if (sx > 0 && sx < VW) { x.fillStyle = C.red; x.fillRect(sx | 0, (midY + b.y) | 0, 1, 1); x.fillStyle = P.rgba(C.red, 0.35); x.fillRect((sx - 1) | 0, (midY + b.y - 1) | 0, 3, 3); } }
    }
    drawCars(x, 0.45);
    drawTrack(x);
    drawCars(x, 1);
    // near layer
    for (const p of S.props) if (p.kind === 'crane') drawProp(x, p, t);
    for (const b of S.buildings) drawBuilding(x, b, t);
    for (const p of S.props) if (p.kind !== 'crane') drawProp(x, p, t);
    // sidewalk + road base
    const go = -(((cx % 64) + 64) % 64);
    for (let gx = go; gx < VW; gx += 64) x.drawImage(groundTile, gx | 0, GROUND);
    drawEntities(x, t);
    drawReflection(x, t);
    drawLampSpill(x);
    drawWeather(x);
    drawJob(x, t);
    drawPrompt(x, t);
  }

  function tileLayer(x, img, off, y) {
    const w = img.width, o = -(((off % w) + w) % w), out = [];
    for (let px = o; px < VW; px += w) { x.drawImage(img, px | 0, y | 0); out.push(px); }
    return out;
  }
  function drawMoon(x, t) {
    const mx = (VW * 0.8 - cam.x * 0.015) | 0, my = 30;
    P.ditherGlow(x, mx, my, 26, P.rgba(C.magentaL, 0.9), 0.22);
    x.fillStyle = '#fff2d8';
    for (let j = -11; j <= 11; j++) for (let i = -11; i <= 11; i++) {
      if (i * i + j * j > 121) continue;
      if ((i - 5) * (i - 5) + (j - 3) * (j - 3) < 80) continue; // crescent bite
      x.fillRect(mx + i, my + j, 1, 1);
    }
    if (moonWink > 0) { moonWink--; P.drawText(x, '^', mx - 6, my - 4, C.ink, { font: 3 }); }
  }
  let moonWink = 0;
  function drawBolt(x) {
    const r = N.seeded(bolt.seed * 1e6);
    let bx = bolt.x, by = 0;
    x.fillStyle = '#e8e2ff';
    while (by < 110) { const nx = bx + (r() - 0.5) * 10, ny = by + 4 + r() * 8; P.line(x, bx, by, nx, ny, '#ffffff'); bx = nx; by = ny; }
  }
  function drawBlimp(x, t) {
    const bx = ((VW + 300) - ((t * 5 + cam.x * 0.06) % (VW + 500))) | 0, by = 22 + Math.sin(t * 0.5) * 2;
    x.drawImage(blimp.canvas, bx, by | 0);
    const msg = N.DATA.profile.blimp || 'NEON-8';
    const tc = P.textCanvas(msg + '   ', C.yellow, { font: 3 });
    const sx = blimp.screen;
    x.save(); x.beginPath(); x.rect(bx + sx.x, (by | 0) + sx.y, sx.w, sx.h); x.clip();
    const off = (t * 18) % tc.width;
    x.drawImage(tc, (bx + sx.x - off) | 0, (by | 0) + sx.y + 1);
    x.drawImage(tc, (bx + sx.x - off + tc.width) | 0, (by | 0) + sx.y + 1);
    x.restore();
    // searchlight
    if (((t * 0.5) % 6) < 3) { x.fillStyle = P.rgba(C.yellowL, 0.05); x.beginPath(); x.moveTo(bx + 40, by + 28); x.lineTo(bx + 20 + Math.sin(t) * 30, GROUND); x.lineTo(bx + 60 + Math.sin(t) * 30, GROUND); x.fill(); }
  }
  function drawCars(x, layer) {
    for (const c of cars) {
      if ((c.lane.f < 0.5) !== (layer < 0.5)) continue;
      const sx = (c.x - cam.x * c.lane.f) | 0, sy = c.lane.y;
      if (sx < -20 || sx > VW + 20) continue;
      const d = c.lane.d;
      x.fillStyle = C.ink; x.fillRect(sx - 1, sy - 1, 12, 5);
      x.fillStyle = c.col; x.fillRect(sx, sy, 10, 3); x.fillRect(sx + 2, sy - 2, 6, 2);
      x.fillStyle = C.cyanL; x.fillRect(sx + 3, sy - 1, 4, 1);
      const front = d > 0 ? sx + 10 : sx - 1, back = d > 0 ? sx - 1 : sx + 10;
      x.fillStyle = C.yellowL; x.fillRect(front, sy + 1, 1, 1);
      x.fillStyle = P.rgba(C.yellowL, 0.25); x.fillRect(d > 0 ? front + 1 : front - 6, sy, 6, 3);
      x.fillStyle = C.red; x.fillRect(back, sy + 1, 1, 1);
      x.fillStyle = P.rgba(C.magenta, 0.6); x.fillRect(sx + 1, sy + 3, 8, 1);
    }
  }
  function drawTrack(x) {
    const f = 0.5, ty = 86, off = cam.x * f;
    x.fillStyle = '#1a0f3c'; x.fillRect(0, ty, VW, 5);
    x.fillStyle = '#2f1d66'; x.fillRect(0, ty, VW, 1);
    x.fillStyle = P.rgba(C.magenta, 0.5); x.fillRect(0, ty + 4, VW, 1);
    const po = -(((off % 150) + 150) % 150);
    for (let px = po; px < VW; px += 150) { x.fillStyle = '#170c36'; x.fillRect(px | 0, ty + 5, 6, 60); x.fillStyle = '#22134a'; x.fillRect(px | 0, ty + 5, 1, 60); }
    if (train.on) {
      const sx = (train.x - off) | 0;
      x.drawImage(train.canvas, sx, ty - train.canvas.height + 1);
      // motion streaks
      x.fillStyle = P.rgba(C.cyanL, 0.4);
      for (let k = 0; k < 5; k++) x.fillRect(sx + train.canvas.width + 4 + k * 7, ty - 6 - k * 3, 10, 1);
    }
  }

  function neonOn(b, i, n) {
    const st = b.neonState[i];
    if (W.mode.neon) return true;
    if (n.blink) return (W.t % n.blink) < n.blink * 0.65;
    if (st.off > 0) { st.off--; return st.off % 6 > 2 && st.off > 8 ? true : false; }
    if (Math.random() < n.flicker) { st.off = 6 + ((Math.random() * 18) | 0); if (Math.abs(b.x - player.x) < 160 && Math.random() < 0.4) N.Audio.sfx('buzz'); }
    return true;
  }

  function drawBuilding(x, b, t) {
    const a = b.art, sx = Math.round(b.x - cam.x - a.m), sy = GROUND - a.canvas.height;
    if (sx > VW || sx + a.canvas.width < 0) return;
    x.drawImage(a.canvas, sx, sy);
    const near = activeTrig && activeTrig.cx >= b.x && activeTrig.cx <= b.x + b.w;
    // tv flicker windows
    for (const w of a.wins) if (w.tv && w.lit) { x.fillStyle = P.rgba(N.pick([C.tv, C.cool, '#ffffff', C.blue]), 0.35 + Math.random() * 0.3); x.fillRect(sx + w.x, sy + w.y, w.w, w.h); }
    for (const bc of a.beacons) if ((t * 0.8 + b.x * 0.003) % 1.6 < 0.25) { x.fillStyle = C.red; x.fillRect(sx + bc.x, sy + bc.y, 1, 1); x.fillStyle = P.rgba(C.red, 0.35); x.fillRect(sx + bc.x - 1, sy + bc.y - 1, 3, 3); }
    // kind-specific dynamic layers
    if (b.kind === 'shop') drawScreen(x, b, sx + a.screen.x, sy + a.screen.y, a.screen.w, a.screen.h, t);
    if (b.kind === 'tower') { // revolving door
      const r = a.revolve, ang = t * 1.6;
      for (let k = 0; k < 3; k++) { const px = Math.cos(ang + k * 2.094) * (r.w / 2 - 2); x.fillStyle = Math.sin(ang + k * 2.094) > 0 ? '#5a7aa8' : '#2b2266'; x.fillRect(sx + r.x + r.w / 2 + px - 1, sy + r.y, 2, r.h); }
    }
    if (b.kind === 'arcade') {
      const mq = a.marquee;
      const ph = ((t * 10) | 0) % 2;
      for (let i = 0; i < mq.w; i += 4) { const on = ((i / 4) % 2) === ph; x.fillStyle = on ? C.yellowL : C.yellowD; x.fillRect(sx + mq.x + i, sy + mq.y, 2, 2); x.fillRect(sx + mq.x + mq.w - i - 2, sy + mq.y + mq.h - 2, 2, 2); }
      for (let j = 0; j < mq.h; j += 4) { const on = ((j / 4) % 2) !== ph; x.fillStyle = on ? C.yellowL : C.yellowD; x.fillRect(sx + mq.x, sy + mq.y + j, 2, 2); x.fillRect(sx + mq.x + mq.w - 2, sy + mq.y + j, 2, 2); }
      for (const cb of a.cabs) { x.fillStyle = N.pick([C.cyan, C.magenta, C.lime, C.yellow, C.blue]); if (W.frame % 8 === 0 || !cb.col) cb.col = x.fillStyle; x.fillStyle = cb.col; x.fillRect(sx + cb.x, sy + cb.y, cb.w, cb.h); }
      const rf = ((t * 2) | 0) % 2 ? a.roof.a : a.roof.b;
      x.drawImage(rf, sx + a.roof.x, sy + a.roof.y);
    }
    if (b.kind === 'site') {
      const bd = a.board, pw = bd.w - 6, fill = Math.round(pw * a.progress / 100);
      x.fillStyle = '#2a2050'; x.fillRect(sx + bd.x + 3, sy + bd.y + 11, pw, 6);
      x.fillStyle = a.color; x.fillRect(sx + bd.x + 3, sy + bd.y + 11, fill, 6);
      const sh = ((t * 30) | 0) % (pw + 10) - 5;
      if (sh > 0 && sh < fill) { x.fillStyle = '#ffffff'; x.fillRect(sx + bd.x + 3 + sh, sy + bd.y + 11, 2, 6); }
      P.drawText(x, a.progress + '%', sx + bd.x + bd.w - 3, sy + bd.y + 3, '#ffffff', { font: 3, align: 'right' });
      for (const l of a.lamps) if ((t + l.x * 0.01) % 1 < 0.5) { x.fillStyle = C.orange; x.fillRect(sx + l.x, sy + l.y, 2, 2); P.ditherGlow(x, sx + l.x + 1, sy + l.y + 1, 6, C.orange, 0.5); }
    }
    if (b.kind === 'lab') {
      const sw = a.studio;
      x.fillStyle = '#0a0618'; x.fillRect(sx + sw.x + 10, sy + sw.y + sw.h - 10, 8, 10); x.fillRect(sx + sw.x + 11, sy + sw.y + sw.h - 14, 6, 4);
      const mon = (W.frame % 30 < 15) ? C.cyan : C.cyanL;
      x.fillStyle = mon; x.fillRect(sx + sw.x + 22, sy + sw.y + sw.h - 14, 14, 9);
      x.fillStyle = C.ink; for (let k = 0; k < 3; k++) x.fillRect(sx + sw.x + 24, sy + sw.y + sw.h - 12 + k * 2, 4 + (((t * 7 + k * 3) | 0) % 8), 1);
      x.fillStyle = '#3a3a5a'; x.fillRect(sx + sw.x + 20, sy + sw.y + sw.h - 4, 30, 4);
      for (const po of a.posters) { const pic = posterPic(po.project, po.pw, po.ph - 16); if (pic) x.drawImage(pic, sx + po.px, sy + po.py); }
      for (const po of a.posters) if (activeTrig && activeTrig.project === po.project) { x.fillStyle = P.rgba(C.yellowL, 0.18 + Math.sin(t * 6) * 0.08); x.fillRect(sx + po.px - 3, sy + po.py - 3, po.pw + 6, po.ph + 6); }
    }
    if (b.kind === 'radio') {
      const wv = a.waves;
      for (let k = 0; k < 3; k++) {
        const r = ((t * 14 + k * 12) % 36) + 4;
        x.fillStyle = P.rgba(C.vio, 1 - r / 40);
        for (let ang = -2.4; ang < -0.7; ang += 0.12) x.fillRect((sx + wv.x + Math.cos(ang) * r) | 0, (sy + wv.y + Math.sin(ang) * r * 0.7) | 0, 1, 1);
        for (let ang = -2.4; ang < -0.7; ang += 0.12) x.fillRect((sx + wv.x - Math.cos(ang) * r) | 0, (sy + wv.y + Math.sin(ang) * r * 0.7) | 0, 1, 1);
      }
      if (N.Audio.music.current) { const jb = a.jukebox; x.fillStyle = N.pick([C.yellow, C.magenta, C.cyan]); x.fillRect(sx + jb.x + 2, sy + jb.y + 2, 14, 1); if (W.frame % 20 === 0) W.particles.push({ x: b.x + 30, y: GROUND - 30, vx: 0.3, vy: -0.5, g: 0, life: 50, note: true }); }
    }
    if (b.kind === 'wall') drawTag(x, sx + a.paint.x, sy + a.paint.y);
    if (b.kind === 'station') {
      const bd = a.board;
      const txt = 'ON TIME  PLATFORM 8  ';
      const tc = P.textCanvas(txt, C.orange, { font: 5 });
      x.save(); x.beginPath(); x.rect(sx + bd.x + 2, sy + bd.y + 2, bd.w - 4, bd.h - 4); x.clip();
      const off = (t * 20) % tc.width;
      x.drawImage(tc, (sx + bd.x + 4 - off) | 0, sy + bd.y + 6); x.drawImage(tc, (sx + bd.x + 4 - off + tc.width) | 0, sy + bd.y + 6);
      x.restore();
      const tr = b.trainCanvas;
      x.drawImage(tr, sx + a.m + a.trainX + Math.round(Math.sin(t * 3) * 0.4), sy + a.canvas.height + a.platY - tr.height - 2);
    }
    // neon signs
    a.neons.forEach((n, i) => {
      const on = neonOn(b, i, n);
      if (n.halo && on) P.ditherGlow(x, sx + n.x + n.s.w / 2, sy + n.y + n.s.h / 2, 18 + n.s.h * 0.6, C.magenta, 0.35 * n.halo);
      x.drawImage(on ? n.s.on : n.s.off, sx + n.x - n.s.pad, sy + n.y - n.s.pad);
    });
    // door glow when the player can enter
    if (near && a.door) { const dx = sx + a.m + a.door.x; P.ditherGlow(x, dx, GROUND - 14, 20, C.yellowL, 0.35 + Math.sin(t * 6) * 0.1); }
  }

  // a real poster image (posterImage) replaces the painted one on the lab wall, cropped to a portrait slice
  const posterCache = {};
  function posterPic(p, w, h) {
    if (!p.posterImage) return null;
    const src = L(p.posterImage), k = p.id + '|' + src;
    if (posterCache[k] !== undefined) return posterCache[k];
    posterCache[k] = null;
    const im = new Image();
    im.onload = () => {
      const { c, x } = P.canvas(w, h);
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      const sw = Math.min(im.width, im.height * w / h), cx = im.width * (p.posterFocus == null ? 0.5 : p.posterFocus);
      const sx = N.clamp(cx - sw / 2, 0, im.width - sw);
      x.drawImage(im, sx, 0, sw, im.height, 0, 0, w, h);
      posterCache[k] = c;
    };
    im.src = src;
    return null;
  }
  const coverCache = {};
  function coverImg(p) {
    // the shop window can show its own image (shopCover) instead of the detail-page cover
    const pic = p.shopCover || p.cover;
    if (!pic) return null;
    const src = L(pic), k = p.id + '|' + src;
    if (coverCache[k] === undefined) { const im = new Image(); im.src = src; coverCache[k] = null; im.onload = () => { coverCache[k] = im; }; }
    return coverCache[k];
  }
  function drawScreen(x, b, X, Y, w, h, t) {
    const p = b.project, [main] = P.NEONS[p.color] || P.NEONS.magenta;
    const img = coverImg(p);
    x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
    if (img) {
      x.imageSmoothingEnabled = true;
      const ih = img.height * (w / img.width);
      const off = ih > h ? ((t * 4) % (ih - h + 20)) : 0;
      x.drawImage(img, X, Y - Math.min(off, ih - h), w, ih);
      x.imageSmoothingEnabled = false;
    } else {
      // stylized mini website, seeded per project
      const r = N.seeded(p.id);
      x.fillStyle = '#efe9ff'; x.fillRect(X, Y, w, h);
      x.fillStyle = '#c9c0e8'; x.fillRect(X, Y, w, 3);
      x.fillStyle = C.red; x.fillRect(X + 1, Y + 1, 1, 1); x.fillStyle = C.yellow; x.fillRect(X + 3, Y + 1, 1, 1); x.fillStyle = C.lime; x.fillRect(X + 5, Y + 1, 1, 1);
      const scroll = (t * 6) % 40;
      let yy = Y + 4 - scroll;
      for (let k = 0; k < 8; k++) {
        const kind = (r() * 4) | 0;
        if (kind === 0) { x.fillStyle = main; x.fillRect(X + 2, yy, w - 4, 10); x.fillStyle = '#ffffff'; x.fillRect(X + 5, yy + 3, 18, 2); yy += 12; }
        else if (kind === 1) { x.fillStyle = '#8f86b3'; for (let l = 0; l < 3; l++) x.fillRect(X + 3, yy + l * 3, w - 8 - ((r() * 14) | 0), 1); yy += 10; }
        else if (kind === 2) { for (let q = 0; q < 3; q++) { x.fillStyle = q === 1 ? main : '#d6cff0'; x.fillRect(X + 3 + q * ((w - 6) / 3 | 0), yy, ((w - 6) / 3 | 0) - 2, 7); } yy += 9; }
        else { x.fillStyle = C.ink; x.fillRect(X + 3, yy, 14, 3); x.fillStyle = main; x.fillRect(X + w - 14, yy, 10, 4); yy += 7; }
      }
      // cursor
      const cxp = X + 6 + ((Math.sin(t * 0.9 + b.index) + 1) / 2) * (w - 14), cyp = Y + 8 + ((Math.cos(t * 0.7 + b.index) + 1) / 2) * (h - 14);
      x.drawImage(cursorSprite, cxp | 0, cyp | 0);
    }
    x.restore();
    // glass reflection
    x.fillStyle = 'rgba(255,255,255,0.12)'; for (let k = 0; k < h; k++) x.fillRect(X + ((k * 0.5) | 0) + w - 16, Y + k, 2, 1);
  }
  const cursorSprite = P.sprite(['k...', 'kk..', 'kwk.', 'kwwk', 'kkk.'], { k: C.ink, w: '#ffffff' });

  let tagCache = null, tagKey = '';
  function drawTag(x, X, Y) {
    const d = N.Store.data.paint;
    const key = d ? d.join(',') : '';
    if (key !== tagKey) {
      tagKey = key;
      if (!d) tagCache = null;
      else { const { c, x: tx } = P.canvas(32, 32); const pal = N.Paint ? N.Paint.PALETTE : []; d.forEach((v, i) => { if (v < 0) return; tx.fillStyle = pal[v] || '#fff'; tx.fillRect((i % 16) * 2, ((i / 16) | 0) * 2, 2, 2); }); tagCache = c; }
    }
    if (tagCache) x.drawImage(tagCache, X, Y);
    else { P.drawText(x, 'YOUR', X + 16, Y + 9, C.grey, { font: 3, align: 'center' }); P.drawText(x, 'TAG', X + 16, Y + 15, C.grey, { font: 3, align: 'center' }); P.drawText(x, 'HERE', X + 16, Y + 21, C.grey, { font: 3, align: 'center' }); }
  }

  let rocketArt = null;
  function drawLaunch(x, L0, sx, t) {
    if (sx > VW + 80 || sx < -90) { if (L0.state !== 'flight' && L0.state !== 'reload') return; }
    rocketArt = rocketArt || A.rocket();
    const G = GROUND;
    // scorch marks from past disasters
    for (const sc of L0.scorch) { x.fillStyle = 'rgba(10,6,24,0.55)'; for (let j = 0; j < 4; j++) { const hw = sc.r * (1 - j * 0.22); x.fillRect(Math.round(sx + sc.dx - hw), G - 2 + j, Math.round(hw * 2), 1); } }
    // gantry tower
    const gx = sx - 28, gTop = G - 84;
    x.fillStyle = '#3a3060'; x.fillRect(gx, gTop, 2, G - gTop); x.fillRect(gx + 10, gTop, 2, G - gTop);
    x.fillStyle = '#2a2250'; for (let yy = gTop; yy < G; yy += 8) { P.line(x, gx + 1, yy, gx + 11, yy + 8, '#4a4078'); x.fillRect(gx, yy, 12, 1); }
    x.fillStyle = '#4a4078'; x.fillRect(gx + 11, G - 52, 13, 2); x.fillRect(gx + 11, G - 30, 13, 2); // service arms
    if ((t * 1.2) % 1.4 < 0.3) { x.fillStyle = C.red; x.fillRect(gx + 5, gTop - 2, 2, 2); }
    x.drawImage(L0.sign.on, gx - 18 - L0.sign.pad, gTop - 18 - L0.sign.pad);
    // countdown board
    const bx = gx - 26, by = G - 62;
    x.fillStyle = C.ink; x.fillRect(bx, by, 22, 12); x.fillStyle = '#1a0d45'; x.fillRect(bx + 1, by + 1, 20, 10);
    const left = 3 - Math.floor(L0.t / 60);
    const txt = L0.state === 'count' ? 'T-' + Math.max(1, left) : L0.state === 'flight' ? 'GO' : L0.state === 'idle' ? 'RDY' : '---';
    P.drawText(x, txt, bx + 11, by + 4, L0.state === 'count' ? C.yellow : L0.state === 'flight' ? C.lime : C.grey, { font: 3, align: 'center' });
    x.fillStyle = '#3a3060'; x.fillRect(bx + 10, by + 12, 2, G - by - 12);
    // pad slab with hazard stripes
    x.fillStyle = C.ink; x.fillRect(sx - 19, G - 7, 38, 7);
    x.fillStyle = '#5d4d7a'; x.fillRect(sx - 18, G - 6, 36, 6);
    for (let i = 0; i < 36; i += 6) { x.fillStyle = C.yellow; x.fillRect(sx - 18 + i, G - 6, 3, 1); x.fillStyle = C.ink; x.fillRect(sx - 15 + i, G - 6, 3, 1); }
    // the rocket: on the pad, in flight, or being lowered back by the crane
    if (L0.state !== 'wait') {
      const ry = Math.round(L0.y), rx = Math.round(sx - rocketArt.width / 2);
      if (L0.state === 'reload') { x.fillStyle = '#8a86a8'; x.fillRect(sx, 0, 1, Math.max(0, ry - rocketArt.height)); }
      if (L0.state === 'flight') {
        const fl = 8 + Math.random() * 8;
        x.fillStyle = C.orange; x.fillRect(sx - 3, ry, 6, fl | 0); x.fillStyle = C.yellow; x.fillRect(sx - 2, ry, 4, (fl * 0.7) | 0); x.fillStyle = '#ffffff'; x.fillRect(sx - 1, ry, 2, (fl * 0.35) | 0);
        P.ditherGlow(x, sx, ry + 4, 16, C.orange, 0.5);
      }
      x.drawImage(rocketArt, rx, ry - rocketArt.height);
    }
    // the big red button, with a safety cover
    const px = sx + 38;
    x.fillStyle = C.ink; x.fillRect(px + 4, G - 14, 4, 14); x.fillStyle = '#5d4d7a'; x.fillRect(px + 5, G - 14, 2, 14);
    x.fillStyle = C.ink; x.fillRect(px, G - 20, 12, 7); x.fillStyle = '#3a3060'; x.fillRect(px + 1, G - 19, 10, 5);
    const hot = L0.state === 'count' && (W.frame >> 3) % 2;
    x.fillStyle = hot ? '#ff8095' : C.red; x.fillRect(px + 3, G - 22, 6, 3); x.fillStyle = C.redD; x.fillRect(px + 3, G - 20, 6, 1);
    if (L0.state === 'idle') { // closed cover
      x.fillStyle = 'rgba(255,217,59,0.55)'; x.fillRect(px + 1, G - 24, 10, 5);
      for (let i = 0; i < 10; i += 4) { x.fillStyle = C.ink; x.fillRect(px + 1 + i, G - 24, 2, 1); }
    } else { // flipped up
      x.fillStyle = 'rgba(255,217,59,0.55)'; x.fillRect(px + 10, G - 32, 2, 10);
    }
  }
  function drawProp(x, p, t) {
    const sx = Math.round(p.x - cam.x);
    if (p.kind === 'endwall') {
      const ex = p.right ? sx : sx - 30;
      if (ex > VW || ex + 50 < 0) return;
      x.fillStyle = '#1a0c3a'; x.fillRect(ex, GROUND - 120, 40, 120);
      x.fillStyle = '#24124f'; for (let j = 0; j < 120; j += 4) x.fillRect(ex, GROUND - 120 + j, 40, 1);
      P.drawText(x, p.right ? 'END' : '?', ex + 20, GROUND - 60, P.rgba(C.lav, 0.6), { font: 3, align: 'center' });
      return;
    }
    if (p.kind === 'arch') {
      if (sx > VW || sx + 40 < 0) return;
      x.fillStyle = '#2a2060'; x.fillRect(sx, GROUND - 70, 3, 70); x.fillRect(sx + 26, GROUND - 70, 3, 70);
      const sg = p.sign || (p.sign = A.neonBox(p.label, 'cyan', { font: 3, padIn: 2 }));
      x.drawImage(sg.on, sx + 15 - sg.w / 2 - sg.pad, GROUND - 78 - sg.pad);
      return;
    }
    if (p.kind === 'launch') return drawLaunch(x, p.pad, sx, t);
    if (p.kind === 'crane') {
      const cw = p.canvas.width;
      if (sx > VW || sx + cw < 0) return;
      x.drawImage(p.canvas, sx, GROUND - p.canvas.height);
      const hx = sx + p.hookX + Math.sin(t * 0.8) * 4, top = GROUND - p.canvas.height + 21, len = 60 + Math.sin(t * 0.4) * 6;
      x.fillStyle = '#8a86a8'; x.fillRect(hx | 0, top, 1, len | 0);
      x.fillStyle = C.ink; x.fillRect((hx - 9) | 0, (top + len) | 0, 19, 10);
      x.fillStyle = '#4a4268'; x.fillRect((hx - 8) | 0, (top + len + 1) | 0, 17, 8);
      P.drawText(x, '</>', hx | 0, (top + len + 3) | 0, C.cyan, { font: 3, align: 'center' });
      return;
    }
    if (!p.canvas) return;
    const w = p.canvas.width, h = p.canvas.height;
    if (sx > VW + 30 || sx + w < -30) return;
    if (p.kind === 'lamp') {
      x.drawImage(p.canvas, sx, p.y - h);
      const flick = Math.random() < 0.004 ? 0 : 1;
      if (flick) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.5; x.drawImage(p.cone, sx + p.head.x - p.cone.width / 2, p.y - h + p.head.y); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
      return;
    }
    x.drawImage(p.canvas, sx, p.y - h);
    if (p.kind === 'fuse' && N.Fuse) {
      if (N.Fuse.fixed < N.Fuse.total) { if (Math.random() < 0.05) W.particles.push({ x: p.x + 2 + Math.random() * 6, y: p.y - h + 6, vx: (Math.random() - 0.5) * 1.5, vy: -Math.random() * 1.5, g: 0.1, life: 14, c: N.pick([C.yellow, C.cyanL]) }); }
      else { x.fillStyle = C.lime; x.fillRect(sx + 7, p.y - h + 2, 1, 1); }
    }
    if (p.kind === 'vending') { if (W.frame % 90 < 84) { x.fillStyle = P.rgba(C.cyanL, 0.12); x.fillRect(sx + 3, p.y - h + 5, 12, 22); } }
  }

  function drawEntities(x, t) {
    // pedestrians (behind)
    for (const w of S.walkers) {
      const sx = Math.round(w.x - cam.x); if (sx < -20 || sx > VW + 20) continue;
      const fr = SP.walkers[w.kind][((w.t * 4) | 0) % 2 ? 'a' : 'b'][w.dir > 0 ? 'r' : 'l'];
      x.drawImage(fr, sx - 5, GROUND - 16 - 1);
      if (w.umb && N.Store.data.settings.rain) {
        const [main] = P.NEONS[w.umb];
        const ux = sx, uy = GROUND - 25;
        x.fillStyle = P.rgba(main, 0.35); x.fillRect(ux - 8, uy - 1, 17, 1);
        for (let i = -8; i <= 8; i++) { const yy = uy - Math.round(Math.sqrt(Math.max(0, 64 - i * i)) * 0.45); x.fillStyle = '#1a1040'; x.fillRect(ux + i, yy, 1, uy - yy); x.fillStyle = main; x.fillRect(ux + i, yy, 1, 1); }
        x.fillStyle = main; x.fillRect(ux, uy, 1, 9);
        x.fillStyle = P.rgba(main, 0.5); x.fillRect(ux - 8, uy, 1, 1); x.fillRect(ux + 8, uy, 1, 1);
      }
    }
    // blocks
    for (const b of S.blocks) {
      const sx = Math.round(b.x - cam.x); if (sx < -12 || sx > VW + 12) continue;
      const by = b.y - (b.bump > 0 ? Math.round(Math.sin(b.bump / 8 * Math.PI) * 3) : 0);
      x.drawImage(b.used ? SP.icon.qblockUsed : SP.icon.qblock, sx, by);
      if (!b.used && W.frame % 60 < 30) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(sx + 1, by + 1, 8, 1); }
    }
    // deco (minus world)
    for (const d of S.deco) drawDeco(x, d, t);
    // npcs
    for (const n of S.npcs) {
      const sx = Math.round(n.x - cam.x); if (sx < -20 || sx > VW + 20) continue;
      const near = Math.abs(player.x - n.x) < 40;
      const dir = near ? (player.x < n.x ? -1 : 1) : n.dir;
      const spr = SP.npc[n.kind];
      const bob = (W.frame + n.x) % 80 < 40 ? 0 : 1;
      x.drawImage(dir > 0 ? spr.r : spr.l, sx - 5, GROUND - spr.r.height + bob);
      if (n.kind === 'robot') { x.fillStyle = C.orange; x.fillRect(sx + (dir > 0 ? 6 : -9), GROUND - 7, 3, 7); x.fillStyle = '#fff'; x.fillRect(sx + (dir > 0 ? 6 : -9), GROUND - 5, 3, 1); }
    }
    // cats
    for (const c of S.cats) {
      const sx = Math.round(c.x - cam.x); if (sx < -12 || sx > VW + 12) continue;
      const blink = (W.frame + c.x * 7) % 200 < 8;
      const spr = SP.cats[c.kind];
      x.drawImage(blink ? spr.b : spr.a, sx, c.y - 9);
      if (N.Store.data.cats[c.id]) { x.fillStyle = C.magenta; x.fillRect(sx + 4, c.y - 12, 1, 1); }
    }
    // coins
    for (const c of S.coins) {
      if (c.taken) continue;
      const sx = Math.round(c.x - cam.x); if (sx < -10 || sx > VW + 10) continue;
      const fr = SP.coin[((W.t * 8 + c.ph) | 0) % SP.coin.length];
      x.drawImage(fr, sx - 4, Math.round(c.y - 4 + Math.sin(W.t * 3 + c.ph) * 1.5));
    }
    drawPlayer(x, t);
    drawByte(x, t);
    if (job && W.scene === 'main') drawBowl(x, t);
    // particles
    for (const pt of W.particles) {
      const sx = Math.round(pt.x - cam.x), sy = Math.round(pt.y);
      if (pt.coin) { x.drawImage(SP.coin[(W.frame >> 1) % SP.coin.length], sx - 4, sy - 4); continue; }
      if (pt.text) { const tc = P.textCanvas(pt.text, pt.c, { font: 5, shadow: C.ink }); x.drawImage(tc, sx - (tc.width >> 1), sy); continue; }
      if (pt.heart) { x.drawImage(SP.icon.heart, sx - 3, sy); continue; }
      if (pt.note) { x.drawImage(SP.icon.note, sx, sy); continue; }
      if (pt.z) { P.drawText(x, 'Z', sx, sy, C.lilac, { font: 3 }); continue; }
      x.globalAlpha = Math.min(1, pt.life / 12) * (pt.a || 1);
      // firework sparks get a soft halo and twinkle as they fade
      if (pt.spark) { if (pt.life < 24 && (W.frame + (pt.x | 0)) % 3 === 0) { x.globalAlpha = 1; continue; } x.globalAlpha *= 0.28; x.fillStyle = pt.c; x.fillRect(sx - 1, sy - 1, 4, 4); x.globalAlpha = Math.min(1, pt.life / 12); }
      x.fillStyle = pt.c; x.fillRect(sx, sy, pt.size || 1, pt.size || 1);
      x.globalAlpha = 1;
    }
  }

  function drawBowl(x, t) {
    const sx = Math.round(player.x - cam.x), sy = Math.round(player.y) - (player.big > 0 ? 46 : 26);
    x.fillStyle = C.ink; x.fillRect(sx - 5, sy, 10, 5);
    x.fillStyle = '#ffffff'; x.fillRect(sx - 4, sy, 8, 4); x.fillStyle = C.red; x.fillRect(sx - 4, sy + 2, 8, 1);
    x.fillStyle = C.yellow; x.fillRect(sx - 3, sy - 1, 6, 1);
    if (W.frame % 10 === 0) W.particles.push({ x: player.x + (Math.random() - 0.5) * 6, y: sy - 2, vx: 0, vy: -0.3, g: 0, life: 24, c: '#e8e2f4', a: 0.6 });
  }
  function drawJob(x, t) {
    if (!job || W.scene !== 'main' || (N.App && N.App.blocked())) return;
    const tx = Math.round(job.target.cx - cam.x), urgent = job.left < 10 * 60 && (W.frame >> 3) % 2;
    const col = urgent ? C.red : C.orange;
    if (tx >= 6 && tx <= VW - 6) {
      const ty = job.target.py - 14 + Math.round(Math.sin(t * 6) * 2);
      P.drawText(x, '▼', tx, ty, col, { align: 'center' });
      return;
    }
    const left = tx < 6, ax = left ? 6 : VW - 12, ay = 120;
    const m = Math.round(Math.abs(job.target.cx - player.x) / 10) + 'M';
    x.fillStyle = 'rgba(10,6,24,0.8)'; x.fillRect(left ? 2 : VW - 34, ay - 4, 32, 16);
    P.drawText(x, left ? '◀' : '▶', ax, ay, col);
    P.drawText(x, m, left ? 12 : VW - 30, ay + 1, '#ffffff', { font: 3 });
  }
  function drawPlayer(x, t) {
    const p = player;
    let fr = 'idle';
    if (!p.onGround) fr = p.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(p.vx) > 0.3) fr = 'walk' + (((p.anim / 7) | 0) % 4);
    else if (p.idle > 26) fr = 'sit';
    else if ((W.frame % 220) < 7) fr = 'blink';
    if (p.god) fr = 'gold_' + fr;
    const spr = SP.player[fr] || SP.player.idle;
    const img = p.dir > 0 ? spr.r : spr.l;
    const bob = fr.includes('walk1') || fr.includes('walk3') ? -1 : 0;
    const sx = Math.round(p.x - cam.x);
    // shadow
    x.fillStyle = 'rgba(0,0,0,0.35)'; const shw = p.onGround ? 10 : 6; x.fillRect(sx - shw / 2, GROUND - 1 + (p.y < GROUND - 1 ? 0 : 0), shw, 1);
    if (p.big > 0 && !(p.big < 120 && W.frame % 8 < 4)) x.drawImage(img, sx - 13, Math.round(p.y) - 40 + bob * 2, img.width * 2, img.height * 2);
    else x.drawImage(img, sx - 6, Math.round(p.y) - 20 + bob);
    if (fr.endsWith('sit') && W.frame % 50 === 0) W.particles.push({ x: p.x + 4, y: p.y - 20, vx: 0.2, vy: -0.4, g: 0, life: 60, z: true });
  }
  function drawByte(x, t) {
    const sx = Math.round(byte.x - cam.x), sy = Math.round(byte.y);
    const img = byte.mood === 'happy' ? SP.byte.happy : ((W.frame % 180) < 6 ? SP.byte.blink : SP.byte.a);
    x.drawImage(img, sx - 5, sy - 4);
    const fl = W.frame % 4 < 2;
    x.fillStyle = fl ? C.magenta : C.orange; x.fillRect(sx - 3, sy + 5, 1, fl ? 2 : 1); x.fillRect(sx + 2, sy + 5, 1, fl ? 1 : 2);
    P.ditherGlow(x, sx, sy + 2, 9, P.rgba(C.cyan, 1), 0.12);
  }

  function drawDeco(x, d, t) {
    const sx = Math.round(d.x - cam.x);
    if (d.kind === 'tomb') {
      x.drawImage(SP.icon.tomb, sx - 2, GROUND - 8, 18, 16);
      x.fillStyle = C.ink; x.fillRect(sx - 2, GROUND - 26, 18, 18);
      x.fillStyle = '#3a3a5a'; x.fillRect(sx - 1, GROUND - 25, 16, 17); x.fillRect(sx + 1, GROUND - 27, 12, 2);
      P.drawText(x, 'RIP', sx + 7, GROUND - 22, C.lime, { font: 3, align: 'center' });
      P.drawText(x, d.data.name.slice(0, 14), sx + 7, GROUND - 40, P.rgba(C.lime, 0.7), { font: 3, align: 'center' });
    } else if (d.kind === 'pipe') {
      x.fillStyle = C.ink; x.fillRect(sx - 1, GROUND - 30, 22, 30);
      x.fillStyle = C.limeD; x.fillRect(sx, GROUND - 26, 20, 26); x.fillStyle = C.lime; x.fillRect(sx + 3, GROUND - 26, 3, 26);
      x.fillStyle = C.ink; x.fillRect(sx - 3, GROUND - 32, 26, 8);
      x.fillStyle = C.limeD; x.fillRect(sx - 2, GROUND - 31, 24, 6); x.fillStyle = C.lime; x.fillRect(sx + 1, GROUND - 31, 3, 6);
    } else if (d.kind === 'ledge') {
      x.fillStyle = C.limeD; x.fillRect(sx, d.y, d.w, 3); x.fillStyle = C.lime; x.fillRect(sx, d.y, d.w, 1);
    }
  }

  function drawReflection(x, t) {
    const RH = VH - ROAD_Y;
    reflX.clearRect(0, 0, VW, RH);
    for (let r = 0; r < RH; r++) {
      const sy = GROUND - 2 - Math.floor(r * 1.8);
      if (sy < 0) break;
      const off = Math.round(Math.sin(t * 2.2 + r * 0.8) * (r / RH) * 2.2);
      reflX.drawImage(canvas, 0, sy, VW, 1, off, r, VW, 1);
    }
    reflX.globalCompositeOperation = 'source-atop';
    reflX.fillStyle = 'rgba(30,10,90,0.45)'; reflX.fillRect(0, 0, VW, RH);
    reflX.globalCompositeOperation = 'source-over';
    x.globalAlpha = 0.22; x.drawImage(reflC, 0, ROAD_Y); x.globalAlpha = 1;
    // puddles: stronger reflection inside puddle shapes
    pudX.clearRect(0, 0, VW, RH);
    const po = -(((cam.x % pudMask.width) + pudMask.width) % pudMask.width);
    for (let px = po; px < VW; px += pudMask.width) pudX.drawImage(pudMask, px | 0, 0);
    pudX.globalCompositeOperation = 'source-in';
    pudX.drawImage(reflC, 0, 0);
    pudX.globalCompositeOperation = 'source-over';
    x.globalAlpha = 0.75; x.drawImage(pudC, 0, ROAD_Y); x.globalAlpha = 1;
    // lane dashes over reflection
    const lo = -(((cam.x % 64) + 64) % 64);
    x.fillStyle = 'rgba(255,217,59,0.18)';
    for (let lx = lo; lx < VW; lx += 32) x.fillRect((lx + 4) | 0, ROAD_Y + 16, 14, 1);
  }
  function drawLampSpill(x) {
    // warm pools on the sidewalk under each lamp
    for (const p of S.props) {
      if (p.kind !== 'lamp') continue;
      const sx = Math.round(p.x - cam.x) + p.head.x;
      if (sx < -30 || sx > VW + 30) continue;
      x.globalCompositeOperation = 'lighter';
      P.ditherGlow(x, sx, GROUND + 4, 18, P.rgba(C.warm, 0.8), 0.25);
      x.globalCompositeOperation = 'source-over';
    }
  }
  function drawWeather(x) {
    const s = N.Store.data.settings;
    if (W.weather === 'snow') {
      x.fillStyle = 'rgba(244,236,255,0.85)';
      for (const r of rain) x.fillRect(r.x | 0, r.y | 0, r.l > 4 ? 2 : 1, r.l > 4 ? 2 : 1);
      return;
    }
    if (W.mode.matrix) {
      x.fillStyle = C.lime;
      for (const r of rain) { x.globalAlpha = 0.5; P.drawText(x, String.fromCharCode(65 + ((r.x * 7 + r.y) | 0) % 26), r.x | 0, r.y | 0, C.lime, { font: 3 }); }
      x.globalAlpha = 1; return;
    }
    if (!s.rain) return;
    x.fillStyle = 'rgba(170,190,255,0.38)';
    for (const r of rain) { for (let k = 0; k < r.l; k++) x.fillRect((r.x + k * 0.2) | 0, (r.y - k) | 0, 1, 1); }
    x.fillStyle = 'rgba(200,215,255,0.5)';
    for (const s2 of splashes) { const k = 8 - s2.life; x.fillRect((s2.x - k * 0.6) | 0, (s2.y - k * 0.4) | 0, 1, 1); x.fillRect((s2.x + k * 0.6) | 0, (s2.y - k * 0.4) | 0, 1, 1); }
  }
  function drawPrompt(x, t) {
    if (!activeTrig || (N.App && N.App.blocked())) return;
    const sx = Math.round(activeTrig.cx - cam.x), sy = Math.round(activeTrig.py + Math.sin(t * 6) * 2);
    const drop = isDrop(activeTrig), col = drop ? C.orange : C.yellow;
    const label = P.textCanvas('[F] ' + (drop ? 'DELIVER' : String(activeTrig.label || '').toUpperCase().slice(0, 12)), col, { font: 3 });
    x.fillStyle = 'rgba(10,6,24,0.8)'; x.fillRect(sx - (label.width >> 1) - 3, sy - 3, label.width + 5, label.height + 5);
    x.fillStyle = col; x.fillRect(sx - (label.width >> 1) - 3, sy + label.height + 1, label.width + 5, 1);
    x.drawImage(label, sx - (label.width >> 1), sy);
  }

  function renderMinus(x) {
    const t = W.t;
    x.fillStyle = '#020a04'; x.fillRect(0, 0, VW, VH);
    // glitch grid
    x.fillStyle = 'rgba(125,255,90,0.08)';
    const go = -((cam.x * 0.5) % 16);
    for (let gx = go; gx < VW; gx += 16) x.fillRect(gx | 0, 0, 1, GROUND);
    for (let gy = 0; gy < GROUND; gy += 16) x.fillRect(0, gy, VW, 1);
    for (let k = 0; k < 6; k++) { if (Math.random() < 0.3) { x.fillStyle = P.rgba(N.pick([C.lime, C.magenta, C.cyan]), 0.25); x.fillRect((Math.random() * VW) | 0, (Math.random() * GROUND) | 0, 10 + Math.random() * 40, 1 + Math.random() * 3); } }
    P.drawText(x, 'THANK YOU FOR VISITING!', VW / 2, 84, P.rgba(C.lime, 0.75), { font: 3, align: 'center' });
    P.drawText(x, 'BUT YOUR PROJECT IS IN ANOTHER CASTLE', VW / 2, 92, P.rgba(C.lime, 0.75), { font: 3, align: 'center' });
    // floor
    for (let gx = -((cam.x % 16) + 16) % 16 - 16; gx < VW; gx += 16) {
      x.fillStyle = '#0a2a10'; x.fillRect(gx | 0, GROUND, 16, VH - GROUND);
      x.fillStyle = C.limeD; x.fillRect(gx | 0, GROUND, 16, 1); x.fillRect(gx | 0, GROUND, 1, 8);
    }
    drawEntities(x, t);
    drawPrompt(x, t);
  }

  /* ======================= loop ======================= */
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!last) last = now;
    acc += Math.min(0.1, (now - last) / 1000); last = now;
    let n = 0;
    while (acc >= 1 / 60 && n < 4) { update(); acc -= 1 / 60; n++; }
    if (n) render();
  }

  /* ======================= input ======================= */
  const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ShiftLeft: 'run', ShiftRight: 'run' };
  function onKey(e, down) {
    if (!running) return;
    if (N.App && N.App.blocked()) { if (!down) { const k = KEYMAP[e.code]; if (k) keys[k] = false; if (e.code === 'Space' || e.code === 'KeyZ' || e.code === 'KeyK' || e.code === 'ArrowUp') keys.jump = false; } return; }
    const k = KEYMAP[e.code];
    if (k) { keys[k] = down; e.preventDefault(); return; }
    if ((e.code === 'Space' || e.code === 'Enter') && N.onControl && N.onControl(e)) return;
    if (e.code === 'Space' || e.code === 'KeyZ' || e.code === 'KeyK') { if (down && !keys.jump) pressed.jump = true; keys.jump = down; e.preventDefault(); return; }
    if (e.code === 'ArrowUp') {
      if (down && !keys.jump) pressed.jump = true;
      keys.jump = down;
      e.preventDefault(); return;
    }
    if (e.code === 'KeyF' && down && !e.repeat) { pressed.act = true; e.preventDefault(); }
  }
  function clearKeys() { for (const k in keys) keys[k] = false; }

  function toWorld(ev) {
    const r = canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / scale + cam.x, y: (ev.clientY - r.top) / scale };
  }
  function hitTest(wp) {
    // byte
    if (Math.abs(wp.x - byte.x) < 7 && Math.abs(wp.y - byte.y) < 7) return { byte: true };
    // moon
    const mx = VW * 0.8 - cam.x * 0.015 + cam.x;
    if (W.scene === 'main' && Math.hypot(wp.x - mx, wp.y - 30) < 12) return { moon: true };
    for (const c of S.cats) if (wp.x >= c.x - 2 && wp.x <= c.x + 13 && wp.y >= c.y - 12 && wp.y <= c.y + 2) return { cat: c };
    for (const cl of S.clicks) if (wp.x >= cl.x0 && wp.x <= cl.x1 && wp.y >= cl.y0 && wp.y <= cl.y1) return { trig: cl.t };
    return null;
  }
  function onClick(ev) {
    if (!running || (N.App && N.App.blocked())) return;
    N.Audio.init();
    const wp = toWorld(ev);
    const h = hitTest(wp);
    if (h && h.byte) { byte.mood = 'happy'; byte.moodT = 90; N.UI.say(N.pick(BYTE_LINES.poke), 'byte'); N.Audio.sfx('talk'); N.Ach.bump('pokes', 1, 5, 'poke'); return; }
    if (h && h.moon) { moonWink = 40; N.Audio.sfx('blip'); N.Ach.bump('moon', 1, 3, 'moon'); return; }
    if (h && h.cat) { if (Math.abs(h.cat.x - player.x) < 140) petCat(h.cat); else autoTarget = { x: h.cat.x + 5 }; return; }
    if (h && h.trig) { autoTarget = { x: h.trig.cx, trig: h.trig }; return; }
    autoTarget = { x: N.clamp(wp.x, 8, S.width - 8) };
  }
  function onMove(ev) {
    if (!running) return;
    const h = hitTest(toWorld(ev));
    canvas.style.cursor = h ? 'pointer' : 'default';
  }

  /* ======================= public API ======================= */
  N.World = {
    VH, GROUND,
    init(el) {
      canvas = el;
      buildBackdrop();
      scenes.main = buildMain(); scenes.minus = buildMinus();
      S = scenes.main;
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('keydown', e => onKey(e, true));
      window.addEventListener('keyup', e => onKey(e, false));
      window.addEventListener('blur', clearKeys);
      canvas.addEventListener('click', onClick);
      canvas.addEventListener('mousemove', onMove);
      let signFull = !!(N.Fuse && N.Fuse.fixed >= N.Fuse.total);
      N.on('sign', (n) => { const full = !!(N.Fuse && n >= N.Fuse.total); if (full && !signFull) signCheer = true; signFull = full; });
      N.on('lang', () => { activeTrig = null; lastPromptTrig = null; activeKey = null; N.emit('prompt', null); });
    },
    start() {
      if (running) return;
      running = true; last = 0; acc = 0;
      resize();
      raf = requestAnimationFrame(frame);
      if (!seenDistricts.home) {
        seenDistricts.home = true;
        const back = N.Store.data.visits > 1 && N.Store.data.coinsTotal > 0;
        setTimeout(() => N.UI.say(back ? BYTE_LINES.back : BYTE_LINES.intro, 'byte'), 700);
        setTimeout(() => { if (!hintJump) N.UI.say(BYTE_LINES.jump, 'byte'); }, 9000);
        setTimeout(() => { if (N.Fuse && N.Fuse.fixed === 0 && curDistrict && curDistrict.id === 'home') N.UI.say(BYTE_LINES.sign, 'byte'); }, 16000);
        const h = new Date().getHours();
        if (h < 5) { N.Ach.unlock('nightowl'); setTimeout(() => N.UI.say(BYTE_LINES.night, 'byte'), 15000); }
      }
    },
    stop() { running = false; cancelAnimationFrame(raf); clearKeys(); },
    get running() { return running; },
    resize,
    get scale() { return scale; },
    get cam() { return cam; },
    get player() { return player; },
    get byte() { return byte; },
    get districts() { return scenes.main ? scenes.main.districts : []; },
    get scene() { return W.scene; },
    get _scene() { return S; },
    get job() { return job; },
    get district() { return curDistrict; },
    toScreen(wx, wy) { const r = canvas.getBoundingClientRect(); return { x: r.left + (wx - cam.x) * scale, y: r.top + wy * scale }; },
    teleport(id) {
      if (job) { N.UI.say(EATS.teleport, 'byte'); N.Audio.sfx('error'); return; }
      if (id === 'minus') { if (W.scene !== 'minus') enterMinus(); return; }
      if (W.scene !== 'main') { W.scene = 'main'; S = scenes.main; curDistrict = null; }
      const d = scenes.main.districts.find(q => q.id === id); if (!d) return;
      N.Audio.sfx('whoosh');
      W.flash = 1;
      player.x = d.spawn; player.y = GROUND; player.vx = 0; player.vy = 0; autoTarget = null;
      cam.x = N.clamp(player.x - VW * 0.45, 0, Math.max(0, S.width - VW));
      byte.x = player.x - 16;
      N.Ach.unlock('travel');
    },
    walkTo(projectId) {
      if (W.scene !== 'main') { W.scene = 'main'; S = scenes.main; curDistrict = null; }
      const t = S.triggers.find(q => q.project && q.project.id === projectId);
      if (t) { player.x = t.cx - 30; cam.x = N.clamp(player.x - VW * 0.45, 0, S.width - VW); autoTarget = { x: t.cx }; }
    },
    // mobile controls
    press(k, down) {
      if (k === 'left' || k === 'right' || k === 'run') keys[k] = down;
      if (k === 'jump') { if (down && !keys.jump) pressed.jump = true; keys.jump = down; }
      if (k === 'act' && down) pressed.act = true;
    },
    egg(name, on) {
      if (name === 'god') { player.god = on == null ? !player.god : on; N.Audio.sfx('powerup'); spark(player.x, player.y - 10, C.yellow, 30); }
      else if (name === 'snow') { W.weather = W.weather === 'snow' ? 'rain' : 'snow'; }
      else if (name === 'rain') { N.Store.data.settings.rain = !N.Store.data.settings.rain; N.Store.save(); W.weather = 'rain'; N.emit('settings'); }
      else if (name === 'neon') { W.mode.neon = true; setTimeout(() => { W.mode.neon = false; }, 12000); }
      else if (name === 'matrix') { W.mode.matrix = !W.mode.matrix; }
      else if (name === 'thunder') { thunderT = 0; }
      else if (name === 'party') { for (let k = 0; k < 80; k++) W.particles.push({ x: cam.x + Math.random() * VW, y: -Math.random() * 60, vx: (Math.random() - 0.5) * 1.2, vy: 1 + Math.random() * 1.5, g: 0.02, life: 160, c: N.pick([C.magenta, C.cyan, C.yellow, C.lime, C.orange]), size: 2 }); }
      else if (name === 'coins') { addCoins(on || 1); }
    },
    talkByte(line) { N.UI.say(line, 'byte'); },
    lines: BYTE_LINES
  };
})();
