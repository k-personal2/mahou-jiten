/**
 * 英語版トップ（/en）用の訳語とローマ字表記。
 * 英語にしているのはトップページだけ。魔法名は日本語版の表記のまま出し、読みをローマ字で添える
 */
import { GAMES, STATS, type Magic } from './dict';

/** 作品の英語名。海外版があるものは英語版タイトル、ないものは日本語タイトルのローマ字 */
export const GAME_EN: Record<string, { name: string; short: string }> = {
  dq: { name: 'Dragon Quest (series)', short: 'DQ' },
  dq1: { name: 'Dragon Quest', short: 'DQ I' },
  dq2: { name: 'Dragon Quest II', short: 'DQ II' },
  dq3: { name: 'Dragon Quest III', short: 'DQ III' },
  dq4: { name: 'Dragon Quest IV', short: 'DQ IV' },
  dq5: { name: 'Dragon Quest V', short: 'DQ V' },
  dq6: { name: 'Dragon Quest VI', short: 'DQ VI' },
  dq7: { name: 'Dragon Quest VII', short: 'DQ VII' },
  dq8: { name: 'Dragon Quest VIII', short: 'DQ VIII' },
  dq9: { name: 'Dragon Quest IX', short: 'DQ IX' },
  dq10: { name: 'Dragon Quest X Online', short: 'DQ X' },
  ff: { name: 'Final Fantasy V', short: 'FF V' },
  ff1: { name: 'Final Fantasy', short: 'FF I' },
  ff2: { name: 'Final Fantasy II', short: 'FF II' },
  ff3: { name: 'Final Fantasy III', short: 'FF III' },
  ff4: { name: 'Final Fantasy IV', short: 'FF IV' },
  ff6: { name: 'Final Fantasy VI', short: 'FF VI' },
  ff7: { name: 'Final Fantasy VII', short: 'FF VII' },
  ff8: { name: 'Final Fantasy VIII', short: 'FF VIII' },
  ff9: { name: 'Final Fantasy IX', short: 'FF IX' },
  ff10: { name: 'Final Fantasy X', short: 'FF X' },
  ff11: { name: 'Final Fantasy XI', short: 'FF XI' },
  ff12: { name: 'Final Fantasy XII', short: 'FF XII' },
  ff13: { name: 'Final Fantasy XIII', short: 'FF XIII' },
  ff14: { name: 'Final Fantasy XIV', short: 'FF XIV' },
  smt: { name: 'Shin Megami Tensei III: Nocturne', short: 'SMT III' },
  smt1: { name: 'Shin Megami Tensei', short: 'SMT I' },
  smt2: { name: 'Shin Megami Tensei II', short: 'SMT II' },
  smt4: { name: 'Shin Megami Tensei IV', short: 'SMT IV' },
  smt5: { name: 'Shin Megami Tensei V', short: 'SMT V' },
  persona: { name: 'Persona 5 Royal', short: 'P5R' },
  persona1: { name: 'Persona (Megami Ibunroku Persona)', short: 'Persona 1' },
  persona2: { name: 'Persona 2: Innocent Sin', short: 'Persona 2' },
  persona3: { name: 'Persona 3', short: 'Persona 3' },
  persona4: { name: 'Persona 4', short: 'Persona 4' },
  mother: { name: 'EarthBound (Mother 2)', short: 'EarthBound' },
  metaphor: { name: 'Metaphor: ReFantazio', short: 'Metaphor' },
  saga1: { name: 'The Final Fantasy Legend (Makai Toushi SaGa)', short: 'SaGa 1' },
  saga2: { name: 'Final Fantasy Legend II (SaGa 2)', short: 'SaGa 2' },
  saga3: { name: 'Final Fantasy Legend III (SaGa 3)', short: 'SaGa 3' },
  rsaga: { name: 'Romancing SaGa', short: 'Romancing SaGa' },
  sf: { name: 'SaGa Frontier', short: 'SaGa Frontier' },
  rsaga2: { name: 'Romancing SaGa 2', short: 'Romancing SaGa 2' },
  rsaga3: { name: 'Romancing SaGa 3', short: 'Romancing SaGa 3' },
  sf2: { name: 'SaGa Frontier 2', short: 'SaGa Frontier 2' },
  chrono: { name: 'Chrono Trigger', short: 'Chrono Trigger' },
  wiz: { name: 'Wizardry', short: 'Wizardry' },
  bof: { name: 'Breath of Fire', short: 'BoF' },
  bof2: { name: 'Breath of Fire II', short: 'BoF II' },
  bof3: { name: 'Breath of Fire III', short: 'BoF III' },
  bof4: { name: 'Breath of Fire IV', short: 'BoF IV' },
  bof5: { name: 'Breath of Fire: Dragon Quarter', short: 'BoF V' },
  tengai: { name: 'Tengai Makyō II: Manjimaru', short: 'Tengai II' },
  momo: { name: 'Shin Momotarō Densetsu', short: 'Momotarō' },
  heracles: { name: 'Heracles no Eikō III', short: 'Heracles III' },
  daikaiju: { name: 'Daikaijū Monogatari', short: 'Daikaijū' },
  naga: { name: 'Samsara Naga 2', short: 'Naga 2' },
  oni: { name: 'ONI V: Innin o Tsugu Mono', short: 'ONI V' },
  zelda: { name: 'The Legend of Zelda: Ocarina of Time', short: 'Zelda' },
  smrpg: { name: 'Super Mario RPG', short: 'Mario RPG' },
  metalmax: { name: 'Metal Max', short: 'Metal Max' },
  tenchi: { name: 'Tenchi o Kurau II: Shokatsu Kōmei Den', short: 'Tenchi II' },
  knightgundam: { name: 'SD Gundam Gaiden: Knight Gundam Monogatari', short: 'Knight Gundam' },
  knightgundam2: { name: 'SD Gundam Gaiden: Knight Gundam Monogatari 2', short: 'Knight Gundam 2' },
  knightgundam3: { name: 'SD Gundam Gaiden: Knight Gundam Monogatari – Ōinaru Isan', short: 'Ōinaru Isan' },
  knightgundam4: { name: 'SD Gundam Gaiden: Knight Gundam Monogatari 3', short: 'Knight Gundam 3' },
  knightgundam5: { name: 'SD Gundam Gaiden 2: Entaku no Kishi', short: 'Entaku no Kishi' },
  goemon: { name: 'Ganbare Goemon Gaiden: Kieta Ōgon Kiseru', short: 'Goemon Gaiden' },
  kh: { name: 'Kingdom Hearts', short: 'KH' },
  nier: { name: 'NieR Replicant', short: 'NieR' },
  seiken2: { name: 'Secret of Mana', short: 'Secret of Mana' },
  seiken3: { name: 'Trials of Mana', short: 'Trials of Mana' },
  makamaka: { name: 'Maka Maka', short: 'Maka Maka' },
  tales: { name: 'Tales of Phantasia', short: 'Tales' },
  kiseki: { name: 'The Legend of Heroes: Trails in the Sky', short: 'Trails' },
  suikoden: { name: 'Suikoden', short: 'Suikoden' },
  goldensun: { name: 'Golden Sun', short: 'Golden Sun' },
  rudra: { name: 'Treasure of the Rudras', short: 'Rudras' },
  phantasystar: { name: 'Phantasy Star II', short: 'PS II' },
  shiningforce: { name: 'Shining Force', short: 'Shining Force' },
  pokemon: { name: 'Pokémon Red & Green', short: 'Pokémon' },
  bravely: { name: 'Bravely Default', short: 'Bravely Default' },
  starocean: { name: 'Star Ocean: The Second Story', short: 'SO2' },
  wildarms: { name: 'Wild Arms', short: 'Wild Arms' },
  octopath: { name: 'Octopath Traveler', short: 'Octopath' },
  xenogears: { name: 'Xenogears', short: 'Xenogears' },
  valkyrie: { name: 'Valkyrie Profile', short: 'Valkyrie Profile' },
  lunar: { name: 'Lunar: The Silver Star', short: 'Lunar' },
  estpolis: { name: 'Lufia II: Rise of the Sinistrals', short: 'Lufia II' },
  grandia: { name: 'Grandia', short: 'Grandia' },
};
// 作品を追加したら英語名も足す（足し忘れたままトップの英語版に日本語名が混ざらないよう、ビルドを止める）
const missing = GAMES.filter((g) => !GAME_EN[g.id]).map((g) => g.id);
if (missing.length) throw new Error(`src/lib/en.ts の GAME_EN に英語名がありません: ${missing.join(', ')}`);

export const EL_EN: Record<string, string> = {
  fire: 'Fire', ice: 'Ice', thunder: 'Lightning', wind: 'Wind', water: 'Water', earth: 'Earth', light: 'Light', dark: 'Darkness', none: 'Non-elemental',
};
export const FX_EN: Record<string, string> = {
  atk: 'Attack', heal: 'Healing', atkup: 'Attack up', defup: 'Defense up', spdup: 'Speed up',
  atkdown: 'Attack down', defdown: 'Defense down', spddown: 'Speed down', ailment: 'Status ailments', cure: 'Cure ailments',
  death: 'Instant death', revive: 'Revival', barrier: 'Barriers', field: 'Field & travel', misc: 'Other',
};
/** 作品が魔法を何と呼ぶか（games.json / catalog.json の sys）。ro は日本語の読み */
export const SYS_EN: Record<string, { ro?: string; en: string }> = {
  魔法: { ro: 'mahō', en: 'magic' },
  呪文: { ro: 'jumon', en: 'incantations' },
  術: { ro: 'jutsu', en: 'arts' },
  紋章: { ro: 'monshō', en: 'crests' },
  紋章術: { ro: 'monshōjutsu', en: 'crest arts' },
  スキル: { ro: 'sukiru', en: 'skills' },
  'スキル（魔法）': { en: 'skills (magic)' },
  '魔法（スキル）': { en: 'magic (skills)' },
  '魔法（特能）': { en: 'magic (special abilities)' },
  ペルソナ魔法: { en: 'Persona magic' },
  'アビリティ（魔法）': { en: 'abilities (magic)' },
  'バトルアビリティ（魔法）': { en: 'battle abilities (magic)' },
  '技（魔法）': { ro: 'waza', en: 'techs (magic)' },
  わざ: { ro: 'waza', en: 'moves' },
  PSI: { en: 'psychic powers' },
  アーツ: { ro: 'āts', en: 'arts' },
  エナジー: { ro: 'enajī', en: 'energy (Psynergy)' },
  エーテル: { ro: 'ēteru', en: 'ether' },
  スペシャル: { ro: 'supesharu', en: 'specials' },
  テクニック: { ro: 'tekunikku', en: 'techniques' },
  マントラ: { ro: 'mantora', en: 'mantras' },
  忍術: { ro: 'ninjutsu', en: 'ninja arts' },
  策略: { ro: 'sakuryaku', en: 'stratagems' },
  言霊: { ro: 'kotodama', en: 'word spirits' },
  変身技: { ro: 'henshin-waza', en: 'transformation arts' },
  なし: { en: 'no magic at all' },
};
export const sysEn = (sys: string) => SYS_EN[sys]?.en ?? sys;

export const statsTextEn = `${STATS.games} games · ${STATS.magics.toLocaleString('en-US')} spells`;

// ---------- ローマ字（ヘボン式）。漢字を含む名前は読み（kana）がなければ null
const KANA: Record<string, string> = {
  ア: 'a', イ: 'i', ウ: 'u', エ: 'e', オ: 'o', カ: 'ka', キ: 'ki', ク: 'ku', ケ: 'ke', コ: 'ko',
  サ: 'sa', シ: 'shi', ス: 'su', セ: 'se', ソ: 'so', タ: 'ta', チ: 'chi', ツ: 'tsu', テ: 'te', ト: 'to',
  ナ: 'na', ニ: 'ni', ヌ: 'nu', ネ: 'ne', ノ: 'no', ハ: 'ha', ヒ: 'hi', フ: 'fu', ヘ: 'he', ホ: 'ho',
  マ: 'ma', ミ: 'mi', ム: 'mu', メ: 'me', モ: 'mo', ヤ: 'ya', ユ: 'yu', ヨ: 'yo',
  ラ: 'ra', リ: 'ri', ル: 'ru', レ: 're', ロ: 'ro', ワ: 'wa', ヰ: 'i', ヱ: 'e', ヲ: 'o', ン: 'n',
  ガ: 'ga', ギ: 'gi', グ: 'gu', ゲ: 'ge', ゴ: 'go', ザ: 'za', ジ: 'ji', ズ: 'zu', ゼ: 'ze', ゾ: 'zo',
  ダ: 'da', ヂ: 'ji', ヅ: 'zu', デ: 'de', ド: 'do', バ: 'ba', ビ: 'bi', ブ: 'bu', ベ: 'be', ボ: 'bo',
  パ: 'pa', ピ: 'pi', プ: 'pu', ペ: 'pe', ポ: 'po', ヴ: 'vu',
};
const SMALL_Y: Record<string, string> = { ャ: 'a', ュ: 'u', ョ: 'o' };
const SMALL_V: Record<string, string> = { ァ: 'a', ィ: 'i', ゥ: 'u', ェ: 'e', ォ: 'o' };
const MACRON: Record<string, string> = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };
const toKata = (s: string) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

/** long: ひらがなの「おう」「うう」を長音にする（漢字の読みに使う。「ほのおのうず」のような名前そのものには使わない） */
export const romaji = (src: string, long = false): string | null => {
  const s = src.normalize('NFKC');
  if (/[一-鿿々]/.test(s)) return null;
  const chars = [...s];
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const raw = chars[i], c = toKata(raw), next = toKata(chars[i + 1] ?? ''), prev = toKata(chars[i - 1] ?? '');
    const last = out.slice(-1);
    if (long && raw === 'う' && !SMALL_V[next] && (last === 'o' || last === 'u')) { out = out.slice(0, -1) + MACRON[last]; continue; }
    if (KANA[c]) {
      let r = KANA[c];
      if (SMALL_Y[next] && r.endsWith('i')) { r = r.slice(0, -1); r += /(sh|ch|j)$/.test(r) ? SMALL_Y[next] : 'y' + SMALL_Y[next]; i++; }
      else if (SMALL_Y[next]) { r = r.replace(/[aiueo]$/, '') + 'y' + SMALL_Y[next]; i++; } // フュ・テュ・デュ
      else if (SMALL_V[next]) {
        r = c === 'ウ' ? 'w' : c === 'イ' ? 'y' : r.replace(/[aiueo]$/, '');
        r += SMALL_V[next]; i++;
      }
      if (/[A-Z0-9]$/.test(out)) out += ' '; // 「PKファイアー」→「PK Faiā」
      if (prev === 'ン' && /^[aiueoy]/.test(r)) out += "'";
      out += r;
    } else if (SMALL_V[c]) out += SMALL_V[c];
    else if (c === 'ッ') {
      const n = KANA[next];
      if (n) out += n.startsWith('ch') ? 't' : n[0];
    } else if (c === 'ー') {
      if (MACRON[last]) out = out.slice(0, -1) + MACRON[last];
    } else if (c === '・') out += ' ';
    else if (/[α-ωΑ-Ω]/.test(c)) out += (/[a-zāīūēō]$/i.test(out) ? ' ' : '') + c; // 「PKファイアーα」→「PK Faiā α」
    else if (/[゠-ヿ぀-ゟ]/.test(c)) return null; // 想定外のかな
    else out += raw.normalize('NFKC');
  }
  if (out === s) return null; // かなを含まない名前（PSI、？？？？ など）は読みを出さない
  // 語ごとに頭を大文字に（助詞の no は小文字のまま）
  return out.replace(/(^|\s)([a-zāīūēō]+)/g, (_, sp, w) => sp + (w === 'no' && sp ? w : w[0].toUpperCase() + w.slice(1)));
};
/**
 * 魔法名の読み。漢字の名前は kana から。
 * 「ファイアのしょ」「いやしの水」「練火の計」のように、かな以外の字と隣り合う「の」は助詞とみなして「Faia no sho」と区切る
 */
export const readingOf = (m: Pick<Magic, 'name' | 'kana'>) => {
  const isParticle = (i: number) => [m.name[i - 1], m.name[i + 1]].some((x) => x && !/[\u3041-\u3096]/.test(x));
  const at = [...m.name].flatMap((c, i) => (c === 'の' ? [i] : []));
  const kana = m.kana ?? m.name;
  const split = at.length > 0 && at.every(isParticle) && kana.split('の').length - 1 === at.length;
  return romaji(split ? kana.replaceAll('の', '・の・') : kana, !!m.kana);
};
