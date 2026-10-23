/**
 * トップページ（/ と英語版の /en）で並べるデータ。どちらも同じ魔法・同じ件数を出すため、選び方はここ1か所にまとめる。
 * 表示する文言は各ページ側で持つ
 */
import {
  EL, FX, PAGE_MAGICS, REP_GAMES, NAMING, STAGE_DOC, gameById, chainsOf, chainOfMagic, leadParts,
  compareRows, rowsTotal, compareUrl, magicUrl, todayMagic,
} from './dict';

// 今日の魔法（ビルド日で決まる）と、その系統
export const today = todayMagic();
export const todayLead = leadParts(today);
export const todayChain = chainOfMagic(today).map((m) => ({ m, href: magicUrl(m), cur: m.id === today.id }));

// 「たとえば」の一文：同じ氷の攻撃魔法を、4つのシリーズで
export const EG_GAMES = ['dq', 'ff', 'smt', 'mother'] as const;
export const eg = EG_GAMES.flatMap((gid) => {
  const m = chainsOf(gid, 'ice', 'atk')[0]?.list[0];
  return m ? [{ gid, g: gameById[gid], m }] : [];
});
const iceRows = compareRows('ice', 'atk');
export const egCompare = { href: compareUrl('ice', 'atk'), nGames: new Set(iceRows.map((r) => r.g.id)).size, total: rowsTotal(iceRows) };

// 読みもの：段階の付け方・魔法の呼び方（既にあるページ）
export const reading = {
  tierTypes: STAGE_DOC.types.length,
  tierGames: REP_GAMES.length,
  namingTerms: NAMING.length,
};

// 探す：属性（収録のあるものだけ）と、件数の多い用途
export const findEls = EL.filter((e) => PAGE_MAGICS.some((m) => m.el === e.id && m.fx === 'atk'));
export const findFx = FX.filter((f) => f.id !== 'atk' && f.id !== 'misc')
  .map((f) => ({ f, c: rowsTotal(compareRows(null, f.id)) }))
  .sort((a, b) => b.c - a.c).slice(0, 6).map((x) => x.f);
