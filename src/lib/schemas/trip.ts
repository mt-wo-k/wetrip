import { z } from "zod";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const tripIdSchema = z.string().uuid();

export const createTripSchema = z
  .object({
    destination: z.string().min(1).max(100),
    startDate: z.string().regex(isoDatePattern, "startDate must be YYYY-MM-DD"),
    endDate: z.string().regex(isoDatePattern, "endDate must be YYYY-MM-DD"),
    transportation: z.string().min(1).max(50),
    memo: z.string().max(2000).optional(),
  })
  .superRefine((value, context) => {
    if (value.endDate < value.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "endDate must be greater than or equal to startDate",
      });
    }
  });

export const updateTripMemoSchema = z
  .object({
    memo: z.string().max(2000),
  })
  .transform((value) => ({
    memo: value.memo === "" ? undefined : value.memo,
  }));

export const persistedTripSchema = createTripSchema.extend({
  id: tripIdSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBySub: z.string().min(1),
});

export type CreateTripSchema = z.infer<typeof createTripSchema>;
export type PersistedTripSchema = z.infer<typeof persistedTripSchema>;
export type UpdateTripMemoSchema = z.infer<typeof updateTripMemoSchema>;
