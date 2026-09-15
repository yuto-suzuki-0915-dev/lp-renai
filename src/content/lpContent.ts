export const navItems = [
  { en: "VOICE", ja: "体験談", href: "#voice" },
  { en: "SUPPORT", ja: "サポート", href: "#support" },
  { en: "Who", ja: "自己紹介", href: "#who" },
  { en: "Q&A", ja: "よくある質問", href: "#qa" },
] as const;

export type VoiceItem = {
  id: string;
  image: string;
  imageAlt: string;
  lead: string;
  tag: string;
  keyword: string;
  suffix: string;
};

export const voices: VoiceItem[] = [
  { id: "twomatch", image: "/images/lp/voice-card-twomatch-img.png", imageAlt: "受講者のインタビュー写真", lead: "2ヶ月で3マッチだった僕に", tag: "30日で彼女ができた", keyword: "今の状態", suffix: "は関係ない" },
  { id: "beginner", image: "/images/lp/voice-card-beginner-img.png", imageAlt: "恋愛経験が少ない状態から受講した男性", lead: "恋愛経験ほぼゼロだった僕に", tag: "1ヶ月で彼女ができた", keyword: "恋愛経験がなくても", suffix: "関係ない" },
  { id: "oneayear", image: "/images/lp/voice-card-oneayear-img.png", imageAlt: "出会いの行動量が変化した受講者", lead: "年に1人ペースだったのに、", tag: "3ヶ月で20人とデートするように", keyword: "毎週デート", suffix: "は当たり前" },
  { id: "age", image: "/images/lp/voice-card-age-img.png", imageAlt: "年齢への不安を乗り越えた受講者", lead: "47歳、年齢への不安を抱えていた。", tag: "でも月に17人とデートできた", keyword: "年齢", suffix: "は理由にならない" },
];

export const environmentItems = [
  { id: "meeting", text: "1対1のZOOM面談で自分の課題を毎回把握" },
  { id: "community", text: "一緒に頑張っている人が見えるコミュニティ" },
  { id: "review", text: "すべてのメッセージの添削対応" },
  { id: "video", text: "外見・アプリ運用のすべてを動画で学べる" },
] as const;

export type PointItem = { number: string; title: { text: string; highlight?: boolean }[]; description: string[] };
export const points: PointItem[] = [
  { number: "01", title: [{ text: "講師と" }, { text: "直接", highlight: true }, { text: "、" }, { text: "1対1のサポート", highlight: true }, { text: "。" }], description: ["他のサービスは、コンテンツを渡して終わる。ここは違う。", "あなたの状況を知っている人間が、あなただけに向き合う。"] },
  { number: "02", title: [{ text: "行動したその" }, { text: "瞬間", highlight: true }, { text: "に、" }, { text: "質問できる", highlight: true }, { text: "。" }], description: ["送ったメッセージへの返信、気になったその瞬間に聞ける。", "タイミングを逃さないから、同じミスを繰り返すことがなくなる。"] },
  { number: "03", title: [{ text: "聞いたら、" }, { text: "すぐに答えが来る", highlight: true }, { text: "。" }], description: ["なぜダメだったか、何が良かったか。その場ですぐに分かる。", "考え方が変わるから、次の行動が変わる。"] },
];

export type ProgramItem = { tag: string; title: string; description: string[] };
export const programItems: ProgramItem[] = [
  { tag: "CONTENTS 01", title: "すべてを学べる動画教材", description: ["外見・写真・メッセージ・デートまで。", "結果を出すために必要な知識が揃っている。"] },
  { tag: "CONTENTS 02", title: "添削・電話・MTGの実録動画", description: ["外見・写真・実際のやりとりをそのまま見られる。", "「こう動けばいい」が目で見てわかる。"] },
  { tag: "CONTENTS 03", title: "メッセージ・言動の個別添削", description: ["送る前でも送った後でも確認できる。", "一人で正解を探す必要がない。"] },
  { tag: "CONTENTS 04", title: "無料の個別相談", description: ["詰まったらすぐ聞ける。", "悩む時間を行動する時間に変えられる。"] },
  { tag: "CONTENTS 05", title: "クローズドなコミュニティ", description: ["同じ目標を持つ仲間がいる。", "仲間の添削を見て学ぶこともできる。"] },
  { tag: "CONTENTS 06", title: "みなとラジオ", description: ["毎日のインプットで思考がアップデートされる。", "行動の質は、思考の質で決まる。"] },
];

export type FaqItem = { question: string; answer: string[] };
export const faqItems: FaqItem[] = [
  { question: "恋愛経験がゼロでも大丈夫ですか？", answer: ["問題ありません。受講者の多くが、経験ゼロからスタートしています。", "間違った習慣がない分、変わる速度が速いケースもあります。"] },
  { question: "遠方でも受講できますか？", answer: ["全国どこからでも受講できます。", "サポートはオンラインで完結するため、場所を問わずフィードバックを受けられます。"] },
  { question: "どれくらいで結果が出ますか？", answer: ["個人差はありますが、早い方は1ヶ月以内に変化を実感しています。", "行動した分だけフィードバックを受けられる環境です。"] },
  { question: "年齢が高くても効果はありますか？", answer: ["年齢だけで結果が決まるわけではありません。", "現在地に合わせて、行動と見せ方を一緒に整理します。"] },
  { question: "忙しくても続けられますか？", answer: ["自分のペースで質問・添削を受けられます。", "スキマ時間を使いながら、無理のない進め方を相談できます。"] },
];
