
import Link from 'next/link';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>
        <Link href="/employee/dashboard">Dashboard</Link>
        <Link href="/employee/schedule">Full Schedule</Link>
        <Link href="/employee/students">My Students</Link>
        <Link href="/employee/profile">My Profile</Link>
        <Link href="/employee/programs">Programs</Link>
        <Link href="/employee/series">Class Series</Link>
        <Link href="/employee/occurrences">Class Occurrences</Link>
        <Link href="/employee/assign">Instructor Assignment</Link>
        <Link href="/employee/parents">Parents</Link>
        <Link href="/employee/reports">Report Cards</Link>
        <Link href="/employee/notifications">Notifications</Link>
        <Link href="/employee/analytics">Analytics</Link>
        <Link href="/employee/roles">Roles & Permissions</Link>
        <Link href="/employee/settings">System Settings</Link>
      </nav>
      {children}
    </div>
  );
}
