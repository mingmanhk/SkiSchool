// FamilyService: Manage families, parents, students
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  families,
  parents,
  students,
  enrollments,
} from '@/lib/db/schema_multi_tenant';
import { Family, Parent, Student } from '@/types/spec';

export class FamilyService {
  async getFamily(
    tenantId: string,
    familyId: string,
  ): Promise<Family | null> {
    const results = await db
      .select()
      .from(families)
      .where(
        and(eq(families.id, familyId), eq(families.tenantId, tenantId)),
      )
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      primaryParentId: row.primaryParentId || undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async getFamilyByUserId(
    tenantId: string,
    userId: string,
  ): Promise<Family | null> {
    // Get family via parent's user_id
    const parentResults = await db
      .select({
        family: families,
      })
      .from(parents)
      .innerJoin(families, eq(parents.familyId, families.id))
      .where(and(eq(parents.userId, userId), eq(parents.tenantId, tenantId)))
      .limit(1);

    if (parentResults.length === 0) {
      return null;
    }

    const row = parentResults[0].family;
    return {
      id: row.id,
      tenantId: row.tenantId,
      primaryParentId: row.primaryParentId || undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createFamily(
    tenantId: string,
    data: Omit<Family, 'id' | 'tenantId' | 'createdAt'>,
  ): Promise<Family> {
    const result = await db
      .insert(families)
      .values({
        tenantId,
        primaryParentId: data.primaryParentId || null,
      })
      .returning();

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      primaryParentId: row.primaryParentId || undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createParent(
    tenantId: string,
    data: Omit<Parent, 'id' | 'tenantId' | 'createdAt'>,
  ): Promise<Parent> {
    const result = await db
      .insert(parents)
      .values({
        tenantId,
        familyId: data.familyId,
        userId: data.userId || null,
        email: data.email,
        phone: data.phone || null,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
      })
      .returning();

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      familyId: row.familyId,
      userId: row.userId || undefined,
      email: row.email,
      phone: row.phone || undefined,
      firstName: row.firstName || undefined,
      lastName: row.lastName || undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createStudent(
    tenantId: string,
    data: Omit<Student, 'id' | 'tenantId' | 'createdAt'>,
  ): Promise<Student> {
    const result = await db
      .insert(students)
      .values({
        tenantId,
        familyId: data.familyId,
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        gender: data.gender || null,
        notes: data.notes || null,
      })
      .returning();

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      familyId: row.familyId,
      firstName: row.firstName,
      lastName: row.lastName,
      birthdate: row.birthdate?.toISOString() || undefined,
      gender: row.gender || undefined,
      notes: row.notes || undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async getParentsByFamily(
    tenantId: string,
    familyId: string,
  ): Promise<Parent[]> {
    const results = await db
      .select()
      .from(parents)
      .where(
        and(eq(parents.familyId, familyId), eq(parents.tenantId, tenantId)),
      );

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      familyId: row.familyId,
      userId: row.userId || undefined,
      email: row.email,
      phone: row.phone || undefined,
      firstName: row.firstName || undefined,
      lastName: row.lastName || undefined,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async getStudentsByFamily(
    tenantId: string,
    familyId: string,
  ): Promise<Student[]> {
    const results = await db
      .select()
      .from(students)
      .where(
        and(eq(students.familyId, familyId), eq(students.tenantId, tenantId)),
      );

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      familyId: row.familyId,
      firstName: row.firstName,
      lastName: row.lastName,
      birthdate: row.birthdate?.toISOString() || undefined,
      gender: row.gender || undefined,
      notes: row.notes || undefined,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
