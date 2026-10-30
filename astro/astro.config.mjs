import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';

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

// 英語の魔法ページは、英語版の公式名が確認できたものだけサイトマップに入れる（それ以外は noindex。src/lib/i18n.ts の enIndexable と同じ判定）
const enNamed = new Set(Object.keys(JSON.parse(readFileSync(new URL('./src/data/en/names.json', import.meta.url), 'utf8')).magics));
const inSitemap = (page) => {
  if (page.endsWith('/404')) return false;
  const m = page.match(/\/en\/magic\/([^/]+)$/);
  return !m || enNamed.has(m[1]);
};

export default defineConfig({
  site: 'https://rpgspellbook.com', // 独自ドメイン。canonical・sitemap・OGP の URL はここから作る
  trailingSlash: 'never',
  // Cloudflare Pages は /foo/index.html を /foo/ にリダイレクトするため、
  // /foo.html で出力して /foo のまま配信させる（canonical とリンクを一致させる）
  build: { format: 'file' },
  // sitemap-index.xml を出力（404 ページと noindex の英語の魔法ページは除外）。plainSitemap はその後に動かす
  integrations: [sitemap({ filter: inSitemap }), plainSitemap()],
});
