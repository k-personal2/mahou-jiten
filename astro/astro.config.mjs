import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mahou-jiten.pages.dev', // TODO: 初回デプロイ後に表示される workers.dev の URL（または独自ドメイン）に変更
  trailingSlash: 'never',
  // Cloudflare（Workers の静的アセット配信）は /foo/index.html を /foo/ にリダイレクトするため、
  // /foo.html で出力して /foo のまま配信させる（canonical とリンクを一致させる）
  build: { format: 'file' },
});
