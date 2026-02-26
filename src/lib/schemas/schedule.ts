import { z } from "zod";

import { tripIdSchema } from "@/lib/schemas/trip";
import { scheduleTypeValues } from "@/lib/trips";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isGoogleMapsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (host === "maps.google.com" || host.endsWith(".maps.google.com")) {
      return true;
    }

    if (host === "maps.app.goo.gl") {
      return true;
    }

    if ((host === "google.com" || host === "www.google.com") && path.startsWith("/maps")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

const googleMapsUrlSchema = z
  .string()
  .url("mapLink must be a valid URL")
  .refine(isGoogleMapsUrl, "mapLink must be a Google Maps URL");

export const scheduleIdSchema = z.string().uuid();
export const scheduleTypeSchema = z.enum(scheduleTypeValues);

export const createScheduleSchema = z
  .object({
    dayIndex: z.number().int().min(1),
    scheduleType: scheduleTypeSchema,
    startTime: z.string().regex(timePattern, "startTime must be HH:MM"),
    endTime: z
      .string()
      .regex(timePattern, "endTime must be HH:MM")
      .optional()
      .or(z.literal("")),
    mapLink: googleMapsUrlSchema.optional().or(z.literal("")),
    title: z.string().trim().max(100).optional().or(z.literal("")),
    detail: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .transform((value) => ({
    ...value,
    endTime: value.endTime || undefined,
    mapLink: value.mapLink || undefined,
    title: value.title || undefined,
    detail: value.detail || undefined,
  }))
  .superRefine((value, context) => {
    if (value.scheduleType === "hotel" && value.endTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "endTime is not allowed for hotel",
      });
    }

    if (
      value.scheduleType !== "hotel" &&
      value.endTime &&
      value.endTime < value.startTime
    ) {
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
  scheduleType: scheduleTypeSchema.optional().default("food"),
  startTime: z.string().regex(timePattern),
  endTime: z.string().regex(timePattern).optional(),
  mapLink: googleMapsUrlSchema.optional(),
  title: z.string().max(100).optional(),
  name: z.string().max(100).optional(),
  detail: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const updateScheduleContentSchema = z
  .object({
    dayIndex: z.number().int().min(1),
    scheduleType: scheduleTypeSchema,
    startTime: z.string().regex(timePattern, "startTime must be HH:MM"),
    endTime: z
      .string()
      .regex(timePattern, "endTime must be HH:MM")
      .optional()
      .or(z.literal("")),
    mapLink: googleMapsUrlSchema.optional().or(z.literal("")),
    title: z.string().trim().max(100).optional().or(z.literal("")),
    detail: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .transform((value) => ({
    ...value,
    endTime: value.endTime || undefined,
    mapLink: value.mapLink || undefined,
    title: value.title || undefined,
    detail: value.detail || undefined,
  }))
  .superRefine((value, context) => {
    if (value.scheduleType === "hotel" && value.endTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "endTime is not allowed for hotel",
      });
    }

    if (
      value.scheduleType !== "hotel" &&
      value.endTime &&
      value.endTime < value.startTime
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "endTime must be greater than or equal to startTime",
      });
    }
  });

export type CreateScheduleSchema = z.infer<typeof createScheduleSchema>;
export type PersistedScheduleSchema = z.infer<typeof persistedScheduleSchema>;
export type UpdateScheduleContentSchema = z.infer<
  typeof updateScheduleContentSchema
>;
