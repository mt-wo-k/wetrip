import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tripIdSchema } from "@/lib/schemas/trip";
import { getSchedulesByTripId } from "@/lib/server/schedule-repository";
import { getTripById } from "@/lib/server/trip-repository";
import { formatDateForDisplay } from "@/lib/utils";
import { TripScheduleSection } from "./trip-schedule-section";

type TripDetailPageParams = { id: string };

type TripDetailPageProps = {
  params: TripDetailPageParams | Promise<TripDetailPageParams>;
};

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const parsedId = tripIdSchema.safeParse(resolvedParams.id);

  if (!parsedId.success) {
    notFound();
  }

  const [trip, schedules] = await Promise.all([
    getTripById(parsedId.data),
    getSchedulesByTripId(parsedId.data),
  ]);

  if (!trip) {
    notFound();
  }

  return (
    <main className="flex w-full max-w-5xl flex-col gap-4 px-3 py-8">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {trip.destination} 旅行
        </h1>
        <Button asChild variant="secondary" size={"sm"}>
          <Link href="/">戻る</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>旅行詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">日程</span>
              <span className="font-medium">
                {formatDateForDisplay(trip.startDate)} 〜{" "}
                {formatDateForDisplay(trip.endDate)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">移動手段</span>
              <Badge variant="secondary">{trip.transportation}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <TripScheduleSection trip={trip} initialSchedules={schedules} />
    </main>
  );
}
