# Visual Redesign — Warm Cream + Terracotta

**Date:** 2026-05-24  
**Status:** Implemented & shipped

## 核心决策

### 方向
从中性 Zinc 灰色系切换到暖色系。用户反馈原来的配色缺乏温度和个性，通过三次视觉对比选定：**暖奶油底色 × 赤陶橙强调色 × 高对比排版**。

### 颜色 Token

| | Light | Dark |
|---|---|---|
| 页面底色 | `rgb(250,246,240)` 奶油白 | `rgb(25,15,8)` 深暖棕 |
| 卡片底色 | `rgb(255,251,245)` | `rgb(34,20,10)` |
| 主文字 | `rgb(28,15,6)` 暖近黑 | `rgb(245,232,213)` 奶油 |
| 次要文字 | `rgb(122,92,68)` 暖棕 | `rgb(160,120,88)` 暖棕 |
| 强调色 | `rgb(192,90,40)` 赤陶橙 | `rgb(212,128,74)` 暖橙 |
| h2 标题色 | `rgb(152,60,16)` 深赤陶 | `rgb(232,168,96)` 琥珀金 |

### 字体系统
双轨制：英文标题走 Fraunces（已有），中文标题走 Songti SC fallback。两者统一设 `font-weight: 800` + `letter-spacing: -0.025em`，视觉对比度明显提升。中文不支持 Fraunces，但 Songti SC 在 weight 700+ 时已足够清晰。

### Blob 背景
从紫粉/橄榄色系改为暖橙/赤陶/琥珀金三色，与新强调色系统保持一致。

## 实施范围

**Phase 1（CSS Token）**
- 所有 `:root` 和 `[data-theme="dark"]` 变量
- Blob 颜色
- 字体 font-weight 和 letter-spacing

**Phase 2（组件细节）**
- 项目卡片、收藏站点卡片：硬编码白色背景 → 暖白/暖深色
- Dark mode 代码块背景暖化
- TOC 激活项、项目筛选器激活状态：紫粉 → 赤陶橙
- About 页头像边框：中性灰 → 赤陶橙
- 首页主按钮：改用 accent 赤陶橙填充色

**额外交互优化**
- 首页最近文章卡片：补齐入场动画（stagger fade-in）和 hover 上浮效果，与博客列表页统一
- Header：theme toggle 与 lang switcher 视觉间距光学补偿（gap: 14px）
- Header hover：两个按钮统一为颜色加深 + 无背景矩形；SVG stroke-width 加粗到 3.2；文字用 `-webkit-text-stroke: 0.8px`
- Theme toggle SVG：hover 时 fill 填入动画（`fill: transparent` → `fill: currentColor`）

## 关键取舍

- **不换中文 Web Font**：中文字体文件体积 2–5MB，不适合个人博客。排版改善依靠 font-weight 和间距而非字体切换。
- **`-webkit-text-stroke` 而非 font-weight 做 hover 加粗**：font-weight 变化会导致文字宽度变化、布局跳动；text-stroke 在视觉上等效且无副作用。
- **Phase 1 先上线验证**：用户无法通过数值判断颜色效果，先实施 token 变更让用户在真实站点确认方向，再打磨组件细节。
