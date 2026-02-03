import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTripById } from "@/lib/trips";

type TripDetailPageParams = { id: string };

type TripDetailPageProps = {
  params: TripDetailPageParams | Promise<TripDetailPageParams>;
};

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const trip = getTripById(resolvedParams.id);

  if (!trip) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Trip Detail</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {trip.title}
          </h1>
        </div>
        <Button asChild variant="secondary">
          <Link href="/">旅行一覧へ戻る</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>旅行詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">旅行先</span>
              <span className="font-medium">{trip.destination}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">日程</span>
              <span className="font-medium">
                {trip.startDate} - {trip.endDate}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">移動手段</span>
              <Badge variant="secondary">{trip.transportation}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
