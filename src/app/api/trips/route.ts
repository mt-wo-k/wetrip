import { NextResponse } from "next/server";

import { createTripSchema } from "@/lib/schemas/trip";
import { createTrip, getTrips } from "@/lib/server/trip-repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const trips = await getTrips();
    return NextResponse.json(trips, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createTripSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const trip = await createTrip({
      input: parsedBody.data,
      createdBySub: "anonymous",
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.error(error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
