
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function StudentDetailLayout({ children, params }: { children: React.ReactNode, params: { id: string } }) {
  const pathname = usePathname();
  const studentId = params.id;

  const tabs = [
    { name: 'Schedule', href: `/parent/students/${studentId}/schedule` },
    { name: 'Report Cards', href: `/parent/students/${studentId}/reports` },
    { name: 'Profile', href: `/parent/students/${studentId}` },
    { name: 'Enrollment History', href: `/parent/students/${studentId}/history` },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/parent/students" className="text-blue-500 hover:underline">
            &larr; Back to My Students
          </Link>
        </div>
        <div className="flex items-center mb-8">
          <Image src={`/alex.jpg`} alt="Student Photo" width={96} height={96} className="w-24 h-24 rounded-full mr-6" />
          <div>
            <h1 className="text-4xl font-bold">Alex</h1>
            <p className="text-gray-400">Age 10, Level 2</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${pathname === tab.href ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
