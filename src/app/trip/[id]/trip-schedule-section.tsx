"use client";

import { useMemo, useState } from "react";

import type { ReservationStatus, Trip, TripSchedule } from "@/lib/trips";
import { AddScheduleModal } from "./add-schedule-modal";
import { EditScheduleModal } from "./edit-schedule-modal";
import { TripScheduleTimelineSection } from "./trip-schedule-timeline-section";

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
  const [editingSchedule, setEditingSchedule] = useState<TripSchedule | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

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

  async function markReserved(scheduleId: string) {
    setActionErrorMessage(null);
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
        setActionErrorMessage(payload.error ?? "予約状態の更新に失敗しました");
        return;
      }

      const updated = (await response.json()) as TripSchedule;
      setSchedules((current) =>
        current.map((item) =>
          item.scheduleId === updated.scheduleId ? updated : item,
        ),
      );
    } catch {
      setActionErrorMessage(
        "通信に失敗しました。時間をおいて再試行してください。",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <TripScheduleTimelineSection
        dayTabs={dayTabs}
        selectedDay={selectedDay}
        visibleSchedules={visibleSchedules}
        isUpdating={isUpdating}
        onSelectDay={(day) => {
          setSelectedDay(day);
          setActionErrorMessage(null);
        }}
        onOpenAddModal={() => {
          setActionErrorMessage(null);
          setIsAddModalOpen(true);
        }}
        onOpenEditModal={(schedule) => {
          setActionErrorMessage(null);
          setEditingSchedule(schedule);
        }}
        onMarkReserved={markReserved}
      />

      {actionErrorMessage ? (
        <p className="mt-2 text-sm text-red-500">{actionErrorMessage}</p>
      ) : null}

      <AddScheduleModal
        isOpen={isAddModalOpen}
        tripId={trip.id}
        dayTabs={dayTabs}
        initialDayIndex={selectedDay}
        reservationOptions={reservationOptions}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(created) => {
          setSchedules((current) => [...current, created]);
          setSelectedDay(created.dayIndex);
          setIsAddModalOpen(false);
        }}
      />

      <EditScheduleModal
        isOpen={editingSchedule !== null}
        tripId={trip.id}
        schedule={editingSchedule}
        onClose={() => setEditingSchedule(null)}
        onUpdated={(updated) => {
          setSchedules((current) =>
            current.map((item) =>
              item.scheduleId === updated.scheduleId ? updated : item,
            ),
          );
          setEditingSchedule(null);
        }}
      />
    </>
  );
}
