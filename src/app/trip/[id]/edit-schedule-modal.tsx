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
  onDeleted: (deletedScheduleId: string) => void;
};

export function EditScheduleModal({
  isOpen,
  tripId,
  dayTabs,
  schedule,
  onClose,
  onUpdated,
  onDeleted,
}: EditScheduleModalProps) {
  const [editDayIndex, setEditDayIndex] = useState(1);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editMapLink, setEditMapLink] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !schedule) {
      return;
    }

    setEditDayIndex(schedule.dayIndex);
    setEditStartTime(schedule.startTime);
    setEditEndTime(schedule.endTime ?? schedule.startTime);
    setEditMapLink(schedule.mapLink ?? "");
    setEditTitle(schedule.title ?? schedule.name ?? "");
    setEditDetail(schedule.detail ?? "");
    setIsConfirmOpen(false);
    setErrorMessage(null);
  }, [isOpen, schedule]);

  function handleStartTimeChange(nextStartTime: string) {
    const previousStartTime = editStartTime;
    setEditStartTime(nextStartTime);

    if (editEndTime === "" || editEndTime === previousStartTime) {
      setEditEndTime(nextStartTime);
    }
  }

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
            endTime: editEndTime,
            mapLink: editMapLink,
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

  async function handleDelete() {
    if (!schedule) {
      setErrorMessage("削除対象の予定が見つかりません");
      return;
    }

    setErrorMessage(null);
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/trips/${tripId}/schedules/${schedule.scheduleId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setErrorMessage(payload?.error ?? "予定の削除に失敗しました");
        return;
      }

      onDeleted(schedule.scheduleId);
    } catch {
      setErrorMessage("通信に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{schedule?.title} を編集</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="editDayIndex">
                日にち
              </label>
              <select
                id="editDayIndex"
                value={editDayIndex}
                onChange={(event) =>
                  setEditDayIndex(Number(event.target.value))
                }
                className="w-fit min-w-30 rounded-md border border-border bg-transparent px-3 py-2 text-base"
              >
                {dayTabs.map((day) => (
                  <option key={day} value={day}>
                    {day}日目
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="editStartTime">
                  開始時間
                </label>
                <input
                  id="editStartTime"
                  type="time"
                  step={300}
                  required
                  value={editStartTime}
                  onChange={(event) =>
                    handleStartTimeChange(event.target.value)
                  }
                  className="w-fit min-w-30 rounded-md border border-border bg-transparent px-3 py-2 text-base"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="editEndTime">
                  終了時間
                </label>
                <input
                  id="editEndTime"
                  type="time"
                  step={300}
                  required
                  value={editEndTime}
                  onChange={(event) => setEditEndTime(event.target.value)}
                  className="w-fit min-w-30 rounded-md border border-border bg-transparent px-3 py-2 text-base"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="editMapLink">
                Google Mapリンク（任意）
              </label>
              <input
                id="editMapLink"
                type="url"
                value={editMapLink}
                onChange={(event) => setEditMapLink(event.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-base"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="editTitle">
                タイトル
              </label>
              <input
                id="editTitle"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-base"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="editDetail">
                メモ（任意）
              </label>
              <textarea
                id="editDetail"
                value={editDetail}
                onChange={(event) => setEditDetail(event.target.value)}
                className="min-h-24 w-full rounded-md border border-border bg-transparent px-3 py-2 text-base"
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-500">{errorMessage}</p>
            ) : null}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? "更新中..." : "保存する"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                >
                  キャンセル
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-0 py-0 text-xs text-muted-foreground underline underline-offset-4 hover:bg-transparent hover:text-foreground"
                onClick={() => setIsConfirmOpen(true)}
                disabled={isSubmitting || isDeleting}
              >
                予定を削除
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {isConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">
                この予定を削除しますか？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                この操作は元に戻せません。
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isDeleting}
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "削除中..." : "削除する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
