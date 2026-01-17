import { db } from '../db/client';
import { users, parents, families, students } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { EmailClassification } from '../../types/registration';

export class RegistrationService {
  async classifyEmail(
    tenantId: string,
    email: string,
  ): Promise<EmailClassification> {
    // 1. Check if email is associated with a user account (global)
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (userResult.length > 0) {
        return 'returning_account';
    }

    // 2. Check if email exists in 'parents' table for this tenant (Historical data without account)
    const parentResult = await db.select().from(parents).where(
        and(eq(parents.tenant_id, tenantId), eq(parents.email, email))
    ).limit(1);
    
    if (parentResult.length > 0) {
        return 'returning_historical';
    }

    return 'new';
  }

  async createNewFamilyRegistration(
    tenantId: string,
    parent: { firstName: string; lastName: string; email: string; phone?: string },
    student: { firstName: string; lastName: string; dob: string; skillLevel?: string }
  ): Promise<void> {
    // Transactional insert
    await db.transaction(async (tx) => {
        // 1. Create Family
        const [family] = await tx.insert(families).values({
            tenant_id: tenantId,
            name: `${parent.lastName} Family`,
            primary_email: parent.email,
        }).returning();

        // 2. Create Parent
        await tx.insert(parents).values({
            tenant_id: tenantId,
            family_id: family.id,
            first_name: parent.firstName,
            last_name: parent.lastName,
            email: parent.email,
            phone: parent.phone,
        });

        // 3. Create Student
        await tx.insert(students).values({
            tenant_id: tenantId,
            family_id: family.id,
            first_name: student.firstName,
            last_name: student.lastName,
            date_of_birth: student.dob ? new Date(student.dob) : null,
            skill_level: student.skillLevel,
        });
    });
  }
}
