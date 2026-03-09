// RegistrationService: Email classification and registration flows
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import {
  users,
  parents,
  families,
  tenantMemberships,
  enrollments,
  registrations,
} from '@/lib/db/schema_multi_tenant'
import { EmailClassification } from '@/types/spec'
import { FamilyService } from './familyService'
import { EmailService } from './emailService'
import { AuditService } from './auditService'

export interface RegistrationResult {
  familyId: string
  parentIds: string[]
  studentIds: string[]
  enrollmentIds: string[]
}

export class RegistrationService {
  private familyService = new FamilyService()
  private emailService = new EmailService()
  private auditService = new AuditService()

  // --- Email Classification ---

  async classifyEmail(
    tenantId: string,
    email: string,
  ): Promise<EmailClassification> {
    // Check if a user account exists for this email
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (userResults.length > 0) {
      const user = userResults[0]
      // Check if user has membership in this tenant
      const membershipResults = await db
        .select()
        .from(tenantMemberships)
        .where(
          and(
            eq(tenantMemberships.userId, user.id),
            eq(tenantMemberships.tenantId, tenantId),
          ),
        )
        .limit(1)

      if (membershipResults.length > 0) {
        return 'returning_account'
      }
    }

    // Check if historical parent record exists for this tenant
    const parentResults = await db
      .select()
      .from(parents)
      .where(and(eq(parents.email, email), eq(parents.tenantId, tenantId)))
      .limit(1)

    if (parentResults.length > 0) {
      return 'returning_historical'
    }

    return 'new'
  }

  // --- Historical Email Verification ---

  async sendVerificationEmailForHistorical(
    tenantId: string,
    email: string,
  ): Promise<void> {
    const token = generateSecureToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in registrations table as a draft with verification metadata
    await db.insert(registrations).values({
      tenantId,
      status: 'pending_verification',
      step: 'email_verification',
      data: { email, token, expiresAt: expiresAt.toISOString(), type: 'historical_verify' },
    })

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/${tenantId}/registration/verify-email?token=${token}`
    await this.emailService.sendVerificationEmailForHistorical(
      tenantId,
      email,
      token,
      verificationUrl,
    )
  }

  async verifyHistoricalEmail(
    tenantId: string,
    token: string,
  ): Promise<{ email: string }> {
    // Find the registration record with this token
    const results = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.tenantId, tenantId),
          eq(registrations.status, 'pending_verification'),
        ),
      )

    const record = results.find((r) => {
      const data = r.data as Record<string, unknown>
      return (
        data.token === token &&
        data.type === 'historical_verify' &&
        new Date(data.expiresAt as string) > new Date()
      )
    })

    if (!record) {
      throw new Error('Invalid or expired verification token')
    }

    const data = record.data as Record<string, unknown>
    const email = data.email as string

    // Mark registration as verified
    await db
      .update(registrations)
      .set({ status: 'verified', updatedAt: new Date() })
      .where(eq(registrations.id, record.id))

    return { email }
  }

  // --- New Family Registration ---

  async createNewFamilyRegistration(data: {
    tenantId: string
    email: string
    familyData: Record<string, unknown>
    parentsData: Array<{
      email: string
      firstName?: string
      lastName?: string
      phone?: string
    }>
    studentsData: Array<{
      firstName: string
      lastName: string
      birthdate?: string
      gender?: string
      notes?: string
    }>
    programIds: string[]
  }): Promise<RegistrationResult> {
    // 1. Create the family
    const family = await this.familyService.createFamily(data.tenantId, {})

    // 2. Create parents
    const createdParents = []
    for (const parentData of data.parentsData) {
      const parent = await this.familyService.createParent(data.tenantId, {
        ...parentData,
        familyId: family.id,
      })
      createdParents.push(parent)
    }

    // 3. Set primary parent (first parent by default)
    if (createdParents.length > 0) {
      await db
        .update(families)
        .set({ primaryParentId: createdParents[0].id })
        .where(eq(families.id, family.id))
    }

    // 4. Create students
    const createdStudents = []
    for (const studentData of data.studentsData) {
      const student = await this.familyService.createStudent(data.tenantId, {
        ...studentData,
        familyId: family.id,
      })
      createdStudents.push(student)
    }

    // 5. Create enrollments for each student in each program
    const enrollmentIds: string[] = []
    for (const studentId of createdStudents.map((s) => s.id)) {
      for (const programId of data.programIds) {
        const result = await db
          .insert(enrollments)
          .values({
            tenantId: data.tenantId,
            familyId: family.id,
            studentId,
            programId,
            status: 'pending',
          })
          .returning()
        enrollmentIds.push(result[0].id)
      }
    }

    const result = {
      familyId: family.id,
      parentIds: createdParents.map((p) => p.id),
      studentIds: createdStudents.map((s) => s.id),
      enrollmentIds,
    }

    await this.auditService.log({
      tenantId: data.tenantId,
      action: 'registration.new_family.created',
      entityType: 'family',
      entityId: family.id,
      metadata: {
        parentCount: createdParents.length,
        studentCount: createdStudents.length,
        enrollmentCount: enrollmentIds.length,
      },
    })

    return result
  }

  // --- Returning Family Registration ---

  async createReturningFamilyRegistration(data: {
    tenantId: string
    userId: string
    selectedPrograms: string[]
    studentIds: string[]
  }): Promise<RegistrationResult> {
    const family = await this.familyService.getFamilyByUserId(
      data.tenantId,
      data.userId,
    )
    if (!family) {
      throw new Error('Family not found for user')
    }

    const enrollmentIds: string[] = []
    for (const studentId of data.studentIds) {
      for (const programId of data.selectedPrograms) {
        const result = await db
          .insert(enrollments)
          .values({
            tenantId: data.tenantId,
            familyId: family.id,
            studentId,
            programId,
            status: 'pending',
          })
          .returning()
        enrollmentIds.push(result[0].id)
      }
    }

    return {
      familyId: family.id,
      parentIds: [],
      studentIds: data.studentIds,
      enrollmentIds,
    }
  }

  // --- Draft Registration Wizard State ---

  async saveDraftRegistration(
    tenantId: string,
    userId: string | null,
    step: string,
    draftData: Record<string, unknown>,
  ): Promise<string> {
    const result = await db
      .insert(registrations)
      .values({
        tenantId,
        userId,
        status: 'draft',
        step,
        data: draftData,
      })
      .returning()
    return result[0].id
  }

  async updateDraftRegistration(
    registrationId: string,
    step: string,
    draftData: Record<string, unknown>,
  ): Promise<void> {
    await db
      .update(registrations)
      .set({ step, data: draftData, updatedAt: new Date() })
      .where(eq(registrations.id, registrationId))
  }
}

function generateSecureToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
