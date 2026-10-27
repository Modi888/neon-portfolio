/* NEON-8 · easter eggs: the konami code, secret words, and a console API */
(function () {
  const N = window.NEON;
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let kpos = 0, buf = '';
  const zh = () => N.lang === 'zh';

  // words avoid f (interact) and the m / l / h shortcuts so typing them never opens a window
  const WORDS = {
    neon: () => { N.World.egg('neon'); say({ en: 'All signs at full power for a moment.', zh: '所有招牌火力全开！' }); },
    rain: () => { N.World.egg('rain'); say(N.Store.data.settings.rain ? { en: 'Rain is back. Moody.', zh: '雨又下起来了，好有氛围。' } : { en: 'The rain stops. For now.', zh: '雨停了。暂时的。' }); },
    snow: () => { N.World.egg('snow'); say({ en: 'Snow in a neon city? Sure, why not.', zh: '霓虹城市下雪？有何不可。' }); },
    party: () => { N.World.egg('party'); party(); say({ en: 'PARTY MODE!', zh: '派对模式！' }); },
    binary: () => { N.World.egg('matrix'); say({ en: 'Wake up, visitor...', zh: '醒醒吧，访客……' }); },
    brew: () => { say({ en: '☕ +10 energy. You feel like you could ship anything.', zh: '☕ 能量 +10。你感觉什么都能上线。' }); N.Audio.sfx('powerup'); },
    jobs: () => { N.UI.openContact(); },
    purr: () => { N.Audio.sfx('meow'); say({ en: `Somewhere, a cat purrs back. ${Object.keys(N.Store.data.cats).length}/5 found.`, zh: `某处有只猫回应了你。已找到 ${Object.keys(N.Store.data.cats).length}/5。` }); },
    byte: () => { N.World.byte.mood = 'happy'; N.World.byte.moodT = 120; say({ en: "That's my name! Don't wear it out.", zh: '叫我干嘛！别叫坏了。' }); },
    zap: () => { N.World.egg('thunder'); },
    nyan: () => { N.World.egg('party'); say({ en: '=^..^= nyan nyan nyan', zh: '=^..^= 喵喵喵' }); }
  };
  function say(line) { if (N.World.running) N.UI.say(line, 'byte'); else N.UI.toast({ title: 'BYTE', text: N.L(line) }); }
  let partyT = 0;
  function party() {
    const cv = document.getElementById('city'); if (!cv || N.reducedMotion) return;
    clearInterval(partyT);
    let h = 0, n = 0;
    partyT = setInterval(() => { h = (h + 24) % 360; cv.style.filter = `hue-rotate(${h}deg) saturate(1.3)`; if (++n > 60) { clearInterval(partyT); cv.style.filter = ''; } }, 100);
  }

  function konami() {
    N.Ach.unlock('konami');
    N.Audio.sfx('powerup');
    N.UI.toast({ kind: 'ach', title: '↑↑↓↓←→←→BA', text: zh() ? '8-BIT 无敌模式：金色皮肤、无限跳、金币翻倍。' : '8-bit god mode: golden skin, infinite jumps, double coins.' });
    if (N.App.screen !== 'world') { N.App.go('world'); setTimeout(() => N.World.egg('god', true), 300); }
    else N.World.egg('god', true);
  }

  function onKey(e) {
    // konami works on any screen (except while typing)
    const tg = e.target;
    if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return;
    if (N.App.top()) { kpos = 0; return; }
    if (e.code === KONAMI[kpos]) { kpos++; if (kpos === KONAMI.length) { kpos = 0; konami(); } }
    else kpos = e.code === KONAMI[0] ? 1 : 0;
    // secret words only while walking around
    if (N.App.screen !== 'world' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^Key[A-Z]$/.test(e.code)) {
      buf = (buf + e.code.slice(3).toLowerCase()).slice(-12);
      for (const w in WORDS) if (buf.endsWith(w)) { buf = ''; WORDS[w](); N.Ach.unlock('words'); N.Audio.sfx('select'); break; }
    }
  }

  function consoleEgg() {
    const name = (N.DATA.profile.name || 'EDDIE').toUpperCase();
    const art = [
      '  ▄▄▄▄▄▄▄   NEON-8 / ' + name + '.EXE',
      ' █ ▀   ▀ █  Hey, you opened the console.',
      ' █  ▄▄▄  █  Fellow developer? Hi!',
      '  ▀▀▀▀▀▀▀ '
    ].join('\n');
    try {
      console.log('%c' + art, 'color:#29f3ff;font-family:monospace;font-size:12px;line-height:1.3');
      console.log('%cTry: eddie.help()', 'color:#ffd93b;font-family:monospace');
    } catch (e) { }
    window.eddie = {
      help() { console.log('eddie.collab()    open the mailbox\neddie.coins(n)    print money (cheater)\neddie.god()       toggle god mode\neddie.secret()    claim a hidden trophy\neddie.credits()   roll the credits\neddie.reset()     erase your save'); return '♥'; },
      collab() { N.UI.openContact(); return 'Opening the mailbox...'; },
      coins(n = 10) { if (N.App.screen === 'world') N.World.egg('coins', Math.min(99, n | 0)); return 'cha-ching'; },
      god() { if (N.App.screen !== 'world') N.App.go('world'); setTimeout(() => N.World.egg('god'), 200); return 'IDDQD'; },
      secret() { N.Ach.unlock('console'); return 'Devtools detective, unlocked. Nice.'; },
      credits() { if (N.App.screen !== 'world') N.App.go('world'); setTimeout(() => N.Credits.play(), 200); return 'All aboard'; },
      reset() { N.Store.reset(); }
    };
  }

  N.Eggs = {
    init() { window.addEventListener('keydown', onKey); consoleEgg(); }
  };
})();
