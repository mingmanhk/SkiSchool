
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  const { email, password, firstName, lastName } = await request.json();
  const supabase = await createClient();

  // 1. Sign Up
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: 'PARENT'
      }
    }
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // 2. Create Public Profile (Handled by Trigger, but we can verify or return success)
  return NextResponse.json({ message: "Registration successful. Please check your email to verify account." });
}
