import CtaLink from "@/components/ui/CtaLink";
import styles from "./ReservationSection.module.css";

export default function ReservationSection() {
  return (
    <section id="reservation" className={styles.section} aria-labelledby="reservation-title">
      <div className={styles.divider} />
      <header className={styles.heading}>
        <h2 id="reservation-title">まだ一人で考えているなら、話してみてほしい。</h2>
      </header>
      <div className={styles.lead}>
        <p>1時間の無料面談で、あなたの未来を覗いてみてほしい。</p>
        <p>空き日時の確認だけなら、名前やメールアドレスの入力は必要ありません。</p>
      </div>
      <div className={styles.card}>
        <p>予約できる日時を確認し、希望の時間を選んでから予約者情報を入力します。</p>
        <CtaLink href="/reserve">空き日時を確認する</CtaLink>
        <small>面談は1時間・無料です。強引な勧誘は行いません。</small>
      </div>
      <footer className={styles.footer}>© moteru. All rights reserved.</footer>
    </section>
  );
}
