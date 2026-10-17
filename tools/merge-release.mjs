// 作品の最初の発売日と機種（tools/research/out/release/release-*.json）を astro/src/data/games.json の release に入れる。
// 仕様は tools/research/RELEASE-SPEC.md。
// 使い方：node tools/merge-release.mjs（そのあと cd astro && npm run validate）。調査結果にある作品の release だけを置き換える
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const D = new URL('../astro/src/data/', import.meta.url).pathname;
const OUT = new URL('./research/out/release/', import.meta.url).pathname;
const rd = (p) => JSON.parse(readFileSync(p, 'utf8'));
const games = rd(D + 'games.json');
const log = [];

const found = {};
for (const f of readdirSync(OUT).filter((f) => /^release-.+\.json$/.test(f)).sort()) {
  for (const [id, r] of Object.entries(rd(OUT + f).release ?? {})) {
    if (found[id]) log.push(`${id}: ${found[id].file} と ${f} の両方にある（${f} を採用）`);
    found[id] = { r, file: f };
  }
}

for (const [id, { r }] of Object.entries(found)) {
  const g = games.find((x) => x.id === id);
  if (!g) { log.push(`${id}: games.json にない作品（無視）`); continue; }
  // 出典の URL は既存データと同じく、日本語の部分をパーセントエンコードした形にそろえる
  const src = (r.src ?? []).map((s) => ({ title: s.title, url: new URL(s.url).href }));
  g.release = { date: r.date, platforms: r.platforms, ...(r.note ? { note: r.note } : {}), src };
}
games.filter((g) => !found[g.id]).forEach((g) => log.push(`${g.id}: 調査結果なし`));

writeFileSync(D + 'games.json', '[\n' + games.map((x) => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n');
console.log(log.join('\n'));
console.log(`release を入れた作品 ${games.filter((g) => g.release).length} / ${games.length}`);
