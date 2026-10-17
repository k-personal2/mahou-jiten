/**
 * トップページ（/ と英語版の /en）で並べるデータ。どちらも同じ魔法・同じ件数を出すため、選び方はここ1か所にまとめる。
 * 表示する文言は各ページ側で持つ
 */
import {
  EL, FX, PAGE_MAGICS, NAMING, gameById, elById, chainsOf, chainOfMagic, splitNames,
  compareRows, rowsTotal, compareUrl, magicUrl, todayMagic,
} from './dict';

// 今日の魔法（ビルド日で決まる）
export const today = todayMagic();

// 呼び名の帯：作品ごとに系統の最初の名前を12件
export const bands = [
  { key: 'fire', el: 'fire', fx: 'atk' },
  { key: 'ice', el: 'ice', fx: 'atk' },
  { key: 'heal', el: null, fx: 'heal' },
].map((b) => {
  const rows = compareRows(b.el, b.fx);
  // 作品ごとに1件、なるべく違う名前を優先して12件
  const perGame = rows.filter((r, i) => rows.findIndex((x) => x.g.id === r.g.id) === i);
  const names = new Set<string>();
  const distinct = perGame.filter((r) => !names.has(r.list[0].name) && names.add(r.list[0].name));
  const firsts = [...distinct, ...perGame.filter((r) => !distinct.includes(r))].slice(0, 12).map((r) => ({ m: r.list[0], g: r.g }));
  return { ...b, firsts, href: compareUrl(b.el, b.fx), nGames: new Set(rows.map((r) => r.g.id)).size, total: rowsTotal(rows) };
});

// 探し方：数字は行き先の比較ページの件数と同じ
export const fxRows = FX.map((f) => ({
  f, href: compareUrl(null, f.id),
  c: f.id === 'atk' ? EL.reduce((a, e) => a + rowsTotal(compareRows(e.id, 'atk')), 0) : rowsTotal(compareRows(null, f.id)),
}));
export const elRows = EL.map((e) => ({ e, c: rowsTotal(compareRows(e.id, 'atk')) }));
export const sysTop = NAMING.map((t, i) => ({ ...t, i, games: t.items.filter((x) => x.href) }))
  .sort((a, b) => b.games.length - a.games.length).slice(0, 6);

// 名前の付け方：作品ごとの命名ルール（名前はデータから。ルールの説明文は各ページで gid ごとに持つ）
export const PATTERN_GAMES = ['dq', 'ff', 'mother', 'smt', 'goemon', 'tenchi', 'tengai'] as const;
export type PatternGame = (typeof PATTERN_GAMES)[number];
export const patterns = PATTERN_GAMES.map((gid) => {
  const list = chainsOf(gid, 'fire', 'atk')[0]?.list ?? [];
  const parts = splitNames(list.map((m) => m.name));
  return { gid, g: gameById[gid], list, items: list.map((m, i) => ({ ...parts[i], href: magicUrl(m) })) };
}).filter((p) => p.items.length > 1);

// 名前だけではわからない魔法
const CUR = ['昭和', 'いわし', 'グリコーン', 'だだぢぢ', '？？？？', '日立'];
export const curious = CUR.map((n) => PAGE_MAGICS.find((m) => m.name === n && !gameById[m.game].group)).filter((m) => m !== undefined).map((m) => ({
  m, g: gameById[m.game], E: m.el ? elById[m.el] : null, chain: chainOfMagic(m),
}));
