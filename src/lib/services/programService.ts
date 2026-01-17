import { db } from '../db/client';
import { programs } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { Program } from '../../types/program';

export class ProgramService {
  async listPrograms(tenantId: string): Promise<Program[]> {
    const results = await db.select().from(programs).where(eq(programs.tenant_id, tenantId));
    
    return results.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.age_min || undefined,
      ageMax: row.age_max || undefined,
      skillLevel: row.skill_level || undefined,
      seasonYear: row.season_year || undefined,
      startDate: row.start_date?.toISOString(),
      endDate: row.end_date?.toISOString(),
      location: row.location || undefined,
      price: row.price || undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibility_status as any,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }));
  }

  async getProgram(
    tenantId: string,
    programId: string,
  ): Promise<Program | null> {
    const results = await db.select().from(programs).where(
        and(eq(programs.tenant_id, tenantId), eq(programs.id, programId))
    ).limit(1);
    
    if (results.length === 0) return null;
    const row = results[0];
    
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.age_min || undefined,
      ageMax: row.age_max || undefined,
      skillLevel: row.skill_level || undefined,
      seasonYear: row.season_year || undefined,
      startDate: row.start_date?.toISOString(),
      endDate: row.end_date?.toISOString(),
      location: row.location || undefined,
      price: row.price || undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibility_status as any,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async createProgram(
    tenantId: string,
    data: Omit<Program, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<Program> {
    const [row] = await db.insert(programs).values({
        tenant_id: tenantId,
        name: data.name,
        discipline: data.discipline,
        age_min: data.ageMin,
        age_max: data.ageMax,
        skill_level: data.skillLevel,
        season_year: data.seasonYear,
        start_date: data.startDate ? new Date(data.startDate) : null,
        end_date: data.endDate ? new Date(data.endDate) : null,
        location: data.location,
        price: data.price,
        capacity: data.capacity,
        description: data.description,
        visibility_status: data.visibilityStatus,
    }).returning();

    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.age_min || undefined,
      ageMax: row.age_max || undefined,
      skillLevel: row.skill_level || undefined,
      seasonYear: row.season_year || undefined,
      startDate: row.start_date?.toISOString(),
      endDate: row.end_date?.toISOString(),
      location: row.location || undefined,
      price: row.price || undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibility_status as any,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async updateProgram(
    tenantId: string,
    programId: string,
    data: Partial<Program>,
  ): Promise<Program> {
    const updateValues: any = {};
    if (data.name) updateValues.name = data.name;
    if (data.discipline) updateValues.discipline = data.discipline;
    if (data.ageMin !== undefined) updateValues.age_min = data.ageMin;
    if (data.ageMax !== undefined) updateValues.age_max = data.ageMax;
    if (data.skillLevel) updateValues.skill_level = data.skillLevel;
    if (data.seasonYear !== undefined) updateValues.season_year = data.seasonYear;
    if (data.startDate) updateValues.start_date = new Date(data.startDate);
    if (data.endDate) updateValues.end_date = new Date(data.endDate);
    if (data.location) updateValues.location = data.location;
    if (data.price !== undefined) updateValues.price = data.price;
    if (data.capacity !== undefined) updateValues.capacity = data.capacity;
    if (data.description) updateValues.description = data.description;
    if (data.visibilityStatus) updateValues.visibility_status = data.visibilityStatus;
    
    updateValues.updated_at = new Date();

    const [row] = await db.update(programs)
        .set(updateValues)
        .where(and(eq(programs.tenant_id, tenantId), eq(programs.id, programId)))
        .returning();
        
     return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      discipline: row.discipline || undefined,
      ageMin: row.age_min || undefined,
      ageMax: row.age_max || undefined,
      skillLevel: row.skill_level || undefined,
      seasonYear: row.season_year || undefined,
      startDate: row.start_date?.toISOString(),
      endDate: row.end_date?.toISOString(),
      location: row.location || undefined,
      price: row.price || undefined,
      capacity: row.capacity || undefined,
      description: row.description || undefined,
      visibilityStatus: row.visibility_status as any,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
