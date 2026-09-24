// ダウンロード環境の制約で [param] が -param- に置き換わっているファイル名を元に戻す
import { readdirSync, renameSync, statSync } from 'node:fs';
import { join } from 'node:path';
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    let p = join(dir, name);
    const m = name.match(/^-([a-z]+)-(\.astro)?$/);
    if (m) { const to = join(dir, `[${m[1]}]${m[2] ?? ''}`); renameSync(p, to); console.log('renamed', p, '→', to); p = to; }
    if (statSync(p).isDirectory()) walk(p);
  }
};
walk('src/pages');
