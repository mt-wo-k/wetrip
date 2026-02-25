import { NextResponse } from "next/server";

import { createScheduleSchema } from "@/lib/schemas/schedule";
import { tripIdSchema } from "@/lib/schemas/trip";
import {
  createSchedule,
  getSchedulesByTripId,
} from "@/lib/server/schedule-repository";

export const runtime = "nodejs";

type TripScheduleRouteParams = {
  id: string;
};

type TripScheduleRouteProps = {
  params: TripScheduleRouteParams | Promise<TripScheduleRouteParams>;
};

export async function GET(_request: Request, { params }: TripScheduleRouteProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const parsedTripId = tripIdSchema.safeParse(resolvedParams.id);

    if (!parsedTripId.success) {
      return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });
    }

    const schedules = await getSchedulesByTripId(parsedTripId.data);
    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: TripScheduleRouteProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const parsedTripId = tripIdSchema.safeParse(resolvedParams.id);

    if (!parsedTripId.success) {
      return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = createScheduleSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const schedule = await createSchedule({
      tripId: parsedTripId.data,
      input: parsedBody.data,
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
