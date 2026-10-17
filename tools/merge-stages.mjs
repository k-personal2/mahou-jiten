// 「段階の表し方」の型分け（tools/research/out/stage/stage-*.json）を astro/src/data/stages.json にまとめる。
// 仕様は tools/research/STAGE-SPEC.md。例の魔法名はその作品のデータにあるものだけ残し、
// 同じ系統の中で段階順に並んでいるもの（→ で表示してよいもの）には linked: true を付ける。
// 使い方：node tools/merge-stages.mjs（stages.json を上書きする。手で直した分は消えるので注意）
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));
const magics = read('astro/src/data/magics.json'), games = read('astro/src/data/games.json');

// 仕様の改訂（組み立て型の追加）で判定を変えた作品
const OVERRIDES = { sf2: { primary: 'combination', secondary: ['same-name'] } };
// 分析担当の文に残った、仕様書の型名・入力ファイルの言い回しをサイト向けの言葉に直す
const WORDING = [
  ['段階が上がると範囲も広がる tier-linked で、', '段階が上がると範囲も広がり、'],
  ['、こちらは affix にあたる', ''],
  ['（tier-linked）', ''], ['（affix）', ''], ['（separate-name）', ''],
  ['境目の決まりでは morph になる', 'このサイトの分類では語形変化型になる'],
  ['の組はまだ材料にない', 'の組はまだない'],
  ['。rules では単体版と範囲版を別名にする組もあるとされるが、材料には片方しかない', '。単体版と範囲版を別名にする組もあるが、このサイトで収録しているのは片方だけ'],
  ['材料ではほとんどの魔法が単体で', '収録している魔法はほとんどが単体で'],
  ['。切り替えができるかは材料にない', '。切り替えができるかは、資料で確認できていない'],
  ['段階を名前で表す決まりも入力にはない', '段階を名前で表す決まりも確認できていない'],
];
const clean = (t) => WORDING.reduce((s, [a, b]) => s.split(a).join(b), t ?? '');
const TYPES = new Set(['morph', 'suffix', 'prefix', 'symbol', 'compound', 'combination', 'distinct', 'same-name', 'none']);
const SCOPES = new Set(['separate-name', 'affix', 'toggle', 'tier-linked', 'none', 'other']);

// サイトと同じ系統の判定（astro/src/lib/dict.ts の chainOf と同じ）
const lineKey = (m) => [m.game, m.el, m.fx, m.kind ?? '', m.series ?? '', m.line ?? 'base'].join('|');
const logs = [];
const checkEx = (gid, names, where) => {
  const ms = names.map((n) => magics.find((m) => m.game === gid && m.name === n));
  const miss = names.filter((_, i) => !ms[i]);
  if (miss.length) { logs.push(`${gid} ${where}: データにない名前を外した ${miss.join('・')}`); return null; }
  const linked = ms.every((m) => lineKey(m) === lineKey(ms[0])) && ms.every((m, i) => i === 0 || m.tier > ms[i - 1].tier);
  return { names, linked };
};

const out = {};
for (const k of 'ABCD') {
  const p = `tools/research/out/stage/stage-${k}.json`;
  if (!existsSync(new URL(p, ROOT))) throw new Error(`${p} がない`);
  for (const g0 of read(p).games) {
    const g = { ...g0, ...OVERRIDES[g0.id] };
    if (!TYPES.has(g.primary)) throw new Error(`${g.id}: 未定義の型 ${g.primary}`);
    const p0 = g.patterns?.find((x) => x.type === g.primary) ?? g.patterns?.[0];
    out[g.id] = {
      primary: g.primary,
      secondary: (g.secondary ?? []).filter((t) => TYPES.has(t) && t !== g.primary),
      maxTier: g.maxTier ?? 1,
      desc: clean(p0?.description),
      examples: (p0?.examples ?? []).map((e) => checkEx(g.id, e, '段階の例')).filter(Boolean),
      scope: {
        type: SCOPES.has(g.scope?.type) ? g.scope.type : 'other',
        desc: clean(g.scope?.description),
        examples: (g.scope?.examples ?? []).map((e) => checkEx(g.id, e, '範囲の例')).filter(Boolean).map((e) => e.names),
      },
      ...(g.sameAsGroup ? { sameAsGroup: true } : {}),
      ...(g.seriesDiff ? { diff: clean(g.seriesDiff) } : {}),
      insight: clean(g.insight),
      confidence: g.confidence ?? 'mid',
    };
  }
}
// 直しきれていない言い回しがあれば止める
const leftover = Object.entries(out).flatMap(([k, v]) => [v.desc, v.scope.desc, v.diff ?? '', v.insight].filter((t) => /tier-linked|separate-name|same-name|affix|toggle|morph|suffix|prefix|compound|distinct|rules|growth|入力|材料にない|材料では|材料には/.test(t)).map((t) => `${k}: ${t}`));
if (leftover.length) throw new Error('型名などが残っている:\n' + leftover.join('\n'));
const missing = games.filter((g) => !out[g.id]).map((g) => g.id);
if (missing.length) throw new Error(`型分けのない作品: ${missing.join(' ')}`);
// games.json の順に並べる
const sorted = Object.fromEntries(games.map((g) => [g.id, out[g.id]]));
writeFileSync(new URL('astro/src/data/stages.json', ROOT), JSON.stringify(sorted, null, 1) + '\n');
logs.forEach((l) => console.log('・' + l));
console.log(`✓ stages.json: ${Object.keys(sorted).length}作品`);
