import ReservationSection from "@/components/sections/ReservationSection";
import ContentSection from "@/components/sections/ContentSection";
import FirstView from "@/components/sections/FirstView";
import FaqSection from "@/components/sections/FaqSection";
import MiddleCtaSection from "@/components/sections/MiddleCtaSection";
import PointSection from "@/components/sections/PointSection";
import ProfileSection from "@/components/sections/ProfileSection";
import VisionSection from "@/components/sections/VisionSection";
import VoiceSection from "@/components/sections/VoiceSection";
import SiteHeader from "@/components/ui/SiteHeader";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main>
        <FirstView />
        <VoiceSection />
        <MiddleCtaSection />
        <PointSection />
        <ContentSection />
        <VisionSection />
        <ProfileSection />
        <FaqSection />
        <ReservationSection />
      </main>
    </div>
  );
}
