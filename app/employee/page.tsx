
export default function EmployeeDashboard() {
  // This dashboard will be role-aware, showing different widgets based on user permissions.
  return (
    <div>
      <h1>Employee Dashboard</h1>
      {/* Instructor view: Today's classes, pending report cards, etc. */}
      {/* Admin view: Enrollment snapshot, upcoming classes, etc. */}
    </div>
  );
}
