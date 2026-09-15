import styles from "./VisionSection.module.css";

export default function VisionSection() {
  return (
    <section id="who" className={styles.section} aria-labelledby="vision-title">
      <div className={styles.stack}>
        <p>このサービスを作った理由は一つだ。</p>
        <p>テクニックを教えるコンサルは山ほどある。</p>
        <h2 id="vision-title">俺が作りたかったのは、<strong>思考から変われる環境</strong>だった。</h2>
      </div>
      <span className={styles.line} aria-hidden="true" />
    </section>
  );
}
