
import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { Program } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantSlug: string } }
) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'zh' ? 'zh' : 'en';
  const supabase = await createClient();

  // 1. Resolve Tenant Slug to School ID
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', params.tenantSlug)
    .single();

  if (schoolError || !school) {
    return apiError('Tenant not found', 404);
  }

  // 2. Fetch Programs with strict typing via Generics (if Supabase types were generated)
  // For now, we manually map to our strict Program interface
  const { data: programs, error } = await supabase
    .from('programs')
    .select('*')
    .eq('school_id', school.id)
    .eq('active', true);

  if (error) {
    return apiError(error.message, 500);
  }

  // 3. Localize Response using strict interface
  const localizedPrograms = programs.map((p: any) => ({
    id: p.id,
    name: lang === 'zh' ? (p.name_zh || p.name_en) : (p.name_en || p.name_zh),
    description: lang === 'zh' ? (p.description_zh || p.description_en) : (p.description_en || p.description_zh),
    min_age: p.min_age,
    max_age: p.max_age,
    price: p.price_cents,
  }));

  return apiSuccess(localizedPrograms);
}
