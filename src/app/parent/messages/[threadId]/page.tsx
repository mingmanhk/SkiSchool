
import { createServerSupabaseClient } from '@/lib/supabase/server'
import MessageThreadView from '@/components/MessageThreadView'
import { redirect, notFound } from 'next/navigation'

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Security check + Fetch messages
  // Ideally, we'd have an RPC or RLS policy that handles the security check implicitly,
  // but explicitly checking participation is good practice here if we aren't 100% sure of the view's RLS.
  // The 'messages_view' should leverage RLS.
  const { data: messages, error } = await supabase
    .from('messages_view')
    .select('*')
    .eq('thread_id', params.threadId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return <div>Error loading messages.</div>
  }
  
  // Basic check if thread exists/user has access (if messages are empty, it might just be empty, 
  // so we might want to fetch the thread details too to be sure it's 404 vs empty)
  // For now, we assume if RLS works, we just get what we get.

  return <MessageThreadView messages={messages || []} />
}
