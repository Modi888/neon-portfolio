/* NEON-8 · sprite art (all hand-placed pixels, built into canvases at load) */
(function () {
  const N = window.NEON, P = N.Pixel, C = P.PAL;

  const PLAYER_MAP = {
    k: C.ink, h: C.hair, H: C.hairL, s: C.skin, S: C.skinD, v: C.cyan, V: C.cyanL, m: C.magenta, M: C.magentaD,
    w: '#ece6ff', W: '#a596d6', z: C.magenta, p: '#2a1a5e', P: '#3f2c86', o: C.cyan, x: '#ffffff', y: C.yellow
  };
  const HEAD = [
    '....kkkkk...',
    '...khhhhhk..',
    '..khhHHhhhk.',
    '.khhhhhhhhhk',
    '.khmmhssssk.',
    '.khmmsvvvVk.',
    '.khmmsssssk.',
    '..khhsssSk..',
    '...kkSSSk...'
  ];
  const TORSO = {
    idle: [
      '...kwwwwwk..',
      '..kwwzwwwwk.',
      '..kwWzwwWwk.',
      '..kWWzwWssk.',
      '...kwzwwkk..'
    ],
    swingA: [
      '...kwwwwwk..',
      '..kwwzwwwwk.',
      '..kwWzwWWwk.',
      '..kWWzWssk..',
      '...kwzwwk...'
    ],
    swingB: [
      '...kwwwwwk..',
      '..kwwzwwwwk.',
      '.kWwWzwwwWk.',
      '.kssWzwwwWk.',
      '...kwzwwkk..'
    ],
    jump: [
      '...kwwwwwkss',
      '..kwwzwwwWk.',
      '..kwWzwwWk..',
      '..kWWzwwk...',
      '...kwzwwk...'
    ],
    sit: [
      '...kwwwwwk..',
      '..kwwzwwwwk.',
      '..kwWzwwWwk.',
      '..kWWzwWWwk.',
      '..kkwzwssk..'
    ]
  };
  const LEGS = {
    idle: [
      '...kppppk...',
      '...kppkppk..',
      '...kppkppk..',
      '...kppkppk..',
      '...koookoook',
      '...kxxkkxxxk'
    ],
    strideA: [
      '...kppppk...',
      '..kppkkPPk..',
      '.kppk..kPPk.',
      '.kpk....kPk.',
      'koook...koook',
      'kxxxk...kxxxk'
    ],
    strideB: [
      '...kppppk...',
      '..kPPkkppk..',
      '.kPPk..kppk.',
      '.kPk....kpk.',
      'koook...koook',
      'kxxxk...kxxxk'
    ],
    pass: [
      '...kppppk...',
      '...kpppPk...',
      '....kpPPk...',
      '....kpPk....',
      '...kooook...',
      '...kxxxxk...'
    ],
    jump: [
      '...kppppk...',
      '...kpppppk..',
      '....kppkppk.',
      '....kook.kook',
      '....kxxk.kxxk',
      '............'
    ],
    sit: [
      '..kpppppppk.',
      '..kpppppppk.',
      '..kkkkkkpk..',
      '.......kpk..',
      '.......kook.',
      '.......kxxk.'
    ]
  };
  function compose(torso, legs, blink) {
    const head = HEAD.slice();
    if (blink) head[5] = '.khmmsSSSSk.';
    return head.concat(TORSO[torso], LEGS[legs]);
  }
  function pad(rows, w) { return rows.map(r => (r + '.'.repeat(w)).slice(0, w)); }

  const frames = {};
  const make = (name, rows, map) => { const c = P.sprite(pad(rows, 13), map); frames[name] = { r: c, l: P.flipped(c) }; };
  make('idle', compose('idle', 'idle'), PLAYER_MAP);
  make('blink', compose('idle', 'idle', true), PLAYER_MAP);
  make('walk0', compose('swingA', 'strideA'), PLAYER_MAP);
  make('walk1', compose('idle', 'pass'), PLAYER_MAP);
  make('walk2', compose('swingB', 'strideB'), PLAYER_MAP);
  make('walk3', compose('idle', 'pass'), PLAYER_MAP);
  make('jump', compose('jump', 'jump'), PLAYER_MAP);
  make('fall', compose('swingB', 'jump'), PLAYER_MAP);
  make('sit', compose('sit', 'sit', true), PLAYER_MAP);
  // god-mode palette (konami)
  const GOLD_MAP = Object.assign({}, PLAYER_MAP, { w: C.yellowL, W: C.yellow, z: C.orange, p: C.yellowD, P: C.orange, o: C.magenta, h: C.yellow, H: C.yellowL });
  ['idle', 'blink'].forEach(n => make('gold_' + n, compose('idle', 'idle', n === 'blink'), GOLD_MAP));
  make('gold_walk0', compose('swingA', 'strideA'), GOLD_MAP);
  make('gold_walk1', compose('idle', 'pass'), GOLD_MAP);
  make('gold_walk2', compose('swingB', 'strideB'), GOLD_MAP);
  make('gold_walk3', compose('idle', 'pass'), GOLD_MAP);
  make('gold_jump', compose('jump', 'jump'), GOLD_MAP);
  make('gold_fall', compose('swingB', 'jump'), GOLD_MAP);
  make('gold_sit', compose('sit', 'sit', true), GOLD_MAP);

  /* ---------- BYTE the drone ---------- */
  const BYTE_MAP = { k: C.ink, c: C.cyan, C: C.cyanD, s: '#1b1240', e: C.lime, y: C.yellow, w: C.cyanL };
  const byteA = P.sprite([
    '....kk....',
    '....ky....',
    '..kkkkkk..',
    '.kwcccccCk',
    'kcskssksCk',
    'kcseskseCk',
    'kcssssssCk',
    '.kCcccCCk.',
    '..kk..kk..'
  ], BYTE_MAP);
  const byteBlink = P.sprite([
    '....kk....',
    '....ky....',
    '..kkkkkk..',
    '.kwcccccCk',
    'kcssssssCk',
    'kcsesseeCk',
    'kcssssssCk',
    '.kCcccCCk.',
    '..kk..kk..'
  ], Object.assign({}, BYTE_MAP, { e: C.cyanD }));
  const byteHappy = P.sprite([
    '....kk....',
    '....ky....',
    '..kkkkkk..',
    '.kwcccccCk',
    'kcsessesCk',
    'kcesseseCk',
    'kcssssssCk',
    '.kCcccCCk.',
    '..kk..kk..'
  ], BYTE_MAP);

  /* ---------- cats ---------- */
  const CAT = [
    '.k.....k...',
    '.kk...kk...',
    '.kkkkkkk...',
    '.kykkkyk...',
    '.kkkpkkk..k',
    '..kkkkk...k',
    '.kkkkkkk.k.',
    '.kkkkkkkk..',
    '.kkkkkkk...'
  ];
  const CAT_BLINK = CAT.slice(); CAT_BLINK[3] = '.kkkkkkk...';
  const catPal = {
    black: { k: '#150d2c', y: C.yellow, p: C.pink },
    orange: { k: C.orange, y: C.lime, p: C.pink },
    white: { k: '#e9e2ff', y: C.cyan, p: C.pink },
    grey: { k: '#6d5f99', y: C.yellow, p: C.pink },
    pink: { k: C.magenta, y: C.cyanL, p: C.white }
  };
  const cats = {};
  for (const k in catPal) cats[k] = { a: P.sprite(CAT, catPal[k]), b: P.sprite(CAT_BLINK, catPal[k]) };

  /* ---------- NPCs ---------- */
  function person(rows, map) { const c = P.sprite(pad(rows, 11), map); return { r: c, l: P.flipped(c) }; }
  const NPC = {};
  NPC.guard = person([
    '...kkkkk...',
    '..kbbbbbk..',
    '.kbbybbbbkk',
    '.kkkkkkkkk.',
    '..kssssSk..',
    '..ksekseSk.',
    '..kssssSk..',
    '..kkmmmkk..',
    '..kbbbbbk..',
    '.kbbybbbbk.',
    '.kbbbbbbbk.',
    '.kbbbbbsbk.',
    '..kbbbbbk..',
    '..kpppppk..',
    '..kppkppk..',
    '..kppkppk..',
    '..kppkppk..',
    '..kkkkkkkk.',
    '..kkkkkkkk.'
  ], { k: C.ink, b: '#2b3b8f', y: C.yellow, s: '#d9a07c', S: '#a8704f', e: C.ink, m: '#3a1f1a', p: '#1a1f4f' });
  NPC.robot = person([
    '...kkkkk...',
    '..kyyyyyk..',
    '.kyyyyyyyk.',
    '.kkkkkkkkk.',
    '..kggggk...',
    '..kgkekgk..',
    '..kggggk...',
    '...kkkk....',
    '..koooook..',
    '.koOoooOok.',
    '.koooooook.',
    'kgkoooookgk',
    '..koooook..',
    '..kgggggk..',
    '..kgk.kgk..',
    '..kgk.kgk..',
    '.kkgk.kgkk.',
    '.kkkk.kkkk.',
    '...........'
  ], { k: C.ink, y: C.yellow, g: '#8a83a8', e: C.red, o: C.orange, O: C.orangeD });
  NPC.kid = person([
    '...........',
    '...kkkkk...',
    '..krrrrrkk.',
    '.kkrrrrrrrk',
    '..khhssssk.',
    '..khseskk..',
    '..khssssk..',
    '...kkSSk...',
    '..kcccccck.',
    '.kcwcccwck.',
    '.kccccccck.',
    '.kscccccsk.',
    '..kcccccck.',
    '..kbbbbbk..',
    '..kbbkbbk..',
    '..kbbkbbk..',
    '..kwwkwwk..',
    '..kkkkkkkk.',
    '...........'
  ], { k: C.ink, r: C.red, h: '#5a2a1a', s: C.skin, S: C.skinD, e: C.ink, c: C.lime, w: '#ffffff', b: '#2c4f9e' });
  NPC.dev = person([
    '...kkkkk...',
    '..kgggggk..',
    '.kgGgGgGgk.',
    '.kkkkkkkkk.',
    '..khssssk..',
    '..khskskk..',
    '..khssssk..',
    '...kSSSk...',
    '..kvvvvvk..',
    '.kvvvvvvvk.',
    '.kvvvvwwwk.',
    '.kvvvvwmwk.',
    '..kvvvwwk..',
    '..kpppppk..',
    '..kppkppk..',
    '..kppkppk..',
    '..kppkppk..',
    '..kkkkkkkk.',
    '...........'
  ], { k: C.ink, g: C.lime, G: C.limeD, h: '#3a2a1a', s: '#e8b48a', S: '#b8805a', v: '#3d6b4a', w: '#ffffff', m: '#6b3a2a', p: '#2a2a40' });
  NPC.master = person([
    '...kkkkk...',
    '..kbbbbbk..',
    '.kbbyybbbk.',
    '.kkkkkkkkkk',
    '..kssssSk..',
    '..ksekseSk.',
    '..kwwwwwk..',
    '...kwwwk...',
    '..kbbbbbk..',
    '.kbbybybbk.',
    '.kbbbbbbbk.',
    '.kbbybybsk.',
    '..kbbbbbk..',
    '..kbbbbbk..',
    '..kbbkbbk..',
    '..kbbkbbk..',
    '..kbbkbbk..',
    '..kkkkkkkk.',
    '...........'
  ], { k: C.ink, b: '#5b2b8f', y: C.yellow, s: '#f0c39d', S: '#c08a66', e: C.ink, w: '#e8e2f4' });
  NPC.vendor = person([
    '..kwwwwwk..',
    '.kwwwwwwwk.',
    '..kwwwwwk..',
    '..kkkkkkk..',
    '..kcccccck.',
    '..kcekcekk.',
    '..kcccccck.',
    '...kkkkk...',
    '..kwwwwwk..',
    '.kwwwrwwwk.',
    '.kwwwwwwwk.',
    'kckwwwwwkck',
    '..kwwwwwk..',
    '..kgggggk..',
    '...kgggk...',
    '...kgggk...',
    '..kkgggkk..',
    '..kkkkkkk..',
    '...........'
  ], { k: C.ink, w: '#eae6f6', c: '#9aa4c8', e: C.cyan, r: C.red, g: '#6f6890' });
  NPC.granny = person([
    '...kkkkk...',
    '..kllllk...',
    '.kllllllk..',
    '.kllssssk..',
    '..klsekk...',
    '..klssssk..',
    '...kssSk...',
    '..kpppppk..',
    '.kpppppppk.',
    '.kpwpwpwpk.',
    '.kppppppsk.',
    '..kpppppk..',
    '..kpppppk..',
    '..kpppppk..',
    '...kpppk...',
    '...kkkkk...',
    '...kk.kk...',
    '...........',
    '...........'
  ], { k: C.ink, l: '#d8d0ec', s: '#f0c39d', S: '#c08a66', e: C.ink, p: '#7a3a8f', w: C.pink });

  // walking pedestrians: simple 2-frame bodies, colors vary
  function walker(coat, hair, pants) {
    const base = [
      '...kkkk...',
      '..khhhhk..',
      '..khhsssk.',
      '..khsesk..',
      '..khsssk..',
      '...kssk...',
      '..kccccck.',
      '.kcccccck.',
      '.kcccccck.',
      '.kcccccsk.',
      '..kcccck..',
      '..kppppk..'
    ];
    const a = base.concat(['..kpkkpk..', '.kpk..kpk.', '.kpk..kpk.', 'kkk....kkk']);
    const b = base.concat(['...kppk...', '...kppk...', '...kpPk...', '...kkkk...']);
    const map = { k: C.ink, h: hair, s: C.skin, e: C.ink, c: coat, p: pants, P: P.mix(pants, '#ffffff', 0.2) };
    const A = P.sprite(a, map), B = P.sprite(b, map);
    return { a: { r: A, l: P.flipped(A) }, b: { r: B, l: P.flipped(B) } };
  }
  const walkers = [
    walker('#3b2a7a', C.hair, '#1c1440'), walker('#7a2a5a', '#e8d0a0', '#241a3a'), walker('#1f5a6b', '#2a1a10', '#16162e'),
    walker('#5a5a7a', '#c86a2a', '#20203a'), walker('#2a2a4a', '#f4ecff', '#3a1a3a')
  ];

  /* ---------- small props ---------- */
  const ICON = {};
  const icon = (name, rows, map) => { ICON[name] = P.sprite(rows, map); };
  icon('heart', ['.kk.kk.', 'kmmkmmk', 'kmMmmmk', 'kmmmmmk', '.kmmmk.', '..kmk..', '...k...'], { k: C.ink, m: C.magenta, M: C.magentaL });
  icon('star', ['...k...', '..kyk..', 'kkyyykk', 'kyyYyyk', '.kyyyk.', '.kykyk.', 'kk...kk'], { k: C.ink, y: C.yellow, Y: C.yellowL });
  icon('mug', ['.wwww..', 'kwwwwk.', 'kccccckk', 'kccccck.k', 'kccccckk', 'kccccck.', '.kkkkk..'], { k: C.ink, w: '#ffffff', c: '#6b3a2a' });
  icon('key', ['.kkk.....', 'kyyyk....', 'ky.ykkkkk', 'kyyykyyyk', '.kkk.k.k.'], { k: C.ink, y: C.yellow });
  icon('can', ['.kkk.', 'kcwck', 'kccck', 'kcmck', 'kccck', 'kcwck', '.kkk.'], { k: C.ink, c: C.cyan, w: '#ffffff', m: C.magenta });
  icon('note', ['...kk', '..kmk', '..k.k', '..k..', 'kkk..', 'kmk..', 'kk...'], { k: C.ink, m: C.magenta });
  icon('qblock', [
    'kkkkkkkkkk', 'kyyyyyyyyk', 'kyykkkkyyk', 'kyykyykkyk', 'kyyyykkyyk', 'kyyyykyyyk', 'kyyyyyyyyk', 'kyyyykyyyk', 'kyyyyyyyyk', 'kkkkkkkkkk'
  ], { k: C.yellowD, y: C.yellow });
  icon('qblockUsed', [
    'kkkkkkkkkk', 'kddddddddk', 'kdkddddkdk', 'kddddddddk', 'kddddddddk', 'kddddddddk', 'kddddddddk', 'kdkddddkdk', 'kddddddddk', 'kkkkkkkkkk'
  ], { k: C.ink, d: '#6b4a2a' });
  icon('mushroom', ['..kkkk..', '.kmmwmk.', 'kmwmmmmk', 'kmmmmwmk', 'kkkkkkkk', '.kwkkwk.', '.kwwwwk.', '..kkkk..'], { k: C.ink, m: C.magenta, w: '#ffffff' });
  icon('tomb', ['..kkkkk..', '.kgggggk.', 'kgggggggk', 'kgggggggk', 'kgggggggk', 'kgggggggk', 'kgggggggk', 'kkkkkkkkk'], { k: C.ink, g: '#3a3a5a' });

  // generate coin spin frames procedurally (ellipse widths)
  const coin = [];
  [8, 6, 4, 2, 4, 6].forEach((w, i) => {
    const { c, x } = P.canvas(8, 8);
    const ox = (8 - w) / 2;
    for (let j = 0; j < 8; j++) {
      const dy = (j + 0.5 - 4) / 4;
      const half = Math.sqrt(Math.max(0, 1 - dy * dy)) * w / 2;
      const x0 = Math.round(4 - half), x1 = Math.round(4 + half);
      for (let q = x0; q < x1; q++) {
        const edge = q === x0 || q === x1 - 1 || j === 0 || j === 7;
        x.fillStyle = edge ? C.yellowD : C.yellow;
        x.fillRect(q, j, 1, 1);
      }
    }
    if (w >= 6) { x.fillStyle = C.yellowL; x.fillRect(ox + 2, 2, 1, 3); }
    if (w >= 4) { x.fillStyle = C.yellowD; x.fillRect(4, 3, 1, 2); }
    coin.push(c);
  });

  N.Sprites = { player: frames, byte: { a: byteA, blink: byteBlink, happy: byteHappy }, cats, npc: NPC, walkers, icon: ICON, coin, PLAYER_MAP };
})();
