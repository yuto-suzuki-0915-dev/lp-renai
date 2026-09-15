import { points } from "@/content/lpContent";
import styles from "./PointSection.module.css";

export default function PointSection() {
  return (
    <section id="support" className={styles.section} aria-labelledby="point-title">
      <header className={styles.heading}><p>成果率88%の理由がここにある</p><h2 id="point-title">これが、フィードバックのある<br />環境の形だ。</h2><span aria-hidden="true" /></header>
      <div className={styles.list}>
        {points.map((point) => (
          <article key={point.number} className={styles.card}>
            <span className={styles.tag}>Point {point.number}</span>
            <h3>{point.title.map((part, index) => part.highlight ? <strong key={`${part.text}-${index}`}>{part.text}</strong> : part.text)}</h3>
            <div className={styles.description}>{point.description.map((line) => <p key={line}>{line}</p>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
