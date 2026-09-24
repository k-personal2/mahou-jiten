import elementsData from '../data/elements.json';
import effectsData from '../data/effects.json';
import gamesData from '../data/games.json';
import magicsData from '../data/magics.json';
import systemsData from '../data/systems.json';
import catalogData from '../data/catalog.json';

export type Element = { id: string; name: string; hue: number | null; phrase: string; aliases: string[] };
export type Source = { title: string; url: string };
export type Effect = { id: string; name: string; kanji: string; slug: string; phrase: string; kinds?: Record<string, string> };
/** series: シリーズ名 / basis: どの作品・版の表記を基準にしているか */
export type Game = { id: string; name: string; short: string; sys: string; slug: string; series?: string; basis?: string };
/**
 * kind: 用途内の細分類（眠り・毒など。作品横断の比較単位。effects.json の kinds に定義）
 * series: 同じ作品・属性・用途の中に別系統があるときの識別子（DQ のメラ系とギラ系など）
 * 系統＝ game + el + fx + kind + series + line が同じもの。tier はその中の段階
 */
export type Magic = {
  id: string; name: string; kana?: string; game: string; el: string | null; fx: string; kind?: string; series?: string;
  tier: number; scope?: string; line?: 'base' | 'all'; desc?: string; note?: string; src?: Source[];
};
export type MagicSystem = {
  overview: string; rules: string[]; growth?: string[]; categories?: { name: string; desc: string }[];
  elementNames?: Record<string, string>; classes?: Record<string, string>; verdict?: string; src?: Source[];
};
export type CatalogItem = { name: string; sys: string; game?: string; slug?: string };

export const EL = elementsData as Element[];
export const FX = effectsData as Effect[];
export const GAMES = gamesData as Game[];
export const MAGICS = magicsData as Magic[];
export const SYSTEMS = systemsData as Record<string, MagicSystem>;
export const CATALOG = catalogData as { name: string; items: CatalogItem[] }[];

export const elById = Object.fromEntries(EL.map((e) => [e.id, e])) as Record<string, Element>;
export const fxById = Object.fromEntries(FX.map((f) => [f.id, f])) as Record<string, Effect>;
export const gameById = Object.fromEntries(GAMES.map((g) => [g.id, g])) as Record<string, Game>;
export const magicById = Object.fromEntries(MAGICS.map((m) => [m.id, m])) as Record<string, Magic>;

/** 「魔法」の呼び方ごとの作品（詳細ページ用。収録のある作品のみ） */
export const SYSTEM_NAMES: [string, string[]][] = (() => {
  const m = new Map<string, string[]>();
  GAMES.filter((g) => MAGICS.some((x) => x.game === g.id)).forEach((g) => m.set(g.sys, [...(m.get(g.sys) ?? []), g.short]));
  return [...m];
})();

// ---------- URLs
export const magicUrl = (m: Magic) => `/magic/${m.id}`;
export const systemUrl = (gameId: string) => `/game/${gameById[gameId].slug}/magic-system`;
export const compareUrl = (el: string | null, fx: string) =>
  fx === 'atk' ? `/element/${el ?? 'fire'}` : `/effect/${fxById[fx].slug}`;

// ---------- 見た目
export const tone = (el?: Element | null) =>
  el && el.hue != null
    ? { bg: `oklch(0.89 0.045 ${el.hue})`, ink: `oklch(0.45 0.14 ${el.hue})` }
    : { bg: '#e3d6b8', ink: '#4a3a28' };
export const markStyle = (el?: Element | null, size = 24) => {
  const t = tone(el);
  return `--s:${size}px;--bg:${t.bg};--fg:${t.ink}`;
};

// ---------- 検索・分類ロジック
const lineKey = (m: Pick<Magic, 'kind' | 'series'>) => `${m.kind ?? ''}|${m.series ?? ''}`;

/** 系統（同じ作品・属性・用途・細分類・系統識別子・単体/全体）を段階順に */
export const chainOf = (game: string, el: string | null, fx: string, line: string = 'base', key?: string) =>
  MAGICS.filter((m) => m.game === game && m.el === el && m.fx === fx && (m.line ?? 'base') === line && (key === undefined || lineKey(m) === key))
    .sort((a, b) => a.tier - b.tier);

/** その魔法が属する系統 */
export const chainOfMagic = (m: Magic) => chainOf(m.game, m.el, m.fx, m.line, lineKey(m));

/** 作品内の、ある属性×用途の系統をすべて（kinds の定義順 → 登録順） */
export const chainsOf = (game: string, el: string | null, fx: string, line: string = 'base') => {
  const list = chainOf(game, el, fx, line), keys: string[] = [];
  list.forEach((m) => { const k = lineKey(m); if (!keys.includes(k)) keys.push(k); });
  const order = Object.keys(fxById[fx]?.kinds ?? {});
  const rank = (k: string) => { const kd = k.split('|')[0], i = order.indexOf(kd); return !kd ? -1 : i < 0 ? order.length : i; };
  return keys.sort((a, b) => rank(a) - rank(b)).map((k) => ({ key: k, kind: k.split('|')[0] || null, list: list.filter((m) => lineKey(m) === k) }));
};

/** 細分類の表示名 */
export const kindName = (fx: string, kind?: string | null) => (kind ? fxById[fx]?.kinds?.[kind] ?? null : null);

export const titleOf = (el: string | null, fx: string) => {
  const E = el ? elById[el] : null;
  return E ? `${E.name}属性の${fxById[fx].name}魔法` : `${fxById[fx].name}魔法`;
};

/** 作品内での分類名（黒魔法・僧侶呪文など） */
export const subOf = (m: Magic) => {
  const c = SYSTEMS[m.game]?.classes;
  return c ? c[m.fx] ?? c.default : gameById[m.game].sys;
};

/** 作品内での属性の呼び名（火炎・氷結など） */
export const elnOf = (game: string, el: string | null) => (el ? SYSTEMS[game]?.elementNames?.[el] ?? null : null);

/** 抽象パターンの種類 */
export const kindOf = (m: Pick<Magic, 'el' | 'fx'>) =>
  m.el && m.fx === 'atk'
    ? m.el
    : ({ atkup: 'buff', defup: 'buff', spdup: 'buff', barrier: 'buff', atkdown: 'ailment', defdown: 'ailment', spddown: 'ailment', cure: 'heal', field: 'none', misc: 'none' } as Record<string, string>)[m.fx] ?? m.fx;

export const effectText = (m: Magic) => {
  const ch = chainOfMagic(m);
  const idx = ch.findIndex((c) => c.id === m.id), n = ch.length, sys = gameById[m.game].sys;
  const TGT: Record<string, string> = { 単体: '敵1体', グループ: '敵1グループ', 全体: '敵全体' };
  const IMG: Record<string, string> = { fire: '燃えさかる炎を放ち', ice: '凍てつく冷気を浴びせ', thunder: '天から雷を落とし', wind: '真空の刃で切り裂き', water: '激流を叩きつけ', earth: '大地の力で押しつぶし', light: '聖なる光で焼き', dark: '闇の力で蝕み' };
  let a: string;
  if (m.desc) a = m.desc;
  else if (m.fx === 'atk') a = (TGT[m.scope ?? ''] ?? '敵') + 'に' + (IMG[m.el ?? ''] ?? '魔力をぶつけ') + '、ダメージを与える。';
  else if (m.fx === 'heal') a = '味方' + (({ 単体: '1人', 全体: '全員' } as Record<string, string>)[m.scope ?? ''] ?? '') + 'のHPを回復する。';
  else a = (kindName(m.fx, m.kind) ?? fxById[m.fx].phrase) + (m.scope ? `（${m.scope}）` : '') + '。';
  let pos: string;
  if (n === 1) pos = `この作品では同系統の${sys}はこれひとつ。`;
  else if (idx === 0) pos = `系統の基本形で、${ch[1].name}${n > 2 ? '、' + ch[n - 1].name : ''}へと強化されていく。`;
  else if (idx === n - 1) pos = `${ch[0].name}系の最上位。`;
  else pos = `${ch[0].name}系の${idx + 1}段目。`;
  return a + pos;
};

/** 系譜内で共通部分／変化部分を分ける（変化部分を赤茶で強調） */
export const splitNames = (names: string[]) => {
  if (names.length < 2) return names.map((n) => ({ a: '', b: n, c: '', hl: false }));
  let pre = names[0];
  names.forEach((n) => { while (pre && !n.startsWith(pre)) pre = pre.slice(0, -1); });
  const rest = names.map((n) => n.slice(pre.length));
  let post = rest[0];
  rest.forEach((n) => { while (post && !n.endsWith(post)) post = post.slice(1); });
  const hl = !!(pre || post);
  return names.map((n) => ({ a: pre, b: n.slice(pre.length, n.length - post.length), c: post, hl }));
};

export type ChainLine = { label: string; showLabel: boolean; items: { a: string; b: string; c: string; hl: boolean; cur: boolean; href: string }[] };
export type ChainGroup = { el: Element | null; mark: string; label: string; lines: ChainLine[] };

/** 作品×用途の系譜図データ。属性×用途×細分類で1グループ、その中の系統（series×単体/全体）を1行ずつ */
export const buildGroups = (game: string, fxList: string[], opts: { curId?: string; el?: string | null } = {}): ChainGroup[] => {
  const gm = MAGICS.filter((x) => x.game === game && fxList.includes(x.fx) && (!('el' in opts) || x.el === opts.el));
  const keys: string[] = [];
  // join は null を空文字にするため、属性は String() で 'null' にしてからつなぐ
  gm.forEach((x) => { const k = [x.fx, String(x.el), x.kind ?? ''].join('#'); if (!keys.includes(k)) keys.push(k); });
  const elOrder = EL.map((e) => e.id);
  const kindRank = (fx: string, kd: string) => { const o = Object.keys(fxById[fx]?.kinds ?? {}), i = o.indexOf(kd); return !kd ? -1 : i < 0 ? o.length : i; };
  keys.sort((a, b) => {
    const A = a.split('#'), B = b.split('#');
    return fxList.indexOf(A[0]) - fxList.indexOf(B[0]) || elOrder.indexOf(A[1]) - elOrder.indexOf(B[1]) || kindRank(A[0], A[2]) - kindRank(B[0], B[2]);
  });
  return keys.map((k) => {
    const [fx, e0, kd] = k.split('#');
    const el = e0 === 'null' ? null : e0, E = el ? elById[el] : null, F = fxById[fx];
    const items = gm.filter((x) => x.fx === fx && x.el === el && (x.kind ?? '') === kd);
    const chains: { lk: string; ln: string }[] = [];
    items.forEach((x) => { const c = { lk: lineKey(x), ln: x.line ?? 'base' }; if (!chains.some((y) => y.lk === c.lk && y.ln === c.ln)) chains.push(c); });
    // 単体系統の直後に対応する全体系統を並べる
    chains.sort((a, b) => (a.lk === b.lk ? (a.ln === 'base' ? -1 : 1) : 0));
    const hasAll = chains.some((c) => c.ln === 'all') && chains.some((c) => c.ln === 'base');
    const eln = elnOf(game, el), kn = kindName(fx, kd);
    const base = E ? (eln ?? E.name) + (fx === 'atk' ? '' : '・' + F.name) : F.name;
    return {
      el: E, mark: E ? E.name : F.kanji,
      label: kn ? `${base}・${kn}` : base,
      lines: chains.map(({ lk, ln }) => {
        const ch = chainOf(game, el, fx, ln, lk), parts = splitNames(ch.map((c) => c.name));
        return { label: ln === 'all' ? '全体' : '単体', showLabel: hasAll, items: ch.map((c, i) => ({ ...parts[i], cur: c.id === opts.curId, href: magicUrl(c) })) };
      }),
    };
  });
};

/** 今日の魔法（ビルド日で決定。毎日再ビルドする想定） */
export const todayMagic = (d = new Date()) => MAGICS[(Math.floor(d.getTime() / 86400000) * 7) % MAGICS.length];

/** クライアント検索用の軽量インデックス */
export const searchIndex = {
  magics: MAGICS.map((m) => ({ id: m.id, n: m.name, ...(m.kana ? { k: m.kana } : {}), g: gameById[m.game].name })),
  els: EL.filter((e) => e.id !== 'none').map((e) => ({ name: e.name, al: e.aliases, href: `/element/${e.id}` })),
  fxs: FX.map((f) => ({ name: f.name, href: compareUrl(null, f.id) })),
  games: GAMES.map((g) => ({ name: g.name, short: g.short, href: systemUrl(g.id) })),
};
