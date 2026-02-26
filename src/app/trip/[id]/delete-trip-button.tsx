"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DeleteTripButtonProps = {
  tripId: string;
};

export function DeleteTripButton({ tripId }: DeleteTripButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDeleteConfirmed() {
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "旅行データの削除に失敗しました");
      }

      setIsConfirmOpen(false);
      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "旅行データの削除に失敗しました",
      );
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 pb-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto px-0 py-0 text-xs text-muted-foreground underline underline-offset-4 hover:bg-transparent hover:text-foreground"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isPending}
      >
        旅行を削除
      </Button>
      {errorMessage ? (
        <p className="text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">旅行を削除しますか？</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                この操作は元に戻せません。
                <br />
                関連するタイムスケジュールも削除されます。
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isPending}
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteConfirmed}
                  disabled={isPending}
                >
                  {isPending ? "削除中..." : "削除する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
