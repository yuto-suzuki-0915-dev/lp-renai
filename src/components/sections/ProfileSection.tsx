import Image from "next/image";
import styles from "./ProfileSection.module.css";

export default function ProfileSection() {
  return (
    <section id="profile" className={styles.section} aria-labelledby="profile-name">
      <div className={styles.profile}>
        <span className={styles.deco} aria-hidden="true" />
        <div className={styles.portrait}><Image src="/images/lp/profile-img.png" width={180} height={180} alt="ミナト" /></div>
        <h2 id="profile-name">ミナト</h2>
        <p className={styles.role}>moteru会社 代表</p>
        <div className={styles.bio}>
          <strong>非モテ出身の30代。</strong>
          <p>営業での成功を機に「価値を提供できる男こそモテル」と確信。</p>
          <p>超奥手な状態から、2年間恋愛に向き合い経験を積む。</p>
          <p>知人の指導で成果を出し、マッチングアプリ攻略を発信。</p>
          <p>成果率88%、累計100名超が受講するサポートを運営。</p>
        </div>
      </div>
    </section>
  );
}
