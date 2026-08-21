# dsh-client-ui-skin-aemeath · 爱弥斯 · 星炬回响（v2）

DeepSeek Harness Web GUI 的鸣潮爱弥斯主题皮肤——**v2 纯资产形态**，按皮肤中心 v2 契约（issue #506）组织：皮肤是纯资产目录（`skin.json` manifest v2 + `skin.css` + `hooks.mjs` + `assets/` + `preview/`），由皮肤中心（`@linxin666/dsh-client-ui-skin-center` 0.2.x）加载渲染。切换皮肤**免重启、免刷新**——不写 `cordis.patch.yml`、不进 boot graph。

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
- **🎨 调色板**：右下角面板，立绘显隐 / 高度 / 水平偏移、粒子场与数据流边框开关，localStorage 持久化
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

## 调色板（🎨）

右下角 🎨 按钮打开面板（皮肤内建，非皮肤中心面板），设置存 `localStorage`（key `aemeath-palette-v2`）：

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

## 兼容性

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
