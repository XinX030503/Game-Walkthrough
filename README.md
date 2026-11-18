# Chacha的印象空间 / Chacha's Impression Space

一个使用 [Firefly](https://github.com/CuteLeaf/Firefly)（基于 [Fuwari](https://github.com/saicaca/fuwari)）主题搭建的 Astro 博客，内容以游戏攻略为主，部署在 Cloudflare Pages：[game-walkthrough.pages.dev](https://game-walkthrough.pages.dev)。

日常写作、发布、修改主题和排错的完整说明见 [博客维护指南](docs/blog-maintenance.md)。

## 本地开发

需要 Node.js >= 22.23.0 和 pnpm 11.22.0（已写入 `package.json` 的 `packageManager` 字段）。

```bash
npm install -g pnpm@11.22.0   # 只需执行一次
cd site
pnpm install
pnpm dev      # http://localhost:4321
```

## 构建

```bash
cd site
pnpm build    # 输出到 site/dist/
pnpm preview  # 预览生产构建
```

构建流程包含图片 LQIP 生成、Astro 构建、OpenGraph 图片、字体子集化、内联脚本压缩和 Pagefind 全文搜索索引。

## 内容

- 文章：`site/src/content/posts/`，目前有 `octopath-traveler-2.md`
- 关于页：`site/src/content/spec/about.md`
- 文章 Frontmatter 示例：

```yaml
---
title: 文章标题
published: 2026-11-17
description: 文章简介
tags: [标签一, 标签二]
category: 游戏攻略
pinned: false
---
```

## 配置

站点配置集中在 `site/src/config/`：

- `siteConfig.ts`：站点标题、URL、导航栏、页面开关
- `profileConfig.ts`：头像、昵称、简介、社交链接
- `navBarConfig.ts`：导航菜单
- `sidebarConfig.ts`：侧边栏组件
- `backgroundWallpaper.ts`：壁纸与首页横幅
- `announcementConfig.ts`：公告
- `commentConfig.ts`：评论系统（当前未启用）
- `musicConfig.ts`：音乐播放器（当前未启用）

## 部署

Cloudflare Pages 项目 `game-walkthrough`：

- 根目录：`site`
- 构建命令：`pnpm build`
- 输出目录：`dist`
- 环境变量（Production 和 Preview 都要设置）：
  - `NODE_VERSION=22.23.4`
  - `PNPM_VERSION=11.22.0`

Cloudflare Pages 构建镜像默认自带 pnpm 10.11.1，低于 Firefly 要求的 pnpm 11.22.0，因此必须设置 `PNPM_VERSION`。如果构建仍失败，可改用自定义安装：

- 环境变量：`SKIP_DEPENDENCY_INSTALL=1`
- 构建命令：`npm install -g pnpm@11.22.0 && pnpm install --frozen-lockfile && pnpm build`

推送到 `main` 分支后自动部署。旧的 Starlight 地址 `/octopath-traveler-2/` 通过 `site/public/_redirects` 301 跳转到 `/posts/octopath-traveler-2/`。

## 许可与致谢

页面设计与组件来自 [Firefly](https://github.com/CuteLeaf/Firefly) 和 [Fuwari](https://github.com/saicaca/fuwari)，遵循各自的 MIT 许可证（见 `site/LICENSE`）。本站文章内容除特别注明外采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可。
