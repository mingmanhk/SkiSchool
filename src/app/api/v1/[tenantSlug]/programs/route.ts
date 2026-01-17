
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { Program } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantSlug: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return apiError('Unauthorized', 401);
  }

  // Add logic to check user role and permissions for the tenant

  const body = await request.json();
  const { error } = await supabase.from('programs').insert([
    { ...body, tenant_slug: params.tenantSlug }
  ]);

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess('Program created successfully');
}
