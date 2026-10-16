// OGP 画像（public/og.png, 1200×630）を生成する。手元で1回実行してコミットする
// （Cloudflare のビルド環境には日本語フォントがないため、ビルド時には生成しない）
// 実行：node scripts/make-og.mjs   ※ macOS のヒラギノ明朝を使用
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

// 収録数は src/lib/dict.ts の STATS と同じ数え方（シリーズは1作品、シリーズ内の同名の魔法は1種）。端数は切り捨てて「以上」と書く
const load = (f) => JSON.parse(readFileSync(new URL(`../src/data/${f}`, import.meta.url)));
const games = load('games.json'), magics = load('magics.json');
const groupOf = Object.fromEntries(games.map((g) => [g.id, g.group]));
const pages = new Set(magics.map((m) => (groupOf[m.game] ? `${groupOf[m.game]}|${m.name}` : `${m.game}|${m.id}`)));
// 代表作品の魔法と同名のシリーズ作品の魔法は、代表のページにまとまる
magics.filter((m) => !groupOf[m.game]).forEach((m) => pages.has(`${m.game}|${m.name}`) && pages.delete(`${m.game}|${m.name}`));
const nGames = games.filter((g) => !g.group).length;
const nMagics = Math.floor(pages.size / 100) * 100;

const F = "'Hiragino Mincho ProN', 'Hiragino Mincho Pro', serif";
const words = ['メラ', 'ファイア', 'アギ', 'PKファイアー', 'ハリト'];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ece2ca"/>
  <rect x="36" y="36" width="1128" height="558" fill="#f6eedb" stroke="#c9b58d" stroke-width="3"/>
  <rect x="50" y="50" width="1100" height="530" fill="none" stroke="#dfd0ae" stroke-width="2"/>
  <g transform="translate(1060 140) scale(.8)">
    <circle r="62" fill="none" stroke="#2a1f14" stroke-width="7"/>
    <circle r="48" fill="none" stroke="#2a1f14" stroke-width="3" opacity=".5"/>
    <path d="M0 -50 C4 -16 16 -4 50 0 C16 4 4 16 0 50 C-4 16 -16 4 -50 0 C-16 -4 -4 -16 0 -50 Z" fill="#8a2f1c"/>
  </g>
  <text x="110" y="150" font-family="${F}" font-size="30" fill="#8a2f1c" letter-spacing="6">✦ Lexicon Arcanum ✦</text>
  <text x="106" y="265" font-family="${F}" font-weight="700" font-size="88" fill="#2a1f14">RPG魔法の言い換え辞典</text>
  <text x="110" y="345" font-family="${F}" font-size="38" fill="#4a3a28">あのゲームの「あの魔法」、別のRPGでは何て呼ぶ？</text>
  <line x1="110" y1="405" x2="1090" y2="405" stroke="#d6c6a2" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="110" y="490" font-family="${F}" font-weight="700" font-size="42" fill="#2a1f14">${words.join('<tspan fill="#ad9a78" font-weight="400" dx="14">≒</tspan><tspan dx="14">').replace(/<tspan dx="14">([^<]*)/g, '<tspan dx="14">$1</tspan>')}</text>
  <text x="110" y="548" font-family="${F}" font-size="26" fill="#6b573e">${nGames}作品・${nMagics.toLocaleString()}種以上の魔法を作品横断で比較</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(new URL('../public/og.png', import.meta.url).pathname);
console.log('public/og.png');
