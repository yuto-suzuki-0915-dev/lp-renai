import type { ReactNode } from "react";
import styles from "./CtaLink.module.css";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
  compact?: boolean;
};

export default function CtaLink({ href, children, compact = false }: CtaLinkProps) {
  return (
    <a className={`${styles.cta} ${compact ? styles.compact : ""}`} href={href}>
      <span>{children}</span>
      <span className={styles.arrow} aria-hidden="true">→</span>
    </a>
  );
}
