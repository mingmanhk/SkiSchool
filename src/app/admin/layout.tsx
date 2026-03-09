import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/programs', label: 'Programs' },
  { href: '/admin/enrollments', label: 'Enrollments' },
  { href: '/admin/class-registry', label: 'Class Registry' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/integrations', label: 'Integrations' },
  { href: '/admin/settings', label: 'Settings' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  async function signOut() {
    'use server'
    const client = await createClient()
    await client.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-4 py-6 border-b border-gray-800">
          <span className="text-xl font-bold tracking-tight">Ski School OS</span>
          <span className="ml-2 text-xs text-gray-400 align-middle">Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800">
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-white cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
