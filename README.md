# dsh-client-ui-skin-aemeath · 爱弥斯 · 星炬回响

DeepSeek Harness Web GUI 的鸣潮爱弥斯主题皮肤，支持**双形态**：

- **皮肤中心 v2 形态**（`skin.json` + `skin.css` + `hooks.mjs` 纯资产目录）：由皮肤中心（`@linxin666/dsh-client-ui-skin-center` 0.2.x）加载渲染，切换**免重启、免刷新**。
- **独立插件形态**（cordis bundle，v1.0.0 新增）：`package.json` + `cordis.patch.yml` + `lib/`，走 DSH 官方 web 插件管线，**不依赖皮肤中心**，提供一个**设置区界面开关**整体启用/停用皮肤。此形态下 hooks 逻辑全部在 `lib/client.js` 内自包含运行，不受「用户皮肤 hooks 403」限制。

## 效果预览

> 预览图取自用户壁纸素材，亮/暗各一张。

| 星炬白昼（亮色） | 幽灵之夜（暗色） |
|---|---|
| ![星炬白昼](preview/light.png) | ![幽灵之夜](preview/dark.png) |

## 特性

- **双形态切换**：星炬白昼（亮色）/ 幽灵之夜（暗色），主题联动背景与立绘
- **左右立绘**：亮/暗各一套（粉发少女半透明氛围 + 底部渐隐融入背景），跟随主题自动切换
- **免重启切换**：皮肤中心 0.2.x 原子切换引擎（`skin-controller`），应用/试穿即时生效，刷新页面直接以当前皮肤启动（无 FOUC）
- **背景插画**：亮色=4K 壁纸（粉发少女蝴蝶光效）、暗色=太空壁纸（星球纸飞机），带渐变遮罩（scrim）
- **程序化装饰**：数据粒子场（前后双层）、数据流链边框、四角星火花、学院徽章、favicon、标题栏 wordmark
- **欢迎界面**：新会话 hero 台词（「……你要走了吗？我会在这里等你回来。」）
- **🎨 调色板**：右下角面板，立绘显隐 / 高度 / 水平偏移、粒子场与数据流边框开关（皮肤中心形态存 localStorage；插件形态走 DSH 设置区并持久化到 profile）
- **🌈 回复文字配色**：助手消息正文与代码/链接/强调等分元素上色（亮暗两套配色），见下方「回复文字配色」一节
- **交互安全**：全部装饰层 `pointer-events:none`，不拦截任何点击与输入

## 文件结构

```
aemeath/
├── skin.json      # manifest v2：id / contributes.stylesheet / backgroundMedia / facets.client
├── skin.css       # L1 token 重映射（--dsw-alias-*）+ 装饰样式；安全管线自动 scope 到 html[data-dsh-skin="aemeath"]
├── hooks.mjs      # 立绘舞台 / 粒子场 / 链边框 / 四角星 / 徽章 / favicon / 标题 / 欢迎界面 / 调色板 / 消息标记器
├── assets/
│   ├── char-left.png / char-right.png          # 亮色左右立绘
│   ├── char-left-dark.png / char-right-dark.png # 暗色左右立绘
│   ├── palace-light.jpg / palace-dark.jpg       # 亮/暗背景壁纸
│   ├── data-light.svg / data-dark.svg           # 数据流边框
│   ├── star-corner.svg / data-swag.svg          # 四角星与装饰
│   ├── emblem.png / favicon.svg / titlebar-brand.svg
└── preview/
    ├── light.png / dark.png                     # 效果预览图
```

## 安装

前提：已安装皮肤中心 **0.2.x**（`@linxin666/dsh-client-ui-skin-center`）。皮肤来源两个：

1. **内置（hooks 生效，推荐）**：整个目录复制到

   ```
   <profile>/node_modules/@linxin666/dsh-client-ui-skin-center/skins/aemeath/
   ```

   目录名与 `skin.json` 的 `id` 一致即被目录册发现，`origin=builtin`，`hooks.mjs` 可执行，全部视觉效果生效。

2. **用户目录（hooks 被拒）**：复制到 `$DSH_HOME/skins/aemeath/`（即 `~/.dsh/skins/aemeath/`）

   皮肤可加载（CSS + 背景），但 v2 契约中**用户皮肤 hooks 因未过官方评审被 403 拒绝**，立绘等 JS 装饰不生效。要完整效果请用内置方式。

> ⚠️ 升级皮肤中心包会覆盖内置 `skins/`，升级后需重新复制本目录。

## 作为独立插件安装（带开关）

本仓库同时可作为 **cordis bundle 插件** 安装（denia 皮肤同款形态），这是 **v1.0.0 推荐的方式**。此模式**不依赖皮肤中心**，走 DSH 官方 web 插件管线，因此不受「用户皮肤 hooks 403」限制——立绘、粒子场、背景、**回复文字配色全部生效**。

### 安装

```sh
# 本地路径（或 git url）
dsh plugin --profile <name> add ./aemeath-skin
# 或从 GitHub 直接安装
dsh plugin --profile <name> add https://github.com/1691695205/aemeath-skin
```

重启 DSH 后生效。

### 界面开关与设置区

皮肤设置挂在 **DSH 设置界面 → 插件 → `ui-skin-aemeath`**，全部控件即时生效、持久化到 profile 文件：

| 控件 | 类型 | 范围/选项 | 默认 |
|---|---|---|---|
| **enabled** | 开关 | 启用 / 停用（总开关，关=整皮肤卸载回默认界面） | 开 |
| left / right | 开关 | 左 / 右立绘显示 | 开 |
| charHeight | 滑块 | 立绘高度 30–80vh | 55vh |
| offsetX | 滑块 | 立绘水平偏移 −200–200px | 0px |
| bubbles | 开关 | 粒子场 | 开 |
| bubbleCount | 滑块 | 泡泡数量 5–40 | 20 |
| bubbleSpeed | 滑块 | 泡泡速度 30–200% | 100% |
| chain | 开关 | 数据流边框 | 开 |
| corners | 开关 | 四角星芒 | 开 |
| emblem | 开关 | 学院徽章 | 开 |
| **msgColor** | 开关 | 回复文字配色 | 开 |
| msgFrame | 开关 | 消息文本框 | 关 |
| msgOpacity | 滑块 | 文本框透明度 20–100% | 68% |
| contentWidth | 滑块 | 对话宽度 400–1200px | 600px |
| bgOpacity | 滑块 | 背景透明度 20–100% | 100% |

- **持久化**：`profiles/<name>/data/dsh-client-ui-skin-aemeath/settings.json`，刷新、重启、清浏览器存储都不丢
- **总开关关闭** = 完整卸载：移除装饰 DOM、恢复 body 背景样式、移除注入的 CSS，回到 DSH 默认界面；设置区里再打开立即恢复

### 文件（插件形态）

```
├── package.json          # dsh.bundle.patch → cordis.patch.yml；dsh.client.platform: web
├── cordis.patch.yml      # insert ui-skin-aemeath 到 web 插件名单
├── lib/index.js          # 宿主端：/api/dsh-aemeath/settings (GET/PUT) + installSettingsSection 设置区
├── lib/client.js         # 浏览器端：内联素材 + skin.css + 装饰管线 + 开关轮询（构建产物）
├── scripts/build-client.mjs  # 从 client.template.mjs + assets + skin.css 生成 lib/client.js
└── lib/client.template.mjs   # client 源码模板（占位符由构建脚本填充）
```

> **构建**：改动 `assets/` 或 `skin.css` 后运行 `node scripts/build-client.mjs` 重新生成 `lib/client.js`（素材以 base64 内联，构建产物体积约 13MB）。

### 两种形态差异

| | 皮肤中心 v2 形态 | 独立插件形态（v1.0.0） |
|---|---|---|
| 依赖 | 需装 `dsh-client-ui-skin-center` 0.2.x | 无需皮肤中心 |
| hooks（立绘/粒子/配色等 JS 装饰） | 内置目录生效；**用户目录被 403 拒绝** | 全部生效（内联在 client.js） |
| 开关 | 皮肤中心面板「总开关」 | **DSH 设置区 `ui-skin-aemeath` 开关** |
| 设置持久化 | 内置：localStorage | **profile 文件**（跨刷新/重启/清存储） |
| 升级覆盖风险 | 内置目录随皮肤中心包升级被覆盖 | 无（作为独立插件依赖） |

## 调色板（🎨）

> 皮肤中心 v2 形态自带右下角 🎨 按钮面板（皮肤内建，非皮肤中心面板），设置存 `localStorage`（key `aemeath-palette-v2`）。**独立插件形态不使用此浮动面板**——所有控件已并入 DSH 设置区 `ui-skin-aemeath`（见「作为独立插件安装」），持久化到 profile 文件。

| 控件 | 范围 | 默认 |
|---|---|---|
| 左立绘 | 显示 / 隐藏 | 显示 |
| 右立绘 | 显示 / 隐藏 | 显示 |
| 立绘高度 | 30–80vh | 55vh |
| 立绘水平偏移 | −50–50px | 0px |
| 粒子场 | 开 / 关 | 开 |
| 数据流边框 | 开 / 关 | 开 |
| 回复文字配色 | 开 / 关 | 开 |

## 回复文字配色（🌈）

皮肤会对**助手回复正文**做分元素上色，亮/暗各一套配色，覆盖正文、标题、链接、强调、代码、引用、列表、表格与分隔线：

| 元素 | 亮色（星炬白昼） | 暗色（幽灵之夜） |
|---|---|---|
| 正文 | `#7A4E8A` 粉紫 | `#D0A8E0` 粉紫 |
| 标题 h1–h3 | 粉→玫→金渐变 | 粉→青渐变 |
| 链接 | `#B84E78` 玫红 | `#F0A0C0` 亮玫红 |
| 强调 strong/em/b | `#B84E78` 玫红加粗 | `#F2A8C6` 亮玫红加粗 |
| 行内代码 | `#4C7FA0` 青蓝 + 浅青底 | `#8FD3E8` 亮青 + 青底 |
| 代码块 pre | 青蓝底 + 暖金左条 | 青底 + 暖金左条 |
| 引用 blockquote | 次级紫 + 金边 | 亮紫 + 金边 |
| 列表标记 | 玫红 | 亮玫红 |
| 表格 | 玫红边框 / 表头 | 青边框 / 青表头 |
| 分隔线 | 暖金 | 暖金 |

**机制说明**：

- **锚点**：`hooks.mjs` 内置「消息标记器」，轮询为每条助手消息容器（`data-chat-flow-kind="assistant"` / `"assistant-step"`，找不到时回退 `[data-streaming]` / 官方 markdown 类）打上 `data-aemeath-msg` 属性
- **样式**：`skin.css` 的「⑭ MESSAGE TEXT PALETTE」段以 `[data-aemeath-msg]` 为作用域写分元素配色；正文同时重映射官方 token `--dsw-alias-label-primary` 并 `!important` 兜底，保证压过官方默认色
- **为什么不用** `data-dsh-part="message-body"`：该语义属性由皮肤中心的 semantic adapter 打在 `[data-streaming]` 上，而 `data-streaming` **只在消息流式生成时存在**——已完成的历史消息没有它，会导致配色落空；消息标记器专为此绕开
- **调色**：改 `skin.css` 中「⑭」段的色值即可，无需动 hooks；改完把文件同步到皮肤中心内置目录（`<profile>/node_modules/@linxin666/dsh-client-ui-skin-center/skins/aemeath/`）并刷新页面生效

## 机制

- **CSS 作用域**：所有样式经皮肤中心 CSS 安全管线（lightningcss）强制 scope 到 `html[data-dsh-skin="aemeath"]`；`:root`/`html` 合并进 scope，`body` 成为后代
- **hooks 契约**：`facets.client.entry` → `hooks.mjs`，默认导出 `defineSkinHooks()` 返回 `{ apply(ctx) }`；`ctx` 提供 `theme.get/subscribe`、`onCleanup`、`assetBase`；无顶层副作用，切换即新 activation
- **背景**：manifest `backgroundMedia` 声明式（资产 + scrim），hooks 同步接管（主题订阅切换亮/暗 palace 图），优先级 Wallpaper Engine 壁纸 > 用户手动背景 > 皮肤背景
- **主题**：亮=星炬白昼（4K 壁纸）、暗=幽灵之夜（太空壁纸），`body[data-ds-dark-theme]` 驱动

## 更新记录

### v1.0.0 — 2026-08-25 · 独立插件形态（带界面开关）

**新增**
- 插件化改造（denia 同款 cordis bundle）：新增 `package.json`、`cordis.patch.yml`、`lib/index.js`、`lib/client.js`、`scripts/build-client.mjs`
- **DSH 设置区开关**：`ui-skin-aemeath` 设置区（`enabled` 总开关 + 15 项调色板控件），关=皮肤完整卸载回默认界面
- **profile 持久化**：设置存 `profiles/<name>/data/dsh-client-ui-skin-aemeath/settings.json`，跨刷新/重启/清浏览器存储不丢
- 宿主端设置 API：`GET/PUT /api/dsh-aemeath/settings`（loopback 鉴权、字段校验、原子写）
- hooks 逻辑整体迁移进 `lib/client.js` 自包含运行，绕开皮肤中心「用户皮肤 hooks 403」限制

**技术要点**
- client bundle 按 DSH `__ModuleLoader__.load({ id, factory })` 契约注册（`exports.apply = apply`）
- 不依赖 `dsh.client.inject` 注入链：主题检测自实现（`body[data-ds-dark-theme]` + MutationObserver），素材以 base64 data URI 内联
- 已知踩坑：访问未注入的 `ctx.onCleanup` 会抛 `cannot get property ... without inject`，故 client 完全自包含、不触碰 ctx 属性

### 皮肤中心 v2 形态（历史）

- 皮肤中心 0.2.x 加载渲染；切换免重启、免刷新
- 已知限制：升级皮肤中心包会覆盖内置 `skins/`；用户目录形态下 hooks 不执行

## 兼容性

**插件形态（v1.0.0，推荐）**
- DSH Web：`0.1.0-rc.6 ~ 0.1.1-rc.2`（`dsh.client.version` 声明区间）
- 依赖：`schemastery`（dependencies）、`@deepseek-ai/dsh-settings`（peer，由 DSH 共享层提供）、`@deepseek-ai/cordis`（peer）
- 不依赖皮肤中心

**皮肤中心 v2 形态**
- 皮肤中心：`@linxin666/dsh-client-ui-skin-center` **0.2.x**（v2 契约，issue #506）
- hooks 契约：`x-org.linxin666.skin-center/v1alpha1`
- 已知限制：升级皮肤中心包会覆盖内置 `skins/`；用户目录形态下 hooks 不执行

## 参考项目

- **v1 工程结构**参考 [Ewnscat-ya/dsh-client-ui-skin-denia](https://github.com/Ewnscat-ya/dsh-client-ui-skin-denia)（模块加载工厂模式、双形态舞台架构、调色板面板、DOM 装饰逻辑）；v1 版本见本仓库 `v1` 分支
- **v2 形态**遵循 [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) 的皮肤中心 v2 契约（`contracts/skin-manifest-v2.schema.json`、`contracts/hooks-api.d.ts`）

## 致谢

| 来源 | 说明 |
|---|---|
| [dsh-client-ui-skin-denia](https://github.com/Ewnscat-ya/dsh-client-ui-skin-denia)（Ewnscat） | v1 皮肤工程结构（本项目 v1 直接仿其结构） |
| [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui)（zhu1090093659 / linxin666） | 皮肤中心 v2 契约、CSS 安全管线、切换引擎与壁纸桥 |

## 版权与许可

「鸣潮」游戏作品及爱弥斯（Aemeath）角色形象版权归 **Kuro Games（库洛游戏）**所有；「星炬学院 / 拉海洛 / 隧者之剑 / 声痕」为相关设定。角色立绘 / 背景素材由用户自行提供。

本皮肤为**同人创作**，与 Kuro Games 无关联；仓库以 **CC BY-NC-SA 4.0**（署名-非商业性使用-相同方式共享）发布，署名链见 `NOTICE`。
