
// Core Domain Models
// Enforcing strict typing for all DB entities

export type UserRole = 
  | 'OWNER' 
  | 'ADMIN' 
  | 'PROGRAM_DIRECTOR' 
  | 'FRONT_DESK' 
  | 'SUPPORT' 
  | 'INSTRUCTOR' 
  | 'ACCOUNTING' 
  | 'PARENT' 
  | 'STUDENT' 
  | 'HR';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  school_id: string;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  default_language: 'en' | 'zh';
  created_at: string;
}

export interface Program {
  id: string;
  school_id: string;
  name_en: string;
  name_zh?: string;
  description_en: string;
  description_zh?: string;
  min_age: number;
  max_age: number;
  active: boolean;
  price_cents: number;
  created_at: string;
}

export interface ClassOccurrence {
  id: string;
  class_series_id: string;
  instructor_id: string;
  start_time: string; // ISO String
  end_time: string;   // ISO String
  capacity: number;
  spots_taken: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  notes_en?: string;
  notes_zh?: string;
}

// API Response Wrappers
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}
