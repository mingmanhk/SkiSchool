
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateCoachingSummary } from '@/lib/ai/coaching';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { instructorId, month, year } = await request.json();

  // TODO: Fetch instructor name, goals, and feedback from the database
  const instructorName = "John Doe";
  const goals = ["Improve carving technique", "Get certified for level 2"];
  const feedback = ["John is great with kids", "John needs to be more punctual"];

  try {
    const summary = await generateCoachingSummary(instructorName, month, goals, feedback);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('AI Summary Error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
