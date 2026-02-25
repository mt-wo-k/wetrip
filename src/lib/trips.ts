export type Trip = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  transportation: string;
  createdAt?: string;
  updatedAt?: string;
  createdBySub?: string;
};

export type CreateTripInput = Omit<
  Trip,
  "id" | "createdAt" | "updatedAt" | "createdBySub"
>;

export type ReservationStatus = "reserved" | "pending" | "not_required";

export type TripSchedule = {
  tripId: string;
  scheduleId: string;
  dayIndex: number;
  startTime: string;
  endTime?: string;
  name?: string;
  detail?: string;
  reservationStatus: ReservationStatus;
  createdAt: string;
  updatedAt: string;
};
