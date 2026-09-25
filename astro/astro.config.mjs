import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mahou-jiten.pages.dev', // Pages の URL と違う場合・独自ドメインを使う場合は変更
  trailingSlash: 'never',
  // Cloudflare Pages は /foo/index.html を /foo/ にリダイレクトするため、
  // /foo.html で出力して /foo のまま配信させる（canonical とリンクを一致させる）
  build: { format: 'file' },
  // sitemap-index.xml を出力（404 ページは除外）
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') })],
});
