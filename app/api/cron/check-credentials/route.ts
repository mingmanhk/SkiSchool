
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createClient();
  const today = new Date();
  const warningDate = new Date();
  warningDate.setDate(today.getDate() + 30); // Warn 30 days out

  // 1. Find expiring credentials
  const { data: expiring } = await supabase
    .from('instructor_credentials')
    .select('*, users(email, first_name)')
    .gt('expiry_date', today.toISOString())
    .lt('expiry_date', warningDate.toISOString());

  if (!expiring) return NextResponse.json({ processed: 0 });

  let sentCount = 0;

  for (const cred of expiring) {
      // 2. Send Email Notification (Mock)
      console.log(`Sending expiry warning to ${cred.users?.email} for credential ${cred.id}`);
      
      // In production: await sendEmail({ ... })
      sentCount++;
  }

  return NextResponse.json({ success: true, alerts_sent: sentCount });
}
