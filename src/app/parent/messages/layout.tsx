
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ThreadList from '@/components/ThreadList'
import { redirect } from 'next/navigation'

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: threads, error } = await supabase.rpc('get_my_message_threads', { user_id_param: user.id })

  if (error) {
    console.error('Error fetching threads:', error)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
      <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
             <ThreadList threads={threads || []} />
        </div>
      </div>
      <div className="hidden md:flex md:w-2/3 flex-col">
        {children}
      </div>
    </div>
  )
}
