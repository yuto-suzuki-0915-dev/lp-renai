import { faqItems } from "@/content/lpContent";
import styles from "./FaqSection.module.css";

export default function FaqSection() {
  return (
    <section id="qa" className={styles.section} aria-labelledby="faq-title">
      <div className={styles.divider} />
      <header className={styles.heading}><span>FAQ</span><h2 id="faq-title">よくある質問</h2></header>
      <div className={styles.list}>
        {faqItems.map((item, index) => (
          <details key={item.question} className={styles.item}>
            <summary><strong>Q{index + 1}.</strong><span>{item.question}</span><i aria-hidden="true" /></summary>
            <div className={styles.answer}><strong>A.</strong><div>{item.answer.map((line) => <p key={line}>{line}</p>)}</div></div>
          </details>
        ))}
      </div>
    </section>
  );
}
