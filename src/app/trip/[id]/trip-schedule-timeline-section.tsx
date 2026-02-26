"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TripSchedule } from "@/lib/trips";

type TripScheduleTimelineSectionProps = {
  dayTabs: number[];
  selectedDay: number;
  visibleSchedules: TripSchedule[];
  isUpdating: boolean;
  onSelectDay: (day: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (schedule: TripSchedule) => void;
  onMarkReserved: (scheduleId: string) => void;
};

export function TripScheduleTimelineSection({
  dayTabs,
  selectedDay,
  visibleSchedules,
  isUpdating,
  onSelectDay,
  onOpenAddModal,
  onOpenEditModal,
  onMarkReserved,
}: TripScheduleTimelineSectionProps) {
  return (
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
              size={"sm"}
              variant={selectedDay === day ? "default" : "outline"}
              onClick={() => onSelectDay(day)}
            >
              {day}日目
            </Button>
          ))}
        </div>

        <div>
          <Button type="button" onClick={onOpenAddModal}>
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
              <div key={item.scheduleId} className="grid grid-cols-[24px_1fr] gap-4">
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
                <div className="space-y-2 pb-6">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {item.endTime ? `${item.startTime}〜${item.endTime}` : item.startTime}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(item)}
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
                        onClick={() => onMarkReserved(item.scheduleId)}
                      >
                        予約済みにする
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
