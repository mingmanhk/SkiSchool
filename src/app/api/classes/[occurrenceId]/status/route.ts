
import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { updateStatusSchema } from '@/lib/validation/schemas';
import { UserRole } from '@/types';

export async function POST(request: NextRequest, { params }: { params: Promise<{ occurrenceId: string }> }) {
  try {
    const { occurrenceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError('Unauthorized', 401);
    }

    // 1. Fetch user role
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !userProfile) {
        return apiError('Profile not found', 403);
    }

    // 2. Authorization Check: INSTRUCTOR or ADMIN
    const allowedRoles: UserRole[] = ['INSTRUCTOR', 'ADMIN', 'PROGRAM_DIRECTOR'];
    if (!allowedRoles.includes(userProfile.role as UserRole)) {
        return apiError('Forbidden: Only instructors can update status', 403);
    }

    // 3. Input Validation
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
        return apiError(validation.error.issues[0].message, 400);
    }

    const { status, latitude, longitude } = validation.data;

    const { data, error } = await supabase
        .from('class_status_events')
        .insert({
        class_occurrence_id: occurrenceId,
        instructor_id: user.id,
        status: status,
        latitude: latitude,
        longitude: longitude
        })
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return apiSuccess(data);

  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
