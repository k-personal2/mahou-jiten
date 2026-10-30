# RPG魔法辞典：英訳の仕様（翻訳担当のサブエージェント向け）

RPG魔法辞典（https://rpgspellbook.com）は、同じ役割の魔法がRPG作品ごとにどう呼ばれているかを比べる辞典です。英語版（/en/ 以下）を作るため、日本語のデータを英語に訳します。

- **入力**：`/Users/kobayashi/GitHub-personal/mahou-jiten/tools/research/out/en/in/<ファイル名>.json`（読むだけ）
- **出力**：`/Users/kobayashi/GitHub-personal/mahou-jiten/tools/research/out/en/out/<同じファイル名>.json`
  - 1ファイル訳し終えるたびに書き出す。大きいファイルは途中でも書き出して上書きしてよい（止まっても結果が残るように）。
  - 書いたら `node -e "JSON.parse(require('fs').readFileSync(process.argv[1]))" <path>` で JSON として読めることを確かめる。
  - 入力にある id・キーは**1つも落とさない**。訳せない値も、原文に近い英語で必ず埋める。

## 読者と文体
- 読者は英語圏（主にアメリカ）の RPG ファン。英語版のゲームを遊んだ人が多い。
- 平易で簡潔な英語。アメリカ式の綴り。マークダウンや記号の装飾は使わない（プレーンテキスト）。
- **忠実に訳す**。事実を足さない・削らない。数値・MP・版の違い・「〜とされる」などの留保もそのまま残す。
  - 「1資料のみで確認」→ "Confirmed in only one source."
  - 「名前から分類」→ "Classified by its name."
  - 「資料によって〜」→ "Sources differ: ..."
- 日本語の文が長いときは、英語では2文に分けてよい。

## 固有名詞
- **魔法名**：入力の `glossary`（日本語名 → 読み）や `ro` にある読みをそのまま使う（例：ヒャド → Hyado、ファイア → Faia、PKファイアーα → PK Faiā α）。
  - 英語版で付いた名前（Crack、Fire など）を知っていても、**本文には使わない**。英語版の名前は別の担当が出典付きで調べている。
  - glossary にない魔法名は、同じ規則（ヘボン式、長音は ā ī ū ē ō、語ごとに頭を大文字）でローマ字にする。漢字の名前で読みに自信がなければ、日本語の表記のまま残す。
- **作品名**：入力の `gameEn`／`games.*.en` の英語名を使う。『III』『IX』のような略記は "DQ III" "FF IX" のように作品が分かる形にする。
- **属性**：Fire, Ice, Lightning, Wind, Water, Earth, Light, Darkness, Non-elemental（サイト共通の語。作品内の属性名を訳すときは、英語版の公式訳が確かならそれ、なければ直訳）。
- **用途**：Attack, Healing, Attack up, Defense up, Speed up, Attack down, Defense down, Speed down, Status ailments, Cure ailments, Instant death, Revival, Barriers, Field & travel, Other。
- **魔法の呼び方**：呪文 incantations／魔法 magic／術 arts／PSI psychic powers／策略 stratagems／スキル skills など。作品内の分類名（黒魔法・白魔法・時空魔法など）は、英語版の公式訳が確かならそれ（Black Magic, White Magic, Time Magic）、なければ直訳。同じ作品の中では訳をそろえる。
- **範囲**：単体 single target／グループ group／全体 all enemies（味方なら all allies）／自分 self。
- **キャラクター名・職業名**（users.json）：英語版の公式名が確かなら使う（ゼシカ → Jessica、魔法使い（DQ）→ Mage）。確かでなければヘボン式ローマ字。括弧の作品番号は "(III)" のように残す。
- **消費**（costs.json）："MP 3（DQIII）" → "3 MP (DQ III)"。単位や条件（「HP」「お金」「1ターン」など）も訳す。

## ファイルごとの出力形式
- `magics-XX.json` → `{ "<id>": { "desc": "...", "note": "..." } }`（入力にあるフィールドだけ）
- `users.json` → `{ "<日本語>": "<英語>" }`
- `costs.json` → `{ "<日本語>": "<英語>" }`
- `systems-XX.json` → `{ "<game id>": { "overview": "", "rules": [], "growth": [], "verdict": "", "categories": [{ "name": "", "desc": "" }], "classes": { "<key>": "" }, "elementNames": { "<key>": "" } } }`（入力にあるキーだけ。`gameEn`・`sys`・`glossary` は出力しない。classes・elementNames のキーはそのまま）
- `stages-XX.json` → `{ "<game id>": { "desc": "", "diff": "", "insight": "", "scopeDesc": "" } }`（入力にあるキーだけ）
- `misc.json` → 入力と同じ構造。
  - `stageDoc`：types／scopeTypes／notes／questions の文章を訳す。`id`・`sample`・`game`・`names`（魔法名の配列）はそのまま。
  - `terms`：キー（日本語の呼び方）はそのまま、値（説明）を訳す。
  - `catalog`：カテゴリ名 `name` を訳し、各 item の `name` は英語版の公式タイトル（`gameEn` があればそれ）、英語版がなければローマ字。`sys` は上の「魔法の呼び方」の訳。
  - `kinds`：値を訳す。`basis`：basis と releaseNote を訳す。`shopLabels`：値を英語の商品名（公式タイトル。なければローマ字）にする。
