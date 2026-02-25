"use client";

import { FormEvent, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReservationStatus, Trip, TripSchedule } from "@/lib/trips";

type TripScheduleSectionProps = {
  trip: Trip;
  initialSchedules: TripSchedule[];
};

const reservationOptions: Array<{ value: ReservationStatus; label: string }> = [
  { value: "pending", label: "予約前" },
  { value: "reserved", label: "予約済" },
  { value: "not_required", label: "予約不要" },
];

function getTripDays(startDate: string, endDate: string) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
  return Math.max(1, diff);
}

export function TripScheduleSection({
  trip,
  initialSchedules,
}: TripScheduleSectionProps) {
  const [schedules, setSchedules] = useState<TripSchedule[]>(initialSchedules);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [dayIndex, setDayIndex] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [reservationStatus, setReservationStatus] =
    useState<ReservationStatus>("pending");
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDetail, setEditDetail] = useState("");

  const maxDayInSchedules =
    schedules.length > 0
      ? Math.max(...schedules.map((item) => item.dayIndex))
      : 1;
  const totalDays = Math.max(
    getTripDays(trip.startDate, trip.endDate),
    maxDayInSchedules,
  );
  const dayTabs = Array.from({ length: totalDays }, (_, index) => index + 1);

  const visibleSchedules = useMemo(() => {
    return schedules
      .filter(
        (item) =>
          item.dayIndex === selectedDay &&
          item.reservationStatus !== "not_required",
      )
      .sort((a, b) => {
        if (a.startTime !== b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [schedules, selectedDay]);

  async function handleCreateSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/trips/${trip.id}/schedules`, {
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
      setSchedules((current) => [...current, created]);
      setSelectedDay(created.dayIndex);
      setDayIndex(created.dayIndex);
      setStartTime("");
      setEndTime("");
      setName("");
      setDetail("");
      setReservationStatus("pending");
      setIsAddModalOpen(false);
    } catch {
      setErrorMessage("通信に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markReserved(scheduleId: string) {
    setErrorMessage(null);
    setIsUpdating(true);

    try {
      const response = await fetch(
        `/api/trips/${trip.id}/schedules/${scheduleId}/reservation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reservationStatus: "reserved" }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setErrorMessage(payload.error ?? "予約状態の更新に失敗しました");
        return;
      }

      const updated = (await response.json()) as TripSchedule;
      setSchedules((current) =>
        current.map((item) =>
          item.scheduleId === updated.scheduleId ? updated : item,
        ),
      );
    } catch {
      setErrorMessage("通信に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsUpdating(false);
    }
  }

  function openEditModal(schedule: TripSchedule) {
    setEditingScheduleId(schedule.scheduleId);
    setEditName(schedule.name ?? "");
    setEditDetail(schedule.detail ?? "");
    setErrorMessage(null);
    setIsEditModalOpen(true);
  }

  async function handleUpdateSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingScheduleId) {
      setErrorMessage("編集対象の予定が見つかりません");
      return;
    }

    setErrorMessage(null);
    setIsEditSubmitting(true);

    try {
      const response = await fetch(
        `/api/trips/${trip.id}/schedules/${editingScheduleId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName,
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
      setSchedules((current) =>
        current.map((item) =>
          item.scheduleId === updated.scheduleId ? updated : item,
        ),
      );
      setIsEditModalOpen(false);
      setEditingScheduleId(null);
    } catch {
      setErrorMessage("通信に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsEditSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>タイムスケジュール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {dayTabs.map((day) => (
              <Button
                key={day}
                type="button"
                variant={selectedDay === day ? "default" : "outline"}
                onClick={() => {
                  setSelectedDay(day);
                  setDayIndex(day);
                }}
              >
                {day}日目
              </Button>
            ))}
          </div>

          <div>
            <Button
              type="button"
              onClick={() => {
                setDayIndex(selectedDay);
                setErrorMessage(null);
                setIsAddModalOpen(true);
              }}
            >
              予定追加
            </Button>
          </div>

          <div className="space-y-4">
            {visibleSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {selectedDay}日目の予定はまだありません。
              </p>
            ) : (
              visibleSchedules.map((item, index) => (
                <div
                  key={item.scheduleId}
                  className="grid grid-cols-[120px_1fr] gap-4"
                >
                  <div className="text-sm font-semibold text-muted-foreground">
                    {item.endTime
                      ? `${item.startTime}〜${item.endTime}`
                      : item.startTime}
                  </div>
                  <div className="relative pb-6">
                    <span className="absolute -left-[14px] top-2 h-3 w-3 rounded-full bg-muted-foreground/30" />
                    {index !== visibleSchedules.length - 1 ? (
                      <span className="absolute -left-[9px] top-5 h-full w-[2px] bg-border" />
                    ) : null}
                    <div className="space-y-2 pl-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="w-full rounded-md border border-border bg-background p-3 text-left hover:bg-muted/40"
                      >
                        <p className="text-base font-semibold">
                          {item.name?.trim() || "予定（タップして編集）"}
                        </p>
                        {item.detail ? (
                          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {item.detail}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            詳細なし（タップして編集）
                          </p>
                        )}
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        {item.reservationStatus === "reserved" ? (
                          <Badge variant="secondary">予約済</Badge>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => markReserved(item.scheduleId)}
                          >
                            予約済みにする
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>予定を追加</CardTitle>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddModalOpen(false)}
              >
                閉じる
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateSchedule}>
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
                    <label
                      className="text-sm font-medium"
                      htmlFor="reservationStatus"
                    >
                      予約
                    </label>
                    <select
                      id="reservationStatus"
                      value={reservationStatus}
                      onChange={(event) =>
                        setReservationStatus(
                          event.target.value as ReservationStatus,
                        )
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

                {errorMessage ? (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                ) : null}

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "追加中..." : "予定を追加"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {isEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>予定を編集</CardTitle>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingScheduleId(null);
                }}
              >
                閉じる
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleUpdateSchedule}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="editName">
                    予定名
                  </label>
                  <input
                    id="editName"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="editDetail">
                    詳細
                  </label>
                  <textarea
                    id="editDetail"
                    value={editDetail}
                    onChange={(event) => setEditDetail(event.target.value)}
                    className="min-h-24 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  />
                </div>

                {errorMessage ? (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                ) : null}

                <div className="flex gap-2">
                  <Button type="submit" disabled={isEditSubmitting}>
                    {isEditSubmitting ? "更新中..." : "保存する"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingScheduleId(null);
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
