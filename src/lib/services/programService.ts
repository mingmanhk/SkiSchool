// ProgramService: CRUD for programs
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { programs } from '@/lib/db/schema_multi_tenant';
import { Program } from '@/types/spec';

export class ProgramService {
  async listPrograms(tenantId: string): Promise<Program[]> {
    const results = await db
      .select()
      .from(programs)
      .where(eq(programs.tenantId, tenantId));

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.ageMin || undefined,
      ageMax: row.ageMax || undefined,
      skillLevel: row.skillLevel || undefined,
      seasonYear: row.seasonYear || undefined,
      startDate: row.startDate?.toISOString() || undefined,
      endDate: row.endDate?.toISOString() || undefined,
      location: row.location || undefined,
      price: row.price ? Number(row.price) : undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibilityStatus as 'public' | 'hidden',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async getProgram(
    tenantId: string,
    programId: string,
  ): Promise<Program | null> {
    const results = await db
      .select()
      .from(programs)
      .where(and(eq(programs.id, programId), eq(programs.tenantId, tenantId)))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.ageMin || undefined,
      ageMax: row.ageMax || undefined,
      skillLevel: row.skillLevel || undefined,
      seasonYear: row.seasonYear || undefined,
      startDate: row.startDate?.toISOString() || undefined,
      endDate: row.endDate?.toISOString() || undefined,
      location: row.location || undefined,
      price: row.price ? Number(row.price) : undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibilityStatus as 'public' | 'hidden',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async createProgram(
    tenantId: string,
    data: Omit<Program, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<Program> {
    const result = await db
      .insert(programs)
      .values({
        tenantId,
        name: data.name,
        discipline: data.discipline || null,
        ageMin: data.ageMin || null,
        ageMax: data.ageMax || null,
        skillLevel: data.skillLevel || null,
        seasonYear: data.seasonYear || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location || null,
        price: data.price ? data.price.toString() : null,
        capacity: data.capacity || null,
        description: data.description || null,
        visibilityStatus: data.visibilityStatus || 'public',
      })
      .returning();

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.ageMin || undefined,
      ageMax: row.ageMax || undefined,
      skillLevel: row.skillLevel || undefined,
      seasonYear: row.seasonYear || undefined,
      startDate: row.startDate?.toISOString() || undefined,
      endDate: row.endDate?.toISOString() || undefined,
      location: row.location || undefined,
      price: row.price ? Number(row.price) : undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibilityStatus as 'public' | 'hidden',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateProgram(
    tenantId: string,
    programId: string,
    data: Partial<Program>,
  ): Promise<Program> {
    const updateValues: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateValues.name = data.name;
    if (data.discipline !== undefined)
      updateValues.discipline = data.discipline || null;
    if (data.ageMin !== undefined) updateValues.ageMin = data.ageMin || null;
    if (data.ageMax !== undefined) updateValues.ageMax = data.ageMax || null;
    if (data.skillLevel !== undefined)
      updateValues.skillLevel = data.skillLevel || null;
    if (data.seasonYear !== undefined)
      updateValues.seasonYear = data.seasonYear || null;
    if (data.startDate !== undefined)
      updateValues.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined)
      updateValues.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.location !== undefined)
      updateValues.location = data.location || null;
    if (data.price !== undefined)
      updateValues.price = data.price ? data.price.toString() : null;
    if (data.capacity !== undefined)
      updateValues.capacity = data.capacity || null;
    if (data.description !== undefined)
      updateValues.description = data.description || null;
    if (data.visibilityStatus !== undefined)
      updateValues.visibilityStatus = data.visibilityStatus;

    const result = await db
      .update(programs)
      .set(updateValues)
      .where(and(eq(programs.id, programId), eq(programs.tenantId, tenantId)))
      .returning();

    if (result.length === 0) {
      throw new Error('Program not found');
    }

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.ageMin || undefined,
      ageMax: row.ageMax || undefined,
      skillLevel: row.skillLevel || undefined,
      seasonYear: row.seasonYear || undefined,
      startDate: row.startDate?.toISOString() || undefined,
      endDate: row.endDate?.toISOString() || undefined,
      location: row.location || undefined,
      price: row.price ? Number(row.price) : undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibilityStatus as 'public' | 'hidden',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async deleteProgram(tenantId: string, programId: string): Promise<void> {
    // Soft delete by setting visibility to 'hidden'
    await db
      .update(programs)
      .set({
        visibilityStatus: 'hidden',
        updatedAt: new Date(),
      })
      .where(and(eq(programs.id, programId), eq(programs.tenantId, tenantId)));
  }

  async getPublicPrograms(tenantId: string): Promise<Program[]> {
    const results = await db
      .select()
      .from(programs)
      .where(
        and(
          eq(programs.tenantId, tenantId),
          eq(programs.visibilityStatus, 'public'),
        ),
      );

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.ageMin || undefined,
      ageMax: row.ageMax || undefined,
      skillLevel: row.skillLevel || undefined,
      seasonYear: row.seasonYear || undefined,
      startDate: row.startDate?.toISOString() || undefined,
      endDate: row.endDate?.toISOString() || undefined,
      location: row.location || undefined,
      price: row.price ? Number(row.price) : undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibilityStatus as 'public' | 'hidden',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }
}
