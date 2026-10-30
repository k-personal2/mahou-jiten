/**
 * 日本語版と英語版（/en/ 以下）の切り替え。ページは `const t = L(lang)` で受け取り、文言・URL・データの訳をここから取る。
 * 英語のデータ（src/data/en/）は tools/merge-en.mjs が作る。訳がまだない文章は英語版では出さない（日本語を混ぜない）
 */
import {
  EL, FX, GAMES, STATS, SYSTEMS, STAGES, STAGE_DOC, TERMS, CATALOG, NAMING, elById, fxById, gameById,
  magicUrl, systemUrl, compareUrl, chainOfMagic, buildGroups, nameLine, splitNames, titleOf, subOf, elnOf, kindName,
  leadParts, releaseDate, statsText, type Magic, type Game, type Element, type Effect, type Release, type ChainLine, type ChainGroup,
} from './dict';
import { GAME_EN, EL_EN, FX_EN, SYS_EN, sysEn, statsTextEn, readingOf } from './en';
import enMagics from '../data/en/magics.json';
import enNames from '../data/en/names.json';
import enSystems from '../data/en/systems.json';
import enStages from '../data/en/stages.json';
import enUsers from '../data/en/users.json';
import enCosts from '../data/en/costs.json';
import enMisc from '../data/en/misc.json';

export type Lang = 'ja' | 'en';
type Src = { title: string; url: string };
export type Official = { en: string; release?: string; older?: { en: string; release: string }[]; src?: Src[]; note?: string };
type SysEn = { overview?: string; rules?: string[]; growth?: string[]; verdict?: string; categories?: { name: string; desc: string }[]; classes?: Record<string, string>; elementNames?: Record<string, string> };
type StageEn = { desc?: string; diff?: string; insight?: string; scopeDesc?: string };
type DocEn = {
  types?: { id: string; name?: string; short?: string; how?: string; good?: string; watch?: string; ask?: string }[];
  scopeTypes?: { id: string; name?: string; how?: string }[];
  notes?: { title?: string; body?: string }[];
  questions?: string[];
};
type MiscEn = {
  stageDoc?: DocEn; terms?: Record<string, string>; catalog?: { name: string; items: { name: string; sys?: string }[] }[];
  kinds?: Record<string, Record<string, string>>; basis?: Record<string, { basis?: string; releaseNote?: string }>; shopLabels?: Record<string, string>;
};
const M = enMagics as Record<string, { desc?: string; note?: string }>;
const N = enNames as { games: Record<string, { status?: string; release?: string }>; magics: Record<string, Official> };
const SYS = enSystems as Record<string, SysEn>;
const STG = enStages as Record<string, StageEn>;
const USERS = enUsers as Record<string, string>;
const COSTS = enCosts as Record<string, string>;
const MISC = enMisc as MiscEn;

/**
 * 英語の魔法ページを検索に出すか。英語版の公式名が出典付きで確認できたものだけ（それ以外は訳だけの薄いページになるため noindex）。
 * サイトマップの除外（astro.config.mjs）も同じ names.json で判定する
 */
export const enIndexable = (m: Pick<Magic, 'id'>) => !!N.magics[m.id];

/** 日本語版のパスを英語版のパスに（/ → /en、/magic/x → /en/magic/x） */
export const enPath = (p: string) => (p === '/' ? '/en' : `/en${p}`);
/** 英語版のパスを日本語版のパスに */
export const jaPath = (p: string) => (p === '/en' ? '/' : p.replace(/^\/en(?=\/)/, ''));

// ---------- 英語の語句
const SCOPE_EN: Record<string, string> = { 単体: 'Single target', グループ: 'Group', 全体: 'All', 自分: 'Self' };
/** 「an ice attack spell」の attack の部分（形容詞として使う形） */
const FX_ADJ: Record<string, string> = {
  atk: 'attack', heal: 'healing', atkup: 'attack-boosting', defup: 'defense-boosting', spdup: 'speed-boosting',
  atkdown: 'attack-lowering', defdown: 'defense-lowering', spddown: 'speed-lowering', ailment: 'status-ailment', cure: 'ailment-curing',
  death: 'instant-death', revive: 'revival', barrier: 'barrier', field: 'field', misc: 'miscellaneous',
};
const PLATFORM_EN: Record<string, string> = {
  ファミリーコンピュータ: 'Famicom (NES)', スーパーファミコン: 'Super Famicom (SNES)', ゲームボーイ: 'Game Boy', ゲームボーイアドバンス: 'Game Boy Advance',
  ニンテンドー64: 'Nintendo 64', ニンテンドーDS: 'Nintendo DS', ニンテンドー3DS: 'Nintendo 3DS', プレイステーション: 'PlayStation',
  プレイステーション2: 'PlayStation 2', プレイステーション3: 'PlayStation 3', セガサターン: 'Sega Saturn', メガドライブ: 'Mega Drive (Genesis)',
  メガCD: 'Mega-CD (Sega CD)', 'PCエンジン SUPER CD-ROM²': 'PC Engine Super CD-ROM²',
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const an = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a');

/** 魔法名の表示形。英語版はローマ字読み（読めない漢字の名前は日本語のまま） */
const nameEn = (m: Pick<Magic, 'name' | 'kana'>) => readingOf(m) ?? m.name;

/** 系譜の行を英語版に：名前をローマ字にして変わる部分を付け直し、リンクを /en/ に */
const lineEn = <T extends ChainLine>(ln: T): T => {
  const parts = splitNames(ln.items.map((it) => nameEn(it.m)));
  return { ...ln, label: ln.label === '全体' ? 'All' : ln.label === '単体' ? 'Single' : ln.label, items: ln.items.map((it, i) => ({ ...it, ...parts[i], href: enPath(it.href) })) };
};

const ja = {
  lang: 'ja' as Lang, en: false,
  url: (p: string) => p,
  magic: (m: Magic) => magicUrl(m),
  system: (id: string) => systemUrl(id),
  compare: (el: string | null, fx: string) => compareUrl(el, fx),
  game: (g: Game) => ({ name: g.name, short: g.short }),
  sys: (sys: string) => sys,
  el: (E: Element) => E.name,
  elAttr: (E: Element) => (E.id === 'none' ? '無属性' : `${E.name}属性`),
  fx: (F: Effect) => F.name,
  kind: (fx: string, kind?: string | null) => kindName(fx, kind),
  title: (el: string | null, fx: string) => titleOf(el, fx),
  sub: (m: Magic) => subOf(m),
  eln: (game: string, el: string | null) => elnOf(game, el),
  scope: (s?: string) => s,
  cost: (s?: string) => s,
  users: (u?: string[]) => (u?.length ? u : undefined),
  desc: (m: Magic) => m.desc,
  note: (m: Magic) => m.note,
  name: (m: Pick<Magic, 'name' | 'kana'>) => m.name,
  official: (_m: Magic): Official | null => null,
  lead: (m: Magic) => leadParts(m),
  groups: (game: string, fxList: string[], opts: { curId?: string; el?: string | null } = {}) => buildGroups(game, fxList, opts),
  line: (game: string, names: string[]) => nameLine(game, names),
  system_: (id: string) => SYSTEMS[id] as SysEn,
  stage: (id: string) => ({ desc: STAGES[id].desc, diff: STAGES[id].diff, insight: STAGES[id].insight, scopeDesc: STAGES[id].scope.desc }) as StageEn,
  doc: STAGE_DOC,
  term: (term: string) => TERMS[term],
  catalog: CATALOG.map((c) => ({ name: c.name, items: c.items.map((i) => ({ ...i, label: i.name })) })),
  release: (r: Release) => releaseDate(r),
  platforms: (r: Release) => r.platforms.join('・'),
  basis: (g: Game) => g.basis,
  releaseNote: (g: Game) => g.release?.note,
  shopLabel: (label: string) => label,
  stats: statsText,
};

const en: typeof ja = {
  lang: 'en', en: true,
  url: enPath,
  magic: (m) => enPath(magicUrl(m)),
  system: (id) => enPath(systemUrl(id)),
  compare: (el, fx) => enPath(compareUrl(el, fx)),
  game: (g) => GAME_EN[g.id],
  sys: (sys) => cap(sysEn(sys)),
  el: (E) => EL_EN[E.id],
  elAttr: (E) => (E.id === 'none' ? 'Non-elemental' : EL_EN[E.id]),
  fx: (F) => FX_EN[F.id],
  kind: (fx, kind) => (kind ? MISC.kinds?.[fx]?.[kind] ?? kindName(fx, kind) : null),
  title: (el, fx) => {
    const E = el ? elById[el] : null;
    return E ? `${E.id === 'none' ? 'Non-elemental' : EL_EN[E.id]} ${fx === 'atk' ? 'attack' : FX_EN[fx].toLowerCase()} spells` : `${FX_EN[fx]} spells`;
  },
  sub: (m) => {
    const c = SYS[m.game]?.classes;
    return c?.[m.fx] ?? c?.default ?? cap(sysEn(gameById[m.game].sys));
  },
  eln: (game, el) => (el ? SYS[game]?.elementNames?.[el] ?? null : null),
  scope: (s) => (s ? SCOPE_EN[s] ?? s : s),
  cost: (s) => (s ? COSTS[s] : s),
  // 訳がなく、ローマ字にもできない（漢字を含む）名前は出さない（英語ページに日本語を混ぜない）
  users: (u) => { const r = (u ?? []).map((x) => USERS[x] ?? readingOf({ name: x })).filter((x): x is string => !!x); return r.length ? r : undefined; },
  desc: (m) => M[m.id]?.desc,
  note: (m) => M[m.id]?.note,
  name: nameEn,
  official: (m) => N.magics[m.id] ?? null,
  lead: (m) => {
    const ch = chainOfMagic(m), idx = ch.findIndex((c) => c.id === m.id);
    const E = m.el ? elById[m.el] : null, kn = en.kind(m.fx, m.kind);
    const el = E ? (E.id === 'none' ? 'non-elemental' : `${EL_EN[E.id].toLowerCase()}-element`) : '';
    const what = [el, FX_ADJ[m.fx], 'spell'].filter(Boolean).join(' ');
    return {
      head: `${cap(an(what))} ${what}${kn ? ` (${kn})` : ''}.${m.scope ? ` Target: ${SCOPE_EN[m.scope]?.toLowerCase() ?? m.scope}.` : ''}`,
      chain: ch.length > 1 ? { root: nameEn(ch[0]), tier: idx + 1, n: ch.length } : null,
    };
  },
  groups: (game, fxList, opts = {}) => buildGroups(game, fxList, opts).map((gp): ChainGroup => {
    const F = fxById[gp.lines[0]?.items[0]?.m.fx ?? fxList[0]], kd = gp.lines[0]?.items[0]?.m.kind;
    const eln = gp.el ? en.eln(game, gp.el.id) : null;
    const base = gp.el ? (eln ?? EL_EN[gp.el.id]) + (F.id === 'atk' ? '' : ` · ${FX_EN[F.id]}`) : FX_EN[F.id];
    const kn = en.kind(F.id, kd);
    return { ...gp, label: kn ? `${base} · ${kn}` : base, lines: gp.lines.map(lineEn) };
  }),
  line: (game, names) => lineEn(nameLine(game, names)),
  system_: (id) => SYS[id] ?? {},
  stage: (id) => STG[id] ?? {},
  doc: {
    types: STAGE_DOC.types.map((t) => ({ ...t, ...(MISC.stageDoc?.types?.find((x) => x.id === t.id) ?? {}) })),
    scopeTypes: STAGE_DOC.scopeTypes.map((t) => ({ ...t, ...(MISC.stageDoc?.scopeTypes?.find((x) => x.id === t.id) ?? {}) })),
    notes: STAGE_DOC.notes.map((nt, i) => ({ ...nt, ...(MISC.stageDoc?.notes?.[i] ?? {}), refs: nt.refs })),
    questions: MISC.stageDoc?.questions ?? [],
  } as typeof STAGE_DOC,
  term: (term) => MISC.terms?.[term] ?? '',
  catalog: CATALOG.map((c, i) => ({
    name: MISC.catalog?.[i]?.name ?? c.name,
    items: c.items.map((it, j) => ({ ...it, label: it.game ? GAME_EN[it.game].name : MISC.catalog?.[i]?.items[j]?.name ?? it.name })),
  })),
  release: (r) => {
    const [y, mo, d] = r.date.split('-').map(Number);
    return mo ? `${MONTHS[mo - 1]}${d ? ` ${d},` : ''} ${y}` : `${y}`;
  },
  platforms: (r) => r.platforms.map((p) => PLATFORM_EN[p] ?? p).join(', '),
  basis: (g) => MISC.basis?.[g.id]?.basis,
  releaseNote: (g) => MISC.basis?.[g.id]?.releaseNote,
  shopLabel: (label) => MISC.shopLabels?.[label] ?? label,
  stats: statsTextEn,
};

export const L = (lang: Lang = 'ja') => (lang === 'en' ? en : ja);
export type T = typeof ja;

/** 呼び方（呪文・術…）の一覧。英語版は訳語と説明の訳を付ける */
export const namingOf = (lang: Lang) => NAMING.map((t, i) => ({
  ...t, i,
  label: lang === 'en' ? cap(sysEn(t.term)) : t.term,
  ro: SYS_EN[t.term]?.ro,
  desc: lang === 'en' ? MISC.terms?.[t.term] : t.desc,
  items: t.items.map((it) => {
    const g = GAMES.find((x) => x.name === it.name);
    return { ...it, label: lang === 'en' && g ? GAME_EN[g.id].name : it.name, href: it.href && (lang === 'en' ? enPath(it.href) : it.href) };
  }),
}));

/** 英語版の検索インデックス（名前はローマ字・日本語・英語版の公式名で引ける） */
export const searchIndexEn = (pageMagics: Magic[]) => ({
  magics: pageMagics.map((m) => ({ id: m.id, n: nameEn(m), k: m.name, ...(N.magics[m.id] ? { e: N.magics[m.id].en } : {}), g: GAME_EN[m.game].name })),
  els: EL.filter((e) => e.id !== 'none').map((e) => ({ name: EL_EN[e.id], al: [EL_EN[e.id], ...e.aliases], href: enPath(`/element/${e.id}`) })),
  fxs: FX.map((f) => ({ name: FX_EN[f.id], href: enPath(compareUrl(null, f.id)) })),
  games: GAMES.map((g) => ({ name: GAME_EN[g.id].name, short: GAME_EN[g.id].short, href: enPath(systemUrl(g.id)) })),
});

export { STATS };
