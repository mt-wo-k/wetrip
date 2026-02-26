"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type TripMemoSectionProps = {
  tripId: string;
  initialMemo?: string;
};

export function TripMemoSection({ tripId, initialMemo }: TripMemoSectionProps) {
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const lastSavedMemoRef = useRef(initialMemo ?? "");
  const isSavingRef = useRef(false);
  const queuedMemoRef = useRef<string | null>(null);

  const saveMemo = useCallback(
    async (nextMemo: string) => {
      if (nextMemo === lastSavedMemoRef.current) {
        return;
      }

      if (isSavingRef.current) {
        queuedMemoRef.current = nextMemo;
        return;
      }

      isSavingRef.current = true;
      setSaveStatus("saving");

      try {
        const response = await fetch(`/api/trips/${tripId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memo: nextMemo,
          }),
        });

        if (!response.ok) {
          throw new Error("failed to save memo");
        }

        lastSavedMemoRef.current = nextMemo;
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      } finally {
        isSavingRef.current = false;
        const queuedMemo = queuedMemoRef.current;
        queuedMemoRef.current = null;

        if (queuedMemo !== null && queuedMemo !== lastSavedMemoRef.current) {
          void saveMemo(queuedMemo);
        }
      }
    },
    [tripId],
  );

  useEffect(() => {
    if (memo === lastSavedMemoRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      void saveMemo(memo);
    }, 500);

    return () => clearTimeout(timer);
  }, [memo, saveMemo]);

  const statusText =
    saveStatus === "saving"
      ? "保存中..."
      : saveStatus === "saved"
        ? "保存済み"
        : saveStatus === "error"
          ? "保存に失敗しました"
          : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>メモ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <textarea
          value={memo}
          onChange={(event) => {
            setMemo(event.target.value);
            setSaveStatus("idle");
          }}
          className="min-h-32 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
          placeholder="旅行メモを入力"
        />
        <div className="flex justify-end">
          {statusText ? (
            <p
              className={`text-xs ${
                saveStatus === "error"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
              role={saveStatus === "error" ? "alert" : undefined}
            >
              {statusText}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
