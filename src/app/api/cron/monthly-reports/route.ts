
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateCoachingSummary } from '@/lib/ai/coaching';

export async function GET(request: Request) {
  const supabase = await createClient();
  // ... rest of the logic
}
