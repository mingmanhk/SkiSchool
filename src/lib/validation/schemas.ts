import { z } from 'zod'

// --- Primitives ---

const uuidSchema = z.string().uuid()
const emailSchema = z.email()
const phoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number').optional()

// --- Cart ---

export const addToCartSchema = z.object({
  classOccurrenceId: uuidSchema,
  studentId: uuidSchema,
  lang: z.enum(['en', 'zh']).optional().default('en'),
})

export const removeFromCartSchema = z.object({
  classOccurrenceId: uuidSchema,
  studentId: uuidSchema,
})

// --- Instructor Coaching ---

export const createGoalSchema = z.object({
  goal: z.string().min(5, 'Goal must be at least 5 characters'),
  instructorId: uuidSchema,
})

// --- Class Status ---

export const updateStatusSchema = z.object({
  status: z.enum([
    'meeting_point',
    'on_lift',
    'skiing',
    'break',
    'returning',
    'dismissed',
  ]),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
})

// --- Registration ---

export const checkEmailSchema = z.object({
  email: emailSchema,
})

export const parentDataSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: phoneSchema,
})

export const studentDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthdate: z.string().date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  notes: z.string().max(500).optional(),
})

export const newFamilyRegistrationSchema = z.object({
  email: emailSchema,
  parents: z.array(parentDataSchema).min(1, 'At least one parent is required'),
  students: z.array(studentDataSchema).min(1, 'At least one student is required'),
  programIds: z.array(uuidSchema).min(1, 'At least one program must be selected'),
})

export const returningFamilyRegistrationSchema = z.object({
  userId: uuidSchema,
  studentIds: z.array(uuidSchema).min(1),
  selectedPrograms: z.array(uuidSchema).min(1),
})

export const parentRegisterSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: phoneSchema,
})

export const parentLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

// --- Programs ---

export const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  discipline: z.string().optional(),
  ageMin: z.number().int().min(0).max(100).optional(),
  ageMax: z.number().int().min(0).max(100).optional(),
  skillLevel: z.string().optional(),
  seasonYear: z.number().int().min(2000).max(2100).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  location: z.string().optional(),
  price: z.number().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  description: z.string().optional(),
  visibilityStatus: z.enum(['public', 'hidden']).default('public'),
})

export const updateProgramSchema = createProgramSchema.partial()

// --- Payments ---

export const createPaymentIntentSchema = z.object({
  enrollmentIds: z.array(uuidSchema).min(1),
  amount: z.number().int().min(50), // Minimum 50 cents
  currency: z.string().length(3).default('usd'),
  successUrl: z.url(),
  cancelUrl: z.url(),
  customerEmail: emailSchema.optional(),
})

// --- Messaging ---

export const createMessageTemplateSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  channel: z.enum(['sms', 'email']),
  body: z.string().min(1).max(1600, 'Message body must be 1600 characters or fewer'),
  variables: z.array(z.string()).default([]),
})

export const updateMessageTemplateSchema = createMessageTemplateSchema.partial()

export const sendMessageSchema = z.object({
  templateId: uuidSchema.optional(),
  bodyOverride: z.string().min(1).max(1600).optional(),
  filters: z.object({
    year: z.number().int().optional(),
    programIds: z.array(uuidSchema).optional(),
    studentIds: z.array(uuidSchema).optional(),
  }),
}).refine(
  (data) => data.templateId || data.bodyOverride,
  { message: 'Either templateId or bodyOverride is required' },
)

// --- Tenant ---

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  slug: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
})

// --- Integration Config ---

export const stripeConfigSchema = z.object({
  publishableKey: z.string().min(1),
  secretKey: z.string().min(1),
  webhookSecret: z.string().min(1).optional(),
})

export const paypalConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
})

export const quickbooksConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  refreshToken: z.string().min(1),
  realmId: z.string().min(1),
})

// --- Site Builder ---

const navItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  order: z.number().optional(),
})

export const updateSiteConfigSchema = z.object({
  navigation: z.array(navItemSchema).optional(),
  branding: z.record(z.string(), z.unknown()).optional(),
  logos: z.record(z.string(), z.unknown()).optional(),
  layout: z.record(z.string(), z.unknown()).optional(),
  hero: z.record(z.string(), z.unknown()).optional(),
  sections: z.array(z.record(z.string(), z.unknown())).optional(),
  aboutSections: z.array(z.record(z.string(), z.unknown())).optional(),
  teamSections: z.array(z.record(z.string(), z.unknown())).optional(),
  customPages: z.array(z.record(z.string(), z.unknown())).optional(),
})

// --- Family ---

export const createFamilySchema = z.object({
  parents: z.array(parentDataSchema).min(1),
  students: z.array(studentDataSchema).min(1),
})

// --- Type exports ---

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type NewFamilyRegistrationInput = z.infer<typeof newFamilyRegistrationSchema>
export type CreateProgramInput = z.infer<typeof createProgramSchema>
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type StripeConfigInput = z.infer<typeof stripeConfigSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
