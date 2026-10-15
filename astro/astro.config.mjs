import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { copyFileSync, existsSync } from 'node:fs';

/**
 * Search Console に登録しやすいよう、/sitemap.xml（URL を直接並べた1ファイル）も出力する。
 * 中身は @astrojs/sitemap の sitemap-0.xml と同じ（URL の一覧は sitemap integration の1か所から出す）。
 * 5万件を超えて sitemap-1.xml に分かれたら1ファイルでは足りないため、ビルドを止めて知らせる
 */
const plainSitemap = () => ({
  name: 'plain-sitemap',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (existsSync(new URL('sitemap-1.xml', dir))) throw new Error('サイトマップが複数ファイルに分かれました。/sitemap.xml の出し方を見直してください');
      copyFileSync(new URL('sitemap-0.xml', dir), new URL('sitemap.xml', dir));
    },
  },
});

export default defineConfig({
  site: 'https://mahou-jiten.pages.dev', // Pages の URL と違う場合・独自ドメインを使う場合は変更
  trailingSlash: 'never',
  // Cloudflare Pages は /foo/index.html を /foo/ にリダイレクトするため、
  // /foo.html で出力して /foo のまま配信させる（canonical とリンクを一致させる）
  build: { format: 'file' },
  // sitemap-index.xml を出力（404 ページは除外）。plainSitemap はその後に動かす
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') }), plainSitemap()],
});
