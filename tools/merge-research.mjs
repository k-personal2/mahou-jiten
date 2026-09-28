// 調査結果（tools/research/out/<キー>.json）を astro/src/data に追加する
// 使い方：node tools/merge-research.mjs H I J …   （そのあと cd astro && npm run validate）
// 既存データは消さない。新しい作品・体系・魔法を追加し、updates があれば既存の魔法に反映する
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const D = new URL('../astro/src/data/', import.meta.url).pathname;
const OUT = new URL('./research/out/', import.meta.url).pathname;
const rd = (p) => JSON.parse(readFileSync(p, 'utf8'));
const games = rd(D + 'games.json'), magics = rd(D + 'magics.json'), systems = rd(D + 'systems.json'), catalog = rd(D + 'catalog.json');
const log = [];

const clean = (o) => { for (const k of Object.keys(o)) if (o[k] === null || o[k] === '' || (Array.isArray(o[k]) && !o[k].length)) delete o[k]; return o; };
const mergeSrc = (a = [], b = []) => [...a, ...b.filter((x) => x?.url && !a.some((y) => y.url === x.url))];

for (const key of process.argv.slice(2)) {
  const f = OUT + key + '.json';
  if (!existsSync(f)) { log.push(`skip ${key}: ファイルなし`); continue; }
  const r = rd(f);
  for (const g of r.games ?? []) {
    clean(g);
    const cur = games.find((x) => x.id === g.id);
    if (cur) Object.assign(cur, g, { slug: cur.slug }); // 既存作品の slug（公開URL）は変えない
    else games.push(g);
  }
  for (const [id, s] of Object.entries(r.systems ?? {})) {
    clean(s);
    systems[id] = systems[id] ? { ...systems[id], ...s, src: mergeSrc(systems[id].src, s.src) } : s;
  }
  for (const m of r.magics ?? []) {
    clean(m);
    if (m.fx !== 'atk') m.el = null;
    if (m.line !== 'all') delete m.line;
    if (magics.some((x) => x.id === m.id)) { log.push(`${key}: id の重複 ${m.id} を飛ばした`); continue; }
    if (/^敵(だけが使う|専用)/.test(m.note ?? '')) { log.push(`${key}: 敵専用 ${m.id} を飛ばした`); continue; }
    magics.push(m);
  }
  for (const u of r.updates ?? []) {
    const cur = magics.find((x) => x.id === u.id);
    if (!cur) { log.push(`${key}: updates の対象 ${u.id} がない`); continue; }
    const { src, ...set } = u.set ?? {};
    Object.entries(set).forEach(([k, v]) => (v === null ? delete cur[k] : (cur[k] = v)));
    cur.src = mergeSrc(cur.src, [...(src ?? []), ...(u.src ?? [])]);
  }
}

// ---- 系統の正規化：段階が重複する系統は、tier 1 から始まり直すところで別系統にする
const ck = (m) => [m.game, m.el, m.fx, m.kind ?? '', m.series ?? '', m.line ?? 'base'].join('|');
const groups = new Map();
magics.forEach((m) => groups.set(ck(m), [...(groups.get(ck(m)) ?? []), m]));
for (const [k, list] of groups) {
  if (new Set(list.map((m) => m.tier)).size === list.length) continue;
  let run = 0;
  list.forEach((m, i) => { if (i > 0 && m.tier === 1) run++; if (run > 0 && !m.series) m.series = `${m.game}-s${run}`; });
  log.push(`系統を分割 ${k}`);
}
// 段階の欠けは、並び順を保って振り直す
const g2 = new Map();
magics.forEach((m) => g2.set(ck(m), [...(g2.get(ck(m)) ?? []), m]));
for (const [k, list] of g2) {
  const sorted = [...list].sort((a, b) => a.tier - b.tier);
  if (sorted.some((m, i) => m.tier !== i + 1)) { sorted.forEach((m, i) => (m.tier = i + 1)); log.push(`段階を振り直し ${k}`); }
}

// ---- 並び順：シリーズの各作品は代表の直後、新しい作品は同じシリーズの最後の作品の直後
const placed = [];
const after = (id) => { const i = placed.findIndex((g) => g.id === id); return i < 0 ? placed.length : i + 1; };
const newIds = new Set(games.filter((g) => !rd(D + 'games.json').some((x) => x.id === g.id)).map((g) => g.id));
games.filter((g) => !newIds.has(g.id)).forEach((g) => placed.push(g));
games.filter((g) => newIds.has(g.id)).forEach((g) => {
  const anchor = g.group ?? placed.filter((x) => x.series && x.series === g.series && !x.group).map((x) => x.id).pop();
  // 代表の後ろに、すでに並べた同じシリーズの作品がいればその後ろ
  const last = anchor ? placed.map((x, i) => [x, i]).filter(([x]) => x.id === anchor || x.group === anchor || (g.series && x.series === g.series)).pop() : null;
  placed.splice(last ? last[1] + 1 : placed.length, 0, g);
});
const pos = new Map(placed.map((g, i) => [g.id, i]));
const mpos = new Map(magics.map((m, i) => [m.id, i]));
magics.sort((a, b) => (pos.get(a.game) ?? 999) - (pos.get(b.game) ?? 999) || mpos.get(a.id) - mpos.get(b.id));

// ---- catalog：代表作品だけを載せる。準備中の項目（slug 一致・名前一致）があれば置き換え、なければ同じシリーズの後ろへ
for (const g of placed.filter((x) => newIds.has(x.id) && !x.group)) {
  let done = false;
  for (const c of catalog) for (const it of c.items) {
    if (!done && !it.game && (it.slug === g.slug || g.name.startsWith(it.name))) { Object.assign(it, { name: g.name, sys: g.sys, game: g.id }); delete it.slug; done = true; }
  }
  if (done) continue;
  const sib = placed.filter((x) => x.series && x.series === g.series && x.id !== g.id).map((x) => x.id);
  const cat = catalog.find((c) => c.items.some((it) => sib.includes(it.game))) ?? catalog[catalog.length - 1];
  const idx = cat.items.map((it, i) => [it, i]).filter(([it]) => sib.includes(it.game)).pop();
  cat.items.splice(idx ? idx[1] + 1 : cat.items.length, 0, { name: g.name, sys: g.sys, game: g.id });
  log.push(`catalog: ${g.id} を「${cat.name}」に追加`);
}

const lines = (d) => '[\n' + d.map((x) => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n';
writeFileSync(D + 'games.json', lines(placed));
writeFileSync(D + 'magics.json', lines(magics));
writeFileSync(D + 'systems.json', JSON.stringify(systems, null, 2) + '\n');
writeFileSync(D + 'catalog.json', JSON.stringify(catalog, null, 2) + '\n');
console.log(log.join('\n'));
console.log(`作品 ${placed.length} / 魔法 ${magics.length}`);
