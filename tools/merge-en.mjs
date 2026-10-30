// 英訳と英語版の公式名の調査結果（tools/research/out/en/out/）を astro/src/data/en/ にまとめる
// 実行：node tools/merge-en.mjs（何度実行してもよい。out にあるものだけで作り直す）
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const OUT = new URL('./research/out/en/out/', import.meta.url);
const DATA = new URL('../astro/src/data/', import.meta.url);
const load = (u) => JSON.parse(readFileSync(u, 'utf8'));
const files = existsSync(OUT) ? readdirSync(OUT).filter((f) => f.endsWith('.json')).sort() : [];
const read = (prefix) => files.filter((f) => f.startsWith(prefix)).map((f) => ({ f, d: load(new URL(f, OUT)) }));
const write = (name, data) => writeFileSync(new URL(`en/${name}.json`, DATA), JSON.stringify(data, null, 1) + '\n');

const magics = load(new URL('magics.json', DATA));
const ids = new Set(magics.map((m) => m.id));
const games = new Set(load(new URL('games.json', DATA)).map((g) => g.id));
const warn = [];
const jp = /[ぁ-んァ-ヶ一-龥]{2,}/;

// 魔法の説明・補足
const m = {};
for (const { f, d } of read('magics-')) {
  for (const [id, v] of Object.entries(d)) {
    if (!ids.has(id)) { warn.push(`${f}: 存在しない魔法 ${id}`); continue; }
    const row = {};
    for (const k of ['desc', 'note']) if (typeof v[k] === 'string' && v[k].trim()) row[k] = v[k].trim();
    if (Object.values(row).some((x) => jp.test(x))) warn.push(`${f}: ${id} に日本語が残っている`);
    m[id] = row;
  }
}
write('magics', m);

// 作品ごとの魔法体系・段階の付け方
const merge = (prefix) => Object.assign({}, ...read(prefix).map(({ f, d }) => {
  Object.keys(d).forEach((k) => games.has(k) || warn.push(`${f}: 存在しない作品 ${k}`));
  return d;
}));
write('systems', merge('systems-'));
write('stages', merge('stages-'));

// 使用者・消費・その他（1ファイルずつ）
for (const name of ['users', 'costs', 'misc']) {
  const x = read(`${name}.json`)[0];
  if (x) write(name, x.d);
}

// 英語版の公式名：出典のないもの・存在しない魔法は入れない
const names = { games: {}, magics: {} };
for (const { f, d } of read('names-')) {
  Object.assign(names.games, d.games ?? {});
  for (const [id, v] of Object.entries(d.magics ?? {})) {
    if (!ids.has(id)) { warn.push(`${f}: 存在しない魔法 ${id}`); continue; }
    const src = (v.src ?? []).filter((s) => s?.title && /^https?:\/\//.test(s.url ?? ''));
    if (!v.en?.trim() || !src.length) { warn.push(`${f}: ${id} は名前か出典がないので除外`); continue; }
    names.magics[id] = { en: v.en.trim(), ...(v.release ? { release: v.release } : {}), ...(v.older?.length ? { older: v.older } : {}), src, ...(v.note ? { note: v.note } : {}) };
  }
}
write('names', names);

const pageIds = magics.filter((x) => x.desc || x.note).length;
console.log(`magics ${Object.keys(m).length} / systems ${Object.keys(merge('systems-')).length} / stages ${Object.keys(merge('stages-')).length} / 公式名 ${Object.keys(names.magics).length}（説明のある魔法は全 ${pageIds}）`);
if (warn.length) console.log(`注意 ${warn.length} 件:\n` + warn.slice(0, 40).join('\n'));
