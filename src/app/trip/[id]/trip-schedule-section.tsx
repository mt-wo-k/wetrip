"use client";

import { useMemo, useState } from "react";

import type { ScheduleType, Trip, TripSchedule } from "@/lib/trips";
import { AddScheduleModal } from "./add-schedule-modal";
import { EditScheduleModal } from "./edit-schedule-modal";
import { TripScheduleTimelineSection } from "./trip-schedule-timeline-section";

type TripScheduleSectionProps = {
  trip: Trip;
  initialSchedules: TripSchedule[];
};

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
  const [activeAddType, setActiveAddType] = useState<ScheduleType | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<TripSchedule | null>(null);

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
      .filter((item) => item.dayIndex === selectedDay)
      .sort((a, b) => {
        if (a.startTime !== b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [schedules, selectedDay]);

  return (
    <>
      <TripScheduleTimelineSection
        dayTabs={dayTabs}
        selectedDay={selectedDay}
        visibleSchedules={visibleSchedules}
        onSelectDay={setSelectedDay}
        onOpenAddModal={setActiveAddType}
        onOpenEditModal={setEditingSchedule}
      />

      <AddScheduleModal
        isOpen={activeAddType !== null}
        tripId={trip.id}
        dayTabs={dayTabs}
        scheduleType={activeAddType}
        initialDayIndex={selectedDay}
        onClose={() => setActiveAddType(null)}
        onCreated={(created) => {
          setSchedules((current) => [...current, created]);
          setSelectedDay(created.dayIndex);
          setActiveAddType(null);
        }}
      />

      <EditScheduleModal
        isOpen={editingSchedule !== null}
        tripId={trip.id}
        dayTabs={dayTabs}
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
        onDeleted={(deletedScheduleId) => {
          setSchedules((current) =>
            current.filter((item) => item.scheduleId !== deletedScheduleId),
          );
          setEditingSchedule(null);
        }}
      />
    </>
  );
}
