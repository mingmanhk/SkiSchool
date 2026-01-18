
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantSlug: string, classId: string }> }
) {
  const { tenantSlug, classId } = await params;
  const supabase = await createClient();
  // ... rest of the logic
}
