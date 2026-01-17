export type ProgramVisibility = 'public' | 'hidden';

export interface Program {
  id: string;
  tenantId: string;
  name: string;
  discipline?: string;
  ageMin?: number;
  ageMax?: number;
  skillLevel?: string;
  seasonYear?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  price?: number;
  capacity?: number;
  description?: string;
  visibilityStatus: ProgramVisibility;
  createdAt: string;
  updatedAt: string;
}
