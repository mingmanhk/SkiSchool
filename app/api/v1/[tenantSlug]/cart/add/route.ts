
import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { getDictionary } from '@/i18n/server';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const body = await request.json();
    const { classOccurrenceId, studentId, lang } = body;
    const locale = lang === 'zh' ? 'zh' : 'en';
    const dict = await getDictionary(locale);
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(dict.errors.auth_required, 401);
    }

    // 1. Fetch Data
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    const { data: occurrence } = await supabase
      .from('class_occurrences')
      .select('*, class_series(program_id)')
      .eq('id', classOccurrenceId)
      .single();
    
    if (!student || !occurrence) {
        return apiError(dict.errors.invalid_input, 400);
    }

    const { data: program } = await supabase
      .from('programs')
      .select('*')
      .eq('id', occurrence.class_series.program_id)
      .single();

    // 2. Age Check (Strict null check)
    if (!student.birthdate) {
        return apiError('Student birthdate missing', 400);
    }

    const seasonAge = new Date().getFullYear() - new Date(student.birthdate).getFullYear();
    
    if (seasonAge < program.min_age || seasonAge > program.max_age) {
      return apiError(dict.errors.age_restriction, 400);
    }

    // 3. Capacity Check
    if (occurrence.spots_taken >= occurrence.capacity) {
      return apiError(dict.errors.capacity_full, 400);
    }

    // 4. Add to Cart (Mock logic for brevity)
    // In production: await supabase.from('cart_items').insert({...})

    return apiSuccess({ message: dict.common.success });

  } catch (err: any) {
    return apiError(err.message || 'Internal Server Error', 500);
  }
}
