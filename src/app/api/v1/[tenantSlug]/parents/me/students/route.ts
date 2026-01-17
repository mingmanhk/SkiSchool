
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'zh' ? 'zh' : 'en';
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Resolve Tenant
  const { data: school } = await supabase.from('schools').select('id').eq('slug', tenantSlug).single();
  if (!school) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  // 2. Fetch Students for Parent
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .eq('parent_id', user.id) // RLS should handle this, but being explicit
    .order('first_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: students });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const body = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { firstName, lastName, birthdate } = body;

  const { data, error } = await supabase
    .from('students')
    .insert({
      first_name: firstName,
      last_name: lastName,
      birthdate: birthdate,
      parent_id: user.id
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
