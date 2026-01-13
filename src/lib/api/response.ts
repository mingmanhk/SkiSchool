
import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

/**
 * Standardized success response helper.
 * Enforces consistent API output structure.
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { data },
    { status }
  );
}

/**
 * Standardized error response helper.
 * Enforces consistent error handling and typing.
 */
export function apiError(message: string, status = 500): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Type guard to check if an object is a valid UserProfile
 */
export function isValidUserProfile(data: any): data is import('@/types').UserProfile {
  return (
    typeof data.id === 'string' &&
    typeof data.email === 'string' &&
    typeof data.role === 'string'
  );
}
