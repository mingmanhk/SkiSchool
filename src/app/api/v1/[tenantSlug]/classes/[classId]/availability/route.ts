
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { tenantSlug: string, classId: string } }
) {
  const supabase = await createClient();
  // ... rest of the logic
}
