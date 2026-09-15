"use client";

import { useActionState } from "react";
import { createSlotsAction, type SlotFormState } from "./actions";
import styles from "./admin.module.css";

const initialState: SlotFormState = {};

export default function SlotCreator() {
  const [state, action, pending] = useActionState(createSlotsAction, initialState);

  return (
    <form action={action} className={styles.slotCreator}>
      <label>
        <span>日付</span>
        <input name="date" type="date" required />
      </label>
      <label>
        <span>開始</span>
        <input name="startTime" type="time" step="3600" required />
      </label>
      <label>
        <span>終了</span>
        <input name="endTime" type="time" step="3600" required />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "作成中…" : "1時間枠を作成"}
      </button>
      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      {state.message && <p className={styles.success} role="status">{state.message}</p>}
    </form>
  );
}
