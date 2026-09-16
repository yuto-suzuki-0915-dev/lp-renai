import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addDaysToDateKey,
  dateKeyToJstIso,
  getJstDateKey,
  getMondayDateKey,
} from "@/lib/booking/calendar";
import { cancelBookingAction, logoutAction } from "./actions";
import ScheduleCalendar, { type AdminCalendarSlot } from "./ScheduleCalendar";
import ScheduleSettingsForm from "./ScheduleSettingsForm";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "予約管理 | moteru",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

type AdminPageProps = {
  searchParams: Promise<{ q?: string }>;
};

type BookingRow = {
  id: string;
  slot_id: string;
  confirmation_code: string;
  customer_name: string;
  customer_email: string;
  status: string;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await requireAdmin();
  const { q = "" } = await searchParams;
  const normalizedQuery = q.trim().toLowerCase();
  const supabase = createAdminClient();

  const { data: settings, error: settingsError } = await supabase
    .from("booking_schedule_settings")
    .select("start_hour, end_hour, active_weekdays, horizon_weeks")
    .eq("id", 1)
    .maybeSingle();

  const effectiveSettings = {
    startHour: settings?.start_hour ?? 10,
    endHour: settings?.end_hour ?? 20,
    activeWeekdays: settings?.active_weekdays ?? [1, 2, 3, 4, 5, 6],
    horizonWeeks: settings?.horizon_weeks ?? 8,
  };
  const weekStart = getMondayDateKey(getJstDateKey());
  const rangeEnd = addDaysToDateKey(weekStart, effectiveSettings.horizonWeeks * 7);

  const [{ data: slots, error: slotsError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      supabase
        .from("availability_slots")
        .select("id, starts_at, ends_at, is_open")
        .gte("starts_at", dateKeyToJstIso(weekStart))
        .lt("starts_at", dateKeyToJstIso(rangeEnd))
        .order("starts_at", { ascending: true }),
      supabase
        .from("bookings")
        .select("id, slot_id, confirmation_code, customer_name, customer_email, status")
        .eq("status", "confirmed")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

  if (settingsError || slotsError || bookingsError) {
    console.error(
      "Failed to load admin dashboard",
      settingsError?.code,
      slotsError?.code,
      bookingsError?.code,
    );
  }

  const bookingRows = (bookings ?? []) as BookingRow[];
  const bookingBySlot = new Map(bookingRows.map((booking) => [booking.slot_id, booking]));
  const calendarSlots: AdminCalendarSlot[] = (slots ?? []).map((slot) => {
    const booking = bookingBySlot.get(slot.id);
    return {
      id: slot.id,
      startsAt: slot.starts_at,
      endsAt: slot.ends_at,
      isOpen: slot.is_open,
      booking: booking
        ? { id: booking.id, customerName: booking.customer_name }
        : null,
    };
  });
  const slotById = new Map((slots ?? []).map((slot) => [slot.id, slot]));
  const visibleBookings = bookingRows.filter((booking) => {
    const slot = slotById.get(booking.slot_id);
    if (!slot) return false;
    if (!normalizedQuery) return true;
    const searchable = [
      booking.customer_name,
      booking.customer_email,
      booking.confirmation_code,
      dateFormatter.format(new Date(slot.starts_at)),
      timeFormatter.format(new Date(slot.starts_at)),
    ].join(" ").toLowerCase();
    return searchable.includes(normalizedQuery);
  });

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>OPERATOR</p>
          <h1>予約管理</h1>
          <p>{user.email}</p>
        </div>
        <form action={logoutAction}><button className={styles.secondaryButton}>ログアウト</button></form>
      </header>

      <section className={styles.panel}>
        <h2>標準スケジュール</h2>
        <p>受付する曜日と時間帯を設定すると、1時間枠をまとめて準備します。時刻は日本時間です。</p>
        <ScheduleSettingsForm initialSettings={settings ? effectiveSettings : null} />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>受付カレンダー</h2>
            <p>受付中の枠を押すと予約不可になり、もう一度押すと再開します。</p>
          </div>
          <span>{calendarSlots.length}枠</span>
        </div>
        {(settingsError || slotsError || bookingsError) && (
          <p className={styles.error}>カレンダーを取得できませんでした。</p>
        )}
        {!settings ? (
          <p className={styles.empty}>先に標準スケジュールを保存してください。</p>
        ) : (
          <ScheduleCalendar
            initialSlots={calendarSlots}
            rangeStartDate={weekStart}
            startHour={effectiveSettings.startHour}
            endHour={effectiveSettings.endHour}
            horizonWeeks={effectiveSettings.horizonWeeks}
          />
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <h2>確定予約</h2>
          <span>{visibleBookings.length}件</span>
        </div>
        <form className={styles.searchForm} method="get">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="名前・メール・予約番号・日時で検索"
            aria-label="予約を検索"
          />
          <button className={styles.secondaryButton} type="submit">検索</button>
          {normalizedQuery && <Link href="/admin">クリア</Link>}
        </form>

        {!visibleBookings.length ? (
          <p className={styles.empty}>{normalizedQuery ? "一致する予約はありません。" : "確定予約はありません。"}</p>
        ) : (
          <div className={styles.bookingList}>
            {visibleBookings.map((booking) => {
              const slot = slotById.get(booking.slot_id)!;
              return (
                <article className={styles.bookingCard} key={booking.id}>
                  <div className={styles.slotDate}>
                    <strong>{dateFormatter.format(new Date(slot.starts_at))}</strong>
                    <span>{timeFormatter.format(new Date(slot.starts_at))}〜{timeFormatter.format(new Date(slot.ends_at))}</span>
                  </div>
                  <div className={styles.bookingDetails}>
                    <strong>{booking.customer_name}</strong>
                    <a href={`mailto:${booking.customer_email}`}>{booking.customer_email}</a>
                    <small>予約番号：{booking.confirmation_code}</small>
                  </div>
                  <form action={cancelBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button className={styles.dangerButton} type="submit">予約をキャンセル</button>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
