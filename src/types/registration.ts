export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Enrollment {
  id: string;
  tenantId: string;
  familyId: string;
  studentId: string;
  programId: string;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export type EmailClassification =
  | 'new'
  | 'returning_account'
  | 'returning_historical';
