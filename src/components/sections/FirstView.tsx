import Image from "next/image";
import CtaLink from "@/components/ui/CtaLink";
import styles from "./FirstView.module.css";

export default function FirstView() {
  return (
    <section id="top" className={styles.fv} aria-labelledby="fv-title">
      <Image className={styles.image} src="/images/lp/fv-bg-img.png" alt="" fill priority sizes="100vw" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.container}>
        <h1 id="fv-title" className={styles.title}>
          <span>「今日、会えないかな？」</span>
          <span>2ヶ月で3マッチだった俺に、届いた。</span>
        </h1>
        <div className={styles.subArea}>
          <div className={styles.subCopy}><i aria-hidden="true" /><p>今日も誰かが、あなたが諦めた女性とデートしている。<br />次はあなたの番かもしれない。</p></div>
          <span className={styles.badge}>講師提供</span>
        </div>
        <div className={styles.ctaArea}>
          <span>登録・料金は一切不要です</span>
          <CtaLink href="/reserve">可能性を確かめる</CtaLink>
        </div>
      </div>
    </section>
  );
}
