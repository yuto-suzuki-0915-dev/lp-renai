"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { addDaysToDateKey } from "@/lib/booking/calendar";
import { setSlotAvailabilityAction } from "./actions";
import styles from "./admin.module.css";

export type AdminCalendarSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  isOpen: boolean;
  booking: {
    id: string;
    customerName: string;
  } | null;
};

const dateLabelFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

const slotPartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  hourCycle: "h23",
});

function getSlotKey(startsAt: string) {
  const parts = slotPartsFormatter.formatToParts(new Date(startsAt));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}-${value("hour")}`;
}

function formatDateKey(dateKey: string) {
  return dateLabelFormatter.format(new Date(`${dateKey}T12:00:00+09:00`));
}

export default function ScheduleCalendar({
  initialSlots,
  rangeStartDate,
  startHour,
  endHour,
  horizonWeeks,
}: {
  initialSlots: AdminCalendarSlot[];
  rangeStartDate: string;
  startHour: number;
  endHour: number;
  horizonWeeks: number;
}) {
  const [weekIndex, setWeekIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [slots, updateOptimisticSlot] = useOptimistic(
    initialSlots,
    (current, update: { id: string; isOpen: boolean }) =>
      current.map((item) => item.id === update.id ? { ...item, isOpen: update.isOpen } : item),
  );

  const slotMap = useMemo(
    () => new Map(slots.map((slot) => [getSlotKey(slot.startsAt), slot])),
    [slots],
  );
  const weekStart = addDaysToDateKey(rangeStartDate, weekIndex * 7);
  const dates = Array.from({ length: 7 }, (_, index) => addDaysToDateKey(weekStart, index));
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);

  function toggleSlot(slot: AdminCalendarSlot) {
    if (slot.booking || new Date(slot.startsAt) <= new Date() || pending) return;
    const nextIsOpen = !slot.isOpen;
    setMessage("");

    startTransition(async () => {
      updateOptimisticSlot({ id: slot.id, isOpen: nextIsOpen });
      const result = await setSlotAvailabilityAction(slot.id, nextIsOpen);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(nextIsOpen ? "受付を再開しました。" : "予約不可にしました。");
    });
  }

  return (
    <div className={styles.calendarArea}>
      <div className={styles.calendarToolbar}>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={weekIndex === 0 || pending}
          onClick={() => setWeekIndex((current) => Math.max(0, current - 1))}
        >
          前の週
        </button>
        <strong>{formatDateKey(weekStart)}からの1週間</strong>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={weekIndex >= horizonWeeks - 1 || pending}
          onClick={() => setWeekIndex((current) => Math.min(horizonWeeks - 1, current + 1))}
        >
          次の週
        </button>
      </div>

      <div className={styles.legend} aria-label="予約枠の状態">
        <span><i className={styles.legendOpen} />受付中</span>
        <span><i className={styles.legendClosed} />予約不可</span>
        <span><i className={styles.legendReserved} />予約済み</span>
      </div>

      <div className={styles.calendarScroller}>
        <div className={styles.calendarGrid}>
          <div className={styles.cornerCell}>時間</div>
          {dates.map((date) => <div className={styles.dateHeader} key={date}>{formatDateKey(date)}</div>)}

          {hours.flatMap((hour) => [
            <div className={styles.hourCell} key={`${hour}-label`}>
              {String(hour).padStart(2, "0")}:00
            </div>,
            ...dates.map((date) => {
              const slot = slotMap.get(`${date}-${String(hour).padStart(2, "0")}`);
              if (!slot) return <div className={styles.unavailableCell} key={`${date}-${hour}`}>—</div>;
              const isPast = new Date(slot.startsAt) <= new Date();
              const className = slot.booking
                ? styles.reservedCell
                : slot.isOpen
                  ? styles.openCell
                  : styles.closedCell;
              const label = slot.booking
                ? `予約済み ${slot.booking.customerName}`
                : slot.isOpen
                  ? "受付中。押すと予約不可になります"
                  : "予約不可。押すと受付を再開します";

              return (
                <button
                  type="button"
                  key={slot.id}
                  className={className}
                  disabled={Boolean(slot.booking) || isPast || pending}
                  aria-label={`${formatDateKey(date)} ${String(hour).padStart(2, "0")}:00 ${label}`}
                  aria-pressed={!slot.isOpen}
                  onClick={() => toggleSlot(slot)}
                >
                  {slot.booking ? "予約済み" : slot.isOpen ? "受付中" : "予約不可"}
                  {slot.booking && <small>{slot.booking.customerName}</small>}
                </button>
              );
            }),
          ])}
        </div>
      </div>

      <p className={message.includes("できません") ? styles.error : styles.calendarMessage} aria-live="polite">
        {pending ? "更新中…" : message}
      </p>
    </div>
  );
}
