
import { createAdminClient } from '@/lib/supabase/server'
import MessageThreadView from '@/components/MessageThreadView'
import { redirect, notFound } from 'next/navigation'

export default async function MessageThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: thread, error } = await supabase
    .from('message_threads')
    .select(`
      *,
      messages:message_thread_messages(*),
      participants:message_thread_participants(*)
    `)
    .eq('id', threadId)
    .single()

  if (error || !thread) {
    notFound()
  }

  // TODO: Add RLS policy to ensure user is a participant
  
  return <MessageThreadView messages={thread.messages} />
}
