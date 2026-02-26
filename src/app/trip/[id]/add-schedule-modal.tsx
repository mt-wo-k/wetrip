"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduleType, TripSchedule } from "@/lib/trips";

type AddScheduleModalProps = {
  isOpen: boolean;
  tripId: string;
  dayTabs: number[];
  scheduleType: ScheduleType | null;
  initialDayIndex: number;
  onClose: () => void;
  onCreated: (created: TripSchedule) => void;
};

export function AddScheduleModal({
  isOpen,
  tripId,
  dayTabs,
  scheduleType,
  initialDayIndex,
  onClose,
  onCreated,
}: AddScheduleModalProps) {
  const [dayIndex, setDayIndex] = useState(initialDayIndex);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isHotel = scheduleType === "hotel";

  useEffect(() => {
    if (!isOpen || !scheduleType) {
      return;
    }

    setDayIndex(initialDayIndex);
    setStartTime("");
    setEndTime("");
    setTitle("");
    setDetail("");
    setErrorMessage(null);
  }, [isOpen, initialDayIndex, scheduleType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!scheduleType) {
      setErrorMessage("種別が選択されていません");
      return;
    }

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
          scheduleType,
          startTime,
          endTime: isHotel ? undefined : endTime,
          title,
          detail,
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

  if (!isOpen || !scheduleType) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{scheduleType} を追加</CardTitle>
          <Button type="button" variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dayIndex">
                日にち
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

            <div
              className={isHotel ? "space-y-2" : "grid gap-4 sm:grid-cols-2"}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="startTime">
                  {isHotel ? "チェックイン" : "開始時間"}
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
              {!isHotel ? (
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
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">
                タイトル
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="detail">
                メモ
              </label>
              <textarea
                id="detail"
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                className="min-h-24 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-500">{errorMessage}</p>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "追加中..." : "追加する"}
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
