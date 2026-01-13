
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { threadId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Security check: Verify user is a participant of the thread
  const { data: participant, error: participantError } = await supabase
    .from('thread_participants')
    .select('user_id')
    .eq('thread_id', params.threadId)
    .eq('user_id', user.id)
    .single();

  if (participantError || !participant) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { data, error } = await supabase
    .from('messages_view')
    .select('*')
    .eq('thread_id', params.threadId)
    .order('created_at', { ascending: true });

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: { threadId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { body } = await request.json();

  // Security check: Verify user is a participant of the thread
  const { data: participant, error: participantError } = await supabase
    .from('thread_participants')
    .select('*')
    .eq('thread_id', params.threadId)
    .eq('user_id', user.id)
    .single();

  if (participantError || !participant) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      thread_id: params.threadId,
      sender_id: user.id,
      body: body,
    })
    .select()
    .single();

  if (messageError) {
    return new NextResponse(JSON.stringify({ error: messageError.message }), { status: 500 });
  }

  return NextResponse.json(message);
}
