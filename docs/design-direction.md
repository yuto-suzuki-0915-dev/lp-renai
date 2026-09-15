# Design Direction

## Visual system

- PCの再現基準は1280px、スマホの確認基準は375pxとする。
- ページ背景は濃い緑 `#0A1F0A` を中心にする。
- 強調色は `#1DB954`、CTAは `#2ECC71`、補助アクセントは `#00E5CC` とする。
- 本文はNoto Sans JP系、ナビはM PLUS 1p系、装飾はShippori Mincho系を使用する。現在は外部通信に依存しないシステムフォントスタックで表示し、正式なフォントファイル受領後に `next/font/local` へ移行する。
- CTAの影、緑の罫線、暗いカード面をFigmaの主要な視覚言語として扱う。

## Layout

- Figmaの固定高さ7362pxは完成条件にせず、Sectionを通常の縦方向フローで積み重ねる。
- `position: absolute`は背景、装飾、画像上のラベルに限定する。
- VoiceはPCで3枚、タブレットで2枚、スマホで1枚と次カードの一部を表示する。
- ContentはPCで2枚、スマホで1枚と次カードの一部を表示する。
- 正式画像7点は`public/images/lp/`に保存し、`next/image`で表示する。

## Responsive

- 画面幅に応じて余白と文字サイズを `clamp()` で調整する。
- PointはPC・スマホともに縦3段とする。
- Headerの中央ナビは880px以下で省略し、ロゴとCTAを優先する。
- Environmentの放射状図は1000px以下で縦積みに切り替える。
