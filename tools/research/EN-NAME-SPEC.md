# RPG魔法辞典：英語版の公式の魔法名の調査（調査担当のサブエージェント向け）

RPG魔法辞典（https://rpgspellbook.com）は、同じ役割の魔法がRPG作品ごとにどう呼ばれているかを比べる辞典です。英語版のページに「英語版ではこう呼ばれる」（例：ドラゴンクエストのヒャド → Crack）を出すため、**英語版のゲームで実際に使われた魔法名**を、出典付きで調べます。

- **入力**：`/Users/kobayashi/GitHub-personal/mahou-jiten/tools/research/out/en/in/<担当ファイル>.json`（読むだけ）
  - `games`：作品（id → 日本語名・英語名・基準にした版・group）
  - `magics`：魔法（id・作品・日本語名・ローマ字読み・用途・属性・説明の冒頭）
- **出力**：`/Users/kobayashi/GitHub-personal/mahou-jiten/tools/research/out/en/out/<同じファイル名>.json`
  - 作品を1つ調べ終えるたびに書き出す（止まっても結果が残るように）。
  - 書いたら `node -e "JSON.parse(require('fs').readFileSync(process.argv[1]))" <path>` で確かめる。

## 決まり（厳守）
- **記憶だけで書かない**。WebSearch と WebFetch で、日本語名と英語名の対応が分かる資料を見て確かめる。
  - よい資料：各シリーズの英語のファン Wiki（Dragon Quest Wiki、Final Fantasy Wiki、Megami Tensei Wiki、Bulbapedia、StrategyWiki など）の呪文一覧で、日本語名（またはローマ字）と英語名が並んでいるもの。GameFAQs の翻訳表、公式の英語サイト。
  - 2つ以上の資料で一致すれば理想。1つだけなら `note` に "1 source"。
  - 日本語名との対応が確かめられない魔法は**出力しない**（推測で埋めない）。
- **どの英語版の名前を採るか**：その作品の**いちばん新しい公式英語版**の名前。
  - シリーズ代表（例：`dq` は DQ シリーズ全体）の魔法は、その魔法が出てくる本編のうち、いちばん新しい公式英語版の名前（DQ なら DQ XI S など）。
  - 古い英語版で別の名前だった場合は `older` に入れる（例：ヒャド → Crack、older: [{ "en": "IceBolt", "release": "Dragon Warrior III (NES, 1992)" }]）。
  - 英語版で日本語版と同じ名前（Agi、Bufu など）なら、それをそのまま書く（同じでも書く）。
- 英語版が出ていない作品は `games.<id>.status` を "none" にして、魔法は出力しない。ファン翻訳は公式ではないので使わない。
- 出典の title は資料のページ名、url は実際に見たページ。文字化けするページは URL の前に `https://r.jina.ai/` を付けると読める（出典には元の URL を書く）。

## 出力形式
```jsonc
{
  "games": {
    "<game id>": { "status": "released" | "none", "release": "採った英語版（タイトル・機種・年）", "note": "（必要なときだけ）" }
  },
  "magics": {
    "<magic id>": {
      "en": "英語版の名前",
      "release": "その名前が使われた英語版（作品の release と同じなら省略可）",
      "older": [{ "en": "", "release": "" }],   // あれば
      "src": [{ "title": "", "url": "" }],
      "note": "（必要なときだけ。英語で）"
    }
  }
}
```

## 進め方のヒント
- 魔法を1件ずつ検索せず、作品ごとの呪文一覧（日英対照）を見つけて、まとめて対応付ける。
- 同じ作品で英語版が複数ある（リメイク・移植で名前が変わった）ときは、最新を `en`、それ以前を `older` に。
- 一覧に日本語名がなくローマ字だけのときは、入力の `ro`（ローマ字読み）と照合してよい。
