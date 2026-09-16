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

function getSlotParts(startsAt: string) {
  const key = getSlotKey(startsAt);
  return {
    dateKey: key.slice(0, 10),
    hour: Number(key.slice(11, 13)),
  };
}

function weeksBetween(startDateKey: string, endDateKey: string) {
  const start = new Date(`${startDateKey}T12:00:00Z`).getTime();
  const end = new Date(`${endDateKey}T12:00:00Z`).getTime();
  return Math.max(0, Math.floor((end - start) / (7 * 24 * 60 * 60 * 1000)));
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

  const { slotMap, visibleStartHour, visibleEndHour, lastWeekIndex } = useMemo(() => {
    const mapped = new Map<string, AdminCalendarSlot>();
    const hours: number[] = [];
    let latestDateKey = rangeStartDate;

    for (const slot of slots) {
      const { dateKey, hour } = getSlotParts(slot.startsAt);
      mapped.set(getSlotKey(slot.startsAt), slot);
      hours.push(hour);
      if (dateKey > latestDateKey) latestDateKey = dateKey;
    }

    return {
      slotMap: mapped,
      visibleStartHour: hours.length ? Math.min(startHour, ...hours) : startHour,
      visibleEndHour: hours.length ? Math.max(endHour, Math.max(...hours) + 1) : endHour,
      lastWeekIndex: Math.max(
        horizonWeeks - 1,
        weeksBetween(rangeStartDate, latestDateKey),
      ),
    };
  }, [endHour, horizonWeeks, rangeStartDate, slots, startHour]);
  const weekStart = addDaysToDateKey(rangeStartDate, weekIndex * 7);
  const dates = Array.from({ length: 7 }, (_, index) => addDaysToDateKey(weekStart, index));
  const hours = Array.from(
    { length: visibleEndHour - visibleStartHour },
    (_, index) => visibleStartHour + index,
  );

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
          disabled={weekIndex >= lastWeekIndex || pending}
          onClick={() => setWeekIndex((current) => Math.min(lastWeekIndex, current + 1))}
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
