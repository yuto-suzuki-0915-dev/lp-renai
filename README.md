# REN-AI LAB LP

Figmaからコピーされたレイヤー情報を基に制作している、恋愛サポートサービスの静的LPです。

## Development

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## Checks

```bash
npm run lint
npm run build
```

## Structure

- `src/app/`: ページ、Metadata、グローバルスタイル
- `src/components/sections/`: LP固有のSection
- `src/components/ui/`: 共通CTA、見出し、Carousel、Header
- `src/content/`: 仮コピーとカードデータ
- `public/images/`: 採用済みの本番画像
- `references/`: Figmaなどの参照情報
- `work/`: 比較案と試作
- `docs/`: 商品、構成、デザイン、参照方針
- `asset-notes/`: 本番画像の用途と制約
- `reference-notes/`: Sectionごとの参照意図

## Current limitations

- 掲載コピー、講師情報、実績はレイアウト確認用の仮内容です。
- 元画像が未提供のため、FV、Voice、ProfileはCSSの仮ビジュアルを表示しています。
- Contactフォームの送信機能は接続していません。
