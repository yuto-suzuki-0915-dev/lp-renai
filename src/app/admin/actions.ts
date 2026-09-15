"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):00$/;

export type SlotFormState = {
  message?: string;
  error?: string;
};

async function requireAdminForAction() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function createSlotsAction(
  _previousState: SlotFormState,
  formData: FormData,
): Promise<SlotFormState> {
  const user = await requireAdminForAction();
  const date = String(formData.get("date") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");

  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
    return { error: "日付と開始・終了時刻を1時間単位で指定してください。" };
  }

  const start = new Date(`${date}T${startTime}:00+09:00`);
  const end = new Date(`${date}T${endTime}:00+09:00`);
  const now = new Date();

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start <= now ||
    end <= start
  ) {
    return { error: "未来の日付で、終了時刻を開始時刻より後にしてください。" };
  }

  const oneHour = 60 * 60 * 1000;
  const count = (end.getTime() - start.getTime()) / oneHour;
  if (!Number.isInteger(count) || count > 24) {
    return { error: "一度に作成できる予約枠は24件までです。" };
  }

  const slots = Array.from({ length: count }, (_, index) => ({
    starts_at: new Date(start.getTime() + index * oneHour).toISOString(),
    ends_at: new Date(start.getTime() + (index + 1) * oneHour).toISOString(),
    created_by: user.id,
  }));

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("availability_slots")
    .upsert(slots, { onConflict: "starts_at", ignoreDuplicates: true });

  if (error) {
    console.error("Failed to create slots", error.code);
    return { error: "予約枠を作成できませんでした。" };
  }

  revalidatePath("/admin");
  return { message: `${count}件の予約枠を作成しました。` };
}

export async function setSlotOpenAction(formData: FormData) {
  await requireAdminForAction();
  const slotId = String(formData.get("slotId") || "");
  const isOpen = String(formData.get("isOpen")) === "true";
  if (!UUID_PATTERN.test(slotId)) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("availability_slots")
    .update({ is_open: isOpen })
    .eq("id", slotId);

  if (error) console.error("Failed to update slot", error.code);
  revalidatePath("/admin");
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
}

export async function deleteSlotAction(formData: FormData) {
  await requireAdminForAction();
  const slotId = String(formData.get("slotId") || "");
  if (!UUID_PATTERN.test(slotId)) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId);

  if (error) console.error("Failed to delete slot", error.code);
  revalidatePath("/admin");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
