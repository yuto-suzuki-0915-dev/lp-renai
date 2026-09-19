import Image from "next/image";
import Carousel from "@/components/ui/Carousel";
import { voices } from "@/content/lpContent";
import styles from "./VoiceSection.module.css";

export default function VoiceSection() {
  return (
    <section id="voice" className={styles.voice} aria-labelledby="voice-title">
      <div className={styles.divider} />
      <div className={styles.inner}>
        <h2 id="voice-title" className={styles.title}><span>変わった人には、共通点がある。</span><strong>それを確かめてほしい</strong></h2>
        <Carousel label="受講者の声" autoPlay>
          {voices.map((voice) => (
            <article key={voice.id} className={styles.card} data-carousel-item>
              <div className={styles.visual}>
                <Image src={voice.image} alt={voice.imageAlt} width={511} height={309} sizes="(max-width: 640px) 86vw, (max-width: 1000px) 44vw, 300px" />
                <div className={styles.captions}><span>{voice.lead}</span><strong>{voice.tag}</strong></div>
                <span className={styles.play} aria-hidden="true">▶</span>
              </div>
              <p className={styles.footer}><strong>{voice.keyword}</strong><span>{voice.suffix}</span></p>
            </article>
          ))}
        </Carousel>
      </div>
      <div className={styles.divider} />
    </section>
  );
}
