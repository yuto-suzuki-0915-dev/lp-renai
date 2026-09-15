"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./ContactSection.module.css";

export default function ContactSection() {
  const [validated, setValidated] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (validated) statusRef.current?.focus();
  }, [validated]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget.checkValidity()) setValidated(true);
    else event.currentTarget.reportValidity();
  };

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.divider} />
      <header className={styles.heading}><h2 id="contact-title">まだ一人で考えているなら、話してみてほしい。</h2></header>
      <div className={styles.lead}><p>1時間の無料面談で、あなたの未来を覗いてみてほしい。</p><p>申し込むかどうかは、それから決めてください。</p></div>
      <form className={styles.form} onSubmit={submit}>
        <p>名前とメールアドレスだけで申し込めます。面談は無料。<br />勧誘はありません。ただ、話してみてください。</p>
        <label><span>お名前</span><input type="text" name="name" placeholder="例）田中 太郎" autoComplete="name" required /></label>
        <label><span>メールアドレス</span><input type="email" name="email" placeholder="例）taro@example.com" autoComplete="email" required /></label>
        <small>── 所要1分。名前とメールアドレスのみ ──</small>
        <p id="contact-demo-note" className={styles.demoNote}>デモ画面のため、このフォームから情報は送信されません。</p>
        <button type="submit" aria-describedby="contact-demo-note">無料面談を申し込む <span aria-hidden="true">›</span></button>
        {validated && <p ref={statusRef} className={styles.status} role="status" tabIndex={-1}>入力内容を確認しました。現在はデモ画面のため、まだ送信されていません。</p>}
        <div className={styles.caution}><p>強引な勧誘は一切行いません。</p><p>実際の送信機能は今後の工程で接続します。</p></div>
      </form>
      <footer className={styles.footer}>© moteru. All rights reserved.</footer>
    </section>
  );
}
