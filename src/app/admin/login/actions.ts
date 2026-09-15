"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }
  if (!isAdminEmail(email)) {
    return { error: "ログイン情報を確認してください。" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "ログイン情報を確認してください。" };
  }

  redirect("/admin");
}
