"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type {
  AvailabilitySchedule,
  AvailabilitySlot,
  BookingConfirmation,
} from "@/lib/booking/types";
import AvailabilityCalendar from "./AvailabilityCalendar";
import styles from "./reserve.module.css";

type Step = "slots" | "details" | "confirm" | "complete";

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

export default function ReservationFlow() {
  const [step, setStep] = useState<Step>("slots");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [schedule, setSchedule] = useState<AvailabilitySchedule | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);

  async function fetchAvailability() {
    const response = await fetch("/api/availability", { cache: "no-store" });
    const result = (await response.json()) as {
      slots?: AvailabilitySlot[];
      schedule?: AvailabilitySchedule | null;
      error?: string;
    };
    if (!response.ok) throw new Error(result.error || "空き日時を取得できませんでした。");
    setSlots(result.slots ?? []);
    setSchedule(result.schedule ?? null);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await fetchAvailability();
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "空き日時を取得できませんでした。");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  function chooseSlot(slot: AvailabilitySlot) {
    setSelectedSlot(slot);
    setError("");
    setStep("details");
  }

  function reviewDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot || !event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    const formData = new FormData(event.currentTarget);
    setWebsite(String(formData.get("website") || ""));
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
      const result = (await response.json()) as { booking?: BookingConfirmation; error?: string };

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

  const stepOrder: Step[] = ["slots", "details", "confirm", "complete"];
  const stepLabels = ["日時", "予約者情報", "確認", "完了"];
  const currentStep = stepOrder.indexOf(step);

  return (
    <section className={styles.flow} aria-label="無料面談の予約手続き">
      <ol className={styles.steps} aria-label="予約の進行状況">
        {stepLabels.map((label, index) => (
          <li
            key={label}
            className={index === currentStep ? styles.currentStep : index < currentStep ? styles.completedStep : ""}
            aria-current={index === currentStep ? "step" : undefined}
          >
            <span>{index + 1}</span>{label}
          </li>
        ))}
      </ol>

      {step === "slots" && (
        <div className={styles.stepPanel}>
          <div className={styles.stepHeading}>
            <p>STEP 1</p>
            <h2>空いている日時を選んでください</h2>
            <span>すべて日本時間です。面談時間は1時間です。</span>
          </div>
          {loading ? (
            <p className={styles.empty}>空き日時を読み込んでいます…</p>
          ) : slots.length === 0 && !schedule ? (
            <p className={styles.empty}>現在予約できる日時がありません。</p>
          ) : (
            <AvailabilityCalendar slots={slots} schedule={schedule} onSelect={chooseSlot} />
          )}
          <p className={styles.privacyNote}>この画面を見ただけでは、個人情報は保存されません。</p>
        </div>
      )}

      {step === "details" && selectedSlot && (
        <div className={`${styles.stepPanel} ${styles.narrowPanel}`}>
          <div className={styles.selectedSummary}>
            <span>選択中の日時</span>
            <strong>{formatSlot(selectedSlot)}</strong>
            <button type="button" onClick={() => { setSelectedSlot(null); setStep("slots"); }}>日時を変更</button>
          </div>
          <div className={styles.stepHeading}>
            <p>STEP 2</p>
            <h2>予約者情報を入力してください</h2>
            <span>予約確定までは、入力内容を送信・保存しません。</span>
          </div>
          <form className={styles.detailsForm} onSubmit={reviewDetails}>
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
            <button type="submit">予約内容を確認する<span aria-hidden="true">›</span></button>
          </form>
        </div>
      )}

      {step === "confirm" && selectedSlot && (
        <div className={`${styles.stepPanel} ${styles.narrowPanel}`}>
          <div className={styles.stepHeading}>
            <p>STEP 3</p>
            <h2>予約内容を確認してください</h2>
            <span>次のボタンを押した時点で、予約と予約者情報が保存されます。</span>
          </div>
          <dl className={styles.confirmationList}>
            <div><dt>予約日時</dt><dd>{formatSlot(selectedSlot)}</dd></div>
            <div><dt>お名前</dt><dd>{name}</dd></div>
            <div><dt>メール</dt><dd>{email}</dd></div>
          </dl>
          <button className={styles.primaryButton} type="button" onClick={book} disabled={loading}>
            {loading ? "予約中…" : "この内容で予約を確定する"}<span aria-hidden="true">›</span>
          </button>
          <button className={styles.textButton} type="button" onClick={() => setStep("details")} disabled={loading}>
            予約者情報を修正する
          </button>
        </div>
      )}

      {step === "complete" && confirmation && (
        <div className={`${styles.stepPanel} ${styles.narrowPanel} ${styles.complete}`}>
          <p ref={statusRef} className={styles.status} role="status" tabIndex={-1}>予約が確定しました。</p>
          <h2>{formatSlot(confirmation)}</h2>
          <p>予約番号</p>
          <strong className={styles.code}>{confirmation.confirmationCode}</strong>
          <p>変更やキャンセルの際に必要になるため、この画面を保存してください。</p>
        </div>
      )}

      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  );
}
