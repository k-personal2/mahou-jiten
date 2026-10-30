/**
 * 英訳の材料を作る（翻訳担当のサブエージェント向け）。出力先は tools/research/out/en/in/（Git の管理外）
 * 実行：cd astro && node --import <tsx>/dist/esm/index.mjs ../tools/en/prep.mts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { PAGE_MAGICS, MAGICS, GAMES, SYSTEMS, STAGES, STAGE_DOC, TERMS, CATALOG, FX, gameById } from '../../astro/src/lib/dict';
import { GAME_EN, readingOf } from '../../astro/src/lib/en';

const OUT = new URL('../research/out/en/in/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const write = (name: string, data: unknown) => writeFileSync(new URL(name, OUT), JSON.stringify(data, null, 1));
const len = (x: unknown) => JSON.stringify(x).length;

// 作品ごとの魔法名の読み（本文中の魔法名をこの読みで書く）
const glossaryOf = (game: string) => Object.fromEntries(
  MAGICS.filter((m) => m.game === game).map((m) => [m.name, readingOf(m)]).filter(([, r]) => r),
);

// 1. 魔法の説明（desc）と補足（note）。作品をまたがないように約20,000字ずつに分ける
const byGame = new Map<string, typeof PAGE_MAGICS>();
PAGE_MAGICS.filter((m) => m.desc || m.note).forEach((m) => byGame.set(m.game, [...(byGame.get(m.game) ?? []), m]));
const chunks: { games: Record<string, { en: string; glossary: Record<string, string> }>; magics: unknown[] }[] = [];
let cur = { games: {}, magics: [] as unknown[] } as (typeof chunks)[number];
for (const [game, list] of byGame) {
  const rows = list.map((m) => ({ id: m.id, game, name: m.name, ro: readingOf(m), desc: m.desc, note: m.note }));
  if (len(cur.magics) + len(rows) > 24000 && cur.magics.length) { chunks.push(cur); cur = { games: {}, magics: [] }; }
  cur.games[game] = { en: GAME_EN[game].name, glossary: glossaryOf(game) };
  cur.magics.push(...rows);
}
chunks.push(cur);
chunks.forEach((c, i) => write(`magics-${String(i + 1).padStart(2, '0')}.json`, c));

// 2. 使用者・消費（表記の種類ごとに1回だけ訳す）。どの作品で使われているかを添える
const ctx = (key: 'users' | 'cost') => {
  const m = new Map<string, Set<string>>();
  MAGICS.forEach((x) => [x[key]].flat().filter(Boolean).forEach((v) => m.set(v as string, (m.get(v as string) ?? new Set()).add(GAME_EN[x.game].name))));
  return [...m].map(([ja, g]) => ({ ja, games: [...g].slice(0, 3) }));
};
write('users.json', { users: ctx('users') });
write('costs.json', { costs: ctx('cost') });

// 3. 作品ごとの魔法体系（出典は訳さないので外す）
const sysChunks: Record<string, unknown>[] = [{}];
GAMES.forEach((g) => {
  const { src, ...s } = SYSTEMS[g.id] as Record<string, unknown>;
  const row = { gameEn: GAME_EN[g.id].name, sys: g.sys, glossary: glossaryOf(g.id), ...s };
  const last = sysChunks[sysChunks.length - 1];
  if (len(last) + len(row) > 30000 && Object.keys(last).length) sysChunks.push({});
  sysChunks[sysChunks.length - 1][g.id] = row;
});
sysChunks.forEach((c, i) => write(`systems-${String(i + 1).padStart(2, '0')}.json`, c));

// 4. 段階の付け方（作品ごと＋型の説明）、呼び方の説明、その他の短い語
const stageRows = Object.fromEntries(Object.entries(STAGES).map(([id, s]) => [id, {
  gameEn: GAME_EN[id]?.name, desc: s.desc, diff: s.diff, insight: s.insight, scopeDesc: s.scope.desc,
}]));
const half = Math.ceil(Object.keys(stageRows).length / 2);
write('stages-01.json', Object.fromEntries(Object.entries(stageRows).slice(0, half)));
write('stages-02.json', Object.fromEntries(Object.entries(stageRows).slice(half)));
write('misc.json', {
  stageDoc: STAGE_DOC,
  terms: TERMS,
  catalog: CATALOG.map((c) => ({ name: c.name, items: c.items.map((i) => ({ name: i.name, sys: i.sys, game: i.game, gameEn: i.game ? GAME_EN[i.game]?.name : undefined })) })),
  kinds: Object.fromEntries(FX.filter((f) => f.kinds).map((f) => [f.id, f.kinds])),
  basis: Object.fromEntries(GAMES.filter((g) => g.basis || g.release?.note).map((g) => [g.id, { basis: g.basis, releaseNote: g.release?.note }])),
  shopLabels: Object.fromEntries(GAMES.flatMap((g) => (g.shop ?? []).map((s) => [s.label, GAME_EN[g.id].name]))),
});
console.log(`magics ${chunks.length} chunks, systems ${sysChunks.length} chunks`);

// 5. 英語版の公式の魔法名の調査（担当ごとに代表作品で分ける。英語版のない作品は入れない）
const NAME_BATCHES: Record<string, string[]> = {
  'names-1-ff': ['ff', 'kh', 'bravely', 'octopath', 'chrono'],
  'names-2-atlus': ['smt', 'persona', 'metaphor'],
  'names-3-dq': ['dq', 'wiz', 'pokemon', 'mother', 'bof', 'goldensun', 'phantasystar'],
  'names-4-saga': ['rsaga', 'rsaga2', 'rsaga3', 'sf', 'sf2', 'saga1', 'saga2', 'saga3', 'seiken2', 'seiken3', 'wildarms'],
  'names-5-other': ['lunar', 'xenogears', 'starocean', 'tales', 'grandia', 'kiseki', 'estpolis', 'suikoden', 'valkyrie', 'shiningforce', 'nier', 'zelda'],
};
const fxName = Object.fromEntries(FX.map((f) => [f.id, f.name]));
for (const [file, reps] of Object.entries(NAME_BATCHES)) {
  const games = GAMES.filter((g) => reps.includes(g.group ?? g.id));
  write(`${file}.json`, {
    games: Object.fromEntries(games.map((g) => [g.id, { ja: g.name, en: GAME_EN[g.id].name, basis: g.basis, group: g.group }])),
    magics: PAGE_MAGICS.filter((m) => reps.includes(gameById[m.game].group ?? m.game)).map((m) => ({
      id: m.id, game: m.game, name: m.name, ro: readingOf(m), fx: fxName[m.fx], el: m.el, desc: m.desc?.slice(0, 60),
    })),
  });
}
