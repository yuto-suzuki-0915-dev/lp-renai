"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import styles from "../admin.module.css";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className={styles.loginForm}>
      <label>
        <span>メールアドレス</span>
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        <span>パスワード</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
