
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const programId = searchParams.get('programId');
  
  const supabase = await createClient();

  // 1. Resolve Tenant
  const { data: school } = await supabase.from('schools').select('id').eq('slug', params.tenantSlug).single();
  if (!school) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  let query = supabase
    .from('class_occurrences')
    .select(`
      id,
      start_time,
      end_time,
      capacity,
      spots_taken,
      class_series!inner(
        program_id,
        programs!inner(school_id)
      )
    `)
    .eq('class_series.programs.school_id', school.id);

  if (date) {
    // Basic date filtering (starts within the day)
    query = query.gte('start_time', `${date}T00:00:00`).lte('start_time', `${date}T23:59:59`);
  }
  
  if (programId) {
    query = query.eq('class_series.program_id', programId);
  }

  const { data: classes, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ 
    data: classes.map((c: any) => ({
      ...c,
      spots_remaining: c.capacity - c.spots_taken
    }))
  });
}
