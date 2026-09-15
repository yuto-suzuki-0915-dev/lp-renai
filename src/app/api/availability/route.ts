import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "予約システムの接続設定が完了していません。" },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();
  const now = new Date();
  const until = new Date(now);
  until.setUTCDate(until.getUTCDate() + 60);

  const { data: slots, error: slotsError } = await supabase
    .from("availability_slots")
    .select("id, starts_at, ends_at")
    .eq("is_open", true)
    .gt("starts_at", now.toISOString())
    .lte("starts_at", until.toISOString())
    .order("starts_at", { ascending: true })
    .limit(200);

  if (slotsError) {
    console.error("Failed to load availability", slotsError.code);
    return Response.json(
      { error: "空き日時を取得できませんでした。時間を置いてお試しください。" },
      { status: 500 },
    );
  }

  if (!slots?.length) {
    return Response.json({ slots: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const slotIds = slots.map((slot) => slot.id);
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("slot_id")
    .eq("status", "confirmed")
    .in("slot_id", slotIds);

  if (bookingsError) {
    console.error("Failed to load confirmed bookings", bookingsError.code);
    return Response.json(
      { error: "空き日時を取得できませんでした。時間を置いてお試しください。" },
      { status: 500 },
    );
  }

  const reservedSlotIds = new Set((bookings ?? []).map((booking) => booking.slot_id));
  const availableSlots = slots
    .filter((slot) => !reservedSlotIds.has(slot.id))
    .map((slot) => ({
      id: slot.id,
      startsAt: slot.starts_at,
      endsAt: slot.ends_at,
    }));

  return Response.json(
    { slots: availableSlots },
    { headers: { "Cache-Control": "no-store" } },
  );
}
