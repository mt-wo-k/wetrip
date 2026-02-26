"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TripSchedule } from "@/lib/trips";

type EditScheduleModalProps = {
  isOpen: boolean;
  tripId: string;
  dayTabs: number[];
  schedule: TripSchedule | null;
  onClose: () => void;
  onUpdated: (updated: TripSchedule) => void;
};

export function EditScheduleModal({
  isOpen,
  tripId,
  dayTabs,
  schedule,
  onClose,
  onUpdated,
}: EditScheduleModalProps) {
  const [editDayIndex, setEditDayIndex] = useState(1);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isHotel = schedule?.scheduleType === "hotel";

  useEffect(() => {
    if (!isOpen || !schedule) {
      return;
    }

    setEditDayIndex(schedule.dayIndex);
    setEditStartTime(schedule.startTime);
    setEditEndTime(schedule.endTime ?? "");
    setEditTitle(schedule.title ?? schedule.name ?? "");
    setEditDetail(schedule.detail ?? "");
    setErrorMessage(null);
  }, [isOpen, schedule]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!schedule) {
      setErrorMessage("編集対象の予定が見つかりません");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/trips/${tripId}/schedules/${schedule.scheduleId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dayIndex: editDayIndex,
            scheduleType: schedule.scheduleType,
            startTime: editStartTime,
            endTime: isHotel ? undefined : editEndTime,
            title: editTitle,
            detail: editDetail,
          }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setErrorMessage(payload.error ?? "予定の更新に失敗しました");
        return;
      }

      const updated = (await response.json()) as TripSchedule;
      onUpdated(updated);
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
          <CardTitle>{schedule?.scheduleType} を編集</CardTitle>
          <Button type="button" variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="editDayIndex">
                日にち
              </label>
              <select
                id="editDayIndex"
                value={editDayIndex}
                onChange={(event) => setEditDayIndex(Number(event.target.value))}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              >
                {dayTabs.map((day) => (
                  <option key={day} value={day}>
                    {day}日目
                  </option>
                ))}
              </select>
            </div>

            <div className={isHotel ? "space-y-2" : "grid gap-4 sm:grid-cols-2"}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="editStartTime">
                  {isHotel ? "チェックイン" : "開始時間"}
                </label>
                <input
                  id="editStartTime"
                  type="time"
                  required
                  value={editStartTime}
                  onChange={(event) => setEditStartTime(event.target.value)}
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                />
              </div>
              {!isHotel ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="editEndTime">
                    終了時間（任意）
                  </label>
                  <input
                    id="editEndTime"
                    type="time"
                    value={editEndTime}
                    onChange={(event) => setEditEndTime(event.target.value)}
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="editTitle">
                タイトル
              </label>
              <input
                id="editTitle"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="editDetail">
                メモ
              </label>
              <textarea
                id="editDetail"
                value={editDetail}
                onChange={(event) => setEditDetail(event.target.value)}
                className="min-h-24 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>

            {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "更新中..." : "保存する"}
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
