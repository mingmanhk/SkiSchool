
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ThreadList({ threads }) {
  const pathname = usePathname();

  return (
    <div className="overflow-y-auto">
      {threads.map(thread => {
        const isActive = pathname.includes(thread.id);
        return (
          <Link key={thread.id} href={`/parent/messages/${thread.id}`}>
            <div
              className={`p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}>
              <p className="font-semibold">{thread.subject}</p>
              <p className="text-sm text-gray-500 truncate">{/* Placeholder for last message */}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
