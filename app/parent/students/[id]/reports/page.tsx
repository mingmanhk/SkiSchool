
import Link from 'next/link';

export default function StudentReportCardsPage() {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">Report Cards</h2>
      {/* Placeholder for report cards */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="font-bold">Mid-Season Report</h3>
        <p className="text-gray-400">Issued on: 2024-02-15</p>
        <Link href="#" className="text-blue-500 hover:underline">Download PDF</Link>
      </div>
    </div>
  );
}
