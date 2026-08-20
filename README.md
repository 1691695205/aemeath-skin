# dsh-client-ui-skin-aemeath · 爱弥斯 · 星炬回响（v2）

DeepSeek Harness Web GUI 的鸣潮爱弥斯主题皮肤——**v2 纯资产形态**。

## 这是什么

按皮肤中心 v2 契约（issue #506）组织：皮肤是**纯资产目录**（`skin.json` manifest v2 + `skin.css` + `hooks.mjs` + `assets/` + `preview/`），由皮肤中心（`@linxin666/dsh-client-ui-skin-center` 0.2.x）加载渲染。切换皮肤**免重启、免刷新**——不写 `cordis.patch.yml`、不进 boot graph。

## 文件

| 文件 | 说明 |
|---|---|
| `skin.json` | manifest v2：`contributes.stylesheet` / `backgroundMedia`（亮暗背景 + scrim）/ `facets.client`（hooks 入口） |
| `skin.css` | L1 token 重映射（`--dsw-alias-*`）+ 装饰样式；CSS 安全管线自动 scope 到 `html[data-dsh-skin="aemeath"]` |
| `hooks.mjs` | 立绘舞台（亮/暗主题切换）、粒子场、数据流链边框、四角星、学院徽章、favicon、标题、欢迎界面、**🎨 调色板**（localStorage 持久化）；所有装饰层 `pointer-events:none` |
| `assets/` | 立绘 4 张（亮/暗左右）、背景 2 张（亮=4K壁纸、暗=太空壁纸）、SVG 装饰、emblem |
| `preview/` | 亮/暗预览图 |

## 安装

皮肤中心 0.2.x 的皮肤来源有两个：

1. **内置（hooks 生效，推荐）**：把整个目录复制到
   `node_modules/@linxin666/dsh-client-ui-skin-center/skins/aemeath/`
   ——目录名与 `skin.json` 的 `id` 一致即被发现，`origin=builtin`，`hooks.mjs` 可执行，全部视觉效果生效。

2. **用户目录（hooks 被拒）**：复制到 `$DSH_HOME/skins/aemeath/`（`~/.dsh/skins/aemeath/`）
   ——皮肤可加载（CSS + 背景），但 v2 契约中**用户皮肤 hooks 因未过官方评审被 403 拒绝**，立绘等 JS 装饰不生效。要完整效果请用内置方式。

> 升级皮肤中心包会覆盖内置 `skins/`，升级后需重新复制本目录。

## 机制

- **背景**：`backgroundMedia` 声明式（manifest）+ hooks 同步接管（`theme.subscribe` 切换亮/暗 palace 图与 scrim）
- **立绘/装饰**：`hooks.mjs` 创建，主题切换亮/暗立绘；全部装饰层内联 `pointer-events:none`，不拦截任何交互
- **调色板**：右下角 🎨 —— 左右立绘显隐、立绘高度（30–80vh）、水平偏移（-50~50px）、粒子场/数据流边框开关；localStorage key `aemeath-palette-v2`
- **主题**：亮色=星炬白昼（4K 壁纸），暗色=幽灵之夜（太空壁纸）

## 参考项目

- v1 工程结构参考 [Ewnscat-ya/dsh-client-ui-skin-denia](https://github.com/Ewnscat-ya/dsh-client-ui-skin-denia)（模块加载工厂模式、双形态舞台架构、调色板面板、DOM 装饰逻辑）
- v2 形态遵循 [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) 的皮肤中心 v2 契约（`contracts/skin-manifest-v2.schema.json`、`contracts/hooks-api.d.ts`）

## 版权

「鸣潮」游戏作品及爱弥斯（Aemeath）角色形象版权归 **Kuro Games（库洛游戏）**所有；「星炬学院 / 拉海洛 / 隧者之剑 / 声痕」为相关设定。本皮肤为同人创作，与 Kuro Games 无关联。
