
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_my_message_threads', { user_id_param: user.id });

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { subject, participants } = await request.json();

  // Create the thread
  const { data: thread, error: threadError } = await supabase
    .from('message_threads')
    .insert({ subject })
    .select()
    .single();

  if (threadError) {
    return new NextResponse(JSON.stringify({ error: threadError.message }), { status: 500 });
  }

  // Add participants
  const participantData = [...participants, user.id].map(userId => ({
    thread_id: thread.id,
    user_id: userId,
  }));

  const { error: participantError } = await supabase.from('thread_participants').insert(participantData);

  if (participantError) {
    // Clean up created thread if participant insertion fails
    await supabase.from('message_threads').delete().eq('id', thread.id);
    return new NextResponse(JSON.stringify({ error: participantError.message }), { status: 500 });
  }

  return NextResponse.json(thread);
}
