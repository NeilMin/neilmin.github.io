# 博客 UI/UX 改进项目 — Agent Handover 文档

## 项目基本信息

| 字段 | 内容 |
|------|------|
| **项目名** | Neil Min 个人博客 |
| **仓库** | https://github.com/NeilMin/neilmin.github.io |
| **本地路径** | `/Users/neil/Documents/my-blog-site/` |
| **框架** | Hugo + PaperMod 主题（submodule） |
| **语言** | 英文(en) + 中文(zh) 双语，i18n |
| **当前分支** | `main`（已含所有改动，直接 push） |
| **当前 Commit** | `9c59aab` (feat: add E2E animation tests + fix homepage recent posts invisible) |
| **部署方式** | GitHub Pages (`gh-pages` 分支)，GitHub Actions 自动构建 |
| **本地预览** | `hugo server` → http://localhost:1313 |

---

## 今天干了什么（Phase 1 & Phase 2 完成）

### Phase 1：修根本（已全部完成）
- 色彩系统重构：Zinc 调色板 + Blue accent，亮色/暗色可区分
- 首页文章展示：profile mode 下方追加 Recent Posts（最近3篇）
- 修复 Archive 页面面包屑重复问题

### Phase 2：充实内容面（已全部完成）

#### A. 入场动画（IntersectionObserver）
- **Blob 首页背景**：`assets/js/blob-layout-geometry.js` + `post-entries-animation.js`
  - drift 从页面加载就跑，entrance WAAPI 只管位移缩放，无缝切换
  - CSS `prefers-reduced-motion` 支持
- **About 页面**：`assets/js/about-entrance-animation.js`
  - `.about-section` 区块依次淡入上浮，stagger
  - 修复 viewport check 导致的动画破坏 bug
- **Blog/Posts 列表**：`assets/js/post-entries-animation.js`
  - above-fold 交错入场 reveal（stagger delay）
  - below-fold 滚动时 reveal，IntersectionObserver 驱动
  - **重要**：`--awaiting` class 只在 `.Section == "posts"` 时加，其他页面不加（否则 opacity:0 无 JS 清除会一直不可见）

#### B. 搜索功能（Local / Fast / Zero dependency）
- **实现**：`assets/js/fastsearch.js`（Fuse.js 搜索）
- **页面**：`layouts/_default/search.html` + `/zh/search/` 双语
- **特性**：实时搜索、空结果反馈、清空重置

#### C. 项目页筛选动效
- **实现**：`assets/js/projects-showcase-filters.js`
- 过滤点击激活 transition，卡片显示/隐藏动效

#### D. TOC 条件显示
- 文章页 TOC：`ShowToc = true`，仅在文章内容充足时显示

### E2E 测试套件（Phase 2 收尾）
- **工具**：Playwright + `playwright.config.js`
- **测试文件**：`tests/e2e/animation-stagger.spec.js`（10 个测试）
- **测试覆盖**：
  - 4 个页面的 above-fold 交错入场
  - below-fold 不预显示
  - 滚动触发 reveal
  - 搜索空结果/清空流程
  - 项目页过滤动效
  - **首页 Recent Posts 可见性回归测试**（防止 `--awaiting` 再次卡死）
- **运行**：`cd /Users/neil/Documents/my-blog-site && npx playwright test --config=playwright.config.js`
- **状态**：10/10 全通过 ✓

### Git 记录摘要
```
9c59aab feat: add E2E animation tests + fix homepage recent posts invisible
bdb6063 Fix project card animation: add requestAnimationFrame for above-fold reveal
1be29be Fix entrance animation broken by viewport check change
517b9f7 Phase 2: Fix flash, add search feedback, filter transition, TOC condition
7008815 fix: remove overly broad accent rules breaking post cards
90fae69 UI/UX P0: Apply Zinc+Blue design system (colors + accent)
527c5d5 docs: add AGENTS.md, gitignore AGENTS.local.md
89dd008 feat: about 页面入场动画
b9e8f1e fix: let blob drift run from page load
10e0913 ✨ feat: blog post entry animation + fix zh about page intro
```
已全部 push 到 `main` 分支，remote 同步。

---

## Phase 3：待完成（视觉打磨）

Phase 1（修根本）+ Phase 2（内容面）已完成，Phase 3 视觉打磨原计划包含：

### 3.1 文章卡片化
- Blog 列表页改为卡片视图（封面 + 摘要 + 元信息）
- 当前状态：已部分实现（Phase 1 期间讨论过但未深入）
- 方向：参考现有 `project-card` 的视觉语言，保持一致

### 3.2 字体与排版细化
- 代码字体：检查等宽字体在亮/暗模式下的表现
- 正文字体：检查阅读体验，调整行高/字重
- 中文字体：确保衬线/无衬线风格与整体协调

### 3.3 TOC 视觉改进
- 当前：基础 ShowToc
- 改进：固定侧边栏、滚动跟随、高亮当前章节

### 3.4 其他可选项
- 暗色模式细节优化（Neil 暗色模式用得更多，优先级高）
- 首页进一步个性化（Blob 动效参数微调）
- 双语切换器 UI 优化

---

## 工作环境

### 必读文件（接手后第一时间读）
- `{workspace}/AGENTS.md` — Agent 工作区规范
- `{workspace}/SOUL.md` — 范德彪人格定义
- `{workspace}/MEMORY.md` — 长期记忆（项目背景 + Neil 偏好）

### 关键路径
```
博客本地目录: /Users/neil/Documents/my-blog-site/
Hugo 预览:    http://localhost:1313/
GitHub 仓库:  https://github.com/NeilMin/neilmin.github.io
```

### 日常操作
- **启动预览**：`cd /Users/neil/Documents/my-blog-site && hugo server`
- **运行测试**：`cd /Users/neil/Documents/my-blog-site && npx playwright test`
- **提交改动**：`git add . && git commit -m "描述" && git push origin main`

### 重要约束
1. **Neil 不需要 AI 截屏**，自己会打开浏览器看效果
2. 所有内部链接必须保持语言一致（中文页→中文目标，英文页→英文目标）
3. 修改前先摸清现有结构，稳妥改动，不出意外
4. prefers-reduced-motion 无障碍设计已实现，保持兼容
5. 暗色模式视觉优先于亮色模式

### 已安装的工具链
- Node.js v22.21.1（Playwright 测试）
- Hugo（博客构建）
- Git（版本控制）
- Chrome/Edge（E2E 测试）

---

## Neil 的偏好速查

| 偏好 | 说明 |
|------|------|
| 风格 | 直接、不废话、不铺垫 |
| 沟通 | 一句话说清楚的事不拆三段 |
| 版本控制 | 强调用 git，随时可以回滚 |
| 测试 | 有问题就写测试，防止再犯 |
| 暗色模式 | 用得比亮色多，视觉效果优先保证 |
| 动画 | 克制，不喧宾夺主 |
| 开发方式 | 先摸清结构再动手，不冒进 |

---

## 当前进度快照

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 1：修根本 | ✅ 完成 | 色彩 + 首页文章 |
| Phase 2：内容面 | ✅ 完成 | 动画 + 搜索 + 筛选 + TOC |
| Phase 3：视觉打磨 | ⏳ 待做 | 卡片化 + 字体 + TOC 改进 |

**项目健康度**：代码已全部 push 到 main，10 个 E2E 测试全绿，Hugo 预览正常。可以在任何时候继续 Phase 3。