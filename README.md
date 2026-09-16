# REN-AI LAB LP

Figmaからコピーされたレイヤー情報を基に制作している、恋愛サポートサービスの静的LPです。

## Development

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## Supabase booking setup

予約機能はSupabase PostgreSQLとSupabase Authを使用します。

1. `.env.example`を参考に`.env.local`を作成します。
2. `ADMIN_EMAILS`に管理者として許可するメールアドレスをカンマ区切りで設定します。
3. Supabase DashboardのAuthenticationから同じメールアドレスのユーザーを作成します。
4. 本番環境では一般ユーザーのSign Upを無効にします。
5. マイグレーションを反映します。

```bash
npx supabase db push --linked
```

ローカルのSupabaseを使用する場合は、`supabase/seed.sql`によって翌日のテスト枠が3件作成されます。

```bash
npx supabase start
npx supabase db reset
```

管理画面は `http://localhost:3000/admin`、利用者向け予約画面は
`http://localhost:3000/reserve` です。

管理画面では、標準の曜日・営業時間・公開期間を保存すると1時間枠が生成されます。
週カレンダー上で各枠を押すと「受付中」と「予約不可」を切り替えられます。
既存枠や予約済み枠は標準設定の保存時に削除されません。

利用者は最初に週カレンダーで空き日時を確認します。この段階では個人情報を入力・保存しません。
日時を選んだ後に名前とメールアドレスを入力し、確認画面で確定したときだけ予約情報が保存されます。

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
- 予約完了メールと利用者自身によるキャンセル機能は未実装です。
