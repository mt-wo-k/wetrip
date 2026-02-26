"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReservationStatus, TripSchedule } from "@/lib/trips";

type ReservationOption = { value: ReservationStatus; label: string };

type AddScheduleModalProps = {
  isOpen: boolean;
  tripId: string;
  dayTabs: number[];
  initialDayIndex: number;
  reservationOptions: ReservationOption[];
  onClose: () => void;
  onCreated: (created: TripSchedule) => void;
};

export function AddScheduleModal({
  isOpen,
  tripId,
  dayTabs,
  initialDayIndex,
  reservationOptions,
  onClose,
  onCreated,
}: AddScheduleModalProps) {
  const [dayIndex, setDayIndex] = useState(initialDayIndex);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [reservationStatus, setReservationStatus] =
    useState<ReservationStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDayIndex(initialDayIndex);
    setStartTime("");
    setEndTime("");
    setName("");
    setDetail("");
    setReservationStatus("pending");
    setErrorMessage(null);
  }, [isOpen, initialDayIndex]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayIndex,
          startTime,
          endTime,
          name,
          detail,
          reservationStatus,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setErrorMessage(payload.error ?? "予定の追加に失敗しました");
        return;
      }

      const created = (await response.json()) as TripSchedule;
      onCreated(created);
    } catch {
      setErrorMessage("通信に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>予定を追加</CardTitle>
          <Button type="button" variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="dayIndex">
                  日にち（n日目）
                </label>
                <select
                  id="dayIndex"
                  value={dayIndex}
                  onChange={(event) => setDayIndex(Number(event.target.value))}
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                >
                  {dayTabs.map((day) => (
                    <option key={day} value={day}>
                      {day}日目
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reservationStatus">
                  予約
                </label>
                <select
                  id="reservationStatus"
                  value={reservationStatus}
                  onChange={(event) =>
                    setReservationStatus(event.target.value as ReservationStatus)
                  }
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                >
                  {reservationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="startTime">
                  開始時間
                </label>
                <input
                  id="startTime"
                  type="time"
                  required
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="endTime">
                  終了時間（任意）
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                予定名
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="detail">
                詳細
              </label>
              <textarea
                id="detail"
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                className="min-h-24 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>

            {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "追加中..." : "予定を追加"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
