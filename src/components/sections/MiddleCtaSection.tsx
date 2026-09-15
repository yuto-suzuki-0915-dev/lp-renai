import Image from "next/image";
import CtaLink from "@/components/ui/CtaLink";
import EnvironmentIcon from "@/components/ui/EnvironmentIcon";
import { environmentItems } from "@/content/lpContent";
import styles from "./MiddleCtaSection.module.css";

export default function MiddleCtaSection() {
  return (
    <section className={styles.section} aria-labelledby="environment-title">
      <div className={styles.grid}>
        <div className={styles.bridge}>
          <p>全員が変わった理由は共通していた。</p>
          <span aria-hidden="true" />
          <h2 id="environment-title">それは <strong>環境の変化</strong> だ</h2>
        </div>
        <div className={styles.cluster}>
          <i className={styles.ring} aria-hidden="true" />
          <div className={styles.hub}><Image src="/images/lp/header-logo-img.png" width={80} height={75} alt="" /></div>
          {environmentItems.map((item, index) => (
            <article key={item.id} className={`${styles.envCard} ${styles[`card${index + 1}`]}`}>
              <b><EnvironmentIcon name={item.id} /></b><span>{item.text}</span>
            </article>
          ))}
        </div>
      </div>
      <div className={styles.action}>
        <p>だから人生を変えることができる。</p>
        <h2>あなたにも変えてほしい</h2>
        <CtaLink href="#contact">無料面談を申し込む</CtaLink>
      </div>
    </section>
  );
}
