
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  const supabase = await createClient();
  const { email, password, ...profileData } = await request.json();

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ ...profileData, tenant_slug: params.tenantSlug })
      .eq('id', user.id);

    if (profileError) {
      // Handle profile update error, maybe delete the user
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ user });
}
