import type { Metadata } from "next";
import Link from "next/link";
import ReservationFlow from "./ReservationFlow";
import styles from "./reserve.module.css";

export const metadata: Metadata = {
  title: "無料面談の予約 | moteru",
  description: "無料面談の空き日時を確認し、1時間の面談を予約できます。",
  robots: { index: false, follow: false },
};

export default function ReservePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>moteru</Link>
        <Link href="/" className={styles.backLink}>LPへ戻る</Link>
      </header>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>FREE SESSION</p>
        <h1>無料面談の予約</h1>
        <p>空き日時の確認だけなら、個人情報の入力は必要ありません。</p>
      </section>
      <ReservationFlow />
    </main>
  );
}
