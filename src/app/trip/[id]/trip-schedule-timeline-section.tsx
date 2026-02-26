"use client";

import { Bed, CalendarClock, MapPinPen, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduleType, TripSchedule } from "@/lib/trips";

type TripScheduleTimelineSectionProps = {
  dayTabs: number[];
  selectedDay: number;
  visibleSchedules: TripSchedule[];
  onSelectDay: (day: number) => void;
  onOpenAddModal: (type: ScheduleType) => void;
  onOpenEditModal: (schedule: TripSchedule) => void;
};

const addTypeButtons: Array<{
  type: ScheduleType;
  label: string;
  Icon: typeof Bed;
  colorClassName: string;
  borderClassName: string;
}> = [
  {
    type: "hotel",
    label: "hotel",
    Icon: Bed,
    colorClassName: "text-blue-900",
    borderClassName: "border-blue-900",
  },
  {
    type: "food",
    label: "food",
    Icon: Utensils,
    colorClassName: "text-green-900",
    borderClassName: "border-green-900",
  },
  {
    type: "spot",
    label: "spot",
    Icon: MapPinPen,
    colorClassName: "text-red-900",
    borderClassName: "border-red-900",
  },
  {
    type: "event",
    label: "event",
    Icon: CalendarClock,
    colorClassName: "text-slate-900",
    borderClassName: "border-slate-900",
  },
];

const scheduleCardBorderClass: Record<ScheduleType, string> = {
  hotel: "border-blue-900",
  food: "border-green-900",
  spot: "border-red-900",
  event: "border-slate-900",
};

export function TripScheduleTimelineSection({
  dayTabs,
  selectedDay,
  visibleSchedules,
  onSelectDay,
  onOpenAddModal,
  onOpenEditModal,
}: TripScheduleTimelineSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>タイムスケジュール</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between px-2">
          {addTypeButtons.map(
            ({ type, label, Icon, colorClassName, borderClassName }) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                className={`h-auto min-w-16 flex-col gap-1 border-2 px-3 py-1 ${colorClassName} ${borderClassName}`}
                onClick={() => onOpenAddModal(type)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px] leading-none">{label}</span>
              </Button>
            )
          )}
        </div>

        <div className="border w-full border-border"></div>

        <div className="flex flex-wrap gap-2 px-2">
          {dayTabs.map((day) => (
            <Button
              key={day}
              type="button"
              size={"sm"}
              variant={selectedDay === day ? "default" : "outline"}
              onClick={() => onSelectDay(day)}
            >
              {day}日目
            </Button>
          ))}
        </div>

        <div className="space-y-4 py-3">
          {visibleSchedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedDay}日目の予定はまだありません。
            </p>
          ) : (
            visibleSchedules.map((item, index) => (
              <div
                key={item.scheduleId}
                className="grid grid-cols-[24px_1fr] gap-4"
              >
                <div className="relative">
                  {index === 0 ? (
                    <span className="absolute left-1/2 top-[-6px] h-[6px] w-[2px] -translate-x-1/2 bg-border" />
                  ) : null}
                  <span
                    className={`absolute left-1/2 top-0 w-[2px] -translate-x-1/2 bg-border ${
                      index === visibleSchedules.length - 1
                        ? "h-[calc(100%+24px)]"
                        : "h-[calc(100%+16px)]"
                    }`}
                  />
                  <span className="absolute left-1/2 top-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-[#8F1D3F]" />
                </div>
                <div className="space-y-2 pb-4">
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(item)}
                    className={`relative w-full rounded-md border-2 bg-background p-3 text-left hover:bg-muted/40 ${
                      scheduleCardBorderClass[item.scheduleType]
                    }`}
                  >
                    <p
                      className={`absolute -top-3 left-2 rounded-full border-2 bg-background px-2 text-sm font-semibold text-muted-foreground ${
                        scheduleCardBorderClass[item.scheduleType]
                      }`}
                    >
                      {item.endTime
                        ? `${item.startTime}〜${item.endTime}`
                        : item.startTime}
                    </p>
                    <p className="text-base font-semibold">
                      {item.title?.trim() || item.name?.trim() || item.scheduleType}
                    </p>
                    {item.detail ? (
                      <p className="whitespace-pre-wrap text-xs text-muted-foreground pl-1">
                        {item.detail}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        メモなし（タップして編集）
                      </p>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
