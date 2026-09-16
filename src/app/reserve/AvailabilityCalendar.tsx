"use client";

import { useMemo, useState } from "react";
import {
  addDaysToDateKey,
  getJstDateKey,
  getMondayDateKey,
} from "@/lib/booking/calendar";
import type { AvailabilitySchedule, AvailabilitySlot } from "@/lib/booking/types";
import styles from "./reserve.module.css";

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

function getSlotParts(startsAt: string) {
  const parts = slotPartsFormatter.formatToParts(new Date(startsAt));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const dateKey = `${value("year")}-${value("month")}-${value("day")}`;
  return { dateKey, hour: Number(value("hour")) };
}

function formatDateKey(dateKey: string) {
  return dateLabelFormatter.format(new Date(`${dateKey}T12:00:00+09:00`));
}

function weeksBetween(startDateKey: string, endDateKey: string) {
  const start = new Date(`${startDateKey}T12:00:00Z`).getTime();
  const end = new Date(`${endDateKey}T12:00:00Z`).getTime();
  return Math.max(0, Math.floor((end - start) / (7 * 24 * 60 * 60 * 1000)));
}

export default function AvailabilityCalendar({
  slots,
  schedule,
  onSelect,
}: {
  slots: AvailabilitySlot[];
  schedule: AvailabilitySchedule | null;
  onSelect: (slot: AvailabilitySlot) => void;
}) {
  const currentWeekStart = getMondayDateKey(getJstDateKey());
  const [weekIndex, setWeekIndex] = useState(0);

  const { slotMap, startHour, endHour, lastWeekIndex } = useMemo(() => {
    const mapped = new Map<string, AvailabilitySlot>();
    const hours: number[] = [];
    let latestDateKey = currentWeekStart;

    for (const slot of slots) {
      const { dateKey, hour } = getSlotParts(slot.startsAt);
      mapped.set(`${dateKey}-${String(hour).padStart(2, "0")}`, slot);
      hours.push(hour);
      if (dateKey > latestDateKey) latestDateKey = dateKey;
    }

    return {
      slotMap: mapped,
      startHour: schedule?.startHour ?? (hours.length ? Math.min(...hours) : 10),
      endHour: schedule?.endHour ?? (hours.length ? Math.max(...hours) + 1 : 20),
      lastWeekIndex: schedule
        ? Math.max(0, schedule.horizonWeeks - 1)
        : weeksBetween(currentWeekStart, getMondayDateKey(latestDateKey)),
    };
  }, [currentWeekStart, schedule, slots]);

  const safeWeekIndex = Math.min(weekIndex, lastWeekIndex);
  const weekStart = addDaysToDateKey(currentWeekStart, safeWeekIndex * 7);
  const dates = Array.from({ length: 7 }, (_, index) => addDaysToDateKey(weekStart, index));
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);

  return (
    <div className={styles.publicCalendar}>
      <div className={styles.calendarToolbar}>
        <button
          type="button"
          disabled={safeWeekIndex === 0}
          onClick={() => setWeekIndex((current) => Math.max(0, current - 1))}
        >
          前の週
        </button>
        <strong>{formatDateKey(weekStart)}からの1週間</strong>
        <button
          type="button"
          disabled={safeWeekIndex >= lastWeekIndex}
          onClick={() => setWeekIndex((current) => Math.min(lastWeekIndex, current + 1))}
        >
          次の週
        </button>
      </div>

      <div className={styles.calendarLegend} aria-label="予約枠の状態">
        <span><i className={styles.legendAvailable} />予約可能</span>
        <span><i className={styles.legendUnavailable} />予約不可</span>
      </div>

      <div className={styles.publicCalendarScroller}>
        <div className={styles.publicCalendarGrid}>
          <div className={styles.calendarCorner}>時間</div>
          {dates.map((date) => (
            <div className={styles.calendarDate} key={date}>{formatDateKey(date)}</div>
          ))}

          {hours.flatMap((hour) => [
            <div className={styles.calendarHour} key={`${hour}-label`}>
              {String(hour).padStart(2, "0")}:00
            </div>,
            ...dates.map((date) => {
              const slot = slotMap.get(`${date}-${String(hour).padStart(2, "0")}`);
              if (!slot) {
                return <div className={styles.calendarUnavailable} key={`${date}-${hour}`}>予約不可</div>;
              }
              return (
                <button
                  type="button"
                  className={styles.calendarAvailable}
                  key={slot.id}
                  onClick={() => onSelect(slot)}
                  aria-label={`${formatDateKey(date)} ${String(hour).padStart(2, "0")}:00を予約する`}
                >
                  予約可能
                </button>
              );
            }),
          ])}
        </div>
      </div>
    </div>
  );
}
