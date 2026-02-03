import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTrips } from "@/lib/trips";

export default function Home() {
  const trips = getTrips();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">WeTrip</p>
          <h1 className="text-3xl font-semibold tracking-tight">旅行一覧</h1>
        </div>
        <Button variant="secondary">新しい旅行を計画</Button>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden">
            <div className="relative">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={trip.coverImagePath}
                  alt={trip.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-xs text-white/70">{trip.destination}</p>
                <h2 className="text-lg font-semibold text-white">
                  {trip.title}
                </h2>
              </div>
            </div>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {trip.startDate} - {trip.endDate}
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
