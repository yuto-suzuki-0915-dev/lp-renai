import Carousel from "@/components/ui/Carousel";
import { programItems } from "@/content/lpContent";
import styles from "./ContentSection.module.css";

export default function ContentSection() {
  return (
    <section id="content" className={styles.section} aria-labelledby="content-title">
      <div className={styles.inner}>
        <header className={styles.heading}><p>環境だけでは、変われない。</p><h2 id="content-title">だからコンテンツにも、<br />妥協しなかった。</h2><span aria-hidden="true" /></header>
        <Carousel label="プログラム内容">
          {programItems.map((item) => (
            <article key={item.tag} className={styles.card} data-carousel-item>
              <span className={styles.tag}>{item.tag}</span>
              <h3>{item.title}</h3>
              <div>{item.description.map((line) => <p key={line}>{line}</p>)}</div>
            </article>
          ))}
        </Carousel>
        <p className={styles.footer}>この <strong>コンテンツが全部、無料</strong> で始められる。</p>
      </div>
    </section>
  );
}
