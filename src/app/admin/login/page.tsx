import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import LoginForm from "./LoginForm";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "運営者ログイン | moteru",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (isSupabaseConfigured()) {
    const user = await getAdminUser();
    if (user) redirect("/admin");
  }

  return (
    <main className={styles.shell}>
      <section className={styles.loginCard}>
        <p className={styles.eyebrow}>OPERATOR</p>
        <h1>運営者ログイン</h1>
        {!isSupabaseConfigured() ? (
          <p className={styles.error}>Supabaseの環境変数を設定してください。</p>
        ) : (
          <LoginForm />
        )}
        <Link className={styles.backLink} href="/">LPへ戻る</Link>
      </section>
    </main>
  );
}
