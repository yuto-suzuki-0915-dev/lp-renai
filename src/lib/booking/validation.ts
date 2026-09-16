import type { BookingRequest } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ValidatedBookingRequest = {
  name: string;
  email: string;
  slotId: string;
};

export function validateBookingRequest(
  value: unknown,
):
  | { success: true; data: ValidatedBookingRequest }
  | { success: false; error: string } {
  if (!value || typeof value !== "object") {
    return { success: false, error: "入力内容を確認してください。" };
  }

  const request = value as Partial<BookingRequest>;
  const name = typeof request.name === "string" ? request.name.trim() : "";
  const email = typeof request.email === "string" ? request.email.trim().toLowerCase() : "";
  const slotId = typeof request.slotId === "string" ? request.slotId : "";

  if (!name || name.length > 80) {
    return { success: false, error: "お名前は80文字以内で入力してください。" };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { success: false, error: "有効なメールアドレスを入力してください。" };
  }
  if (!UUID_PATTERN.test(slotId)) {
    return { success: false, error: "予約日時を選択してください。" };
  }

  return { success: true, data: { name, email, slotId } };
}
