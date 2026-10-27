/* NEON-8 · EDDIE-OS terminal */
(function () {
  const N = window.NEON;
  const L = (v) => N.L(v), esc = N.esc;
  const zh = () => N.lang === 'zh';
  const T0 = Date.now();
  let api = null, out, inp, ps, cwd = '~', hist = [], hi = -1, busy = false, session = 0;
  // async commands check this so closing the terminal mid-animation can't leave it stuck
  const alive = (my) => my === session && !!api;

  /* ---------------- virtual file system ---------------- */
  function fs() {
    const p = N.DATA.profile;
    const projFiles = {};
    N.visibleProjects().forEach(pr => {
      const lines = [`# ${L(pr.title)}`, '', L(pr.summary), '', `type:   ${pr.type}`, `status: ${pr.status || ''}`, `year:   ${pr.year || ''}`, `tags:   ${(pr.tags || []).map(L).join(', ')}`];
      if (pr.progress != null && pr.type.startsWith('soon')) lines.push(`build:  ${bar(pr.progress)} ${pr.progress}%`);
      lines.push('', zh() ? `输入 open ${pr.id} 查看完整详情。` : `Type "open ${pr.id}" for the full story.`);
      projFiles[pr.id + '.md'] = lines.join('\n');
    });
    return {
      '~': {
        'about.txt': [`${L(p.fullName)}`, `${L(p.role)}`, `${L(p.location)}`, '', ...[].concat(L(p.bio) || []), '', `> ${L(p.status)}`].join('\n'),
        'skills.txt': (p.skills || []).map(s => `${L(s.name).padEnd(18, ' ')} ${'■'.repeat(s.level)}${'□'.repeat(5 - s.level)}`).join('\n'),
        'contact.txt': [`email    ${p.email}`, ...(p.links || []).map(l => `${L(l.label).toLowerCase().padEnd(8, ' ')} ${l.url}`)].join('\n'),
        'readme.md': zh()
          ? '欢迎来到 EDDIE-OS。\n\n这台机器上的一切都是一个作品集。\n输入 help 查看命令，ls 列出文件，cat 读取文件。\n提示：有些文件是隐藏的。'
          : 'Welcome to EDDIE-OS.\n\nEverything on this machine is a portfolio.\nType help for commands, ls to list files, cat to read them.\nHint: some files are hidden.',
        '.secret': zh()
          ? '你找到了隐藏文件。\n\n1. 在家门口一直往左走。\n2. 上上下下左右左右 B A。\n3. 走路的时候打字：neon、rain、snow、party、binary……\n4. 月亮会眨眼。'
          : 'You found the hidden file.\n\n1. Walk left from home. Keep walking.\n2. Up up down down left right left right B A.\n3. Type words while walking: neon, rain, snow, party, binary...\n4. The moon winks if you poke it.',
        projects: projFiles,
        games: Object.fromEntries(N.Games.list.map(g => [g.id, '#!game'])),
        secrets: { 'eggs.txt': '__eggs__', 'passwords.txt': 'hunter2\n\n...wait, you can see that?' }
      }
    };
  }
  const bar = (v) => '█'.repeat(Math.round(v / 10)) + '░'.repeat(10 - Math.round(v / 10));
  function resolve(path) {
    const root = fs();
    let parts = (path || '').replace(/^~\/?/, '').split('/').filter(Boolean);
    let base = cwd === '~' ? [] : cwd.replace(/^~\//, '').split('/');
    if ((path || '').startsWith('~') || (path || '').startsWith('/')) base = [];
    const stack = base.slice();
    for (const q of parts) { if (q === '..') stack.pop(); else if (q !== '.') stack.push(q); }
    let node = root['~'];
    for (const q of stack) { if (node && typeof node === 'object' && q in node) node = node[q]; else return { node: undefined, path: '~/' + stack.join('/') }; }
    return { node, path: stack.length ? '~/' + stack.join('/') : '~', name: stack[stack.length - 1] };
  }

  /* ---------------- output ---------------- */
  function print(text, cls = '') {
    const d = document.createElement('div');
    d.className = 'term-l ' + cls;
    d.textContent = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
    return d;
  }
  function printHTML(html, cls = '') { const d = document.createElement('div'); d.className = 'term-l ' + cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; return d; }
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  async function typeLines(lines, delay = 60, cls = '') {
    const my = session; busy = true;
    try { for (const l of lines) { if (!alive(my)) return false; print(l, cls); N.Audio.sfx('type'); await sleep(delay); } return alive(my); }
    finally { if (my === session) busy = false; }
  }

  /* ---------------- commands ---------------- */
  const HELP = [
    ['help', 'show this list', '显示命令列表'], ['ls [dir]', 'list files (try ls -a)', '列出文件（试试 ls -a）'], ['cd <dir>', 'change directory', '切换目录'],
    ['cat <file>', 'print a file', '读取文件'], ['open <project>', 'open a project window', '打开作品详情'], ['projects', 'list all projects', '列出全部作品'],
    ['whoami', 'who is this person', '这个人是谁'], ['neofetch', 'system info', '系统信息'], ['contact', 'copy my email', '复制我的邮箱'],
    ['play <game>', 'snake, breaker, invaders, commit, hex', '开街机游戏'], ['fuse', 'open the fuse box', '打开配电箱'], ['gacha', 'open the capsule machine', '打开扭蛋机'], ['goto <place>', 'fast travel in the city', '在城市里快速传送'],
    ['music [next|off]', 'change the radio', '切换音乐'], ['fortune', 'a random fun fact', '随机冷知识'], ['trophies', 'show achievements', '查看成就'],
    ['lang <en|zh>', 'switch language', '切换语言'], ['clear', 'clear the screen', '清屏'], ['exit', 'close the terminal', '关闭终端']
  ];
  const PLACES = ['home', 'web', 'corp', 'arcade', 'build', 'lab', 'exp', 'radio', 'station'];
  const CMDS = {
    help() {
      print(zh() ? '可用命令：' : 'Available commands:', 'hl');
      HELP.forEach(([c, en, z]) => print(`  ${c.padEnd(18, ' ')} ${zh() ? z : en}`));
      print(zh() ? '还有一些命令没写在这里。好奇心是一种技能。' : 'Some commands are not listed. Curiosity is a skill.', 'dim');
    },
    ls(args) {
      const all = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const target = args.find(a => !a.startsWith('-'));
      const r = resolve(target || '.');
      if (r.node === undefined) return print(`ls: ${target}: No such file or directory`, 'err');
      if (typeof r.node !== 'object') return print(target);
      const names = Object.keys(r.node).filter(n => all || !n.startsWith('.'));
      printHTML(names.map(n => typeof r.node[n] === 'object' ? `<span class="t-dir">${esc(n)}/</span>` : (r.node[n] === '#!game' ? `<span class="t-exe">${esc(n)}*</span>` : esc(n))).join('   '));
    },
    cd(args) {
      const target = args[0] || '~';
      const r = resolve(target);
      if (r.node === undefined || typeof r.node !== 'object') return print(`cd: ${target}: Not a directory`, 'err');
      if (r.path.endsWith('secrets')) return print(zh() ? 'cd: secrets: 权限不足（试试 sudo？）' : 'cd: secrets: Permission denied (sudo, maybe?)', 'err');
      cwd = r.path; updatePS();
    },
    pwd() { print('/home/guest' + cwd.slice(1)); },
    cat(args, sudo) {
      if (!args.length) return print('cat: missing file operand', 'err');
      args.forEach(a => {
        const r = resolve(a);
        if (r.node === undefined) return print(`cat: ${a}: No such file or directory`, 'err');
        if (typeof r.node === 'object') return print(`cat: ${a}: Is a directory`, 'err');
        if (r.path.includes('secrets') && !sudo) return print(`cat: ${a}: Permission denied`, 'err');
        if (r.node === '#!game') return print(zh() ? `${a} 是一个游戏，用 play ${r.name} 来玩。` : `${a} is a game. Run it with: play ${r.name}`, 'dim');
        if (r.node === '__eggs__') return eggsList();
        String(r.node).split('\n').forEach(l => print(l));
      });
    },
    open(args) {
      const id = (args[0] || '').replace(/\.md$/, '').replace(/^projects\//, '');
      const p = N.project(id);
      if (!p) return print(zh() ? `open: 找不到作品 "${id}"。输入 projects 查看列表。` : `open: no project called "${id}". Try: projects`, 'err');
      print(zh() ? `正在打开 ${L(p.title)}……` : `Opening ${L(p.title)}...`, 'ok');
      setTimeout(() => { close(true); N.UI.openProject(p.id); }, 250);
    },
    projects() {
      const groups = { web: zh() ? '网站与应用' : 'websites and apps', intern: zh() ? '实习' : 'internships', 'soon-web': zh() ? '施工中' : 'under construction', 'soon-game': zh() ? '游戏' : 'games', experiment: zh() ? '实验' : 'experiments' };
      if (N.Store.data.minus) groups.graveyard = zh() ? '墓地' : 'graveyard';
      Object.keys(groups).forEach(k => {
        const ps = N.projectsOf(k); if (!ps.length) return;
        print(`[${groups[k]}]`, 'hl');
        ps.forEach(p => print(`  ${p.id.padEnd(14, ' ')} ${L(p.title)}${p.progress != null && k.startsWith('soon') ? '  ' + bar(p.progress) + ' ' + p.progress + '%' : ''}`));
      });
      print(zh() ? '用 open <id> 打开。' : 'Open one with: open <id>', 'dim');
    },
    whoami() {
      const p = N.DATA.profile;
      print(`${(p.name || '').toUpperCase()}  ${L(p.role)}`, 'hl');
      print(L(p.tagline));
      print(L(p.location), 'dim');
      print(`> ${L(p.status)}`, 'ok');
    },
    neofetch() {
      const p = N.DATA.profile, D = N.Store.data;
      const logo = ['   ▄▄▄▄▄▄   ', '  █ ▀  ▀ █  ', '  █  ▄▄  █  ', '   ▀▀▀▀▀▀   ', '    ▀  ▀    '];
      const info = [
        `${'guest'}@neon-8`, '-------------',
        `OS:       EDDIE-OS 8.0 (neon)`, `Host:     ${(p.name || '').toUpperCase()}.EXE`, `Uptime:   ${uptime()}`,
        `Shell:    bytesh 0.8`, `Projects: ${N.mainProjects().length}`, `CPU:      Curiosity Core @ 8 MHz`,
        `Coins:    ${D.coins}`, `Cats:     ${Object.keys(D.cats).length}/5`, `Trophies: ${N.Ach.count()}/${N.Ach.total()}`
      ];
      for (let i = 0; i < info.length; i++) printHTML(`<span class="t-logo">${esc((logo[i] || '').padEnd(14, ' '))}</span>${esc(info[i])}`);
      printHTML('<span class="t-sw m"></span><span class="t-sw c"></span><span class="t-sw y"></span><span class="t-sw l"></span><span class="t-sw o"></span><span class="t-sw v"></span>');
    },
    date() { print(new Date().toString()); },
    uptime() { print('up ' + uptime()); },
    echo(args) { print(args.join(' ')); },
    history() { hist.slice().reverse().forEach((h, i) => print(`  ${String(i + 1).padStart(3, ' ')}  ${h}`)); },
    clear() { out.innerHTML = ''; },
    contact() { const e = N.DATA.profile.email; N.copy(e); print(zh() ? `已复制：${e}` : `Copied to clipboard: ${e}`, 'ok'); },
    email() { CMDS.contact(); },
    play(args) {
      const id = (args[0] || '').replace(/^games\//, '');
      if (!N.Games.list.find(g => g.id === id)) return print(zh() ? 'play: 可选游戏 ' + N.Games.list.map(g => g.id).join('、') : 'play: choose ' + N.Games.list.map(g => g.id).join(', '), 'err');
      print(zh() ? `正在启动 ${id}……投币！` : `Launching ${id}... insert coin!`, 'ok');
      setTimeout(() => { close(true); N.Arcade.open(id); }, 300);
    },
    goto(args) {
      const id = args[0];
      if (!PLACES.includes(id)) return print('goto: ' + PLACES.join(', '), 'err');
      setTimeout(() => { close(true); if (N.App.screen !== 'world') N.App.go('world'); setTimeout(() => N.World.teleport(id), 60); }, 200);
    },
    fuse() { close(true); N.Fuse.open(); },
    gacha() { close(true); N.Gacha.open(); },
    eats() { print(zh() ? `已送达 ${N.Store.data.deliveries || 0} 单，最高连送 ${N.Store.data.bestStreak || 0} 单。` : `${N.Store.data.deliveries || 0} deliveries, best streak ${N.Store.data.bestStreak || 0}.`); },
    map() { close(true); if (N.App.screen !== 'world') N.App.go('world'); setTimeout(() => N.UI.openMap(), 80); },
    quick() { close(true); N.App.go('list'); },
    list() { CMDS.quick(); },
    music(args) {
      const a = args[0];
      if (a === 'off') { N.Audio.music.stop(); return print('♪ off'); }
      if (a && N.Audio.music.tracks[a]) { N.Audio.music.play(a); return print('♪ ' + N.Audio.music.tracks[a].name); }
      const id = N.Audio.music.next(); print(id ? '♪ ' + N.Audio.music.tracks[id].name : '♪ off');
      N.Ach.unlock('dj');
    },
    fortune() { const f = N.pick(N.DATA.profile.funFacts || []); print(L(f) || '...', 'hl'); },
    trophies() { N.Ach.list.forEach(a => { const got = N.Ach.has(a.id); print(`${got ? '[★]' : '[ ]'} ${a.hidden && !got ? '???' : L(a.name)}`, got ? 'ok' : 'dim'); }); },
    cats() { print(`${Object.keys(N.Store.data.cats).length}/5 ` + (zh() ? '只猫' : 'cats found') + '  =^..^='); },
    coins() { print(`◎ ${N.Store.data.coins}`); },
    lang(args) { const l = args[0]; if (l !== 'en' && l !== 'zh') return print('lang: en | zh', 'err'); N.setLang(l); },
    crt(args) { const on = args[0] !== 'off'; N.Store.data.settings.crt = on; N.Store.save(); N.emit('settings'); print('crt ' + (on ? 'on' : 'off')); },
    rain() { N.World.egg('rain'); print('☂'); },
    snow() { N.World.egg('snow'); print('❄'); },
    matrix() { N.World.egg('matrix'); print(zh() ? '跟着白兔走。' : 'Follow the white rabbit.', 'ok'); N.Ach.unlock('words'); },
    party() { N.World.egg('party'); print('🎉 🎉 🎉'); },
    sudo(args) {
      const sub = args.join(' ');
      if (sub === 'collab') return collab();
      if (args[0] === 'cat') return CMDS.cat(args.slice(1), true);
      if (args[0] === 'rm') return rmrf();
      if (!sub) return print('usage: sudo <command>', 'err');
      print(zh() ? `guest 不在 sudoers 文件中。此事件将被报告给 BYTE。` : `guest is not in the sudoers file. This incident will be reported to BYTE.`, 'err');
    },
    collab() { print(zh() ? 'collab: 权限不足（试试 sudo？）' : 'collab: Permission denied (sudo, maybe?)', 'err'); },
    rm(args) { if (args.includes('-rf') || args.includes('-fr')) return rmrf(); print('rm: permission denied. Nice try.', 'err'); },
    sl() { steamLocomotive(); },
    coffee() {
      ['      ( (', '       ) )', '    ........', '    |      |]', '    \\      /', '     `----\''].forEach(l => print(l, 'hl'));
      print(zh() ? '+10 能量。咖啡因 +1%。' : '+10 energy. Caffeine +1%.', 'ok');
    },
    hack() { hack(); },
    ping() { print('pong'); },
    xyzzy() { print(zh() ? '什么也没发生。' : 'Nothing happens.'); },
    konami() { print('↑ ↑ ↓ ↓ ← → ← → B A', 'hl'); print(zh() ? '在城市里输入它。' : 'Enter it in the city.', 'dim'); },
    cowsay(args) { byteSay(args.join(' ') || (zh() ? '哞？我是无人机。' : 'moo? I am a drone.')); },
    bytesay(args) { byteSay(args.join(' ') || 'beep boop'); },
    man(args) { const h = HELP.find(x => x[0].split(' ')[0] === args[0]); print(h ? `${h[0]}: ${zh() ? h[2] : h[1]}` : `No manual entry for ${args[0] || '?'}`); },
    vim() { print(zh() ? '你进入了 vim。祝你好运退出。（开玩笑的）' : 'You are now in vim. Good luck getting out. (Just kidding.)', 'hl'); },
    emacs() { CMDS.vim(); },
    exit() { close(); },
    credits() { close(true); if (N.App.screen !== 'world') N.App.go('world'); setTimeout(() => N.Credits.play(), 100); },
    reset() { if (confirm(N.t('settings.resetConfirm'))) N.Store.reset(); },
    42() { print(zh() ? '生命、宇宙以及一切的答案。' : 'The answer to life, the universe and everything.'); }
  };

  function uptime() { const s = ((Date.now() - T0) / 1000) | 0; return `${(s / 60) | 0} min ${s % 60} s`; }
  function eggsList() {
    print(zh() ? '== 彩蛋清单（剧透警告）==' : '== EASTER EGGS (spoilers) ==', 'hl');
    N.Ach.list.filter(a => a.hidden).forEach(a => print(`- ${L(a.name)}: ${L(a.desc)}`));
  }
  function byteSay(msg) {
    const line = '-'.repeat(Math.min(40, msg.length + 2));
    [' ' + line, `< ${msg} >`, ' ' + line, '      \\', '       \\   ▄▄▄▄▄▄', '        \\ █ ▀  ▀ █', '          █  ▄▄  █', '           ▀▀▀▀▀▀'].forEach(l => print(l));
  }
  async function collab() {
    if (busy) return;
    const my = session;
    if (!await typeLines([zh() ? '[sudo] guest 的密码：********' : '[sudo] password for guest: ********', zh() ? '正在验证……' : 'Verifying...'], 300)) return;
    busy = true;
    try {
      for (let i = 0; i <= 10; i++) { if (!alive(my)) return; const l = out.lastElementChild && out.lastElementChild.classList.contains('bar') ? out.lastElementChild : print('', 'bar'); l.textContent = `[${'#'.repeat(i * 3).padEnd(30, '.')}] ${i * 10}%`; N.Audio.sfx('tick'); await sleep(90); }
    } finally { if (my === session) busy = false; }
    if (!await typeLines([zh() ? '已获得 root 权限。' : 'Root access granted.', zh() ? '正在起草合作提案……' : 'Drafting a pitch...', zh() ? '正在打开邮件客户端。' : 'Opening your mail client.'], 260, 'ok')) return;
    N.Ach.unlock('sudo');
    N.Audio.sfx('powerup');
    const p = N.DATA.profile;
    setTimeout(() => { location.href = `mailto:${p.email}?subject=${encodeURIComponent(zh() ? '一起做点东西？' : 'Let\'s build something?')}&body=${encodeURIComponent(zh() ? '你好 Eddie，\n\n我在你的霓虹城市里逛了一圈……' : 'Hi Eddie,\n\nI just walked around your neon city and...')}`; }, 600);
  }
  async function rmrf() {
    if (busy) return;
    busy = true;
    const my = session, win = api.win;
    try {
      const files = ['/bin', '/boot', '/etc/neon.conf', '/home/guest/about.txt', '/projects/startable', '/projects/renix', '/cats/black', '/cats/orange', '/usr/share/coffee', '/var/log/feelings', '/sys/byte'];
      for (const f of files) { if (!alive(my)) return; print(`removed '${f}'`, 'err'); N.Audio.sfx('type'); await sleep(70); }
      N.Audio.sfx('glitch');
      win.classList.add('glitch');
      await sleep(900);
      win.classList.remove('glitch');
      if (!alive(my)) return;
      out.innerHTML = '';
      print(zh() ? '……开玩笑的。什么都没删。请不要在真电脑上这么做。' : '...just kidding. Nothing was deleted. Please never do that on a real computer.', 'ok');
    } finally { win.classList.remove('glitch'); if (my === session) busy = false; }
  }
  async function hack() {
    if (busy) return;
    busy = true;
    const my = session;
    try {
      const L2 = ['Bypassing firewall...', 'Decrypting neon.db...', 'Downloading more RAM...', 'Reticulating splines...', 'Asking BYTE nicely...'];
      for (const l of L2) { print(l); for (let i = 0; i < 6; i++) { if (!alive(my)) return; print(Array.from({ length: 48 }, () => '0123456789ABCDEF'[(Math.random() * 16) | 0]).join(''), 'dim'); await sleep(30); } }
      print('ACCESS GRANTED', 'ok big');
      N.Audio.sfx('powerup');
    } finally { if (my === session) busy = false; }
  }
  async function steamLocomotive() {
    if (busy) return;
    busy = true;
    const art = ['      ====        ________                ___________ ', '  _D _|  |_______/        \\__I_I_____===__|_________| ', '   |(_)---  |   H\\________/ |   |        =|___ ___|   ', '   /     |  |   H  |  |     |   |         ||_| |_||   ', '  |      |  |   H  |__--------------------| [___] |   ', '  | ________|___H__/__|_____/[][]~\\_______|       |   ', '  |/ |   |-----------I_____I [][] []  D   |=======|__ ', '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ', ' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ', '  \\_/      \\O=====O=====O=====O_/      \\_/             '];
    const my = session;
    const box = print('', 'sl');
    const cols = 70;
    N.Audio.sfx('whoosh');
    try {
      for (let off = cols; off > -60; off -= 2) {
        if (!alive(my)) return;
        box.textContent = art.map(l => (off >= 0 ? ' '.repeat(off) + l : l.slice(-off)).slice(0, cols)).join('\n');
        await sleep(30);
      }
    } finally { box.remove(); if (my === session) busy = false; }
    if (!alive(my)) return;
    print(zh() ? '你是不是想输入 ls？（sl 是个经典的玩笑）' : 'Did you mean ls? (sl is a classic.)', 'dim');
  }

  /* ---------------- input ---------------- */
  function updatePS() { ps.textContent = `guest@neon-8:${cwd}$`; }
  function run(line) {
    const raw = line.trim();
    printHTML(`<span class="t-ps">${esc(ps.textContent)}</span> ${esc(raw)}`, 'cmd');
    if (!raw) return;
    hist.unshift(raw); hi = -1;
    const parts = raw.match(/"[^"]*"|\S+/g).map(s => s.replace(/^"|"$/g, ''));
    const name = parts[0].toLowerCase(), args = parts.slice(1);
    const fn = CMDS[name];
    if (fn) { try { fn(args); } catch (e) { print('error: ' + e.message, 'err'); } }
    else if (resolve(raw).node === '#!game' || resolve('games/' + raw).node === '#!game') CMDS.play([raw.replace(/^(\.\/)?(games\/)?/, '')]);
    else print(zh() ? `${name}：找不到命令。输入 help 查看帮助。` : `${name}: command not found. Type help.`, 'err');
  }
  function complete() {
    const v = inp.value, parts = v.split(' ');
    if (parts.length === 1) {
      const m = Object.keys(CMDS).filter(c => c.startsWith(parts[0]) && !/^\d/.test(c));
      if (m.length === 1) inp.value = m[0] + ' ';
      else if (m.length) print(m.join('  '), 'dim');
      return;
    }
    const last = parts[parts.length - 1];
    const dir = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '';
    const r = resolve(dir || '.');
    let names = r.node && typeof r.node === 'object' ? Object.keys(r.node) : [];
    if (parts[0] === 'open') names = names.concat(N.visibleProjects().map(p => p.id));
    if (parts[0] === 'play') names = names.concat(N.Games.list.map(g => g.id));
    if (parts[0] === 'goto') names = names.concat(PLACES);
    const base = last.slice(dir.length);
    const m = [...new Set(names)].filter(n => n.startsWith(base) && (base.startsWith('.') || !n.startsWith('.')));
    if (m.length === 1) { parts[parts.length - 1] = dir + m[0] + (r.node && typeof r.node[m[0]] === 'object' ? '/' : ''); inp.value = parts.join(' '); }
    else if (m.length) print(m.join('  '), 'dim');
  }

  function open() {
    if (api) return;
    N.Ach.unlock('terminal');
    api = N.UI.openWindow({
      id: 'term', cls: 'win--term', title: N.t('term.title'), trapTab: false,
      body: `<div class="term"><div class="term-out" role="log" aria-live="polite"></div><label class="term-line"><span class="term-ps"></span><input class="term-in" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command" autofocus></label></div>`,
      onOpen(a) {
        out = a.win.querySelector('.term-out'); inp = a.win.querySelector('.term-in'); ps = a.win.querySelector('.term-ps');
        updatePS();
        const p = N.DATA.profile;
        print(`EDDIE-OS 8.0 (tty1)`, 'dim');
        print(zh() ? `上次登录：${new Date(N.Store.data.firstVisit).toLocaleString('zh-CN')}  访问次数：${N.Store.data.visits}` : `Last login: ${new Date(N.Store.data.firstVisit).toLocaleString('en-US')}  visits: ${N.Store.data.visits}`, 'dim');
        print(N.t('term.hint'), 'hl');
        a.win.addEventListener('click', (e) => { if (!e.target.closest('button') && !window.getSelection().toString()) inp.focus(); });
        setTimeout(() => inp.focus(), 30);
      },
      onClose() { api = null; busy = false; session++; },
      onKey(e) {
        if (e.target !== inp) return false;
        if (e.key === 'Enter') { if (!busy) { run(inp.value); inp.value = ''; } return true; }
        if (e.key === 'Tab') { complete(); return true; }
        if (e.key === 'ArrowUp') { if (hist.length) { hi = Math.min(hist.length - 1, hi + 1); inp.value = hist[hi]; } return true; }
        if (e.key === 'ArrowDown') { hi = Math.max(-1, hi - 1); inp.value = hi >= 0 ? hist[hi] : ''; return true; }
        if (e.key === 'l' && e.ctrlKey) { out.innerHTML = ''; return true; }
        if (e.key.length === 1 && Math.random() < 0.5) N.Audio.sfx('type');
        return false;
      }
    });
  }
  function close(silent) { if (api) api.close(silent); }

  N.Term = { open, close, run: (c) => { open(); setTimeout(() => run(c), 50); } };
})();
