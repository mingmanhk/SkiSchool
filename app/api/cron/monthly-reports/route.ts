
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { generateCoachingSummary } from '@/lib/ai/coaching';

export async function GET(request: Request) {
  // CRON SECURITY: Verify a secret header to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createClient(); // Service role client recommended here for cron jobs
  
  // 1. Fetch all instructors
  const { data: instructors } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('role', 'INSTRUCTOR');

  if (!instructors) return NextResponse.json({ processed: 0 });

  let processedCount = 0;
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // 2. Loop and Generate Reports
  for (const instructor of instructors) {
      // In a real cron, use a queue (e.g. Inngest, BullMQ) for this loop to avoid timeouts
      // For MVP, we'll do a few serial calls.
      
      const { data: goals } = await supabase.from('instructor_goals').select('goal').eq('instructor_id', instructor.id).eq('status', 'active');
      const goalList = goals?.map(g => g.goal) || [];
      const feedbackList = ["Automated feedback collection"]; // Placeholder

      const summary = await generateCoachingSummary(
          `${instructor.first_name} ${instructor.last_name}`,
          currentMonth,
          goalList,
          feedbackList
      );

      if (summary) {
          await supabase.from('instructor_monthly_summaries').insert({
              instructor_id: instructor.id,
              summary: JSON.stringify(summary),
              month: new Date().toISOString(), // Use first of month date
          });
          processedCount++;
      }
  }

  return NextResponse.json({ success: true, processed: processedCount });
}
