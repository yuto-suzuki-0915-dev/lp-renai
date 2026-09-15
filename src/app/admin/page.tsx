import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  cancelBookingAction,
  deleteSlotAction,
  logoutAction,
  setSlotOpenAction,
} from "./actions";
import SlotCreator from "./SlotCreator";
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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await requireAdmin();
  const { q = "" } = await searchParams;
  const normalizedQuery = q.trim().toLowerCase();
  const supabase = createAdminClient();
  const [{ data: slots, error: slotsError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      supabase
        .from("availability_slots")
        .select("id, starts_at, ends_at, is_open")
        .order("starts_at", { ascending: true })
        .limit(500),
      supabase
        .from("bookings")
        .select(
          "id, slot_id, confirmation_code, customer_name, customer_email, status, created_at, cancelled_at",
        )
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

  if (slotsError || bookingsError) {
    console.error("Failed to load admin dashboard", slotsError?.code, bookingsError?.code);
  }

  const bookingsBySlot = new Map<string, NonNullable<typeof bookings>>();
  for (const booking of bookings ?? []) {
    const current = bookingsBySlot.get(booking.slot_id) ?? [];
    current.push(booking);
    bookingsBySlot.set(booking.slot_id, current);
  }

  const visibleSlots = (slots ?? []).filter((slot) => {
    if (!normalizedQuery) return true;
    const searchableDate = `${dateFormatter.format(new Date(slot.starts_at))} ${timeFormatter.format(new Date(slot.starts_at))}`.toLowerCase();
    const slotBookings = bookingsBySlot.get(slot.id) ?? [];
    return (
      searchableDate.includes(normalizedQuery) ||
      slotBookings.some((booking) =>
        [booking.customer_name, booking.customer_email, booking.confirmation_code]
          .some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
    );
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
        <h2>予約枠を作成</h2>
        <p>指定した時間帯を1時間ごとの予約枠として作成します。時刻は日本時間です。</p>
        <SlotCreator />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <h2>予約枠・予約一覧</h2>
          <span>{visibleSlots.length}件</span>
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
        {(slotsError || bookingsError) && (
          <p className={styles.error}>一覧を取得できませんでした。</p>
        )}
        {!visibleSlots.length && !slotsError ? (
          <p className={styles.empty}>{normalizedQuery ? "一致する予約はありません。" : "予約枠はまだありません。"}</p>
        ) : (
          <div className={styles.slotList}>
            {visibleSlots.map((slot) => {
              const slotBookings = bookingsBySlot.get(slot.id) ?? [];
              const confirmedBooking = slotBookings.find((booking) => booking.status === "confirmed");
              return (
                <article className={styles.slotCard} key={slot.id}>
                  <div className={styles.slotDate}>
                    <strong>{dateFormatter.format(new Date(slot.starts_at))}</strong>
                    <span>
                      {timeFormatter.format(new Date(slot.starts_at))}〜
                      {timeFormatter.format(new Date(slot.ends_at))}
                    </span>
                  </div>
                  <div className={styles.slotStatus}>
                    {confirmedBooking ? (
                      <span className={styles.reserved}>予約済み</span>
                    ) : slot.is_open ? (
                      <span className={styles.open}>受付中</span>
                    ) : (
                      <span className={styles.closed}>停止中</span>
                    )}
                  </div>
                  {confirmedBooking && (
                    <div className={styles.bookingDetails}>
                      <strong>{confirmedBooking.customer_name}</strong>
                      <a href={`mailto:${confirmedBooking.customer_email}`}>
                        {confirmedBooking.customer_email}
                      </a>
                      <small>予約番号：{confirmedBooking.confirmation_code}</small>
                    </div>
                  )}
                  <div className={styles.actions}>
                    <form action={setSlotOpenAction}>
                      <input type="hidden" name="slotId" value={slot.id} />
                      <input type="hidden" name="isOpen" value={slot.is_open ? "false" : "true"} />
                      <button className={styles.secondaryButton} type="submit">
                        {slot.is_open ? "受付停止" : "受付再開"}
                      </button>
                    </form>
                    {confirmedBooking ? (
                      <form action={cancelBookingAction}>
                        <input type="hidden" name="bookingId" value={confirmedBooking.id} />
                        <button className={styles.dangerButton} type="submit">予約をキャンセル</button>
                      </form>
                    ) : slotBookings.length === 0 ? (
                      <form action={deleteSlotAction}>
                        <input type="hidden" name="slotId" value={slot.id} />
                        <button className={styles.dangerButton} type="submit">枠を削除</button>
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
