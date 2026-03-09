import Link from 'next/link'

const cards = [
  {
    title: 'Programs',
    desc: 'Manage ski and snowboard programs',
    href: '/admin/programs',
    color: 'bg-blue-600',
  },
  {
    title: 'Enrollments',
    desc: 'View and update student enrollments',
    href: '/admin/enrollments',
    color: 'bg-green-600',
  },
  {
    title: 'Class Registry',
    desc: 'Manage class schedules and occurrences',
    href: '/admin/class-registry',
    color: 'bg-purple-600',
  },
  {
    title: 'Messages',
    desc: 'Send SMS / email to families',
    href: '/admin/messages',
    color: 'bg-yellow-600',
  },
  {
    title: 'Integrations',
    desc: 'Configure Stripe, QuickBooks, and more',
    href: '/admin/integrations',
    color: 'bg-pink-600',
  },
  {
    title: 'Settings',
    desc: 'School branding, site config, domains',
    href: '/admin/settings',
    color: 'bg-indigo-600',
  },
]

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-400 mb-8">Welcome back. Here&apos;s what needs your attention.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-500"
          >
            <div className={`inline-block w-3 h-3 rounded-full mb-3 ${card.color}`} />
            <h2 className="text-lg font-semibold mb-1">{card.title}</h2>
            <p className="text-sm text-gray-400">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
