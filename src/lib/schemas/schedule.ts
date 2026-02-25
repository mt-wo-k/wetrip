import { z } from "zod";

import { tripIdSchema } from "@/lib/schemas/trip";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const scheduleIdSchema = z.string().uuid();
export const reservationStatusSchema = z.enum([
  "reserved",
  "pending",
  "not_required",
]);

export const createScheduleSchema = z
  .object({
    dayIndex: z.number().int().min(1),
    startTime: z.string().regex(timePattern, "startTime must be HH:MM"),
    endTime: z
      .string()
      .regex(timePattern, "endTime must be HH:MM")
      .optional()
      .or(z.literal("")),
    name: z.string().trim().max(100).optional().or(z.literal("")),
    detail: z.string().trim().max(500).optional().or(z.literal("")),
    reservationStatus: reservationStatusSchema,
  })
  .transform((value) => ({
    ...value,
    endTime: value.endTime || undefined,
    name: value.name || undefined,
    detail: value.detail || undefined,
  }))
  .superRefine((value, context) => {
    if (value.endTime && value.endTime < value.startTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "endTime must be greater than or equal to startTime",
      });
    }
  });

export const persistedScheduleSchema = z.object({
  tripId: tripIdSchema,
  scheduleId: scheduleIdSchema,
  dayIndex: z.number().int().min(1),
  startTime: z.string().regex(timePattern),
  endTime: z.string().regex(timePattern).optional(),
  name: z.string().max(100).optional(),
  detail: z.string().max(500).optional(),
  reservationStatus: reservationStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const updateReservationSchema = z.object({
  reservationStatus: z.literal("reserved"),
});

export const updateScheduleContentSchema = z
  .object({
    name: z.string().trim().max(100).optional().or(z.literal("")),
    detail: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .transform((value) => ({
    name: value.name || undefined,
    detail: value.detail || undefined,
  }));

export type CreateScheduleSchema = z.infer<typeof createScheduleSchema>;
export type PersistedScheduleSchema = z.infer<typeof persistedScheduleSchema>;
export type UpdateScheduleContentSchema = z.infer<
  typeof updateScheduleContentSchema
>;
