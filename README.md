# EDDIE.EXE · NEON-8

一座可以走进去的 8-bit 赛博霓虹城市，每一栋楼都是一个作品。

- **网站街**：每家店是一个已上线的网站，橱窗里会滚动播放你的网站截图
- **巨企广场**：每栋摩天楼是一段实习经历，大厅里是"人事档案"
- **施工区**：即将上线的网站，楼盖到几层取决于完成进度
- **独立游戏实验室**：即将推出的游戏，海报贴在墙上
- **像素游戏厅**：五台能玩的街机，带本地排行榜。方向键移动，F（或空格）确认、发射，Enter 开始
  - **Commit Hero**：节奏游戏，谱面直接从电台的三首歌生成，← ↓ ↑ → 对应 add / commit / push / merge
  - **Hex Appeal**：用 RGB 三个滑块把颜色调出来，按人眼色差（ΔE）打分，最后两轮只能凭记忆
  - 贪吃蛇、打砖块（Bug Breaker）、Deadline Invaders
- **霓虹外卖**：在拉面车按 F 接单，限时把面送到某个 NPC 或某栋楼，越快小费越多；端着面不能传送
- **配电箱**：家门口的名字招牌坏了，配电箱却在城市尽头的电台坡（涂鸦墙旁边，看完所有作品才会走到）。旋转电线把电接通，每解开一块板，家里的招牌就亮一个字母；全部修好后招牌会发光，标题画面的招牌也会满电
- **CAPSULE-8 扭蛋机**：游戏厅门口，3 金币扭一次，贴纸来自你的作品、技能和城里的角色，集齐整本图鉴
- **实验区 · 发射场**：按 F 发射火箭，倒计时、升空，在天上炸成烟花和名字。每次大约 1/20 的概率火箭会直接在发射台上炸掉
- **电台坡**：点唱机换音乐（全部用 Web Audio 实时合成），涂鸦墙可以画 16×16 像素画
- **霓虹车站**：坐上列车看片尾字幕，结尾是联系方式
- 赶时间的人可以直接打开 **快速浏览**：同样的内容，普通网页形式，适合招聘方

中英双语，手机上会变成一台掌机（NEON BOY COLOR）。

---

## 本地预览

不需要安装任何东西，也没有构建步骤。

```bash
cd neon-portfolio
python3 -m http.server 8000
```

然后打开 <http://localhost:8000>。直接双击 `index.html` 也能打开，但字体和截图在部分浏览器里需要通过本地服务器才能正常加载。

---

## 改成你自己的内容

**几乎所有内容都在 `js/data.js`。** 打开它，搜索 `【待填写】` 和 `[TODO]`，逐个替换即可。

### 个人资料 `profile`

| 字段 | 说明 |
| --- | --- |
| `name` | 霓虹招牌上的名字。只支持英文字母和数字，建议 ≤ 8 个字符 |
| `fullName` / `role` / `tagline` / `location` | 全名、身份、一句话介绍、所在地 |
| `available` / `status` | 状态灯和状态文字（例如"正在寻找实习"） |
| `email` / `links` | 邮箱和外链（GitHub、LinkedIn、简历……） |
| `bio` | 自我介绍，每个字符串是一段 |
| `stats` | RPG 属性条，0–100 |
| `skills` | 技能背包，`level` 1–5，`icon` 可选 sword / shield / potion / gem / key / scroll / map / star / heart / bolt |
| `timeline` | 冒险日志（时间线） |
| `funFacts` | 自动贩卖机、问号砖、终端 `fortune` 会随机掉落的冷知识 |
| `blimp` | 天上飞艇的滚动字幕（英文大写） |

### 作品 `projects`

每个作品的 `type` 决定它在城市里长什么样：

| type | 在城市里 | 快速浏览里 |
| --- | --- | --- |
| `web` | 网站街的商店 | 游戏卡带 |
| `intern` | 巨企广场的摩天楼 | 工牌 |
| `soon-web` | 施工区的工地 | 施工图纸 |
| `soon-game` | 实验室墙上的海报 | 游戏盒 |
| `experiment` | 实验区的发射场（任务日志告示牌） | 卡带 |
| `graveyard` | WORLD -1 的墓碑（`sign` 是碑上的名字，另有 `years`、`epitaph` 墓志铭、`cause` 死因） | 墓碑卡片，找到 WORLD -1 后才出现 |

常用字段：`title`、`sign`（楼上招牌文字，英文大写，≤ 9 个字符最好看）、`color`（magenta / cyan / yellow / lime / orange / violet / blue / red）、`summary`、`role`、`tags`、`sections`（详情页正文，可以随意增删）、`metrics`（成果数据卡片）、`demo`（演示视频）、`links`。网站和应用都用 `type: 'web'`，应用可以加 `kind: 'app'`，详情页的标签会显示「应用」。

- **新增作品**：复制一个对象，改一个不重复的 `id`。城市会自动多出一栋楼，地图、快速浏览、终端里也会自动出现。
- **删除作品**：删掉对应对象即可。
- **长文本格式**：空一行 = 新段落；`- ` 开头 = 列表；`- [x]` / `- [ ]` = 打勾清单；`**文字**` = 加粗。
- **只写一种语言**：双语字段写成 `{ en: '...', zh: '...' }`；如果只想要一种语言，直接写字符串就行。

### 图片

把图片放进 `assets/` 文件夹，然后在 `data.js` 里写路径：

```js
cover: 'assets/projects/startable/cover.jpg',   // 详情页封面，也会显示在商店橱窗里
demo: {                                         // 演示视频，在详情页里直接播放
  src: 'assets/projects/startable/demo.mp4',
  poster: 'assets/projects/startable/demo-poster.jpg',
  caption: { en: '...', zh: '...' }
},
```

`cover` 留空时会自动生成一张像素风占位图；也可以写成 `{ en: '...', zh: '...' }`，中英文界面各显示一张。商店橱窗想显示另一张图，可以加 `shopCover`；即将上线的游戏可以用 `posterImage` 把真海报贴到实验室墙上（`posterFocus` 控制截取横向的哪一段，0–1）。竖屏视频在 `demo` 里加 `portrait: true`，会限制高度居中显示。视频建议压到几 MB 以内（H.264 MP4）。

### 简历

把 PDF 放到 `assets/resume.pdf`，`profile.links` 里已经预留了链接。

---

## 部署

整个文件夹就是一个静态网站，任何静态托管都可以：

- **GitHub Pages**：把文件夹推到仓库，Settings → Pages → 选择分支。
- **Vercel / Netlify**：直接拖拽文件夹上传。

字体已经全部放在 `fonts/` 里（自托管），不依赖 Google Fonts，所以在国内访问也没问题。

---

## 操作

| 按键 | 作用 |
| --- | --- |
| ← → / A D | 行走（按住 Shift 奔跑） |
| 空格 / ↑ | 跳跃，空中再按一次二段跳 |
| F | 进门、对话、使用物品 |
| M | 地图 + 快速传送 |
| L | 快速浏览 |
| ` | 终端 |
| Esc | 菜单 / 关闭窗口 |

鼠标可以直接点击建筑，角色会自己走过去。手机上用屏幕下方的十字键和 A / B 键。

**分享单个作品**：打开任意作品详情时，地址栏会变成 `#/p/作品id`，把这个链接发给别人，对方会直接看到这个作品。`#list` 直接打开快速浏览，`#play` 跳过开机直接进城。

---

## 彩蛋（剧透警告）

<details>
<summary>点开查看</summary>

- 在家门口一直往左走，别停 → WORLD -1，未完成项目的墓地，还有一只猫
- 城里一共藏着 5 只猫，点击或走到旁边按 F 撸猫
- 问号砖从下面顶：金币、蘑菇（变大）、冷知识、1UP
- 输入 ↑↑↓↓←→←→BA → 金色无敌模式（无限跳、金币翻倍）
- 走路时打字：`neon` `rain` `snow` `party` `binary` `brew` `jobs` `purr` `byte` `zap` `nyan`
- 点月亮三次，月亮会眨眼
- 标题画面连点招牌 10 次；按 C 投币
- 终端里：`sudo collab`、`sl`、`rm -rf /`、`neofetch`、`hack`、`cowsay`、`ls -a` 然后 `cat .secret`、`sudo cat secrets/eggs.txt`
- 打开浏览器控制台，输入 `eddie.help()`
- 凌晨 0–5 点来访有隐藏成就
- 45 个成就，进度保存在浏览器本地

</details>

---

## 文件结构

```
index.html          页面骨架
css/style.css       全部样式
js/data.js          ← 你的内容（主要只改这个）
js/core.js          语言、存档、工具函数、界面文字（中英文）
js/audio.js         音效和芯片音乐（Web Audio 合成）
js/pixel.js         调色板、像素字体、抖动渐变
js/sprites.js       角色、猫、NPC、金币等像素画
js/city-art.js      每栋建筑的绘制
js/world.js         城市：布局、物理、渲染、交互
js/ui.js            窗口、HUD、对话气泡、地图、成就面板
js/project.js       作品详情窗口 + 自动生成的像素缩略图
js/list.js          快速浏览页
js/title.js         标题画面
js/games/*.js       街机框架和五个小游戏
js/fuse.js          配电箱（修招牌解谜）
js/gacha.js         扭蛋机和贴纸图鉴
js/terminal.js      终端
js/paint.js         涂鸦墙
js/credits.js       片尾列车
js/eggs.js          彩蛋
js/achievements.js  成就列表
fonts/              Fusion Pixel 12px、Silkscreen、Jersey 10（均为 SIL OFL 协议）
```

想改界面上的固定文字（按钮、提示语），在 `js/core.js` 的 `N.STR` 里，中英文各一份。
NPC 的台词在 `js/world.js` 顶部的 `NPC_LINES` 和 `BYTE_LINES`。

### 更新后浏览器还是旧版本？

`index.html` 里每个脚本和样式都带着 `?v=...` 版本号。改完代码后把这些版本号统一换一个新值（比如改成当天日期），浏览器就会重新下载，不会出现新旧文件混用。
