import { NextResponse } from "next/server";

import { tripIdSchema, updateTripMemoSchema } from "@/lib/schemas/trip";
import { deleteSchedulesByTripId } from "@/lib/server/schedule-repository";
import {
  deleteTripById,
  getTripById,
  updateTripMemo,
} from "@/lib/server/trip-repository";

export const runtime = "nodejs";

type TripRouteParams = {
  id: string;
};

type TripRouteProps = {
  params: TripRouteParams | Promise<TripRouteParams>;
};

export async function GET(_request: Request, { params }: TripRouteProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const parsedId = tripIdSchema.safeParse(resolvedParams.id);

    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });
    }

    const trip = await getTripById(parsedId.data);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: TripRouteProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const parsedId = tripIdSchema.safeParse(resolvedParams.id);

    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = updateTripMemoSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const updatedTrip = await updateTripMemo({
      id: parsedId.data,
      input: parsedBody.data,
    });

    return NextResponse.json(updatedTrip, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (
      error instanceof Error &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (
      error instanceof Error &&
      "name" in error &&
      error.name === "AccessDeniedException"
    ) {
      return NextResponse.json(
        {
          error:
            "DynamoDB の更新権限がありません。管理者に IAM ポリシーを確認してください。",
        },
        { status: 403 },
      );
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: TripRouteProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const parsedId = tripIdSchema.safeParse(resolvedParams.id);

    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });
    }

    const trip = await getTripById(parsedId.data);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    await deleteTripById(parsedId.data);
    await deleteSchedulesByTripId(parsedId.data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      "name" in error &&
      error.name === "AccessDeniedException"
    ) {
      return NextResponse.json(
        {
          error:
            "DynamoDB の削除権限がありません。管理者に IAM ポリシーを確認してください。",
        },
        { status: 403 },
      );
    }

    console.error(error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
