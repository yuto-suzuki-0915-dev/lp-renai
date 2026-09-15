"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import type { AvailabilitySlot, BookingConfirmation } from "@/lib/booking/types";
import styles from "./ContactSection.module.css";

type Step = "details" | "slots" | "confirm" | "complete";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "long",
  day: "numeric",
  weekday: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatSlot(slot: AvailabilitySlot | BookingConfirmation) {
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  return `${fullDateFormatter.format(start)} ${timeFormatter.format(start)}〜${timeFormatter.format(end)}`;
}

export default function ContactSection() {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const key = dateFormatter.format(new Date(slot.startsAt));
      groups.set(key, [...(groups.get(key) ?? []), slot]);
    }
    return [...groups.entries()];
  }, [slots]);

  async function fetchAvailability() {
    const response = await fetch("/api/availability", { cache: "no-store" });
    const result = (await response.json()) as {
      slots?: AvailabilitySlot[];
      error?: string;
    };

    if (!response.ok) throw new Error(result.error || "空き日時を取得できませんでした。");
    setSlots(result.slots ?? []);
  }

  async function showAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    const formData = new FormData(event.currentTarget);
    setWebsite(String(formData.get("website") || ""));
    setLoading(true);
    setError("");

    try {
      await fetchAvailability();
      setStep("slots");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "空き日時を取得できませんでした。");
    } finally {
      setLoading(false);
    }
  }

  function chooseSlot(slot: AvailabilitySlot) {
    setSelectedSlot(slot);
    setError("");
    setStep("confirm");
  }

  async function book() {
    if (!selectedSlot) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, slotId: selectedSlot.id, website }),
      });
      const result = (await response.json()) as {
        booking?: BookingConfirmation;
        error?: string;
      };

      if (!response.ok || !result.booking) {
        if (response.status === 409) {
          await fetchAvailability();
          setSelectedSlot(null);
          setStep("slots");
        }
        throw new Error(result.error || "予約を確定できませんでした。");
      }

      setConfirmation(result.booking);
      setStep("complete");
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "予約を確定できませんでした。");
    } finally {
      setLoading(false);
    }
  }

  function editDetails() {
    setSelectedSlot(null);
    setError("");
    setStep("details");
  }

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.divider} />
      <header className={styles.heading}>
        <h2 id="contact-title">まだ一人で考えているなら、話してみてほしい。</h2>
      </header>
      <div className={styles.lead}>
        <p>1時間の無料面談で、あなたの未来を覗いてみてほしい。</p>
        <p>申し込むかどうかは、それから決めてください。</p>
      </div>

      <div className={styles.form}>
        <ol className={styles.steps} aria-label="予約の手順">
          <li className={step === "details" ? styles.currentStep : ""}>入力</li>
          <li className={step === "slots" ? styles.currentStep : ""}>日時</li>
          <li className={step === "confirm" ? styles.currentStep : ""}>確認</li>
          <li className={step === "complete" ? styles.currentStep : ""}>完了</li>
        </ol>

        {step === "details" && (
          <form className={styles.innerForm} onSubmit={showAvailability}>
            <p>お名前とメールアドレスを入力すると、現在の空き日時を確認できます。</p>
            <label>
              <span>お名前</span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例）田中 太郎"
                autoComplete="name"
                maxLength={80}
                required
              />
            </label>
            <label>
              <span>メールアドレス</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="例）taro@example.com"
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>
            <label className={styles.honeypot} aria-hidden="true">
              <span>ウェブサイト</span>
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
            <small>── 所要1分。面談は1時間・無料です ──</small>
            <button type="submit" disabled={loading}>
              {loading ? "読み込み中…" : "空き日時を見る"}<span aria-hidden="true">›</span>
            </button>
          </form>
        )}

        {step === "slots" && (
          <div className={styles.slotPicker}>
            <div className={styles.summaryLine}>
              <div><strong>{name}</strong><span>{email}</span></div>
              <button type="button" className={styles.textButton} onClick={editDetails}>入力を変更</button>
            </div>
            <div>
              <h3>空いている日時を選んでください</h3>
              <p>すべて日本時間です。面談時間は1時間です。</p>
            </div>
            {groupedSlots.length === 0 ? (
              <p className={styles.empty}>現在予約できる日時がありません。</p>
            ) : (
              <div className={styles.slotGroups}>
                {groupedSlots.map(([date, dateSlots]) => (
                  <fieldset key={date}>
                    <legend>{date}</legend>
                    <div className={styles.slotButtons}>
                      {dateSlots.map((slot) => (
                        <button key={slot.id} type="button" onClick={() => chooseSlot(slot)}>
                          {timeFormatter.format(new Date(slot.startsAt))}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "confirm" && selectedSlot && (
          <div className={styles.confirmation}>
            <h3>予約内容を確認してください</h3>
            <dl>
              <div><dt>お名前</dt><dd>{name}</dd></div>
              <div><dt>メール</dt><dd>{email}</dd></div>
              <div><dt>予約日時</dt><dd>{formatSlot(selectedSlot)}</dd></div>
            </dl>
            <button type="button" onClick={book} disabled={loading}>
              {loading ? "予約中…" : "この内容で予約を確定する"}<span aria-hidden="true">›</span>
            </button>
            <button type="button" className={styles.textButton} onClick={() => setStep("slots")} disabled={loading}>
              日時を選び直す
            </button>
          </div>
        )}

        {step === "complete" && confirmation && (
          <div className={styles.complete}>
            <p ref={statusRef} className={styles.status} role="status" tabIndex={-1}>
              予約が確定しました。
            </p>
            <h3>{formatSlot(confirmation)}</h3>
            <p>予約番号</p>
            <strong className={styles.code}>{confirmation.confirmationCode}</strong>
            <p>変更やキャンセルの際に必要になるため、この画面を保存してください。</p>
          </div>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.caution}>
          <p>強引な勧誘は一切行いません。</p>
          <p>入力情報は面談予約の管理にのみ使用します。</p>
        </div>
      </div>
      <footer className={styles.footer}>© moteru. All rights reserved.</footer>
    </section>
  );
}
