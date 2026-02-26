import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTrips } from "@/lib/server/trip-repository";
import { formatDateForDisplay } from "@/lib/utils";

export default async function Home() {
  const trips = await getTrips();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">旅行一覧</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/trip/new">新しい旅行を計画</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trips.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              旅行データがまだありません。新しい旅行を追加してください。
            </CardContent>
          </Card>
        ) : null}
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardContent className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold">{trip.destination}</h2>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {formatDateForDisplay(trip.startDate)} ~{" "}
                  {formatDateForDisplay(trip.endDate)}
                </p>
                <Badge variant="secondary">{trip.transportation}</Badge>
              </div>
              <Button asChild className="w-full">
                <Link href={`/trip/${trip.id}`}>詳細を見る</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
