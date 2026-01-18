
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { UpdateStudentStatusSchema } from '@/lib/validation/schemas';
import { UserRole } from '@/types';

export async function POST(request: NextRequest, { params }: { params: Promise<{ occurrenceId: string }> }) {
  const { occurrenceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return apiError('Unauthorized', 401);
  }

  // TODO: Check if user has permission (e.g., instructor for this class)

  const body = await request.json();
  const validation = UpdateStudentStatusSchema.safeParse(body);

  if (!validation.success) {
    return apiError(JSON.stringify(validation.error.format()), 400);
  }

  const { student_id, status } = validation.data;

  const { error } = await supabase
    .from('class_roster')
    .update({ status })
    .eq('occurrence_id', occurrenceId)
    .eq('student_id', student_id);

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess('Status updated successfully');
}
