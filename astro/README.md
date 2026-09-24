# RPG魔法の言い換え辞典（Astro）

静的サイト。バックエンド・DB不要。

```bash
npm install     # postinstall で動的ルートのファイル名（-el- → [el] など）を自動修正
npm run dev     # http://localhost:4321
npm run build   # dist/ に静的HTMLを出力
```

## ページとURL

| URL | 内容 |
| --- | --- |
| `/` | トップ（検索・属性/用途・今日の魔法） |
| `/element/[el]` | 属性別の攻撃魔法の横断比較（例 `/element/ice`） |
| `/effect/[slug]` | 用途別の横断比較（例 `/effect/heal`） |
| `/magic/[id]` | 魔法詳細（例 `/magic/hyado`） |
| `/game` | 作品一覧 |
| `/game/[slug]/magic-system` | 作品ごとの魔法体系 |

## データ（src/data）

- `magics.json` — 1行1魔法
  - 必須：`id` / `name` / `game` / `el`（攻撃魔法の属性。攻撃以外は null）/ `fx`（用途）/ `tier`（系統内の段階）
  - 任意：`kana`（読み）/ `scope`（単体・グループ・全体・自分）/ `kind`（用途内の細分類。眠り・毒など）/ `series`（同じ作品・属性・用途に別系統があるときの識別子。DQのメラ系とギラ系など）/ `line`（`all`＝単体系統と並行する全体系統）/ `desc`（効果の要約）/ `note`（版による差など）/ `src`（出典 `{title,url}` の配列）
  - 系統＝ `game + el + fx + kind + series + line` が同じもの
- `games.json` — 作品。並び順が比較ページの表示順。`basis` にどの作品・版の表記を基準にしたかを書く
- `systems.json` — 作品ごとの魔法体系。`overview`（概要）/ `rules`（命名ルール）/ `growth`（強化・派生ルール）/ `categories`（作品内の分類）/ `elementNames`（作品内の属性名）/ `classes`（用途→作品内の分類名）/ `verdict`（魔法体系がほぼない作品の判断）/ `src`
- `elements.json` / `effects.json` — サイト共通の属性・用途の定義。細分類は `effects.json` の `kinds`
- `catalog.json` — 作品一覧ページのカテゴリ（データ未収録の作品も含む）

魔法を追加するときは `magics.json` に1行足すだけで、比較・詳細・体系ページすべてに反映されます。
`npm run validate`（`build` 時にも自動実行）で、重複ID・未定義の参照・段階の欠け・出典の形式をチェックします。

## 補足

- 検索はクライアント側（`src/scripts/site.ts`）。インデックスはビルド時に各ページへ埋め込み
- 「今日の魔法」はビルド日で決まるため、毎日1回の再ビルド（CIのスケジュール実行など）を想定
- 検索インデックスは `/search-index.json` として出力し、検索を使ったときだけ読み込む
- データは攻略資料などで照合して登録しているが、作品・版によって表記や仕様が異なる場合がある

## デプロイ（Cloudflare Pages）

GitHub 連携で `main` への push ごとに自動デプロイ。

| 設定 | 値 |
| --- | --- |
| Root directory | `astro` |
| Build command | `npm run build` |
| Build output | `dist` |

- Node のバージョンは `.node-version` で指定
- `build.format: 'file'` で出力（`/foo/index.html` だと Pages が `/foo/` にリダイレクトし、`trailingSlash: 'never'` と食い違うため）
- 毎日の再ビルドは `.github/workflows/daily-rebuild.yml`。Pages の Deploy Hook URL を GitHub の Secret `CLOUDFLARE_DEPLOY_HOOK_URL` に登録すると有効になる
