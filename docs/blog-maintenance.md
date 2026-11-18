# 博客维护指南

> 站点：<https://game-walkthrough.pages.dev>
> 仓库：<https://github.com/XinX030503/Game-Walkthrough>
> 适用状态：2026-11-18，Firefly 主题 + Astro 7 + pnpm 11，Cloudflare Pages Git 集成

这份指南覆盖日常写作、发布上线、改配置/主题和排错。目标是自己能独立维护，不需要每次找 AI。

---

## 1. 先理解这套系统

你的博客分为两层：

| 层 | 内容 | 位置 |
| --- | --- | --- |
| 源码 | Markdown 文章、Astro 页面、Firefly 主题代码、配置、图片 | 本地仓库 / GitHub |
| 构建产物 | 编译后的 HTML、CSS、JS、图片 | `site/dist/`，由 Cloudflare 发布 |

Astro 是静态站点生成器。它不会在访客访问时执行，而是在构建阶段把 `site/src/` 编译成纯静态文件。浏览器最终看到的是 `site/dist/` 的内容，不是 `.md` 源码。

所以发布流程不是“把仓库原样传到 Cloudflare”，而是：

```
本地编辑 site/src/…
        │ git push
        ▼
GitHub 仓库 Game-Walkthrough
        │ webhook 触发
        ▼
Cloudflare Pages 云端构建
  ├─ Root directory: site
  ├─ pnpm install
  ├─ pnpm build
  └─ 发布 site/dist
        │
        ▼
https://game-walkthrough.pages.dev
```

记住五条规则：

1. `main` 分支是生产环境，push 到 `main` 就会自动部署。
2. 文章的文件名决定 URL，例如 `yu-sha-2-boss.md` → `/posts/yu-sha-2-boss/`。
3. `draft: true` 的文章只在本地开发时可见，生产构建会隐藏。
4. `siteConfig.site_url` 决定 sitemap、RSS、OG 图里的绝对链接，换域名时必须同步改。
5. 只有 push 到 GitHub 才会触发部署；本地改完不 push，线上不会变。

### 为什么要有 GitHub

- **源码仓库**：保存历史版本，改坏了可以回退，换电脑 clone 即可。
- **构建触发器**：Cloudflare 通过 GitHub webhook 自动构建，不依赖你的电脑开机。
- **预览与回滚**：非 `main` 分支会生成预览部署；每次部署都能在 Cloudflare 回滚。
- **注意**：GitHub 不托管网站，网站由 Cloudflare 的 CDN 提供。

如果不想用 GitHub，也可以本地 `pnpm build` 后把 `site/dist/` 直传到 Cloudflare 的 Direct Upload 项目，但会失去自动构建、预览和部署历史，不建议。

---

## 2. 目录导览

```
blog/                                 仓库根目录
├─ site/                              站点源码
│  ├─ src/
│  │  ├─ content/
│  │  │  ├─ posts/                    文章（Markdown/MDX）
│  │  │  └─ spec/about.md             关于页
│  │  ├─ config/                      主题配置（最常改）
│  │  ├─ pages/                       独立页面路由
│  │  ├─ components/                  页面组件
│  │  ├─ layouts/                     页面布局
│  │  ├─ styles/                      全局样式 / Tailwind
│  │  └─ assets/images/               参与构建优化的图片
│  ├─ public/                         原样复制到站点的静态资源
│  │  ├─ _redirects                   旧链接 301 跳转
│  │  ├─ assets/                      图片等
│  │  └─ favicon/
│  ├─ scripts/                        构建辅助脚本
│  ├─ astro.config.mjs
│  └─ package.json
├─ docs/                              本指南
└─ README.md
```

不要手动修改 `site/dist/`、`site/.astro/`、`site/node_modules/`，它们都是生成或安装出来的。

---

## 3. 日常写作

### 3.1 新建文章

在 `site/src/content/posts/` 下新建 `.md` 文件，文件名用**英文小写 + 连字符**（不要中文、空格）：

```
site/src/content/posts/octopath-traveler-2-boss.md
→ https://game-walkthrough.pages.dev/posts/octopath-traveler-2-boss/
```

最小可用内容：

```markdown
---
title: 八方旅人 II BOSS 攻略
published: 2026-11-18
description: 主线与隐藏 BOSS 的弱点、行动模式和推荐打法。
tags: [八方旅人, BOSS]
category: 游戏攻略
pinned: false
draft: false
image: /assets/posts/boss-cover.jpg
---

正文从这里开始。
```

常用 frontmatter：

| 字段 | 说明 |
| --- | --- |
| `title` | 必填，文章标题 |
| `published` | 必填，格式 `YYYY-MM-DD` |
| `updated` | 可选，更新时间 |
| `description` | 列表页和 SEO 描述 |
| `tags` | 标签数组，决定标签页归档 |
| `category` | 分类，决定分类归档 |
| `image` | 封面图路径，支持 `/assets/...` 或完整 URL |
| `pinned` | 是否置顶 |
| `draft` | `true` 时仅本地可见 |
| `comment` | `false` 关闭本篇评论 |
| `series` / `seriesOrder` | 系列文章名称与顺序 |
| `password` / `passwordHint` | 文章加密（可选） |

也支持 `updated`、`lang`、`author`、`sourceLink`、`licenseName`、`licenseUrl` 等字段，均有默认值。

**脚本方式**：

```powershell
cd F:\T3Code\data\projects\blog\site
pnpm new-post -- "octopath-traveler-2-boss"
```

注意：脚本会把参数同时用作标题和文件名，生成后需要手动改 `title`。它生成的 `slug` 字段在这个主题里不生效，URL 只由文件路径决定。因此更推荐手动新建文件。

### 3.2 编辑、重命名、删除

- **编辑**：直接改对应的 `.md`，`pnpm dev` 会热更新。
- **重命名 = 换 URL**：旧地址会 404。需要保留旧链接时，在 `site/public/_redirects` 加一行：

  ```
  /old-post/ /posts/new-post/ 301
  ```

- **删除**：文件删掉后，旧 URL 也会 404；如有外链，同样加 301 跳转到归档页或相关文章。

`_redirects` 是 Cloudflare Pages 的静态重定向文件，格式为 `源路径 目标路径 状态码`，每行一条。

### 3.3 图片

推荐放在 `site/public/assets/` 下，例如：

```
site/public/assets/posts/boss.jpg
```

Markdown 中引用：

```markdown
![BOSS 弱点](/assets/posts/boss.jpg)
```

封面图：

```yaml
image: /assets/posts/boss.jpg
```

`public/` 里的文件会原样复制、不做压缩，所以上传前先压一下（JPG/WebP，单张尽量控制在几百 KB）。

想让 Astro 自动优化图片，可以放到 `site/src/assets/`，用相对路径引用；代价是构建更慢，教程初期用 `public/` 更省心。

### 3.4 Markdown 能力

主题已支持：

- GFM 表格、任务列表、删除线
- `> [!TIP]` / `> [!NOTE]` / `> [!WARNING]` 提示框
- KaTeX 数学公式
- Mermaid 图表
- 代码块高亮、折叠、行号
- 图片、链接、标题自动锚点

### 3.5 关于页与其他 Markdown

- 关于页：`site/src/content/spec/about.md`
- 这里写普通 Markdown，构建后自动套用页面样式。

---

## 4. 本地预览

```powershell
cd F:\T3Code\data\projects\blog\site
pnpm install     # 首次或依赖变化后执行
pnpm dev         # 打开 http://localhost:4321
```

Git Bash 中路径写成 `/f/T3Code/data/projects/blog/site`。

其他命令：

```powershell
pnpm check       # Astro 类型检查
pnpm build       # 完整生产构建，输出 site/dist/
pnpm preview     # 预览 dist/ 的构建结果
```

说明：

- `pnpm build` 比较慢，因为要生成 OG 图、字体子集、LQIP、Pagefind 搜索索引；日常写作不必每次跑。
- 改动主题配置或大量样式后，建议本地 build 一次，能提前发现 Cloudflare 上会遇到的错误。
- 项目只允许 pnpm；执行 `npm install` 会被 `preinstall` 拦截。
- 需要 Node.js 22.23.x 和 pnpm 11.22.0（见 `package.json` 的 `engines` 和 `packageManager`）。

---

## 5. 发布上线

### 5.1 标准流程

在仓库根目录执行：

```powershell
cd F:\T3Code\data\projects\blog

git status                 # 查看改了哪些文件
git diff                   # 检查具体改动
git add -A
git commit -m "content: 新增 BOSS 攻略"
git push origin main
```

提交信息建议用前缀区分：

- `content:` 文章内容
- `config:` 站点配置
- `theme:` 样式或组件
- `fix:` 修复问题

### 5.2 确认部署

1. 打开 <https://dash.cloudflare.com>。
2. 进入 `Workers & Pages` → `game-walkthrough` → `Deployments`。
3. 找到与刚才 commit 对应的一条，等状态从 `Building` 变成 `Success`（通常 2–5 分钟）。
4. 打开 <https://game-walkthrough.pages.dev> 验证；没变化先 `Ctrl+F5` 强制刷新。

构建失败时线上仍是上一个成功版本，不会发布半成品。点开失败的部署查看 Build log。

### 5.3 push 被拒绝

远程有新提交时：

```powershell
git pull --rebase origin main
git push origin main
```

### 5.4 高风险改动用分支预览

改主题、升级依赖、动布局时，建议：

```powershell
git checkout -b feat/theme-tweak
# 修改并本地验证
git add -A
git commit -m "theme: 调整首页布局"
git push -u origin feat/theme-tweak
```

Cloudflare 会为非 `main` 分支生成预览部署，在 Dashboard 的 Deployments 里能拿到预览 URL。确认没问题后再合并到 `main`：

```powershell
git checkout main
git merge feat/theme-tweak
git push origin main
```

### 5.5 回滚

- **快速回滚**：Cloudflare Dashboard → Deployments → 选一个之前的成功版本 → `Rollback`，即时生效，不用重新构建。
- **代码回滚**：`git revert <commit>` 后 push，触发一次新构建。

### 5.6 不开电脑也能改

1. 打开 <https://github.com/XinX030503/Game-Walkthrough>。
2. 进入 `site/src/content/posts/`，点文章 → 铅笔图标 → 修改。
3. 提交时选择直接 commit 到 `main`，Cloudflare 会自动部署。
4. 想编辑多个文件，在仓库页按 `.` 打开 github.dev。
5. 上传图片：`Add file` → `Upload files`，放到 `site/public/assets/posts/`。

网页编辑没有本地预览，frontmatter 写错会导致构建失败；提交后务必去 Cloudflare 看部署结果。

### 5.7 发布前检查清单

- [ ] 文件名是英文小写 + 连字符
- [ ] `title`、`published`、`description` 已填
- [ ] 封面图路径正确、图片已压缩
- [ ] 本地 `pnpm dev` 预览正常
- [ ] 大改动跑过 `pnpm build`
- [ ] commit message 清楚
- [ ] push 后 Cloudflare 部署成功
- [ ] 线上页面、RSS、搜索都能找到新文章

---

## 6. 修改站点与主题

主题不是后台开关，而是 `site/` 里的配置和代码。常见修改集中在 `site/src/config/`，该目录下的 `README.md` 也列出了每个文件的作用。

### 6.1 配置地图

| 想改什么 | 文件 | 关键字段 |
| --- | --- | --- |
| 站点标题、副标题、描述、关键词 | `src/config/siteConfig.ts` | `title`、`subtitle`、`description`、`keywords` |
| 主题色、亮暗模式 | `src/config/siteConfig.ts` | `themeColor.hue`、`themeColor.defaultMode` |
| 导航栏标题、Logo、布局 | `src/config/siteConfig.ts` | `navbar` |
| 页面开关（友链、相册等） | `src/config/siteConfig.ts` | `pages` |
| 文章列表布局、分页 | `src/config/siteConfig.ts` | `postListLayout`、`pagination` |
| 文章页功能（分享、相关推荐等） | `src/config/siteConfig.ts` | `post` |
| 头像、昵称、简介、社交链接 | `src/config/profileConfig.ts` | `avatar`、`name`、`bio`、`links` |
| 导航菜单项 | `src/config/navBarConfig.ts` | `getDynamicNavBarConfig()`、`LinkPresets` |
| 侧边栏组件与顺序 | `src/config/sidebarConfig.ts` | `leftComponents`、`rightComponents` |
| 背景壁纸、首页横幅 | `src/config/backgroundWallpaper.ts` | `mode`、`src` |
| 公告 | `src/config/announcementConfig.ts` | `content`、`link` |
| 字体 | `src/config/fontConfig.ts` | 字体族与字重 |
| 动画特效 | `src/config/effectsConfig.ts` | 樱花等开关 |
| 代码高亮 | `src/config/expressiveCodeConfig.ts` | 主题、行号 |
| 评论系统 | `src/config/commentConfig.ts` | 目前未启用 |
| 页脚 | `src/config/FooterConfig.html` | 直接写 HTML |
| 关于页正文 | `src/content/spec/about.md` | Markdown |

### 6.2 常用修改

**改站点名字**：需要同步三处，否则会出现不一致。

- `siteConfig.title`：浏览器标题与站点名
- `siteConfig.navbar.title`：导航栏文字
- `profileConfig.name`：侧边栏昵称

**改主题色**：`siteConfig.ts` 中：

```ts
themeColor: {
  hue: 165,          // 0 红，200 青，250 蓝绿，345 粉
  defaultMode: "system",
},
```

**改导航菜单**：编辑 `navBarConfig.ts` 的 `getDynamicNavBarConfig()`，例如新增外链：

```ts
links.push({
  name: "GitHub",
  url: "https://github.com/XinX030503/Game-Walkthrough",
  external: true,
  icon: "fa7-brands:github",
});
```

图标名可在 <https://icones.js.org> 查，已安装 `material-symbols`、`fa7-brands`、`fa7-solid`、`simple-icons` 等图标集。

**打开被关闭的页面**：`siteConfig.pages` 里把对应项改为 `true`，例如 `friends: true`，再到 `friendsConfig.ts` 填内容。部分页面还依赖评论系统或外部 API。

**改关于页**：直接编辑 `src/content/spec/about.md`。

**改首页横幅**：`backgroundWallpaper.ts` 的 `mode` 和 `src`。默认使用 `assets/images/DesktopWallpaper/d1.avif` 等示例图，自定义图片建议另起文件名，避免以后升级被覆盖。

### 6.3 新增独立页面

1. 在 `site/src/pages/` 下新建 `.astro` 文件，例如 `links.astro`，对应 `/links/`。
2. 可复制 `about.astro` 改，最简单的结构：

```astro
---
import MainGridLayout from "@layouts/MainGridLayout.astro";
---

<MainGridLayout title="友情链接">
  <div class="card-base p-6">
    <h1>友情链接</h1>
    <p>这里放内容。</p>
  </div>
</MainGridLayout>
```

3. 在 `navBarConfig.ts` 里加导航项。

### 6.4 改样式和组件

- 全局样式：`site/src/styles/`
- 组件：`site/src/components/`
- 布局：`site/src/layouts/`
- 主题使用 Tailwind CSS 4 + CSS 变量，颜色、圆角、间距大多由变量控制。

这类改动属于写代码，建议每次开分支、本地 `pnpm dev` 看效果、`pnpm build` 通过后再合并到 `main`。

### 6.5 换主题或升级 Firefly

主题就是代码，没有一键换肤。三种情况：

1. **小改**：只动 `src/config/`，升级时最容易保留。
2. **升级 Firefly**：上游是 <https://github.com/CuteLeaf/Firefly>。注意上游仓库以根目录为站点，你的站点在 `site/` 子目录，不能直接 `git merge`，需要按文件对比合并。务必新开分支，本地构建通过、预览部署验证后再合并。
3. **整体换主题**：备份后把新主题放进 `site/`，保留 `src/content/posts/`、`src/content/spec/` 和 `public/` 图片。若新主题的构建命令、输出目录、Node/pnpm 版本不同，还要同步修改 Cloudflare 的环境变量和构建设置。

### 6.6 以后绑定自定义域名

在 Cloudflare Pages 的 `Custom domains` 添加域名后，记得：

1. 修改 `siteConfig.site_url` 为新域名。
2. 提交并 push，让 sitemap、RSS、OG 图重新生成。
3. 视情况在 `_redirects` 里补充旧域名跳转。

---

## 7. Cloudflare Pages 设置

项目 `game-walkthrough` 的关键设置（在 Dashboard，不在仓库里）：

| 设置 | 值 |
| --- | --- |
| Production branch | `main` |
| Root directory | `site` |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| `NODE_VERSION` | `22.23.4` |
| `PNPM_VERSION` | `11.22.0` |

`PNPM_VERSION` 必须设置：Cloudflare 构建镜像默认的 pnpm 10.11.1 低于 Firefly 要求的 11.22.0。

如果构建仍失败，备用方案：

- 环境变量 `SKIP_DEPENDENCY_INSTALL=1`
- 构建命令改为 `npm install -g pnpm@11.22.0 && pnpm install --frozen-lockfile && pnpm build`

不要随意修改这些设置；改之前先确认本地同样的命令能构建成功。

---

## 8. 不要做的事

- 不要手改 `site/dist/`、`site/.astro/`、`site/node_modules/`。
- 不要把 `dist/` 或 `node_modules/` 提交进 Git，它们已在 `.gitignore` 里。
- 不要用 `npm install` 或 `yarn`，项目只允许 pnpm。
- 不要提交 `package-lock.json`，锁文件是 `pnpm-lock.yaml`。
- 不要随手升级 Astro：Firefly 锁定 `astro 7.3.2`，升级可能连带破坏主题。
- 不要把 API token、密码写进 `src/config/*.ts` 后提交；敏感值放 Cloudflare 环境变量。
- 不要对 `main` 执行 `git push --force`。
- 不要给已发布的文章改名后不加 301，外链和搜索引擎会失效。
- 不要上传未压缩的大图，会拖慢构建和页面加载。
- 不要在构建未成功时反复 push；先看 Build log。

---

## 9. 排错速查

| 现象 | 原因 / 处理 |
| --- | --- |
| push 成功但网站没变 | 看 Deployments 最新记录：Building、Failed，或 commit 不对；再强制刷新 |
| 构建失败 | 点开 Build log。常见：pnpm/Node 版本、lockfile 不一致、依赖升级、图片过大 |
| 新文章 404 | 检查文件名、`draft: true`、部署是否成功；URL 为 `/posts/<文件路径>/` |
| 菜单项不见了 | `siteConfig.pages` 对应开关为 `false` |
| 中文 URL 很长 | 文件改成英文/拼音，并在 `_redirects` 加 301 |
| 本地 `pnpm dev` 起不来 | 检查 `node -v`、`pnpm -v`，重新 `pnpm install` |
| `git push` 被拒 | `git pull --rebase origin main` 后重试 |
| 部署成功但样式旧 | 浏览器缓存，`Ctrl+F5`；或确认访问的是最新部署 |
| 改坏了想恢复线上 | Cloudflare Deployments → 上一个成功版本 → Rollback |
| 搜索找不到新文章 | Pagefind 索引在构建时生成，确认部署成功后再试 |

---

## 10. 速查卡

```powershell
# 本地开发
cd F:\T3Code\data\projects\blog\site
pnpm dev

# 构建检查
pnpm build
pnpm preview

# 发布
cd F:\T3Code\data\projects\blog
git add -A
git commit -m "content: 更新文章"
git push origin main
```

| 项目 | 地址 |
| --- | --- |
| 线上站点 | <https://game-walkthrough.pages.dev> |
| GitHub 仓库 | <https://github.com/XinX030503/Game-Walkthrough> |
| Cloudflare 控制台 | <https://dash.cloudflare.com> → Workers & Pages → game-walkthrough |
| 文章目录 | `site/src/content/posts/` |
| 关于页 | `site/src/content/spec/about.md` |
| 主题配置 | `site/src/config/` |
| 重定向 | `site/public/_redirects` |
| 静态图片 | `site/public/assets/` |

---

维护的核心就一句话：**改 `site/src/` 里的内容，本地预览确认，commit + push 到 `main`，Cloudflare 自动构建上线。**
