
// src/lib/validation/schemas.ts
import { z } from 'zod';

/**
 * Base schema for UUIDs to ensure consistent validation.
 */
export const UUIDSchema = z.string().uuid({ message: "Invalid UUID format." });

/**
 * Schema for validating the parameters in the student portfolio GET/POST request.
 */
export const StudentPortfolioParamsSchema = z.object({
  id: UUIDSchema,
});

/**
 * Schema for validating the POST body when adding a new skill event.
 */
export const AddSkillEventSchema = z.object({
  type: z.literal('skill'),
  skill: z.string().min(1, { message: "Skill name cannot be empty." }).max(100),
  note: z.string().max(500).optional(),
});

/**
 * Schema for validating the POST body when awarding a new badge.
 */
export const AddBadgeEventSchema = z.object({
  type: z.literal('badge'),
  badge_id: UUIDSchema,
});

/**
 * A discriminated union to handle different POST body types for the portfolio API.
 * This ensures that the body matches one of the expected shapes.
 */
export const StudentPortfolioPostBodySchema = z.discriminatedUnion("type", [
  AddSkillEventSchema,
  AddBadgeEventSchema,
]);

export const UpdateStudentStatusSchema = z.object({
  student_id: UUIDSchema,
  status: z.enum(['present', 'absent', 'late']),
});

// Add other validation schemas for the application below
