// src/data の整合性チェック（build の前に実行）。エラーがあれば終了コード1
import { readFileSync } from 'node:fs';

const load = (f) => JSON.parse(readFileSync(new URL(`../src/data/${f}.json`, import.meta.url), 'utf8'));
const [games, magics, systems, elements, effects, catalog] = ['games', 'magics', 'systems', 'elements', 'effects', 'catalog'].map(load);

const errors = [], warns = [];
const gameIds = new Set(games.map((g) => g.id)), elIds = new Set(elements.map((e) => e.id));
const fxById = Object.fromEntries(effects.map((f) => [f.id, f]));
const SCOPES = new Set(['単体', 'グループ', '全体', '自分']);

const dup = (list, key, label) => {
  const seen = new Set();
  list.forEach((x) => { if (seen.has(x[key])) errors.push(`${label} の ${key} が重複: ${x[key]}`); seen.add(x[key]); });
};
dup(games, 'id', 'games'); dup(games, 'slug', 'games'); dup(magics, 'id', 'magics');

games.forEach((g) => { if (!systems[g.id]) errors.push(`systems に ${g.id} がない`); });
Object.keys(systems).forEach((k) => { if (!gameIds.has(k)) errors.push(`systems.${k} に対応する作品がない`); });

const srcOk = (src, where) => {
  if (!src?.length) return false;
  src.forEach((s) => { if (!s.title || !/^https?:\/\//.test(s.url ?? '')) errors.push(`${where} の出典が不正: ${JSON.stringify(s)}`); });
  return true;
};

let noSrc = 0;
magics.forEach((m) => {
  const w = `magic ${m.id}`;
  if (!/^[a-z0-9-]+$/.test(m.id)) errors.push(`${w}: id は小文字英数とハイフンのみ`);
  if (!gameIds.has(m.game)) errors.push(`${w}: 未定義の作品 ${m.game}`);
  if (!fxById[m.fx]) errors.push(`${w}: 未定義の用途 ${m.fx}`);
  if (m.fx === 'atk' && !elIds.has(m.el)) errors.push(`${w}: 攻撃魔法には属性が必要（${m.el}）`);
  if (m.fx !== 'atk' && m.el !== null) errors.push(`${w}: 攻撃以外の用途は el を null にする（横断比較に出なくなるため）`);
  if (m.kind && fxById[m.fx]?.kinds && !fxById[m.fx].kinds[m.kind]) errors.push(`${w}: ${m.fx} に未定義の kind ${m.kind}`);
  if (m.scope != null && !SCOPES.has(m.scope)) errors.push(`${w}: scope は ${[...SCOPES].join('/')} のいずれか（${m.scope}）`);
  if (!Number.isInteger(m.tier) || m.tier < 1) errors.push(`${w}: tier は1以上の整数`);
  if (m.cost != null && (typeof m.cost !== 'string' || !m.cost.trim())) errors.push(`${w}: cost は空でない文字列`);
  if (m.users != null && (!Array.isArray(m.users) || m.users.some((u) => typeof u !== 'string' || !u.trim()))) errors.push(`${w}: users は文字列の配列`);
  if (!srcOk(m.src, w)) noSrc++;
});

// 系統内の段階が 1,2,3… と欠けずに並んでいるか
const chains = new Map();
magics.forEach((m) => {
  const k = [m.game, m.el, m.fx, m.kind ?? '', m.series ?? '', m.line ?? 'base'].join('|');
  chains.set(k, [...(chains.get(k) ?? []), m]);
});
chains.forEach((list, k) => {
  const tiers = list.map((m) => m.tier).sort((a, b) => a - b);
  if (tiers.some((t, i) => t !== i + 1)) errors.push(`系統 ${k} の段階が連番でない: ${list.map((m) => `${m.name}=${m.tier}`).join(', ')}`);
});

Object.entries(systems).forEach(([k, s]) => {
  if (!s.overview || !Array.isArray(s.rules)) errors.push(`systems.${k}: overview と rules は必須`);
  if (s.src) srcOk(s.src, `systems.${k}`);
  else warns.push(`systems.${k}: 出典なし`);
  Object.keys(s.elementNames ?? {}).forEach((e) => { if (!elIds.has(e)) errors.push(`systems.${k}.elementNames: 未定義の属性 ${e}`); });
});

catalog.forEach((c) => c.items.forEach((it) => { if (it.game && !gameIds.has(it.game)) errors.push(`catalog: 未定義の作品 ${it.game}`); }));
games.forEach((g) => { if (!catalog.some((c) => c.items.some((it) => it.game === g.id))) warns.push(`catalog に ${g.id} がない（作品一覧に出ない）`); });

if (noSrc) warns.push(`出典のない魔法 ${noSrc} 件`);
warns.forEach((w) => console.warn('⚠ ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  console.error(`\n${errors.length} 件のエラー`);
  process.exit(1);
}
console.log(`✓ data ok: ${games.length}作品 / ${magics.length}魔法`);
