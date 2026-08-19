# dsh-client-ui-skin-aemeath · 爱弥斯 · 星炬回响

DeepSeek Harness Web GUI 的鸣潮爱弥斯主题皮肤。

> **参考项目**：本皮肤参考 [Ewnscat-ya/dsh-client-ui-skin-denia](https://github.com/Ewnscat-ya/dsh-client-ui-skin-denia) 的工程结构开发（模块加载工厂模式、双形态舞台架构、调色板面板、DOM 装饰逻辑），致谢详见文末。

## 效果预览

> 预览图取自用户壁纸素材（`C:\Users\chen\Pictures\壁纸\plugin`），亮/暗各一张。

| 星炬白昼（亮色） | 幽灵之夜（暗色） |
|---|---|
| ![星炬白昼](preview/light.png) | ![幽灵之夜](preview/dark.png) |

## 特性

- **双形态切换**：星炬白昼（亮色）/ 幽灵之夜（暗色），含数据脉冲形态切换动画
- **程序化视觉**：无官方素材也能成形——数据粒子场、星炬角标、声痕 favicon、数据流边框均由 SVG + CSS 生成
- **立绘舞台**：预留左右立绘 + Q 版吉祥物位，上传素材即可启用（见调色板）
- **玻璃卡片层级**：root 半透明 + backdrop-filter 模糊
- **数据粒子场**：前景大光点 + 背景微尘双层上浮
- **数据流边框**：青蓝流线 + 粉芯节点，跟随侧栏宽度
- **渐变文字**：工作区/会话标题粉青渐变
- **装饰条 + 四角星**：侧边栏粉金数据流装饰
- **深色/浅色按钮文字替换**：星炬白昼 / 幽灵之夜
- **新会话欢迎界面注入**：爱弥斯标题 + 副标题 + 台词
- **侧栏收起/展开自适应布局**

## 版权所有人

| 版权所有人 | 版权所有内容 |
|---|---|
| Kuro Games（库洛游戏） | 「鸣潮」游戏作品及爱弥斯（Aemeath）角色形象原作 |
| Aemeath / 本皮肤作者 | 皮肤覆盖层实现（CSS 配色、SVG 装饰、DOM 装饰逻辑） |

\*本皮肤为同人创作，与 Kuro Games 无关联。角色立绘 / 背景素材需用户自行提供。

## 安装

### 懒人版

对你的 dsh 说：

```
安装一下这个皮肤包：<皮肤包路径或 git 仓库地址>
```

### 手动安装

```sh
# 方式一：作为独立 bundle 安装到目标 profile
cd <harness>
dsh plugin --profile desktop add <本皮肤包路径>

# 方式二：手动复制
# 将本包复制到
#   <harness-home>/.dsh/profiles/desktop/node_modules/@dsh-external/dsh-client-ui-skin-aemeath/
# 然后在 <harness-home>/.dsh/profiles/desktop/cordis.patch.yml 的 dsh-skin managed 段添加：
#   - id: ui-skin-aemeath
#     disabled: false
```

重启 DSH 后在设置 → 皮肤中选择「爱弥斯 · 星炬回响」（或在皮肤中心 Try on / Apply）。

## 调色板

皮肤加载后，界面右下角会出现一个可折叠的调色板面板。所有设置自动保存在浏览器 localStorage，刷新不丢失。

### 亮色 / 暗色（分形态独立控制）

| 控件 | 说明 |
|---|---|
| 背景图 | 上传自定义背景 / 清除恢复默认 |
| 左立绘 | 显示/隐藏左侧角色立绘 |
| 右立绘 | 显示/隐藏右侧角色立绘 |
| Q版吉祥物 | 显示/隐藏 Q 版表情包 |

### 通用（亮暗两形态同时生效）

| 控件 | 范围 | 默认值 |
|---|---|---|
| 对话宽度 | 500–1000px | 780px |
| 立绘高度 | 30–80vh | 55vh |
| 立绘水平偏移 | −50–50px | 0px |
| 表情大小 | 60–240px | 120px |
| 表情竖直偏移 | −200–200px | 0px |
| 背景透明度 | 20–100% | 100% |
| 消息文本框 | 开/关 | 关 |
| 文本框透明度 | 20–100% | 68% |
| 数据粒子场 | 开/关 | 开 |
| 粒子数量 | 5–40 | 20 |
| 粒子速度 | 30–200% | 100% |
| 数据流边框 | 开/关 | 开 |
| 装饰条 | 开/关 | 开 |

点击「♻ 恢复默认设置」可一键还原所有选项。

## 兼容性

- DSH Web：0.1.0-rc.6、0.1.0-rc.7（dsh-web-frontend）
- 平台：Web
- 最近验证日期：2026-08-18

## 致谢

| 来源 | 说明 |
|---|---|
| [dsh-client-ui-skin-denia](https://github.com/Ewnscat-ya/dsh-client-ui-skin-denia)（Ewnscat） | 皮肤工程结构：模块加载工厂模式、双形态舞台架构、调色板面板、DOM 装饰逻辑（本项目直接仿其结构） |
| [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui)（zhu1090093659） | 皮肤工程脚手架与皮肤中心机制 |

## 许可

本仓库以 **CC BY-NC-SA 4.0**（署名-非商业性使用-相同方式共享）发布，禁止商业性使用。署名链见 `NOTICE`。

Character "Aemeath" (爱弥斯) and "Wuthering Waves" (鸣潮) are trademarks of Kuro Games. This skin is a fan work and is not affiliated with or endorsed by Kuro Games.
