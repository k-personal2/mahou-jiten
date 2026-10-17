import elementsData from '../data/elements.json';
import effectsData from '../data/effects.json';
import gamesData from '../data/games.json';
import magicsData from '../data/magics.json';
import systemsData from '../data/systems.json';
import catalogData from '../data/catalog.json';
import termsData from '../data/terms.json';
import stagesData from '../data/stages.json';
import stageDocData from '../data/stage-types.json';

export type Element = { id: string; name: string; hue: number | null; phrase: string; aliases: string[] };
export type Source = { title: string; url: string };
export type Effect = { id: string; name: string; kanji: string; slug: string; phrase: string; kinds?: Record<string, string> };
/** series: シリーズ名 / basis: どの作品・版の表記を基準にしているか */
/** group: シリーズの各作品のとき、そのシリーズの代表作品の id（DQIII なら 'dq'） */
export type Game = { id: string; name: string; short: string; sys: string; slug: string; series?: string; basis?: string; group?: string };
/**
 * kind: 用途内の細分類（眠り・毒など。作品横断の比較単位。effects.json の kinds に定義）
 * series: 同じ作品・属性・用途の中に別系統があるときの識別子（DQ のメラ系とギラ系など）
 * 系統＝ game + el + fx + kind + series + line が同じもの。tier はその中の段階
 */
export type Magic = {
  id: string; name: string; kana?: string; game: string; el: string | null; fx: string; kind?: string; series?: string;
  tier: number; scope?: string; line?: 'base' | 'all'; desc?: string; note?: string; src?: Source[];
  /** 消費（作品内の単位つき。例 "MP 3"、"PP 2"）/ 主な使用者（作品内の呼び方のまま） */
  cost?: string; users?: string[];
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
/** 魔法の呼び方（呪文・術・PSI…）の説明 */
export const TERMS = termsData as Record<string, string>;

export const elById = Object.fromEntries(EL.map((e) => [e.id, e])) as Record<string, Element>;
export const fxById = Object.fromEntries(FX.map((f) => [f.id, f])) as Record<string, Effect>;
export const gameById = Object.fromEntries(GAMES.map((g) => [g.id, g])) as Record<string, Game>;
export const magicById = Object.fromEntries(MAGICS.map((m) => [m.id, m])) as Record<string, Magic>;

// ---------- シリーズ（代表作品＋各作品）
/** 比較ページなどに並べる代表作品（シリーズの各作品を除く） */
export const REP_GAMES = GAMES.filter((g) => !g.group);
/** 作品が属するシリーズの代表の id（代表自身ならそのまま） */
export const groupOf = (gameId: string) => gameById[gameId]?.group ?? gameId;
/** シリーズの作品（代表 → 各作品の順） */
export const seriesGames = (gameId: string) => { const r = groupOf(gameId); return GAMES.filter((g) => g.id === r || g.group === r); };

// シリーズの各作品の魔法は、代表作品（なければ先に出た各作品）の同名の魔法のページにまとめる。
// 代表作品どうし・同じ作品の中の同名（ロマサガの各系統のエレメンタルなど）はまとめない
const gameOrder = new Map(GAMES.map((g, i) => [g.id, i]));
const repByName = new Map<string, Magic>();
MAGICS.forEach((m) => { if (!gameById[m.game]?.group) { const k = m.game + '|' + m.name; if (!repByName.has(k)) repByName.set(k, m); } });
const varByName = new Map<string, Magic>();
[...MAGICS].filter((m) => gameById[m.game]?.group).sort((a, b) => gameOrder.get(a.game)! - gameOrder.get(b.game)!)
  .forEach((m) => { const k = groupOf(m.game) + '|' + m.name; if (!varByName.has(k)) varByName.set(k, m); });
const canon = new Map<Magic, Magic>();
MAGICS.forEach((m) => {
  const g = gameById[m.game]?.group;
  canon.set(m, g ? repByName.get(g + '|' + m.name) ?? varByName.get(g + '|' + m.name)! : m);
});
const members = new Map<Magic, Magic[]>();
[...MAGICS].sort((a, b) => gameOrder.get(a.game)! - gameOrder.get(b.game)!).forEach((m) => { const c = canon.get(m)!; members.set(c, [...(members.get(c) ?? []), m]); });
/** その魔法のページになる正規の魔法 */
export const canonicalOf = (m: Magic) => canon.get(m) ?? m;
/** 同じページにまとめられる魔法（登場作品の一覧。正規のものが先頭） */
export const appearancesOf = (m: Magic) => members.get(canonicalOf(m)) ?? [m];
/** ページを作る魔法 */
export const PAGE_MAGICS = MAGICS.filter((m) => canonicalOf(m) === m);

// ---------- URLs
export const magicUrl = (m: Magic) => `/magic/${canonicalOf(m).id}`;
export const systemUrl = (gameId: string) => `/game/${gameById[gameId].slug}/magic-system`;
export const compareUrl = (el: string | null, fx: string) =>
  fx === 'atk' ? `/element/${el ?? 'fire'}` : `/effect/${fxById[fx].slug}`;

// ---------- 見た目
/** 属性の色（文字色にだけ使う。意味は必ず文字でも示す） */
export const elInk = (el?: Element | null) => (el && el.hue != null ? `oklch(0.45 0.13 ${el.hue})` : 'var(--ink-2)');

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

/**
 * 魔法ページの1文。データにある値（属性・用途・作品内の呼び方・対象・段階）だけで組む
 * 例：氷属性の攻撃呪文。対象は単体。ヒャド系統の1段目（全4段）。
 */
export const leadParts = (m: Magic) => {
  const ch = chainOfMagic(m), idx = ch.findIndex((c) => c.id === m.id);
  const E = m.el ? elById[m.el] : null, F = fxById[m.fx], kn = kindName(m.fx, m.kind), sys = gameById[m.game].sys;
  const what = (E && E.id !== 'none' ? `${E.name}属性の` : E ? '無属性の' : '') + F.name + (F.name.length > 2 ? 'の' : '') + (sys === 'なし' ? '魔法' : sys);
  return {
    head: what + (kn ? `（${kn}）` : '') + '。' + (m.scope ? `対象は${m.scope}。` : ''),
    chain: ch.length > 1 ? { root: ch[0].name, tier: idx + 1, n: ch.length } : null,
  };
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

// ---------- 魔法世界の設計図：段階の付け方（stages.json は tools/merge-stages.mjs で作る。型の説明は stage-types.json）
/** linked：同じ系統の中で段階順に並んでいる（→ でつないでよい） */
export type StageExample = { names: string[]; linked: boolean };
export type Stage = {
  primary: string; secondary: string[]; maxTier: number; desc: string; examples: StageExample[];
  scope: { type: string; desc: string; examples: string[][] };
  sameAsGroup?: boolean; diff?: string; insight: string; confidence: 'high' | 'mid' | 'low';
};
export type StageType = { id: string; name: string; sample: string | null; short: string; how: string; good: string; watch: string; ask: string };
export const STAGES = stagesData as Record<string, Stage>;
export const STAGE_DOC = stageDocData as {
  types: StageType[]; scopeTypes: { id: string; name: string; how: string }[];
  notes: { title: string; body: string; refs: { game: string; names: string[] }[] }[]; questions: string[];
};
export const stageTypeById = Object.fromEntries(STAGE_DOC.types.map((t) => [t.id, t])) as Record<string, StageType>;
export const scopeTypeById = Object.fromEntries(STAGE_DOC.scopeTypes.map((t) => [t.id, t])) as Record<string, { id: string; name: string; how: string }>;
export const BLUEPRINT_TIER_URL = '/blueprint/tier';
export const stageTypeUrl = (type: string) => `${BLUEPRINT_TIER_URL}#${type}`;

/** 作品内の魔法名の並びを系譜の1行に（名前はその作品のデータにあるもの。validate-data で確認済み） */
export const nameLine = (game: string, names: string[]): ChainLine & { linked: boolean } => {
  const ms = names.map((n) => MAGICS.find((m) => m.game === game && m.name === n)!);
  const key = (m: Magic) => [m.el, m.fx, lineKey(m), m.line ?? 'base'].join('#');
  const linked = ms.every((m, i) => i === 0 || (key(m) === key(ms[0]) && m.tier > ms[i - 1].tier));
  const parts = splitNames(names);
  return { label: '', showLabel: false, linked, items: ms.map((m, i) => ({ ...parts[i], cur: false, href: magicUrl(m) })) };
};

// ---------- 今日の魔法（ビルド日で決定。00:05 JST に毎日再ビルドする想定）
// ビルド環境は UTC のことがあるため、日付は常に JST で数える（UTC のままだと 00:05 JST のビルドが前日扱いになる）
const JST_MS = 9 * 3600000;
const jstDate = (d: Date) => new Date(d.getTime() + JST_MS);
/** JST の日付を「2026.10.16」の形で */
export const jstDateStr = (d = new Date()) => {
  const j = jstDate(d), p = (n: number) => String(n).padStart(2, '0');
  return `${j.getUTCFullYear()}.${p(j.getUTCMonth() + 1)}.${p(j.getUTCDate())}`;
};
export const todayMagic = (d = new Date()) => PAGE_MAGICS[(Math.floor(jstDate(d).getTime() / 86400000) * 7) % PAGE_MAGICS.length];

/** クライアント検索用の軽量インデックス */
export const searchIndex = {
  magics: PAGE_MAGICS.map((m) => ({ id: m.id, n: m.name, ...(m.kana ? { k: m.kana } : {}), g: gameById[m.game].name })),
  els: EL.filter((e) => e.id !== 'none').map((e) => ({ name: e.name, al: e.aliases, href: `/element/${e.id}` })),
  fxs: FX.map((f) => ({ name: f.name, href: compareUrl(null, f.id) })),
  games: GAMES.map((g) => ({ name: g.name, short: g.short, href: systemUrl(g.id) })),
};

/**
 * 「魔法を何と呼ぶ？」：呼び方ごとの作品（シリーズは代表作品だけ。準備中の作品は catalog から）。
 * 並びは games.json → catalog の順に、その呼び方が最初に出てきた順
 */
export type NamingItem = { name: string; short: string; href?: string };
export const NAMING: { term: string; desc?: string; items: NamingItem[] }[] = (() => {
  const m = new Map<string, NamingItem[]>();
  const add = (sys: string, it: NamingItem) => { if (sys && sys !== '—') m.set(sys, [...(m.get(sys) ?? []), it]); };
  REP_GAMES.filter((g) => SYSTEMS[g.id]).forEach((g) => add(g.sys, { name: g.name, short: g.short, href: systemUrl(g.id) }));
  CATALOG.flatMap((c) => c.items).filter((it) => !it.game).forEach((it) => add(it.sys, { name: it.name, short: it.name }));
  return [...m].map(([term, items]) => ({ term, desc: TERMS[term], items }));
})();

// ---------- 横断比較
/**
 * 比較ページの行（1行＝1作品の1系統。シリーズは代表作品だけ）。
 * 細分類なし（＝その用途の基本形）→ 定義順の細分類 → 未定義。細分類が主の用途（状態異常など）では細分類なしを末尾に
 */
export type CompareRow = { g: Game; list: Magic[]; kind: string | null };
export const compareRows = (el: string | null, fx: string): CompareRow[] => {
  const all = REP_GAMES.flatMap((g) => chainsOf(g.id, el, fx).map((c) => ({ g, list: c.list, kind: c.kind })));
  const order = Object.keys(fxById[fx]?.kinds ?? {});
  const kinded = all.filter((r) => r.kind).length > all.length / 2;
  const rank = (k: string | null) => (!k ? (kinded ? order.length + 1 : -1) : order.includes(k) ? order.indexOf(k) : order.length);
  return [...all].sort((a, b) => rank(a.kind) - rank(b.kind));
};
/** 系統の最初の名前ごとに、その名前を使う作品をまとめる（作品数の多い順） */
export const firstNames = (rows: CompareRow[]) => {
  const m = new Map<string, { name: string; magic: Magic; games: Game[] }>();
  rows.forEach(({ g, list }) => {
    const n = list[0].name, x = m.get(n) ?? { name: n, magic: list[0], games: [] };
    if (!x.games.includes(g)) x.games.push(g);
    m.set(n, x);
  });
  return [...m.values()].sort((a, b) => b.games.length - a.games.length);
};
export const rowsTotal = (rows: CompareRow[]) => rows.reduce((a, r) => a + r.list.length, 0);

// ---------- 収録数（表示する数字はすべてここから出す）
/**
 * 作品の数え方：シリーズ（DQ・FF・メガテン・ペルソナなど）は1作品として数える（作品一覧に並ぶ単位）。
 * titles はシリーズの各作品も1つずつ数えた数。magics は魔法のページ数（シリーズ内の同名は1つ）
 */
export const STATS = {
  games: REP_GAMES.length,
  titles: GAMES.length,
  magics: PAGE_MAGICS.length,
};
export const statsText = `収録${STATS.games}作品・${STATS.magics.toLocaleString()}種の魔法`;
