"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  addDaysToDateKey,
  dateKeyToJstIso,
  getJstDateKey,
  getMondayDateKey,
  getWeekdayFromDateKey,
} from "@/lib/booking/calendar";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type ScheduleFormState = {
  message?: string;
  error?: string;
};

async function requireAdminForAction() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function saveScheduleAction(
  _previousState: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const user = await requireAdminForAction();
  const startHour = Number(formData.get("startHour"));
  const endHour = Number(formData.get("endHour"));
  const horizonWeeks = Number(formData.get("horizonWeeks"));
  const weekdays = formData
    .getAll("weekdays")
    .map(Number)
    .filter((value, index, values) => Number.isInteger(value) && values.indexOf(value) === index)
    .sort((a, b) => a - b);

  if (
    !Number.isInteger(startHour) ||
    !Number.isInteger(endHour) ||
    startHour < 0 ||
    endHour > 24 ||
    endHour <= startHour ||
    endHour - startHour > 16 ||
    ![4, 8].includes(horizonWeeks) ||
    weekdays.length === 0 ||
    weekdays.some((weekday) => weekday < 0 || weekday > 6)
  ) {
    return { error: "曜日・時間帯・公開期間を確認してください。" };
  }

  const supabase = createAdminClient();
  const { error: settingsError } = await supabase
    .from("booking_schedule_settings")
    .upsert({
      id: 1,
      start_hour: startHour,
      end_hour: endHour,
      active_weekdays: weekdays,
      horizon_weeks: horizonWeeks,
    });

  if (settingsError) {
    console.error("Failed to save booking schedule", settingsError.code);
    return { error: "標準スケジュールを保存できませんでした。" };
  }

  const today = getJstDateKey();
  const currentWeekStart = getMondayDateKey(today);
  const slots: Array<{
    starts_at: string;
    ends_at: string;
    created_by: string;
  }> = [];

  for (let dayIndex = 0; dayIndex < horizonWeeks * 7; dayIndex += 1) {
    const dateKey = addDaysToDateKey(currentWeekStart, dayIndex);
    if (!weekdays.includes(getWeekdayFromDateKey(dateKey))) continue;

    for (let hour = startHour; hour < endHour; hour += 1) {
      const startsAt = new Date(dateKeyToJstIso(dateKey, hour));
      if (startsAt <= new Date()) continue;
      slots.push({
        starts_at: startsAt.toISOString(),
        ends_at: new Date(startsAt.getTime() + 60 * 60 * 1000).toISOString(),
        created_by: user.id,
      });
    }
  }

  const { error: slotsError } = await supabase
    .from("availability_slots")
    .upsert(slots, { onConflict: "starts_at", ignoreDuplicates: true });

  if (slotsError) {
    console.error("Failed to create schedule slots", slotsError.code);
    return { error: "標準スケジュールは保存されましたが、予約枠を作成できませんでした。" };
  }

  revalidatePath("/admin");
  revalidatePath("/reserve");
  return { message: `標準スケジュールを保存し、${slots.length}件の1時間枠を準備しました。` };
}

export async function setSlotAvailabilityAction(slotId: string, isOpen: boolean) {
  await requireAdminForAction();
  if (!UUID_PATTERN.test(slotId) || typeof isOpen !== "boolean") {
    return { error: "予約枠を更新できませんでした。" };
  }

  const supabase = createAdminClient();
  const { data: result, error } = await supabase.rpc("set_slot_availability", {
    p_slot_id: slotId,
    p_is_open: isOpen,
  });

  if (error) {
    console.error("Failed to update slot availability", error.code);
    return { error: "予約枠を更新できませんでした。" };
  }
  if (result === "booked") return { error: "予約済みの枠は受付停止にできません。" };
  if (result !== "updated") return { error: "対象の予約枠が見つかりませんでした。" };

  revalidatePath("/admin");
  revalidatePath("/reserve");
  return { success: true };
}

export async function cancelBookingAction(formData: FormData) {
  await requireAdminForAction();
  const bookingId = String(formData.get("bookingId") || "");
  if (!UUID_PATTERN.test(bookingId)) return;

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
  });

  if (error) console.error("Failed to cancel booking", error.code);
  revalidatePath("/admin");
  revalidatePath("/reserve");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
