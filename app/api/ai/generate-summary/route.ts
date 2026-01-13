
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { generateCoachingSummary } from '@/src/lib/ai/coaching';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Add RBAC check (Only Directors/Admins)

  const { instructorId, month } = await request.json();

  // 1. Fetch Instructor Data
  const { data: instructor } = await supabase.from('users').select('first_name, last_name').eq('id', instructorId).single();
  
  // 2. Fetch Goals & Feedback (Simplified queries)
  const { data: goalsData } = await supabase.from('instructor_goals').select('goal').eq('instructor_id', instructorId).eq('status', 'active');
  const goals = goalsData?.map(g => g.goal) || [];

  // Mock feedback fetching for now (would query instructor_feedback table)
  const feedback = ["Great with kids", "Needs to improve carving demos"];

  // 3. Generate AI Summary
  const aiResult = await generateCoachingSummary(
    `${instructor?.first_name} ${instructor?.last_name}`,
    month,
    goals,
    feedback
  );

  if (!aiResult) {
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }

  // 4. Save to Database (Mock - usually insert into instructor_monthly_summaries)
  // await supabase.from('instructor_monthly_summaries').insert({ ... })

  return NextResponse.json(aiResult);
}
