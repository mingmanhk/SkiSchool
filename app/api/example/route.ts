
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getDictionary } from '@/i18n/server';

export async function GET(
  request: Request,
  { params }: { params: { lang: string } }
) {
  const dict = await getDictionary(params.lang);
  
  // This is a dummy component just to show usage
  return NextResponse.json({ message: dict.common.loading });
}
