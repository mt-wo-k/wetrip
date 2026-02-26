export type Trip = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  transportation: string;
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBySub?: string;
};

export type CreateTripInput = Omit<
  Trip,
  "id" | "createdAt" | "updatedAt" | "createdBySub"
>;

export const scheduleTypeValues = ["hotel", "food", "spot", "event"] as const;
export type ScheduleType = (typeof scheduleTypeValues)[number];

export type TripSchedule = {
  tripId: string;
  scheduleId: string;
  dayIndex: number;
  scheduleType: ScheduleType;
  startTime: string;
  endTime?: string;
  title?: string;
  name?: string;
  detail?: string;
  createdAt: string;
  updatedAt: string;
};
