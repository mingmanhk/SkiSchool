
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function StudentPortfolioPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const supabase = await createAdminClient()

  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (error || !student) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{student.first_name}'s Portfolio</h1>
      {/* Portfolio content */}
    </div>
  )
}
