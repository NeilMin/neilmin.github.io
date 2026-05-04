# AGENTS.md — 博客站项目上下文

> 每次新会话自动加载。保持 200 行以内，长内容拆到 sections。

## 一句话

Hugo + PaperMod 双语博客（EN/ZH），部署在 GitHub Pages → neilmin.com。

## 快速命令

```bash
hugo server                           # 本地开发（localhost:1313）
hugo --gc --minify                    # 生产构建
hugo --gc --minify --destination /tmp/blog-preview  # 预览构建，不污染 repo
```

## 项目结构要点

```
hugo.toml                 # 主配置（菜单、双语、GA4、PaperMod 参数）
content/posts/            # 博客文章（EN: xxx.md, ZH: xxx.zh.md）
content/resume.md         # About 页面 EN
content/resume.zh.md      # About 页面 ZH
content/search.md         # 搜索 EN
content/search.zh.md      # 搜索 ZH
layouts/                  # 覆盖 PaperMod 的文件（不直接改 themes/PaperMod）
assets/css/extended/custom.css  # 所有自定义样式 — 这是唯一入口
assets/js/                # 自定义 JS
i18n/en.yaml i18n/zh.yaml # 自定义翻译 key
data/tech_icons.yml       # 技术栈 emoji 映射
static/                   # 直接拷贝的静态文件（CNAME、img/ 等）
.github/workflows/gh-pages.yml  # GitHub Pages 部署
```

### 关键 layout 文件

| 文件 | 干什么的 |
|------|---------|
| `layouts/_default/baseof.html` | 覆盖主题 base 模板，移除缓存 footer 渲染以便 per-page 逻辑 |
| `layouts/_default/list.html` | 博客列表（卡片视图），含去重后的 breadcrumbs + 入场动画 JS |
| `layouts/_default/single.html` | 文章详情，含条件 archive link + 项目回链区块 |
| `layouts/_default/archives.html` | Archive 时间线页（从 PaperMod 复制来的，加了 breadcrumbs） |
| `layouts/partials/extend_footer.html` | 首页/search 背景 blob HTML + 入场 WAAPI + 鼠标交互 rAF loop |
| `layouts/partials/extend_head.html` | 加载 blob-layout-geometry.js |
| `layouts/partials/header.html` | 语言切换器，优先用当前页翻译而非跳首页 |
| `layouts/partials/comments.html` | Giscus 评论，按页面语言选 locale |
| `layouts/projects/list.html` | 项目展示：tag 过滤 pill + 两栏卡片 + JS 过滤 + 入场动画 |
| `layouts/shortcodes/about_*.html` | About 页面组件（头像、介绍、卡片、标签、社交链接、入场动画 JS） |

### 关键 JS 文件

| 文件 | 干什么的 |
|------|---------|
| `assets/js/blob-layout-geometry.js` | blob 位置计算 |
| `assets/js/projects-showcase-filters.js` | 项目 tag 过滤 + IntersectionObserver stagger 入场 |
| `assets/js/post-entries-animation.js` | 博客列表 stagger 入场 |
| `assets/js/about-entrance-animation.js` | About 页面区块 stagger 入场 |

## 🍳 语言一致性 — 铁律

**所有改动中英文必须同步。** 范围：
- URL: 中文页内部链接拼 `/zh` 前缀，英文页不加
- shortcode 内容: 两份都要改
- CSS/JS 选择器: 不能隐含只适配一种语言
- `about_tags.html` split: 兼容 `,`（英文）和 `、`（中文）

## Blob 背景动画 — 别动 drift

首页三个背景光球的动画机制，踩过六轮坑才稳定。关键规则：

1. **CSS drift 动画从页面加载起就运行，不要压制它**（别用 `animation: none`）
2. 入场动画用 WAAPI 在 `.blob-shell` 上操作 `transform` — 只做中心→目标位置位移 + scale
3. 入场结束只取消 WAAPI，不碰 drift。两个动画叠加运行，零切换缝
4. 鼠标交互通过 rAF render loop 写 `.blob-shell` 的 transform
5. 如果 drift 出现跳变或僵住，检查是否有人不小心压制了 CSS animation

项目结构：`.blob-shell`（外层容器，WAAPI + rAF 操作）→ `.blob`（inner，CSS drift 动画 + blur filter）

## 主题覆盖哲学

优先 `layouts/`、`assets/`、`i18n/`，不改 `themes/PaperMod`。PaperMod 是 git submodule。

当前所有修改都在根目录的自定义文件中。

## 导航与页面

- **导航栏**: Blog | Projects | About | Search
- **Archive** 和 **Tags** 不在导航栏，但 Archive 页面保留（链接在 blog breadcrumb 行）
- Tag 概览页（`/tags/`）已删除——四篇文章零交叉覆盖，但单个 tag 页面（`/tags/hugo/`）保留给 SEO
- Blog: 卡片视图
- Archive: 时间线列表

## 已配置的功能

- **GA4**: `G-EWCKPKZT8L`
- **阅读时间**: EN 用主题默认 `X min`，ZH 用 `X 分钟`
- **浏览量**: Vercount（`vercount.one/js`），仅文章页，DOM ID 用 `busuanzi_*` 兼容
- **评论**: Giscus，EN 用 `en`，ZH 用 `zh-CN`
- **面包屑**: 已去重（list.html 原来有两处调用）
- **暗色模式**: via `html[data-theme="dark"]` 选择器
- **搜索**: 依赖 Hugo JSON home output 开启

## 新增文章流程

1. 英文 `content/posts/xxx.md`
2. 中文 `content/posts/xxx.zh.md`
3. 检查 frontmatter metadata 对齐（title、date、tags、draft）
4. 确保不是 draft 状态再 push

## 新增/修改 UI 文本 checklist

- `hugo.toml` — 菜单和 profile 文本
- `i18n/en.yaml` 和 `i18n/zh.yaml` — 可复用字符串（记得加 key 必须是两个文件同步）
- `layouts/partials/` — 结构性/条件性 UI

## Hugo 已知坑

1. 别用 `--contentDir` 参数构建 — shortcode 改动会不生效
2. PaperMod v0.161.1 有 `.Site.Data` 弃用警告，不影响功能，忽略
3. 改 CSS 后确认 public 产物中 hash 变了才算生效
4. macOS grep 不支持 `-P`，用 `egrep` 替换
5. `tags/_index.md` 和 `zh/tags/_index.md` 已删除 — 别重新创建

## Git 规则

- `public/`、`.DS_Store`、`.hugo_build.lock`、`.worktrees/` 在 .gitignore
- `AGENTS.md` — ✅ commit（项目文档，给 AI agent 读的）
- `AGENTS.local.md` — ❌ gitignore（本机私有偏好）
- 别推送 `public/` 到 git

## 已知待修问题

- Archive link 和 prev/next 导航偶发消失（条件判断代码正确但未渲染，可能是 Hugo 缓存问题）
- 中文版 About 页面格式偶发异常
- Git history 14+ commit 需 squash

## 不要做的事

- 不要在 themes/PaperMod 里直接改文件
- 不要重新创建 `tags/_index.md`
- 不要碰 blob drift 动画的压制逻辑
- 不要只改一种语言就提交
- 不要用 `hugo --contentDir` 
- 改 CSS 不要创建新文件 — `custom.css` 是唯一入口
