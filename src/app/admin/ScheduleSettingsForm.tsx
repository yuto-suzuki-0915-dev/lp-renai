"use client";

import { useActionState } from "react";
import { saveScheduleAction, type ScheduleFormState } from "./actions";
import styles from "./admin.module.css";

type ScheduleSettings = {
  startHour: number;
  endHour: number;
  activeWeekdays: number[];
  horizonWeeks: number;
};

const weekdays = [
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" },
  { value: 0, label: "日" },
];

const initialState: ScheduleFormState = {};

export default function ScheduleSettingsForm({
  initialSettings,
}: {
  initialSettings: ScheduleSettings | null;
}) {
  const [state, action, pending] = useActionState(saveScheduleAction, initialState);
  const settings = initialSettings ?? {
    startHour: 10,
    endHour: 20,
    activeWeekdays: [1, 2, 3, 4, 5, 6],
    horizonWeeks: 8,
  };

  return (
    <form action={action} className={styles.scheduleSettings}>
      <fieldset>
        <legend>受付する曜日</legend>
        <div className={styles.weekdayChoices}>
          {weekdays.map((weekday) => (
            <label key={weekday.value}>
              <input
                type="checkbox"
                name="weekdays"
                value={weekday.value}
                defaultChecked={settings.activeWeekdays.includes(weekday.value)}
              />
              <span>{weekday.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label>
        <span>開始時刻</span>
        <select name="startHour" defaultValue={settings.startHour}>
          {Array.from({ length: 24 }, (_, hour) => (
            <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>
          ))}
        </select>
      </label>

      <label>
        <span>終了時刻</span>
        <select name="endHour" defaultValue={settings.endHour}>
          {Array.from({ length: 24 }, (_, index) => index + 1).map((hour) => (
            <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>
          ))}
        </select>
      </label>

      <label>
        <span>準備する期間</span>
        <select name="horizonWeeks" defaultValue={settings.horizonWeeks}>
          <option value={4}>4週間</option>
          <option value={8}>8週間</option>
        </select>
      </label>

      <button type="submit" disabled={pending}>
        {pending ? "準備中…" : initialSettings ? "設定を保存して枠を補充" : "標準枠を作成"}
      </button>

      <p className={styles.scheduleNote}>
        既存の予約と予約不可設定は保持されます。まだ存在しない未来の1時間枠だけを追加します。
      </p>
      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      {state.message && <p className={styles.success} role="status">{state.message}</p>}
    </form>
  );
}
