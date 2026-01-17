import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Security check: Verify user is a participant of the thread
  const { data: participant, error: participantError } = await supabase
    .from('thread_participants')
    .select('user_id')
    .eq('thread_id', threadId)
    .eq('user_id', user.id)
    .single();

  if (participantError || !participant) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { data, error } = await supabase
    .from('messages_view')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { body } = await request.json();

  // Security check: Verify user is a participant of the thread
  const { data: participant, error: participantError } = await supabase
    .from('thread_participants')
    .select('*')
    .eq('thread_id', threadId)
    .eq('user_id', user.id)
    .single();

  if (participantError || !participant) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
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
