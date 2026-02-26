import { NextResponse } from "next/server";

import {
  scheduleIdSchema,
  updateScheduleContentSchema,
} from "@/lib/schemas/schedule";
import { tripIdSchema } from "@/lib/schemas/trip";
import {
  deleteScheduleById,
  updateScheduleContent,
} from "@/lib/server/schedule-repository";

export const runtime = "nodejs";

type ScheduleRouteParams = {
  id: string;
  scheduleId: string;
};

type ScheduleRouteProps = {
  params: ScheduleRouteParams | Promise<ScheduleRouteParams>;
};

export async function PATCH(request: Request, { params }: ScheduleRouteProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const parsedTripId = tripIdSchema.safeParse(resolvedParams.id);
    const parsedScheduleId = scheduleIdSchema.safeParse(resolvedParams.scheduleId);

    if (!parsedTripId.success || !parsedScheduleId.success) {
      return NextResponse.json(
        { error: "Invalid trip id or schedule id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsedBody = updateScheduleContentSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const updated = await updateScheduleContent({
      tripId: parsedTripId.data,
      scheduleId: parsedScheduleId.data,
      input: parsedBody.data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: ScheduleRouteProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const parsedTripId = tripIdSchema.safeParse(resolvedParams.id);
    const parsedScheduleId = scheduleIdSchema.safeParse(resolvedParams.scheduleId);

    if (!parsedTripId.success || !parsedScheduleId.success) {
      return NextResponse.json(
        { error: "Invalid trip id or schedule id" },
        { status: 400 },
      );
    }

    const deleted = await deleteScheduleById({
      tripId: parsedTripId.data,
      scheduleId: parsedScheduleId.data,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
