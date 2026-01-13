
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { tenantSlug: string; classId: string } }
) {
  const supabase = await createClient();

  const { data: classData, error } = await supabase
    .from('class_occurrences')
    .select('capacity, spots_taken')
    .eq('id', params.classId)
    .single();

  if (error || !classData) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      capacity: classData.capacity,
      spots_taken: classData.spots_taken,
      spots_remaining: classData.capacity - classData.spots_taken,
      is_full: classData.spots_taken >= classData.capacity
    }
  });
}
