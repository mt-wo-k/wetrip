import { NextResponse } from "next/server";

import { tripIdSchema } from "@/lib/schemas/trip";
import { getTripById } from "@/lib/server/trip-repository";

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
