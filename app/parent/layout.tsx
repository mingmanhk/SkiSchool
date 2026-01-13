
import Link from 'next/link';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>
        <Link href="/parent/dashboard">Dashboard</Link>
        <Link href="/parent/students">My Students</Link>
        <Link href="/parent/registration">Register</Link>
        <Link href="/parent/schedule">Class Schedule</Link>
        <Link href="/parent/billing">Billing</Link>
        <Link href="/parent/profile">My Profile</Link>
      </nav>
      {children}
    </div>
  );
}
