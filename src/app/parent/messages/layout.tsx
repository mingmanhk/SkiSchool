
import { createAdminClient } from '@/lib/supabase/server'
import ThreadList from '@/components/ThreadList'
import { redirect } from 'next/navigation'

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: threads, error } = await supabase
    .from('message_threads')
    .select('*, participants:message_thread_participants(*)')
    .or(`participants.user_id.eq.${user.id}`)

  if (error) {
    console.error('Error fetching threads:', error)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-800">
        <ThreadList threads={threads || []} />
      </div>
      <div className="w-2/3">
        {children}
      </div>
    </div>
  )
}
