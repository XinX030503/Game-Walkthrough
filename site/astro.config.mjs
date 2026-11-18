import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://game-walkthrough.pages.dev',
  integrations: [
    starlight({
      title: '游戏攻略',
      disable404Route: true,
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
    }),
  ],
});
