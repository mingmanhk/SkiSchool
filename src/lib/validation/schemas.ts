
import { z } from 'zod';

export const addToCartSchema = z.object({
  classOccurrenceId: z.string().uuid(),
  studentId: z.string().uuid(),
  lang: z.enum(['en', 'zh']).optional().default('en'),
});

export const createGoalSchema = z.object({
  goal: z.string().min(5, "Goal must be at least 5 characters"),
  instructorId: z.string().uuid(),
});

export const updateStatusSchema = z.object({
    status: z.enum(['meeting_point', 'on_lift', 'skiing', 'break', 'returning', 'dismissed']),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});
