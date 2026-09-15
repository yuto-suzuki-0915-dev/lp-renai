import { createHmac } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseSecretEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import { validateBookingRequest } from "@/lib/booking/validation";

export const runtime = "nodejs";

function getRequestFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const { secretKey } = getSupabaseSecretEnv();
  const rateLimitSecret = process.env.RATE_LIMIT_SECRET || secretKey;

  return createHmac("sha256", rateLimitSecret)
    .update(`${ip}:${userAgent}`)
    .digest("hex");
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "予約システムの接続設定が完了していません。" },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 10_000) {
    return Response.json({ error: "送信内容が大きすぎます。" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "入力内容を確認してください。" }, { status: 400 });
  }

  const validated = validateBookingRequest(body);
  if (!validated.success) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const supabase = createAdminClient();
  const fingerprint = getRequestFingerprint(request);
  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    "consume_booking_rate_limit",
    {
      p_key_hash: fingerprint,
      p_limit: 8,
      p_window_seconds: 3600,
    },
  );

  if (rateLimitError) {
    console.error("Failed to check booking rate limit", rateLimitError.code);
    return Response.json(
      { error: "予約を受け付けられませんでした。時間を置いてお試しください。" },
      { status: 500 },
    );
  }
  if (!allowed) {
    return Response.json(
      { error: "短時間の送信回数が上限に達しました。時間を置いてお試しください。" },
      { status: 429 },
    );
  }

  const { name, email, slotId } = validated.data;
  const { data, error } = await supabase.rpc("create_booking", {
    p_slot_id: slotId,
    p_customer_name: name,
    p_customer_email: email,
  });

  if (error) {
    if (error.message.includes("slot_unavailable") || error.code === "23505") {
      return Response.json(
        { error: "この日時は予約済みになりました。別の日時を選択してください。" },
        { status: 409 },
      );
    }

    console.error("Failed to create booking", error.code);
    return Response.json(
      { error: "予約を確定できませんでした。時間を置いてお試しください。" },
      { status: 500 },
    );
  }

  const booking = Array.isArray(data) ? data[0] : null;
  if (!booking) {
    return Response.json(
      { error: "予約を確定できませんでした。時間を置いてお試しください。" },
      { status: 500 },
    );
  }

  return Response.json(
    {
      booking: {
        bookingId: booking.booking_id,
        confirmationCode: booking.confirmation_code,
        startsAt: booking.slot_starts_at,
        endsAt: booking.slot_ends_at,
      },
    },
    { status: 201 },
  );
}
