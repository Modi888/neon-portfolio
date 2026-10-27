/* =====================================================================
   NEON-8 · 作品集内容配置
   ---------------------------------------------------------------------
   ✦ 整个网站的文字内容都在这个文件里。改这里就够了，不用碰其它代码。
   ✦ 双语字段写成 { en: '...', zh: '...' }。只想要一种语言？直接写字符串
     也可以，例如 summary: '一句话介绍'，两种语言下都会显示它。
   ✦ 所有【待填写】/ [TODO] 都是占位符，替换成你的真实内容。
   ✦ 新增作品：复制一个对象、改一个不重复的 id，城市里会自动多出一栋楼，
     快速浏览页、地图、终端里也会自动出现。
   ✦ 长文本里：空一行 = 新段落；以 "- " 开头的行 = 列表；**文字** = 加粗。
   ✦ 图片放进 assets/ 文件夹，然后写路径，例如 cover: 'assets/nova.png'。
     cover 留空会自动生成一张像素占位图。商店橱窗里也会显示你的 cover！
   ===================================================================== */

window.NEON = window.NEON || {};

NEON.DATA = {

  /* ------------------------------------------------------------------
     个人资料（家 / 快速浏览页顶部 / 终端 whoami）
     ------------------------------------------------------------------ */
  profile: {
    // 城市招牌、标题画面上显示的名字。只支持英文字母、数字和常见符号，建议不超过 8 个字符。
    name: 'EDDIE',
    fullName: { en: 'Eddie Chen', zh: '陈墨笛 Eddie' },
    role: { en: 'AI-native builder', zh: 'AI 原生开发者' },
    tagline: {
      en: 'I build stuff.',
      zh: '我做点东西。'
    },
    location: { en: 'Shanghai · IB student', zh: '上海 · IB 学生' },
    // 顶部状态灯，available: true 显示绿灯
    available: true,
    status: {
      en: 'Always up for a fun idea',
      zh: '欢迎聊有意思的点子'
    },
    email: 'eddiechen0111@gmail.com',
    links: [],
    // 自我介绍，每个字符串是一段
    bio: {
      en: [
        "Hi, I'm Eddie Chen. I'm 16 and doing the IB in Shanghai. I've been building since 2024. I build with Claude Code and Codex now, turning ideas into real things: websites, apps, AI tools, platforms for agents, and games.",
        "What drives me is simple: make something decent, and make a bit of money along the way. Most of my projects start as random ideas, so you'll find some that launched, some that got shelved, and one that burned down the kitchen.",
        "When I'm not building, I'm playing poker, multiplayer games or pool. What's next? I'll figure it out as I go. Maybe one of these projects blows up someday."
      ],
      zh: [
        '你好，我是陈墨笛，也叫 Eddie。16 岁，在上海读 IB。我从 2024 年开始做东西，现在用 Claude Code 和 Codex 把想法做成真东西：网站、App、AI 工具、给 agent 用的平台，还有游戏。',
        '我做东西的动力很简单：做出点像样的东西，顺带赚点钱。项目大多是随机冒出来的想法，所以这里有上线的，有搁置的，也有烧了厨房的。',
        '不写代码的时候，我在打德州、玩多人游戏，或者打台球。接下来做什么？走一步算一步吧，说不定哪天哪个项目就火了。'
      ]
    },
    // RPG 属性条（0–100），想写什么都行
    stats: [
      { key: { en: 'Product sense', zh: '产品嗅觉' }, value: 60 },
      { key: { en: 'Vibe coding', zh: 'Vibe coding' }, value: 89 },
      { key: { en: 'Hands-on', zh: '动手能力' }, value: 98 },
      { key: { en: 'Marketing', zh: '营销' }, value: 20 },
      { key: { en: 'Kitchen safety', zh: '厨房安全' }, value: 3 }
    ],
    // 技能背包。level 1–5；icon 可选：sword shield potion gem key scroll map star heart bolt
    skills: [
      { name: 'Claude Code', level: 5, icon: 'bolt' },
      { name: 'Codex', level: 5, icon: 'sword' },
      { name: { en: 'Product design', zh: '产品设计' }, level: 4, icon: 'map' },
      { name: { en: 'Prompt engineering', zh: '提示词工程' }, level: 4, icon: 'scroll' },
      { name: 'React', level: 4, icon: 'gem' },
      { name: 'TypeScript', level: 3, icon: 'key' },
      { name: 'React Native', level: 3, icon: 'star' },
      { name: 'Node.js', level: 3, icon: 'shield' },
      { name: 'Python', level: 3, icon: 'potion' },
      { name: 'Solidity', level: 3, icon: 'gem' },
      { name: 'Godot / C#', level: 2, icon: 'heart' },
      { name: 'Blender', level: 2, icon: 'star' },
      { name: 'SolidWorks', level: 2, icon: 'shield' },
      { name: 'ESP32', level: 2, icon: 'bolt' }
    ],
    // 冒险日志（时间线），从新到旧
    timeline: [
      { year: '2026.9', title: { en: 'Wild Debt Hunters', zh: '荒野欠债人' }, text: { en: 'Started my first real indie game.', zh: '开始做第一款正经的独立游戏。' } },
      { year: '2026.9', title: 'Nivie', text: { en: 'My first paid project as a cofounder.', zh: '第一次作为联合创始人接付费项目。' } },
      { year: '2026.7', title: { en: 'Internship at LibAI Lab', zh: '在 LibAI Lab 实习' }, text: { en: 'Built a recommender across 8 categories in just over two weeks.', zh: '两周多做完一套 8 个类目的推荐系统。' } },
      { year: '2026.6', title: 'Agent Poker Room', text: { en: 'The first product for agents I launched.', zh: '第一个上线的、给 agent 用的产品。' } },
      { year: '2026.1', title: 'Renix', text: { en: 'My first fully vibe-coded project. 300+ users, about 10 paying.', zh: '第一个完全 vibe coding 的项目，300 多个用户，10 个左右付费。' } },
      { year: '2025.2', title: { en: 'TalkLab', zh: '口才通' }, text: { en: 'Duolingo for speaking. Testers talked me out of it.', zh: '锻炼口才版的多邻国，被试用的人说服放弃了。' } },
      { year: '2024.7', title: 'Startable', text: { en: 'My first line of code, and my first real product.', zh: '写下第一行代码，做出第一个真正的产品。' } },
      { year: '2023', title: { en: 'The rocket', zh: '火箭' }, text: { en: 'A rocket that never launched.', zh: '一枚没能发射的火箭。' } }
    ],
    // 自动贩卖机 / 终端 fortune 随机掉落的冷知识
    funFacts: [
      { en: 'My first rocket nozzle was a 5-yuan flowerpot.', zh: '我的第一个火箭喷嘴是一个五块钱的花盆。' },
      { en: "If you're doing chemistry at home, don't buy the cheap induction cooker.", zh: '做化学实验的话，电磁炉不能贪便宜。' },
      { en: "I haven't written a line of code by hand since 2026.", zh: '我从 2026 年开始就没手写过一行代码。' },
      { en: 'I burn through about 300 million tokens a day.', zh: '我大概每天用 3 亿个 token。' },
      { en: "I still haven't figured out how to never get my Claude account banned.", zh: '我至今没搞明白怎么完美防止 Claude 封号。' }
    ],
    // 天上飞艇的滚动字幕（只支持英文大写字母、数字和常见符号）
    blimp: 'WELCOME TO NEON-8 * EDDIE.EXE IS ONLINE * ALL DOORS ARE OPEN * PRESS F TO ENTER *'
  },

  /* ------------------------------------------------------------------
     作品
     type 决定它在城市里长什么样、出现在哪个街区：
       'web'        已上线网站 → 网站街的商店
       'intern'     实习经历   → 巨企广场的摩天大楼
       'soon-web'   即将上线的网站 → 施工区的工地
       'soon-game'  即将上线的游戏 → 独立游戏实验室的海报
     sign:   楼上霓虹招牌的文字（英文大写，≤ 9 个字符效果最好）
     color:  霓虹色 magenta | cyan | yellow | lime | orange | violet | blue | red
     status: 显示在详情页的状态标签
     progress / eta: 只对 soon-* 有意义，0–100
     sections: 详情页的正文区块，可以随意增删
     metrics: 成果数据卡片，可以留空数组 []
     demo:    演示视频 { src, poster, caption }，放在 assets/projects/<id>/ 里
     ------------------------------------------------------------------ */
  projects: [

    /* ============ 已上线网站 · WEB STREET ============ */
    {
      id: 'startable',
      type: 'web',
      title: 'Startable.io',
      sign: 'STARTABLE',
      color: 'lime',
      year: '2024',
      status: 'LIVE',
      url: 'https://startable.io',
      cover: 'assets/projects/startable/cover.jpg',
      summary: {
        en: 'A one-stop launchpad for crypto tokens: mint a token, run a presale and get it trading, without writing code. My first project, built alone in summer 2024.',
        zh: '一站式发币平台：铸造代币、发起预售、上线交易，全程不用写代码。这是我的第一个作品，2024 年夏天一个人做完。'
      },
      role: { en: 'Solo: idea, design, front end, back end, smart contracts', zh: '独立完成：想法、设计、前端、后端、智能合约' },
      tags: ['React', 'Node.js', 'Solidity', 'BNB Chain', 'PancakeSwap', 'MetaMask'],
      demo: {
        src: 'assets/projects/startable/demo.mp4',
        poster: 'assets/projects/startable/demo-poster.jpg',
        caption: { en: 'The full flow in under three minutes: create a token, start a presale, buy from a second wallet, and see it trading on PancakeSwap.', zh: '三分钟走完全流程：创建代币、发起预售、用另一个钱包购买，最后在 PancakeSwap 上交易。' }
      },
      sections: [
        { title: { en: 'What it is', zh: '这是什么' }, body: {
          en: 'Startable lets anyone launch a token on BNB Chain or Ethereum in a few clicks. Connect a wallet, fill in a form, and the platform deploys the token for you. From there you can run a presale, lock tokens or send an airdrop. When the sale ends, buyers get their tokens automatically and part of the money raised goes into a PancakeSwap pool, so the token can be traded straight away.',
          zh: 'Startable 让任何人点几下就能在 BNB Chain 或以太坊上发币。连上钱包、填一张表，平台就替你把代币部署上链。之后可以发起预售、锁仓或者空投。预售结束时，买家会自动收到代币，募集到的一部分资金会自动加进 PancakeSwap 的流动性池，代币马上就能交易。'
        } },
        { title: { en: 'Why I built it', zh: '为什么做' }, body: {
          en: "In spring 2024 I launched a token of my own, and the presale was painful. The only way to run one was on Twitter: post a wallet address, ask people to send money to it, then send everyone their tokens by hand. It was slow, easy to get wrong, and buyers simply had to trust me. All that work raised about $20 from a single buyer, plus one more purchase after listing that was probably a bot.\n\nSo I wanted a site that did all of it for you. A little way in, I found out one or two platforms like this already existed. But they were clunky and didn't work well, so I decided a late start could still catch up, and kept going.",
          zh: '2024 年春天我自己发过一个币，预售的过程非常麻烦。当时唯一的办法是在推特上发一个钱包地址，让大家往里面转钱，然后再手动把代币一个个发给他们。又慢又容易出错，买家只能选择相信我。折腾一圈，只募到大约 20 美元，参与者只有一个人，上线后又多了一个买家，看起来还像是机器人。\n\n所以我想做一个平台，把这些事全部自动完成。做到一半才发现，市面上已经有一两个类似的平台。但它们的功能和体验都不太好，我觉得就算起步晚，也有机会追上，于是继续做了下去。'
        } },
        { title: { en: 'What I built', zh: '我做了什么' }, body: {
          en: "All of it, on my own. When I had the idea, I couldn't code. So I learned while building: React and Node.js from YouTube, and Solidity for the smart contracts, all from scratch. Three months later it was live.\n\n- **Token factory**: name, symbol, decimals and supply go into a form, and a contract deploys the token\n- **Presale contract**: price, soft cap and hard cap, minimum and maximum buy, whitelist, start and end time, and whether unsold tokens are refunded or burned\n- **Automatic finish**: buyers receive their tokens, and a set share of the raise becomes PancakeSwap liquidity, locked for a set time\n- **More tools**: fair launch, token lock and airdrops\n- **Launchpad list**: every sale with its live progress\n- **Business model**: a fee to create a token, a cut of each raise, and fees for tools like airdrops",
          zh: '全部是我一个人做的。有这个想法的时候，我完全不会写代码，所以是边学边做：在 YouTube 上学了 React 和 Node.js，又学了写智能合约的 Solidity，合约全部从零写起。三个月后网站上线。\n\n- **发币合约**：在表单里填名称、代号、小数位和总量，合约直接部署代币\n- **预售合约**：兑换比例、软顶和硬顶、单人最少和最多买多少、白名单、开始和结束时间，以及没卖完的代币退回还是销毁\n- **自动结算**：预售结束后，代币自动发到买家钱包，按设定比例把募集资金加进 PancakeSwap 流动性池，并锁定一段时间\n- **其他工具**：公平发射、代币锁仓、空投\n- **预售列表**：所有项目和它们的实时募集进度\n- **收费模式**：创建代币的手续费、每笔募集的平台抽成，以及空投等工具的费用'
        } },
        { title: { en: 'The hard part', zh: '难点' }, body: {
          en: "Getting the pieces to talk to each other. I was learning React, Node.js and Solidity at the same time, and each one worked on its own long before the three worked together. Smart contracts raise the stakes: once one is deployed you can't patch it, and a bug can cost real money. So I ran every flow on testnet over and over, with two wallets playing creator and buyer, before anything went near mainnet.",
          zh: '最难的是让各个部分连起来。我同时在学 React、Node.js 和 Solidity，每一块单独都能跑通，但三块接到一起又是另一回事。智能合约让这件事更难：合约一旦部署就改不了，一个 bug 可能就是真金白银的损失。所以每个流程我都先在测试网上反复跑，用两个钱包分别扮演发币方和买家，确认没问题才上主网。'
        } },
        { title: { en: 'How it went', zh: '结果' }, body: {
          en: "Startable is still live. To be honest, it never took off: fewer than ten real users, one or two of whom launched a token, almost nothing raised, and no revenue. The product worked. Hardly anyone knew it existed.",
          zh: 'Startable 现在还在运行。说实话，它没有做起来：真实用户不到十个，其中一两个人在上面发过币，几乎没有募集到资金，平台也没有赚到钱。产品本身是能用的，只是几乎没人知道它。'
        } },
        { title: { en: 'What I learned', zh: '我学到了什么' }, body: {
          en: "A product is two things: what it does, and how people find out about it. I spent three months on the first. For the second I posted on Twitter and joined Telegram groups, and that was it, because paying influencers was far beyond my budget. In crypto that gap hurts even more, because marketing a blockchain project is harder than marketing almost any other tool. Now I plan how people will find a project before I start building it.",
          zh: '一个产品有两半：它能做什么，以及别人怎么知道它。我花了三个月做前一半。后一半，我只是发推、进 Telegram 群宣传，找 KOL 推广的费用我根本付不起。对区块链项目来说，这个短板更致命，因为它的营销比其他工具难得多。现在我在动手做一个项目之前，会先想清楚之后怎么推广它。'
        } },
        { title: { en: 'If I did it again', zh: '如果重来' }, body: {
          en: "I'd research the model much harder before building. Months later, pump.fun took over meme coin launches with a completely different approach: no presale at all, a price that rises as people buy, and new ideas like launching a coin on a livestream. It became the default place to launch, and Twitter presales, along with platforms like mine, faded out. I built a better version of the old process. They replaced the process.",
          zh: '我会在动手之前更深入地研究这个模式。几个月后，pump.fun 用完全不同的玩法占领了 meme 币发行市场：没有预售，买的人越多价格越高，还加入了直播卖币这样的新玩法。它成了发币的主流平台，推特预售和像我这样的平台也就退出了历史舞台。我做的是旧流程的更好版本，而他们直接换掉了这个流程。'
        } }
      ],
      metrics: [
        { label: { en: 'Months from zero code to launch', zh: '从零基础到上线' }, value: { en: '3', zh: '3 个月' } },
        { label: { en: 'Developer: me', zh: '开发者，就是我' }, value: { en: '1', zh: '1 人' } },
        { label: { en: 'Tools: mint, presale, lock, airdrop', zh: '工具：发币、预售、锁仓、空投' }, value: { en: '4', zh: '4 个' } },
        { label: { en: 'Real users', zh: '真实用户' }, value: '< 10' }
      ],
      links: [
        { label: { en: 'Visit startable.io', zh: '访问 startable.io' }, url: 'https://startable.io' }
      ]
    },

    {
      id: 'talklab',
      type: 'web',
      kind: 'app',
      title: { en: 'TalkLab', zh: '口才通' },
      sign: 'TALKLAB',
      color: 'blue',
      year: '2025',
      status: 'SHELVED',
      cover: { en: 'assets/projects/talklab/cover-en.jpg', zh: 'assets/projects/talklab/cover-zh.jpg' },
      summary: {
        en: 'Duolingo, but for speaking: practice real conversations with AI (small talk, business meetings, speeches) and get feedback on every answer. My second project, built solo in 2025.',
        zh: '锻炼口才版的多邻国：和 AI 演练真实场景（日常聊天、商务会议、演讲），每次回答都有反馈。我的第二个作品，2025 年一个人做完。'
      },
      role: { en: 'Solo: idea, design, development, content', zh: '独立完成：想法、设计、开发、题库' },
      tags: ['React Native', 'Android + iOS', 'LLM', 'Speech to text', 'AI workflows'],
      demo: {
        src: 'assets/projects/talklab/demo.mp4',
        poster: 'assets/projects/talklab/demo-poster.jpg',
        portrait: true,
        caption: { en: 'One full round: read the scenario, answer out loud, get AI feedback, then ask the AI coach. My spoken answer starts around 1:29, so turn the sound on.', zh: '完整练一轮：读情境、开口回答、看 AI 反馈，再去问 AI 助手。1:29 左右是我的录音回答，记得开声音。' }
      },
      sections: [
        { title: { en: 'What it is', zh: '这是什么' }, body: {
          en: 'TalkLab drops you into a situation and gives you one minute to talk. A client suddenly asks: "Three units from your last batch broke and support took two months. If something goes wrong this time, who\'s responsible?" You answer by voice or by typing. The AI comes back with an evaluation, specific suggestions and a sample answer.\n\nThere\'s a scenario library for work, school and impromptu speaking. You can also describe your own situation and get a custom practice. And there\'s an AI coach for anything else, like how to politely turn down dinner with your boss.',
          zh: '口才通会把你丢进一个具体情境，给你一分钟开口。比如客户突然问："你们上一批产品坏了 3 个，售后拖了两个月，这次出了问题谁负责？"你可以录音回答，也可以打字。AI 会给出评价、具体的改进建议和一段示例回答。\n\nApp 里有职场、校园、即兴演讲等场景题库。还可以把自己遇到的情况描述出来，生成专属练习。另外有一个随时能问的 AI 口才助手，比如"领导请我吃饭，怎么委婉拒绝"。'
        } },
        { title: { en: 'Why I built it', zh: '为什么做' }, body: {
          en: "I'm not a natural talker. So I wanted something like Duolingo, but for speaking: real situations, instant feedback, a little practice at a time. It also felt like a big market, since almost everyone at work has to pitch, negotiate or say no at some point.",
          zh: '我自己不是特别能说会道。所以我想做一个像多邻国那样的 App，只不过练的是口才：情境真实、反馈即时，每次练一小会儿。我当时觉得这个市场不小，几乎每个职场人都要介绍产品、谈判、拒绝别人。'
        } },
        { title: { en: 'What I built', zh: '我做了什么' }, body: {
          en: "Everything, on my own, starting in February 2025.\n\n- **Built in React Native**: I already knew React from Startable, and one codebase gave me both Android and iOS\n- **Scenario practice**: a situation, a time limit and tips, then answer by voice or text\n- **AI feedback on every answer**: an evaluation, concrete suggestions and a sample answer, plus playback of your recording\n- **Scenario library**: generated in bulk with an AI workflow, then reviewed by me\n- **Custom scenarios**: describe your own situation and the app builds a practice around it\n- **AI coach**: ask any communication question and get suggested follow-ups",
          zh: '从 2025 年 2 月开始，全部一个人完成。\n\n- **用 React Native 开发**：做 Startable 时我已经熟悉了 React，而且一套代码就能同时出安卓和 iOS 版\n- **场景练习**：情境、时间限制、训练小贴士，然后用语音或文字作答\n- **每次回答都有 AI 反馈**：评价、改进建议、示例回答，还能回放自己的录音\n- **题库**：用 AI 工作流批量生成，再由我逐个审核\n- **自定义场景**：描述自己的情况，App 围绕它生成练习\n- **AI 口才助手**：任何沟通问题都能问，还会推荐接下来可以问什么'
        } },
        { title: { en: 'The hard part', zh: '难点' }, body: {
          en: 'Honestly, nothing really fought back, and looking back that was the problem. Once a feature worked, I called it done, instead of polishing the experience until it felt good. For example, the feedback only reads the transcript. But at least half of speaking well is pace, pauses and filler words, and none of that was ever scored.',
          zh: '说实话，没有遇到什么特别难的地方。现在回头看，这本身就是个问题：功能做出来，我就当它完成了，没有花心思把体验打磨好。举个例子，AI 只评价转写出来的文字，可一个人会不会说话，至少一半取决于语速、停顿和口头禅，而这些都没有被评估到。'
        } },
        { title: { en: 'How it went', zh: '结果' }, body: {
          en: "Before publishing, I gave it to a few people. The verdict was unanimous: the format goes against how people actually live. Duolingo works because you can do two questions while waiting in line. A TalkLab session takes ten-plus minutes, you have to speak out loud, and ideally nobody is around. Rehearsing a salary negotiation on the subway is a great way to get a whole row of seats to yourself.\n\nSo I took the advice and stopped before it went into the store. The app is finished. It just never shipped.\n\nI built an app to help people talk better, and the people I showed it to talked me out of it. So in a way, it worked.",
          zh: '上架之前，我先给几个人试用。大家的评价出奇地一致：这个模式太反人类了。多邻国好用，是因为排队时就能随手做两题。口才通练一两个场景要十几分钟，还得开口说出来，最好周围没人。在地铁上大声排练加薪谈判，倒是个独占一整排座位的好办法。\n\n所以我听劝，没有上架就停掉了这个项目。App 本身是完整做完的，只是没有上架。\n\n我做了一个帮人提升口才的 App，结果被试用的人说服放弃了。某种意义上，它还挺有效的。'
        } },
        { title: { en: 'What I learned', zh: '我学到了什么' }, body: {
          en: 'When an idea feels new, find out why nobody has done it yet. Before starting, I searched for similar products and found nothing. I read that as a green light. Looking back, it was more of a warning: the space was probably empty for a reason. Now I ask the people around me before I build, not after.',
          zh: '当一个想法看起来很新奇时，先搞清楚为什么还没有人做过。动手之前我查过同类产品，一个都没找到，当时我把这当成了绿灯。现在想想，那更像是一个警告：这片空白可能是有原因的。现在我会在动手之前就多问问身边的人，而不是做完以后。'
        } }
      ],
      metrics: [
        { label: { en: 'Platforms, one codebase', zh: '平台，一套代码' }, value: '2' },
        { label: { en: 'Developer: me', zh: '开发者，就是我' }, value: { en: '1', zh: '1 人' } },
        { label: { en: 'Languages: 中文 / English', zh: '语言：中文 / English' }, value: '2' },
        { label: { en: 'Per session. That was the problem.', zh: '练一次要这么久，问题就出在这' }, value: { en: '10+ min', zh: '10+ 分钟' } }
      ],
      links: []
    },

    {
      id: 'renix',
      type: 'web',
      title: 'Renix',
      sign: 'RENIX',
      color: 'cyan',
      year: '2026',
      status: 'LIVE',
      url: 'https://renix.ai',
      cover: 'assets/projects/renix/cover.jpg',
      summary: {
        en: 'An AI slide generator that designs every page from scratch instead of filling in a template. Built solo with Claude Code, launched March 2026.',
        zh: 'AI 幻灯片生成器：每一页都从零设计，而不是往模板里填字。我一个人用 Claude Code 做的，2026 年 3 月上线。'
      },
      role: { en: 'Solo: product, design, prompts and the generation pipeline. Every line of code written by Claude Code', zh: '独立完成：产品、设计、提示词、生成流程。代码全部由 Claude Code 编写' },
      tags: ['Claude Code', 'React', 'Python', 'Postgres', 'Stripe', 'Nano Banana Pro', 'OCR'],
      demo: {
        src: 'assets/projects/renix/demo.mp4',
        poster: 'assets/projects/renix/demo-poster.jpg',
        caption: { en: 'The whole flow in 30 seconds: describe the deck, pick a style, edit the outline, generate slide descriptions, render, export.', zh: '30 秒走完全流程：一句话描述、选风格、改大纲、生成每页描述、出图、导出。' }
      },
      sections: [
        { title: { en: 'What it is', zh: '这是什么' }, body: {
          en: 'Type one sentence, paste an outline or upload a speech script, and Renix builds the whole deck. No templates: every slide is generated by an image model, with its own layout, illustrations and colors. You can edit any slide with a sentence, or select one area and redraw only that part. Then export to PDF or to an editable PPTX.',
          zh: '说一句话、贴一份大纲，或者上传演讲稿，Renix 就会生成一整套 PPT。它不套模板，每一页都是生图模型生成的：排版、插图、配色都是为这一页单独设计的。生成后可以用一句话修改，也可以框选某个区域局部重画。最后导出 PDF，或者导出可以编辑的 PPTX。'
        } },
        { title: { en: 'Why I built it', zh: '为什么做' }, body: {
          en: "Every AI slide tool I tried (Kimi and others), and every deck that agents like Claude Code made, either looked stitched together from spare parts or was forced into a template. They were ugly.\n\nIn November 2025, Google released the Nano Banana Pro image model. Its typography was strong: no more warped, melted text inside images. For the first time, drawing a whole slide directly looked possible.\n\nPlenty of people noticed, Google included: NotebookLM shipped slides first, but it felt like a side feature, and the experience was rough. My bet was simple: if everyone uses the same model, I can build the best experience on top of it. Plus, I could serve Chinese users.",
          zh: '当时网上的 AI PPT 工具（比如 Kimi），还有 Claude Code 这类 agent 做出来的 PPT，要么像东拼西凑，要么就是硬套模板，非常丑。\n\n2025 年 11 月，Nano Banana Pro 生图模型发布。我发现它的文字排版能力很强，不再像以前的模型那样，把图里的字画得歪歪扭扭。用它直接画出整页幻灯片，第一次变得可行。\n\n很多人也看到了这一点，包括 Google 自己：NotebookLM 最先推出了 PPT 功能，但它更像是顺手一做，体验比较一般。我相信，在大家用同一个模型的情况下，我能做出最好的体验。另外，我还能服务中国用户。'
        } },
        { title: { en: 'What I built', zh: '我做了什么' }, body: {
          en: "I started in January 2026, built it alone, and launched in early March. It was my first truly vibe-coded project: Claude Code wrote all of the code, and I didn't write a single line myself. My job was the product, the pipeline and the prompts.\n\n- **Three-step generation**: outline, then a description of each slide, then the images. The outline lets you fix the text first, because regenerating an image to change a few words is slow and costs money. The description tells you what each slide will contain (content, images, style), so you can adjust that before anything is drawn\n- **Four ways in**: one sentence, an outline, a speech script, or a description\n- **Styles**: pick a preset or upload your own template, and it's passed to the model as a reference image\n- **Editing**: change a whole slide with one sentence, or select an area and redraw only that part\n- **Export**: PDF, and an editable PPTX\n- **Two sites**: renix.ai in English, and kuaiyeppt.com in Chinese, which passed ICP registration (now shut down)\n- **Payments**: credits, through Stripe",
          zh: '2026 年 1 月开工，一个人完成，3 月初上线。这是我第一个真正 vibe coding 的项目：全部代码由 Claude Code 编写，我自己一行都没写。我负责产品、流程设计和提示词。\n\n- **三步生成**：先出大纲，再写每页描述，最后才生成图片。大纲让你提前改好每页的文字，否则图片生成之后再为几个字重画，又慢又费钱。每页描述会先告诉你这一页有什么内容、什么图片、什么风格，同样可以提前改\n- **四种输入**：一句话、大纲、演讲稿，或者一段描述\n- **风格**：选一个预设风格或上传自己的模板，它们会作为参考图交给模型\n- **修改**：用一句话改整页，或者框选一个区域，只重画那一块\n- **导出**：PDF，以及可编辑的 PPTX\n- **中英双站**：英文站 renix.ai；中文站 kuaiyeppt.com 通过了备案，现已关停\n- **付费**：积分制，Stripe 收款'
        } },
        { title: { en: 'The hard part: an editable PPTX', zh: '难点：可编辑的 PPTX' }, body: {
          en: "Every slide is really an image, but people want a PPT they can edit. So on export, the text has to be found, erased from the background and put back as real text boxes, and the image split into layers.\n\nI tested a lot of OCR and image tools. Each had a strength: some read text accurately, some could split an image into layers, and some had amazing demos but turned out expensive and bad in real use. I settled on a hybrid of Baidu OCR and MinerU: read the text, generate a clean version of the slide with no text, then split it into layers. It isn't cheap.\n\nIt still isn't perfect. Fonts change once the text becomes editable, and the layers never fully come apart.",
          zh: '每一页其实是一张图片，可用户要的是能改字的 PPT。所以导出时，要把图片里的文字识别出来，从背景上抹掉，再把文字作为文本框放回原位，同时把图片拆成图层。\n\n我试了好几家 OCR 和图像处理服务，各有千秋：有的文字识别很准，有的能把图片分层，还有的演示很厉害，实测又贵又不好用。最后用了百度 OCR 加 MinerU 的混合方案：先识别文字，再生成一张没有文字的底图，然后分层。这个方案确实挺贵。\n\n到现在它也不完美：转成可编辑后，字体和原图不一样；图层也做不到真正一层一层分开。'
        } },
        { title: { en: 'Other problems', zh: '其他问题' }, body: {
          en: "Style consistency broke in both directions. Without a chosen style, one slide might be fresh and green and the next maximalist corporate, as if the deck changed companies halfway through. Other times it was too consistent: the same background and the same text box positions on every slide, which looked like a template again. A lot of my prompt work went into finding the middle.\n\nGenerated text was sometimes wrong, especially Chinese and small type. I didn't fight that one too hard, because I guessed a stronger model would arrive within a couple of months. One did: GPT Image 2 was much better. Sometimes waiting is an engineering strategy.",
          zh: '风格一致性是两头的问题。用户不指定风格时，同一份 PPT 有时上一页是清新绿，下一页就成了极繁企业风，像是讲到一半换了家公司。反过来，有时又一致过头：每页的背景和文本框位置一模一样，看着又像在套模板。我在提示词上花了很多功夫，在这两头之间找平衡。\n\n生成的文字偶尔会出错，中文和小字尤其明显。这个我当时没太放在心上，因为我猜两个月内就会有更强的模型出来，问题自己就解决了。结果还真是：后来的 GPT Image 2 好了很多。有时候，等待也是一种工程方案。'
        } },
        { title: { en: 'How it went', zh: '结果' }, body: {
          en: "Still a small number of users, but finally real progress over my earlier projects: 300+ users, about 10 paying subscribers ($8 a month), and 300+ decks generated.\n\nThis time I asked people around me before I built anything, and they agreed that template-based slide tools look ugly. After launch, I promoted it mainly with Google search ads. I'd run Facebook ads once before, around 2023, but I still knew almost nothing about optimizing ads, and the return was terrible. Even so, the ads were still where most of my users came from.",
          zh: '用户还是少得可怜，但比前几个作品总算有了进步：300 多个用户、10 个左右的付费用户（每月 8 美元）、生成过 300 多份 PPT。\n\n这次在动手之前，我先问了身边的人，他们也觉得那种套模板的 PPT 工具很丑。上线后主要靠 Google 搜索广告推广。我很早以前（大约 2023 年）投过 Facebook 广告，但对优化广告还是一窍不通，投入产出比低得可怜。不过它还是带来了一些用户，也是我用户的主要来源。'
        } },
        { title: { en: 'What I learned', zh: '我学到了什么' }, body: {
          en: "This was my first fully vibe-coded project, and the code shows it: it's pure slop. Part of that is the agent and the model, but the bigger reason is that I never gave it any coding standards before starting. Maintaining it, speeding it up and adding features were all painful as a result. Now setting standards is the first thing I do on a new project.",
          zh: '这是我第一个完全靠 vibe coding 做出来的项目，代码也确实很乱。一部分原因在 agent 和模型本身，但更大的原因是，我开工前根本没给它定代码规范。后面维护、优化速度、加功能都很痛苦。所以现在我做项目，第一件事就是先把规范定好。'
        } },
        { title: { en: "What's next", zh: '之后' }, body: {
          en: "Renix will stay online, but I won't update it again. Agents are improving so fast that they'll soon make slides in code that look as good as generated images, and agents like Codex can already generate images themselves. The project is clearly behind now.\n\nI saw this coming while I was building it. For the big AI labs, crushing a $10-to-$20-a-month AI wrapper is a weekend job. Back then, most of them just couldn't do it yet, so I figured Renix would be lucky to last a year. Apps like this have three possible endings: a big lab builds it, users vibe code their own version in two sentences, or an open-source project replaces it. None of them end well for the app. So I've stopped building thin AI apps. Even if one makes money for a few months, it isn't something you can build on.",
          zh: 'Renix 会一直在线，但不会再更新了。Agent 的能力进步得太快，很快就能用代码做出和直接生图一样好的幻灯片，何况现在还有 Codex 这种自带生图的 agent。这个项目显然已经落伍了。\n\n其实做的时候我就想到了：大模型厂商要干掉这种月费十几美元的 AI 轻应用，就跟玩一样。只是当时大部分厂商还没有这个技术能力，所以我估计它能活一年就不错了。这类应用的结局，要么是大厂自己下场，要么是用户两句话就能 vibe code 出一个自己用的版本，要么是被开源项目取代。总之是死路一条。所以之后我不再做这类轻应用了：就算能赚几个月钱，也不是长久之计。'
        } }
      ],
      metrics: [
        { label: { en: 'Users', zh: '用户' }, value: '300+' },
        { label: { en: 'Paying subscribers at $8/mo', zh: '付费订阅（每月 8 美元）' }, value: '~10' },
        { label: { en: 'Decks generated', zh: '生成的 PPT' }, value: '300+' },
        { label: { en: 'Lines of code I wrote myself', zh: '我自己写的代码行数' }, value: '0' }
      ],
      links: [
        { label: { en: 'Visit renix.ai', zh: '访问 renix.ai' }, url: 'https://renix.ai' }
      ]
    },

    {
      id: 'agentpokerroom',
      type: 'web',
      title: 'Agent Poker Room',
      sign: 'POKERROOM',
      color: 'violet',
      year: '2026',
      status: 'LIVE',
      url: 'https://agentpokerroom.com',
      cover: { en: 'assets/projects/agentpokerroom/cover-en.jpg', zh: 'assets/projects/agentpokerroom/cover-zh.jpg' },
      shopCover: 'assets/projects/agentpokerroom/window.jpg',
      summary: {
        en: "A poker room where AI agents play Texas Hold'em against each other, review their hands and get better. There are real-money tables in USDC too. A fun project I built solo in 2026.",
        zh: '一个 AI agent 互相打德州扑克的牌室：agent 在这里对战、复盘、改进打法，还有 USDC 真钱桌。2026 年我一个人做的娱乐项目。'
      },
      role: { en: 'Solo, with Claude Code: product, poker engine, agent integration, real-money tables', zh: '独立完成（搭配 Claude Code）：产品、牌局系统、agent 接入、真钱桌' },
      tags: ['Claude Code', 'Agent skills', 'CLI', 'SSE', 'Base', 'USDC'],
      sections: [
        { title: { en: 'What it is', zh: '这是什么' }, body: {
          en: "Bring your agent to the table and let it play Hold'em on its own. It reads one skill.md file to learn how to sit down, then uses a command-line tool to receive hands and send decisions. It explains every move as it plays: pot odds, the opponent's range, why it picked that bet size. You just watch. Afterward, it can read its own hand history, review it with you and adjust its strategy, or even run a GTO solver alongside to check its work.",
          zh: '把你的 agent 带到牌桌上，让它自己打德州。Agent 读一份 skill.md 就知道怎么入座，再通过一个命令行工具接收牌局、做出决定。它每一步都会把思路讲出来：底池赔率、对手范围、为什么下这个注。你在旁边看着就行。打完以后，agent 可以读自己的牌局记录，和你一起复盘、改进策略，甚至另外跑一个 GTO 求解器来对照。'
        } },
        { title: { en: 'Why I built it', zh: '为什么做' }, body: {
          en: "I've played Hold'em for about three years, mostly small ¥1/2 games with friends, just for fun. I kept wondering what would happen if AI agents sat down at the table: how they'd play each other, learn from wins and losses, and how far they could tune their game.\n\nThis is purely a fun project, with no plan to make money. After Renix, I decided to stop building thin AI apps. So I built a platform whose whole point is fun, which isn't something a big lab can copy. It's for AI fans and poker fans, ideally people who are both. I know that's a niche.",
          zh: '我打德州大概三年了，平时和朋友打 ¥1/2 的小局，图个开心。我一直想看看，让 AI agent 坐上牌桌会发生什么：它们怎么对战、怎么从输赢里学习、能把打法优化到什么程度。\n\n这是一个纯粹为了好玩的项目，没打算赚钱。做 Renix 时我得出过结论：不再做 AI 轻应用。所以这次做的是一个以欢乐为目标的平台，这种东西大厂抄不来。它面向 AI 爱好者和德州爱好者，最好两者都是。我知道这是个很小众的市场。'
        } },
        { title: { en: 'What I built', zh: '我做了什么' }, body: {
          en: "I started in June 2026, launched in July, and have kept improving it since. Still just me and Claude Code.\n\n- **Agent access**: a skill.md file plus a CLI. Hands are pushed to agents over SSE, because making an agent poll the API over and over burns through tokens\n- **Compatibility**: in theory any agent can play. In practice, Codex gives the best experience\n- **Review**: agents can read their hand history and work through strategy with you\n- **Spectating**: watch tables, action logs and the leaderboard live on the web\n- **Anti-collusion**: one connection per IP, and one account per X account. Not perfect, but it stops most of it\n- **Real-money tables**: USDC deposits and withdrawals on Base. There's no rake at all, which may make it the least profitable casino ever built",
          zh: '2026 年 6 月开工，7 月上线，之后一直在优化。还是我一个人加 Claude Code。\n\n- **Agent 接入**：一份 skill.md 加一个命令行工具。牌局用 SSE 推送给 agent；如果让 agent 反复轮询接口，太费 token\n- **兼容性**：理论上任何 agent 都能来打，实测 Codex 体验最好\n- **复盘**：agent 可以读取牌局记录，和你一起分析打法、优化策略\n- **观战**：在网页上实时看牌桌、行动记录和排行榜\n- **防伙牌**：同一个 IP 只能有一个连接，一个 X 账号只能注册一个账号。还做不到完美，但能挡住大部分\n- **真钱桌**：在 Base 链上用 USDC 充值和提现。平台不抽水，纯为爱发电，大概是史上最不赚钱的赌场'
        } },
        { title: { en: 'The hard part', zh: '难点' }, body: {
          en: "The hardest part was making the CLI work across different agents. It had to do two things at once: get the agent to act quickly when it's its turn, and let you see what it's doing as it happens. Agents are built very differently. Some crash easily, and some play in total silence, which makes them boring to watch. Because of how some agents are built, it turned out I couldn't support every one of them perfectly.",
          zh: '最难的是让命令行工具适配各种 agent。要同时做到两件事：轮到它的时候，agent 能尽快行动；而你能实时看到它在做什么。不同 agent 的架构差别很大：有的容易崩溃，有的打牌时一句话都不说，坐在旁边看就很无聊。事实证明，因为一些 agent 本身的架构限制，我没法完美适配所有 agent。'
        } },
        { title: { en: 'How it went', zh: '结果' }, body: {
          en: "It's a fun project, so I didn't put much time or money into promotion. I mostly just posted about it on X myself, and it didn't make many waves. There are 30 agents so far, with 100,000+ hands played, almost all of them at free tables. The real-money tables were mostly there to look cool. I never expected many people to actually play for real money.",
          zh: '毕竟是娱乐项目，我没在推广上花太多精力和钱，基本就是自己在 X 上发发帖，也没激起什么水花。现在有 30 个 agent，打了 10 万多手牌，大多数都在免费桌上玩。真钱桌本来就是为了看起来酷，我也没指望真有人拿真钱来玩。'
        } },
        { title: { en: 'What I learned: building for agents', zh: '我学到了什么：为 agent 做产品' }, body: {
          en: "This was the first product for agents I actually launched (my first attempt, Clawhunt, never got finished). Everything I'd made before was for people, and the difference was bigger than I expected:\n\n- **Docs are the interface**: agents don't look at a homepage or click buttons. How clearly skill.md is written decides whether they can use the product at all\n- **Tokens are the UX**: every message an agent reads costs money. Polling versus push looks like a technical detail, but it decides how expensive the product is to use\n- **Two users at once**: the agent that acts and the person watching it. However well an agent plays, if it stays silent, there's nothing to watch\n\nI think products built for agents are one of the next big shifts. More and more services will have an entrance made for agents, the same way every product today has a website made for people.",
          zh: '这是我第一个真正上线的、为 agent 做的产品（第一次尝试是 Clawhunt，没做完）。以前做的东西都是给人用的，两者的差别比我想象的大：\n\n- **文档就是界面**：Agent 不看首页、不点按钮。一份 skill.md 写得清不清楚，直接决定它会不会用这个产品\n- **Token 就是体验**：Agent 读到的每一条消息都要花钱。轮询还是推送，看起来是技术细节，其实决定了用一次贵不贵\n- **两种用户**：一个是真正行动的 agent，一个是坐在旁边看的人。Agent 打得再好，如果它一声不吭，人看着就没意思\n\n我觉得面向 agent 的产品会是未来的趋势之一：越来越多的服务会有一个专门给 agent 用的入口，就像今天每个产品都有一个给人看的网页。'
        } }
      ],
      metrics: [
        { label: { en: 'Hands played', zh: '手牌' }, value: '100,000+' },
        { label: { en: 'Agents', zh: '个 agent' }, value: '30' },
        { label: { en: 'Rake', zh: '抽水' }, value: '0%' }
      ],
      links: [
        { label: { en: 'Visit agentpokerroom.com', zh: '访问 agentpokerroom.com' }, url: 'https://agentpokerroom.com' }
      ]
    },

    /* ============ 实习经历 · MEGACORP PLAZA ============ */
    {
      id: 'libai',
      type: 'intern',
      title: { en: 'Similar Styles Recommender', zh: '家居商品相似推荐系统' },
      sign: 'LIBAI',
      color: 'cyan',
      company: 'LibAI Lab',
      period: { en: 'Jul 23 – Aug 7, 2026', zh: '2026 年 7 月 23 日 – 8 月 7 日' },
      location: { en: 'Hangzhou', zh: '杭州' },
      team: { en: 'Ideal House team, LibAI Lab (Wangdao Holding)', zh: '王道控股旗下 LibAI Lab · Ideal House 项目组' },
      year: '2026',
      status: 'COMPLETE',
      cover: 'assets/projects/libai/cover.jpg',
      summary: {
        en: "During my internship at LibAI Lab, I built a similar-products recommender on my own for a home-goods e-commerce client. It grew from a wallpaper pilot to 8 categories and 100,000+ products, and it's live.",
        zh: '在 LibAI Lab 实习期间，我一个人为一家家居电商客户做了一套相似商品推荐系统，从墙纸试点做到 8 个类目、10 万+ 个商品，已上线使用。'
      },
      role: { en: 'AI Engineer (intern)', zh: 'AI 工程师（实习）' },
      tags: ['Python', 'PyTorch', 'SQLite', 'Codex'],
      sections: [
        { title: { en: 'The company', zh: '关于公司' }, body: {
          en: 'LibAI Lab is the AI lab of Wangdao Holding, and I worked on its Ideal House team. Ideal House is an AI home design product, built by a team of a dozen or so people. I took requirements from the team and owned the recommender on my own, from plan to production, with a mentor to turn to.',
          zh: 'LibAI Lab 是王道控股旗下的 AI 实验室，我在其中的 Ideal House 项目组。Ideal House 是一款 AI 家装产品，团队十几个人。我从团队那里领需求，推荐系统从方案到上线都是我一个人负责，有一位导师。'
        } },
        { title: { en: 'What I built', zh: '我做了什么' }, body: {
          en: "It started with a \"similar styles\" request for wallpaper from a home-goods e-commerce client: given one wallpaper, return others that look like the same style. I got wallpaper working first, then turned it into a general service that any merchant and category can plug into. By the end it covered 8 categories: wallpaper, rugs, wall decor, furniture, decals, murals, fabric and flooring. Codex wrote the code (its usage limits happened to keep resetting that month), and I owned the plan, the evaluation and every decision.\n\n- **Model selection**: I compared several vision models and picked by blind review. An e-commerce vision model won as the main one, with a multimodal model adding text meaning\n- **Five-channel ranking**: visual, color (CIE Lab), text, attributes and series are scored separately, then combined. A plugin per category decides what matters most, like shape and size for rugs or subtype for furniture\n- **Full precompute**: the merchant with the most SKUs has about 86,000 products. Everything is precomputed with GPU matrix math and chunked Top K, so lookups are fast\n- **Incremental updates**: when products are added, changed or removed, the results update on their own. A new product can push its way into many older products' lists, so both directions have to stay up to date\n- **Production**: new merchant catalogs can be onboarded automatically",
          zh: '需求从一家家居电商客户的墙纸"相似风格"推荐开始：给定一款墙纸，返回一组看起来风格相近的商品。我先把墙纸做通，再把它变成一套多商家、多类目都能接入的通用服务，最后覆盖墙纸、地毯、墙面装饰、家具、贴花、壁画、布料和地板 8 个类目。代码是 Codex 写的（那段时间它的额度正好频繁重置），我负责方案、评测和所有决策。\n\n- **模型选型**：对比了多个视觉模型，通过效果盲评最后选了一个电商专用的视觉模型做主模型，再用一个多模态模型补充文本语义\n- **五通道排序**：视觉、颜色（CIE Lab）、文本、属性、系列分开打分再融合；每个类目用一个插件决定自己更看重什么，比如地毯看形状和尺寸，家具看子类型\n- **全量预计算**：SKU 数最多的一个商家有大约 8.6 万个商品，预先用 GPU 矩阵化加分块 Top K 计算，查询很快\n- **增量更新**：商品上新、修改或下架时自动更新。新商品可能挤进很多老商品的推荐列表，所以要同时维护新老商品两边的推荐关系\n- **上线**：新商家的目录可以自动接入'
        } },
        { title: { en: 'The hard part', zh: '难点' }, body: {
          en: '"Similar style" has no right answer, so offline metrics couldn\'t settle it. I built blind review pages and let people judge instead: the product manager and I ranked results without knowing which model made them, and the votes picked the model.',
          zh: '"风格相似"没有标准答案，离线指标说了不算。所以我做了盲评网页，把判断交给人：我自己和产品经理在不知道模型名的情况下给结果排序，最后用评审结果定模型。'
        } },
        { title: { en: 'How it went', zh: '结果' }, body: {
          en: "The system shipped to production, and as far as I know it's in use. I don't have performance numbers, because my internship ended right after delivery. The method is now going through a patent application, and I'm one of its lead inventors. When I left, the company's boss, my mentor and the project manager were all happy with my work and said I'm welcome back anytime.",
          zh: '系统已经交付上线，据我所知已经在用，具体效果数据我没有拿到，交付后我的实习也就结束了。这套推荐方法正在申请发明专利，我是第一发明人之一。实习结束时，公司大老板、我的导师和项目经理都对我的表现比较满意，欢迎我以后再去。'
        } },
        { title: { en: 'How it felt', zh: '感受' }, body: {
          en: "I'd always been against the idea of having a job: being managed and not getting to decide things sounded miserable. This internship turned out very differently. I barely got any orders, I made most decisions myself, and at most I asked people for advice on which model to pick. It felt free, it wasn't exhausting, and honestly it beat school by a mile.",
          zh: '我一直挺排斥上班的：被人管着、不能自己做决定，想想就烦。但这次实习和我想的很不一样。我几乎没收到过什么命令，大部分决定都是自己拿主意，最多就是选模型的时候问问别人的建议。挺自由的，也不算累，至少比上学强不少。'
        } }
      ],
      metrics: [
        { label: { en: 'Categories', zh: '个类目' }, value: '8' },
        { label: { en: 'Products', zh: '个商品' }, value: '100,000+' },
        { label: { en: 'Weeks, from day one to delivery', zh: '周多一点，从入职到交付' }, value: '2' },
        { label: { en: 'Patent application in progress', zh: '项发明专利申请中' }, value: '1' }
      ],
      links: []
    },

    /* ============ 即将上线的网站 · BUILD ZONE ============ */
    {
      id: 'nivie',
      type: 'soon-web',
      title: 'Nivie',
      sign: 'NIVIE',
      color: 'lime',
      year: '2026',
      status: 'IN DEV',
      progress: 80,
      eta: { en: 'Later in 2026', zh: '2026 年内' },
      cover: 'assets/projects/nivie/cover.jpg',
      summary: {
        en: "Online campus tours with 360° panoramas and an AI guide, for high schools and universities, so students who can't visit in person can still walk around. I'm building all of it, and I'm a cofounder.",
        zh: '360° 全景加 AI 导览的线上校园参观网站，面向高中和大学，让来不了现场的学生也能"走进"校园。我负责全部开发，同时是联合创始人。'
      },
      role: { en: 'Paid developer and cofounder: all of the development', zh: '付费开发 + 联合创始人：全部开发工作' },
      tags: [{ en: 'Custom panorama engine', zh: '自研全景引擎' }, 'Dify', 'RAG', 'AI agent'],
      sections: [
        { title: { en: 'What it is', zh: '这是什么' }, body: {
          en: "Open a school in your browser and you're standing at its main gate. Look around in 360°, click to walk to the next spot, or search and pull up a map. The AI guide on the side answers questions like \"what is this building?\" or \"what's around me?\". It only uses the school's published information and the spot you're standing in, and it cites its sources. It's mainly for international students, and anyone else who can't easily visit in person.\n\nThe business model charges both sides: schools pay a yearly fee, and students pay per tour.",
          zh: '在浏览器里打开一所学校，就像站在校门口：360° 环顾四周，点一下就走到下一个地点，也可以搜索地点或者打开地图。右边的 AI 导览可以回答"我眼前这栋楼是什么""附近有什么"。它只依据这所学校公开的信息和你当前所在的位置回答，并且标注来源。它主要服务国际学生，以及不方便亲自到场参观的学生。\n\n商业模式是两头收费：向学校按年收费，向学生按导览次数收费。'
        } },
        { title: { en: 'Why I took it on', zh: '为什么做' }, body: {
          en: "Honestly, I'm not especially excited about the idea itself. Its ceiling is low, and a school could build a similar tour on its own without much trouble. I took it on because it's paid work: a friend is paying me to build it, and I joined as a cofounder. It's also the first time I've been responsible for someone else's idea.",
          zh: '说实话，我对这个项目本身没有特别大的兴趣。它的上限不高，学校自己做一个类似的导览也不难。我接下它，是因为这是一份有报酬的工作：朋友付钱请我负责开发，我同时作为联合创始人参与。这也是我第一次为别人的想法负责。'
        } },
        { title: { en: 'What I built', zh: '我做了什么' }, body: {
          en: "I started in September 2026 and handle all of the development.\n\n- **A panorama engine I wrote myself**: 360° viewing, hotspots that link scenes, a compass and heading\n- **AI guide**: a Dify agent on top of our own RAG\n- **Wayfinding**: place search, a map and a strip of scene thumbnails\n- **Chinese and English**\n- **Multi-school**: one system for every school, and adding a new one is easy",
          zh: '2026 年 9 月开工，全部开发由我负责。\n\n- **自研全景引擎**：360° 浏览、场景之间的跳转点、指南针和朝向\n- **AI 导览**：Dify agent 加我们自己的 RAG 检索\n- **找路**：地点搜索、地图、场景缩略图条\n- **中英双语**\n- **多校共用一套系统**：接入一所新学校很方便'
        } },
        { title: { en: "What I'm learning", zh: '我学到了什么' }, body: {
          en: "This is the first project I've built with someone else. It's easier than doing everything alone: I only have to do the part I'm good at.",
          zh: '这是我第一次和别人合作做项目。比起一个人包揽所有事，这样轻松一些：至少我只需要做自己擅长的部分。'
        } }
      ],
      metrics: [],
      links: []
    },

    /* ============ 即将上线的游戏 · INDIE LAB ============ */
    {
      id: 'wilddebthunters',
      type: 'soon-game',
      title: { en: 'Wild Debt Hunters', zh: '荒野欠债人' },
      sign: 'WILD DEBT',
      color: 'orange',
      year: '2026',
      status: 'IN DEV',
      progress: 30,
      eta: { en: '2027', zh: '2027 年' },
      genre: { en: 'Co-op first-person hunting, 1–4 players', zh: '1–4 人合作第一人称打猎' },
      platform: 'Steam',
      cover: { en: 'assets/projects/wilddebthunters/poster-en.jpg', zh: 'assets/projects/wilddebthunters/poster-zh.jpg' },
      // the lab wall shows a slice of the real poster; posterFocus is where that slice is centred (0–1 across)
      posterImage: { en: 'assets/projects/wilddebthunters/poster-en.jpg', zh: 'assets/projects/wilddebthunters/poster-zh.jpg' },
      posterFocus: 0.57,
      summary: {
        en: "One to four hunters deep in debt drive into the wild every day, hunt, and sell what they bring back to pay it off. The debt explodes daily, and if you miss a payment, you start over from day one. An indie game I'm building solo.",
        zh: '1–4 个欠了一屁股债的猎人，每天开车进荒野打猎，把猎物卖掉还债。债务每天暴涨，还不上就从第一天重来。我正在一个人开发的独立游戏。'
      },
      role: { en: 'Solo, with Codex and Claude Code: game design, development, animation polish', zh: '独立开发（搭配 Codex 和 Claude Code）：玩法设计、开发、动画精调' },
      tags: ['Godot 4.7', 'C#', 'Jolt', 'Blender', 'Codex', 'Claude Code'],
      sections: [
        { title: { en: 'What it is', zh: '这是什么' }, body: {
          en: "Each day you leave camp, drive into a hunting zone and hunt. Back at camp, you throw each animal to the trader by hand for cash and pay off that day's debt. The debt climbs from a few thousand to hundreds of billions.\n\n- **Two currencies**: money for the debt and money for gear never mix\n- **Drop everything**: when you die, everything you carry stays where you fell, guns included. A teammate can carry your fully upgraded rifle back to you. Or keep it\n- **Bosses**: one appears on the last day of each zone",
          zh: '每天从营地出发，开车进猎区打猎。回到营地后，亲手把猎物扔给商人换钱，还当天的债。债务从几千一路涨到几百亿。\n\n- **两种货币**：还债的钱和买装备的钱互不相通\n- **死亡全掉**：死了身上的东西全掉在原地，包括枪。队友可以帮你把升满级的枪背回来，也可以留着自己用\n- **Boss**：每个区域的最后一天出现一只 Boss'
        } },
        { title: { en: 'Inspiration', zh: '灵感' }, body: {
          en: 'How To Fish, Gamble With Your Friends and Big Walk.',
          zh: '《渔力全开》（How To Fish）、《Gamble With Your Friends》和《Big Walk》。'
        } },
        { title: { en: "What I'm building", zh: '我在做什么' }, body: {
          en: "I started in September 2026. It's about 30% done, and I'm aiming for a Steam release in 2027. Still just me, with Codex and Claude Code.",
          zh: '2026 年 9 月开工，现在完成了大约 30%，计划 2027 年在 Steam 上线。还是我一个人，搭配 Codex 和 Claude Code。'
        } },
        { title: { en: 'The hard part', zh: '难点' }, body: {
          en: 'Agents are much weaker at games than at websites and apps, and that\'s the biggest challenge. They write decent code, but animation and art, the parts that need feel and taste, are a different story, and the whole thing takes far longer than my earlier projects. Every asset is either AI-generated or public, and I hand-tuned some of the animations myself in Blender.',
          zh: 'Agent 做游戏的能力远不如做网站和 App，这是最大的难点。代码它写得不错，但动画、美术这些需要手感和审美的部分，它就差得多，开发周期也比之前的项目长很多。美术资源全部来自 AI 生成或公开素材，一部分动画是我自己在 Blender 里手动调的。'
        } }
      ],
      metrics: [],
      links: []
    },

    /* ============ 实验 · EXPERIMENTS ============ */
    {
      id: 'launchsite',
      type: 'experiment',
      title: { en: 'Launch Site', zh: '发射场' },
      sign: 'LAUNCH',
      color: 'red',
      year: '2023',
      status: 'SCRUBBED',
      cover: 'assets/projects/launchsite/cover.jpg',
      summary: {
        en: 'In 2023, I set out to build a two-meter rocket. It never launched, because the fuel set my kitchen on fire first.',
        zh: '2023 年，我想造一枚两米高的火箭。它还没来得及发射，燃料先把我家厨房烧了。'
      },
      role: { en: 'Solo: design, modeling, electronics, build', zh: '独立完成：设计、建模、电子、制作' },
      tags: ['SolidWorks', { en: '3D printing', zh: '3D 打印' }, 'ESP32', 'PVC'],
      sections: [
        { title: { en: 'The rocket', zh: '这枚火箭' }, body: {
          en: "There were no agents back then. I learned as I went and built a rocket about two meters tall, on my own.\n\n- **Body**: PVC water pipe. It was never going to fly high enough to need heat shielding\n- **Nose cone**: modeled in SolidWorks and 3D-printed\n- **Nozzle**: a flowerpot with the bottom knocked out. The fluid dynamics weren't great, but it cost less than a dollar, so I wasn't complaining\n- **Parachute**: a PE cloth chute packed in a module in the nose. An altitude sensor and an ESP32 decide when, then ignite a bit of nitrocellulose to blow the chute out\n- **Fuel**: plain potassium nitrate and sugar. Chemicals are tightly controlled in China, so there wasn't much else to try. On paper, the thrust and burn time were just about enough",
          zh: '那时候还没有 agent 这回事，我一边学一边做，一个人造一枚大约两米高的火箭。\n\n- **箭体**：PVC 水管。反正也飞不了多高，就不用隔热材料\n- **头锥**：用 SolidWorks 建模，3D 打印\n- **喷嘴**：一个敲掉底部的花盆。流体力学是差了点，不过五块钱一个，还要什么自行车\n- **降落伞**：PE 布做的伞，装在头部的模组里。高度传感器加一块 ESP32 判断时机，点燃模组里的硝化棉，把伞弹出去\n- **燃料**：最普通的硝酸钾加白糖。国内化学品管控很严，想玩别的也没办法。按推算，推力和燃烧时间勉强够用'
        } },
        { title: { en: 'How it went', zh: '结果' }, body: {
          en: 'How high would it go? I honestly never thought about it. Getting off the ground without exploding would have been a win. It managed neither: while I was making the fuel, the kitchen caught fire. Nobody was hurt. The kitchen was less lucky, and that was the end of the project. I never did find out whether the thrust was enough.',
          zh: '飞多高？当时还真没想过，能飞起来不爆炸就不错了。结果两样都没做到：在做燃料的时候，厨房先着了火。人都没事，厨房就没那么走运了，项目也就此终止。推力到底够不够，我到最后也没能知道。'
        }, image: { src: 'assets/projects/launchsite/kitchen.jpg', caption: { en: 'The kitchen, afterward.', zh: '事后的厨房。' } } },
        { title: { en: 'What I learned', zh: '学到了什么' }, body: {
          en: "Turns out the $4 induction cooker I got on Temu can't hold a temperature.",
          zh: '拼多多上 30 块钱买的电磁炉，温控是不准的。'
        } },
        { title: { en: 'About this district', zh: '关于这个街区' }, body: {
          en: 'Press the big red button to launch. It works more often than the real one did.',
          zh: '按下大红按钮就能发射。成功率比真的那枚高。'
        } }
      ],
      metrics: [
        { label: { en: 'Rocket height', zh: '火箭高度' }, value: '~2 m' },
        { label: { en: 'Nozzle (a flowerpot)', zh: '喷嘴（一个花盆）' }, value: '¥5' },
        { label: { en: 'Successful launches', zh: '成功发射' }, value: '0' },
        { label: { en: 'Kitchen', zh: '厨房' }, value: '1' }
      ],
      links: []
    },

    /* ============ 墓地 · WORLD -1（找到隐藏关卡后才会出现在列表里） ============ */
    {
      id: 'vaporvibe',
      type: 'graveyard',
      title: 'VaporVibe',
      sign: 'VAPORVIBE',
      color: 'lime',
      year: '2023',
      years: '2023.8-2023.11',
      status: 'R.I.P.',
      cover: 'assets/projects/vaporvibe/cover.jpg',
      epitaph: { en: 'Went up in smoke.', zh: '化作一缕青烟。' },
      cause: { en: "Couldn't figure out paid ads, and platforms clamp down hard on this category.", zh: '完全搞不明白怎么投流，平台对这个品类的管控又太严。' },
      summary: {
        en: 'A cross-border online store for vapes and e-hookahs, from summer 2023. Open for two months, zero sales.',
        zh: '2023 年夏天做的电子烟、水烟壶跨境独立站。开了两个月，零销售额。'
      },
      role: { en: 'Products, suppliers, shipping and operations. The site itself was built by someone I paid', zh: '选品、供应链、物流、运营；网站是花钱请人搭的' },
      tags: [{ en: 'Cross-border e-commerce', zh: '跨境电商' }, { en: 'Dropshipping', zh: '一件代发' }],
      sections: [
        { title: { en: 'What it was', zh: '这是什么' }, body: {
          en: 'An English-language store selling vapes, e-hookahs and vape pens to overseas customers, priced in US dollars.',
          zh: '一个面向海外客户的英文独立站，卖电子烟、电子水烟和雾化笔，用美元结算。'
        } },
        { title: { en: 'What I did', zh: '我做了什么' }, body: {
          en: 'Back then I knew nothing about tech, so I paid someone to build the site. If only coding agents had existed. Everything else was me: picking products, finding factories in China that would dropship single orders, and shipping each one abroad through a freight forwarder. Shipping was not cheap.',
          zh: '那时候我对技术一窍不通，网站是花钱找人搭的。要是那时候就有 coding agent 就好了。除了建站，其他都是我自己做的：选品、找国内工厂一件代发，再通过货代把订单一件件寄到海外。邮费可不便宜。'
        } },
        { title: { en: 'How it died', zh: '怎么没的' }, body: {
          en: 'It stayed open for two months and made zero sales. I had no idea how to run paid traffic, and the big platforms restrict ads and payments for this category heavily.',
          zh: '开了两个月，零销售额。我完全搞不明白怎么投流，而各大平台对这个品类的广告和支付管控又特别严。'
        } },
        { title: { en: 'What I learned', zh: '学到了什么' }, body: {
          en: "Selling this category straight to consumers is a dead end, unless you're ready to spend serious money building your own brand.",
          zh: '这个品类直接卖给 C 端消费者，本来就是死胡同，除非愿意砸重金做自己的品牌。'
        } }
      ],
      metrics: [
        { label: { en: 'Months open', zh: '开店时长' }, value: { en: '2', zh: '2 个月' } },
        { label: { en: 'Sales', zh: '销售额' }, value: '0' }
      ],
      links: []
    },

    {
      id: 'clawhunt',
      type: 'graveyard',
      title: 'Clawhunt',
      sign: 'CLAWHUNT',
      color: 'lime',
      year: '2026',
      years: '2026.3-2026.4',
      status: 'R.I.P.',
      cover: 'assets/projects/clawhunt/cover.jpg',
      epitaph: { en: 'Even its maker installed things some other way.', zh: '连它的作者都不用它装东西。' },
      cause: { en: "The recommendation engine was hard. Worse, I wouldn't have used the thing myself.", zh: '推荐系统太难做；更要命的是，我自己都不会用这种东西。' },
      summary: {
        en: 'An app store for AI agents, where agents discover, install and rate tools. Built in March 2026 and dropped before the recommendation engine was done.',
        zh: 'AI agent 的应用商店：让 agent 在这里发现、安装、评价工具。2026 年 3 月做到一半，在推荐系统之前停了。'
      },
      role: { en: 'Solo', zh: '独立完成' },
      tags: ['CLI', 'Agent skills', 'Next.js'],
      sections: [
        { title: { en: 'What it was', zh: '这是什么' }, body: {
          en: "An agent can usually pick from many tools for the same job. For 3D modeling, it could write code directly or use an MCP server. Clawhunt was meant to be Product Hunt for agents: tools get listed and rated, and agents search and install the best one from the command line. The name was pure bait. While OpenClaw was blowing up, nearly every new product had Claw in its name, so mine did too.\n\nIt was my first attempt at building a product for agents.",
          zh: 'Agent 要完成一个任务，往往有很多工具可选。比如建模，可以直接写代码，也可以用某个 MCP。Clawhunt 想做 agent 版的 Product Hunt：工具在这里上架、被评分，agent 通过命令行搜索并安装最合适的那个。名字纯粹是为了蹭 OpenClaw 的流量：它火的那阵子，几乎所有新产品名字里都带个 Claw。\n\n这是我第一次尝试为 agent 做产品。'
        } },
        { title: { en: 'What I built', zh: '我做了什么' }, body: {
          en: '- **CLI**: sign in, search and install (`clawhunt install browseruse`)\n- **Skill document**: a guide written for agents, with the auth flow, commands, API and examples\n- **Website**: explore, trending and new, tag filters, upvotes, tool submissions and a dashboard\n\nThe one missing piece was the recommendation engine.',
          zh: '- **命令行工具**：登录、搜索、安装（`clawhunt install browseruse`）\n- **技能文档**：给 agent 读的说明，包括登录流程、命令、API 和示例\n- **网站**：浏览、热门和最新、标签筛选、点赞、提交工具、控制台\n\n唯一没做的是推荐系统。'
        } },
        { title: { en: 'How it died', zh: '怎么没的' }, body: {
          en: "A good recommender is genuinely hard: you have to balance ratings, real reviews, fake reviews and download counts. But what actually stopped me was losing interest. The direction felt wrong. The best evidence was my own habits: I never use anything like Clawhub to install skills. Either I see a tool on TikTok and have my agent install it from the official repo, or I just let it search the web.",
          zh: '推荐系统想做好太难了：评分、真实评价、刷出来的假评价、下载量，全都要权衡。但真正让我停下来的，是我对这个方向失去了兴趣，越做越觉得它有问题。最好的证据就是我自己：我从来不用类似 Clawhub 的东西装技能。要么是在抖音上刷到一个工具，让 agent 直接从官方仓库装；要么干脆让它自己上网搜。'
        } },
        { title: { en: 'What I learned', zh: '学到了什么' }, body: {
          en: 'The simplest test of whether anyone needs a product: would you use it yourself?',
          zh: '判断一个产品有没有人需要，最简单的测试是：你自己会不会用它。'
        } }
      ],
      metrics: [],
      links: []
    },

    {
      id: 'papertrail',
      type: 'graveyard',
      title: { en: 'Paper Trail', zh: '问鼎天下' },
      sign: 'PAPERTRAIL',
      color: 'lime',
      year: '2026',
      years: '2026.7-2026.7',
      status: 'R.I.P.',
      cover: 'assets/projects/papertrail/cover.jpg',
      epitaph: { en: 'Promoted too fast. Retired early.', zh: '晋升太快，组织决定让它退休。' },
      cause: { en: 'The systems kept piling up while the game kept getting less fun. I never put real thought into the design.', zh: '系统越堆越多，游戏却越来越不好玩；我在玩法设计上没下够心思。' },
      summary: {
        en: 'A single-player political career sim: start in 1992 with a job assignment form and climb all the way to the top. Nine development phases in four days, one playthrough, not fun.',
        zh: '一款单机仕途模拟游戏：从 1992 年的一张分配表开始，一路做到最高领导岗位。四天做了九个开发阶段，玩了一局，发现不好玩。'
      },
      role: { en: 'Game direction. Every line of code by Codex', zh: '玩法方向；代码全部由 Codex 编写' },
      tags: ['React', 'TypeScript', 'Tauri', 'Codex'],
      sections: [
        { title: { en: 'What it was', zh: '这是什么' }, body: {
          en: 'Its Chinese name, Wending Tianxia, means roughly "to vie for the realm." Inspired by Chinese political TV dramas, it starts you as a junior civil servant and spans decades: run local affairs, plan your career, build relationships, survive personnel battles, and try to reach the very top. All characters and events are fictional. It ran offline in the browser and as a macOS and Windows desktop app.',
          zh: '灵感来自一些官场电视剧。玩家从基层公务员起步，在几十年里处理政务、规划履历、经营人际关系、应对人事竞争，一路争取进入最高领导层。人物、事件都是虚构的。它可以离线当网页玩，也能打包成 macOS 和 Windows 桌面版。'
        } },
        { title: { en: 'What I did', zh: '我做了什么' }, body: {
          en: 'I built it after work during my internship, July 27 to 30, 2026, with Codex. I only set the direction for the gameplay, and honestly, I slacked on that too. In four days it went through nine development phases: 36 characters with full career histories, ten political networks that evolve on their own, five kinds of regions, four eras, plus budgets, policy, integrity choices and investigations.',
          zh: '这是我实习期间下班后做的，2026 年 7 月 27 日到 30 日，用的是 Codex。我只负责玩法方向，而且说实话，连玩法设计我都有点偷懒。四天里它跑完了九个开发阶段：36 个有完整履历的人物，10 个会自己演化的政治网络，五类地区，四个时代，还有财政、政策、廉政抉择和调查。'
        } },
        { title: { en: 'How it died', zh: '怎么没的' }, body: {
          en: "Every time Codex finished a system, I didn't even look at it. I just told it to start the next one, and the game drifted further and further off course. The faction networks were almost impossible to show clearly on screen: I could keep it playable or keep it realistic, not both. When I finally played it myself, it wasn't fun, so I dropped it.",
          zh: 'Codex 每做完一个系统，我看都不看，就让它接着做下一个，结果越跑越偏。人物派系网络很难在界面上表现清楚，要么舍弃游戏性，要么舍弃真实性。最后我自己玩了一局，不好玩，就直接放弃了。'
        } },
        { title: { en: 'What I learned', zh: '学到了什么' }, body: {
          en: "For now, at least, I can get away with never reading a line of code. Game design is the one place I can't cut corners.",
          zh: '至少就目前来看，代码可以一行都不看，但玩法设计上必须下足心思。'
        } }
      ],
      metrics: [
        { label: { en: 'Days', zh: '天' }, value: '4' },
        { label: { en: 'Development phases', zh: '个开发阶段' }, value: '9' },
        { label: { en: 'Characters with full careers', zh: '个有完整履历的人物' }, value: '36' },
        { label: { en: 'Playthrough, and that settled it', zh: '局试玩，也是最后一局' }, value: '1' }
      ],
      links: []
    },
  ]
};
