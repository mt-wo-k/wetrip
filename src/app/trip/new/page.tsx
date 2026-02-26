"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CreateTripResponse = {
  id: string;
};

export default function NewTripPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transportation, setTransportation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          transportation,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as { error?: string };
        setErrorMessage(errorPayload.error ?? "旅行の保存に失敗しました");
        return;
      }

      const createdTrip = (await response.json()) as CreateTripResponse;
      router.push(`/trip/${createdTrip.id}`);
    } catch {
      setErrorMessage("通信に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">旅行先を追加</h1>
        <Button asChild variant="secondary">
          <Link href="/">戻る</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>旅行情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="destination">
                旅行先
              </label>
              <input
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-base"
                id="destination"
                required
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="startDate">
                  開始日
                </label>
                <input
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-base"
                  id="startDate"
                  required
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="endDate">
                  終了日
                </label>
                <input
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-base"
                  id="endDate"
                  required
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="transportation">
                移動手段
              </label>
              <input
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-base"
                id="transportation"
                required
                value={transportation}
                onChange={(event) => setTransportation(event.target.value)}
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-500">{errorMessage}</p>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "保存中..." : "旅行を保存"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
