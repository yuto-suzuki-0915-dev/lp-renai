import Image from "next/image";
import { navItems } from "@/content/lpContent";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.notice}><span>無料面談の残り定員</span><strong><b>1</b>人</strong></div>
      <div className={styles.navWrap}>
        <div className={styles.navBar}>
          <a className={styles.logo} href="#top" aria-label="moteru トップへ"><Image src="/images/lp/header-logo-img.png" width={80} height={75} alt="moteru" /></a>
          <nav className={styles.nav} aria-label="ページ内メニュー">
            {navItems.map((item) => <a key={item.href} href={item.href}><span>{item.en}</span><small>{item.ja}</small></a>)}
          </nav>
          <a className={styles.join} href="/reserve">無料面談に参加</a>
        </div>
      </div>
    </header>
  );
}
